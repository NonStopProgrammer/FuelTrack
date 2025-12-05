import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const FooterCTA: React.FC = () => {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1614728853913-1e221165651d?q=80&w=2000&auto=format&fit=crop" 
          alt="Mars Landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a1005] via-[#5c2312]/80 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
        <div className="inline-block px-3 py-1 mb-6 border border-white/20 rounded-full text-[10px] font-bold tracking-widest text-white/80 uppercase backdrop-blur-sm">
          Launch in days, not quarters
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl text-white font-medium mb-8 leading-tight">
          Ready to operationalize your <br/>
          <span className="font-serif italic text-white/90">neural stack?</span>
        </h2>
        
        <p className="text-white/70 mb-10 max-w-xl mx-auto text-lg">
          Join over 180 teams orchestrating models, data, and governance through a single, production-ready control plane.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-white text-gray-900 px-8 py-3.5 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
            Start sandbox workspace
            <ArrowUpRight size={16} />
          </button>
          <button className="px-8 py-3.5 rounded-full font-medium text-white border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-sm">
            Book a 20-minute turnkey review
          </button>
        </div>

        <div className="mt-12 flex justify-center gap-8 text-xs text-white/40 font-medium">
           <span className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
             Median go-live in 12 days
           </span>
           <span className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
             4.96 Implementation CSAT
           </span>
        </div>
      </div>
    </section>
  );
};
