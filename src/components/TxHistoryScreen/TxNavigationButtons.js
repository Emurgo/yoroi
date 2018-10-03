/**
 * @flow
 */

import React, {Component} from 'react'
import {View, TouchableHighlight, Text} from 'react-native'

import CustomText from '../../components/CustomText'
import styles from './TxNavigationButtons.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

type Props = {navigation: NavigationScreenProp<NavigationState>};
class TxNavigationButtons extends Component<Props> {
  render() {
    const {navigation} = this.props

    return (
      <View style={styles.navigationButtonsContainer}>
        <TouchableHighlight
          style={styles.button}
          activeOpacity={0.9}
          underlayColor="#000"
          onPress={() => {
            navigation.navigate('send')
          }}
        >
          <View style={styles.sendButton}>
            <CustomText>
              <Text>SEND</Text>
            </CustomText>
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          activeOpacity={0.9}
          underlayColor="#fff"
          onPress={() => {
            navigation.navigate('history')
          }}
        >
          <View style={styles.receiveButton}>
            <CustomText>
              <Text style={styles.receiveButtonText}>RECEIVE</Text>
            </CustomText>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
}

export default TxNavigationButtons
