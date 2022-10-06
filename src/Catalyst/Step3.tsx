import {useNavigation} from '@react-navigation/native'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {PinInputKeyboard, ProgressStep, Spacer} from '../components'
import {errorMessages} from '../i18n/global-messages'
import {showErrorDialog} from '../legacy/actions'
import {CatalystRouteNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {Description, PinBox, Row, Title} from './components'
import {useCreateVotingRegTx, VotingRegTxData} from './hooks'

const PIN_LENGTH = 4

type Props = {
  pin: string
  setVotingRegTxData: (votingRegTxData?: VotingRegTxData) => void
}
export const Step3 = ({pin, setVotingRegTxData}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation<CatalystRouteNavigation>()
  const wallet = useSelectedWallet()
  const {createVotingRegTx} = useCreateVotingRegTx({wallet})
  const [confirmPin, setConfirmPin] = useState('')

  const pinChange = (enteredPin: string) => {
    setConfirmPin(enteredPin)
    if (enteredPin.length === 4) {
      if (pin === enteredPin) {
        if (wallet.isHW) {
          createVotingRegTx(
            {pin},
            {
              onSuccess: (votingRegTxData) => {
                setVotingRegTxData(votingRegTxData)
                navigation.navigate('catalyst-transaction')
              },
            },
          )
        } else {
          navigation.navigate('catalyst-generate-trx')
        }
      } else {
        showErrorDialog(errorMessages.incorrectPin, intl)
      }
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
        <PinInputKeyboard pinLength={PIN_LENGTH} onPinChange={pinChange} />
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

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    subTitle: intl.formatMessage(messages.subTitle),
    description: intl.formatMessage(messages.description),
  }
}
