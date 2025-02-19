const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email)
}

export const validateUFLDomain = (email: string): boolean => {
  return email.toLowerCase().endsWith('@ufl.edu')
}
