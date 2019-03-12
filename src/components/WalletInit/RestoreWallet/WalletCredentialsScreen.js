// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {injectIntl, defineMessages} from 'react-intl'

import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {ROOT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import {createWallet} from '../../../actions'

import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletcredentialsscreen.title',
    defaultMessage: '!!!Wallet credentials',
    description: 'some desc',
  },
})

type Props = {
  intl: any,
  navigation: Navigation,
  navigateToWallet: ({
    name: string,
    password: string,
  }) => mixed,
}

const WalletCredentialsScreen = ({
  intl,
  navigation,
  navigateToWallet,
}: Props) => <WalletForm onSubmit={navigateToWallet} />

export default injectIntl(compose(
  connect(
    () => ({}),
    {createWallet},
  ),
  withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  withHandlers({
    navigateToWallet: ignoreConcurrentAsyncHandler(
      ({navigation, createWallet}) => async ({name, password}) => {
        const phrase = navigation.getParam('phrase')
        await createWallet(name, phrase, password)
        navigation.navigate(ROOT_ROUTES.WALLET)
      },
      1000,
    ),
  }),
)(WalletCredentialsScreen))
