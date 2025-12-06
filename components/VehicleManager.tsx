import React, { useState } from 'react';
import { Vehicle } from '../types';
import { supabase } from '../lib/supabase';
import { Car, Plus, Trash2, Edit2, X, AlertTriangle } from 'lucide-react';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  refreshData: () => void;
  userEmail: string;
}

export const VehicleManager: React.FC<VehicleManagerProps> = ({ vehicles, refreshData, userEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: '',
    type: 'car',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    fuel_type: 'petrol',
    tank_capacity_l: 40,
    current_odometer: 0,
  });

  const handleEdit = (e: React.MouseEvent, v: Vehicle) => {
    e.stopPropagation();
    setFormData(v);
    setEditingId(v.id);
    setShowModal(true);
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      // Verify current user
      const { data: userRow, error: userErr } = await supabase
        .from('app_users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userErr || !userRow) throw new Error('Unable to verify user session');

      // 1) Delete logs
      const { error: logError } = await supabase
        .from('fuel_entries')
        .delete()
        .eq('vehicle_id', deleteId)
        .eq('owner_id', userRow.id);

      if (logError) throw new Error('Failed to delete associated logs: ' + logError.message);

      // 2) Delete vehicle
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', deleteId)
        .eq('owner_id', userRow.id);

      if (vehicleError) throw new Error('Failed to delete vehicle: ' + vehicleError.message);

      refreshData();
      setDeleteId(null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.from('app_users').select('id').eq('email', userEmail).single();
    
    if (!userData) {
      alert('User session error');
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('vehicles')
          .update({
             name: formData.name,
             type: formData.type,
             make: formData.make,
             model: formData.model,
             year: formData.year,
             fuel_type: formData.fuel_type,
             tank_capacity_l: formData.tank_capacity_l,
             current_odometer: formData.current_odometer
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('vehicles')
          .insert([{
             ...formData,
             owner_id: userData.id
          }]);
        if (error) throw error;
      }
      setShowModal(false);
      refreshData();
      setFormData({ name: '', type: 'car', make: '', model: '', year: new Date().getFullYear(), fuel_type: 'petrol', tank_capacity_l: 40, current_odometer: 0 });
      setEditingId(null);
    } catch (error: any) {
      alert('Error saving vehicle: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 reveal-on-scroll">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-serif dark:font-mono text-gray-900 dark:text-white">Your Fleet</h2>
        <button 
          onClick={() => { setEditingId(null); setShowModal(true); }}
          className="bg-brand-orange dark:bg-neural-cyan text-white dark:text-black px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity btn-press"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v.id} className="glow-panel p-6 relative group card-hover icon-halo-anim cursor-default">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl icon-halo">
                 <Car className="text-brand-orange dark:text-neural-cyan" size={24} />
               </div>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   type="button"
                   onClick={(e) => handleEdit(e, v)} 
                   className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-400 btn-press"
                 >
                   <Edit2 size={16} />
                 </button>
                 <button 
                   type="button"
                   onClick={(e) => confirmDelete(e, v.id)} 
                   className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 btn-press"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{v.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{v.year} {v.make} {v.model}</p>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-2 bg-gray-50 dark:bg-black/30 rounded-lg border border-gray-100 dark:border-white/5">
                <div className="text-gray-400 uppercase tracking-wider text-[10px]">Odometer</div>
                <div className="font-mono font-bold text-gray-700 dark:text-gray-200">{v.current_odometer.toLocaleString()} km</div>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-black/30 rounded-lg border border-gray-100 dark:border-white/5">
                <div className="text-gray-400 uppercase tracking-wider text-[10px]">Tank</div>
                <div className="font-mono font-bold text-gray-700 dark:text-gray-200">{v.tank_capacity_l} L</div>
              </div>
            </div>
          </div>
        ))}
        
        {vehicles.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
            No vehicles found. Add your first vehicle to start tracking.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
           <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl border border-red-100 dark:border-red-900/30 modal-enter text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Vehicle?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action cannot be undone. All fuel logs associated with this vehicle will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)} 
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete} 
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold shadow-lg hover:bg-red-600 transition-colors"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/30 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
           <div className="relative w-full max-w-2xl bg-white dark:bg-[#111] rounded-3xl p-8 shadow-2xl modal-enter border border-gray-100 dark:border-gray-800 overflow-y-auto max-h-[90vh]">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif dark:font-mono">
                 {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 btn-press"><X size={20}/></button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields same as before... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-500">Nickname</label>
                     <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan outline-none dark:text-white" placeholder="Daily Commuter" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-500">Type</label>
                     <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan outline-none dark:text-white">
                       <option value="car">Car</option>
                       <option value="bike">Bike</option>
                       <option value="truck">Truck</option>
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-500">Make</label>
                     <input required type="text" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl outline-none dark:text-white" placeholder="Toyota" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-500">Model</label>
                     <input required type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl outline-none dark:text-white" placeholder="Corolla" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-500">Year</label>
                     <input required type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl outline-none dark:text-white" placeholder="2022" />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-500">Fuel Type</label>
                     <select value={formData.fuel_type} onChange={e => setFormData({...formData, fuel_type: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl outline-none dark:text-white">
                       <option value="petrol">Petrol</option>
                       <option value="diesel">Diesel</option>
                       <option value="electric">Electric</option>
                       <option value="hybrid">Hybrid</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-500">Capacity (L)</label>
                     <input required type="number" value={formData.tank_capacity_l} onChange={e => setFormData({...formData, tank_capacity_l: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl outline-none dark:text-white" placeholder="40" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-500">Odometer</label>
                     <input required type="number" value={formData.current_odometer} onChange={e => setFormData({...formData, current_odometer: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl outline-none dark:text-white" placeholder="0" />
                   </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-brand-orange dark:bg-neural-cyan text-white dark:text-black font-bold rounded-xl shadow-lg mt-4 hover:opacity-90 transition-opacity btn-press">
                  {loading ? 'Saving...' : 'Save Vehicle'}
                </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};