import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Aurora Gym Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignored
    }
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-teal-500 selection:text-slate-950">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Terjadi Kendala Memuat Aplikasi
              </h2>
              <p className="text-sm text-slate-400">
                Sistem mendeteksi kendala pada cache peramban atau script. Anda dapat memuat ulang halaman atau mereset data lokal agar aplikasi kembali normal.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-left overflow-x-auto text-xs font-mono text-rose-300 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                id="btn-error-reload"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang
              </button>
              
              <button
                type="button"
                id="btn-error-reset"
                onClick={this.handleResetStorage}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white font-semibold rounded-lg transition text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Reset Data & Cache
              </button>
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              Aurora Gym Management • Self-Healing Recovery Screen
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

