/* eslint-disable react/no-unescaped-entities */
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: Record<string, unknown>;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: Record<string, unknown>) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: Record<string, unknown>) {
    this.setState({ error, errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/meeting';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[500px] w-full p-4 sm:p-6">
          <div className="text-center max-w-md mx-auto">
            {/* Animated Error Icon */}
            <div className="relative mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-500/30 animate-pulse">
                <AlertTriangle size={40} className="sm:w-12 sm:h-12 text-white" />
              </div>
              
              {/* Floating error indicators */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-400 rounded-full animate-bounce" />
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-orange-400 rounded-full animate-bounce" 
                   style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Error Message */}
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                We encountered an unexpected error while loading this page. 
                Don't worry, this happens sometimes.
              </p>
              
              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug size={16} className="text-red-400" />
                    <span className="text-sm font-semibold text-red-400">Development Error Details:</span>
                  </div>
                  <pre className="text-xs text-red-300 overflow-x-auto whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                onClick={this.handleRetry}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <RefreshCw size={18} className="mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Home size={18} className="mr-2" />
                Go to Home
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl">
              <p className="text-xs text-gray-400">
                If this problem persists, please try refreshing the page or contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
