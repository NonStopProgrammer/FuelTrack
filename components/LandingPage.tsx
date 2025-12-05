import React, { useEffect, useState } from 'react';
import { 
  Fuel, TrendingUp, Gauge, Shield, ChevronRight, 
  ArrowRight, Star, Sun, Moon, CheckCircle2, LogIn, Server, Lock, Globe,
  Map, Zap
} from 'lucide-react';
import { ViewState } from '../types';

interface LandingProps {
  onNavigate: (view: ViewState) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onNavigate, isDark, toggleTheme }) => {
  // Simple intersection observer for scroll animations
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center min-h-[70vh]">
          
          <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-100">
            <h1 className="text-6xl lg:text-8xl leading-[0.9] text-gray-900 dark:text-white mb-8 tracking-tighter">
              <span className="font-sans font-light block mb-2">Master Your</span>
              <span className="font-serif italic font-normal text-brand-orange dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-neural-cyan dark:to-neural-purple block pb-2">Fleet Operations</span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl max-w-lg leading-relaxed mb-10 font-sans dark:font-mono font-light">
              Eliminate mileage guesswork. FuelTrack automates telemetry data, detects cost leaks, and ensures 100% tax compliance with zero manual entry.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-12 items-start sm:items-center">
              <button onClick={() => onNavigate('signup')} className="group bg-gradient-to-r from-orange-400 to-orange-600 dark:from-neural-cyan dark:to-blue-600 text-white dark:text-black px-8 py-4 rounded-full font-sans dark:font-mono text-medium font-medium shadow-glow dark:shadow-neon-cyan hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                Start Tracking Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gray-200 dark:bg-gray-800">
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
            
            {/* Trust Badges - Styled as System Status Indicators */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-medium">
               <div className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                 <Lock size={12} /> SOC2 COMPLIANT
               </div>
               <div className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 flex items-center gap-2">
                 <Server size={12} /> IRS READY
               </div>
               <div className="px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 flex items-center gap-2">
                 <Globe size={12} /> GPS SYNC ACTIVE
               </div>
            </div>
          </div>

          {/* Hero Visual - Phone Mockup (Kept as is) */}
          <div className="relative perspective-1000 h-[600px] flex items-center justify-center reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-300">
             <div className="absolute inset-0 bg-brand-yellow dark:bg-neural-cyan/20 blur-[100px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>
             <div className="relative w-[300px] md:w-[340px] h-[600px] bg-black rounded-[3rem] p-3 shadow-2xl border-4 border-gray-100 dark:border-gray-800 rotate-y-[-10deg] hover:rotate-y-0 transition-transform duration-700 ease-out animate-float">
                <div className="w-full h-full bg-white dark:bg-black rounded-[2.5rem] overflow-hidden relative border border-gray-800">
                  <div className="absolute top-0 left-0 right-0 h-14 z-20 flex justify-between px-6 pt-5 text-[10px] font-medium text-gray-500">
                    <span>9:41</span>
                    <div className="flex gap-1 items-center">
                      <div className="w-3 h-3 rounded-full bg-black dark:bg-white/20"></div>
                      <div className="w-4 h-2.5 rounded-sm border border-gray-300 dark:border-gray-700"></div>
                    </div>
                  </div>
                  <div className="pt-14 px-4 h-full bg-gray-50 dark:bg-[#0a0a0a]">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Savings</div>
                        <div className="text-2xl font-bold font-serif dark:font-mono text-gray-900 dark:text-white">$1,240.50</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-brand-orange dark:bg-neural-cyan/20 flex items-center justify-center text-white dark:text-neural-cyan">
                        <Fuel size={18} />
                      </div>
                    </div>
                    <div className="h-40 w-full bg-white dark:bg-white/5 rounded-2xl mb-6 p-4 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                       <img 
                         src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop" 
                         className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-40 mix-blend-overlay"
                         alt="Chart"
                       />
                       <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between h-20 gap-2">
                          {[40, 60, 35, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-brand-orange dark:bg-neural-cyan rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recent Trips</div>
                      {[
                        { dest: "San Francisco", dist: "42.5 mi", cost: "$12.40" },
                        { dest: "Palo Alto HQ", dist: "18.2 mi", cost: "$5.80" },
                        { dest: "Airport Run", dist: "32.0 mi", cost: "$9.15" }
                      ].map((trip, i) => (
                        <div key={i} className="bg-white dark:bg-white/5 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex justify-between items-center">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500">
                               <Map size={14} />
                             </div>
                             <div>
                               <div className="text-sm font-bold text-gray-900 dark:text-white">{trip.dest}</div>
                               <div className="text-[10px] text-gray-500">{trip.dist}</div>
                             </div>
                           </div>
                           <div className="text-xs font-bold font-mono text-gray-900 dark:text-white">{trip.cost}</div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-6 right-6 w-12 h-12 bg-gray-900 dark:bg-neural-cyan rounded-full shadow-lg flex items-center justify-center text-white dark:text-black">
                      <Zap size={20} />
                    </div>
                  </div>
                </div>
             </div>
          </div>

        </div>

        {/* Features Grid - Enhanced */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
           {features.map((feature, i) => (
             <div 
               key={i} 
               className={`reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out p-8 rounded-3xl border border-gray-100 dark:border-white/10 hover:shadow-card dark:hover:shadow-neon-cyan/20 relative overflow-hidden group bg-white dark:bg-white/5`}
               style={{ transitionDelay: `${i * 100}ms` }}
             >
                {/* Background Decoration - Glow Behind Icon */}
                <div className="absolute top-10 left-8 w-20 h-20 bg-brand-orange/20 rounded-full blur-2xl opacity-100 dark:opacity-0 transition-opacity"></div>
                <div className="absolute top-10 left-8 w-20 h-20 bg-neural-cyan/20 rounded-full blur-2xl opacity-0 dark:opacity-100 transition-opacity"></div>

                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-orange-glow dark:shadow-cyan-glow flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 border border-orange-100 dark:border-white/10 text-brand-orange dark:text-neural-cyan">
                  {feature.icon}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold font-serif dark:font-sans text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">{feature.desc}</p>
                  
                  {expandedCard === i ? (
                     <div className="animate-fade-in-up text-xs text-gray-500 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
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