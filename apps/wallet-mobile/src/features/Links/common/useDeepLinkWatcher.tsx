import {linksYoroiParser, useLinks} from '@yoroi/links'
import * as React from 'react'
import {Linking} from 'react-native'

import {Logger} from '../../../yoroi-wallets/logging'

export const useDeepLinkWatcher = () => {
  const links = useLinks()

  const processLink = React.useCallback(
    (url: string) => {
      if (links.action !== null) {
        Logger.debug('useDeepLinks :: action in progress, ignoring...')
        return
      }
      const action = linksYoroiParser(url)
      if (action == null) {
        Logger.debug('useDeepLinks :: link is malformated, ignoring...')
        return
      }
      if (action.params?.isSandbox === true && __DEV__ === false) {
        Logger.debug('useDeepLinks :: link is sandboxed, ignoring...')
        return
      }
      // TODO: implement isTrusted if signature was provided and doesn't match with authorization ignore it
      links.actionStarted({info: action, isTrusted: false})
    },
    [links],
  )

  React.useEffect(() => {
    const getUrl = ({url}: {url: string | null}) => {
      console.warn('url', url)
      if (url !== null) {
        processLink(url)
      }
    }
    Linking.addEventListener('url', getUrl)
    return () => Linking.removeAllListeners('url')
  }, [processLink])

  // app is closed
  React.useEffect(() => {
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL()
      console.warn('url', url)
      if (url !== null) {
        processLink(url)
      }
    }
    getInitialURL()
  }, [processLink])
}
