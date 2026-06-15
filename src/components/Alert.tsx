// components/Alert.tsx
import { useEffect } from 'react'

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

const styles: Record<AlertType, string> = {
  success: 'bg-green-100 border-green-500 text-green-800',
  error:   'bg-red-100 border-red-500 text-red-800',
  info:    'bg-blue-100 border-blue-500 text-blue-800',
  warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
}

const Alert = ({ type, title, message, onClose, duration = 2000 }: AlertProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`fixed top-4 right-4 z-50 border-l-4 p-4 rounded shadow-md w-80 ${styles[type]}`}>
      <div className='flex justify-between items-start'>
        <div>
          <p className='font-semibold'>{title}</p>
          <p className='text-sm mt-1'>{message}</p>
        </div>
        <button onClick={onClose} className='ml-4 text-lg leading-none'>X</button>
      </div>
    </div>
  )
}

export default Alert