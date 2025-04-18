export const stringifyArray = (strArray: string[] | undefined): string =>
  !strArray || strArray.length === 0 ? '' : strArray.join(',')

export const isValidMobileNumber = (mobileNumber: string): boolean =>
  new RegExp('^\\d{3}-\\d{3}-\\d{4}').test(mobileNumber)

export const formatMobileNumber = (number: string): string => {
  const digits = number.replace(/\D/g, '')

  if (digits.length === 0) {
    return ''
  } else if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  } else if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  return ''
}
