/* eslint-disable @typescript-eslint/no-explicit-any */

import NetInfo from '@react-native-community/netinfo'

import {SubscriptionManager} from '../legacy/subscription'

export type ConnectionInfo = {
  isOnline: boolean
}

const _fetchConnectionInfo = (): Promise<any> => NetInfo.fetch()

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

NetInfo.addEventListener(_handleConnectionChange)
// note: don't await on purpose
_fetchConnectionInfo().then(_handleConnectionChange)

export default {
  subscribe: _subscriptions.subscribe,
  getConnectionInfo: () => _latestInfo,
}
