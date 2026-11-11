import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        <main className="page-shell flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md text-center">
            <p className="eyebrow">Something went wrong</p>
            <h1 className="font-display mt-4 text-4xl">
              Please reload Borrow My Stuff.
            </h1>
            <button
              className="btn-primary mt-6"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </main>
      );
    return this.props.children;
  }
}
