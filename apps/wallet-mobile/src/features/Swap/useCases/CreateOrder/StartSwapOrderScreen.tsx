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
import {usePortfolioBalances} from '../../../Portfolio/common/hooks/usePortfolioBalances'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {AmountCard} from '../../common/AmountCard/AmountCard'
import {undefinedToken} from '../../common/constants'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'
import {EditPrice} from './EditPrice'
import {ListSplitsByProvider} from './ListSplitsByProvider'
import {WarnLimitPrice} from './WarnLimitPrice'

const LIMIT_PRICE_WARNING_THRESHOLD = 0.1 // 10%
const BOTTOM_ACTION_SECTION = 180

export const StartSwapOrderScreen = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const strings = useStrings()
  const {styles} = useStyles()
  const {height: deviceHeight} = useWindowDimensions()
  const isKeyboardOpen = useIsKeyboardOpen()
  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const swapForm = useSwap()
  const navigate = useNavigateTo()
  const {openModal, closeModal} = useModal()

  const amountIn = balances.records.get(swapForm.tokenInInput.tokenId ?? undefinedToken) ?? {
    info: swapForm.tokenInfos.get(swapForm.tokenInInput.tokenId ?? undefinedToken),
    quantity: balances.records.get(swapForm.tokenInInput.tokenId ?? undefinedToken)?.quantity,
  }

  const amountOut = {
    info: swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken),
    quantity: balances.records.get(swapForm.tokenOutInput.tokenId ?? undefinedToken)?.quantity,
  }

  const onSwapPress = () => {
    const wantedPrice = Number(swapForm.wantedPrice)
    const marketPrice = swapForm.estimate?.netPrice ?? 0
    const difference = Math.abs(wantedPrice - marketPrice)
    const threshold = marketPrice * LIMIT_PRICE_WARNING_THRESHOLD

    if (swapForm.orderType === 'limit' && difference > threshold) {
      openModal({
        title: strings.limitPriceWarningTitle,
        content: <WarnLimitPrice />,
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
                  size="S"
                  {...(swapForm.orderType === 'market' && {style: styles.activeButton})}
                />

                <Button
                  onPress={() => swapForm.action({type: 'ChangeOrderType', value: 'limit'})}
                  type={ButtonType.SecondaryText}
                  title={strings.limitButton}
                  size="S"
                  {...(swapForm.orderType === 'limit' && {style: styles.activeButton})}
                />
              </View>

              <View>
                <RefreshButton
                  onPress={() => swapForm.action({type: 'Refresh'})}
                  disabled={!swapForm.tokenInInput.isTouched || !swapForm.tokenOutInput.isTouched}
                />
              </View>
            </View>

            <AmountCard
              label={strings.swapFrom}
              onChange={(value) => swapForm.action({type: 'TokenInAmountChanged', value})}
              value={swapForm.tokenInInput.value}
              amount={amountIn}
              wallet={wallet}
              navigateTo={navigate.selectSellToken}
              touched={swapForm.tokenInInput.isTouched}
              inputRef={swapForm.tokenInInputRef}
              error={swapForm.tokenInInput.error}
              testID="swap:sell-edit"
            />

            <View style={styles.between}>
              <View>
                <Button
                  type={ButtonType.Text}
                  icon={Icon.Switch}
                  onPress={() => swapForm.action({type: 'SwitchTouched'})}
                />
              </View>

              <View>
                <Button
                  type={ButtonType.Text}
                  onPress={() => swapForm.action({type: 'ResetAmounts'})}
                  title={strings.clear}
                />
              </View>
            </View>

            <AmountCard
              label={strings.swapTo}
              onChange={(value) => swapForm.action({type: 'TokenOutAmountChanged', value})}
              value={swapForm.tokenOutInput.value}
              amount={amountOut}
              wallet={wallet}
              navigateTo={navigate.selectBuyToken}
              touched={swapForm.tokenOutInput.isTouched}
              inputRef={swapForm.tokenOutInputRef}
              error={swapForm.tokenOutInput.error}
              testID="swap:buy-edit"
            />

            <EditPrice />

            {swapForm.orderType === 'market' && (
              <View style={styles.between}>
                <View style={styles.slippage}>
                  <Text style={styles.slippageLabel}>{strings.slippageTolerance}</Text>

                  <Button
                    onPress={() =>
                      openModal({
                        title: strings.slippageTolerance,
                        content: <Text style={styles.textContent}>{strings.slippageToleranceInfo}</Text>,
                      })
                    }
                    type={ButtonType.SecondaryText}
                    icon={Icon.Info}
                  />
                </View>

                <View>
                  <Button
                    onPress={navigate.editSlippage}
                    type={ButtonType.SecondaryText}
                    title={`${swapForm.slippageInput.value}%`}
                    rightIcon
                    icon={Icon.Edit}
                  />
                </View>
              </View>
            )}

            <ListSplitsByProvider />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, (deviceHeight < contentHeight || isKeyboardOpen) && styles.actionBorder]}>
        <Button testID="swapButton" title={strings.swapTitle} disabled={!swapForm.canSwap} onPress={onSwapPress} />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    slippage: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_xs,
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
      ...atoms.pt_lg,
      ...atoms.px_lg,
    },
    actionBorder: {
      ...atoms.border_t,
      borderTopColor: color.gray_200,
    },
    activeButton: {
      backgroundColor: color.el_gray_min,
    },
    between: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    group: {
      ...atoms.flex_row,
      ...atoms.gap_md,
      ...atoms.align_center,
    },
    textContent: {
      color: color.gray_900,
      ...atoms.body_1_lg_regular,
      ...atoms.px_lg,
    },
    slippageLabel: {
      color: color.text_gray_low,
      ...atoms.body_1_lg_regular,
    },
    buttonsWrapper: {
      ...atoms.align_center,
      ...atoms.justify_between,
      ...atoms.flex_row,
      ...atoms.gap_lg,
      ...atoms.pt_lg,
    },
  })

  return {styles, atoms}
}
