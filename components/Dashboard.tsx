import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Car, History, Settings as SettingsIcon, LogOut, 
  Plus, Fuel, Calendar, DollarSign, Gauge, ArrowUpRight, ChevronRight,
  TrendingDown, TrendingUp, BarChart3, IndianRupee, Wallet
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Vehicle, FuelLog, DashboardStats } from '../types';
import { VehicleManager } from './VehicleManager';
import { FuelLogManager } from './FuelLogManager';
import { Settings } from './Settings';
import { Analytics } from './Analytics';

interface DashboardProps {
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, isDark, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ avgMpg: 0, totalCost: 0, totalDistance: 0, totalFuel: 0 });
  const [loading, setLoading] = useState(true);

  // Use the email used in auth as a session identifier for this simplified demo
  const [userEmail, setUserEmail] = useState<string>(''); 

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('app_users')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (users && users.length > 0) {
        setUser(users[0]);
        setUserEmail(users[0].email);
        await fetchData(users[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (userId: string) => {
    // Fetch Vehicles
    const { data: vData } = await supabase
      .from('vehicles')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    const fetchedVehicles = vData as Vehicle[] || [];
    setVehicles(fetchedVehicles);

    // Fetch Logs
    const { data: lData } = await supabase
      .from('fuel_entries')
      .select('*')
      .eq('owner_id', userId)
      .order('ts', { ascending: false });

    const fetchedLogs = (lData as any[] || []).map(log => ({
      ...log,
      vehicle_name: fetchedVehicles.find(v => v.id === log.vehicle_id)?.name || 'Unknown'
    }));
    setLogs(fetchedLogs);

    calculateStats(fetchedLogs);
  };

  const calculateStats = (currentLogs: FuelLog[]) => {
    if (currentLogs.length < 2) {
      // Not enough data to calculate efficiency properly based on "distance traveled between fills"
      const totalCost = currentLogs.reduce((acc, log) => acc + log.total_cost, 0);
      const totalFuel = currentLogs.reduce((acc, log) => acc + log.litres, 0);
      setStats({ 
        avgMpg: 0, 
        totalCost: parseFloat(totalCost.toFixed(2)), 
        totalDistance: 0, 
        totalFuel: parseFloat(totalFuel.toFixed(1)) 
      });
      return;
    }

    const totalCost = currentLogs.reduce((acc, log) => acc + log.total_cost, 0);
    // Sort ascending for math
    const sorted = [...currentLogs].sort((a,b) => a.odometer - b.odometer);
    
    // Logic: Distance = Last Odometer - First Odometer
    // Fuel Consumed = Sum of all liters *except* the very first fill (which establishes the baseline).
    // This assumes the user refills roughly to the same point (full) or we track lifetime usage.
    const minOdo = sorted[0].odometer;
    const maxOdo = sorted[sorted.length - 1].odometer;
    const totalDistance = maxOdo - minOdo;

    // Fuel used to travel this distance:
    const fuelUsed = sorted.slice(1).reduce((acc, log) => acc + log.litres, 0);

    const efficiency = fuelUsed > 0 ? (totalDistance / fuelUsed) : 0;

    setStats({
      avgMpg: parseFloat(efficiency.toFixed(1)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalDistance: totalDistance,
      totalFuel: parseFloat(fuelUsed.toFixed(1)) 
    });
  };

  const refreshData = () => {
    if (user) {
      fetchUserData(); // Refresh profile too
      fetchData(user.id);
    }
  };

  const CurrencySymbol = () => <span className="font-sans">{user?.currency === 'INR' ? '₹' : (user?.currency === 'USD' ? '$' : user?.currency)}</span>;

  // Icon selector based on currency
  const CostIcon = user?.currency === 'INR' ? IndianRupee : DollarSign;

  return (
    <div className="min-h-screen bg-brand-light dark:bg-obsidian transition-colors duration-500 flex flex-col md:flex-row font-sans text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-glass-border p-6 flex flex-col z-20 shadow-card dark:shadow-none">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-gradient-to-br from-brand-orange to-brand-darkOrange dark:from-neural-cyan dark:to-blue-600 p-1.5 rounded-lg text-white dark:text-black shadow-lg dark:shadow-neon-cyan">
             <Fuel size={20} />
          </div>
          <span className="font-bold text-lg font-serif dark:font-mono tracking-tight text-gray-900 dark:text-white">FuelTrack</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
            { id: 'vehicles', label: 'Vehicles', icon: <Car size={18} /> },
            { id: 'history', label: 'Log History', icon: <History size={18} /> },
            { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-brand-orange/10 dark:bg-neural-cyan/10 text-brand-orange dark:text-neural-cyan shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors mt-auto"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-screen">
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute inset-0 bg-mesh-gradient-light opacity-30 dark:opacity-0 transition-opacity"></div>
           <div className="absolute inset-0 bg-mesh-gradient opacity-0 dark:opacity-10 dark:animate-pulse-slow transition-opacity"></div>
        </div>

        <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto pb-20">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold font-serif dark:font-mono mb-2 text-gray-900 dark:text-white capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {user ? `Welcome back, ${user.first_name || 'Pilot'}.` : 'Loading profile...'}
              </p>
            </div>
            {activeTab === 'overview' && (
               <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-white dark:bg-black/40 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-glass-border shadow-sm">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 SYSTEM ONLINE
               </div>
            )}
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  { label: 'Avg Efficiency', value: stats.avgMpg, unit: 'km/L', icon: <Gauge className="text-blue-500" />, change: '+2.1%' },
                  { label: 'Total Spend', value: stats.totalCost, unit: '', icon: <CostIcon className="text-green-500" />, change: 'Total', prefix: true },
                  { label: 'Fleet Mileage', value: stats.totalDistance.toLocaleString(), unit: 'km', icon: <History className="text-purple-500" />, change: 'Tracked' },
                  { label: 'Fuel Consumed', value: stats.totalFuel, unit: 'L', icon: <Fuel className="text-orange-500" />, change: 'Since Start' },
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-6 rounded-2xl bg-white dark:bg-black/40 border border-gray-100 dark:border-glass-border shadow-soft dark:shadow-none animate-fade-in-up" style={{animationDelay: `${i*100}ms`}}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">{stat.icon}</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300`}>
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white mb-1 flex items-baseline gap-1">
                      {stat.prefix && <CurrencySymbol />} {stat.value} <span className="text-sm font-normal text-gray-500">{stat.unit}</span>
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vehicle List Preview */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-6 bg-white dark:bg-black/40 border border-gray-100 dark:border-glass-border shadow-soft dark:shadow-none animate-fade-in-up delay-200">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-lg font-serif dark:font-sans">Active Vehicles</h3>
                     <button onClick={() => setActiveTab('vehicles')} className="text-xs font-bold text-brand-orange dark:text-neural-cyan hover:underline">VIEW ALL</button>
                   </div>
                   <div className="space-y-4">
                     {vehicles.slice(0, 3).map((vehicle) => (
                       <div key={vehicle.id} className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-brand-orange dark:hover:border-neural-cyan transition-colors group cursor-pointer">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mr-4 shadow-sm dark:shadow-none">
                            <Car size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-brand-orange dark:group-hover:text-neural-cyan transition-colors" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 dark:text-white">{vehicle.name}</div>
                            <div className="text-xs text-gray-500">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-sm text-gray-700 dark:text-gray-300">{vehicle.current_odometer.toLocaleString()} km</div>
                            <div className="text-[10px] text-green-500">Active</div>
                          </div>
                       </div>
                     ))}
                     {vehicles.length === 0 && <p className="text-sm text-gray-500">No vehicles added yet.</p>}
                   </div>
                </div>

                {/* Profile Card - Enhanced for visibility in Light Mode */}
                <div className="rounded-2xl p-6 bg-gray-900 dark:bg-[#111] border border-gray-800 dark:border-glass-border text-white relative overflow-hidden shadow-2xl animate-fade-in-up delay-300">
                   {/* removed glass-panel class to prevent white background override in light mode */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 dark:bg-neural-cyan/10 blur-[50px] rounded-full"></div>
                   
                   <div className="relative z-10">
                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-black mb-4 flex items-center justify-center font-bold text-2xl border border-white/20">
                       {user?.first_name?.[0] || 'U'}
                     </div>
                     <h3 className="text-2xl font-bold font-serif dark:font-mono mb-1">{user?.first_name} {user?.last_name}</h3>
                     <p className="text-white/60 text-sm mb-8">{user?.organization || 'Organization'}</p>
                     
                     <div className="space-y-3">
                       <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                         <span className="text-white/60">Vehicles</span>
                         <span className="font-mono font-bold text-brand-orange dark:text-neural-cyan">{vehicles.length}</span>
                       </div>
                       <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                         <span className="text-white/60">Currency</span>
                         <span className="font-mono font-bold">{user?.currency || 'INR'}</span>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
             <Analytics logs={logs} vehicles={vehicles} currency={user?.currency || 'INR'} />
          )}

          {activeTab === 'vehicles' && (
             <VehicleManager vehicles={vehicles} refreshData={refreshData} userEmail={userEmail} />
          )}

          {activeTab === 'history' && (
             <FuelLogManager logs={logs} vehicles={vehicles} refreshData={refreshData} userEmail={userEmail} />
          )}

          {activeTab === 'settings' && user && (
            <Settings user={user} refreshProfile={fetchUserData} isDark={isDark} toggleTheme={toggleTheme} />
          )}

        </div>
      </main>
    </div>
  );
};