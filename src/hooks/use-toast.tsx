
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

// Create a context with a default value that won't throw errors if used outside provider
const defaultToastContext: ToastContextType = {
  toasts: [],
  toast: () => {
    console.warn("Toast called outside of ToastProvider - this won't display anything")
  },
  dismiss: () => {
    console.warn("Dismiss called outside of ToastProvider - this won't do anything")
  },
}

const ToastContext = createContext<ToastContextType>(defaultToastContext)

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
  try {
    const toastContext = useContext(ToastContext)
    toastContext.toast(props)
  } catch (error) {
    console.error("Toast function called outside of ToastProvider", error)
  }
}

export default useToast
