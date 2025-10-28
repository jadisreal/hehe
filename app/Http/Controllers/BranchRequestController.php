<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BranchRequestController extends Controller
{
    /**
     * Store a new branch request and create a notification for the target branch.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'from_branch_id' => 'required|integer|exists:branches,branch_id',
                'to_branch_id' => 'required|integer|exists:branches,branch_id',
                'medicine_id' => 'required|integer|exists:medicines,medicine_id',
                'quantity_requested' => 'required|integer|min:1',
                'requested_by' => 'required|integer|exists:users,user_id'
            ]);

            Log::info('Creating branch request: ' . json_encode($validated));

            DB::beginTransaction();

            $requestId = DB::table('branch_requests')->insertGetId([
                'from_branch_id' => $validated['from_branch_id'],
                'to_branch_id' => $validated['to_branch_id'],
                'medicine_id' => $validated['medicine_id'],
                'quantity_requested' => $validated['quantity_requested'],
                'status' => 'pending',
                'requested_by' => $validated['requested_by'],
                'created_at' => now()
            ]);

            // build canonical notification
            $medicineName = DB::table('medicines')->where('medicine_id', $validated['medicine_id'])->value('medicine_name');
            $fromBranchName = DB::table('branches')->where('branch_id', $validated['from_branch_id'])->value('branch_name');
            $displayFrom = $fromBranchName ?? ('Branch ' . $validated['from_branch_id']);
            $message = sprintf('%s requested %d units of %s', $displayFrom, $validated['quantity_requested'], $medicineName ?? 'medicine');
            $notifMessage = $message . ' [req:' . $requestId . ']';

            $toBranchId = $validated['to_branch_id'];
            $medicineId = $validated['medicine_id'];

            // Idempotent insert/update: ensure we have only one canonical request notification per branch+medicine
            try {
                DB::table('notifications')->updateOrInsert(
                    [
                        'branch_id' => $toBranchId,
                        'type' => 'request',
                        'reference_id' => $medicineId,
                    ],
                    [
                        'message' => $notifMessage,
                        'is_read' => 0,
                        'created_at' => now(),
                    ]
                );
            } catch (\Exception $e) {
                // log but don't fail the request creation; if this is a unique constraint race it will be harmless
                Log::warning('Failed to upsert notification for branch request: ' . $e->getMessage());
            }

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Request created', 'request_id' => $requestId], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('Validation failed in BranchRequestController@store: ' . json_encode($e->errors()));
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating branch request: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Get pending requests for a branch (to_branch_id)
    public function index($branchId)
    {
        try {
            $rows = DB::table('branch_requests as br')
                ->leftJoin('medicines as m', 'br.medicine_id', '=', 'm.medicine_id')
                ->leftJoin('branches as f', 'br.from_branch_id', '=', 'f.branch_id')
                ->leftJoin('users as u', 'br.requested_by', '=', 'u.user_id')
                ->select('br.branch_request_id', 'br.from_branch_id', 'br.to_branch_id', 'br.medicine_id', 'm.medicine_name', 'br.quantity_requested', 'br.status', 'br.requested_by', 'u.name as requested_by_name', 'br.created_at')
                ->where('br.to_branch_id', $branchId)
                ->where('br.status', 'pending')
                ->orderBy('br.created_at', 'desc')
                ->get();

            return response()->json($rows->toArray());
        } catch (\Exception $e) {
            Log::error('Error fetching pending branch requests: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred'], 500);
        }
    }

    // Approve a request: update status and set confirmed_by
    public function approve(Request $request, $requestId)
    {
        try {
            $validated = $request->validate([
                'confirmed_by' => 'required|integer|exists:users,user_id'
            ]);

            DB::beginTransaction();

            // Fetch the request row
            $req = DB::table('branch_requests')->where('branch_request_id', $requestId)->first();
            if (!$req) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Request not found'], 404);
            }

            // Determine approver branch (the branch that received the request) and requester branch
            $approverBranchId = $req->to_branch_id;
            $requesterBranchId = $req->from_branch_id;
            $medicineId = $req->medicine_id;
            $qtyRequested = intval($req->quantity_requested);

            // Calculate total available stock in approver branch for this medicine
            $stockInRows = DB::table('medicine_stock_in as msi')
                ->leftJoin('medicine_stock_out as mso', 'msi.medicine_stock_in_id', '=', 'mso.medicine_stock_in_id')
                ->leftJoin('medicine_archived as ma', 'msi.medicine_stock_in_id', '=', 'ma.medicine_stock_in_id')
                // include expiration_date in select and groupBy so ORDER BY is valid on SQL Server
                ->select('msi.medicine_stock_in_id', 'msi.quantity', 'msi.expiration_date', DB::raw('ISNULL(SUM(mso.quantity_dispensed),0) as total_dispensed'), DB::raw('ISNULL(SUM(ma.quantity),0) as total_archived'))
                ->where('msi.branch_id', $approverBranchId)
                ->where('msi.medicine_id', $medicineId)
                ->groupBy('msi.medicine_stock_in_id', 'msi.quantity', 'msi.expiration_date')
                ->orderBy('msi.expiration_date', 'asc')
                ->get();

            $totalAvailable = 0;
            foreach ($stockInRows as $r) {
                $available = intval($r->quantity) - intval($r->total_dispensed) - intval($r->total_archived);
                if ($available > 0) $totalAvailable += $available;
            }

            if ($totalAvailable < $qtyRequested) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Insufficient stock to approve request'], 400);
            }

            // NOTE: Do NOT create medicine_stock_out rows on approve (user requested).
            // We still perform the FEFO availability check and capture the first
            // stock_in id used for traceability, but we skip inserting outbound
            // stock rows.
            $remaining = $qtyRequested;
            $firstStockInId = null;
            foreach ($stockInRows as $r) {
                if ($remaining <= 0) break;
                $available = intval($r->quantity) - intval($r->total_dispensed) - intval($r->total_archived);
                if ($available <= 0) continue;
                $toConsume = min($available, $remaining);

                // Decrement the medicine_stock_in.quantity by $toConsume for this stock_in row.
                // Use an atomic update to avoid races: SET quantity = quantity - @consume
                $affected = DB::table('medicine_stock_in')
                    ->where('medicine_stock_in_id', $r->medicine_stock_in_id)
                    ->where('branch_id', $approverBranchId)
                    ->where('medicine_id', $medicineId)
                    ->whereRaw('quantity >= ?', [$toConsume])
                    ->update(['quantity' => DB::raw('quantity - ' . intval($toConsume))]);

                if ($affected === 0) {
                    // If the update didn't affect a row, another operation may have consumed it.
                    // Recalculate remaining availability and retry or abort.
                    $totalAvailable = 0;
                    foreach (DB::table('medicine_stock_in as msi')
                        ->leftJoin('medicine_stock_out as mso', 'msi.medicine_stock_in_id', '=', 'mso.medicine_stock_in_id')
                        ->leftJoin('medicine_archived as ma', 'msi.medicine_stock_in_id', '=', 'ma.medicine_stock_in_id')
                        ->select('msi.medicine_stock_in_id', 'msi.quantity', DB::raw('ISNULL(SUM(mso.quantity_dispensed),0) as total_dispensed'), DB::raw('ISNULL(SUM(ma.quantity),0) as total_archived'))
                        ->where('msi.branch_id', $approverBranchId)
                        ->where('msi.medicine_id', $medicineId)
                        ->groupBy('msi.medicine_stock_in_id', 'msi.quantity')
                        ->orderBy('msi.expiration_date', 'asc')
                        ->get() as $rr) {
                        $avail = intval($rr->quantity) - intval($rr->total_dispensed) - intval($rr->total_archived);
                        if ($avail > 0) $totalAvailable += $avail;
                    }
                    if ($totalAvailable < $remaining) {
                        DB::rollBack();
                        return response()->json(['success' => false, 'message' => 'Insufficient stock during commit, please retry'], 409);
                    }
                    // If still sufficient, continue loop; the updated quantities will be re-read on next iteration only if needed.
                    continue;
                }

                if ($firstStockInId === null && $toConsume > 0) {
                    $firstStockInId = $r->medicine_stock_in_id;
                }

                $remaining -= $toConsume;
            }

            if ($remaining > 0) {
                // This should not happen because we checked totalAvailable earlier,
                // but guard defensively.
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Failed to deduct complete quantity from stock'], 500);
            }

            // Optionally link the branch_request to the primary medicine_stock_in used
            // (useful for traceability). If multiple stock_in rows were used, we store
            // the first one used.
            $updated = DB::table('branch_requests')
                ->where('branch_request_id', $requestId)
                ->update(['status' => 'approved', 'confirmed_by' => $validated['confirmed_by'], 'medicine_stock_in_id' => $firstStockInId, 'updated_at' => now()]);

            if (!$updated) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Failed to update request status'], 500);
            }

            // If the requester branch doesn't have any stock_in rows for this medicine,
            // create an incoming stock record so it appears in their inventory view.
            try {
                $hasRequesterStock = DB::table('medicine_stock_in')
                    ->where('branch_id', $requesterBranchId)
                    ->where('medicine_id', $medicineId)
                    ->exists();

                if (!$hasRequesterStock) {
                    $newInId = DB::table('medicine_stock_in')->insertGetId([
                        'medicine_id' => $medicineId,
                        'quantity' => $qtyRequested,
                        'date_received' => now(),
                        'expiration_date' => now()->addYear()->toDateString(),
                        'user_id' => $validated['confirmed_by'],
                        'branch_id' => $requesterBranchId,
                        'timestamp_dispensed' => now()
                    ]);
                    Log::info('Created medicine_stock_in for requester branch ' . $requesterBranchId . ' id=' . $newInId . ' for request ' . $requestId);
                }
            } catch (\Exception $e) {
                // don't fail the whole approve because of this; log and continue
                Log::warning('Failed to create medicine_stock_in for requester branch: ' . $e->getMessage());
            }

            // Create notification back to requester branch
            $medicine = DB::table('medicines')->where('medicine_id', $medicineId)->value('medicine_name');
            $msg = sprintf('Your request for %d units of %s has been approved', $qtyRequested, $medicine ?? 'medicine');
            DB::table('notifications')->insert(['branch_id' => $requesterBranchId, 'type' => 'request', 'message' => $msg, 'reference_id' => $medicineId, 'is_read' => 0, 'created_at' => now()]);

            DB::commit();

            return response()->json(['success' => true]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log full exception for debugging
            Log::error('Error approving branch request: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            // Return the exception message to the frontend to aid debugging (kept concise)
            return response()->json(['success' => false, 'message' => 'Server error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Reject a request: update status and set confirmed_by
    public function reject(Request $request, $requestId)
    {
        try {
            $validated = $request->validate([
                'confirmed_by' => 'required|integer|exists:users,user_id',
                'reason' => 'nullable|string'
            ]);

            $updated = DB::table('branch_requests')
                ->where('branch_request_id', $requestId)
                ->update(['status' => 'rejected', 'confirmed_by' => $validated['confirmed_by'], 'updated_at' => now()]);

            if (!$updated) return response()->json(['success' => false, 'message' => 'Request not found'], 404);

            // Notify requester
            $req = DB::table('branch_requests')->where('branch_request_id', $requestId)->first();
            $medicine = DB::table('medicines')->where('medicine_id', $req->medicine_id)->value('medicine_name');
            $msg = sprintf('Your request for %d units of %s has been rejected', $req->quantity_requested, $medicine ?? 'medicine');
            if (!empty($validated['reason'])) $msg .= ': ' . $validated['reason'];
            DB::table('notifications')->insert(['branch_id' => $req->from_branch_id, 'type' => 'request', 'message' => $msg, 'reference_id' => $req->medicine_id, 'is_read' => 0, 'created_at' => now()]);

            return response()->json(['success' => true]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error rejecting branch request: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred'], 500);
        }
    }

    // History: return approved or rejected requests that involve this branch (either as requester or approver)
    public function history($branchId)
    {
        try {
            $rows = DB::table('branch_requests as br')
                ->leftJoin('medicines as m', 'br.medicine_id', '=', 'm.medicine_id')
                ->leftJoin('branches as f', 'br.from_branch_id', '=', 'f.branch_id')
                ->leftJoin('branches as t', 'br.to_branch_id', '=', 't.branch_id')
                ->leftJoin('users as u', 'br.requested_by', '=', 'u.user_id')
                ->select('br.branch_request_id', 'br.from_branch_id', 'br.to_branch_id', 'br.medicine_id', 'm.medicine_name', 'br.quantity_requested', 'br.status', 'br.requested_by', 'u.name as requested_by_name', 'br.confirmed_by', 'br.updated_at', 'br.created_at', 'f.branch_name as requesting_branch_name', 't.branch_name as target_branch_name')
                ->where(function($q) use ($branchId) {
                    $q->where('br.to_branch_id', $branchId)
                      ->orWhere('br.from_branch_id', $branchId);
                })
                ->whereIn('br.status', ['approved', 'rejected'])
                ->orderBy('br.updated_at', 'desc')
                ->get();

            return response()->json($rows->toArray());
        } catch (\Exception $e) {
            Log::error('Error fetching branch request history: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred'], 500);
        }
    }
}
