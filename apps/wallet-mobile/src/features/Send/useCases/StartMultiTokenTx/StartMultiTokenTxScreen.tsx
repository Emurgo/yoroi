import _ from 'lodash'
import React from 'react'
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Button, Spacer} from '../../../../components'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {isEmptyString} from '../../../../utils'
import {useHasPendingTx, useIsOnline} from '../../../../yoroi-wallets/hooks'
import {Amounts} from '../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../common/navigation'
import {useSend} from '../../common/SendContext'
import {useStrings} from '../../common/strings'
import {useSendAddress} from '../../common/useSendAddress'
import {useSendInputReceiver} from '../../common/useSendInputReceiver'
import {InputMemo, maxMemoLength} from './InputMemo'
import {InputReceiver} from './InputReceiver/InputReceiver'
import {SelectAddressByNameServer} from './SelectAddressByNameServer/SelectAddressByNameServer'
import {ShowErrors} from './ShowErrors'
import {ShowSupportedResolverServices} from './ShowSupportedResolverServices/ShowSupportedResolverServices'

export const StartMultiTokenTxScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const wallet = useSelectedWallet()
  const {track} = useMetrics()

  React.useEffect(() => {
    track.sendInitiated()
  }, [track])

  const hasPendingTx = useHasPendingTx(wallet)
  const isOnline = useIsOnline(wallet)

  const {targets, selectedTargetIndex, memo, memoChanged, receiverResolveChanged} = useSend()
  const {address, amounts} = targets[selectedTargetIndex].entry
  const receiver = targets[selectedTargetIndex].receiver
  const shouldOpenAddToken = Amounts.toArray(amounts).length === 0

  const {isResolvingAddressess, receiverError} = useSendInputReceiver()
  const {isValidatingAddress, addressError, addressValidated} = useSendAddress()

  const isLoading = isResolvingAddressess || isValidatingAddress
  const hasError = !isLoading && (receiverError != null || addressError != null)
  const isValidAddress = addressValidated && !hasError

  // const addressErrorMessage = React.useMemo(
  //   () =>
  //     addressValidationError != null && succesfulResolvedAddresses.length < 2
  //       ? isDomain(receiver)
  //         ? strings.addressInputErrorInvalidDomain
  //         : strings.addressInputErrorInvalidAddress
  //       : '',
  //   [
  //     addressValidationError,
  //     receiver,
  //     strings.addressInputErrorInvalidAddress,
  //     strings.addressInputErrorInvalidDomain,
  //     succesfulResolvedAddresses.length,
  //   ],
  // )
  const isValid = React.useMemo(
    () =>
      isOnline &&
      !hasPendingTx &&
      // _.isEmpty(addressValidationError) &&
      memo.length <= maxMemoLength &&
      !isEmptyString(address),
    [address, hasPendingTx, isOnline, memo.length],
  )

  const handleOnNext = () => {
    if (shouldOpenAddToken) {
      navigateTo.addToken()
    } else {
      navigateTo.selectedTokens()
    }
  }

  const handleOnChangeReceiver = (text: string) => receiverResolveChanged(text)

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={86}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView style={styles.flex} bounces={false}>
          <ShowErrors />

          <Spacer height={16} />

          <ShowSupportedResolverServices />

          <SelectAddressByNameServer />

          {/* <Spacer height={16} /> */}

          <InputReceiver
            value={receiver.resolve}
            onChangeText={handleOnChangeReceiver}
            isLoading={isLoading}
            isValid={isValidAddress}
            error={hasError}
            errorText={hasError ? 'mehhhh' : ''}
          />

          <Spacer height={16} />

          <InputMemo memo={memo} onChangeText={memoChanged} />
        </ScrollView>

        <Actions>
          <NextButton
            onPress={handleOnNext}
            title={strings.next}
            disabled={!isValid}
            testID="nextButton"
            shelleyTheme
          />
        </Actions>
      </KeyboardAvoidingView>
    </View>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  actions: {
    paddingVertical: 16,
  },
})

const NextButton = Button
