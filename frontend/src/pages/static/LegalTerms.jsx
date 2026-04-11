import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-10">Last updated: April 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">By accessing or using TrustRent, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. User Accounts</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>You must provide accurate information during registration</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>One account per person — duplicate accounts will be removed</li>
            <li>Landlords must complete Aadhaar verification to list properties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Property Listings</h2>
          <p className="text-gray-600 leading-relaxed">Landlords are solely responsible for the accuracy of their listings. TrustRent does not verify property ownership or the accuracy of listing details beyond identity verification. Misleading listings will be removed and may result in account suspension.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Visit Bookings</h2>
          <p className="text-gray-600 leading-relaxed">TrustRent facilitates connections between tenants and landlords but is not a party to any rental agreement. Visit bookings are non-binding requests. Both parties should exercise due diligence before entering any rental agreement.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Reviews & Trust Score</h2>
          <p className="text-gray-600 leading-relaxed">Reviews must be honest, based on actual visits, and free from abusive language. TrustRent reserves the right to remove reviews that violate these guidelines. Trust scores are algorithmically calculated and cannot be manually adjusted.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Prohibited Conduct</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Creating fake listings or reviews</li>
            <li>Harassing other users</li>
            <li>Attempting to circumvent the verification system</li>
            <li>Using the platform for any illegal activity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">TrustRent is provided "as is". We are not liable for any disputes between tenants and landlords, property conditions, or financial losses arising from the use of our platform.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contact</h2>
          <p className="text-gray-600 leading-relaxed">For questions about these terms, email <a href="mailto:legal@trustrent.in" className="text-accent hover:underline">legal@trustrent.in</a>.</p>
        </section>
      </div>
    </div>
  );
}
