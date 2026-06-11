import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

interface ToastCtx {
  showToast: (type: 'success' | 'error', message: string) => void
}

const Ctx = createContext<ToastCtx>({ showToast: () => {} })

export const useToast = () => useContext(Ctx)

let _id = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++_id
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg border animate-slide-up ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {t.type === 'success' ? <CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" /> : <XCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />}
            <p className="text-sm font-['Inter'] flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </Ctx.Provider>
  )
}
