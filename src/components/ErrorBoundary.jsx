import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="max-w-lg w-full">
            {/* Error Card */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-6">
                <div className="flex items-center justify-center">
                  <div className="bg-white/20 rounded-full p-3">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-8 text-center">
                <h1 className="text-2xl font-bold text-white pb-2">
                  Oops! Something went wrong
                </h1>
                
                <p className="text-slate-400 leading-relaxed mb-8">
                  We encountered an unexpected error. Don't worry, your data is safe. Please try again or refresh the page.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <button
                    onClick={this.handleRetry}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/30"
                  >
                    <RefreshCw size={18} />
                    Try Again
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-white/10 text-slate-300 rounded-xl font-medium hover:bg-white/20 hover:text-white transform hover:scale-105 transition-all duration-200 border border-white/15"
                  >
                    Refresh Page
                  </button>
                </div>

                {/* Development Error Details */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left group">
                    <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-200 font-medium py-2 px-4 bg-white/5 rounded-lg inline-flex items-center gap-2 transition-colors border border-white/10">
                      <span className="transform group-open:rotate-90 transition-transform">▶</span>
                      Error Details (Development)
                    </summary>
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 font-mono">
                      <div className="mb-3 pb-3 border-b border-red-500/20">
                        <strong className="text-red-200 text-sm">Error Message:</strong>
                        <div className="mt-1 text-red-300">{this.state.error.message}</div>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong className="text-red-200 text-sm">Component Stack:</strong>
                          <pre className="mt-2 whitespace-pre-wrap text-red-400 leading-relaxed max-h-48 overflow-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {/* Footer */}
              <div className="bg-white/5 px-8 py-4 border-t border-white/10">
                <p className="text-xs text-slate-500 text-center">
                  If this problem persists, please contact support
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;