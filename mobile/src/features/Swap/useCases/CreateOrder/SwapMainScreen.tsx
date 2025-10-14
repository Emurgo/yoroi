import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {ShowDisclaimer} from '~/features/Legal/ui/shared/Disclaimer/ShowDisclaimer'
import {AmountCard} from '~/features/Swap/common/AmountCard/AmountCard'
import {EstimateSummary} from '~/features/Swap/common/EstimateSummary/EstimateSummary'
import {undefinedToken} from '~/features/Swap/common/constants'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {ProtocolAvatar} from '~/ui/ProtocolAvatar/ProtocolAvatar'
import {RefreshButton} from '~/ui/RefreshButton/RefreshButton'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {ShowPriceImpact} from '~/ui/ShowPriceImpact/ShowPriceImpact'
import {isEmptyString} from '~/wallets/utils/string'

import {useNavigateTo} from '../../common/navigation'
import {LimitInput} from './LimitInput'
import {WarnLimitPrice} from './WarnLimitPrice'

// TODO: should be part of the config
const limitPriceThresholdForWarning = 0.1 // 10%

export const SwapMainScreen = () => {
  const {scrollViewRef} = useScrollView()
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const swapForm = useSwap()
  const {openModal, closeModal} = useModal()
  const navigateTo = useNavigateTo()
  const tokenInInfo = swapForm.tokenInfos?.get?.(
    swapForm.tokenInInput.tokenId ?? undefinedToken,
  )
  const tokenOutInfo = swapForm.tokenInfos?.get?.(
    swapForm.tokenOutInput.tokenId ?? undefinedToken,
  )

  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-'
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-'

  const onSwapPress = () => {
    const wantedPrice = Number(swapForm.wantedPrice)
    const marketPrice = swapForm.estimate?.netPrice ?? 0
    const difference = Math.abs(wantedPrice - marketPrice)
    const threshold = marketPrice * limitPriceThresholdForWarning

    if (swapForm.orderType === 'limit' && difference > threshold) {
      openModal({
        title: strings.swap.limitPriceWarningTitle,
        content: (
          <Modal.Content>
            <WarnLimitPrice
              wantedPrice={wantedPrice.toFixed(tokenOutInfo?.decimals ?? 6)}
              marketPrice={marketPrice.toFixed(tokenOutInfo?.decimals ?? 6)}
              tokenInTicker={tokenInTicker}
              tokenOutTicker={tokenOutTicker}
            />
          </Modal.Content>
        ),
        footer: (
          <Modal.Footer>
            <Button
              style={[a.flex_1]}
              size="S"
              type={ButtonType.Secondary}
              title={strings.swap.limitPriceWarningBack}
              onPress={closeModal}
            />

            <Button
              style={[a.flex_1]}
              size="S"
              title={strings.swap.limitPriceWarningConfirm}
              onPress={() => {
                closeModal()
                swapForm.create()
              }}
            />
          </Modal.Footer>
        ),
      })
    } else {
      swapForm.create()
    }
  }

  return (
    <SafeArea>
      <ScrollView ref={scrollViewRef} style={[a.px_lg]}>
        <ShowDisclaimer type="swap" />

        <View style={a.flex_1}>
          <View style={[a.gap_lg]}>
            <View style={[a.flex_row, a.justify_between]}>
              <View style={[a.flex_row, a.align_center, a.gap_2xs]}>
                <Button
                  onPress={() =>
                    swapForm.action({type: 'ChangeOrderType', value: 'market'})
                  }
                  type={ButtonType.SecondaryText}
                  title={strings.swap.marketButton}
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
                  title={strings.swap.limitButton}
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
                  <Text style={[a.body_1_lg_regular, ta.text_gray_low]}>
                    {strings.swap.route}
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

      <SafeArea.Footer>
        <Button
          testID="swapButton"
          title={
            swapForm.orderType === 'market'
              ? strings.swap.swapButton
              : strings.swap.placeOrder
          }
          disabled={!swapForm.canSwap}
          isLoading={swapForm.isLoading}
          onPress={onSwapPress}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
