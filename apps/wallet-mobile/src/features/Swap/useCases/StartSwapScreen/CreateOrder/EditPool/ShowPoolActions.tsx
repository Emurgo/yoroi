import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {ExpandableInfoCard, HeaderWrapper, HiddenInfoWrapper, Spacer, useModal} from '../../../../../../components'
import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../../common/navigation'
import {PoolIcon} from '../../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../../common/strings'
import {useSwapForm} from '../../../../common/SwapFormProvider'
import {SwapInfoLink} from '../../../../common/SwapInfoLink/SwapInfoLink'

export const ShowPoolActions = () => {
  const strings = useStrings()
  const styles = useStyles()
  const [isExpanded, setIsExpanded] = React.useState(true)

  const navigateTo = useNavigateTo()
  const handleOnChangePool = () => navigateTo.selectPool()

  const {orderData} = useSwap()
  const {selectedPoolCalculation: calculation, amounts} = orderData

  const wallet = useSelectedWallet()
  const sellTokenInfo = useTokenInfo({wallet, tokenId: amounts.sell.tokenId})
  const sellTokenName = sellTokenInfo.ticker ?? sellTokenInfo.name

  const {
    buyQuantity: {isTouched: isBuyTouched},
    sellQuantity: {isTouched: isSellTouched},
    selectedPool: {isTouched: isPoolTouched},
  } = useSwapForm()
  if (!isBuyTouched || !isSellTouched || calculation === undefined) return null

  const {cost, pool} = calculation

  const totalFees = Quantities.format(
    Quantities.sum([cost.batcherFee.quantity, cost.frontendFeeInfo.fee.quantity]),
    wallet.primaryTokenInfo.decimals ?? 0,
  )
  const titleTotalFeesFormatted = `${strings.total}: ${Quantities.format(
    amounts.sell.quantity,
    sellTokenInfo.decimals ?? 0,
  )} ${sellTokenName} + ${totalFees} ${wallet.primaryTokenInfo.ticker}`
  const handleOnExpand = () => setIsExpanded((state) => !state)
  const totalFeesTitle = (
    <HeaderWrapper expanded={isExpanded} onPress={handleOnExpand}>
      <Text style={styles.bold}>{titleTotalFeesFormatted}</Text>
    </HeaderWrapper>
  )

  const poolStatus = orderData.type === 'limit' && isPoolTouched ? '' : ` ${strings.autoPool}`
  const poolProviderFormatted = capitalize(pool.provider)
  const poolTitle = `${poolProviderFormatted}${poolStatus}`

  const feeBreakdown = <FeeBreakdown totalFees={totalFees} orderType={orderData.type} />
  return (
    <View>
      <View style={[styles.flex, styles.between]}>
        <View style={styles.flex}>
          <PoolIcon size={25} providerId={pool.provider} />

          <Spacer width={10} />

          <Text style={styles.bolder}>{poolTitle}</Text>
        </View>

        {orderData.type === 'limit' && (
          <TouchableOpacity onPress={handleOnChangePool}>
            <Text style={styles.change}>{strings.changePool}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ExpandableInfoCard header={totalFeesTitle} info={feeBreakdown} expanded={isExpanded} />
    </View>
  )
}

const FeeBreakdown = ({totalFees, orderType}: {totalFees: string; orderType: Swap.OrderType}) => {
  return orderType === 'limit' ? (
    <ShowLimitOrderFeeBreakdown totalFees={totalFees} />
  ) : (
    <ShowMarketOrderFeeBreakdown totalFees={totalFees} />
  )
}

const ShowLimitOrderFeeBreakdown = ({totalFees}: {totalFees: string}) => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const {openModal} = useModal()

  const {orderData} = useSwap()
  const {selectedPoolCalculation: calculation, amounts} = orderData

  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const buyTokenName = buyTokenInfo.ticker ?? buyTokenInfo.name

  // should not happen
  if (!calculation) return <></>

  const {pool} = calculation

  const minReceived = Quantities.format(calculation.buyAmountWithSlippage.quantity, buyTokenInfo.decimals ?? 0)
  const deposit = Quantities.format(pool.deposit.quantity, Number(wallet.primaryTokenInfo.decimals))

  const depositFormatted = `${deposit} ${wallet.primaryTokenInfo.ticker}`
  const totalFeesFormatted = `${totalFees} ${wallet.primaryTokenInfo.ticker}`
  const minReceivedFormatted = `${minReceived} ${buyTokenName}`

  const feeStructure = [
    {
      label: strings.swapMinAdaTitle,
      value: depositFormatted,
      info: strings.swapMinAda,
    },
    {
      label: strings.swapFeesTitle,
      value: totalFeesFormatted,
      info: strings.swapFees,
    },
    {
      label: strings.swapMinReceivedTitle,
      value: minReceivedFormatted,
      info: strings.swapMinReceived,
    },
  ]

  return (
    <View>
      {feeStructure.map((fee) => {
        const modalContent = (
          <View style={styles.modalContent}>
            <Text style={styles.text}>{fee.info}</Text>

            <Spacer fill />

            <SwapInfoLink />

            <Spacer height={24} />
          </View>
        )

        const handleOpenModal = () => {
          openModal(fee.label, modalContent)
        }

        return (
          <HiddenInfoWrapper
            key={fee.label}
            value={fee.value}
            label={fee.label}
            info={fee.info}
            onPress={handleOpenModal}
          />
        )
      })}
    </View>
  )
}

const ShowMarketOrderFeeBreakdown = ({totalFees}: {totalFees: string}) => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const {openModal} = useModal()

  const {orderData} = useSwap()
  const {selectedPoolCalculation: calculation, amounts} = orderData

  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const sellTokenInfo = useTokenInfo({wallet, tokenId: amounts.sell.tokenId})
  const buyTokenName = buyTokenInfo.ticker ?? buyTokenInfo.name
  const sellTokenName = sellTokenInfo.ticker ?? sellTokenInfo.name

  // should not happen
  if (!calculation) return <></>

  const {pool, cost} = calculation

  const minReceived = Quantities.format(calculation.buyAmountWithSlippage.quantity, buyTokenInfo.decimals ?? 0)
  const deposit = Quantities.format(pool.deposit.quantity, Number(wallet.primaryTokenInfo.decimals))
  const liqFeeQuantity = Quantities.format(cost.liquidityFee.quantity, sellTokenInfo.decimals ?? 0)
  const liqFeePerc = pool.fee

  const depositFormatted = `${deposit} ${wallet.primaryTokenInfo.ticker}`
  const totalFeesFormatted = `${totalFees} ${wallet.primaryTokenInfo.ticker}`
  const minReceivedFormatted = `${minReceived} ${buyTokenName}`
  const liqFeeQuantityFormatted = `${liqFeeQuantity} ${sellTokenName}`
  const liqFeePercFormatted = strings.swapLiquidityFeeInfo(liqFeePerc)

  const feeStructure = [
    {
      label: strings.swapMinAdaTitle,
      value: depositFormatted,
      info: strings.swapMinAda,
    },
    {
      label: strings.swapFeesTitle,
      value: totalFeesFormatted,
      info: strings.swapFees,
    },
    {
      label: strings.swapMinReceivedTitle,
      value: minReceivedFormatted,
      info: strings.swapMinReceived,
    },
    {
      label: strings.swapLiqProvFee,
      title: strings.swapLiquidityFee,
      value: liqFeeQuantityFormatted,
      info: liqFeePercFormatted,
    },
  ]

  return (
    <View>
      {feeStructure.map((fee) => {
        const modalContent = (
          <View style={styles.modalContent}>
            <Text style={styles.text}>{fee.info}</Text>

            <Spacer fill />

            <SwapInfoLink />

            <Spacer height={24} />
          </View>
        )

        const handleOpenModal = () => {
          openModal(fee.title ?? fee.label, modalContent)
        }

        return (
          <HiddenInfoWrapper
            key={fee.label}
            value={fee.value}
            label={fee.label}
            info={fee.info}
            onPress={handleOpenModal}
          />
        )
      })}
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    flex: {flexDirection: 'row', alignItems: 'center'},
    between: {justifyContent: 'space-between'},
    text: {
      textAlign: 'right',
      ...typography['body-1-l-regular'],
      color: color.gray[900],
      flexWrap: 'wrap',
      flex: 1,
    },

    modalContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    change: {color: color.primary[600], fontWeight: '600', textTransform: 'uppercase'},
    bold: {
      color: color.gray.max,
      ...typography['body-1-l-regular'],
    },
    bolder: {
      color: color.gray.max,
      ...typography['body-1-l-medium'],
    },
  })

  return styles
}
