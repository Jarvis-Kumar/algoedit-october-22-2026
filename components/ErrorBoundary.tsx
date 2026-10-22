
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { monitor } from '../services/security/monitoring';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    monitor.captureException(error, { componentStack: errorInfo.componentStack });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#121216] border border-red-500/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Fault Detected</h2>
              <p className="text-slate-500 text-sm font-medium">
                The platform encountered an unexpected logical conflict. Our auto-recovery system is standing by.
              </p>
            </div>
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-left">
              <p className="text-[10px] font-mono text-red-400 break-all">
                {this.state.error?.message || 'Unknown Error'}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Re-initialize System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
