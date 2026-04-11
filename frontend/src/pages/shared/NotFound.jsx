import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-heading font-bold text-gray-200 mb-4">404</div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-4">
        <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors shadow-md">
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link to="/search" className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition-colors">
          <Search className="w-4 h-4" /> Search Properties
        </Link>
      </div>
    </div>
  );
}
