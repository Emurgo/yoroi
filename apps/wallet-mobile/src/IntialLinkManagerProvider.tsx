import * as React from 'react'
import {Linking} from 'react-native'

const IntialLinkContext = React.createContext<
  {initialUrl: string | null; setInitialUrl: (initialUrl: string | null) => void} | undefined
>(undefined)

export const InitialLinkProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [initialUrl, setInitialUrl] = React.useState<string | null>(null)

  // app is open
  React.useEffect(() => {
    const getUrl = ({url}: {url: string | null}) => {
      if (url !== null) setInitialUrl(url)
    }
    Linking.addEventListener('url', getUrl)
    return () => Linking.removeAllListeners('url')
  }, [])

  // app is closed
  React.useEffect(() => {
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL()
      if (url !== null) setInitialUrl(url)
    }

    getInitialURL()
  }, [])

  return <IntialLinkContext.Provider value={{initialUrl, setInitialUrl}}>{children}</IntialLinkContext.Provider>
}

export const useInitialLink = () => React.useContext(IntialLinkContext) || missingProvider()

const missingProvider = () => {
  throw new Error('InitialLinkProvider is missing')
}
