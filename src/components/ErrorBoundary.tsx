import { Component, type ReactNode } from "react";

/**
 * Application-wide error boundary.
 *
 * Catches render-time errors anywhere in the React tree and shows a
 * minimal fallback so the user is not staring at a blank page. The
 * full error is logged to the browser console (so developers can
 * inspect it via DevTools) and to no other destination.
 *
 * IMPORTANT: Do not add a third-party error reporting SDK to this
 * component. Runtime errors may include user-controlled content
 * (medical record text, profile data, etc.) and must not be sent
 * off-device. The previous vly `InstrumentationProvider` shipped
 * stack traces, filenames, and line numbers to an external URL and
 * was removed for this reason — see PR
 * "fix(privacy): remove vly instrumentation provider".
 */
interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    // eslint-disable-next-line no-console -- intentional: visible in DevTools
    console.error("[ErrorBoundary] Unhandled render error", error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f8f7] px-6 py-12 text-center text-[#18322f]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#397768]">Something went wrong</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
            We could not finish loading this page
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#5e766f]">
            Please refresh the page to try again. If the problem keeps happening, clear your browser
            cache or contact support.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#18322f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2a4b45]"
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
