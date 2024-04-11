export const validUrl = (url: string) => {
  return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!&',,=.+]+$/g.test(url)
}

export function hasProtocol(url: string) {
  return /^[a-z]*:\/\//i.test(url)
}

export const urlWithProtocol = (url: string, defaultProtocol = 'https://') => {
  const sanitizedURL = hasProtocol(url) ? url : `${defaultProtocol}${url}`
  return sanitizedURL
}

export const getDomainFromUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url)

    return {
      isSecure: parsedUrl.protocol === 'https:',
      domainName: parsedUrl.hostname.replace(/www./g, ''),
    }
  } catch (error) {
    return {
      isSecure: false,
      domainName: '',
    }
  }
}
