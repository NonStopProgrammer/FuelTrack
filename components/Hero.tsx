import React from 'react';
import { ArrowRight, Star, Cloud, Database, Slack } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div className="z-10 animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl lg:text-8xl leading-[0.9] text-gray-900 mb-8 tracking-tighter">
            <span className="font-normal block">Neural</span>
            <span className="font-serif italic font-light block ml-2">Intelligence</span>
          </h1>
          
          <p className="text-gray-600 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
            AI consulting redefined with next-gen neural networks. We craft tailored algorithms to supercharge your digital transformation and automate complex workflows.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12">
            <button className="bg-gradient-to-r from-brand-orange to-orange-400 text-white px-8 py-4 rounded-full font-medium shadow-glow hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 group">
              Sign up free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex flex-col">
              <div className="flex -space-x-3 mb-1">
                 {[1, 2, 3].map((i) => (
                   <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-white"
                   />
                 ))}
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                <div className="flex text-brand-orange">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
                <span>4.9/5 Customer Score</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <Slack size={24} />
             <Database size={24} />
             <Cloud size={24} />
             <span className="font-bold text-lg tracking-widest">STRIPE</span>
          </div>
        </div>

        {/* Right Image / Visual */}
        <div className="relative z-10 hidden lg:block">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl group">
             {/* Background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 blur-[100px] pointer-events-none"></div>
             
             <img 
               src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000&auto=format&fit=crop" 
               alt="Neural Intelligence Visualization" 
               className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700 ease-out"
             />

             {/* Floating UI Card Overlay */}
             <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-white/70 uppercase tracking-widest mb-1">Prop Tech</div>
                    <div className="text-white text-lg font-medium">Valuation Models</div>
                  </div>
                  <span className="text-white/50 text-xs">02</span>
                </div>
                <div className="h-24 bg-gradient-to-t from-black/50 to-transparent rounded-lg relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" 
                      className="w-full h-full object-cover opacity-60"
                      alt="Data"
                    />
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-white/80">
                  <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></div>
                  Live industry playbooks powered by Neural Intelligence
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};