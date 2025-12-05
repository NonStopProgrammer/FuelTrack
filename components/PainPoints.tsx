import React from 'react';
import { Clock, TrendingUp, Layers, Zap } from 'lucide-react';
import { TestimonialProps } from '../types';

const PainPointCard: React.FC<TestimonialProps & { icon: React.ReactNode }> = ({ category, quote, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center gap-2 mb-4 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
      {icon}
      {category}
    </div>
    <p className="text-gray-600 text-sm leading-relaxed">"{quote}"</p>
  </div>
);

export const PainPoints: React.FC = () => {
  return (
    <section className="bg-gray-50 py-32">
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-6">
          The Bottleneck
        </div>
        <h2 className="text-4xl md:text-5xl font-medium text-gray-900 mb-6 tracking-tight">
          Struggling with slow, expensive <br className="hidden md:block" />
          neural rollouts?
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Most teams waste months wiring infrastructure, approvals, and data pipelines before a single model reaches production.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PainPointCard 
          icon={<Clock size={12} />}
          category="Time-To-Value"
          quote="New clients expect their first neural pilot in under 48 hours, not next quarter."
        />
        <PainPointCard 
          icon={<Layers size={12} />}
          category="Service Margin"
          quote="Our data science onboarding costs are crushing margin — we need at least a 35% efficiency gain."
        />
        <PainPointCard 
          icon={<Zap size={12} />}
          category="Demo Velocity"
          quote="Prospects expect tailored neural sandboxes spun up in under 10 minutes during live calls."
        />
        <PainPointCard 
          icon={<TrendingUp size={12} />}
          category="Implementation"
          quote="We have to cut neural implementation timelines by 70% while keeping compliance intact."
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-gray-200">
        <p className="text-center text-xs font-bold tracking-widest text-gray-400 uppercase mb-8">
          Trusted to accelerate onboarding by teams at
        </p>
        <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
          <div className="flex items-center gap-2 font-semibold text-lg"><span className="text-2xl">github</span></div>
          <div className="flex items-center gap-2 font-bold text-lg">VXR Compute</div>
          <div className="flex items-center gap-2 font-bold text-lg">Stripe Neural</div>
          <div className="flex items-center gap-2 font-serif text-lg">Notion Systems</div>
        </div>
      </div>
    </section>
  );
};