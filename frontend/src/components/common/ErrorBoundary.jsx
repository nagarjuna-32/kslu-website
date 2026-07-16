import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App Error Boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
            The page ran into an unexpected error. Please refresh to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-royal text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
