// @flow

import React from 'react'
import {compose} from 'redux'
import {View, TouchableHighlight, Text} from 'react-native'
import {withHandlers} from 'recompose'

import CustomText from '../../components/CustomText'
import styles from './TxNavigationButtons.style'
import {COLORS} from '../../styles/config'
import {MAIN_ROUTES} from '../../AppNavigator'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  navigateToReceive: () => mixed,
  navigateToSend: () => mixed,
};
const TxNavigationButtons = ({navigation, navigateToReceive, navigateToSend}: Props) => (
  <View style={styles.navigationButtonsContainer}>
    <TouchableHighlight
      style={styles.button}
      activeOpacity={0.9}
      underlayColor={COLORS.BLACK}
      onPress={navigateToSend}
    >
      <View style={styles.sendButton}>
        <CustomText>
          <Text>i18nSEND</Text>
        </CustomText>
      </View>
    </TouchableHighlight>

    <TouchableHighlight
      style={styles.button}
      activeOpacity={0.9}
      underlayColor={COLORS.WHITE}
      onPress={navigateToReceive}
    >
      <View style={styles.receiveButton}>
        <CustomText>
          <Text style={styles.receiveButtonText}>i18nRECEIVE</Text>
        </CustomText>
      </View>
    </TouchableHighlight>
  </View>
)

export default compose(
  withHandlers({
    navigateToReceive: ({navigation}) => (event) => navigation.navigate(MAIN_ROUTES.RECEIVE),
    navigateToSend: ({navigation}) => (event) => navigation.navigate(MAIN_ROUTES.SEND),
  })
)(TxNavigationButtons)
