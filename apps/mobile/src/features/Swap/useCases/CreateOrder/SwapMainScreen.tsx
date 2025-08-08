import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {undefinedToken} from '~/features/Swap/common/constants'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useIsKeyboardOpen} from '~/kernel/keyboard/useIsKeyboardOpen'
import {AmountCard} from '~/ui/AmountCard/AmountCard'
import {Button, ButtonType} from '~/ui/Button/Button'
import {EstimateSummary} from '~/ui/EstimateSummary/EstimateSummary'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/ModalContext'
import {ProtocolAvatar} from '~/ui/ProtocolAvatar/ProtocolAvatar'
import {RefreshButton} from '~/ui/RefreshButton/RefreshButton'
import {ShowPriceImpact} from '~/ui/ShowPriceImpact/ShowPriceImpact'
import {Space} from '~/ui/Space/Space'
import {WarnLimitPrice} from '~/ui/WarnLimitPrice/WarnLimitPrice'
import {isEmptyString} from '~/wallets/utils/string'
import {useNavigateTo} from '../../common/navigation'
import {ShowDisclaimer} from '../Legal/Disclaimer/ShowDisclaimer'
import {LimitInput} from './LimitInput'

const LIMIT_PRICE_WARNING_THRESHOLD = 0.1 // 10%
const BOTTOM_ACTION_SECTION = 180

