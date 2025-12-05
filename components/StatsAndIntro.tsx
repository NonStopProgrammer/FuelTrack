import React from 'react';
import { Send, Cpu, Zap, BarChart } from 'lucide-react';
import { ServiceCardProps } from '../types';

const ServiceCard: React.FC<ServiceCardProps> = ({ title, icon }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-64 group relative overflow-hidden">
     {/* Decorative subtle background blob */}
     <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-yellow/30 rounded-full blur-2xl transition-all group-hover:scale-150"></div>

    <div className="relative z-10">
      <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center text-brand-orange mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-gray-900 w-2/3 leading-tight">{title}</h3>
    </div>
    
    <button className="relative z-10 bg-brand-yellow text-gray-900 text-sm font-medium py-3 px-5 rounded-full self-start flex items-center gap-2 hover:bg-orange-200 transition-colors w-full justify-between group-hover:translate-y-0 translate-y-2 opacity-90 group-hover:opacity-100">
      Talk With Us
      <Send size={14} className="-rotate-45" />
    </button>
  </div>
);

export const StatsAndIntro: React.FC = () => {
  return (
    <section className="bg-brand-gray/30 py-24">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div>
            <p className="text-3xl md:text-4xl font-light leading-snug text-gray-800">
              We are pioneers in <span className="text-brand-orange font-normal">Machine Learning</span>, dedicated to helping businesses harness the power of artificial intelligence to drive innovation, efficiency, and growth.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-y-10 gap-x-8">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-1">2M</div>
              <div className="text-sm text-gray-500">Users benefiting from our AI-powered solutions globally</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-1">4.9<span className="text-2xl text-gray-400 font-normal">/5</span></div>
              <div className="text-sm text-gray-500">Average rating across all AI-driven applications</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-1">35%</div>
              <div className="text-sm text-gray-500">Faster decision-making with neural recommendations</div>
            </div>
             <div>
              <div className="text-4xl font-bold text-gray-900 mb-1">99.9%</div>
              <div className="text-sm text-gray-500">Uptime guarantee for seamless AI experience</div>
            </div>
          </div>
        </div>

        {/* Services Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceCard title="Automation Machine Learning" icon={<Cpu size={20} />} />
          <ServiceCard title="AI-Powered Chatbots" icon={<Zap size={20} />} />
          <ServiceCard title="Data Analytics Deep Insights" icon={<BarChart size={20} />} />
        </div>

      </div>
    </section>
  );
};
