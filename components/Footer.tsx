import React from 'react';
import { Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-black text-white p-1 rounded-md">
                 <Code2 size={14} />
              </div>
              <span className="font-bold text-gray-900">Cognitive Future</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">Neural Systems Studio</div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              We partner with product and platform teams to turn fragmented machine learning experiments into resilient, observable neural systems that compound value.
            </p>
          </div>

          <div>
             <h4 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">Product</h4>
             <ul className="space-y-4 text-sm text-gray-600">
               <li><a href="#" className="hover:text-brand-orange transition-colors">Neural Orchestrator</a></li>
               <li><a href="#" className="hover:text-brand-orange transition-colors">Data Contracts</a></li>
               <li><a href="#" className="hover:text-brand-orange transition-colors">Observability</a></li>
               <li><a href="#" className="hover:text-brand-orange transition-colors">Security Profiles</a></li>
             </ul>
          </div>

          <div>
             <h4 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">Resources</h4>
             <ul className="space-y-4 text-sm text-gray-600">
               <li><a href="#" className="hover:text-brand-orange transition-colors">Playbooks</a></li>
               <li><a href="#" className="hover:text-brand-orange transition-colors">Implementation Guide</a></li>
               <li><a href="#" className="hover:text-brand-orange transition-colors">Webinars</a></li>
               <li><a href="#" className="hover:text-brand-orange transition-colors">Status</a></li>
             </ul>
          </div>

          <div>
             <h4 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">Company</h4>
             <ul className="space-y-4 text-sm text-gray-600">
               <li><a href="#" className="hover:text-brand-orange transition-colors">Studio</a></li>
               <li><a href="#" className="hover:text-brand-orange transition-colors">Clients</a></li>
               <li><a href="#" className="hover:text-brand-orange transition-colors">Careers</a></li>
               <li><a href="#" className="hover:text-brand-orange transition-colors">Contact</a></li>
             </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 text-xs text-gray-400">
          <div>&copy; 2024 Cognitive Future Inc. All rights reserved.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