export const SwapMainScreen = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {height: deviceHeight} = useWindowDimensions()
  const isKeyboardOpen = useIsKeyboardOpen()
  const swapForm = useSwap()
  const {openModal, closeModal} = useModal()
  const navigateTo = useNavigateTo()

  const tokenInInfo = swapForm.tokenInfos.get(
    swapForm.tokenInInput.tokenId ?? undefinedToken,
  )
  const tokenOutInfo = swapForm.tokenInfos.get(
    swapForm.tokenOutInput.tokenId ?? undefinedToken,
  )

  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-'
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-'

  const onSwapPress = () => {
    const wantedPrice = Number(swapForm.wantedPrice)
    const marketPrice = swapForm.estimate?.netPrice ?? 0
    const difference = Math.abs(wantedPrice - marketPrice)
    const threshold = marketPrice * LIMIT_PRICE_WARNING_THRESHOLD

    if (swapForm.orderType === 'limit' && difference > threshold) {
      openModal({
        title: strings.limitPriceWarningTitle,
        content: (
          <WarnLimitPrice
            wantedPrice={wantedPrice.toFixed(tokenOutInfo?.decimals ?? 6)}
            marketPrice={marketPrice.toFixed(tokenOutInfo?.decimals ?? 6)}
            tokenInTicker={tokenInTicker}
            tokenOutTicker={tokenOutTicker}
          />
        ),
        footer: (
          <View
            style={[a.align_center, a.justify_between, a.flex_row, a.gap_lg]}
          >
            <Button
              size="S"
              type={ButtonType.Secondary}
              title={strings.limitPriceWarningBack}
              onPress={closeModal}
            />

            <Button
              size="S"
              title={strings.limitPriceWarningConfirm}
              onPress={swapForm.create}
            />
          </View>
        ),
      })
    } else {
      swapForm.create()
    }
  }

  return (
    <View style={[a.flex_1, a.pb_lg, {backgroundColor: p.bg_color_max}]}>
      <ScrollView style={[a.px_lg]}>
        <ShowDisclaimer type="swap" />

        <Space.Height.lg />

        <View
          onLayout={(event) => {
            const {height} = event.nativeEvent.layout
            setContentHeight(height + BOTTOM_ACTION_SECTION)
          }}
        >
          <View style={[a.gap_lg]}>
            <View style={[a.flex_row, a.justify_between]}>
              <View style={[a.flex_row, a.align_center, a.gap_2xs]}>
                <Button
                  onPress={() =>
                    swapForm.action({type: 'ChangeOrderType', value: 'market'})
                  }
                  type={ButtonType.SecondaryText}
                  title={strings.marketButton}
                  size="M"
                  fontOverride={a.body_1_lg_medium}
                  {...(swapForm.orderType === 'market' && {
                    style: [{backgroundColor: p.gray_100}],
                  })}
                />

                <Button
                  onPress={() =>
                    swapForm.action({type: 'ChangeOrderType', value: 'limit'})
                  }
                  type={ButtonType.SecondaryText}
                  title={strings.limitButton}
                  size="M"
                  fontOverride={a.body_1_lg_medium}
                  {...(swapForm.orderType === 'limit' && {
                    style: [{backgroundColor: p.gray_100}],
                  })}
                />
              </View>

              <View style={[a.flex_row, a.align_center, a.gap_2xs]}>
                <RefreshButton
                  onPress={() => swapForm.action({type: 'Refresh'})}
                  disabled={
                    !swapForm.tokenInInput.isTouched ||
                    !swapForm.tokenOutInput.isTouched
                  }
                />

                <Button
                  type={ButtonType.SecondaryText}
                  icon={Icon.Gear}
                  style={[a.px_sm, a.rounded_full]}
                  onPress={navigateTo.swapSettings}
                />
              </View>
            </View>

            <View style={[a.gap_sm]}>
              <AmountCard direction="in" />

              <View style={[a.relative]}>
                <Button
                  style={[
                    {
                      top: -28,
                      borderWidth: 2,
                      borderColor: p.bg_color_max,
                      width: 48,
                      height: 48,
                    },
                    a.rounded_full,
                    a.absolute,
                    a.z_10,
                    a.self_center,
                  ]}
                  fgColorsOverride={{
                    idle: p.text_primary_medium,
                    pressed: p.text_primary_max,
                    disabled: p.text_primary_min,
                  }}
                  bgColorsOverride={{
                    idle: p.bg_color_min,
                    pressed: p.bg_color_min,
                    disabled: p.bg_color_max,
                  }}
                  type={ButtonType.Circle}
                  icon={Icon.Switch}
                  onPress={() => swapForm.action({type: 'SwitchTouched'})}
                />

                <AmountCard direction="out" />
              </View>

              {!isEmptyString(swapForm.tokenOutInput.error) && (
                <View style={[a.flex_row, a.align_center, a.gap_2xs]}>
                  <Icon.Warning size={15} color={p.sys_magenta_500} />

                  <Text
                    style={[a.body_3_sm_regular, {color: p.sys_magenta_500}]}
                  >
                    {swapForm.tokenOutInput.error}
                  </Text>
                </View>
              )}
            </View>

            {swapForm.orderType === 'limit' && <LimitInput />}

            {swapForm.orderType === 'market' && (
              <ShowPriceImpact priceImpact={swapForm.estimate?.priceImpact} />
            )}

            {swapForm.orderType === 'limit' &&
              swapForm.selectedProtocol.value !== undefined &&
              swapForm.estimate === undefined && (
                <View style={[a.flex_row, a.justify_between]}>
                  <Text style={[a.body_1_lg_regular, {color: p.text_gray_low}]}>
                    {strings.route}
                  </Text>

                  <ProtocolAvatar
                    protocol={swapForm.selectedProtocol.value}
                    onPress={navigateTo.selectProtocol}
                  />
                </View>
              )}

            <EstimateSummary />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          a.p_lg,
          (deviceHeight < contentHeight || isKeyboardOpen) && a.border_t,
          (deviceHeight < contentHeight || isKeyboardOpen) && {
            borderTopColor: p.gray_200,
          },
        ]}
      >
        <Button
          testID="swapButton"
          title={
            swapForm.orderType === 'market'
              ? strings.swapButton
              : strings.placeOrder
          }
          disabled={!swapForm.canSwap}
          isLoading={swapForm.isLoading}
          onPress={onSwapPress}
        />
      </View>
    </View>
  )
}
