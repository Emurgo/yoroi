import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../../components'
import {BACKSPACE, NumericKeyboard} from '../../../../components/NumericKeyboard'
import {showErrorDialog} from '../../../../kernel/dialogs'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import {Actions, Description, PinBox, Row, Stepper} from '../../common/components'
import {useStrings} from '../../common/strings'

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
  const [done, setDone] = React.useState(false)

  const onKeyDown = (key: string) => {
    const enteredPin = key === BACKSPACE ? confirmPin.slice(0, confirmPin.length - 1) : confirmPin + key
    setConfirmPin(enteredPin)
    if (enteredPin.length !== PIN_LENGTH) return

    if (enteredPin === pin) {
      setDone(true)
    } else {
      showErrorDialog(errorMessages.incorrectPin, intl)
    }
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeAreaView}>
      <Stepper title={strings.step3Title} currentStep={3} totalSteps={4} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Description>{strings.step3Description}</Description>

        <Spacer height={16} />

        <Spacer height={48} />

        <Row style={{justifyContent: 'center'}}>
          <PinBox done={done} selected={confirmPin.length === 0}>
            {confirmPin[0]}
          </PinBox>

          <Spacer width={16} />

          <PinBox done={done} selected={confirmPin.length === 1}>
            {confirmPin[1]}
          </PinBox>

          <Spacer width={16} />

          <PinBox done={done} selected={confirmPin.length === 2}>
            {confirmPin[2]}
          </PinBox>

          <Spacer width={16} />

          <PinBox done={done} selected={confirmPin.length === 3}>
            {confirmPin[3]}
          </PinBox>
        </Row>
      </ScrollView>

      <Spacer fill />

      <Actions>
        <Button shelleyTheme onPress={() => onNext()} title={strings.continueButton} disabled={!done} />
      </Actions>

      <NumericKeyboard onKeyDown={onKeyDown} />
    </SafeAreaView>
  )
}

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
