import Google from '../../../assets/img/dApp/google.png'

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

export interface DAppItem {
  id: string
  name: string
  description: string
  category: string
  logo: string
  uri: string
  origins: string[]
}

export const GOOGLE_DAPP_ID = 'google_search'

export const getGoogleSearchItem = (searchQuery: string): DAppItem => ({
  id: GOOGLE_DAPP_ID,
  name: searchQuery,
  description: 'Google',
  category: 'search',
  logo: Google,
  uri: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
  origins: ['https://www.google.com'],
})

export const isGoogleSearchItem = (dApp: DAppItem) => dApp.id === GOOGLE_DAPP_ID
