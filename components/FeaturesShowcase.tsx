import React from 'react';
import { MoreHorizontal, Battery, Wifi, Signal } from 'lucide-react';

export const FeaturesShowcase: React.FC = () => {
  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Mobile UI Card */}
          <div className="bg-black rounded-[3rem] p-8 md:p-12 relative overflow-hidden min-h-[500px] flex items-center justify-center group">
             {/* Background glow effects */}
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-900/40 via-black to-black"></div>
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-orange/20 blur-[80px]"></div>

             <div className="relative z-10 w-full max-w-xs">
                {/* Phone Mockup */}
                <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-gray-800 p-4 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 mb-6 text-xs text-gray-400">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <Signal size={12} />
                      <Wifi size={12} />
                      <Battery size={12} />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-bold">CG</div>
                    <div>
                      <div className="text-[10px] text-gray-400">Welcome back</div>
                      <div className="text-sm font-medium text-white">Alex</div>
                    </div>
                  </div>

                  {/* Insight Card */}
                  <div className="bg-[#2a2a2a] rounded-2xl p-5 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand-orange/10 blur-xl"></div>
                    <div className="text-xs text-gray-400 mb-1">Weekly Insights</div>
                    <div className="text-3xl font-medium text-white mb-2">+24.5%</div>
                    <div className="inline-block bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded-full font-medium">
                      On Track vs last week
                    </div>
                  </div>

                  {/* List Items */}
                  <div className="space-y-3">
                     <div className="text-[10px] text-gray-500 font-semibold tracking-wider mb-2">RECENT MODELS</div>
                     {[1, 2].map((i) => (
                       <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-gray-800/50">
                         <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                           <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></div>
                         </div>
                         <div>
                           <div className="text-xs text-white">NLP Processor</div>
                           <div className="text-[10px] text-gray-500">v4.2 • Updated 2h ago</div>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
             </div>

             <div className="absolute top-8 right-8 text-xs font-mono text-gray-500 tracking-widest uppercase">Adaptive UI</div>
          </div>

          {/* Typography / Brand Card */}
          <div className="bg-gray-50 rounded-[3rem] p-12 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-10 right-10 text-xs font-bold tracking-widest text-gray-300 uppercase">Typography</div>
             <div className="absolute top-10 left-10 font-serif italic text-2xl text-gray-400">Aa</div>
             
             <div className="text-center z-10">
               <h2 className="text-6xl font-semibold text-gray-900 mb-4 tracking-tight">Cognitive.</h2>
               <div className="flex justify-center gap-4 text-sm text-gray-400 mb-12">
                 <span>Regular</span>
                 <span className="text-gray-900 font-medium">Medium</span>
                 <span className="font-semibold">Semibold</span>
               </div>
               
               {/* Decorative dots timeline */}
               <div className="flex items-center justify-center gap-8 md:gap-16 opacity-30">
                 {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="flex flex-col items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                     <div className="text-[10px] text-gray-400">{i * 10 + 20}</div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Bottom Card Preview */}
             <div className="absolute -bottom-20 left-10 right-10 bg-white rounded-t-3xl p-8 shadow-soft">
               <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                 <div className="font-mono text-xs text-gray-400 uppercase">Icons & Assets</div>
                 <MoreHorizontal size={16} className="text-gray-300" />
               </div>
               <div className="flex justify-around opacity-50">
                 <div className="w-10 h-10 bg-brand-orange/10 rounded-lg"></div>
                 <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                 <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};