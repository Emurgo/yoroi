// @flow

/**
 * Step 3 for the Catalyst registration
 * Confirm PIN generated in previous step
 */

import React, {useEffect, useState} from 'react'
import {ScrollView, View, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages} from 'react-intl'
import {useDispatch, useSelector} from 'react-redux'

import {generateVotingKeys} from '../../actions/voting'
import {isHWSelector} from '../../selectors'
import {ProgressStep, Spacer} from '../UiKit'
import PinInputKeyboard from '../Common/PinInputKeyboard'
import {CATALYST_ROUTES} from '../../RoutesList'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../actions'
import {Description, Row, Title, PinBox} from './components'

import type {IntlShape} from 'react-intl'
import {useNavigation} from '@react-navigation/native'

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

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
})

const PIN_LENGTH = 4

type Props = {
  intl: IntlShape,
}

const Step3 = ({intl}: Props) => {
  const navigation = useNavigation()
  const pin = useSelector((state) => state.voting.pin)
  const isHW = useSelector(isHWSelector)
  const [confirmPin, setPin] = useState('')

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(generateVotingKeys())
  }, [dispatch])

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

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeAreaView}>
      <ProgressStep currentStep={3} totalSteps={6} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

        <Title>{intl.formatMessage(messages.subTitle)}</Title>

        <Spacer height={16} />

        <Description>{intl.formatMessage(messages.description)}</Description>

        <Spacer height={48} />

        <Row style={{justifyContent: 'center'}}>
          <PinBox selected={confirmPin.length === 0}>{confirmPin[0]}</PinBox>
          <Spacer width={16} />
          <PinBox selected={confirmPin.length === 1}>{confirmPin[1]}</PinBox>
          <Spacer width={16} />
          <PinBox selected={confirmPin.length === 2}>{confirmPin[2]}</PinBox>
          <Spacer width={16} />
          <PinBox selected={confirmPin.length === 3}>{confirmPin[3]}</PinBox>
        </Row>
      </ScrollView>

      <Spacer fill />

      <View style={{height: 250}}>
        <PinInputKeyboard pinLength={PIN_LENGTH} onPinChange={pinChange} />
      </View>
    </SafeAreaView>
  )
}

export default injectIntl(Step3)
