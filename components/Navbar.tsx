import React, { useState, useEffect } from 'react';
import { Search, Code2, LogIn } from 'lucide-react';
import { NavItem, ViewState } from '../types';

const navItems: NavItem[] = [
  { label: 'About Us', id: '#about' },
  { label: 'Solutions', id: '#solutions' },
  { label: 'Case Studies', id: '#cases' },
  { label: 'Industries', id: '#industries' },
];

interface NavbarProps {
  onNavigate?: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => onNavigate?.('landing')}>
          <div className="bg-brand-orange text-white p-1 rounded-md transition-transform group-hover:rotate-12">
            <Code2 size={16} strokeWidth={3} />
          </div>
          <span className="font-semibold text-lg tracking-tight text-gray-900">FuelTrack.</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a 
              key={item.label} 
              href={item.id}
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:text-black transition-colors rounded-full hover:bg-gray-100">
            <Search size={18} />
          </button>
          <button 
            onClick={() => onNavigate?.('login')}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-orange transition-colors"
          >
            <LogIn size={16} />
            Login
          </button>
          <button 
            onClick={() => onNavigate?.('signup')}
            className="hidden md:block px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};