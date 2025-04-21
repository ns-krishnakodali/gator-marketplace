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

export const isValidDate = (date: string): boolean => {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return false

  const meetupDate: Date = new Date(year, month - 1, day)
  if (isNaN(meetupDate.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return meetupDate >= today
}

export const capitalizeFirstLetter = (str: string): string =>
  str ? str[0].toUpperCase() + str.slice(1) : ''

export const getUUIDPrefix = (uuid: string): string => {
  const dashIndex: number = uuid.indexOf('-')
  if (dashIndex !== -1 && dashIndex < 8) {
    return uuid.slice(0, dashIndex)
  }
  return uuid.slice(0, 8)
}
