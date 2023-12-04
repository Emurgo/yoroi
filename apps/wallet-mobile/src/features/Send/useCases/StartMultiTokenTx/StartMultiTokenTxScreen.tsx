import {Resolver} from '@yoroi/types'
import _ from 'lodash'
import React from 'react'
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Button, Spacer} from '../../../../components'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useHasPendingTx, useIsOnline} from '../../../../yoroi-wallets/hooks'
import {Amounts} from '../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../common/navigation'
import {isDomain, isHandle, useResolver, useResolverAddresses} from '../../common/ResolverProvider'
import {useSend} from '../../common/SendContext'
import {useStrings} from '../../common/strings'
import {InputMemo, maxMemoLength} from './InputMemo'
import {getAddressErrorMessage, ResolveAddress, useValidAddress} from './InputReceiver/ResolveAddress'
import {Notice} from './Notice/Notice'
import {ShowErrors} from './ShowErrors'

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

  const {targets, selectedTargetIndex, receiverChanged, memo, memoChanged, addressChanged} = useSend()
  const {address, amounts} = targets[selectedTargetIndex].entry
  const shouldOpenAddToken = Amounts.toArray(amounts).length === 0
  const receiver = targets[selectedTargetIndex].receiver
  const {resolvedAddressSelected, resolvedAddressSelectedChanged} = useResolver()
  const [succesfulResolvedAddresses, setSuccesfulResolvedAddresses] = React.useState<Resolver.AddressesResponse>([])

  const addressValidationEnabled =
    (succesfulResolvedAddresses.length === 1 && resolvedAddressSelected?.address !== null) ||
    (!isDomain(receiver) && !isHandle(receiver))

  const {error, isLoading} = useValidAddress(
    {wallet, receiver: resolvedAddressSelected?.address ?? receiver},
    {
      onSettled(address, error) {
        if (error) {
          addressChanged('')
        } else {
          addressChanged(address ?? '')
        }
      },
      enabled: addressValidationEnabled,
    },
  )

  const addressResolutionEnabled =
    succesfulResolvedAddresses.length === 0 &&
    error != null &&
    resolvedAddressSelected === null &&
    (isDomain(receiver) || isHandle(receiver))

  useResolverAddresses(
    {receiver},
    {
      onSettled(addresses) {
        const succesfulResolvedAddresses = addresses?.filter(({address}) => address !== null) ?? []

        if (succesfulResolvedAddresses?.length === 1) {
          resolvedAddressSelectedChanged(succesfulResolvedAddresses[0])
        }

        setSuccesfulResolvedAddresses(succesfulResolvedAddresses)
      },
      enabled: addressResolutionEnabled,
    },
  )

  const addressErrorMessage = error != null ? getAddressErrorMessage(error, strings) : ''
  const isValid = isOnline && !hasPendingTx && _.isEmpty(error) && memo.length <= maxMemoLength && address.length > 0

  const onNext = () => {
    if (shouldOpenAddToken) {
      navigateTo.addToken()
    } else {
      navigateTo.selectedTokens()
    }
  }

  const onChangeReceiver = (text: string) => {
    receiverChanged(text)
    resolvedAddressSelectedChanged(null)
    setSuccesfulResolvedAddresses([])
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={86}
      >
        <ScrollView style={styles.flex} bounces={false}>
          <Notice />

          <ShowErrors />

          <Spacer height={16} />

          <ResolveAddress
            onChangeReceiver={onChangeReceiver}
            receiver={receiver}
            address={address}
            errorMessage={addressErrorMessage}
            isLoading={isLoading}
          />

          <Spacer height={16} />

          <InputMemo memo={memo} onChangeText={memoChanged} />
        </ScrollView>

        <Actions>
          <NextButton
            onPress={onNext}
            title={strings.next}
            disabled={!isValid || isLoading}
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
