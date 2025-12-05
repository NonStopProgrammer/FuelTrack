import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, Building2, Save, Sun, Moon, Bell, Database, Cloud } from 'lucide-react';

interface SettingsProps {
  user: any;
  refreshProfile: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, refreshProfile, isDark, toggleTheme }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    currency: user?.currency || 'INR'
  });
  const [loading, setLoading] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
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

  return (
    <div className="animate-fade-in-up space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold font-serif dark:font-mono text-gray-900 dark:text-white mb-6">Account Settings</h2>

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

      <div className="glow-panel p-8 card-hover">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Information</h3>
        
        {msg && (
          <div className={`mb-6 p-4 rounded-xl text-sm text-center ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
            {msg.text}
          </div>
        )}

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
             {loading ? 'Saving...' : 'Save Changes'}
           </button>
        </form>
      </div>

      {/* Premium Settings */}
      <div className="glow-panel p-8 card-hover">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Notifications & Data</h3>
         
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                     <Bell size={20} />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-gray-900 dark:text-white">Price Spike Alerts</div>
                     <div className="text-xs text-gray-500">Get notified when fuel prices rise by 5%.</div>
                  </div>
               </div>
               <button 
                 onClick={() => setAlertsEnabled(!alertsEnabled)}
                 className={`w-12 h-6 rounded-full p-1 transition-colors ${alertsEnabled ? 'bg-brand-orange dark:bg-neural-cyan' : 'bg-gray-200 dark:bg-gray-700'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${alertsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </button>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                     <Cloud size={20} />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-gray-900 dark:text-white">Cloud Backup</div>
                     <div className="text-xs text-gray-500">Last backup: 2 hours ago</div>
                  </div>
               </div>
               <button className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Sync Now
               </button>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                     <Database size={20} />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-gray-900 dark:text-white">Export Data</div>
                     <div className="text-xs text-gray-500">Download all your logs as JSON.</div>
                  </div>
               </div>
               <button className="text-xs font-bold text-brand-orange dark:text-neural-cyan hover:underline transition-colors">
                  Download
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};