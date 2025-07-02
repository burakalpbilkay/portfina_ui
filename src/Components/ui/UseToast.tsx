import { useCallback } from 'react';

export default function useToast() {
  const success = useCallback((message: string) => {
    alert(`✅ Success: ${message}`);
  }, []);

  const error = useCallback((message: string) => {
    alert(`❌ Error: ${message}`);
  }, []);

  const warning = useCallback((message: string) => {
    alert(`✅ Warning: ${message}`);
  }, []);
  return { success, error, warning };
}
