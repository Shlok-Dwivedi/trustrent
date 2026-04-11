import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Search, CalendarDays, Star, Home, Shield } from 'lucide-react';

const STEPS = [
  { icon: UserCheck, title: 'Verify Yourself', desc: 'Sign up with your phone number and optionally verify with Aadhaar to build your trust score.', color: 'bg-blue-50 text-blue-600' },
  { icon: Search, title: 'Discover Properties', desc: 'Browse properties on an interactive map. Filter by rent, BHK, location, and verified-only listings.', color: 'bg-teal-50 text-teal-600' },
  { icon: CalendarDays, title: 'Book a Visit', desc: 'Found something you like? Book a visit directly. The landlord gets notified instantly via SMS.', color: 'bg-amber-50 text-amber-600' },
  { icon: Shield, title: 'Visit with Confidence', desc: 'Both parties are verified. You know who you\'re meeting. No surprises, no fake identities.', color: 'bg-green-50 text-green-600' },
  { icon: Star, title: 'Review & Rate', desc: 'After your visit, leave an honest review. This builds the trust ecosystem for everyone.', color: 'bg-purple-50 text-purple-600' },
  { icon: Home, title: 'Move In', desc: 'Found your match? Connect directly with the landlord and finalize your rental. Welcome home!', color: 'bg-rose-50 text-rose-600' },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-dark via-primary to-teal-500 text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">How TrustRent Works</h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            From verification to moving in — your journey in 6 simple steps.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-0">
            {STEPS.map((step, idx) => (
              <div key={step.title} className="flex gap-6 group">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center shrink-0 font-bold text-lg shadow-sm border border-gray-100`}>
                    {idx + 1}
                  </div>
                  {idx < STEPS.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-2"></div>}
                </div>
                {/* Content */}
                <div className="pb-12">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/search" className="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-full transition-colors shadow-md inline-block">
              Start Exploring →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
