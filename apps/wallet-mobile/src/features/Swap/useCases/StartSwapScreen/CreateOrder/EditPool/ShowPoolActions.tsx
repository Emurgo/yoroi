import {useSwap} from '@yoroi/swap'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {
  BottomSheetModal,
  ExpandableInfoCard,
  HeaderWrapper,
  HiddenInfoWrapper,
  Spacer,
} from '../../../../../../components'
import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {COLORS} from '../../../../../../theme'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../../common/navigation'
import {PoolIcon} from '../../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../../common/strings'
import {useSwapForm} from '../../../../common/SwapFormProvider'

export const ShowPoolActions = () => {
  const navigateTo = useNavigateTo()
  const {orderData} = useSwap()
  const strings = useStrings()
  const {
    buyAmount: {isTouched: isBuyTouched},
    sellAmount: {isTouched: isSellTouched},
    selectedPool: {isTouched: isPoolTouched},
  } = useSwapForm()
  const {selectedPoolCalculation, amounts} = orderData
  const wallet = useSelectedWallet()
  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const sellTokenInfo = useTokenInfo({wallet, tokenId: amounts.sell.tokenId})
  const buyTokenName = buyTokenInfo.ticker ?? buyTokenInfo.name
  const sellTokenName = sellTokenInfo.ticker ?? sellTokenInfo.name
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

  if (!isBuyTouched || !isSellTouched || selectedPoolCalculation === undefined) {
    return <></>
  }

  const totalFees = Quantities.format(
    Quantities.sum([
      selectedPoolCalculation.cost.batcherFee.quantity,
      selectedPoolCalculation.cost.frontendFeeInfo.fee.quantity,
    ]),
    Number(wallet.primaryTokenInfo.decimals),
  )
  const header = `${strings.total}: ${Quantities.format(
    amounts.sell.quantity,
    sellTokenInfo.decimals ?? 0,
  )} ${sellTokenName} + ${totalFees} ${wallet.primaryTokenInfo.ticker}`
  const id = selectedPoolCalculation.pool.poolId
  const expanded = id === hiddenInfoOpenId

  const poolProviderFormatted = capitalize(selectedPoolCalculation.pool.provider)
  const poolStatus = orderData.type === 'limit' && isPoolTouched ? '' : ` ${strings.autoPool}`
  const poolTitle = `${poolProviderFormatted}${poolStatus}`

  const handleOnExpand = () => setHiddenInfoOpenId(hiddenInfoOpenId !== id ? id : null)
  const handleOnChangePool = () => navigateTo.selectPool()

  return (
    <View>
      <View style={[styles.flex, styles.between]}>
        <View style={styles.flex}>
          <PoolIcon size={25} providerId={selectedPoolCalculation.pool.provider} />

          <Spacer width={10} />

          <Text style={styles.bolder}>{poolTitle}</Text>
        </View>

        {orderData.type === 'limit' && (
          <TouchableOpacity onPress={handleOnChangePool}>
            <Text style={styles.change}>{strings.changePool}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ExpandableInfoCard
        key={id}
        header={
          <HeaderWrapper expanded={expanded} onPress={handleOnExpand}>
            <Text style={styles.bold}>{header}</Text>
          </HeaderWrapper>
        }
        info={
          <HiddenInfo
            totalFees={Quantities.format(
              selectedPoolCalculation.pool.batcherFee.quantity,
              Number(wallet.primaryTokenInfo.decimals),
            )}
            minReceived={Quantities.format(
              selectedPoolCalculation.buyAmountWithSlippage.quantity,
              buyTokenInfo.decimals ?? 0,
            )}
            minAda={Quantities.format(
              selectedPoolCalculation.pool.deposit.quantity,
              Number(wallet.primaryTokenInfo.decimals),
            )}
            buyTokenName={buyTokenName}
            sellTokenName={sellTokenName}
            liquidityFee={selectedPoolCalculation.pool.fee}
            liquidityFeeValue={Quantities.format(
              selectedPoolCalculation.cost.liquidityFee.quantity,
              sellTokenInfo.decimals ?? 0,
            )}
          />
        }
        expanded={expanded}
      />
    </View>
  )
}

const HiddenInfo = ({
  totalFees,
  minAda,
  minReceived,
  buyTokenName,
  sellTokenName,
  liquidityFee,
  liquidityFeeValue,
}: {
  totalFees: string
  minAda: string
  minReceived: string
  buyTokenName: string
  sellTokenName: string
  liquidityFee: string
  liquidityFeeValue: string
}) => {
  const [bottomSheetState, setBottomSheetSate] = React.useState<{isOpen: boolean; title: string; content?: string}>({
    isOpen: false,
    title: '',
    content: '',
  })
  const strings = useStrings()
  const wallet = useSelectedWallet()

  return (
    <View>
      {[
        {
          label: strings.swapMinAdaTitle,
          value: `${minAda} ${wallet.primaryTokenInfo.ticker}`,
          info: strings.swapMinAda,
        },
        {
          label: strings.swapFeesTitle,
          value: `${totalFees} ${wallet.primaryTokenInfo.ticker}`,
          info: strings.swapFees,
        },
        {
          label: strings.swapMinReceivedTitle,
          value: `${minReceived} ${buyTokenName}`,
          info: strings.swapMinReceived,
        },
        {
          label: strings.swapLiquidityFee(liquidityFee),
          value: `${liquidityFeeValue} ${sellTokenName}`,
        },
      ].map((item) => (
        <HiddenInfoWrapper
          key={item.label}
          value={item.value}
          label={item.label}
          info={item.info}
          onPress={() => {
            setBottomSheetSate({
              isOpen: true,
              title: item.label,
              content: item.info,
            })
          }}
        />
      ))}

      <BottomSheetModal
        isOpen={bottomSheetState.isOpen}
        title={bottomSheetState.title}
        onClose={() => {
          setBottomSheetSate({isOpen: false, title: '', content: ''})
        }}
      >
        <Text style={styles.text}>{bottomSheetState.content}</Text>
      </BottomSheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {flexDirection: 'row', alignItems: 'center'},
  between: {justifyContent: 'space-between'},
  text: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
  change: {color: COLORS.SHELLEY_BLUE, fontWeight: '600', textTransform: 'uppercase'},
  bold: {
    color: COLORS.BLACK,
    fontWeight: '400',
    fontFamily: 'Rubik-Regular',
  },
  bolder: {
    color: COLORS.BLACK,
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
  },
})
