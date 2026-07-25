import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Button from './Button';

interface SessionExpiredModalProps {
  open: boolean;
}

export default function SessionExpiredModal({ open }: SessionExpiredModalProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Modal open={open} onClose={() => {}} title="Session ended">
      <p className="text-ink2 mb-6">Your session expired. Log in again to continue.</p>
      <Button onClick={handleLogin} className="w-full">
        Go to login
      </Button>
    </Modal>
  );
}
