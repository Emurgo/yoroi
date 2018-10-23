// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {NavigationActions, StackActions} from 'react-navigation'

import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {ROOT_ROUTES} from '../../../RoutesList'

import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const resetNavigationAction = StackActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({
      routeName: ROOT_ROUTES.MAIN,
    }),
  ],
  key: null,
})

const getTranslations = (state: State) => state.trans.restoreWalletScreen

type Props = {
  navigateToWallet: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
}

const RestoreWalletScreen = ({navigateToWallet, translations}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <Text>{translations.title}</Text>

      <Button
        onPress={navigateToWallet}
        title={translations.restoreButton}
      />
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    navigateToWallet: ({navigation}) => (event) => navigation.dispatch(resetNavigationAction),
  })
)(RestoreWalletScreen)
