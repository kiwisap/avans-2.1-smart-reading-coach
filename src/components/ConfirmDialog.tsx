import { useEffect, useId, useRef, type ReactNode } from 'react';
import Button from './Button.tsx';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    children: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

// Uses the native <dialog>: it traps focus, closes on Escape and returns focus afterwards.
export default function ConfirmDialog({
    open,
    title,
    children,
    confirmLabel = 'Bevestigen',
    cancelLabel = 'Annuleren',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            className="dialog"
            onCancel={(event) => {
                event.preventDefault();
                onCancel();
            }}
        >
            <div className="p-4">
                <h2 id={titleId} className="h5 mb-3">
                    {title}
                </h2>
                <div>{children}</div>
            </div>
            <div className="d-flex justify-content-end gap-2 bg-body-tertiary px-4 py-3 rounded-bottom">
                <Button variant="secondary" onClick={onCancel}>
                    {cancelLabel}
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </div>
        </dialog>
    );
}
