// @flow

import React from 'react'
import {ActivityIndicator} from 'react-native'
import {useDispatch} from 'react-redux'

import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import WalletForm from '../WalletForm'
import {createWallet, updateVersion} from '../../../actions'

import type {Navigation} from '../../../types/navigation'

type Props = {
  navigation: Navigation,
  route: any,
}
const WalletCredentialsScreen = ({navigation, route}: Props) => {
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
