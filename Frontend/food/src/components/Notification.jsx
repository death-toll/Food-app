import { useEffect } from 'react';

/**
 * Lightweight notification/toast.
 * Uses Bootstrap alert styling and fixed positioning (top-right).
 * Auto-dismisses after `duration` ms unless set to 0.
 */
const Notification = ({ message, variant = 'success', onClose, duration = 2500 }) => {
    // Auto-close timer; clears on unmount or if message/duration changes.
    useEffect(() => {
        if (!message) return;
        if (!duration || duration <= 0) return;

        const id = setTimeout(() => {
            if (typeof onClose === 'function') onClose();
        }, duration);

        return () => clearTimeout(id);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
            <div
                className={`alert alert-${variant} alert-dismissible fade show shadow-sm mb-0`}
                role="alert"
            >
                {message}
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => typeof onClose === 'function' && onClose()}
                />
            </div>
        </div>
    );
};

export default Notification;
