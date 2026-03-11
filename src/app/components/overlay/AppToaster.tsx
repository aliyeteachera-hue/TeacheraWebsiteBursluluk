import { Toaster } from 'sonner';

export default function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-center"
      closeButton
      toastOptions={{
        className: "font-['Neutraface_2_Text:Book',sans-serif]",
      }}
    />
  );
}
