import {makeLimitOrder, makePossibleMarketOrder, useCreateOrder, usePoolsByPair, useSwap} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TextInput as RNTextInput, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button, Spacer, Text, TextInput} from '../../../../components'
import {BottomSheetModal} from '../../../../components/BottomSheetModal'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {YoroiEntry, YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useStrings} from '../../common/strings'
import {useAddresses} from '../../common/useAddresses'
import {TransactionSummary} from './TransactionSummary'

export const ConfirmTxScreen = () => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [screenState, setScreenState] = React.useState<{
    modal: boolean
    swapTx: YoroiUnsignedTx | undefined
    datum: string | undefined
    contractAddress: string | undefined
  }>({modal: false, swapTx: undefined, datum: undefined, contractAddress: undefined})

  const [spendingPassword, setSpendingPassword] = React.useState('')
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const addresses = useAddresses()

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
  const poolFee = Quantities.format(`${calculatedFee}`, sellTokenInfo.decimals ?? 0)

  const createEntry = (): YoroiEntry => {
    const amountEntry = {}
    const tokenId = createOrderState?.amounts.sell.tokenId
    if (tokenId != null && createOrderState?.amounts.sell.quantity !== undefined) {
      amountEntry[tokenId] = Quantities.sum([selectedPool.deposit.quantity, createOrderState?.amounts.sell.quantity])
    }

    return {
      address: screenState.contractAddress !== undefined ? screenState.contractAddress : '', // when using this contractAddress got an error
      amounts: amountEntry,
    }
  }

  const {refetch} = useSwapTx(
    {wallet, entry: createEntry(), datum: {hash: screenState?.datum !== undefined ? screenState.datum : ''}},
    {
      onSuccess: (yoroiUnsignedTx) => {
        console.log('CREATE UNSIGNED TX SUCCESS: ', yoroiUnsignedTx)
        setScreenState({...screenState, modal: true, swapTx: yoroiUnsignedTx})
      },
    },
  )

  const {createOrder} = useCreateOrder({
    onSuccess: (data) => {
      setScreenState({...screenState, datum: data?.datum, contractAddress: data?.contractAddress})
      refetch()
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const makeSwpOrder = () => {
    let orderResult: Swap.CreateOrderData | undefined = undefined
    const orderDetails = {
      sell: amounts.sell,
      buy: amounts.sell,
      pools: poolList,
      selectedPool: createOrderState.selectedPool,
      slippage: createOrderState.slippage,
      address: addresses.used[0],
    }
    if (createOrderState.type === 'market' && poolList !== undefined) {
      orderResult = makePossibleMarketOrder(
        orderDetails.sell,
        orderDetails.buy,
        orderDetails?.pools as Swap.PoolPair[],
        orderDetails.slippage,
        orderDetails.address,
      )
      orderResult && createSwapOrder(orderResult)
    }
    if (createOrderState.type === 'limit' && poolList !== undefined) {
      orderResult = makeLimitOrder(
        orderDetails.sell,
        orderDetails.buy,
        orderDetails.selectedPool,
        orderDetails.slippage,
        orderDetails.address,
      )
      createSwapOrder(orderResult)
    }
  }

  const createSwapOrder = (orderData: Swap.CreateOrderData) => {
    console.log('[CreateOrderData]', orderData)
    createOrder({
      amounts: {
        sell: orderData?.amounts.sell,
        buy: orderData?.amounts.buy,
      },
      address: orderData?.address,
      slippage: orderData.slippage,
      selectedPool: orderData.selectedPool,
    })
  }

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
        sellToken={{id: amounts.sell.tokenId, quantity: amounts.sell.quantity}}
      />

      <Actions>
        <Button testID="swapButton" shelleyTheme title={strings.confirm} onPress={() => makeSwpOrder()} />
      </Actions>

      <BottomSheetModal
        isOpen={screenState.modal}
        title={strings.signTransaction}
        content={
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
        }
        onClose={() => {
          setScreenState({...screenState, modal: false})
        }}
        containerStyle={{justifyContent: 'space-between'}}
      />
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

export const useSwapTx = (
  {wallet, entry, datum}: {wallet: YoroiWallet; entry: YoroiEntry; datum: {hash: string}},
  options?: UseQueryOptions<YoroiUnsignedTx, Error, YoroiUnsignedTx, [string, 'swap-tx']>,
) => {
  console.log('CREATE UNSIGNED TX PAYLOAD: ', {wallet, entry, datum})
  const query = useQuery({
    ...options,
    cacheTime: 0,
    suspense: true,
    enabled: false,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryKey: [wallet.id, 'swap-tx'],
    queryFn: () => wallet.createUnsignedTx(entry, undefined, datum),
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
