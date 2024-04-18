import {linksYoroiParser, useLinks} from '@yoroi/links'
import * as React from 'react'
import {Linking} from 'react-native'

import {Logger} from '../../../yoroi-wallets/logging'

export const useDeepLinkWatcher = () => {
  const {actionStarted} = useLinks()

  const processLink = React.useCallback(
    (url: string) => {
      const parsedAction = linksYoroiParser(url)
      if (parsedAction == null) {
        Logger.debug('useDeepLinksWatcher :: link is malformated, ignoring...')
        return
      }
      if (parsedAction.params?.isSandbox === true && __DEV__ === false) {
        Logger.debug('useDeepLinksWatcher :: link is sandboxed, ignoring...')
        return
      }
      // TODO: implement isTrusted if signature was provided and doesn't match with authorization ignore it
      Logger.debug('parsedAction', JSON.stringify(parsedAction, null, 2))
      actionStarted({info: parsedAction, isTrusted: false})
    },
    [actionStarted],
  )

  React.useEffect(() => {
    const getUrl = ({url}: {url: string | null}) => {
      if (url !== null) processLink(url)
    }
    Linking.addEventListener('url', getUrl)
    return () => Linking.removeAllListeners('url')
  }, [processLink])

  // app is closed
  React.useEffect(() => {
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL()
      if (url !== null) processLink(url)
    }
    getInitialURL()
  }, [processLink])
}
