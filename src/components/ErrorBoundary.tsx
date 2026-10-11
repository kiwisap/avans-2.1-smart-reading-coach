import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '../i18n/index.ts';

interface ErrorBoundaryProps {
    children: ReactNode;
    resetKey?: string; // when this changes (for example the address), the boundary tries again
}

interface ErrorBoundaryState {
    failed: boolean;
}

// Catches errors thrown while rendering, so one broken component shows a message with a way
// out instead of a white page. It does not catch errors in event handlers or in requests: those
// are handled where they happen (apiFetch throws ApiError, pages show an Alert).
// Error boundaries must be class components, React has no hook for this.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    override state: ErrorBoundaryState = { failed: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { failed: true };
    }

    override componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error(error, info.componentStack);
    }

    override componentDidUpdate(previous: ErrorBoundaryProps): void {
        if (this.state.failed && previous.resetKey !== this.props.resetKey) {
            this.setState({ failed: false });
        }
    }

    override render(): ReactNode {
        if (!this.state.failed) return this.props.children;
        return (
            <div className="alert alert-danger" role="alert">
                <h1 className="h4">{i18n.t('errors.boundary.title')}</h1>
                <p>{i18n.t('errors.boundary.text')}</p>
                <div className="d-flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => this.setState({ failed: false })}
                    >
                        {i18n.t('common.retry')}
                    </button>
                    {/* A plain link on purpose: a full page load also clears broken state. */}
                    <a className="btn btn-outline-primary" href="/">
                        {i18n.t('notFound.back')}
                    </a>
                </div>
            </div>
        );
    }
}
