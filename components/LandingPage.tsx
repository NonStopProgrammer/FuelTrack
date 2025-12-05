import React, { useEffect, useState } from 'react';
import { 
  Fuel, TrendingUp, Gauge, Shield, ChevronRight, 
  ArrowRight, Star, Sun, Moon, LogIn, Server, Lock, Globe,
  Plus, Droplet
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
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
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
      desc: "Automated IRS-ready reports for tax season. Unified control plane for 1 to 10,000 vehicles.", 
      moreInfo: "Export standard CSV/PDF reports formatted specifically for tax deduction compliance.",
      icon: <Shield /> 
    }
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
               className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
               aria-label="Toggle Theme"
             >
               {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <button onClick={() => onNavigate('login')} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1">
               <LogIn size={18} />
               <span>Log In</span>
             </button>
             
             <button onClick={() => onNavigate('signup')} className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 md:px-6 py-2.5 rounded-full font-medium text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
               Get Started
             </button>
           </div>
        </div>
      </nav>
      
      <main className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">
          
          <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-100">
            <h1 className="text-6xl lg:text-8xl leading-[1.0] text-gray-900 dark:text-white mb-8 tracking-tighter">
              <span className="font-sans font-bold block mb-2">FuelTrack —</span>
              <span className="font-serif italic font-normal text-brand-orange dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-neural-cyan dark:to-neural-purple block pb-2">Smarter Fuel,<br/>Happier Rides</span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl max-w-lg leading-relaxed mb-10 font-sans dark:font-mono font-light">
              Track fuel, monitor efficiency and manage fleet costs with clear analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-12 items-start sm:items-center">
              <button onClick={() => onNavigate('dashboard')} className="group bg-gradient-to-r from-orange-400 to-orange-600 dark:from-neural-cyan dark:to-blue-600 text-white dark:text-black px-8 py-4 rounded-full font-sans dark:font-mono text-medium font-medium shadow-glow dark:shadow-neon-cyan hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                Explore Dashboard
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gray-200 dark:bg-gray-800 shadow-sm overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full rounded-full" />
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
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-medium">
               <div className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                 <Lock size={12} /> SOC2 COMPLIANT
               </div>
               <div className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 flex items-center gap-2">
                 <Server size={12} /> IRS READY
               </div>
            </div>
          </div>

          {/* New Hero Visual - Desktop + Mobile Composition */}
          <div className="relative h-[600px] w-full flex items-center justify-center reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-300 pointer-events-none lg:pointer-events-auto">
             <div className="absolute inset-0 bg-brand-orange/5 dark:bg-neural-cyan/5 blur-[100px] rounded-full pointer-events-none"></div>
             
             {/* Desktop Preview Card */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[550px] glow-panel p-6 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700 z-10">
                {/* Mock Header */}
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 w-40 bg-gray-100 dark:bg-gray-600 rounded"></div>
                   </div>
                   <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5"></div>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5"></div>
                   </div>
                </div>
                
                {/* Mock KPI Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                   {[
                     { label: 'Total Spend', val: '$2,400', color: 'text-green-500' },
                     { label: 'Avg Price', val: '$3.45', color: 'text-orange-500' },
                     { label: 'Distance', val: '12k km', color: 'text-blue-500' }
                   ].map((item, i) => (
                     <div key={i} className="p-3 bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{item.label}</div>
                        <div className={`text-lg font-bold ${item.color}`}>{item.val}</div>
                     </div>
                   ))}
                </div>

                {/* Mock Chart Area */}
                <div className="h-40 bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-100 dark:border-white/5 p-4 flex items-end justify-between gap-2 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-orange/5 to-transparent"></div>
                   {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-brand-orange dark:bg-neural-cyan opacity-80 rounded-t-sm"></div>
                   ))}
                </div>
             </div>

             {/* Phone Mockup Overlay */}
             <div className="absolute -bottom-0 -right-8 w-[200px] bg-black rounded-[2.5rem] p-3 shadow-2xl border-4 border-gray-800 transform rotate-[5deg] hover:rotate-0 transition-transform duration-500 z-20">
                <div className="bg-[#111] rounded-[2rem] overflow-hidden aspect-[9/18] relative flex flex-col">
                   {/* Mobile Header */}
                   <div className="bg-brand-orange dark:bg-neural-cyan h-20 p-4 flex flex-col justify-end">
                      <div className="h-2 w-16 bg-white/40 rounded mb-1"></div>
                      <div className="h-4 w-24 bg-white rounded"></div>
                   </div>
                   
                   {/* Mobile List */}
                   <div className="p-3 space-y-3 flex-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                              <Fuel size={12} className="text-white"/>
                           </div>
                           <div className="flex-1">
                              <div className="h-2 w-12 bg-white/20 rounded mb-1"></div>
                              <div className="h-2 w-8 bg-white/10 rounded"></div>
                           </div>
                           <div className="h-3 w-8 bg-brand-orange dark:bg-neural-cyan rounded-md opacity-80"></div>
                        </div>
                      ))}
                   </div>
                   
                   {/* FAB */}
                   <div className="absolute bottom-6 right-4 w-12 h-12 bg-brand-orange dark:bg-neural-cyan rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <Plus size={20} strokeWidth={3} className="text-white dark:text-black"/>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
           {features.map((feature, i) => (
             <div 
               key={i} 
               className={`glow-panel reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out p-8 rounded-3xl group`}
               style={{ transitionDelay: `${i * 100}ms` }}
             >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1a1a1a] icon-halo flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 border border-orange-50 dark:border-white/5 text-brand-orange dark:text-neural-cyan">
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
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs text-gray-500 font-mono">
           <div>&copy; 2025 FUELTRACK INC.</div>
           <div className="flex gap-4">
             <a href="#" className="hover:text-brand-orange transition-colors">PRIVACY</a>
             <a href="#" className="hover:text-brand-orange transition-colors">TERMS</a>
           </div>
        </div>
      </footer>
    </div>
  );
};