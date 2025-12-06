import React, { useState } from 'react';
import { FuelLog, Vehicle } from '../types';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Gauge, Fuel, DollarSign, MapPin, X, IndianRupee, Download, Trash2, Edit2 } from 'lucide-react';

interface FuelLogManagerProps {
  logs: FuelLog[];
  vehicles: Vehicle[];
  refreshData: () => void;
  userEmail: string;
}

export const FuelLogManager: React.FC<FuelLogManagerProps> = ({ logs, vehicles, refreshData, userEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Log Form State
  const initialFormState = {
    vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
    ts: new Date().toISOString().split('T')[0],
    odometer: 0,
    litres: 0,
    price_per_l: 0,
    total_cost: 0,
    station_name: '',
    fill_type: 'full' as 'full' | 'partial'
  };
  const [formData, setFormData] = useState(initialFormState);

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

  const handleEdit = (e: React.MouseEvent, log: FuelLog) => {
    e.stopPropagation();
    setEditingId(log.id);
    setFormData({
      vehicle_id: log.vehicle_id,
      ts: new Date(log.ts).toISOString().split('T')[0],
      odometer: log.odometer,
      litres: log.litres,
      price_per_l: log.price_per_l,
      total_cost: log.total_cost,
      station_name: log.station_name || '',
      fill_type: log.fill_type
    });
    setShowModal(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this entry? This will affect your stats.')) return;
    setLoading(true);
    const { error } = await supabase.from('fuel_entries').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else refreshData();
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.from('app_users').select('id').eq('email', userEmail).single();
    if (!userData) {
      alert("Session Error: Could not verify user.");
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        // Update Log
        const { error } = await supabase.from('fuel_entries').update({
          vehicle_id: formData.vehicle_id,
          ts: new Date(formData.ts).toISOString(),
          odometer: formData.odometer,
          litres: formData.litres,
          price_per_l: formData.price_per_l,
          total_cost: formData.total_cost,
          station_name: formData.station_name,
          fill_type: formData.fill_type
        }).eq('id', editingId);
        
        if (error) throw error;
      } else {
        // Insert Log
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

        // Auto-update odometer logic only on new inserts for simplicity
        const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
        if (vehicle && formData.odometer > vehicle.current_odometer) {
          await supabase.from('vehicles').update({ current_odometer: formData.odometer }).eq('id', formData.vehicle_id);
        }
      }

      setShowModal(false);
      refreshData();
      setFormData(initialFormState);
      setEditingId(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Vehicle', 'Odometer', 'Litres', 'Price', 'Total Cost', 'Station'];
    const rows = logs.map(l => [
      new Date(l.ts).toLocaleDateString(),
      l.vehicle_name,
      l.odometer,
      l.litres,
      l.price_per_l,
      l.total_cost,
      l.station_name || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fuel_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (vehicles.length === 0) {
    return <div className="p-8 text-center text-gray-500">Please add a vehicle before logging fuel.</div>;
  }

  return (
    <div className="space-y-6 reveal-on-scroll">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-serif dark:font-mono text-gray-900 dark:text-white">Fuel History</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="bg-white dark:bg-white/10 text-gray-600 dark:text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-white/20 transition-colors btn-press flex items-center gap-2 border border-gray-200 dark:border-white/10"
          >
            <Download size={16} /> <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => { setEditingId(null); setFormData(initialFormState); setShowModal(true); }}
            className="bg-brand-orange dark:bg-neural-cyan text-white dark:text-black px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity btn-press"
          >
            <Plus size={16} /> Log Entry
          </button>
        </div>
      </div>

      <div className="glow-panel rounded-2xl overflow-hidden card-hover">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Odometer</th>
                <th className="px-6 py-4">Volume</th>
                <th className="px-6 py-4">Price/L</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors row-hover group">
                  <td className="px-6 py-4 font-sans font-medium text-gray-900 dark:text-white">{new Date(log.ts).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-sans text-gray-600 dark:text-gray-300">{log.vehicle_name}</td>
                  <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">{log.odometer.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">{log.litres} L</td>
                  <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">₹{log.price_per_l}</td>
                  <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">₹{log.total_cost}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={(e) => handleEdit(e, log)} 
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/20 rounded text-gray-500 dark:text-gray-400 btn-press"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDelete(e, log.id)} 
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 btn-press"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-sans">No logs found. Start by adding an entry.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
          
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-glass-border modal-enter max-h-[85vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif dark:font-mono">
                 {editingId ? 'Edit Entry' : 'Log Fuel Entry'}
               </h2>
               <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors btn-press"><X size={20} className="text-gray-900 dark:text-white"/></button>
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
                      {/* Using native date input which triggers calendar on modern browsers */}
                      <input 
                        required 
                        type="date" 
                        value={formData.ts} 
                        onChange={e => setFormData({...formData, ts: e.target.value})} 
                        className="w-full pl-4 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan text-gray-900 dark:text-white cursor-pointer"
                        style={{ colorScheme: 'light dark' }}
                      />
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
               
               {/* Added Fill Type Select */}
               <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fill Type</label>
                   <select 
                      value={formData.fill_type} 
                      onChange={e => setFormData({...formData, fill_type: e.target.value as 'full' | 'partial'})}
                      className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                   >
                      <option value="full">Full Tank</option>
                      <option value="partial">Partial Fill</option>
                   </select>
               </div>

               <div className="pt-4 flex gap-4">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white btn-press">Cancel</button>
                 <button type="submit" disabled={loading} className="flex-1 py-3 bg-brand-orange dark:bg-neural-cyan text-white dark:text-black rounded-xl font-bold text-sm shadow-lg hover:opacity-90 btn-press">
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