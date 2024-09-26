import {useIsFocused} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import _ from 'lodash'
import React from 'react'
import {StyleSheet, TextInput, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/Button'
import {KeyboardAvoidingView} from '../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {ScrollView, useScrollView} from '../../../../components/ScrollView/ScrollView'
import {Space} from '../../../../components/Space/Space'
import {useNextTick} from '../../../../hooks/useNextTick'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useHasPendingTx, useIsOnline} from '../../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {memoMaxLenght} from '../../common/constants'
import {AddressErrorWrongNetwork} from '../../common/errors'
import {useNavigateTo} from '../../common/navigation'
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
  const styles = useStyles()
  const navigateTo = useNavigateTo()
  const {wallet} = useSelectedWallet()
  const {track} = useMetrics()
  const isFocused = useIsFocused()

  React.useEffect(() => {
    track.sendInitiated()
  }, [track])

  const hasPendingTx = useHasPendingTx({wallet})
  const isOnline = useIsOnline(wallet)

  const {targets, selectedTargetIndex, memo, memoChanged, receiverResolveChanged} = useTransfer()
  const {amounts} = targets[selectedTargetIndex].entry
  const receiver = targets[selectedTargetIndex].receiver
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()

  const {isWrongBlockchainError, isResolvingAddressess, receiverError, isUnsupportedDomain, isNotResolvedDomain} =
    useSendReceiver()
  const {isValidatingAddress, addressError, addressValidated} = useSendAddress()

  const isLoading = isResolvingAddressess || isValidatingAddress
  const {hasReceiverError, receiverErrorMessage} = useReceiverError({
    isWrongBlockchainError,
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
    const shouldOpenAddToken = Object.keys(amounts).length === 0
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

  const inputRef = React.useRef<TextInput>(null)
  const focusOnReceiver = React.useCallback(() => inputRef.current?.focus(), [])
  useNextTick(focusOnReceiver)

  return (
    <KeyboardAvoidingView style={[styles.flex, styles.root]}>
      <SafeAreaView edges={['bottom', 'right', 'left']} style={[styles.safeAreaView, styles.flex]}>
        <ScrollView
          ref={scrollViewRef}
          style={[styles.flex, styles.padding]}
          bounces={false}
          onScrollBarChange={setIsScrollBarShown}
        >
          <ShowErrors />

          <NotifySupportedNameServers />

          <InputReceiver
            value={receiver.resolve}
            onChangeText={handleOnChangeReceiver}
            isLoading={isLoading}
            isValid={isValidAddress}
            error={hasReceiverError}
            errorText={receiverErrorMessage}
            ref={inputRef}
          />

          <SelectNameServer />

          <Space height="lg" />

          <InputMemo value={memo} onChangeText={handleOnChangeMemo} isValid={!hasMemoError} />
        </ScrollView>

        <Actions style={isScrollBarShown && styles.actionsScroll}>
          <Padding>
            <NextButton onPress={handleOnNext} title={strings.next} disabled={!canGoNext} testID="nextButton" />
          </Padding>
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const Actions = ({style, ...props}: ViewProps) => {
  return <View style={style} {...props} />
}

// NOTE: just to display the scrollable line on top of action
const Padding = ({style, ...props}: ViewProps) => {
  const styles = useStyles()
  return <View style={[styles.padding, style]} {...props} />
}

const useReceiverError = ({
  isWrongBlockchainError,
  isNotResolvedDomain,
  isUnsupportedDomain,
  receiverError,
  addressError,
  isLoading,
}: {
  isWrongBlockchainError: boolean
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
  if (isWrongBlockchainError)
    return {hasReceiverError: true, receiverErrorMessage: strings.helperAddressErrorWrongBlockchain}
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
const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
    },
    safeAreaView: {
      ...atoms.gap_lg,
      ...atoms.py_lg,
    },
    flex: {
      ...atoms.flex_1,
    },
    padding: {
      ...atoms.px_lg,
    },
    actionsScroll: {
      ...atoms.border_t,
      borderTopColor: color.gray_200,
    },
  })
  return styles
}

const NextButton = Button
