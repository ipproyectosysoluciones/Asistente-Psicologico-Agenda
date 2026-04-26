import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  serviceName: string
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary:${this.props.serviceName}]`, error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{this.props.serviceName}</div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>Error al cargar / Failed to load</div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 14 }}
          >
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
