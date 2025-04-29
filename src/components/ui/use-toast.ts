
// This file re-exports the toast hook and helper from our custom implementation
// Any component using toast should import from this file for consistency
import { useToast, toast, ToastProvider } from "@/hooks/use-toast";

// Export all toast-related functionality
export { useToast, toast, ToastProvider };
