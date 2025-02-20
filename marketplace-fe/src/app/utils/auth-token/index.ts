const isClient = typeof window !== 'undefined'

export const setAuthToken = (token: string): boolean => {
  if (token && isClient) {
    try {
      localStorage.setItem('token', token)
      return true
    } catch (error) {
      console.error('Error setting auth token:', error)
    }
  }
  return false
}

export const getAuthToken = (): string | null => {
  if (isClient) {
    try {
      return localStorage.getItem('token')
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
  }
  return null
}

export const removeAuthToken = (): void => {
  if (isClient) {
    try {
      localStorage.removeItem('token')
    } catch (error) {
      console.error('Error removing auth token:', error)
    }
  }
}

export const isValidToken = (): boolean => {
  const token: string | null = getAuthToken()
  return typeof token === 'string' && token.trim() !== ''
}
