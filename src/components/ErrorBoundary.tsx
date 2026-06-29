'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('=== ErrorBoundary caught ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo?.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const errMsg = this.state.error?.message || '';
      // Try to extract the offending object details from React #31 error
      const objectMatch = errMsg.match(/object with keys\s*\{([^}]+)\}/);
      const objectKeys = objectMatch ? objectMatch[1] : '';

      return (
        <div style={{ padding: 20, background: '#fff', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: 'red' }}>⚠️ Client-side Rendering Error</h2>
          <p style={{ fontSize: 14, color: '#666', marginTop: 10 }}>
            An object was rendered as a React child. This usually means a category/product name or description
            (which is an object like <code>{'{ zh, en, ar }'}</code>) was rendered directly instead of accessing its language property.
          </p>

          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg">
            <strong className="text-red-600">Error:</strong>
            <pre className="mt-2 text-sm text-red-800 whitespace-pre-wrap overflow-auto">{errMsg}</pre>
          </div>

          {objectKeys && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <strong className="text-blue-600">🔍 Offending object keys:</strong>
              <code style={{ display: 'block', marginTop: 8, padding: 8, background: '#fff', borderRadius: 4, fontSize: 13 }}>{objectKeys}</code>
              <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                These keys tell us what kind of object was incorrectly rendered. Search for code that renders this object without accessing a specific property.
              </p>
            </div>
          )}

          <details open style={{ whiteSpace: 'pre-wrap', marginTop: 15, color: '#333', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <summary style={{ cursor: 'pointer', padding: '10px 15px', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>📋 Full Stack Trace (click to collapse)</summary>
            <pre style={{ fontSize: 11, padding: 15, overflow: 'auto' }}>{this.state.error?.stack}</pre>
          </details>

          {this.state.errorInfo && (
            <details open style={{ whiteSpace: 'pre-wrap', marginTop: 15, color: '#333', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <summary style={{ cursor: 'pointer', padding: '10px 15px', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>🧩 Component Stack (shows WHICH component caused the error - click to collapse)</summary>
              <pre style={{ fontSize: 12, padding: 15, overflow: 'auto', backgroundColor: '#f0fdf4' }}>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}

          <div style={{ marginTop: 25, padding: 15, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
            <strong>✅ How to fix this:</strong>
            <ol style={{ marginTop: 8, paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
              <li>Check the Component Stack above to find which component renders the object</li>
              <li>Find where the object is used in JSX like <code>{'{variable}'}</code></li>
              <li>Change it to access the correct property, e.g. <code>{'{variable.zh || variable.en}'}</code></li>
            </ol>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
