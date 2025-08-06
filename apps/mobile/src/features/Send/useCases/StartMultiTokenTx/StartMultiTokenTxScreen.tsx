import {useIsFocused} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import * as React from 'react'
import {TextInput, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {memoMaxLenght} from '~/features/Send/common/constants'
import {AddressErrorWrongNetwork} from '~/features/Send/common/errors'
import {useNextTick} from '~/features/Send/common/hooks/useNextTick'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {useSendAddress} from '~/features/Send/common/useSendAddress'
import {useSendReceiver} from '~/features/Send/common/useSendReceiver'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {ScrollView, useScrollView} from '~/ui/ScrollView/ScrollView'
import {Space} from '~/ui/Space/Space'
import {useHasPendingTx, useIsOnline} from '~/wallets/hooks'
import {InputMemo} from './InputMemo/InputMemo'
import {InputReceiver} from './InputReceiver/InputReceiver'
import {NotifySupportedNameServers} from './NotifySupportedNameServers/NotifySupportedNameServers'
import {SelectNameServer} from './SelectNameServer/SelectNameServer'
import {ShowErrors} from './ShowErrors'

export const StartMultiTokenTxScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {wallet} = useSelectedWallet()
  const {track} = useMetrics()
  const isFocused = useIsFocused()

  React.useEffect(() => {
    track.sendInitiated()
  }, [track])

  const hasPendingTx = useHasPendingTx({wallet})
  const isOnline = useIsOnline(wallet)

  const {
    targets,
    selectedTargetIndex,
    memo,
    memoChanged,
    receiverResolveChanged,
  } = useTransfer()
  const {amounts} = targets[selectedTargetIndex].entry
  const receiver = targets[selectedTargetIndex].receiver
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()

  const {
    isWrongBlockchainError,
    isResolvingAddressess,
    receiverError,
    isUnsupportedDomain,
    isNotResolvedDomain,
  } = useSendReceiver()
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
    <KeyboardAvoidingView style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <SafeAreaView
        edges={['bottom', 'right', 'left']}
        style={[a.gap_lg, a.py_lg, a.flex_1]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={[a.flex_1, a.px_lg]}
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

          <Space.Height.lg />

          <InputMemo
            value={memo}
            onChangeText={handleOnChangeMemo}
            isValid={!hasMemoError}
          />
        </ScrollView>

        <Actions
          style={isScrollBarShown && [a.border_t, {borderTopColor: p.gray_200}]}
        >
          <Padding>
            <NextButton
              onPress={handleOnNext}
              title={strings.send.next}
              disabled={!canGoNext}
              testID="nextButton"
            />
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
  return <View style={[a.px_lg, style]} {...props} />
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
  if (isUnsupportedDomain)
    return {
      hasReceiverError: true,
      receiverErrorMessage: strings.send.helperAddressErrorInvalid,
    }
  if (isWrongBlockchainError)
    return {
      hasReceiverError: true,
      receiverErrorMessage: strings.send.helperAddressErrorWrongBlockchain,
    }
  if (isNotResolvedDomain)
    return {
      hasReceiverError: true,
      receiverErrorMessage: strings.send.helperResolverErrorDomainNotFound,
    }
  if (receiverError != null)
    return {
      hasReceiverError: true,
      receiverErrorMessage: strings.send.helperAddressErrorInvalid,
    }
  if (addressError instanceof AddressErrorWrongNetwork)
    return {
      hasReceiverError: true,
      receiverErrorMessage: strings.send.helperAddressErrorWrongNetwork,
    }
  if (addressError != null)
    return {
      hasReceiverError: true,
      receiverErrorMessage: strings.send.helperAddressErrorInvalid,
    }

  return {
    hasReceiverError: false,
    receiverErrorMessage: '',
  }
}

const NextButton = Button
