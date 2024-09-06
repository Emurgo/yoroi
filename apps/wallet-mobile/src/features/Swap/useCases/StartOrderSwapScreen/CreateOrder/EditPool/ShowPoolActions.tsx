import {usePortfolioTokenInfo} from '@yoroi/portfolio'
import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {ExpandableInfoCard, HeaderWrapper, HiddenInfoWrapper, Spacer, useModal} from '../../../../../../components'
import {asQuantity, Quantities} from '../../../../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../../../../WalletManager/common/hooks/useSelectedWallet'
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

  const {wallet} = useSelectedWallet()
  const sellTokenInfo = orderData.amounts.sell?.info
  const sellTokenName = sellTokenInfo?.ticker ?? sellTokenInfo?.name ?? '-'

  const {
    buyQuantity: {isTouched: isBuyTouched},
    sellQuantity: {isTouched: isSellTouched},
    selectedPool: {isTouched: isPoolTouched},
  } = useSwapForm()
  if (!isBuyTouched || !isSellTouched || calculation === undefined) return null

  const {cost, pool} = calculation
  const {decimals, ticker} = wallet.portfolioPrimaryTokenInfo

  const totalFees = Quantities.format(
    asQuantity((cost.batcherFee.quantity + cost.frontendFeeInfo.fee.quantity).toString()),
    decimals,
  )
  const titleTotalFeesFormatted = `${strings.total}: ${Quantities.format(
    asQuantity(amounts.sell?.quantity.toString() ?? '0'),
    sellTokenInfo?.decimals ?? 0,
  )} ${sellTokenName} + ${totalFees} ${ticker}`
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
  const {wallet} = useSelectedWallet()
  const {openModal} = useModal()

  const {orderData} = useSwap()
  const {selectedPoolCalculation: calculation} = orderData

  const {tokenInfo: buyTokenInfo} = usePortfolioTokenInfo({
    getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
    id: orderData.amounts.buy?.info.id ?? 'unknown.',
    network: wallet.networkManager.network,
    primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
  })
  const buyTokenName = buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? '-'

  // should not happen
  if (!calculation) return null

  const {pool} = calculation

  const minReceived = Quantities.format(
    asQuantity(calculation.buyAmountWithSlippage.quantity.toString()),
    buyTokenInfo?.decimals ?? 0,
  )
  const deposit = Quantities.format(
    asQuantity(pool.deposit.quantity.toString()),
    wallet.portfolioPrimaryTokenInfo.decimals,
  )

  const ticker = wallet.portfolioPrimaryTokenInfo.ticker
  const depositFormatted = `${deposit} ${ticker}`
  const totalFeesFormatted = `${totalFees} ${ticker}`
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
            <Text style={styles.modalText}>{fee.info}</Text>

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
            value={<Text style={styles.text}>{fee.value}</Text>}
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
  const {wallet} = useSelectedWallet()
  const {openModal} = useModal()
  const bold = useBold()

  const {orderData} = useSwap()
  const buyTokenInfo = orderData.amounts.buy?.info
  const sellTokenInfo = orderData.amounts.sell?.info
  const buyTokenName = buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? '-'
  const sellTokenName = sellTokenInfo?.ticker ?? sellTokenInfo?.name ?? '-'

  const calculation = orderData.selectedPoolCalculation

  // should not happen
  if (!calculation) return null

  const {pool, cost} = calculation

  const minReceived = Quantities.format(
    asQuantity(calculation.buyAmountWithSlippage.quantity.toString()),
    buyTokenInfo?.decimals ?? 0,
  )
  const deposit = Quantities.format(
    asQuantity(pool.deposit.quantity.toString()),
    wallet.portfolioPrimaryTokenInfo.decimals,
  )
  const liqFeeQuantity = Quantities.format(
    asQuantity(cost.liquidityFee.quantity.toString()),
    sellTokenInfo?.decimals ?? 0,
  )
  const liqFeePerc = pool.fee

  const ticker = wallet.portfolioPrimaryTokenInfo.ticker
  const depositFormatted = `${deposit} ${ticker}`
  const totalFeesFormatted = `${totalFees} ${ticker}`
  const minReceivedFormatted = `${minReceived} ${buyTokenName}`
  const liqFeeQuantityFormatted = `${liqFeeQuantity} ${sellTokenName}`
  const liqFeePercFormatted = strings.swapLiquidityFeeInfo(liqFeePerc, bold)

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
            <Text style={styles.modalText}>{fee.info}</Text>

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
            value={<Text style={styles.text}>{fee.value}</Text>}
            label={fee.label}
            info={fee.info}
            onPress={handleOpenModal}
          />
        )
      })}
    </View>
  )
}

const useBold = () => {
  const styles = useStyles()

  return {
    b: (text: React.ReactNode) => <Text style={styles.bolder}>{text}</Text>,
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    flex: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    between: {
      ...atoms.justify_between,
    },
    modalText: {
      ...atoms.text_left,
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
    text: {
      ...atoms.text_right,
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
      ...atoms.flex_wrap,
      ...atoms.flex_1,
    },

    modalContent: {
      ...atoms.flex_1,
      ...atoms.justify_between,
      ...atoms.px_lg,
    },
    change: {
      color: color.text_primary_medium,
      ...atoms.body_2_md_medium,
      textTransform: 'uppercase',
    },
    bold: {
      color: color.gray_max,
      ...atoms.body_1_lg_regular,
    },
    bolder: {
      color: color.gray_max,
      ...atoms.body_1_lg_medium,
    },
  })

  return styles
}
