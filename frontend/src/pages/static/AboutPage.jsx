import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Users, Star, Heart, MessageCircle } from 'lucide-react';
import { StarFill } from 'react-bootstrap-icons';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-teal-500 text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">About TrustRent</h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            We're building India's most trusted rental platform — where verified tenants meet verified landlords.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                India's rental market is broken. Tenants waste weeks visiting fake listings. Landlords deal with unreliable inquiries. There's no trust layer connecting the two sides.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                TrustRent fixes this by requiring both parties to verify their identity. Every landlord is Aadhaar-verified. Every interaction builds a transparent trust score. No more guessing — just genuine connections.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe that trust is the foundation of every good rental experience. When both sides feel secure, everyone wins.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, label: 'Identity Verified', value: '100%', desc: 'of landlords' },
                { icon: MapPin, label: 'Map-First', value: '10k+', desc: 'verified listings' },
                { icon: Users, label: 'Community', value: '50k+', desc: 'trust matches' },
                { icon: Star, label: 'Average Score', value: <span>4.3<StarFill className="inline ml-1 mb-1 text-accent" /></span>, desc: 'landlord rating' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-10 text-center">What We Stand For</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Trust First', desc: 'Every user verifies their identity. We store only hashes — never raw Aadhaar data.' },
              { icon: Heart, title: 'Transparency', desc: 'Real reviews from real visits. No fake ratings, no hidden agendas.' },
              { icon: MessageCircle, title: 'Genuine Connections', desc: 'We match verified tenants with verified landlords. No spam, no ghosting.' },
            ].map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">Ready to find your next home?</h2>
          <p className="text-gray-500 mb-8">Join thousands of verified tenants and landlords on TrustRent.</p>
          <div className="flex justify-center gap-4">
            <Link to="/auth/tenant" className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors shadow-md">
              I'm a Tenant
            </Link>
            <Link to="/auth/landlord" className="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-full transition-colors shadow-md">
              I'm a Landlord
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
