import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {RefreshButton} from '../../../../components/RefreshButton/RefreshButton'
import {Space} from '../../../../components/Space/Space'
import {useIsKeyboardOpen} from '../../../../kernel/keyboard/useIsKeyboardOpen'
import {isEmptyString} from '../../../../kernel/utils'
import {ShowDisclaimer} from '../../../Legal/Disclaimer/ShowDisclaimer'
import {AmountCard} from '../../common/AmountCard/AmountCard'
import {undefinedToken} from '../../common/constants'
import {useNavigateTo} from '../../common/navigation'
import {ProtocolAvatar} from '../../common/Protocol/ProtocolAvatar'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'
import {EstimateSummary} from './EstimateSummary'
import {LimitInput} from './LimitInput'
import {ShowPriceImpact} from './ShowPriceImpact'
import {WarnLimitPrice} from './WarnLimitPrice'

const LIMIT_PRICE_WARNING_THRESHOLD = 0.1 // 10%
const BOTTOM_ACTION_SECTION = 180

export const SwapMainScreen = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const strings = useStrings()
  const {styles, color} = useStyles()
  const {height: deviceHeight} = useWindowDimensions()
  const isKeyboardOpen = useIsKeyboardOpen()
  const swapForm = useSwap()
  const {openModal, closeModal} = useModal()
  const navigateTo = useNavigateTo()

  const tokenInInfo = swapForm.tokenInfos.get(swapForm.tokenInInput.tokenId ?? undefinedToken)
  const tokenOutInfo = swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken)

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
          <View style={styles.buttonsWrapper}>
            <Button size="S" type={ButtonType.Secondary} title={strings.limitPriceWarningBack} onPress={closeModal} />

            <Button size="S" title={strings.limitPriceWarningConfirm} onPress={swapForm.create} />
          </View>
        ),
      })
    } else {
      swapForm.create()
    }
  }

  return (
    <View style={[styles.root, styles.flex]}>
      <ScrollView style={styles.padding}>
        <ShowDisclaimer type="swap" />

        <Space height="lg" />

        <View
          onLayout={(event) => {
            const {height} = event.nativeEvent.layout
            setContentHeight(height + BOTTOM_ACTION_SECTION)
          }}
        >
          <View style={styles.container}>
            <View style={styles.between}>
              <View style={styles.group}>
                <Button
                  onPress={() => swapForm.action({type: 'ChangeOrderType', value: 'market'})}
                  type={ButtonType.SecondaryText}
                  title={strings.marketButton}
                  size="M"
                  fontOverride={styles.groupFont}
                  {...(swapForm.orderType === 'market' && {style: styles.activeButton})}
                />

                <Button
                  onPress={() => swapForm.action({type: 'ChangeOrderType', value: 'limit'})}
                  type={ButtonType.SecondaryText}
                  title={strings.limitButton}
                  size="M"
                  fontOverride={styles.groupFont}
                  {...(swapForm.orderType === 'limit' && {style: styles.activeButton})}
                />
              </View>

              <View style={styles.group}>
                <RefreshButton
                  onPress={() => swapForm.action({type: 'Refresh'})}
                  disabled={!swapForm.tokenInInput.isTouched || !swapForm.tokenOutInput.isTouched}
                />

                <Button
                  type={ButtonType.SecondaryText}
                  icon={Icon.Gear}
                  style={styles.gear}
                  onPress={navigateTo.swapSettings}
                />
              </View>
            </View>

            <View style={styles.cards}>
              <AmountCard direction="in" />

              <View style={styles.relative}>
                <Button
                  style={styles.switch}
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
                <View style={styles.group}>
                  <Icon.Warning size={15} color={color.sys_magenta_500} />

                  <Text style={styles.errorText}>{swapForm.tokenOutInput.error}</Text>
                </View>
              )}
            </View>

            {swapForm.orderType === 'limit' && <LimitInput />}

            {swapForm.orderType === 'market' && <ShowPriceImpact priceImpact={swapForm.estimate?.priceImpact} />}

            {swapForm.orderType === 'limit' &&
              swapForm.selectedProtocol.value !== undefined &&
              swapForm.estimate === undefined && (
                <View style={styles.between}>
                  <Text style={styles.label}>{strings.route}</Text>

                  <ProtocolAvatar protocol={swapForm.selectedProtocol.value} onPress={navigateTo.selectProtocol} />
                </View>
              )}

            <EstimateSummary />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, (deviceHeight < contentHeight || isKeyboardOpen) && styles.actionBorder]}>
        <Button
          testID="swapButton"
          title={swapForm.orderType === 'market' ? strings.swapButton : strings.placeOrder}
          disabled={!swapForm.canSwap}
          isLoading={swapForm.isLoading}
          onPress={onSwapPress}
        />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    cards: {
      ...atoms.gap_sm,
    },
    relative: {
      ...atoms.relative,
    },
    switch: {
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
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.pb_lg,
    },
    container: {
      ...atoms.gap_lg,
    },
    flex: {
      ...atoms.flex_1,
    },
    padding: {
      ...atoms.px_lg,
    },
    actions: {
      ...atoms.p_lg,
    },
    actionBorder: {
      ...atoms.border_t,
      borderTopColor: color.gray_200,
    },
    activeButton: {
      backgroundColor: color.gray_100,
    },
    between: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    group: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_2xs,
    },
    groupFont: {
      ...atoms.body_1_lg_medium,
    },
    buttonsWrapper: {
      ...atoms.align_center,
      ...atoms.justify_between,
      ...atoms.flex_row,
      ...atoms.gap_lg,
    },
    gear: {
      ...atoms.px_sm,
      ...atoms.rounded_full,
    },
    errorText: {
      ...atoms.body_3_sm_regular,
      color: color.sys_magenta_500,
    },
    label: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_low,
    },
  })

  return {styles, atoms, color}
}
