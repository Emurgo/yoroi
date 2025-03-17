import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {undefinedToken} from '../../common/constants'
import {useNavigateTo} from '../../common/navigation'
import {ProtocolAvatar} from '../../common/Protocol/ProtocolAvatar'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const EstimateSummary = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const swapForm = useSwap()
  const {openModal} = useModal()

  const tokenInInfo = swapForm.tokenInfos.get(swapForm.tokenInInput.tokenId ?? undefinedToken)
  const tokenOutInfo = swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken)

  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-'
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-'

  const protocol = swapForm.estimate?.splits[0]?.protocol

  const expand = () =>
    openModal({
      title: strings.route,
      height: 400,
      content: <Splits data={swapForm.estimate?.splits ?? []} />,
    })

  return (
    <View>
      <View style={styles.between}>
        {swapForm.orderType === 'limit' && (
          <View style={styles.changeDex}>
            <Button type={ButtonType.Text} onPress={navigateTo.selectProvider} title={strings.changePool} />
          </View>
        )}
      </View>

      {swapForm.estimate !== undefined && (
        <View style={styles.list}>
          <Row
            label={strings.route}
            description={strings.routeDescription}
            value={
              protocol !== undefined && (
                <View style={styles.composedText}>
                  <ProtocolAvatar protocol={protocol} preventOpenLink />

                  {swapForm.estimate?.splits.length > 1 && (
                    <Button
                      type={ButtonType.SecondaryText}
                      title="…"
                      rightIcon
                      icon={Icon.Chevron}
                      style={styles.reducedPadding}
                      onPress={expand}
                    />
                  )}
                </View>
              )
            }
          />

          <Row
            label={strings.price}
            description={swapForm.orderType === 'limit' ? strings.limitPriceInfo : strings.marketPriceInfo}
            value={`1 ${tokenInTicker} = ${swapForm.estimate?.netPrice.toFixed(
              tokenOutInfo?.decimals ?? 0,
            )} ${tokenOutTicker}`}
          />

          <Row
            label={strings.swapFeesTitle}
            description={strings.swapFees}
            value={`${swapForm.estimate?.totalFee} ${wallet.portfolioPrimaryTokenInfo.ticker}`}
          />

          <Row
            label={strings.swapMinReceivedTitle}
            description={strings.swapMinReceived}
            value={`${swapForm.estimate?.totalOutput} ${tokenOutTicker}`}
          />

          <Row
            label={strings.slippageTolerance}
            description={strings.slippageToleranceInfo}
            value={`${swapForm.slippageInput.value} %`}
          />
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
            style={styles.reducedPadding}
            onPress={() => openModal({title: label, content: <Text style={styles.textContent}>{description}</Text>})}
            type={ButtonType.SecondaryText}
            icon={Icon.Info}
            size="S"
          />
        )}
      </View>

      {typeof value === 'string' || typeof value === 'number' ? <Text style={styles.rowValue}>{value}</Text> : value}
    </View>
  )
}

export const Splits = ({data}: {data: Swap.Split[]}) => {
  const {styles} = useStyles()

  const total = data.reduce((acc, curr) => (acc += curr.expectedOutputWithoutSlippage), 0)

  return (
    <View style={styles.splitList}>
      {data.map((split, index) => (
        <View key={index} style={[styles.composedText, styles.between]}>
          <ProtocolAvatar protocol={split.protocol} preventOpenLink />

          <Text style={styles.textContent}>
            {((100 * (split.expectedOutputWithoutSlippage ?? 0)) / total).toFixed(2)} %
          </Text>
        </View>
      ))}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    between: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    changeDex: {
      ...atoms.self_center,
    },
    list: {
      ...atoms.pt_md,
      ...atoms.gap_md,
    },
    splitList: {
      ...atoms.gap_sm,
      ...atoms.p_lg,
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
    reducedPadding: {
      ...atoms.pl_2xs,
      ...atoms.pr_2xs,
      ...atoms.pt_2xs,
      ...atoms.pb_2xs,
    },
  })

  return {styles, color}
}
