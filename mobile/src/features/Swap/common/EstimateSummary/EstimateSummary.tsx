import {parseNumberFromText} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'

import * as React from 'react'
import {Text, View} from 'react-native'

import {undefinedToken} from '~/features/Swap/common/constants'
import {useNavigateTo} from '~/features/Swap/common/navigation'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/ModalContext'
import {ProtocolAvatar} from '~/ui/ProtocolAvatar/ProtocolAvatar'
import {Space} from '~/ui/Space/Space'
import {SwapInfoLink} from '~/ui/SwapInfoLink/SwapInfoLink'

export const EstimateSummary = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const swapForm = useSwap()
  const {openModal} = useModal()
  const navigateTo = useNavigateTo()
  const {numberLocale} = useLanguage()
  const localFormat = (v: number | string, precision?: number) =>
    parseNumberFromText({text: String(v), format: numberLocale, precision})
      .formattedValue
  const tokenInInfo = swapForm.tokenInfos.get(
    swapForm.tokenInInput.tokenId ?? undefinedToken,
  )
  const tokenOutInfo = swapForm.tokenInfos.get(
    swapForm.tokenOutInput.tokenId ?? undefinedToken,
  )

  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-'
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-'

  const protocol = swapForm.estimate?.splits[0]?.protocol
  const fallbackImageUrl = swapForm.estimate?.splits[0]?.aggregatorImageUrl
  const nameOverride =
    protocol === Swap.Protocol.Unsupported
      ? swapForm.estimate?.splits[0]?.aggregatorDexKey
      : undefined

  if (swapForm.estimate === undefined) return null

  const expand = () =>
    openModal({
      content: <Splits data={swapForm.estimate?.splits ?? []} />,
      footer: <SwapInfoLink />,
    })

  return (
    <View style={a.p_lg}>
      <Row
        label={strings.swap.route}
        description={strings.swap.routeDescription}
        value={
          protocol !== undefined && (
            <View style={[a.flex_row, a.align_center, a.gap_xs]}>
              <ProtocolAvatar
                protocol={protocol}
                nameOverride={nameOverride}
                fallbackImageUrl={fallbackImageUrl}
                onPress={
                  swapForm.orderType === 'limit'
                    ? navigateTo.selectProtocol
                    : expand
                }
                {...((swapForm.estimate?.splits.length ?? 0) > 1 && {
                  append: '...',
                })}
              />
            </View>
          )
        }
      />

      <Space.Height.sm />

      <Row
        label={strings.swap.price}
        description={
          swapForm.orderType === 'limit'
            ? strings.swap.limitPriceInfo
            : strings.swap.marketPriceInfo
        }
        value={`1 ${tokenInTicker} = ${localFormat(swapForm.estimate?.netPrice ?? 0, Math.max(tokenOutInfo?.decimals ?? 0, tokenInInfo?.decimals ?? 0, 3))} ${tokenOutTicker}`}
      />

      <Space.Height.sm />

      <Row
        label={strings.swap.swapFeesTitle}
        description={strings.swap.swapFees}
        value={`${localFormat(swapForm.estimate?.totalFee)} ${wallet.portfolioPrimaryTokenInfo.ticker}`}
      />

      <Space.Height.sm />

      <Row
        label={strings.swap.swapMinReceivedTitle}
        description={strings.swap.swapMinReceived}
        value={`${localFormat(swapForm.estimate?.totalOutput)} ${tokenOutTicker}`}
      />

      <Space.Height.sm />

      {swapForm.orderType === 'market' && (
        <Row
          label={strings.swap.swapSlippageTitle}
          description={strings.swap.swapSlippage}
          value={`${localFormat(swapForm.slippageInput.value)}%`}
        />
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
  const {atoms: ta, palette: p} = useTheme()
  const {openModal} = useModal()

  return (
    <View style={[a.flex_row, a.justify_between]}>
      <View style={[a.flex_row, a.align_center, a.gap_xs]}>
        <Text style={[a.body_1_lg_regular, a.self_center, ta.text_gray_low]}>
          {label}
        </Text>

        {description !== undefined && (
          <Button
            style={[a.pl_2xs, a.pr_2xs, a.pt_2xs, a.pb_2xs]}
            onPress={() =>
              openModal({
                title: label,
                content: (
                  <View style={[a.flex_1, a.justify_center]}>
                    <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
                      {description}
                    </Text>
                  </View>
                ),
                footer: <SwapInfoLink />,
              })
            }
            type={ButtonType.SecondaryText}
            icon={({size}) => Icon.Info({size, color: p.text_gray_low})}
            size="S"
          />
        )}
      </View>

      {typeof value === 'string' || typeof value === 'number' ? (
        <Text
          style={[
            a.body_1_lg_regular,
            a.self_center,
            {color: p.text_gray_medium},
          ]}
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  )
}

export const Splits = ({data}: {data: Swap.Split[]}) => {
  const {atoms: ta} = useTheme()

  const total = data.reduce(
    (acc, curr) => (acc += curr.expectedOutputWithoutSlippage),
    0,
  )

  return (
    <View style={[a.gap_md]}>
      {[...data]
        .sort(
          (a, b) =>
            b.expectedOutputWithoutSlippage - a.expectedOutputWithoutSlippage,
        )
        .map((split, index) => (
          <View
            key={index}
            style={[
              a.flex_row,
              a.align_center,
              a.gap_xs,
              a.flex_row,
              a.justify_between,
            ]}
          >
            <ProtocolAvatar
              protocol={split.protocol}
              fallbackImageUrl={split.aggregatorImageUrl}
              nameOverride={
                split.protocol === Swap.Protocol.Unsupported
                  ? split.aggregatorDexKey
                  : undefined
              }
              preventOpenLink
            />

            <Text style={[a.body_1_lg_regular, ta.el_gray_max]}>
              {(
                (100 * (split.expectedOutputWithoutSlippage ?? 0)) /
                total
              ).toFixed(2)}{' '}
              %
            </Text>
          </View>
        ))}
    </View>
  )
}
