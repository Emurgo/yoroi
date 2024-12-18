import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {useNavigateTo} from '../../common/navigation'
import {Provider} from '../../common/Provider/Provider'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const ProviderSplits = () => {
  const strings = useStrings()
  const {styles, color} = useStyles()
  const [expanded, setExpanded] = React.useState(true)

  const navigateTo = useNavigateTo()

  const swapForm = useSwap()

  const dex = swapForm.estimate?.splits[0]?.dex

  return (
    <View>
      <View style={styles.between}>
        <View style={styles.composedText}>
          {dex !== undefined && (
            <Provider
              provider={dex}
              append={`${swapForm.selectedDex.isTouched ? '' : ` ${strings.autoPool}`}`}
              noLink
            />
          )}
        </View>

        {swapForm.orderType === 'limit' && (
          <View style={styles.changeDex}>
            <Button type={ButtonType.Text} onPress={navigateTo.selectProvider} title={strings.changePool} />
          </View>
        )}
      </View>

      {swapForm.estimate !== undefined && (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <View style={styles.between}>
              <Text style={styles.heading}>{`${strings.total}: ${swapForm.estimate?.totalInput}`}</Text>

              <Icon.Chevron direction={expanded ? 'up' : 'down'} color={color.el_gray_max} size={24} />
            </View>
          </TouchableOpacity>

          {expanded && (
            <View style={styles.list}>
              <Row
                label={strings.swapMinAdaTitle}
                description={strings.swapMinAda}
                value={swapForm.estimate?.deposits}
              />

              <Row
                label={strings.swapMinReceivedTitle}
                description={strings.swapMinReceived}
                value={swapForm.estimate?.totalOutput}
              />
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const Row = ({
  label,
  description,
  value,
}: {
  label: string
  description?: string
  value: number | string | React.ReactNode
}) => {
  const {styles} = useStyles()
  const {openModal} = useModal()

  return (
    <View style={styles.row}>
      <View style={styles.composedText}>
        <Text style={styles.rowLabel}>{label}</Text>

        {description !== undefined && (
          <Button
            style={styles.info}
            onPress={() => openModal(label, <Text style={styles.textContent}>{description}</Text>)}
            type={ButtonType.SecondaryText}
            icon={Icon.Info}
          />
        )}
      </View>

      {typeof value === 'string' || typeof value === 'number' ? <Text style={styles.rowValue}>{value}</Text> : value}
    </View>
  )
}

/*
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
*/
const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    card: {
      ...atoms.p_lg,
      ...atoms.border,
      borderRadius: 8,
      borderColor: color.gray_200,
      backgroundColor: color.bg_color_max,
    },
    between: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    changeDex: {
      ...atoms.self_center,
    },
    list: {
      ...atoms.pt_md,
      ...atoms.gap_xs,
    },
    heading: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    rowLabel: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_low,
    },
    rowValue: {
      ...atoms.body_1_lg_regular,
      ...atoms.self_center,
      color: color.text_gray_medium,
    },
    composedText: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_xs,
    },
    textContent: {
      color: color.gray_900,
      ...atoms.body_1_lg_regular,
      ...atoms.px_lg,
    },
    info: {
      ...atoms.p_0,
    },
  })

  return {styles, color}
}
