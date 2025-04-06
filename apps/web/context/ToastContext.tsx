'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '@/stores/useToastStore'
import Alert from "@/components/ui/alert/Alert";

export const ToastProvider = () => {
  const { toasts } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-999 flex flex-col space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className={`min-w-[450px]`}
          >
            <Alert message={toast.message} title={toast.title} variant={toast.type}/>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
