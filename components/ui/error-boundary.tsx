"use client";

import React from "react";
import { Button } from "./button";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-100 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-6 max-w-md">
            We encountered an unexpected error. Please try again or contact
            support if the issue persists.
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="bg-white border-red-200 text-red-700 hover:bg-red-100 hover:text-red-900"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </Button>
            <Button
              variant="default"
              className="bg-red-600 text-white hover:bg-red-700 hover:text-red-50"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
