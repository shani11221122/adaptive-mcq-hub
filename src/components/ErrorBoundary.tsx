import { Component, type ReactNode } from "react";

interface State { hasError: boolean; message?: string; }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: undefined });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center text-2xl mb-4">!</div>
        <h1 className="text-lg font-bold font-display text-foreground mb-1">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          The app hit an unexpected error. You can reload to continue.
        </p>
        <button onClick={this.handleReload} className="btn-primary px-8">Reload App</button>
      </div>
    );
  }
}
