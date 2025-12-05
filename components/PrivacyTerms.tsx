import React from 'react';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

interface PrivacyTermsProps {
  mode: 'privacy' | 'terms';
  onBack: () => void;
}

export const PrivacyTerms: React.FC<PrivacyTermsProps> = ({ mode, onBack }) => {
  return (
    <div className="min-h-screen bg-brand-light dark:bg-obsidian text-gray-900 dark:text-white font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-orange transition-colors mb-8 btn-press"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="glow-panel p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-white/10 pb-6">
            <div className="p-3 bg-brand-orange/10 dark:bg-neural-cyan/10 rounded-xl icon-halo text-brand-orange dark:text-neural-cyan">
              {mode === 'privacy' ? <Shield size={28} /> : <FileText size={28} />}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif dark:font-mono">
              {mode === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
          </div>

          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed space-y-6">
            {mode === 'privacy' ? (
              <>
                <p><strong>Effective Date:</strong> October 24, 2025</p>
                <p>At FuelTrack, we prioritize the security and privacy of your fleet data. This policy outlines how we collect, use, and protect your information.</p>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">1. Data Collection</h3>
                <p>We collect vehicle telemetry data, fuel logs, and user profile information solely for the purpose of providing analytics and fleet management services.</p>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">2. Data Security</h3>
                <p>All data is encrypted at rest and in transit using industry-standard TLS 1.3 and AES-256 encryption protocols. We do not sell your data to third parties.</p>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">3. User Rights</h3>
                <p>You have the right to export your data or request complete account deletion at any time through the dashboard settings.</p>
              </>
            ) : (
              <>
                <p><strong>Last Updated:</strong> October 24, 2025</p>
                <p>By accessing FuelTrack, you agree to be bound by these Terms of Service.</p>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">1. Usage License</h3>
                <p>FuelTrack grants you a limited, non-exclusive, non-transferable license to use the platform for personal or commercial fleet management purposes.</p>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">2. Acceptable Use</h3>
                <p>You agree not to misuse the platform or attempt to access data that does not belong to you. Automated scraping of the dashboard is prohibited.</p>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8">3. Limitation of Liability</h3>
                <p>FuelTrack is provided "as is". We are not liable for any indirect damages arising from the use of our service, including fuel calculation discrepancies.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};