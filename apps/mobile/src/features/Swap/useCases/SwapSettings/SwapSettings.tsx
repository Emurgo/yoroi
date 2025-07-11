import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLanguage} from '../../../../kernel/i18n'
import {NumberLocale} from '../../../../kernel/i18n/languages'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {Quantities} from '../../../../wallets/utils/utils'
import {KeyboardAvoidingView} from '../../../ui/KeyboardAvoidingView'
import {SettingsSwitch} from '../../../ui/SettingsSwitch/SettingsSwitch'
import {TextInput} from '../../../ui/TextInput'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

type CustomChoice = {
  label: 'Custom'
  value: string
}

type GivenChoice = {
  label: '0.1%' | '0.5%' | '1%' | '2%'
  value: number
}

type Choice = CustomChoice | GivenChoice

type ChoiceKind = Choice['label']

const CHOICES: Readonly<Choice[]> = [
  {label: '0.1%', value: 0.1},
  {label: '0.5%', value: 0.5},
  {label: '1%', value: 1},
  {label: '2%', value: 2},
  {label: 'Custom', value: ''},
] as const

const MAX_DECIMALS = 1

export const SwapSettings = () => {
  const {numberLocale} = useLanguage()
  const {color, atoms} = useTheme()

  const swapForm = useSwap()
  const [aggregator, setAggregator] = React.useState(
    swapForm.managerSettings.routingPreference,
  )

  const assignAggregator = (a: Swap.ManagerSettings['routingPreference']) => {
    setAggregator(a)
    swapForm.assignManagerSettings({
      ...swapForm.managerSettings,
      routingPreference: a,
    })
    swapForm.action({type: 'Refresh'})
  }

  const defaultSelectedChoice = getChoiceBySlippage(
    Number(swapForm.managerSettings.slippage),
    numberLocale,
  )
  const defaultInputValue =
    defaultSelectedChoice.label === 'Custom'
      ? new BigNumber(swapForm.managerSettings.slippage).toFormat(numberLocale)
      : ''

  const [selectedChoiceLabel, setSelectedChoiceLabel] =
    React.useState<ChoiceKind>(defaultSelectedChoice.label)
  const [inputValue, setInputValue] = React.useState(defaultInputValue)

  const strings = useStrings()
  const {track} = useMetrics()

  const selectedChoice = getChoiceByLabel(selectedChoiceLabel)
  const isSelectedChoiceCustom = selectedChoiceLabel === 'Custom'

  const commit = (value: string | number) => {
    const slippage =
      typeof value === 'string' ? parseNumber(value, numberLocale) : value
    track.swapSlippageChanged({slippage_tolerance: slippage})
    swapForm.action({type: 'SlippageInputChanged', value: slippage})
    swapForm.assignManagerSettings({...swapForm.managerSettings, slippage})
  }

  const handleChoicePress = (kind: ChoiceKind) => {
    setSelectedChoiceLabel(kind)
    if (kind !== 'Custom') commit(getChoiceByLabel(kind).value)
  }

  const handleInputChange = (text: string) => {
    const [value] = Quantities.parseFromText(text, MAX_DECIMALS, numberLocale)
    setInputValue(value)

    if (validateSlippage(value, numberLocale)) commit(value)
  }

  const isInputEnabled = isSelectedChoiceCustom
  const hasError =
    isSelectedChoiceCustom && !validateSlippage(inputValue, numberLocale)

  return (
    <KeyboardAvoidingView
      style={[styles.flex, styles.root, {backgroundColor: color.bg_color_max}]}
    >
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[styles.flex, styles.safeAreaView, atoms.p_lg]}
      >
        <ScrollView bounces={false} style={styles.flex}>
          <Text style={[styles.heading, {color: color.gray_600}]}>
            {strings.slippageTolerance}
          </Text>

          <View
            style={[
              styles.choicesContainer,
              atoms.flex_row,
              atoms.pb_xl,
              atoms.flex_wrap,
            ]}
          >
            {CHOICES.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.choiceButton,
                  atoms.p_sm,
                  selectedChoiceLabel === choice.label &&
                    styles.selectedChoiceButton,
                  selectedChoiceLabel === choice.label && {
                    backgroundColor: color.gray_200,
                    borderRadius: 8,
                  },
                ]}
                onPress={() => handleChoicePress(choice.label)}
              >
                <Text
                  style={[
                    styles.label,
                    {color: color.text_gray_max},
                    selectedChoiceLabel === choice.label &&
                      styles.selectedChoiceLabel,
                    selectedChoiceLabel === choice.label && {
                      color: color.text_gray_max,
                    },
                  ]}
                >
                  {choice.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedChoice.label === 'Custom' && (
            <TextInput
              value={
                isInputEnabled
                  ? inputValue
                  : new BigNumber(selectedChoice.value).toFormat(numberLocale)
              }
              onChangeText={handleInputChange}
              editable={isInputEnabled}
              key={isInputEnabled ? 'enabled' : 'disabled'}
              selectTextOnFocus={isInputEnabled}
              autoFocus={isInputEnabled}
              style={[
                styles.input,
                {color: color.text_gray_medium},
                !isSelectedChoiceCustom && {backgroundColor: color.gray_100},
              ]}
              keyboardType="numeric"
              selectionColor={color.el_gray_max}
              cursorColor={color.el_gray_max}
              right={
                <Text
                  style={[styles.percentLabel, {color: color.text_gray_medium}]}
                >
                  %
                </Text>
              }
              helper={
                isSelectedChoiceCustom && !hasError ? (
                  <Text
                    style={[
                      styles.textInfo,
                      styles.bottomText,
                      {color: color.text_gray_700},
                    ]}
                  >
                    {strings.enterSlippage}
                  </Text>
                ) : isSelectedChoiceCustom && hasError ? (
                  <Text
                    style={[
                      styles.bottomText,
                      styles.errorText,
                      {color: color.sys_magenta_500},
                    ]}
                  >
                    {strings.slippageToleranceError}
                  </Text>
                ) : undefined
              }
            />
          )}

          <Text style={[styles.heading, {color: color.gray_600}]}>
            {strings.routingPreferences}
          </Text>

          <View style={[styles.routing, atoms.gap_md]}>
            <View
              style={[
                styles.between,
                atoms.flex_row,
                atoms.justify_between,
                atoms.align_center,
              ]}
            >
              <Text style={[styles.label, {color: color.text_gray_max}]}>
                {strings.auto}
              </Text>

              <SettingsSwitch
                value={aggregator === 'auto'}
                onValueChange={() =>
                  assignAggregator(
                    aggregator === 'auto'
                      ? ['muesliswap', 'dexhunter']
                      : 'auto',
                  )
                }
              />
            </View>

            {aggregator !== 'auto' && (
              <>
                <View
                  style={[
                    styles.between,
                    atoms.flex_row,
                    atoms.justify_between,
                    atoms.align_center,
                  ]}
                >
                  <Text style={[styles.label, {color: color.text_gray_max}]}>
                    DexHunter
                  </Text>

                  <SettingsSwitch
                    value={aggregator.includes('dexhunter')}
                    onValueChange={() =>
                      assignAggregator(
                        aggregator.includes('dexhunter')
                          ? ['muesliswap']
                          : [...aggregator, 'dexhunter'],
                      )
                    }
                  />
                </View>

                <View
                  style={[
                    styles.between,
                    atoms.flex_row,
                    atoms.justify_between,
                    atoms.align_center,
                  ]}
                >
                  <Text style={[styles.label, {color: color.text_gray_max}]}>
                    MuesliSwap
                  </Text>

                  <SettingsSwitch
                    value={aggregator.includes('muesliswap')}
                    onValueChange={() =>
                      assignAggregator(
                        aggregator.includes('muesliswap')
                          ? ['dexhunter']
                          : [...aggregator, 'muesliswap'],
                      )
                    }
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    ...a.flex_1,
  },
  root: {},
  between: {},
  safeAreaView: {},
  textInfo: {
    ...a.body_3_sm_regular,
  },
  heading: {
    ...a.py_lg,
    ...a.body_1_lg_regular,
  },
  bottomText: {
    ...a.body_3_sm_regular,
    ...a.py_xs,
  },
  choicesContainer: {},
  choiceButton: {},
  routing: {},
  selectedChoiceButton: {},
  label: {
    ...a.body_1_lg_regular,
  },
  selectedChoiceLabel: {},
  errorText: {
    ...a.body_3_sm_regular,
  },
  input: {
    ...a.body_1_lg_regular,
  },
  percentLabel: {
    ...a.p_lg,
    ...a.absolute,
    right: 0,
    top: 0,
  },
})

const validateSlippage = (text: string, format: NumberLocale) => {
  const slippage = parseNumber(text, format)

  return !isNaN(slippage) && slippage >= 0 && slippage <= 75
}

const parseNumber = (text: string, format: NumberLocale) => {
  const [, quantity] = Quantities.parseFromText(text, MAX_DECIMALS, format)
  return Number(Quantities.denominated(quantity, MAX_DECIMALS))
}

const getChoiceBySlippage = (
  slippage: number,
  format: NumberLocale,
): Choice => {
  return (
    CHOICES.find((choice) => choice.value === slippage) ?? {
      label: 'Custom',
      value: new BigNumber(slippage).toFormat(format),
    }
  )
}

const getChoiceByLabel = (label: ChoiceKind): Choice => {
  return (
    CHOICES.find((choice) => choice.label === label) ?? {
      label: 'Custom',
      value: '',
    }
  )
}
