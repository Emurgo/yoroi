// @flow
import React from 'react'
import {ActivityIndicator} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {withNavigation} from 'react-navigation'

import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {ROOT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import {createWallet, updateVersion} from '../../../actions'
import {isJormungandr} from '../../../config/networks'

import type {Navigation} from '../../../types/navigation'
import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletcredentialsscreen.title',
    defaultMessage: '!!!Wallet credentials',
    description: 'some desc',
  },
})

const WalletCredentialsScreen = ({navigateToWallet, waiting}) => (
  <>
    <WalletForm onSubmit={navigateToWallet} />
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
    withNavigation,
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withStateHandlers(
      {
        waiting: false,
      },
      {
        setWaiting: (state) => (waiting: boolean) => ({waiting}),
      },
    ),
    withHandlers({
      navigateToWallet: ignoreConcurrentAsyncHandler(
        ({navigation, createWallet, updateVersion, setWaiting}) => async ({
          name,
          password,
        }) => {
          setWaiting(true)
          const phrase = navigation.getParam('phrase')
          const networkId = navigation.getParam('networkId')
          try {
            await createWallet(name, phrase, password, networkId)
            await updateVersion()
          } finally {
            setWaiting(false)
          }
          const route = isJormungandr(networkId)
            ? ROOT_ROUTES.JORMUN_WALLET
            : ROOT_ROUTES.WALLET
          navigation.navigate(route)
        },
        1000,
      ),
    }),
  )(WalletCredentialsScreen): ComponentType<{
    navigation: Navigation,
    intl: intlShape,
  }>),
)
