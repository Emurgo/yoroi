import {makeLimitOrder, makePossibleMarketOrder, useCreateOrder, usePoolsByPair, useSwap} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import React, {useEffect} from 'react'
import {StyleSheet, TextInput as RNTextInput, TouchableOpacity, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button, Icon, Spacer, Text, TextInput} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {BottomSheetModal} from '../../../../components/BottomSheetModal'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {YoroiEntry, YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useStrings} from '../../common/strings'
import {useAddresses} from '../../common/useAddresses'

export const ConfirmTxScreen = () => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [confirmationModal, setConfirmationModal] = React.useState<boolean>(false)
  const [bottomSheetState, setBottomSheetSate] = React.useState<{isOpen: boolean; title: string; content?: string}>({
    isOpen: false,
    title: '',
    content: '',
  })
  const [orderDataFromHelper, setOrderDataFromHelper] = React.useState<Swap.CreateOrderData>()

  const [spendingPassword, setSpendingPassword] = React.useState('')
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const {createOrder: createOrderState} = useSwap()
  const {selectedPool, amounts} = createOrderState

  const {poolList} = usePoolsByPair({
    tokenA: createOrderState.amounts.sell.tokenId,
    tokenB: createOrderState.amounts.buy.tokenId,
  })

  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const sellTokenInfo = useTokenInfo({wallet, tokenId: amounts.sell.tokenId})
  const tokenToBuyName = buyTokenInfo.ticker ?? buyTokenInfo.name

  const calculatedFee = (Number(selectedPool?.fee) / 100) * Number(createOrderState.amounts.sell.quantity)
  const poolFee = Quantities.denominated(`${calculatedFee}`, sellTokenInfo.decimals ?? 0)
  const addresses = useAddresses()

  const createEntry = (): YoroiEntry => {
    const amountEntry = {}
    const tokenId = orderDataFromHelper?.amounts.sell.tokenId
    if (tokenId != null) {
      amountEntry[tokenId] = orderDataFromHelper?.amounts.sell.quantity
    }

    return {
      address: orderDataFromHelper?.address !== undefined ? orderDataFromHelper.address : '',
      amounts: amountEntry,
    }
  }

  const {refetch} = useSwapTx(
    {wallet, entry: createEntry()},
    {
      onSuccess: (yoroiUnsignedTx) => {
        console.log('CREATE UNSIGNED TX SUCCESS: ')
      },
    },
  )

  const {createOrder} = useCreateOrder({
    onSuccess: (data) => {
      console.log('create order success', data)
      setConfirmationModal(true)
      // TODO: unsign TX
      refetch()
    },
    onError: (error) => {
      console.log('create order error', error)
    },
  })

  useEffect(() => {
    const orderDetails = {
      sell: amounts.sell,
      buy: amounts.sell,
      pools: poolList,
      selectedPool: createOrderState.selectedPool,
      slippage: createOrderState.slippage,
      address: addresses.used[0],
    }
    console.log('[orderDetails for helpers]', orderDetails)
    if (createOrderState.type === 'market' && poolList !== undefined) {
      const orderResult = makePossibleMarketOrder(
        orderDetails.sell,
        orderDetails.buy,
        orderDetails?.pools as Swap.PoolPair[],
        orderDetails.slippage,
        orderDetails.address,
      )
      console.log('[makePossibleMarketOrder RESULT]', orderResult)
      setOrderDataFromHelper(orderResult)
    }
    if (createOrderState.type === 'limit' && poolList !== undefined) {
      const orderResult = makeLimitOrder(
        orderDetails.sell,
        orderDetails.buy,
        orderDetails.selectedPool,
        orderDetails.slippage,
        orderDetails.address,
      )
      console.log('[makeLimitOrder RESULT]', orderResult)
      setOrderDataFromHelper(orderResult)
    }
  }, [poolList])

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
                      setBottomSheetSate({
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
            createOrder({
              amounts: {
                sell: orderDataFromHelper?.amounts.sell,
                buy: orderDataFromHelper?.amounts.buy,
              },
              address: orderDataFromHelper?.address,
              slippage: createOrderState.slippage,
              selectedPool: orderDataFromHelper?.selectedPool,
            })
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
        containerStyle={{justifyContent: 'space-between'}}
      />

      <BottomSheetModal
        isOpen={bottomSheetState.isOpen}
        title={bottomSheetState.title}
        content={<Text style={styles.text}>{bottomSheetState.content}</Text>}
        onClose={() => {
          setBottomSheetSate({isOpen: false, title: '', content: ''})
        }}
      />
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

export const useSwapTx = (
  {wallet, entry}: {wallet: YoroiWallet; entry: YoroiEntry},
  options?: UseQueryOptions<YoroiUnsignedTx, Error, YoroiUnsignedTx, [string, 'send-tx']>,
) => {
  console.log('SWAP ENTRY entry', entry)
  const query = useQuery({
    ...options,
    cacheTime: 0,
    suspense: true,
    enabled: false,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryKey: [wallet.id, 'send-tx'],
    queryFn: () => wallet.createUnsignedTx(entry),
  })

  return {
    ...query,
    unsignedTx: query.data,
  }
}

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
