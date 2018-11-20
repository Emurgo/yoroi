// @flow
import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'

import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import Screen from '../../Screen'
import {ROOT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import {createWallet} from '../../../actions'

import styles from './styles/WalletCredentialsScreen.style'
import {COLORS} from '../../../styles/config'

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
}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT} scroll>
    <View style={styles.container}>
      <WalletForm onSubmit={navigateToWallet} />
    </View>
  </Screen>
)

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
