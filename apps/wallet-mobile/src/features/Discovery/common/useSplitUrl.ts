export const useSplitUrl = (url: string) => {
  const parsedUrl = new URL(url);

  return {
    isSecure: parsedUrl.protocol === 'https:',
    domainName: parsedUrl.hostname.split('.').slice(-2).join('.')
  }
}