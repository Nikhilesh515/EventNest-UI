import { Toaster, resolveValue, toast } from 'react-hot-toast';
import { Icon } from './Icon';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      containerClassName="toast-region"
      toastOptions={{ duration: 5000 }}
    >
      {(t) => (
        <div
          className={`toast toast--${t.type}`}
          style={{ opacity: t.visible ? 1 : 0, transition: 'opacity 200ms ease' }}
          role="status"
          aria-live="polite"
        >
          <span className="toast__message">{resolveValue(t.message, t)}</span>
          <button
            type="button"
            className="toast__close"
            aria-label="Dismiss notification"
            onClick={() => toast.dismiss(t.id)}
          >
            <Icon name="x" size={12} />
          </button>
        </div>
      )}
    </Toaster>
  );
}
