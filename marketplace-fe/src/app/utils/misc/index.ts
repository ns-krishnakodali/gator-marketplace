export const stringifyArray = (strArray: string[] | undefined): string =>
  !strArray || strArray.length === 0 ? '' : strArray.join(',')
