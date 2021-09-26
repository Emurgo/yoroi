// @flow

/**
 * Step 3 for the Catalyst registration
 * Confirm PIN generated in previous step
 */

import {useNavigation} from '@react-navigation/native'
import _ from 'lodash'
import type {ComponentType} from 'react'
import React, {useEffect, useState} from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, injectIntl} from 'react-intl'
import {SafeAreaView, View} from 'react-native'
import {connect} from 'react-redux'

import {showErrorDialog} from '../../actions'
import {generateVotingKeys, generateVotingTransaction} from '../../actions/voting'
import {errorMessages} from '../../i18n/global-messages'
import {CATALYST_ROUTES} from '../../RoutesList'
import {isHWSelector} from '../../selectors'
import PinInputKeyboard from '../Common/PinInputKeyboard'
import {ProgressStep, Text} from '../UiKit'
import styles from './styles/Step3.style'

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step3.subTitle',
    defaultMessage: '!!!Enter PIN',
  },
  description: {
    id: 'components.catalyst.step3.description',
    defaultMessage: '!!!Please enter the PIN as you will need it every time you want to access the Catalyst Voting app',
  },
})

const PIN_LENGTH = 4

type Props = {
  pin: Array<String>,
  isHW: boolean,
  intl: IntlShape,
}

const Step3 = ({intl, pin, isHW}: Props) => {
  const navigation = useNavigation()
  const [confirmPin, setPin] = useState('')

  useEffect(() => {
    generateVotingKeys()
  }, [])

  const pinChange = (enteredPin: string) => {
    setPin(enteredPin)
    if (enteredPin.length === 4) {
      if (pin.join('') === enteredPin) {
        if (isHW) {
          navigation.navigate(CATALYST_ROUTES.STEP5)
        } else {
          navigation.navigate(CATALYST_ROUTES.STEP4)
        }
      } else {
        showErrorDialog(errorMessages.incorrectPin, intl)
      }
    }
  }
  const pinCards = (
    <View style={styles.pinContainer}>
      {_.range(0, PIN_LENGTH).map((value, index) => {
        return (
          <View
            key={index}
            style={[
              styles.pin,
              index < PIN_LENGTH - 1 && styles.mr10,
              index === confirmPin.length ? styles.pinHighlight : styles.pinNormal,
              index > confirmPin.length && styles.pinInactive,
            ]}
          >
            <Text style={styles.pinNumber}>{confirmPin[index]}</Text>
          </View>
        )
      })}
    </View>
  )

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={3} totalSteps={6} />
      <View style={styles.container}>
        <View>
          <Text style={styles.subTitle}>{intl.formatMessage(messages.subTitle)}</Text>
          <Text style={styles.description}>{intl.formatMessage(messages.description)}</Text>
        </View>
        {pinCards}
      </View>
      <PinInputKeyboard pinLength={PIN_LENGTH} onPinChange={pinChange} />
    </SafeAreaView>
  )
}

export default (injectIntl(
  connect(
    (state) => ({
      pin: state.voting.pin,
      isHW: isHWSelector(state),
    }),
    {
      generateVotingKeys,
      generateVotingTransaction,
    },
  )(Step3),
): ComponentType<{}>)
