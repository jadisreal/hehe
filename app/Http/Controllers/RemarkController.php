<?php

namespace App\Http\Controllers;

use App\Models\Remark;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RemarkController extends Controller
{
    /**
     * Display a listing of remarks for a specific patient.
     *
     * @param  int  $patientId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($patientId)
    {
        $remarks = Remark::where('patient_id', $patientId)
            ->orderBy('date', 'desc')
            ->get();
            
        return response()->json($remarks);
    }

    /**
     * Store a newly created remark in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'date' => 'required|date',
            'note' => 'required|string'
        ]);

        $remark = Remark::create($validated);
        
        return response()->json($remark, 201);
    }

    /**
     * Display the specified remark.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $remark = Remark::findOrFail($id);
        return response()->json($remark);
    }

    /**
     * Update the specified remark in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'date' => 'sometimes|date',
            'note' => 'sometimes|required|string'
        ]);

        $remark = Remark::findOrFail($id);
        $remark->update($validated);

        return response()->json($remark);
    }

    /**
     * Remove the specified remark from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $remark = Remark::findOrFail($id);
        $remark->delete();

        return response()->json(null, 204);
    }
}