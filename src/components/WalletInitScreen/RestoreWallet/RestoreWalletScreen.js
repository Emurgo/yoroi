// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {NavigationActions, StackActions} from 'react-navigation'

import CustomText from '../../CustomText'
import Screen from '../../Screen'

import {COLORS} from '../../../styles/config'
import styles from './RestoreWalletScreen.style'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const resetNavigationAction = StackActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({
      // Fixme: why ROOT_ROUTES.MAIN is not working
      routeName: 'main',
    }),
  ],
  key: null,
})

const getTrans = (state: State) => state.trans.restoreWalletScreen

type Props = {
  navigateToWallet: () => mixed,
  trans: SubTranslation<typeof getTrans>,
};

const RestoreWalletScreen = ({navigateToWallet, trans}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <CustomText>{trans.title}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToWallet}
        style={styles.button}
      >
        <CustomText>{trans.restoreButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withHandlers({
    navigateToWallet: ({navigation}) => (event) => navigation.dispatch(resetNavigationAction),
  })
)(RestoreWalletScreen)
