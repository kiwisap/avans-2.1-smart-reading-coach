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
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
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
            <h2 id={titleId}>{title}</h2>
            <div>{children}</div>
            <div className="dialog-actions">
                <Button variant="secondary" onClick={onCancel}>
                    {cancelLabel}
                </Button>
                <Button onClick={onConfirm}>{confirmLabel}</Button>
            </div>
        </dialog>
    );
}
