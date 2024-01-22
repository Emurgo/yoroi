import {useIsFocused} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Button, KeyboardAvoidingView, Spacer, StatusBar} from '../../../../components'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useHasPendingTx, useIsOnline} from '../../../../yoroi-wallets/hooks'
import {Amounts} from '../../../../yoroi-wallets/utils'
import {memoMaxLenght} from '../../common/constants'
import {AddressErrorWrongNetwork} from '../../common/errors'
import {useNavigateTo} from '../../common/navigation'
import {useSend} from '../../common/SendContext'
import {useStrings} from '../../common/strings'
import {useSendAddress} from '../../common/useSendAddress'
import {useSendReceiver} from '../../common/useSendReceiver'
import {InputMemo} from './InputMemo/InputMemo'
import {InputReceiver} from './InputReceiver/InputReceiver'
import {NotifySupportedNameServers} from './NotifySupportedNameServers/NotifySupportedNameServers'
import {SelectNameServer} from './SelectNameServer/SelectNameServer'
import {ShowErrors} from './ShowErrors'

export const StartMultiTokenTxScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const wallet = useSelectedWallet()
  const {track} = useMetrics()
  const isFocused = useIsFocused()

  React.useEffect(() => {
    track.sendInitiated()
  }, [track])

  const hasPendingTx = useHasPendingTx(wallet)
  const isOnline = useIsOnline(wallet)

  const {targets, selectedTargetIndex, memo, memoChanged, receiverResolveChanged} = useSend()
  const {amounts} = targets[selectedTargetIndex].entry
  const receiver = targets[selectedTargetIndex].receiver
  const shouldOpenAddToken = Amounts.toArray(amounts).length === 0

  const {isResolvingAddressess, receiverError, isUnsupportedDomain, isNotResolvedDomain} = useSendReceiver()
  const {isValidatingAddress, addressError, addressValidated} = useSendAddress()

  const isLoading = isResolvingAddressess || isValidatingAddress
  const {hasReceiverError, receiverErrorMessage} = useReceiverError({
    isNotResolvedDomain,
    isUnsupportedDomain,
    isLoading,
    receiverError,
    addressError,
  })
  const isValidAddress = addressValidated && !hasReceiverError

  const hasMemoError = memo.length > memoMaxLenght

  const canGoNext = isOnline && !hasPendingTx && isValidAddress && !hasMemoError

  const handleOnNext = () => {
    if (shouldOpenAddToken) {
      navigateTo.addToken()
    } else {
      navigateTo.selectedTokens()
    }
  }
  const handleOnChangeReceiver = (text: string) => {
    if (!isFocused) return // prevent automatic calls when the screen is not focused. RN TextInput bug
    receiverResolveChanged(text)
  }
  const handleOnChangeMemo = (text: string) => memoChanged(text)

  return (
    <View style={styles.container}>
      <StatusBar type="dark" />

      <KeyboardAvoidingView style={styles.flex}>
        <ScrollView style={styles.flex} bounces={false}>
          <ShowErrors />

          <NotifySupportedNameServers />

          <InputReceiver
            value={receiver.resolve}
            onChangeText={handleOnChangeReceiver}
            isLoading={isLoading}
            isValid={isValidAddress}
            error={hasReceiverError}
            errorText={receiverErrorMessage}
          />

          <SelectNameServer />

          <Spacer height={16} />

          <InputMemo value={memo} onChangeText={handleOnChangeMemo} isValid={!hasMemoError} />
        </ScrollView>

        <Actions>
          <NextButton
            onPress={handleOnNext}
            title={strings.next}
            disabled={!canGoNext}
            testID="nextButton"
            shelleyTheme
          />
        </Actions>
      </KeyboardAvoidingView>
    </View>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const useReceiverError = ({
  isNotResolvedDomain,
  isUnsupportedDomain,
  receiverError,
  addressError,
  isLoading,
}: {
  isNotResolvedDomain: boolean
  isUnsupportedDomain: boolean
  isLoading: boolean
  receiverError: Error | null
  addressError: Error | null
}) => {
  const strings = useStrings()

  // NOTE: order matters
  if (isLoading) return {hasReceiverError: false, receiverErrorMessage: ''}
  if (isUnsupportedDomain) return {hasReceiverError: true, receiverErrorMessage: strings.helperAddressErrorInvalid}
  if (isNotResolvedDomain)
    return {hasReceiverError: true, receiverErrorMessage: strings.helperResolverErrorDomainNotFound}
  if (receiverError != null) return {hasReceiverError: true, receiverErrorMessage: strings.helperAddressErrorInvalid}
  if (addressError instanceof AddressErrorWrongNetwork)
    return {hasReceiverError: true, receiverErrorMessage: strings.helperAddressErrorWrongNetwork}
  if (addressError != null) return {hasReceiverError: true, receiverErrorMessage: strings.helperAddressErrorInvalid}

  return {
    hasReceiverError: false,
    receiverErrorMessage: '',
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  flex: {
    flex: 1,
  },
  actions: {
    paddingVertical: 16,
  },
})

const NextButton = Button
