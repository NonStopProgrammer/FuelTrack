import React, { useState } from 'react';
import { supabase, hashPassword } from '../lib/supabase';
import { User, Phone, Building2, Save, Sun, Moon, Database, Trash2, Lock, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  user: any;
  refreshProfile: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, refreshProfile, isDark, toggleTheme, onLogout }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    currency: user?.currency || 'INR'
  });
  
  const [passData, setPassData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const { error } = await supabase
        .from('app_users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          organization: formData.organization,
          currency: formData.currency,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
      refreshProfile();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      setMsg({ type: 'error', text: "Passwords don't match." });
      return;
    }
    if (passData.newPassword.length < 6) {
      setMsg({ type: 'error', text: "Password must be at least 6 characters." });
      return;
    }
    
    setLoading(true);
    try {
      const hashedPassword = await hashPassword(passData.newPassword);
      const { error } = await supabase
        .from('app_users')
        .update({ password_hash: hashedPassword })
        .eq('id', user.id);
        
      if (error) throw error;
      setMsg({ type: 'success', text: 'Password changed successfully.' });
      setPassData({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Error changing password: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user logs joined with vehicle info (simulated join or simple fetch)
      // Since supabase-js simple client join syntax is specific, we'll fetch logs and map vehicle names if needed, 
      // or just fetch raw logs.
      const { data: logs, error } = await supabase
        .from('fuel_entries')
        .select('*')
        .eq('owner_id', user.id)
        .order('ts', { ascending: false });

      if (error) throw error;

      if (!logs || logs.length === 0) {
        alert("No data found to export.");
        setLoading(false);
        return;
      }

      // 2. Convert to CSV
      const headers = ['ID', 'Date', 'Vehicle ID', 'Odometer', 'Litres', 'Price/L', 'Total Cost', 'Station', 'Fill Type', 'Created At'];
      const rows = logs.map((l: any) => [
        l.id,
        new Date(l.ts).toLocaleDateString(),
        l.vehicle_id,
        l.odometer,
        l.litres,
        l.price_per_l,
        l.total_cost,
        l.station_name || '',
        l.fill_type,
        l.created_at
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `fueltrack_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("CRITICAL WARNING: This will permanently delete your account, all vehicles, and all fuel logs. This action cannot be undone. Type 'DELETE' to confirm.")) {
       return;
    }
    
    const confirmation = prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmation !== 'DELETE') return;

    setLoading(true);
    try {
      // 1. Get all vehicle IDs for this user to ensure we clean up logs even if owner_id is missing on logs
      const { data: userVehicles } = await supabase.from('vehicles').select('id').eq('owner_id', user.id);
      
      const vehicleIds = userVehicles?.map(v => v.id) || [];

      if (vehicleIds.length > 0) {
        // Delete logs linked to these vehicles
        const { error: logError } = await supabase.from('fuel_entries').delete().in('vehicle_id', vehicleIds);
        if (logError) throw logError;
      }
      
      // Fallback: Delete any leftover logs by owner_id
      await supabase.from('fuel_entries').delete().eq('owner_id', user.id);
      
      // 2. Delete vehicles
      const { error: vehError } = await supabase.from('vehicles').delete().eq('owner_id', user.id);
      if (vehError) throw vehError;
      
      // 3. Delete user
      const { error: userError } = await supabase.from('app_users').delete().eq('id', user.id);
      if (userError) throw userError;
      
      alert('Account deleted successfully.');
      onLogout();
    } catch (err: any) {
      alert('Error deleting account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6 max-w-2xl mx-auto pb-10">
      <h2 className="text-2xl font-bold font-serif dark:font-mono text-gray-900 dark:text-white mb-6">Account Settings</h2>

      {msg && (
        <div className={`mb-6 p-4 rounded-xl text-sm text-center ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
          {msg.text}
        </div>
      )}

      {/* Theme Card */}
      <div className="glow-panel p-6 mb-8 flex justify-between items-center card-hover">
        <div>
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appearance</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400">Customize your dashboard experience.</p>
        </div>
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors btn-press"
        >
          {isDark ? <Sun size={20} className="text-white"/> : <Moon size={20} className="text-black"/>}
          <span className="font-medium text-sm text-gray-900 dark:text-white">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Personal Info */}
      <div className="glow-panel p-8 card-hover">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">First Name</label>
                <div className="relative">
                   <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan outline-none dark:text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Last Name</label>
                <div className="relative">
                   <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan outline-none dark:text-white" />
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Phone</label>
                <div className="relative">
                   <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan outline-none dark:text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Organization</label>
                <div className="relative">
                   <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input type="text" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan outline-none dark:text-white" />
                </div>
              </div>
           </div>
           
           <div className="space-y-2">
             <label className="text-xs font-bold uppercase text-gray-500">Preferred Currency</label>
             <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan outline-none dark:text-white">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
             </select>
           </div>

           <button 
             type="submit" 
             disabled={loading} 
             className="w-full py-4 bg-brand-orange dark:bg-neural-cyan text-white dark:text-black font-bold rounded-xl shadow-lg mt-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 btn-press"
           >
             <Save size={18} />
             {loading ? 'Saving...' : 'Save Profile Changes'}
           </button>
        </form>
      </div>

      {/* Security Settings */}
      <div className="glow-panel p-8 card-hover">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Security</h3>
        <form onSubmit={handlePasswordChange} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">New Password</label>
                <div className="relative">
                   <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input required type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan outline-none dark:text-white" placeholder="••••••" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Confirm Password</label>
                <div className="relative">
                   <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input required type="password" value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan outline-none dark:text-white" placeholder="••••••" />
                </div>
              </div>
           </div>
           <button 
             type="submit" 
             disabled={loading} 
             className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg mt-2 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 btn-press"
           >
             <Lock size={16} />
             Change Password
           </button>
        </form>
      </div>

      {/* Data Export & Danger Zone */}
      <div className="glow-panel p-8 card-hover border-red-50 dark:border-red-900/10">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Data & Privacy</h3>
         
         <div className="space-y-6">
            <div className="flex items-center justify-between pt-2">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                     <Database size={20} />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-gray-900 dark:text-white">Export Data</div>
                     <div className="text-xs text-gray-500">Download all your logs as JSON/CSV.</div>
                  </div>
               </div>
               <button 
                 onClick={handleExportData}
                 disabled={loading}
                 className="text-xs font-bold text-brand-orange dark:text-neural-cyan hover:underline transition-colors"
               >
                  {loading ? 'Processing...' : 'Download'}
               </button>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                     <AlertTriangle size={20} />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-red-600 dark:text-red-400">Delete Account</div>
                     <div className="text-xs text-gray-500">Permanently remove all data and access.</div>
                  </div>
               </div>
               <button 
                 onClick={handleDeleteAccount}
                 disabled={loading}
                 className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
               >
                 {loading ? 'Deleting...' : 'Delete Forever'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};