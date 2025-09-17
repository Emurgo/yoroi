import {atoms as a, useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'

import * as React from 'react'
import {Text, View} from 'react-native'

import {undefinedToken} from '~/features/Swap/common/constants'
import {useNavigateTo} from '~/features/Swap/common/navigation'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {ModalContentWrapper} from '~/ui/Modal/ModalContentWrapper'
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

  const tokenInInfo = swapForm.tokenInfos.get(
    swapForm.tokenInInput.tokenId ?? undefinedToken,
  )
  const tokenOutInfo = swapForm.tokenInfos.get(
    swapForm.tokenOutInput.tokenId ?? undefinedToken,
  )

  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-'
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-'

  const protocol = swapForm.estimate?.splits[0]?.protocol

  if (swapForm.estimate === undefined) return null

  const netPrice = swapForm.estimate.netPrice
  const roundedPrice = netPrice
    .toFixed(tokenOutInfo?.decimals ?? 0)
    .replace(/\.0+$/, '')
  const price = roundedPrice !== '0' ? roundedPrice : netPrice.toFixed(6)

  const expand = () =>
    openModal({
      content: (
        <ModalContentWrapper
          content={<Splits data={swapForm.estimate?.splits ?? []} />}
          footer={<SwapInfoLink />}
        />
      ),
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
        value={`1 ${tokenInTicker} = ${price} ${tokenOutTicker}`}
      />

      <Space.Height.sm />

      <Row
        label={strings.swap.swapFeesTitle}
        description={strings.swap.swapFees}
        value={`${swapForm.estimate?.totalFee} ${wallet.portfolioPrimaryTokenInfo.ticker}`}
      />

      <Space.Height.sm />

      <Row
        label={strings.swap.swapMinReceivedTitle}
        description={strings.swap.swapMinReceived}
        value={`${swapForm.estimate?.totalOutput} ${tokenOutTicker}`}
      />

      <Space.Height.sm />

      <Row
        label={strings.swap.swapSlippageTitle}
        description={strings.swap.swapSlippage}
        value={`${swapForm.slippageInput.value}%`}
      />
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
                  <ModalContentWrapper
                    content={
                      <View style={[a.flex_1, a.justify_center]}>
                        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
                          {description}
                        </Text>
                      </View>
                    }
                    footer={<SwapInfoLink />}
                  />
                ),
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
  const {palette: p} = useTheme()

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
            <ProtocolAvatar protocol={split.protocol} preventOpenLink />

            <Text style={[a.body_1_lg_regular, {color: p.el_gray_min}]}>
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
