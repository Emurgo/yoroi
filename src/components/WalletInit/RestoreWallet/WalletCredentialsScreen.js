// @flow
import React from 'react'
import {ActivityIndicator} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withStateHandlers} from 'recompose'

import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import WalletForm from '../WalletForm'
import {createWallet, updateVersion} from '../../../actions'

import type {Navigation} from '../../../types/navigation'
import type {ComponentType} from 'react'

const WalletCredentialsScreen = ({navigateToWallet, waiting, navigation}) => (
  <>
    <WalletForm onSubmit={navigateToWallet} navigation={navigation} />
    {waiting && <ActivityIndicator />}
  </>
)

export default (compose(
  connect(
    () => ({}),
    {
      createWallet,
      updateVersion,
    },
  ),
  withStateHandlers(
    {
      waiting: false,
    },
    {
      setWaiting: () => (waiting: boolean) => ({waiting}),
    },
  ),
  withHandlers({
    navigateToWallet: ignoreConcurrentAsyncHandler(
      ({navigation, route, createWallet, updateVersion, setWaiting}) => async ({
        name,
        password,
      }) => {
        setWaiting(true)
        const {phrase, networkId, walletImplementationId} = route.params
        assert.assert(!!phrase, 'mnemonic')
        assert.assert(networkId != null, 'networkId')
        assert.assert(!!walletImplementationId, 'walletImplementationId')
        try {
          await createWallet(
            name,
            phrase,
            password,
            networkId,
            walletImplementationId,
          )
          await updateVersion()
        } finally {
          setWaiting(false)
        }

        navigation.navigate(ROOT_ROUTES.WALLET, {
          screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
        })
      },
      1000,
    ),
  }),
)(WalletCredentialsScreen): ComponentType<{
  navigation: Navigation,
}>)
