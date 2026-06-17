import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  featureName?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.featureName ? `:${this.props.featureName}` : ''}]`, error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-md">
            <div className="text-[36px] mb-3">⚠️</div>
            <h2 className="text-[17px] font-medium text-gray-900 mb-2">
              Algo deu errado
            </h2>
            <p className="text-[13px] text-gray-600 mb-4">
              {this.props.featureName
                ? `Ocorreu um erro na seção "${this.props.featureName}".`
                : 'Ocorreu um erro inesperado.'}
            </p>
            {this.state.error && (
              <p className="text-[11px] font-mono text-gray-400 mb-4 bg-gray-50 p-2 rounded-md">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="py-2 px-4 bg-blue text-white rounded-md text-[13px] font-medium cursor-pointer border-none hover:bg-blue-dark transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
