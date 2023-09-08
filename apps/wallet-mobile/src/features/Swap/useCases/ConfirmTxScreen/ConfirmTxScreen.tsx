import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, TextInput as RNTextInput, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, Text, TextInput} from '../../../../components'
import {BottomSheetModal} from '../../../../components/BottomSheetModal'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useStrings} from '../../common/strings'
import {TransactionSummary} from './TransactionSummary'

export const ConfirmTxScreen = () => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [confirmationModal, setConfirmationModal] = React.useState<boolean>(false)

  const [spendingPassword, setSpendingPassword] = React.useState('')
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const {createOrder, unsignedTx} = useSwap()
  const {amounts} = createOrder
  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const tokenToBuyName = buyTokenInfo.ticker ?? buyTokenInfo.name

  const poolFee = Quantities.denominated(
    `${Number(Object.values(unsignedTx?.fee))}`,
    Number(wallet.primaryTokenInfo.decimals),
  )

  const orderInfo = [
    {
      label: strings.swapMinAdaTitle,
      value: '2 ADA',
      info: strings.swapMinAda,
    },
    {
      label: strings.swapMinReceivedTitle,
      value: '?', // TODO add real value
      info: strings.swapMinReceived,
    },
    {
      label: strings.swapFeesTitle,
      value: `${poolFee} ADA`,
      info: strings.swapFees,
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <TransactionSummary
        feesInfo={orderInfo}
        buyToken={{
          id: amounts.buy.tokenId,
          quantity: amounts.buy.quantity,
          name: tokenToBuyName,
          decimals: buyTokenInfo.decimals,
        }}
        sellToken={{
          id: amounts.sell.tokenId,
          quantity: amounts.sell.quantity,
        }}
      />

      <Actions>
        <Button
          testID="swapButton"
          shelleyTheme
          title={strings.confirm}
          onPress={() => {
            setConfirmationModal(true)
          }}
        />
      </Actions>

      <BottomSheetModal
        isOpen={confirmationModal}
        title={strings.signTransaction}
        onClose={() => {
          setConfirmationModal(false)
        }}
        contentContainerStyle={{justifyContent: 'space-between'}}
      >
        <>
          <Text style={styles.modalText}>{strings.enterSpendingPassword}</Text>

          <TextInput
            secureTextEntry
            ref={spendingPasswordRef}
            enablesReturnKeyAutomatically
            placeholder={strings.spendingPassword}
            value={spendingPassword}
            onChangeText={setSpendingPassword}
            autoComplete="off"
          />

          <Spacer fill />

          <Button testID="swapButton" shelleyTheme title={strings.sign} />
        </>
      </BottomSheetModal>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'space-between',
  },
  actions: {
    paddingVertical: 16,
  },
  modalText: {
    paddingHorizontal: 70,
    textAlign: 'center',
    paddingBottom: 8,
  },
})
