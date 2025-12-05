import React, { useState } from 'react';
import { FuelLog, Vehicle } from '../types';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Gauge, Fuel, DollarSign, MapPin, X, IndianRupee } from 'lucide-react';

interface FuelLogManagerProps {
  logs: FuelLog[];
  vehicles: Vehicle[];
  refreshData: () => void;
  userEmail: string;
}

export const FuelLogManager: React.FC<FuelLogManagerProps> = ({ logs, vehicles, refreshData, userEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New Log Form State
  const [formData, setFormData] = useState({
    vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
    ts: new Date().toISOString().split('T')[0],
    odometer: 0,
    litres: 0,
    price_per_l: 0,
    total_cost: 0,
    station_name: '',
    fill_type: 'full'
  });

  // Calculate total cost automatically if liters and price exist
  const handleCalc = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    if (field === 'litres' || field === 'price_per_l') {
       if (newData.litres && newData.price_per_l) {
         newData.total_cost = parseFloat((newData.litres * newData.price_per_l).toFixed(2));
       }
    }
    setFormData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.from('app_users').select('id').eq('email', userEmail).single();
    if (!userData) return;

    try {
      // 1. Insert Log
      const { error } = await supabase.from('fuel_entries').insert([{
        owner_id: userData.id,
        vehicle_id: formData.vehicle_id,
        ts: new Date(formData.ts).toISOString(),
        odometer: formData.odometer,
        litres: formData.litres,
        price_per_l: formData.price_per_l,
        total_cost: formData.total_cost,
        station_name: formData.station_name,
        fill_type: formData.fill_type
      }]);
      
      if (error) throw error;

      // 2. Update Vehicle Odometer if newer
      const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
      if (vehicle && formData.odometer > vehicle.current_odometer) {
        await supabase.from('vehicles').update({ current_odometer: formData.odometer }).eq('id', formData.vehicle_id);
      }

      setShowModal(false);
      refreshData();
      // Reset sensitive fields
      setFormData(prev => ({ ...prev, odometer: 0, litres: 0, total_cost: 0 }));
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (vehicles.length === 0) {
    return <div className="p-8 text-center text-gray-500">Please add a vehicle before logging fuel.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-serif dark:font-mono text-gray-900 dark:text-white">Fuel History</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-brand-orange dark:bg-neural-cyan text-white dark:text-black px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Log Entry
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden bg-white dark:bg-black/40 border border-gray-100 dark:border-glass-border shadow-soft dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Odometer</th>
                <th className="px-6 py-3">Volume</th>
                <th className="px-6 py-3">Price/L</th>
                <th className="px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">{new Date(log.ts).toLocaleDateString()}</td>
                  {/* Fixed text color to ensure visibility in all themes */}
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{log.vehicle_name}</td>
                  <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">{log.odometer.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{log.litres} L</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">₹{log.price_per_l}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{log.total_cost}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Log Modal - Perfectly Centered */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
          
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-glass-border animate-fade-in-up max-h-[85vh] overflow-y-auto flex flex-col my-auto">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif dark:font-mono">Log Fuel Entry</h2>
               <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><X size={20} className="text-gray-900 dark:text-white"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
               {/* Vehicle Select */}
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle</label>
                  <select 
                    value={formData.vehicle_id} 
                    onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                  >
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.model})</option>)}
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                   <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input required type="date" value={formData.ts} onChange={e => setFormData({...formData, ts: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan text-gray-900 dark:text-white"/>
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Odometer</label>
                   <div className="relative">
                      <Gauge size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input required type="number" value={formData.odometer || ''} onChange={e => setFormData({...formData, odometer: parseFloat(e.target.value)})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan text-gray-900 dark:text-white" placeholder="Current Reading"/>
                   </div>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Litres</label>
                   <div className="relative">
                      <Fuel size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input required type="number" step="0.01" value={formData.litres || ''} onChange={e => handleCalc('litres', parseFloat(e.target.value))} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan text-gray-900 dark:text-white" placeholder="0.00"/>
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price / L (₹)</label>
                   <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input required type="number" step="0.01" value={formData.price_per_l || ''} onChange={e => handleCalc('price_per_l', parseFloat(e.target.value))} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan text-gray-900 dark:text-white" placeholder="0.00"/>
                   </div>
                 </div>
               </div>

               <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Cost (₹)</label>
                   <div className="relative">
                      {/* Changed to Rupee Icon if available, or keep Dollar as generic money icon but styled appropriately */}
                      <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input required type="number" step="0.01" value={formData.total_cost || ''} onChange={e => setFormData({...formData, total_cost: parseFloat(e.target.value)})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan text-gray-900 dark:text-white font-bold"/>
                   </div>
               </div>

               <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Station Name (Optional)</label>
                   <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input type="text" value={formData.station_name} onChange={e => setFormData({...formData, station_name: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white" placeholder="Shell, BP..."/>
                   </div>
               </div>

               <div className="pt-4 flex gap-4">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">Cancel</button>
                 <button type="submit" disabled={loading} className="flex-1 py-3 bg-brand-orange dark:bg-neural-cyan text-white dark:text-black rounded-xl font-bold text-sm shadow-lg hover:opacity-90">
                   {loading ? 'Saving...' : 'Save Log'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};