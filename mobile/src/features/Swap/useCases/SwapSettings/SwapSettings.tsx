import {parseNumberFromText} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Numbers, Swap} from '@yoroi/types'

import BigNumber from 'bignumber.js'
import * as React from 'react'
import {ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useSwap} from '~/features/Swap/common/useSwap'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'
import {TextInput} from '~/ui/TextInput/TextInput'

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

// Keeping for reference; not used directly after changing toggle behavior
// const ALL_AGGREGATORS: Swap.Aggregator[] = [
//   'muesliswap',
//   'dexhunter',
//   'minswap',
// ]

const toggleAggregator = (
  current: Swap.Aggregator[],
  target: Swap.Aggregator,
): Swap.Aggregator[] => {
  if (current.includes(target)) {
    const remaining = current.filter((opt) => opt !== target)
    return remaining
  } else {
    return [...current, target]
  }
}

export const SwapSettings = () => {
  const {numberLocale} = useLanguage()
  const {palette: p} = useTheme()

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
    const result = parseNumberFromText({
      text,
      format: numberLocale,
      precision: MAX_DECIMALS,
    })
    setInputValue(result.sanitizedInput)

    if (validateSlippage(result.sanitizedInput, numberLocale))
      commit(result.sanitizedInput)
  }

  const isInputEnabled = isSelectedChoiceCustom
  const hasError =
    isSelectedChoiceCustom && !validateSlippage(inputValue, numberLocale)

  return (
    <KeyboardAvoidingView style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[a.flex_1]}>
        <ScrollView
          bounces={false}
          style={[a.flex_1]}
          contentContainerStyle={[a.px_lg]}
        >
          <Text style={[a.py_lg, a.body_1_lg_regular, {color: p.gray_600}]}>
            {strings.swap.slippageTolerance}
          </Text>

          <View style={[a.flex_row, a.pb_xl, a.flex_wrap]}>
            {CHOICES.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  a.p_sm,
                  selectedChoiceLabel === choice.label && {
                    backgroundColor: p.gray_200,
                    borderRadius: 8,
                  },
                ]}
                onPress={() => handleChoicePress(choice.label)}
              >
                <Text
                  style={[
                    a.body_1_lg_regular,
                    {color: p.text_gray_max},
                    selectedChoiceLabel === choice.label && {
                      color: p.text_gray_max,
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
                a.body_1_lg_regular,
                {color: p.text_gray_medium},
                !isSelectedChoiceCustom && {backgroundColor: p.gray_100},
              ]}
              keyboardType="numeric"
              selectionColor={p.el_gray_max}
              cursorColor={p.el_gray_max}
              right={
                <Text
                  style={[
                    a.p_lg,
                    a.absolute,
                    {right: 0, top: 0, color: p.text_gray_medium},
                  ]}
                >
                  %
                </Text>
              }
              helper={
                isSelectedChoiceCustom && !hasError ? (
                  <Text
                    style={[
                      a.body_3_sm_regular,
                      a.py_xs,
                      {color: p.text_gray_low},
                    ]}
                  >
                    {strings.swap.enterSlippage}
                  </Text>
                ) : isSelectedChoiceCustom && hasError ? (
                  <Text
                    style={[
                      a.py_xs,
                      a.body_3_sm_regular,
                      {color: p.sys_magenta_500},
                    ]}
                  >
                    {strings.swap.slippageToleranceError}
                  </Text>
                ) : undefined
              }
            />
          )}

          <Text style={[a.py_lg, a.body_1_lg_regular, {color: p.gray_600}]}>
            {strings.swap.routingPreferences}
          </Text>

          <View style={[a.gap_md]}>
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text style={[a.body_1_lg_regular, {color: p.text_gray_max}]}>
                {strings.swap.auto}
              </Text>

              <SettingsSwitch
                value={aggregator === 'auto'}
                onValueChange={() =>
                  assignAggregator(
                    aggregator === 'auto'
                      ? ['muesliswap', 'dexhunter', 'minswap']
                      : 'auto',
                  )
                }
              />
            </View>

            {aggregator !== 'auto' && (
              <>
                <View style={[a.flex_row, a.justify_between, a.align_center]}>
                  <Text style={[a.body_1_lg_regular, {color: p.text_gray_max}]}>
                    DexHunter
                  </Text>

                  <SettingsSwitch
                    value={aggregator.includes('dexhunter')}
                    onValueChange={() => {
                      const next = toggleAggregator(aggregator, 'dexhunter')
                      assignAggregator(next.length === 0 ? 'auto' : next)
                    }}
                  />
                </View>

                <View style={[a.flex_row, a.justify_between, a.align_center]}>
                  <Text style={[a.body_1_lg_regular, {color: p.text_gray_max}]}>
                    MuesliSwap
                  </Text>

                  <SettingsSwitch
                    value={aggregator.includes('muesliswap')}
                    onValueChange={() => {
                      const next = toggleAggregator(aggregator, 'muesliswap')
                      assignAggregator(next.length === 0 ? 'auto' : next)
                    }}
                  />
                </View>

                <View style={[a.flex_row, a.justify_between, a.align_center]}>
                  <Text style={[a.body_1_lg_regular, {color: p.text_gray_max}]}>
                    Minswap
                  </Text>

                  <SettingsSwitch
                    value={aggregator.includes('minswap')}
                    onValueChange={() => {
                      const next = toggleAggregator(aggregator, 'minswap')
                      assignAggregator(next.length === 0 ? 'auto' : next)
                    }}
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

const validateSlippage = (text: string, format: Numbers.Locale) => {
  const slippage = parseNumber(text, format)

  return !isNaN(slippage) && slippage >= 0 && slippage <= 75
}

const parseNumber = (text: string, format: Numbers.Locale) => {
  const result = parseNumberFromText({
    text,
    format,
    precision: MAX_DECIMALS, // Use same precision as before
  })

  return result.numericValue
}

const getChoiceBySlippage = (
  slippage: number,
  format: Numbers.Locale,
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
