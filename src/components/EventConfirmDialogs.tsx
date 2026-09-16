import { ConfirmModal } from './ConfirmModal';

interface EventConfirmDialogsProps {
  action: 'cancel' | 'delete' | null;
  onConfirmCancel: () => void;
  onConfirmDelete: () => void;
  onDismiss: () => void;
}

export function EventConfirmDialogs({
  action,
  onConfirmCancel,
  onConfirmDelete,
  onDismiss,
}: EventConfirmDialogsProps) {
  return (
    <>
      <ConfirmModal
        open={action === 'cancel'}
        title="Cancel this event?"
        body="Guests will see it's off."
        confirmLabel="Cancel event"
        danger
        onConfirm={onConfirmCancel}
        onCancel={onDismiss}
      />
      <ConfirmModal
        open={action === 'delete'}
        title="Delete this event?"
        body="This removes the event and its RSVPs. This can't be undone."
        confirmLabel="Delete event"
        danger
        onConfirm={onConfirmDelete}
        onCancel={onDismiss}
      />
    </>
  );
}
