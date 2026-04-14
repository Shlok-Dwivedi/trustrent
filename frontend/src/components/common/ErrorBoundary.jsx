import React from 'react';
import { Home, RefreshCw, AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-8">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Try Refreshing
              </button>
              <a 
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                <Home className="w-4 h-4" /> Back to Home
              </a>
            </div>
          </div>
          <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest font-bold">
            TrustRent Production Safety System
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
