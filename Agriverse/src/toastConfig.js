import { toast } from 'react-hot-toast';

export function showError(message) {
  toast.error(message || 'Something went wrong!');
}

export function showSuccess(message) {
  toast.success(message || 'Success!');
}
