import { toast } from 'sonner';

function normalizeMessage(message: string) {
  return message.trim() || 'Bir sorun oluştu. Lütfen tekrar deneyin.';
}

export function notifySuccess(message: string) {
  toast.success(normalizeMessage(message), {
    duration: 4200,
  });
}

export function notifyError(message: string) {
  toast.error(normalizeMessage(message), {
    duration: 5200,
  });
}
