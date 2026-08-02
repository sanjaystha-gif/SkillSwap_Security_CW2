import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} descriptionId="confirm-dialog-description">
      <p id="confirm-dialog-description" className="text-ink2 mb-6">
        {message}
      </p>
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} loading={loading}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
