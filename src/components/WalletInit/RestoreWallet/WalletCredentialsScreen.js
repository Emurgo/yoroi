// @flow
import React from 'react'
import {ActivityIndicator} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import {createWallet, updateVersion} from '../../../actions'
import {Logger} from '../../../utils/logging'

import type {Navigation} from '../../../types/navigation'
import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletcredentialsscreen.title',
    defaultMessage: '!!!Wallet credentials',
    description: 'some desc',
  },
})

const WalletCredentialsScreen = ({navigateToWallet, waiting, navigation}) => (
  <>
    <WalletForm onSubmit={navigateToWallet} navigation={navigation} />
    {waiting && <ActivityIndicator />}
  </>
)

export default injectIntl(
  (compose(
    connect(
      () => ({}),
      {
        createWallet,
        updateVersion,
      },
    ),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
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
        ({
          navigation,
          route,
          createWallet,
          updateVersion,
          setWaiting,
        }) => async ({name, password}) => {
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

          try {
            // note(v-almonacid): it looks like we need the parent in order to
            // navigate from nested navigator to nested navigator
            const parentNavigation = navigation.dangerouslyGetParent()
            parentNavigation.navigate(ROOT_ROUTES.WALLET, {
              screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
            })
          } catch (_e) {
            Logger.warn('could not navigate from parent navigator')
            navigation.navigate(WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES)
          }
        },
        1000,
      ),
    }),
  )(WalletCredentialsScreen): ComponentType<{
    navigation: Navigation,
    intl: intlShape,
  }>),
)
