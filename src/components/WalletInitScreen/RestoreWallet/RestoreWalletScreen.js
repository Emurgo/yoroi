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

type Props = {
  navigateToWallet: () => mixed,
  text: {
    title: string,
    restoreButton: string,
  },
};

const RestoreWalletScreen = ({navigateToWallet, text}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <CustomText>{text.title}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToWallet}
        style={styles.button}
      >
        <CustomText>{text.restoreButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    text: state.l10n.restoreWalletScreen,
  })),
  withHandlers({
    navigateToWallet: ({navigation}) => (event) => navigation.dispatch(resetNavigationAction),
  })
)(RestoreWalletScreen)
