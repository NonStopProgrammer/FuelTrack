import React, { useEffect, useState } from 'react';
import { 
  Fuel, TrendingUp, Gauge, Shield, ChevronRight, 
  ArrowRight, Star, Sun, Moon, LogIn, Server, Lock, 
  Plus, BarChart3, Calendar, Zap, Activity, MoreHorizontal
} from 'lucide-react';
import { ViewState } from '../types';

interface LandingProps {
  onNavigate: (view: ViewState) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onNavigate, isDark, toggleTheme }) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const features = [
    { 
      title: "Precision Telemetry", 
      desc: "Sync with your vehicle's odometer instantly. No more manual entry errors or forgotten receipts.", 
      moreInfo: "Our algorithms detect odometer jumps and validate entry consistency against GPS data points.",
      icon: <Gauge /> 
    },
    { 
      title: "Cost Intelligence", 
      desc: "Real-time cost-per-mile analysis. Identify gas guzzlers and optimize route efficiency by 20%.", 
      moreInfo: "Visualize spending trends per vehicle and get predictive alerts for budget overruns.",
      icon: <TrendingUp /> 
    },
    { 
      title: "Fleet Compliance", 
      desc: "Automated standard reports for season. Unified control plane for 1 to 10,000 vehicles.", 
      moreInfo: "Export standard CSV/PDF reports formatted specifically for tax deduction compliance.",
      icon: <Shield /> 
    }
  ];

  const indianFaces = [
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100&h=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=100&h=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop"
  ];

  return (
    <div className="min-h-screen font-sans transition-colors duration-500 bg-brand-light dark:bg-obsidian text-gray-900 dark:text-white selection:bg-brand-orange/30 dark:selection:bg-neural-cyan/30 overflow-x-hidden relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-noise opacity-30 dark:opacity-20 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-mesh-gradient-light opacity-100 dark:opacity-0 transition-opacity duration-1000"></div>
        <div className="absolute inset-0 bg-mesh-gradient opacity-0 dark:opacity-100 animate-pulse-slow transition-opacity duration-1000"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 pt-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-4 py-3 shadow-light-md">
           <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-darkOrange dark:from-neural-cyan dark:to-blue-600 flex items-center justify-center text-white shadow-lg">
               <Fuel size={20} fill="currentColor" className="opacity-90" />
             </div>
             <span className="text-xl font-sans font-semibold tracking-tight text-gray-900 dark:text-white dark:font-mono">
               Fuel<span className="text-brand-orange dark:text-neural-cyan">Track.</span>
             </span>
           </div>

           <div className="flex items-center gap-3 md:gap-4">
             <button 
               onClick={toggleTheme}
               className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300 btn-press"
               aria-label="Toggle Theme"
             >
               {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <button onClick={() => onNavigate('login')} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1 btn-press">
               <LogIn size={18} />
               <span>Log In</span>
             </button>
             
             <button onClick={() => onNavigate('signup')} className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 md:px-6 py-2.5 rounded-full font-medium text-sm shadow-xl hover:shadow-2xl btn-press transition-all duration-300">
               Get Started
             </button>
           </div>
        </div>
      </nav>
      
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-center min-h-[70vh] glow-panel p-6 md:p-10 rounded-3xl">
          
          {/* Hero Copy */}
          <div className="flex-1 reveal-on-scroll delay-100 lg:max-w-xl text-center lg:text-left z-20">
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-gray-900 dark:text-white mb-8 tracking-tighter">
              <span className="font-sans font-bold block mb-2">FuelTrack —</span>
              <span className="font-serif italic font-normal text-brand-orange dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-neural-cyan dark:to-neural-purple block pb-2">Smarter Fuel,<br/>Happier Rides</span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed mb-10 font-sans dark:font-mono font-light">
              Track fuel, monitor efficiency and manage fleet costs with clear analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-12 items-center justify-center lg:justify-start">
              <button onClick={() => onNavigate('dashboard')} className="group bg-gradient-to-r from-orange-400 to-orange-600 dark:from-neural-cyan dark:to-blue-600 text-white dark:text-black px-8 py-4 rounded-full font-sans dark:font-mono text-medium font-medium shadow-glow dark:shadow-neon-cyan hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-press">
                Explore Dashboard
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                   {indianFaces.map((src, i) => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gray-200 dark:bg-gray-800 shadow-sm overflow-hidden hover:scale-110 transition-transform">
                       <img src={src} alt="User" className="w-full h-full rounded-full object-cover" />
                     </div>
                   ))}
                 </div>
                 <div className="text-sm font-medium text-gray-800 dark:text-gray-300">
                   <div className="flex text-brand-orange dark:text-neural-cyan mb-0.5">
                     {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                   </div>
                   2,400+ Active Fleets
                 </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono font-medium">
               <div className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                 <Lock size={12} /> ENCRYPTED
               </div>
               <div className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 flex items-center gap-2">
                 <Server size={12} /> 99.9% UPTIME
               </div>
            </div>
          </div>

          {/* Premium Hero Visual */}
          <div className="flex-1 relative w-full flex items-center justify-center perspective-1000 min-h-[500px] lg:min-h-[650px] py-12">
             
             {/* 1. Desktop Dashboard Card (Behind) */}
             <div className="relative w-full max-w-[640px] aspect-[16/10] bg-white/90 dark:bg-[#0B0F12]/90 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl z-10 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 flex flex-col overflow-hidden group">
                {/* Desktop Header */}
                <div className="h-14 border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-6 bg-white/50 dark:bg-white/5">
                   <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-brand-orange/10 dark:bg-neural-cyan/10 rounded-lg text-brand-orange dark:text-neural-cyan">
                         <BarChart3 size={16} />
                      </div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">Fuel Overview</span>
                   </div>
                   <div className="flex gap-3 items-center">
                      <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Monthly Report
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 border border-white dark:border-black"></div>
                        <div className="w-6 h-6 rounded-full bg-blue-500 border border-white dark:border-black"></div>
                      </div>
                   </div>
                </div>

                {/* Desktop Content */}
                <div className="p-6 flex-1 flex flex-col gap-6">
                   {/* Stats Row */}
                   <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Total Spend', val: '$2,450.00', trend: '+12%', color: 'text-green-500', icon: <Zap size={12}/> },
                        { label: 'Avg Price', val: '$3.85', trend: '-2.1%', color: 'text-orange-500', icon: <TrendingUp size={12}/> },
                        { label: 'Distance', val: '14,200 km', trend: '+5.4%', color: 'text-blue-500', icon: <Activity size={12}/> }
                      ].map((stat, i) => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 relative overflow-hidden group/card">
                           <div className="absolute top-0 right-0 p-2 opacity-50 group-hover/card:opacity-100 transition-opacity">
                             {stat.icon}
                           </div>
                           <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">{stat.label}</div>
                           <div className={`text-xl font-bold ${stat.color} mb-1`}>{stat.val}</div>
                           <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                             <span className={stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>{stat.trend}</span> 
                             vs last mo
                           </div>
                        </div>
                      ))}
                   </div>

                   {/* Chart Area */}
                   <div className="flex-1 bg-gradient-to-b from-gray-50 to-white dark:from-white/5 dark:to-transparent rounded-xl border border-gray-100 dark:border-white/5 p-5 relative">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Efficiency Trends</div>
                        <MoreHorizontal size={16} className="text-gray-300" />
                      </div>
                      
                      {/* Simulated Chart */}
                      <div className="absolute inset-x-5 bottom-5 top-12 flex items-end justify-between gap-2">
                         {[35, 55, 45, 70, 60, 85, 75, 65, 90, 80].map((h, i) => (
                            <div key={i} className="w-full bg-brand-orange/10 dark:bg-neural-cyan/10 rounded-t-sm relative group-hover:scale-y-105 transition-transform origin-bottom duration-500 flex flex-col justify-end" style={{ height: `${h}%` }}>
                               <div className="w-full h-full bg-gradient-to-t from-brand-orange/20 to-brand-orange/60 dark:from-neural-cyan/20 dark:to-neural-cyan/60 rounded-t-sm relative overflow-hidden">
                                  <div className="absolute top-0 w-full h-[2px] bg-brand-orange dark:bg-neural-cyan shadow-[0_0_10px_currentColor]"></div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* 2. Mobile Mockup (Front) - RESIZED & CENTERED */}
             <div className="absolute -right-4 -bottom-8 lg:-bottom-6 lg:-right-8 w-[200px] h-[400px] bg-[#0B0F12] rounded-[2.5rem] border-[6px] border-[#1a1a1a] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] z-20 animate-float overflow-hidden flex flex-col ring-1 ring-white/10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1a1a1a] rounded-b-xl z-30"></div>
                
                {/* Mobile Header */}
                <div className="h-24 bg-gradient-to-br from-brand-orange to-red-600 dark:from-neural-cyan dark:to-blue-600 p-5 flex flex-col justify-end relative overflow-hidden shrink-0">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                   <div className="relative z-10 flex justify-between items-end">
                      <div>
                        <h3 className="text-white font-bold text-lg leading-none mb-1">Quick Logs</h3>
                        <p className="text-white/80 text-[10px] font-medium tracking-wide">Recent Activity</p>
                      </div>
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                         <Calendar size={14} className="text-white" />
                      </div>
                   </div>
                </div>

                {/* Mobile Content List */}
                <div className="bg-[#0B0F12] flex-1 p-3 space-y-2.5 relative overflow-hidden">
                   {[
                     { station: 'Shell Station', date: 'Today, 9:41 AM', cost: '$45.00', vol: '12.5L' },
                     { station: 'BP Connect', date: 'Yesterday', cost: '$32.50', vol: '8.2L' },
                     { station: 'Chevron', date: 'Oct 24', cost: '$55.00', vol: '15.1L' },
                     { station: 'Texaco', date: 'Oct 20', cost: '$28.00', vol: '7.5L' },
                   ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/item">
                         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-gray-400 group-hover/item:text-brand-orange dark:group-hover/item:text-neural-cyan transition-colors">
                            <Fuel size={14} />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-white text-xs font-bold truncate">{item.station}</div>
                            <div className="text-gray-500 text-[9px]">{item.date}</div>
                         </div>
                         <div className="text-right">
                            <div className="text-white font-mono text-xs font-bold">{item.cost}</div>
                            <div className="text-gray-500 text-[9px]">{item.vol}</div>
                         </div>
                      </div>
                   ))}
                   
                   {/* Gradient Fade at bottom */}
                   <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0B0F12] to-transparent pointer-events-none"></div>
                </div>

                {/* Floating Action Button */}
                <div className="absolute bottom-6 right-6 w-12 h-12 bg-brand-orange dark:bg-neural-cyan rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] dark:shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center text-white dark:text-black z-30 cursor-pointer hover:scale-110 transition-transform">
                   <Plus size={24} strokeWidth={3} />
                </div>
             </div>

          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 lg:mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
           {features.map((feature, i) => (
             <div 
               key={i} 
               className={`glow-panel reveal-on-scroll p-8 rounded-3xl group card-hover`}
               style={{ transitionDelay: `${i * 150}ms` }}
             >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1a1a1a] icon-halo flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 border border-orange-50 dark:border-white/5 text-brand-orange dark:text-neural-cyan icon-halo-anim">
                  {feature.icon}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold font-serif dark:font-sans text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">{feature.desc}</p>
                  
                  {expandedCard === i ? (
                     <div className="animate-fade-in-up text-xs text-gray-500 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-black/30 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                        {feature.moreInfo}
                     </div>
                  ) : null}

                  <button 
                    onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                    className="text-xs font-bold tracking-widest uppercase text-brand-orange dark:text-neural-cyan flex items-center gap-2 group-hover:gap-3 transition-all hover:text-orange-600 dark:hover:text-cyan-300"
                  >
                    {expandedCard === i ? 'Show Less' : 'Learn more'} <ChevronRight size={14} className={expandedCard === i ? "rotate-90 transition-transform" : "transition-transform"} />
                  </button>
                </div>
             </div>
           ))}
        </div>
      </main>
      
      <footer className="relative z-10 border-t border-gray-100 dark:border-glass-border py-12 mt-24 bg-white dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-mono gap-4">
           <div className="flex items-center gap-2">
             <span>&copy; 2025 FUELTRACK INC.</span>
             <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
             <span className="hidden md:inline">Secure, encrypted, and privacy-focused. Your data is protected.</span>
           </div>
           <div className="flex gap-6">
             <button onClick={() => onNavigate('privacy')} className="hover:text-brand-orange transition-colors">PRIVACY</button>
             <button onClick={() => onNavigate('terms')} className="hover:text-brand-orange transition-colors">TERMS</button>
           </div>
        </div>
      </footer>
    </div>
  );
};