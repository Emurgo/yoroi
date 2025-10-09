import {atoms as a} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'

import {useIsFocused} from '@react-navigation/native'
import * as React from 'react'
import {TextInput} from 'react-native'

import {memoMaxLenght} from '~/features/Send/common/constants'
import {AddressErrorWrongNetwork} from '~/features/Send/common/errors'
import {useNextTick} from '~/features/Send/common/hooks/useNextTick'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {useSendAddress} from '~/features/Send/common/useSendAddress'
import {useSendReceiver} from '~/features/Send/common/useSendReceiver'
import {useHasPendingTx} from '~/features/Transactions/hooks/useHasPendingTx'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/useScrollView'
import {Space} from '~/ui/Space/Space'

import {InputMemo} from './InputMemo/InputMemo'
import {InputReceiver} from './InputReceiver/InputReceiver'
import {NotifySupportedNameServers} from './NotifySupportedNameServers/NotifySupportedNameServers'
import {SelectNameServer} from './SelectNameServer/SelectNameServer'
import {ShowErrors} from './ShowErrors'

export const StartMultiTokenTxScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {wallet} = useSelectedWallet()
  const {track} = useMetrics()
  const isFocused = useIsFocused()

  React.useEffect(() => {
    track.sendInitiated()
  }, [track])

  const hasPendingTx = useHasPendingTx({wallet})

  const {
    targets,
    selectedTargetIndex,
    memo,
    memoChanged,
    receiverResolveChanged,
  } = useTransfer()
  const {amounts} = targets[selectedTargetIndex].entry
  const receiver = targets[selectedTargetIndex].receiver
  const {scrollViewRef} = useScrollView()

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
    addressError: addressError ?? null,
  })

  const isValidAddress = addressValidated && !hasReceiverError
  const hasMemoError = memo.length > memoMaxLenght
  const canGoNext = !hasPendingTx && isValidAddress && !hasMemoError

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
    <SafeArea>
      <ScrollView
        ref={scrollViewRef}
        style={[a.flex_1, a.px_lg]}
        bounces={false}
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

      <SafeArea.Footer>
        <NextButton
          onPress={handleOnNext}
          title={strings.send.next}
          disabled={!canGoNext}
          testID="nextButton"
        />
      </SafeArea.Footer>
    </SafeArea>
  )
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
