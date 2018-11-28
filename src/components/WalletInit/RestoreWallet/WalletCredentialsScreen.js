// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'

import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {ROOT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import {createWallet} from '../../../actions'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'
import type {Navigation} from '../../../types/navigation'

const getTranslations = (state: State) => state.trans.WalletCredentialsScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  navigation: Navigation,
  navigateToWallet: ({
    name: string,
    password: string,
  }) => mixed,
}

const WalletCredentialsScreen = ({
  translations,
  navigation,
  navigateToWallet,
}: Props) => <WalletForm onSubmit={navigateToWallet} />

export default compose(
  connect(
    () => ({}),
    {createWallet},
  ),
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
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
)(WalletCredentialsScreen)
