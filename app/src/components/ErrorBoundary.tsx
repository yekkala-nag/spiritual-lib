import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f6efe3] p-6">
          <div className="max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-lg">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="mt-4 text-xl font-semibold text-stone-900">
              {this.props.fallbackTitle ?? 'Something went wrong'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
