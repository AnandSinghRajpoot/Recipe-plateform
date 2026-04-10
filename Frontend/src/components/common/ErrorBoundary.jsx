import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6 text-center">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white">
            <div className="w-20 h-20 bg-error/10 text-error rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h1 className="font-headline font-black text-3xl text-on-surface mb-2">Something went wrong</h1>
            <p className="text-on-surface-variant mb-8">
              We encountered an unexpected UI crash. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="vitality-gradient text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all"
            >
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
