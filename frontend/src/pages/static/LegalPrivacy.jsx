import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-10">Last updated: April 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">We collect information you provide directly: mobile number, name, email, and optionally your Aadhaar number for identity verification. We also collect usage data, device information, and location data when you use our map-based search.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. How We Use Your Data</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>To verify your identity and build your trust score</li>
            <li>To facilitate property search and visit bookings</li>
            <li>To send you SMS notifications about visit requests</li>
            <li>To improve our platform and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Aadhaar Data Protection</h2>
          <p className="text-gray-600 leading-relaxed">We <strong>never store your raw Aadhaar number</strong>. We only store a one-way cryptographic hash of it. This hash is used solely to prevent re-registration after account deletion (shadow table). This approach is compliant with UIDAI guidelines.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Data Sharing</h2>
          <p className="text-gray-600 leading-relaxed">We do not sell your personal data. Your phone number is shared with landlords/tenants only when you explicitly book a visit. Reviews you leave are publicly visible to other users.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Security</h2>
          <p className="text-gray-600 leading-relaxed">We use industry-standard encryption (TLS), JWT-based authentication, and Row Level Security (RLS) policies on our database. All API communications are encrypted in transit.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">You can request deletion of your account and personal data at any time. Note that your Aadhaar hash will be retained in the shadow table to prevent fraud, as disclosed during registration.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">For privacy-related inquiries, reach out to <a href="mailto:privacy@trustrent.in" className="text-accent hover:underline">privacy@trustrent.in</a>.</p>
        </section>
      </div>
    </div>
  );
}
