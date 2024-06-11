import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {ProgressStep, Spacer} from '../../components'
import {BACKSPACE, NumericKeyboard} from '../../components/NumericKeyboard'
import {showErrorDialog} from '../../kernel/dialogs'
import {errorMessages} from '../../kernel/i18n/global-messages'
import {Description, PinBox, Row, Title} from './components'

const PIN_LENGTH = 4

type Props = {
  pin: string
  onNext: () => void
}
export const ConfirmPin = ({pin, onNext}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const [confirmPin, setConfirmPin] = useState('')
  const styles = useStyles()

  const onKeyDown = (key: string) => {
    const enteredPin = key === BACKSPACE ? confirmPin.slice(0, confirmPin.length - 1) : confirmPin + key
    setConfirmPin(enteredPin)
    if (enteredPin.length !== PIN_LENGTH) return

    if (enteredPin === pin) {
      onNext()
    } else {
      showErrorDialog(errorMessages.incorrectPin, intl)
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={3} totalSteps={6} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

        <Title>{strings.subTitle}</Title>

        <Spacer height={16} />

        <Description>{strings.description}</Description>

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
        <NumericKeyboard onKeyDown={onKeyDown} />
      </View>
    </SafeAreaView>
  )
}

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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    contentContainer: {
      ...atoms.px_lg,
    },
  })

  return styles
}

const useStrings = () => {
  const intl = useIntl()

  return {
    subTitle: intl.formatMessage(messages.subTitle),
    description: intl.formatMessage(messages.description),
  }
}
