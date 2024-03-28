export const baseUrlAdapter = (baseUrl: string, providerId: string) => {
  switch (providerId) {
    case 'encryptus':
      return `${baseUrl}/`
    default:
      return baseUrl
  }
}
