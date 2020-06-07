// @flow

import {NetInfo, Platform} from 'react-native'

import {SubscriptionManager} from './subscription'

export type ConnectionInfo = {
  isOnline: boolean,
}

// https://github.com/facebook/react-native/issues/19039#issuecomment-386228738
const _fetchConnectionInfo = (): Promise<any> => {
  if (Platform.OS === 'ios') {
    return new Promise((resolve, reject) => {
      const handler = (info) => {
        NetInfo.removeEventListener('connectionChange', handler)

        resolve(info)
      }

      NetInfo.addEventListener('connectionChange', handler)
    })
  } else {
    return NetInfo.getConnectionInfo()
  }
}

// Hides native implementation details
const _facadeInfo = (info): ConnectionInfo => ({
  isOnline: info.type !== 'none' && info.type !== 'unknown',
})

let _latestInfo: ConnectionInfo = {
  isOnline: true,
}

const _subscriptions = new SubscriptionManager<ConnectionInfo>()

const _handleConnectionChange = (netInfo) => {
  const info = _facadeInfo(netInfo)
  _latestInfo = info
  _subscriptions.notify(_latestInfo)
}

NetInfo.addEventListener('connectionChange', _handleConnectionChange)

// note: don't await on purpose
_fetchConnectionInfo().then(_handleConnectionChange)

export default {
  subscribe: _subscriptions.subscribe,
  getConnectionInfo: () => _latestInfo,
}
