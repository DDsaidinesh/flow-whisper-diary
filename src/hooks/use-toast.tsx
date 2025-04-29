
import * as React from "react"
import { createContext, useContext, useState, useCallback, ReactNode } from "react"

type ToastProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type Toast = ToastProps & {
  id: number
}

type ToastContextType = {
  toasts: Toast[]
  toast: (props: ToastProps) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (props: ToastProps) => {
      const id = Date.now()
      const newToast = { ...props, id }
      setToasts((prev) => [...prev, newToast])

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, 5000)
    },
    []
  )

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Helper function to display a toast directly without the hook
export const toast = (props: ToastProps) => {
  // We can't use this outside of the provider context, so this function should only be called
  // from components that are inside the ToastProvider
  const toastContext = useContext(ToastContext)
  if (!toastContext) {
    console.error("Toast function called outside of ToastProvider")
    return
  }
  toastContext.toast(props)
}

export default useToast
