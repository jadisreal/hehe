
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import type { BranchInventoryItem } from '../services/branchInventoryService';
import { BranchInventoryService } from '../services/branchInventoryService';

interface RequestMedicineModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  branchId: number;
  medicineOptions?: BranchInventoryItem[]; // medicines available in the selected branch
  onRequest: (data: { medicineId: number; expirationDate: string; quantity: number }) => Promise<void> | void;
}

const RequestMedicineModal: React.FC<RequestMedicineModalProps> = ({
  isOpen,
  setIsOpen,
  branchId,
  medicineOptions = [],
  onRequest,
}) => {
  const [medicines, setMedicines] = useState<BranchInventoryItem[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(null);
  const [expirationDates, setExpirationDates] = useState<string[]>([]);
  const [selectedExpiration, setSelectedExpiration] = useState('');
  const [dateReceivedOptions, setDateReceivedOptions] = useState<string[]>([]);
  const [selectedDateReceived, setSelectedDateReceived] = useState('');
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Use provided medicineOptions (filter to those with quantity > 50)
      const meds = (medicineOptions || []).filter(m => Number(m.quantity ?? 0) > 50);
      setMedicines(meds);
      // Also preload canonical medicines table for better name lookup
      (async () => {
        try {
          const canonical = await BranchInventoryService.getAllMedicines();
          const map = new Map<number, string>();
          canonical.forEach((c: any) => map.set(Number(c.medicine_id || 0), String(c.medicine_name || c.name || '')));
          // merge into current medicines by mapping names when unknown
          setMedicines(prev => prev.map(p => ({
            ...p,
            medicine_name: p.medicine_name || map.get(Number(p.medicine_id || 0)) || p.medicine_name
          })));
        } catch (e) {
          // ignore
        }
      })();
      setSelectedMedicineId(null);
      setExpirationDates([]);
      setSelectedExpiration('');
      setMaxQuantity(0);
      setQuantity('');
      setErrors({});
    }
  }, [isOpen, branchId]);

  useEffect(() => {
    if (selectedMedicineId !== null) {
      const med = medicines.find((m) => Number(m.medicine_id) === Number(selectedMedicineId));
      if (med) {
        // Populate available options but DO NOT auto-select or clear user selections.
        const exp = med.expiration_date || '';
        const newExpirationDates = exp ? [exp] : [];
        setExpirationDates(newExpirationDates);

        const received = med.date_received || '';
        const newDateReceivedOptions = received ? [received] : [];
        setDateReceivedOptions(newDateReceivedOptions);

        const newMax = Number(med.quantity ?? 0);
        setMaxQuantity(newMax);

        // Keep user's selectedDateReceived/selectedExpiration/quantity as-is; validation will catch mismatches.
      } else {
        // If medicine not found in current list, just clear available options but keep user inputs
        setExpirationDates([]);
        setDateReceivedOptions([]);
        setMaxQuantity(0);
      }
    }
  }, [selectedMedicineId, medicines]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedMedicineId) newErrors.medicine = 'Select a medicine';
    if (!selectedExpiration) newErrors.expiration = 'Select expiration date';
    if (!quantity || quantity <= 0) newErrors.quantity = 'Enter a valid quantity';
    else if (typeof quantity === 'number' && quantity > maxQuantity) newErrors.quantity = 'Exceeds available stock';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    if (isSubmitting) return; // prevent double submit
    setIsSubmitting(true);
    try {
      await onRequest({
        medicineId: Number(selectedMedicineId!),
        expirationDate: selectedExpiration,
        quantity: Number(quantity),
      });
      setIsOpen(false);
      // Reset form after successful request
      resetForm();
    } catch (err) {
      // let parent handle errors; still re-enable
      console.error('RequestMedicineModal: onRequest failed', err);
      Swal.fire({ icon: 'error', title: 'Request Failed', text: (err as any)?.message || 'Failed to create request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMedicineId(null);
    setExpirationDates([]);
    setSelectedExpiration('');
    setDateReceivedOptions([]);
    setSelectedDateReceived('');
    setMaxQuantity(0);
    setQuantity('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };

  return (
    <div className={`${isOpen ? 'block' : 'hidden'}`}>
      <div
        onClick={handleClose}
        className="bg-black/30 backdrop-blur-sm fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer animate-fade-in"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-xl w-full max-w-md shadow-2xl cursor-default relative overflow-hidden animate-scale-in border-2 border-[#A3386C]"
        >
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#A3386C] mb-6">REQUEST MEDICINE</h2>
            <div className="space-y-4 text-left">
              <div>
                <label className="font-semibold text-gray-700">Medicine Name</label>
                <select
                  className={`w-full mt-1 p-3 border ${errors.medicine ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black`}
                  value={selectedMedicineId ?? ''}
                  onChange={e => setSelectedMedicineId(Number(e.target.value) || null)}
                >
                  <option value="">Select medicine</option>
                  {(medicines || []).map((m: any) => {
                    const id = Number(m.medicine_id || m.medicine_stock_in_id || 0);
                    const name = String(m.medicine_name || 'Unknown');
                    return (
                      <option key={id || Math.random()} value={id} className="text-black" style={{ color: 'black' }}>{name}</option>
                    );
                  })}
                </select>
                {errors.medicine && <p className="text-red-500 text-xs mt-1">{errors.medicine}</p>}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Date Received</label>
                <select
                  className={`w-full mt-1 p-3 border ${errors.expiration ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black`}
                  value={selectedDateReceived}
                  onChange={e => setSelectedDateReceived(e.target.value)}
                  disabled={dateReceivedOptions.length === 0}
                >
                  <option value="">Select date received</option>
                  {dateReceivedOptions.map(date => (
                    <option key={date} value={date} className="text-black" style={{ color: 'black' }}>{date}</option>
                  ))}
                </select>
                {errors.expiration && <p className="text-red-500 text-xs mt-1">{errors.expiration}</p>}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Expiration Date</label>
                <select
                  className={`w-full mt-1 p-3 border ${errors.expiration ? 'border-red-500' : (expirationDates.length === 0 ? 'border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-300 bg-white text-black')} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent`}
                  value={selectedExpiration}
                  onChange={e => setSelectedExpiration(e.target.value)}
                  disabled={expirationDates.length === 0 || !selectedDateReceived}
                >
                  <option value="">Select expiration</option>
                  {expirationDates.map(date => (
                    <option key={date} value={date} className="text-black" style={{ color: 'black' }}>{date}</option>
                  ))}
                </select>
                {errors.expiration && <p className="text-red-500 text-xs mt-1">{errors.expiration}</p>}
                {/* show a small helper when expiration is locked */}
                {/* helper text intentionally removed per UX request */}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value) || '')}
                  className={`w-full mt-1 p-3 border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black`}
                  placeholder={maxQuantity ? `Max: ${maxQuantity}` : 'Enter quantity'}
                  disabled={!selectedMedicineId}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
            </div>
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button onClick={handleClose} disabled={isSubmitting} className="w-full bg-transparent hover:bg-gray-100 border border-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors">CANCEL</button>
              <button onClick={handleConfirm} disabled={isSubmitting} className={`w-full ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#A3386C] hover:bg-[#8a2f5a]'} text-white font-semibold py-2 px-6 rounded-lg transition-colors`}>{isSubmitting ? 'SENDING...' : 'CONFIRM'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestMedicineModal;
