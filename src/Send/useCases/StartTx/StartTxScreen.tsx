import {useNavigation} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../components'
import {TxHistoryRouteNavigation} from '../../../navigation'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {useHasPendingTx, useIsOnline} from '../../../yoroi-wallets/hooks'
import {useSend} from '../../shared/SendContext'
import {useStrings} from '../../shared/strings'
import {InputMemo, maxMemoLength} from './InputMemo'
import {getAddressErrorMessage, ResolveAddress, useReceiver} from './InputReceiver/ResolveAddress'
import {ShowErrors} from './ShowErrors'

export const StartTxScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const wallet = useSelectedWallet()

  const hasPendingTx = useHasPendingTx(wallet)
  const isOnline = useIsOnline(wallet)

  const {targets, selectedTargetIndex, receiverChanged, memo, memoChanged, addressChanged} = useSend()
  const {address, amounts} = targets[selectedTargetIndex].entry
  const shouldOpenSelectToken = Object.keys(amounts).length === 0
  const receiver = targets[selectedTargetIndex].receiver
  const {error, isLoading} = useReceiver(
    {wallet, receiver},
    {
      onSettled(address, error) {
        if (error) {
          addressChanged('')
        } else {
          addressChanged(address ?? '')
        }
      },
    },
  )
  const addressErrorMessage = error != null ? getAddressErrorMessage(error, strings) : ''
  const isValid = isOnline && !hasPendingTx && _.isEmpty(error) && memo.length <= maxMemoLength && address.length > 0

  const onNext = () => {
    navigateTo.selectedTokens()
    if (shouldOpenSelectToken) navigateTo.selectToken()
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <ShowErrors />

      <Spacer height={16} />

      <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="never">
        <ResolveAddress
          onChangeReceiver={receiverChanged}
          receiver={receiver}
          address={address}
          errorMessage={addressErrorMessage}
          isLoading={isLoading}
        />

        <Spacer height={16} />

        <InputMemo memo={memo} onChangeText={memoChanged} />
      </ScrollView>

      <Spacer fill />

      <Actions>
        <NextButton
          onPress={onNext}
          title={strings.next}
          disabled={!isValid || isLoading}
          testID="nextButton"
          shelleyTheme
        />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    selectedTokens: () => navigation.navigate('send-selected-tokens'),
    selectToken: () => navigation.navigate('send-select-token'),
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  actions: {
    paddingVertical: 16,
  },
})

const NextButton = Button
