import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  title: string;
  message: string
  type: ToastType
  duration?: number
}

type ToastStore = {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  showToast: ({ title, message, type = 'info', duration = 3000 }) => {
    const id = crypto.randomUUID()
    const toast: Toast = { id, title, message, type, duration }

    set((state) => ({ toasts: [...state.toasts, toast] }))
    // Auto remove toast after duration
    setTimeout(() => {
      get().removeToast(id)
    }, duration)
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },
  clearToasts: () => {
    set({ toasts: [] })
  },
}))
