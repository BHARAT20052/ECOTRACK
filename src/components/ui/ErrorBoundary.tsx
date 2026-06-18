import { Component, type ReactNode, type ErrorInfo } from 'react'

export interface ErrorBoundaryProps {
  readonly children: ReactNode
  readonly fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback
      }
      return (
        <div className="p-6 max-w-md mx-auto my-8 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm">
            An unexpected error occurred in this section. Please reload the page or try again.
          </p>
        </div>
      )
    }

    return this.props.children
  }

  private get fallback(): ReactNode | undefined {
    return this.props.fallback
  }
}
