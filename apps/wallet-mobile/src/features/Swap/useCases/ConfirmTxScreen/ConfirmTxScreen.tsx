import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, TextInput as RNTextInput, TouchableOpacity, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, Spacer, Text, TextInput} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {BottomSheetModal} from '../../../../components/BottomSheetModal'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useStrings} from '../../common/strings'

export const ConfirmTxScreen = () => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [confirmationModal, setConfirmationModal] = React.useState<boolean>(false)
  const [bottomSheetState, setBottomSheetState] = React.useState<{isOpen: boolean; title: string; content?: string}>({
    isOpen: false,
    title: '',
    content: '',
  })

  const [spendingPassword, setSpendingPassword] = React.useState('')
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const {createOrder} = useSwap()
  const {selectedPool, amounts} = createOrder
  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const sellTokenInfo = useTokenInfo({wallet, tokenId: amounts.sell.tokenId})
  const tokenToBuyName = buyTokenInfo.ticker ?? buyTokenInfo.name

  const calculatedFee = (Number(selectedPool?.fee) / 100) * Number(createOrder.amounts.sell.quantity)
  const poolFee = Quantities.denominated(`${calculatedFee}`, sellTokenInfo.decimals ?? 0)

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
      <View>
        <View style={styles.card}>
          <Text style={styles.cardText}>{strings.total}</Text>

          <View>
            <Text style={[styles.cardText, styles.cardTextValue]}>{`${amounts.buy.quantity} ${tokenToBuyName}`}</Text>

            <Spacer height={6} />

            <Text style={styles.cardTextUSD}></Text>
          </View>
        </View>

        <Spacer height={24} />

        {orderInfo.map((orderInfo) => {
          return (
            <View key={orderInfo.label}>
              <Spacer height={8} />

              <View style={styles.flexBetween}>
                <View style={styles.flex}>
                  <Text style={[styles.text, styles.gray]}>{orderInfo.label}</Text>

                  <Spacer width={8} />

                  <TouchableOpacity
                    onPress={() => {
                      setBottomSheetState({
                        isOpen: true,
                        title: orderInfo.label,
                        content: orderInfo.info,
                      })
                    }}
                  >
                    <Icon.Info size={24} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.text}>{orderInfo.value}</Text>
              </View>
            </View>
          )
        })}

        <Spacer height={24} />

        <Text style={styles.amountItemLabel}>{strings.swapFrom}</Text>

        <AmountItem wallet={wallet} amount={{tokenId: amounts.sell.tokenId, quantity: amounts.sell.quantity}} />

        <Spacer height={16} />

        <Text style={styles.amountItemLabel}>{strings.swapTo}</Text>

        <AmountItem wallet={wallet} amount={{tokenId: amounts.buy.tokenId, quantity: amounts.buy.quantity}} />
      </View>

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
        content={
          <>
            <Text style={styles.modalText}>{strings.enterSpendingPassword}</Text>

            <TextInput
              secureTextEntry
              ref={spendingPasswordRef}
              enablesReturnKeyAutomatically
              label={strings.spendingPassword}
              value={spendingPassword}
              onChangeText={setSpendingPassword}
              autoComplete="off"
            />

            <Spacer fill />

            <Button testID="swapButton" shelleyTheme title={strings.sign} />
          </>
        }
        onClose={() => {
          setConfirmationModal(false)
        }}
        contentContainerStyle={{justifyContent: 'space-between'}}
      />

      <BottomSheetModal
        isOpen={bottomSheetState.isOpen}
        title={bottomSheetState.title}
        content={<Text style={styles.text}>{bottomSheetState.content}</Text>}
        onClose={() => {
          setBottomSheetState({isOpen: false, title: '', content: ''})
        }}
      />
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'space-between',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.SHELLEY_BLUE,
    padding: 16,
    borderRadius: 8,
  },
  cardText: {
    fontSize: 18,
    color: COLORS.WHITE,
  },
  cardTextValue: {
    fontWeight: '500',
  },
  cardTextUSD: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.5,
  },
  flexBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
  gray: {
    color: COLORS.GRAY,
  },
  amountItemLabel: {
    fontSize: 12,
    color: '#242838',
    paddingBottom: 8,
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
