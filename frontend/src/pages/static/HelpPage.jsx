import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, MessageSquare, Mail, PhoneCall } from 'lucide-react';

const FAQS = [
  {
    category: 'Tenants',
    questions: [
      { q: "How do I book a property visit?", a: "Once you find a property you like, click 'Book Visit' on its page. Select an available date and time. The landlord will review your request and confirm. You'll be notified immediately." },
      { q: "Is TrustRent completely free for tenants?", a: "Yes, browsing properties, saving them securely, and requesting visits is 100% free for tenants." },
      { q: "What does the Trust Score mean?", a: "The Trust Score (rated out of 5) comes directly from actual reviews written by verified users after property visits or tenancies. High trust scores indicate reliable behavior." },
    ]
  },
  {
    category: 'Landlords',
    questions: [
      { q: "How are my properties verified?", a: "To maintain the integrity of our platform, all landlords must be Aadhaar-verified. This assures tenants that they are interacting with the legitimate owner or manager." },
      { q: "Can I decline a visit request?", a: "Absolutely. Once a tenant requests a visit, you will review their profile and trust score. You retain complete control to 'Accept' or 'Decline' any request." },
      { q: "How much does it cost to list?", a: "Listing your properties on TrustRent is entirely free during our current phase." },
    ]
  },
  {
    category: 'General',
    questions: [
      { q: "How is my data protected?", a: "We employ strictly encrypted, modern storage. Your phone number is hidden from others prior to an accepted visit. Aadhaar data is hashed and practically inaccessible." },
      { q: "How do I report a fake listing?", a: "If you detect anomalies, report them immediately via our support contacts below. We take swift action against bad actors." },
    ]
  }
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('Tenants');
  const [openQs, setOpenQs] = useState({});

  const toggleQ = (index) => {
    setOpenQs(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const currentFaqs = FAQS.find(f => f.category === activeCategory)?.questions || [];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <section className="bg-primary/5 py-16 text-center border-b border-primary/10">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">How can we help?</h1>
          <p className="text-gray-500 mb-8">Search our FAQs or get in touch with our team.</p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">Frequently Asked Questions</h2>
        
        {/* Category Toggles */}
        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {FAQS.map(c => (
            <button
              key={c.category}
              onClick={() => { setActiveCategory(c.category); setOpenQs({}); }}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-colors whitespace-nowrap border ${
                activeCategory === c.category 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {c.category}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {currentFaqs.map((faq, idx) => {
            const isOpen = openQs[idx];
            return (
              <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleQ(idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors focus:outline-none"
                >
                  <span className="font-bold text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-6 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-100/50 bg-gray-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center md:text-left">
          <div className="md:flex items-center justify-between">
            <div className="mb-8 md:mb-0 max-w-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Still need help?</h2>
              <p className="text-gray-600 mb-6">If you couldn't find the answer to your question, our support team is available to assist you directly.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="mailto:support@trustrent.in" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                  <Mail className="w-4 h-4 text-primary" /> support@trustrent.in
                </a>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                  <PhoneCall className="w-4 h-4 text-accent" /> 1800-TRUST-RENT
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                 <MessageSquare className="w-12 h-12 md:w-20 md:h-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
