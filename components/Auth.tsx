import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { Fuel, ArrowLeft, Lock, Mail, User, Phone, Building2 } from 'lucide-react';
import { supabase, hashPassword } from '../lib/supabase';

interface AuthProps {
  mode: 'login' | 'signup';
  onNavigate: (view: ViewState) => void;
  onLogin?: (email: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ mode, onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    organization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear messages when mode changes
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setFormData(prev => ({ ...prev, password: '' })); // Optional: clear password on switch
  }, [mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Normalize email to prevent case-sensitivity issues
    const normalizedEmail = formData.email.toLowerCase().trim();

    try {
      const hashedPassword = await hashPassword(formData.password);

      if (mode === 'signup') {
        const { error: insertError } = await supabase
          .from('app_users')
          .insert([
            {
              email: normalizedEmail,
              password_hash: hashedPassword,
              first_name: formData.firstName.trim(),
              last_name: formData.lastName.trim(),
              phone: formData.phone.trim(),
              organization: formData.organization.trim(),
            }
          ]);

        if (insertError) {
          if (insertError.code === '23505') { // Unique violation
             throw new Error('An account with this email already exists.');
          }
          throw insertError;
        }

        setSuccessMsg('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else {
        // Login Logic
        // Use maybeSingle() to handle 0 rows gracefully without throwing
        const { data: user, error: fetchError } = await supabase
          .from('app_users')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (fetchError) {
          console.error('Supabase Auth Error:', fetchError);
          throw new Error('Unable to connect to authentication service.');
        }

        if (!user) {
          // User not found
          throw new Error('Account does not exist. Please Sign Up.');
        }

        if (user.password_hash === hashedPassword) {
          if (onLogin) onLogin(user.email);
          onNavigate('dashboard');
        } else {
          // Hash mismatch
          throw new Error('Invalid password.');
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-light dark:bg-obsidian transition-colors duration-500 relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute inset-0 bg-mesh-gradient-light opacity-100 dark:opacity-0 transition-opacity"></div>
       <div className="absolute inset-0 bg-mesh-gradient opacity-0 dark:opacity-100 animate-pulse-slow transition-opacity"></div>
       
       <button 
         onClick={() => onNavigate('landing')}
         className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors z-20 btn-press"
       >
         <ArrowLeft size={16} /> Back
       </button>

       <div className="w-full max-w-lg relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-black/50 p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-glass-border">
              <Fuel size={32} className="text-brand-orange dark:text-neural-cyan" />
            </div>
          </div>

          <div className="glow-panel p-8 md:p-10 backdrop-blur-xl transition-all duration-500 modal-enter">
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white font-serif dark:font-mono">
              {mode === 'login' ? 'Welcome Back' : 'Initialize Fleet Account'}
            </h2>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8 font-sans dark:font-mono">
              {mode === 'login' ? 'Access your fleet telemetry.' : 'Join 2,400+ fleets optimizing costs today.'}
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm text-center font-medium animate-pulse">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400 text-sm text-center font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          type="text" 
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan focus:border-transparent outline-none transition-all font-sans dark:font-mono text-sm"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          type="text" 
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan focus:border-transparent outline-none transition-all font-sans dark:font-mono text-sm"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Phone</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          type="tel" 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan focus:border-transparent outline-none transition-all font-sans dark:font-mono text-sm"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Organization</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          name="organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                          type="text" 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan focus:border-transparent outline-none transition-all font-sans dark:font-mono text-sm"
                          placeholder="Acme Logistics"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan focus:border-transparent outline-none transition-all font-sans dark:font-mono text-sm"
                    placeholder="pilot@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange dark:focus:ring-neural-cyan focus:border-transparent outline-none transition-all font-sans dark:font-mono text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-orange dark:bg-neural-cyan text-white dark:text-black font-bold rounded-xl shadow-lg dark:shadow-neon-cyan hover:opacity-90 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center btn-press"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                   mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  onNavigate(mode === 'login' ? 'signup' : 'login');
                }}
                className="text-brand-orange dark:text-neural-cyan font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
       </div>
    </div>
  );
};