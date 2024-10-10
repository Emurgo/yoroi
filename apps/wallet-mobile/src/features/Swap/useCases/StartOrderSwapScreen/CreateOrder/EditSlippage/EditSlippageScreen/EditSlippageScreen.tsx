import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../../../../components/Button/Button'
import {KeyboardAvoidingView} from '../../../../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {TextInput} from '../../../../../../../components/TextInput/TextInput'
import {useLanguage} from '../../../../../../../kernel/i18n'
import {NumberLocale} from '../../../../../../../kernel/i18n/languages'
import {useMetrics} from '../../../../../../../kernel/metrics/metricsManager'
import {Quantities} from '../../../../../../../yoroi-wallets/utils/utils'
import {useNavigateTo} from '../../../../../common/navigation'
import {useStrings} from '../../../../../common/strings'

type ManualChoice = {
  label: 'Manual'
  value: string
}

type GivenChoice = {
  label: '0%' | '0.1%' | '0.5%' | '1%' | '2%' | '3%'
  value: number
}

type Choice = ManualChoice | GivenChoice

type ChoiceKind = Choice['label']

const CHOICES: Readonly<Choice[]> = [
  {label: '0%', value: 0},
  {label: '0.1%', value: 0.1},
  {label: '0.5%', value: 0.5},
  {label: '1%', value: 1},
  {label: '2%', value: 2},
  {label: '3%', value: 3},
  {label: 'Manual', value: ''},
] as const

const MAX_DECIMALS = 1

export const EditSlippageScreen = () => {
  const {numberLocale} = useLanguage()
  const {styles, colors} = useStyles()

  const {slippageChanged, orderData} = useSwap()
  const defaultSelectedChoice = getChoiceBySlippage(orderData.slippage, numberLocale)
  const defaultInputValue =
    defaultSelectedChoice.label === 'Manual' ? new BigNumber(orderData.slippage).toFormat(numberLocale) : ''

  const [selectedChoiceLabel, setSelectedChoiceLabel] = React.useState<ChoiceKind>(defaultSelectedChoice.label)
  const [inputValue, setInputValue] = React.useState(defaultInputValue)

  const navigate = useNavigateTo()
  const strings = useStrings()
  const {track} = useMetrics()

  const selectedChoice = getChoiceByLabel(selectedChoiceLabel)
  const isSelectedChoiceManual = selectedChoiceLabel === 'Manual'

  const handleChoicePress = (kind: ChoiceKind) => {
    setSelectedChoiceLabel(kind)
  }

  const handleInputChange = (text: string) => {
    const [value] = Quantities.parseFromText(text, MAX_DECIMALS, numberLocale)
    setInputValue(value)
  }

  const onSubmit = () => {
    const slippage = selectedChoice.label === 'Manual' ? parseNumber(inputValue, numberLocale) : selectedChoice.value
    track.swapSlippageChanged({slippage_tolerance: slippage})
    slippageChanged(slippage)
    navigate.startSwap()
  }

  const isInputEnabled = isSelectedChoiceManual
  const hasError = isSelectedChoiceManual && !validateSlippage(inputValue, numberLocale)
  const isButtonDisabled = hasError || (isSelectedChoiceManual && inputValue.length === 0)

  return (
    <KeyboardAvoidingView style={[styles.flex, styles.root]}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.flex, styles.safeAreaView]}>
        <ScrollView bounces={false} style={styles.flex}>
          <Text style={styles.description}>{strings.slippageInfo}</Text>

          <View style={styles.choicesContainer}>
            {CHOICES.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.choiceButton, selectedChoiceLabel === choice.label && styles.selectedChoiceButton]}
                onPress={() => handleChoicePress(choice.label)}
              >
                <Text style={[styles.choiceLabel, selectedChoiceLabel === choice.label && styles.selectedChoiceLabel]}>
                  {choice.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{strings.slippageTolerance}</Text>

            <TextInput
              value={isInputEnabled ? inputValue : new BigNumber(selectedChoice.value).toFormat(numberLocale)}
              onChangeText={handleInputChange}
              editable={isInputEnabled}
              key={isInputEnabled ? 'enabled' : 'disabled'}
              selectTextOnFocus={isInputEnabled}
              autoFocus={isInputEnabled}
              style={[styles.input, !isSelectedChoiceManual && {backgroundColor: colors.background}]}
              keyboardType="numeric"
              selectionColor={colors.cursor}
              right={<Text style={styles.percentLabel}>%</Text>}
              helper={
                isSelectedChoiceManual && !hasError ? (
                  <Text style={[styles.textInfo, styles.bottomText]}>{strings.enterSlippage}</Text>
                ) : isSelectedChoiceManual && hasError ? (
                  <Text style={[styles.bottomText, styles.errorText]}>{strings.slippageToleranceError}</Text>
                ) : undefined
              }
            />
          </View>
        </ScrollView>

        <Button
          testID="applyButton"
          shelleyTheme
          title={strings.apply}
          disabled={isButtonDisabled}
          onPress={onSubmit}
        />
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
    safeAreaView: {
      ...atoms.p_lg,
    },
    textInfo: {
      ...atoms.body_3_sm_regular,
      color: color.text_gray_medium,
    },
    description: {
      ...atoms.py_lg,
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
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
    selectedChoiceButton: {
      backgroundColor: color.el_gray_min,
      borderRadius: 8,
    },
    choiceLabel: {
      ...atoms.body_1_lg_medium,
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
    inputContainer: {
      ...atoms.relative,
    },
    label: {
      color: color.text_gray_max,
      backgroundColor: color.bg_color_max,
      ...atoms.z_20,
      ...atoms.absolute,
      ...atoms.body_3_sm_regular,
      top: -3,
      left: 11,
      paddingHorizontal: 3,
    },
  })

  const colors = {
    background: color.gray_100,
    cursor: color.input_selected,
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
      label: 'Manual',
      value: new BigNumber(slippage).toFormat(format),
    }
  )
}

const getChoiceByLabel = (label: ChoiceKind): Choice => {
  return CHOICES.find((choice) => choice.label === label) ?? {label: 'Manual', value: ''}
}
