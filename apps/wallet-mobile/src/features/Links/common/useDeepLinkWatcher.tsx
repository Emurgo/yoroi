import {linksYoroiParser, useLinks} from '@yoroi/links'
import * as React from 'react'
import {Linking} from 'react-native'

import {logger} from '../../../kernel/logger/logger'

export const useDeepLinkWatcher = () => {
  const {actionStarted} = useLinks()

  const processLink = React.useCallback(
    (url: string) => {
      const parsedAction = linksYoroiParser(url)
      if (parsedAction == null) {
        logger.debug('useDeepLinkWatcher: link is malformated, ignored')
        return
      }
      if (parsedAction.params?.isSandbox === true && __DEV__ === false) {
        logger.debug('useDeepLinkWatcher: link is sandboxed, ignored')
        return
      }
      // TODO: implement isTrusted if signature was provided and doesn't match with authorization ignore it
      logger.debug('useDeepLinkWatcher: parsedAction', {parsedAction})
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
