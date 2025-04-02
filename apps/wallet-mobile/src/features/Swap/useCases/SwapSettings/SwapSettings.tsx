import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {KeyboardAvoidingView} from '../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {TextInput} from '../../../../components/TextInput/TextInput'
import {useLanguage} from '../../../../kernel/i18n'
import {NumberLocale} from '../../../../kernel/i18n/languages'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {Quantities} from '../../../../yoroi-wallets/utils/utils'
import {SettingsSwitch} from '../../../Settings/common/SettingsSwitch'
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
  const {styles, colors} = useStyles()

  const swapForm = useSwap()
  const [aggregator, setAggregator] = React.useState(swapForm.managerSettings.routingPreference)

  const assignAggregator = (a: Swap.ManagerSettings['routingPreference']) => {
    setAggregator(a)
    swapForm.assignManagerSettings({...swapForm.managerSettings, routingPreference: a})
    swapForm.action({type: 'Refresh'})
  }

  const defaultSelectedChoice = getChoiceBySlippage(Number(swapForm.managerSettings.slippage), numberLocale)
  const defaultInputValue =
    defaultSelectedChoice.label === 'Custom'
      ? new BigNumber(swapForm.managerSettings.slippage).toFormat(numberLocale)
      : ''

  const [selectedChoiceLabel, setSelectedChoiceLabel] = React.useState<ChoiceKind>(defaultSelectedChoice.label)
  const [inputValue, setInputValue] = React.useState(defaultInputValue)

  const strings = useStrings()
  const {track} = useMetrics()

  const selectedChoice = getChoiceByLabel(selectedChoiceLabel)
  const isSelectedChoiceCustom = selectedChoiceLabel === 'Custom'

  const commit = (value: string | number) => {
    const slippage = typeof value === 'string' ? parseNumber(value, numberLocale) : value
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
  const hasError = isSelectedChoiceCustom && !validateSlippage(inputValue, numberLocale)

  return (
    <KeyboardAvoidingView style={[styles.flex, styles.root]}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.flex, styles.safeAreaView]}>
        <ScrollView bounces={false} style={styles.flex}>
          <Text style={styles.heading}>{strings.slippageTolerance}</Text>

          <View style={styles.choicesContainer}>
            {CHOICES.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.choiceButton, selectedChoiceLabel === choice.label && styles.selectedChoiceButton]}
                onPress={() => handleChoicePress(choice.label)}
              >
                <Text style={[styles.label, selectedChoiceLabel === choice.label && styles.selectedChoiceLabel]}>
                  {choice.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedChoice.label === 'Custom' && (
            <TextInput
              value={isInputEnabled ? inputValue : new BigNumber(selectedChoice.value).toFormat(numberLocale)}
              onChangeText={handleInputChange}
              editable={isInputEnabled}
              key={isInputEnabled ? 'enabled' : 'disabled'}
              selectTextOnFocus={isInputEnabled}
              autoFocus={isInputEnabled}
              style={[styles.input, !isSelectedChoiceCustom && {backgroundColor: colors.background}]}
              keyboardType="numeric"
              selectionColor={colors.selected}
              cursorColor={colors.cursor}
              right={<Text style={styles.percentLabel}>%</Text>}
              helper={
                isSelectedChoiceCustom && !hasError ? (
                  <Text style={[styles.textInfo, styles.bottomText]}>{strings.enterSlippage}</Text>
                ) : isSelectedChoiceCustom && hasError ? (
                  <Text style={[styles.bottomText, styles.errorText]}>{strings.slippageToleranceError}</Text>
                ) : undefined
              }
            />
          )}

          <Text style={styles.heading}>{strings.routingPreferences}</Text>

          <View style={styles.routing}>
            <View style={styles.between}>
              <Text style={styles.label}>{strings.auto}</Text>

              <SettingsSwitch
                value={aggregator === 'auto'}
                onValueChange={() => assignAggregator(aggregator === 'auto' ? ['muesliswap', 'dexhunter'] : 'auto')}
              />
            </View>

            {aggregator !== 'auto' && (
              <>
                <View style={styles.between}>
                  <Text style={styles.label}>DexHunter</Text>

                  <SettingsSwitch
                    value={aggregator.includes('dexhunter')}
                    onValueChange={() =>
                      assignAggregator(aggregator.includes('dexhunter') ? ['muesliswap'] : [...aggregator, 'dexhunter'])
                    }
                  />
                </View>

                <View style={styles.between}>
                  <Text style={styles.label}>MuesliSwap</Text>

                  <SettingsSwitch
                    value={aggregator.includes('muesliswap')}
                    onValueChange={() =>
                      assignAggregator(
                        aggregator.includes('muesliswap') ? ['dexhunter'] : [...aggregator, 'muesliswap'],
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

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    flex: {
      ...atoms.flex_1,
    },
    root: {
      backgroundColor: color.bg_color_max,
    },
    between: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    safeAreaView: {
      ...atoms.p_lg,
    },
    textInfo: {
      ...atoms.body_3_sm_regular,
      color: color.text_gray_medium,
    },
    heading: {
      ...atoms.py_lg,
      ...atoms.body_1_lg_regular,
      color: color.gray_600,
    },
    bottomText: {
      color: color.gray_700,
      ...atoms.body_3_sm_regular,
      ...atoms.py_xs,
    },
    choicesContainer: {
      ...atoms.flex_row,
      ...atoms.pb_xl,
      ...atoms.flex_wrap,
    },
    choiceButton: {
      ...atoms.p_sm,
    },
    routing: {
      ...atoms.gap_md,
    },
    selectedChoiceButton: {
      backgroundColor: color.gray_200,
      borderRadius: 8,
    },
    label: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_max,
    },
    selectedChoiceLabel: {
      color: color.text_gray_max,
    },
    errorText: {
      color: color.sys_magenta_500,
      ...atoms.body_3_sm_regular,
    },
    input: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    percentLabel: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
      ...atoms.p_lg,
      ...atoms.absolute,
      right: 0,
      top: 0,
    },
  })

  const colors = {
    background: color.gray_100,
    cursor: color.el_gray_max,
    selected: color.input_selected,
  }

  return {styles, colors}
}

const validateSlippage = (text: string, format: NumberLocale) => {
  const slippage = parseNumber(text, format)

  return !isNaN(slippage) && slippage >= 0 && slippage <= 75
}

const parseNumber = (text: string, format: NumberLocale) => {
  const [, quantity] = Quantities.parseFromText(text, MAX_DECIMALS, format)
  return Number(Quantities.denominated(quantity, MAX_DECIMALS))
}

const getChoiceBySlippage = (slippage: number, format: NumberLocale): Choice => {
  return (
    CHOICES.find((choice) => choice.value === slippage) ?? {
      label: 'Custom',
      value: new BigNumber(slippage).toFormat(format),
    }
  )
}

const getChoiceByLabel = (label: ChoiceKind): Choice => {
  return CHOICES.find((choice) => choice.label === label) ?? {label: 'Custom', value: ''}
}
