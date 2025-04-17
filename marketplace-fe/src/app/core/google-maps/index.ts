export const loadGoogleMaps = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { google?: { maps: unknown } }).google?.maps) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.defer = true
    script.async = true

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the Google Maps script.'))

    document.head.appendChild(script)
  })
}
