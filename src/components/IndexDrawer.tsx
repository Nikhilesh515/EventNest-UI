import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { AlbumIndexContent } from './AlbumRail';

interface IndexDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function IndexDrawer({ open, onClose }: IndexDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    drawerRef.current?.querySelector<HTMLElement>('.index-tab, .btn')?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="rail-scrim" data-index-scrim onClick={onClose} />
      <div
        className="drawer is-open"
        id="index-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Album index"
        ref={drawerRef}
      >
        <div className="drawer__head">
          <span className="drawer__title">Album index</span>
          <button type="button" className="icon-btn" aria-label="Close album index" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <AlbumIndexContent onNavigate={onClose} />
      </div>
    </>
  );
}
