// components/Alert.tsx
import { useEffect } from 'react'
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamation, HiX } from 'react-icons/hi'

type AlertType = 'success' | 'error' | 'info' | 'warning'

export interface AlertData {
  type: AlertType
  title: string
  message: string
  duration?: number
}

export interface AlertProps extends AlertData {
  onClose: () => void
}

const config: Record<
  AlertType,
  { icon: React.ReactNode; iconWrap: string; title: string; ring: string }
> = {
  success: {
    icon: <HiCheckCircle size={20} />,
    iconWrap: 'bg-sage-100 text-sage-700',
    title: 'text-sage-700',
    ring: 'bg-white border-ivory-400',
  },
  error: {
    icon: <HiXCircle size={20} />,
    iconWrap: 'bg-clay-100 text-clay-600',
    title: 'text-clay-700',
    ring: 'bg-white border-ivory-400',
  },
  info: {
    icon: <HiInformationCircle size={20} />,
    iconWrap: 'bg-sage-100 text-sage-700',
    title: 'text-ink-900',
    ring: 'bg-white border-ivory-400',
  },
  warning: {
    icon: <HiExclamation size={20} />,
    iconWrap: 'bg-gold-50 text-gold-600',
    title: 'text-gold-700',
    ring: 'bg-white border-ivory-400',
  },
}

const Alert = ({ type, title, message, onClose, duration = 2200 }: AlertProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [])

  const c = config[type]

  return (
    <div
      role="alert"
      className={`fixed right-5 top-5 z-[100] w-[340px] animate-toast-in rounded-2xl border shadow-lift ${c.ring}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.iconWrap}`}>
          {c.icon}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className={`text-[13.5px] font-bold ${c.title}`}>{title}</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-400">{message}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="icon-btn -mr-1 -mt-1 text-ink-300 hover:text-ink-900"
        >
          <HiX size={15} />
        </button>
      </div>
      <div className="absolute inset-x-4 bottom-0">
        <div className="h-[2px] origin-left overflow-hidden rounded-full">
          <div className="h-full w-full animate-[toast-progress_2.2s_linear_forwards] bg-sage-600/70" />
        </div>
      </div>
      <style>{`@keyframes toast-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>
    </div>
  )
}

export default Alert