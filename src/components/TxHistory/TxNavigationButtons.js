// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TouchableHighlight} from 'react-native'
import {withHandlers} from 'recompose'

import CustomText from '../../components/CustomText'
import styles from './styles/TxNavigationButtons.style'
import {COLORS} from '../../styles/config'
import {MAIN_ROUTES} from '../../RoutesList'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTrans = (state) => state.trans.txHistoryNavigationButtons

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  navigateToReceive: () => mixed,
  navigateToSend: () => mixed,
  trans: SubTranslation<typeof getTrans>,
};

const TxNavigationButtons = ({navigation, navigateToReceive, navigateToSend, trans}: Props) => (
  <View style={styles.navigationButtonsContainer}>
    <TouchableHighlight
      style={styles.button}
      activeOpacity={0.9}
      underlayColor={COLORS.BLACK}
      onPress={navigateToSend}
    >
      <View style={styles.sendButton}>
        <CustomText>{trans.sendButton}</CustomText>
      </View>
    </TouchableHighlight>

    <TouchableHighlight
      style={styles.button}
      activeOpacity={0.9}
      underlayColor={COLORS.WHITE}
      onPress={navigateToReceive}
    >
      <View style={styles.receiveButton}>
        <CustomText style={styles.receiveButtonText}>{trans.receiveButton}</CustomText>
      </View>
    </TouchableHighlight>
  </View>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withHandlers({
    navigateToReceive: ({navigation}) => (event) => navigation.navigate(MAIN_ROUTES.RECEIVE),
    navigateToSend: ({navigation}) => (event) => navigation.navigate(MAIN_ROUTES.SEND),
  }),
)(TxNavigationButtons)
