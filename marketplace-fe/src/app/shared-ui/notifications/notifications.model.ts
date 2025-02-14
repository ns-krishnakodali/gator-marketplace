type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface INotification {
  id?: number
  type: NotificationType
  message: string
  autoClose?: boolean
  onClose?: () => void
}
