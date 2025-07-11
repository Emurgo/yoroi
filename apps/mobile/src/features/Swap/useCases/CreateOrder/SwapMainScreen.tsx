import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useIsKeyboardOpen} from '../../../../kernel/keyboard/useIsKeyboardOpen'
import {isEmptyString} from '../../../../kernel/utils'
import {ShowDisclaimer} from '../../../Legal/Disclaimer/ShowDisclaimer'
import {AmountCard} from '../../../ui/AmountCard/AmountCard'
import {Button, ButtonType} from '../../../ui/Button/Button'
import {EstimateSummary} from '../../../ui/EstimateSummary/EstimateSummary'
import {Icon} from '../../../ui/Icon'
import {useModal} from '../../../ui/Modal/ModalContext'
import {ProtocolAvatar} from '../../../ui/ProtocolAvatar/ProtocolAvatar'
import {RefreshButton} from '../../../ui/RefreshButton/RefreshButton'
import {ShowPriceImpact} from '../../../ui/ShowPriceImpact/ShowPriceImpact'
import {Space} from '../../../ui/Space/Space'
import {WarnLimitPrice} from '../../../ui/WarnLimitPrice/WarnLimitPrice'
import {undefinedToken} from '../../common/constants'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'
import {LimitInput} from './LimitInput'

const LIMIT_PRICE_WARNING_THRESHOLD = 0.1 // 10%
const BOTTOM_ACTION_SECTION = 180

export const SwapMainScreen = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const strings = useStrings()
  const {styles, color, atoms} = useTheme()
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
            style={[
              styles.buttonsWrapper,
              atoms.align_center,
              atoms.justify_between,
              atoms.flex_row,
              atoms.gap_lg,
            ]}
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
    <View
      style={[
        styles.root,
        styles.flex,
        atoms.pb_lg,
        {backgroundColor: color.bg_color_max},
      ]}
    >
      <ScrollView style={[styles.padding, atoms.px_lg]}>
        <ShowDisclaimer type="swap" />

        <Space height="lg" />

        <View
          onLayout={(event) => {
            const {height} = event.nativeEvent.layout
            setContentHeight(height + BOTTOM_ACTION_SECTION)
          }}
        >
          <View style={[styles.container, atoms.gap_lg]}>
            <View
              style={[styles.between, atoms.flex_row, atoms.justify_between]}
            >
              <View
                style={[
                  styles.group,
                  atoms.flex_row,
                  atoms.align_center,
                  atoms.gap_2xs,
                ]}
              >
                <Button
                  onPress={() =>
                    swapForm.action({type: 'ChangeOrderType', value: 'market'})
                  }
                  type={ButtonType.SecondaryText}
                  title={strings.marketButton}
                  size="M"
                  fontOverride={atoms.body_1_lg_medium}
                  {...(swapForm.orderType === 'market' && {
                    style: [
                      styles.activeButton,
                      {backgroundColor: color.gray_100},
                    ],
                  })}
                />

                <Button
                  onPress={() =>
                    swapForm.action({type: 'ChangeOrderType', value: 'limit'})
                  }
                  type={ButtonType.SecondaryText}
                  title={strings.limitButton}
                  size="M"
                  fontOverride={atoms.body_1_lg_medium}
                  {...(swapForm.orderType === 'limit' && {
                    style: [
                      styles.activeButton,
                      {backgroundColor: color.gray_100},
                    ],
                  })}
                />
              </View>

              <View
                style={[
                  styles.group,
                  atoms.flex_row,
                  atoms.align_center,
                  atoms.gap_2xs,
                ]}
              >
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
                  style={[styles.gear, atoms.px_sm, atoms.rounded_full]}
                  onPress={navigateTo.swapSettings}
                />
              </View>
            </View>

            <View style={[styles.cards, atoms.gap_sm]}>
              <AmountCard direction="in" />

              <View style={[styles.relative, atoms.relative]}>
                <Button
                  style={[
                    styles.switch,
                    {
                      top: -28,
                      borderWidth: 2,
                      borderColor: color.bg_color_max,
                      width: 48,
                      height: 48,
                      ...atoms.rounded_full,
                      ...atoms.absolute,
                      ...atoms.z_10,
                      ...atoms.self_center,
                    },
                  ]}
                  fgColorsOverride={{
                    idle: color.text_primary_medium,
                    pressed: color.text_primary_max,
                    disabled: color.text_primary_min,
                  }}
                  bgColorsOverride={{
                    idle: color.bg_color_min,
                    pressed: color.bg_color_min,
                    disabled: color.bg_color_max,
                  }}
                  type={ButtonType.Circle}
                  icon={Icon.Switch}
                  onPress={() => swapForm.action({type: 'SwitchTouched'})}
                />

                <AmountCard direction="out" />
              </View>

              {!isEmptyString(swapForm.tokenOutInput.error) && (
                <View
                  style={[
                    styles.group,
                    atoms.flex_row,
                    atoms.align_center,
                    atoms.gap_2xs,
                  ]}
                >
                  <Icon.Warning size={15} color={color.sys_magenta_500} />

                  <Text
                    style={[
                      styles.errorText,
                      atoms.body_3_sm_regular,
                      {color: color.sys_magenta_500},
                    ]}
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
                <View
                  style={[
                    styles.between,
                    atoms.flex_row,
                    atoms.justify_between,
                  ]}
                >
                  <Text
                    style={[
                      styles.label,
                      atoms.body_1_lg_regular,
                      {color: color.text_gray_low},
                    ]}
                  >
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
          styles.actions,
          atoms.p_lg,
          (deviceHeight < contentHeight || isKeyboardOpen) &&
            styles.actionBorder,
          (deviceHeight < contentHeight || isKeyboardOpen) && atoms.border_t,
          (deviceHeight < contentHeight || isKeyboardOpen) && {
            borderTopColor: color.gray_200,
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

const styles = StyleSheet.create({
  cards: {},
  relative: {},
  switch: {},
  root: {},
  container: {},
  flex: {
    ...a.flex_1,
  },
  padding: {},
  actions: {},
  actionBorder: {},
  activeButton: {},
  between: {},
  group: {},
  gear: {},
  errorText: {},
  label: {},
})
