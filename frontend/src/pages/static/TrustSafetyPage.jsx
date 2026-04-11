import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, Lock, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-tr from-primary-dark via-primary to-teal-500 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-teal-100" />
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Trust & Safety at TrustRent</h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Your safety is our priority. Discover how we create a secure environment for both tenants and landlords.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 -mt-10 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Identity Verification</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We stringently verify landlords before they can list. We utilize government-issued ID checks (Aadhaar) to ensure properties belong to real people.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust Scores</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Both parties are rated after visits and tenancies. Higher trust scores mean more visibility. Bad actors are swiftly removed from our ecosystem.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Privacy</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your personal details, phone numbers, and documents are securely encrypted. We only share exactly what is needed for a property visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-10 text-center">How We Keep You Safe</h2>
          
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3">
                <h4 className="text-xl font-bold text-gray-900">For Tenants</h4>
              </div>
              <div className="md:w-2/3 space-y-4">
                <div className="flex gap-4">
                  <div className="mt-1"><ShieldCheck className="w-5 h-5 text-primary" /></div>
                  <div>
                    <h5 className="font-bold text-gray-900 mb-1">No Fake Listings</h5>
                    <p className="text-sm text-gray-600">Landlords must verify their mobile and Aadhaar. This severely mitigates scam listings and bait-and-switch tactics.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1"><ShieldCheck className="w-5 h-5 text-primary" /></div>
                  <div>
                    <h5 className="font-bold text-gray-900 mb-1">Spam-Free Browsing</h5>
                    <p className="text-sm text-gray-600">Your phone number is completely masked until you securely request a property visit through our platform.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3">
                <h4 className="text-xl font-bold text-gray-900">For Landlords</h4>
              </div>
              <div className="md:w-2/3 space-y-4">
                <div className="flex gap-4">
                  <div className="mt-1"><ShieldCheck className="w-5 h-5 text-accent" /></div>
                  <div>
                    <h5 className="font-bold text-gray-900 mb-1">Qualified Leads</h5>
                    <p className="text-sm text-gray-600">Stop dealing with endless casual inquiries. Tenants requesting a visit are serious and must hold a valid platform account.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1"><ShieldCheck className="w-5 h-5 text-accent" /></div>
                  <div>
                    <h5 className="font-bold text-gray-900 mb-1">Complete Control</h5>
                    <p className="text-sm text-gray-600">You decide exactly who visits your property. Review tenant profiles and their trust score before accepting visit requests.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 flex items-start gap-6">
          <div className="hidden sm:block">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">Platform Safety Guidelines</h3>
            <ul className="list-disc list-inside space-y-2 text-amber-800/80 text-sm">
              <li>Never wire money or pay deposits before viewing a property and signing a lease.</li>
              <li>Keep all communication within the TrustRent platform initially.</li>
              <li>Report any suspicious listings or users utilizing the flag feature.</li>
              <li>TrustRent will never call you asking for OTPs or passwords.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center mt-20">
         <p className="text-gray-500 mb-6">Have more questions about our safety protocols?</p>
         <Link to="/help" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
            Visit our Help Centre <ChevronRight className="w-4 h-4" />
         </Link>
      </section>
    </div>
  );
}
