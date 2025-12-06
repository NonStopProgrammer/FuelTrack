import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard, Car, History, Settings as SettingsIcon, LogOut,
  Plus, Fuel, Calendar, DollarSign, Gauge, ArrowUpRight, ChevronRight,
  TrendingDown, TrendingUp, BarChart3, IndianRupee, Wallet,
  Menu, X, ChevronDown, Sun, Moon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Vehicle, FuelLog, DashboardStats } from '../types';
import { VehicleManager } from './VehicleManager';
import { FuelLogManager } from './FuelLogManager';
import { Analytics } from './Analytics';
import { Settings } from './Settings';

interface DashboardProps {
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  sessionEmail: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, isDark, toggleTheme, sessionEmail }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ avgMpg: 0, totalCost: 0, totalDistance: 0, totalFuel: 0 });
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const avatarSeeds = ['Bolt','Nova','Rider','Atlas','Pixel','Orbit','Comet','Blaze','Zen','Echo'];
  const avatarSources = useMemo(
    () => avatarSeeds.map(seed => `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&radius=50`),
    []
  );
  useEffect(() => {
    const saved = localStorage.getItem('ft_avatar_index');
    if (saved !== null) setAvatarIndex(parseInt(saved, 10));
  }, []);
  const handleSelectAvatar = (i: number) => {
    setAvatarIndex(i);
    localStorage.setItem('ft_avatar_index', String(i));
    setShowAvatarPicker(false);
    setProfileOpen(false);
  };
  
  // --- Scroll Reveal Observer ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '20px' });
 
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));
 
    return () => observer.disconnect();
  }, [activeTab, vehicles, logs]); // Re-run when content changes

  // Close profile dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Close overlays with Escape for accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setProfileOpen(false);
        setShowSettingsModal(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
 
  useEffect(() => {
    if (sessionEmail) {
      fetchUserData();
    }
  }, [sessionEmail]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      if (!sessionEmail) return;

      // Correctly fetch the logged-in user by email
      const { data: userData, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', sessionEmail)
        .single();

      if (error) throw error;

      if (userData) {
        setUser(userData);
        await fetchData(userData.id);
      }
    } catch (e) {
      console.error("Error fetching user data:", e);
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
      fetchUserData(); // Refresh profile and data
    }
  };

  const CurrencySymbol = () => <span className="font-sans">{user?.currency === 'INR' ? '₹' : (user?.currency === 'USD' ? '$' : user?.currency)}</span>;

  // Icon selector based on currency
  const CostIcon = user?.currency === 'INR' ? IndianRupee : DollarSign;

  // Current month spend (YYYY-MM match) used on Overview stats
  const currentMonthSpend = useMemo(() => {
    const key = new Date().toISOString().slice(0, 7);
    return logs.reduce((acc, l) => (String(l.ts).slice(0, 7) === key ? acc + (l.total_cost || 0) : acc), 0);
  }, [logs]);

  return (
    <div className="min-h-screen bg-brand-light dark:bg-obsidian transition-colors duration-500 flex flex-col md:flex-row font-sans text-gray-900 dark:text-white">
      {/* Sidebar + Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${mobileOpen ? 'fixed inset-y-0 left-0 w-72' : 'hidden'} md:static md:block ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-72 bg-white dark:bg-matte-dark border-r border-gray-200 dark:border-glass-border p-4 md:p-6 flex flex-col z-30 shadow-light-md dark:shadow-none relative`}
      >
        {/* Mid-edge collapse/expand handle (desktop) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 h-12 w-7 rounded-r-xl glass border border-gray-200 dark:border-white/10 items-center justify-center hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronRight size={16} className={`${sidebarCollapsed ? '' : 'rotate-180'} transition-transform`} />
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-brand-orange to-brand-darkOrange dark:from-neural-cyan dark:to-blue-600 p-1.5 rounded-lg text-white dark:text-black shadow-lg dark:shadow-neon-cyan">
              <Fuel size={20} />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-lg font-serif dark:font-mono tracking-tight text-gray-900 dark:text-white">
                FuelTrack
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-2 rounded-lg bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 btn-press"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
            { id: 'vehicles', label: 'Vehicles', icon: <Car size={18} /> },
            { id: 'history', label: 'Log History', icon: <History size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center gap-0 px-2' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all btn-press ${
                activeTab === item.id
                  ? 'bg-brand-orange/10 dark:bg-neural-cyan/10 text-brand-orange dark:text-neural-cyan shadow-sm border border-brand-orange/5 dark:border-neural-cyan/5'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
              aria-label={item.label}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sign out moved to profile menu (top-right) */}
      </aside>


      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-screen scroll-smooth">
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute inset-0 bg-mesh-gradient-light opacity-30 dark:opacity-0 transition-opacity"></div>
           <div className="absolute inset-0 bg-mesh-gradient opacity-0 dark:opacity-1 dark:animate-pulse-slow transition-opacity"></div>
        </div>

        <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto pb-20">
          
          {/* Header */}
          <div className="glow-panel p-4 flex items-center justify-between gap-4 mb-10 reveal-on-scroll relative z-40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-lg bg-white/70 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white btn-press"
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>
              <div>
                <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white capitalize">
                  {activeTab.replace('-', ' ')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm hidden sm:block">
                  {user ? `Welcome back, ${user.first_name || 'Pilot'}.` : 'Loading profile...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl glass btn-press"
                aria-label="Toggle theme"
                title={isDark ? 'Switch to Light' : 'Switch to Dark'}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div ref={profileRef} className="relative z-50">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl glass btn-press"
                  aria-label="User menu"
                >
                  <img src={avatarSources[avatarIndex]} alt="Avatar" className="w-8 h-8 rounded-full" />
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.first_name || 'User'}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{isDark ? 'Dark' : 'Light'} mode</div>
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 glow-panel p-2 z-[60]">
                    <button
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-sm btn-press"
                    >
                      <span className="font-medium">Change Avatar</span>
                    </button>
                    {showAvatarPicker && (
                      <div className="grid grid-cols-5 gap-2 p-2">
                        {avatarSources.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectAvatar(i)}
                            className={`p-0.5 rounded-full border ${avatarIndex === i ? 'border-brand-orange dark:border-neural-cyan' : 'border-transparent'} hover:border-brand-orange/60 dark:hover:border-neural-cyan/60 btn-press`}
                            aria-label={`Select avatar ${i + 1}`}
                          >
                            <img src={src} alt={`Avatar ${i + 1}`} className="w-9 h-9 rounded-full" />
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => { setShowSettingsModal(true); setProfileOpen(false); setShowAvatarPicker(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-sm btn-press"
                    >
                      <SettingsIcon size={16} />
                      <span>Profile & Settings</span>
                    </button>
                    <div className="my-1 border-t border-gray-100 dark:border-white/10"></div>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 btn-press"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showSettingsModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-md" onClick={() => setShowSettingsModal(false)}></div>
              <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glow-panel p-2 md:p-4 modal-enter">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Profile & Settings</h3>
                  <button onClick={() => setShowSettingsModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 btn-press" aria-label="Close">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <Settings
                    user={user}
                    refreshProfile={fetchUserData}
                    isDark={isDark}
                    toggleTheme={toggleTheme}
                    onLogout={onLogout}
                  />
                </div>
              </div>
            </div>
          )}

           {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  { label: 'Avg Efficiency', value: stats.avgMpg, unit: 'km/L', icon: <Gauge className="text-blue-500" />, change: '+2.1%' },
                  { label: 'Total Spend', value: stats.totalCost, unit: '', icon: <CostIcon className="text-green-500" />, change: 'Total', prefix: true },
                  { label: 'Monthly Spend', value: parseFloat(currentMonthSpend.toFixed(0)), unit: '', icon: <Wallet className="text-emerald-500" />, change: 'This Month', prefix: true },
                  { label: 'Fuel Consumed', value: stats.totalFuel, unit: 'L', icon: <Fuel className="text-orange-500" />, change: 'Since Start' },
                ].map((stat, i) => (
                  <div key={i} className="glow-panel p-6 reveal-on-scroll card-hover icon-halo-anim" style={{transitionDelay: `${i*60}ms`}}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl icon-halo">{stat.icon}</div>
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
                <div className="lg:col-span-2 glow-panel p-6 reveal-on-scroll card-hover" style={{transitionDelay: '200ms'}}>
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-lg font-serif dark:font-sans">Active Vehicles</h3>
                     <button onClick={() => setActiveTab('vehicles')} className="text-xs font-bold text-brand-orange dark:text-neural-cyan hover:underline">VIEW ALL</button>
                   </div>
                   <div className="space-y-4">
                     {vehicles.slice(0, 3).map((vehicle) => (
                       <div key={vehicle.id} className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-black/40 border border-transparent hover:border-brand-orange dark:hover:border-neural-cyan transition-colors group cursor-pointer shadow-sm row-hover">
                          <div className="w-12 h-12 bg-white dark:bg-matte-dark rounded-lg flex items-center justify-center mr-4 shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
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

                {/* Profile Card */}
                <div className="glow-panel p-6 reveal-on-scroll card-hover" style={{transitionDelay: '300ms'}}>
                   {/* Layout Grid Fix */}
                   <div className="grid grid-cols-[auto_1fr] gap-4 items-center mb-6">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center font-bold text-2xl text-white border border-white/20 shadow-lg">
                         {user?.first_name?.[0] || 'U'}
                      </div>
                      
                      {/* Name & Org */}
                      <div>
                         <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white leading-tight">
                            {user?.first_name} {user?.last_name}
                         </h3>
                         <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-orange/10 text-brand-orange dark:bg-neural-cyan/10 dark:text-neural-cyan tracking-wider">
                            {user?.organization || 'Manager'}
                         </div>
                      </div>
                   </div>

                   {/* Stats Area */}
                   <div className="border-t border-gray-100 dark:border-white/10 pt-4 grid grid-cols-2 gap-4">
                      <div>
                         <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vehicles</div>
                         <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                           {vehicles.length > 0 ? vehicles.length : <span className="text-gray-400 text-sm">None</span>}
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Currency</div>
                         <div className="text-lg font-mono font-bold text-brand-orange dark:text-neural-cyan">
                            {user?.currency || 'INR'}
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

          {activeTab === 'vehicles' && user && (
             <VehicleManager vehicles={vehicles} refreshData={refreshData} userEmail={user.email} />
          )}

          {activeTab === 'history' && user && (
             <FuelLogManager logs={logs} vehicles={vehicles} refreshData={refreshData} userEmail={user.email} />
          )}


        </div>
      </main>
    </div>
  );
};