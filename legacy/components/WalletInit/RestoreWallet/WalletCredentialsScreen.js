// @flow

import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {ActivityIndicator} from 'react-native'
import {useDispatch} from 'react-redux'

import {createWallet, updateVersion} from '../../../actions'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import WalletForm from '../WalletForm'

const WalletCredentialsScreen = () => {
  const navigation = useNavigation()
  const route: any = useRoute()
  const [waiting, setWaiting] = React.useState(false)
  const dispatch = useDispatch()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navigateToWallet = React.useCallback(
    ignoreConcurrentAsyncHandler(
      () =>
        async ({name, password}) => {
          setWaiting(true)
          const {phrase, networkId, walletImplementationId, provider} = route.params
          assert.assert(!!phrase, 'mnemonic')
          assert.assert(networkId != null, 'networkId')
          assert.assert(!!walletImplementationId, 'walletImplementationId')
          try {
            await dispatch(createWallet(name, phrase, password, networkId, walletImplementationId, provider))
            await dispatch(updateVersion())
          } finally {
            setWaiting(false)
          }

          navigation.navigate(ROOT_ROUTES.WALLET, {
            screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
          })
        },
      1000,
    )(),
    [],
  )

  return (
    <>
      <WalletForm onSubmit={navigateToWallet} navigation={navigation} />
      {waiting && <ActivityIndicator />}
    </>
  )
}

export default WalletCredentialsScreen
