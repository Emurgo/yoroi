import Google from '../../../assets/img/dApp/google.png'

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
