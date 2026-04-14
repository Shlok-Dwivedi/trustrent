import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-heading font-bold text-xl text-primary-dark tracking-tight">TrustRent</Link>
            <p className="mt-4 text-sm text-gray-500 line-clamp-3">
              India's first completely verified rental platform. Built on trust, transparency, and simplicity.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/about" className="text-base text-gray-500 hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/how-it-works" className="text-base text-gray-500 hover:text-primary transition-colors">How it Works</Link></li>
              <li><Link to="/search" className="text-base text-gray-500 hover:text-primary transition-colors">Search Properties</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/privacy" className="text-base text-gray-500 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-base text-gray-500 hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-primary transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; 2026 TrustRent.
          </p>
        </div>
      </div>
    </footer>
  );
}
