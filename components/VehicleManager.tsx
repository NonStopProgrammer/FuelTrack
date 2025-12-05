import React, { useState } from 'react';
import { Vehicle } from '../types';
import { supabase } from '../lib/supabase';
import { Car, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  refreshData: () => void;
  userEmail: string;
}

export const VehicleManager: React.FC<VehicleManagerProps> = ({ vehicles, refreshData, userEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleEdit = (v: Vehicle) => {
    setFormData(v);
    setEditingId(v.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle? All linked fuel logs will be permanently removed.')) return;
    
    setLoading(true);
    try {
      // 1. Manually cascade delete logs first (frontend enforcement)
      const { error: logError } = await supabase.from('fuel_entries').delete().eq('vehicle_id', id);
      if (logError) throw logError;

      // 2. Delete vehicle
      const { error: vehicleError } = await supabase.from('vehicles').delete().eq('id', id);
      if (vehicleError) throw vehicleError;

      refreshData();
    } catch (err: any) {
      alert('Error deleting vehicle: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Get current user ID
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
      // Reset form
      setFormData({ name: '', type: 'car', make: '', model: '', year: new Date().getFullYear(), fuel_type: 'petrol', tank_capacity_l: 40, current_odometer: 0 });
      setEditingId(null);
    } catch (error: any) {
      console.error(error);
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
          <div key={v.id} className="glow-panel p-6 relative group card-hover icon-halo-anim">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl icon-halo">
                 <Car className="text-brand-orange dark:text-neural-cyan" size={24} />
               </div>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleEdit(v)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-400 btn-press">
                   <Edit2 size={16} />
                 </button>
                 <button onClick={() => handleDelete(v.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 btn-press">
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

      {/* Modal */}
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