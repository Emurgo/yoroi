import {useSwap} from '@yoroi/swap'
import BigNumber from 'bignumber.js'
import React, {useEffect, useRef, useState} from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import {Button} from '../../../../../../../components'
import {useLanguage} from '../../../../../../../i18n'
import {NumberLocale} from '../../../../../../../i18n/languages'
import {useMetrics} from '../../../../../../../metrics/metricsManager'
import {COLORS} from '../../../../../../../theme'
import {Quantities} from '../../../../../../../yoroi-wallets/utils'
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

  const {slippageChanged, createOrder} = useSwap()
  const defaultSelectedChoice = getChoiceBySlippage(createOrder.slippage, numberLocale)
  const defaultInputValue =
    defaultSelectedChoice.label === 'Manual' ? new BigNumber(createOrder.slippage).toFormat(numberLocale) : ''

  const [selectedChoiceLabel, setSelectedChoiceLabel] = useState<ChoiceKind>(defaultSelectedChoice.label)
  const [inputValue, setInputValue] = useState(defaultInputValue)

  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput | null>(null)
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

  useEffect(() => {
    if (isSelectedChoiceManual && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSelectedChoiceManual])

  const isInputEnabled = isSelectedChoiceManual
  const hasError = isSelectedChoiceManual && !validateSlippage(inputValue, numberLocale)
  const isButtonDisabled = hasError || (isSelectedChoiceManual && inputValue.length === 0)

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={102}
      >
        <ScrollView bounces={false} style={styles.flex}>
          <Text style={styles.header}>{strings.defaultSlippage}</Text>

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

          <View
            style={[
              styles.inputContainer,
              !isInputEnabled && styles.disabledInputContainer,
              hasError && styles.errorInput,
              isInputEnabled && !hasError && isFocused && styles.inputFocused,
            ]}
          >
            <Text style={[styles.label, hasError && styles.errorText]}>{strings.slippageTolerance}</Text>

            <TextInput
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              ref={inputRef}
              value={isInputEnabled ? inputValue : new BigNumber(selectedChoice.value).toFormat(numberLocale)}
              onChangeText={handleInputChange}
              editable={isInputEnabled}
              key={isInputEnabled ? 'enabled' : 'disabled'}
              selectTextOnFocus={isInputEnabled}
              autoFocus={isInputEnabled}
              style={[!isInputEnabled && styles.disabledInput, styles.input]}
            />

            <Text style={[styles.percentLabel, isInputEnabled && styles.darkColor]}>%</Text>
          </View>

          {isSelectedChoiceManual && !hasError && (
            <Text style={[styles.textInfo, styles.bottomText]}>{strings.enterSlippage}</Text>
          )}

          {isSelectedChoiceManual && hasError && (
            <Text style={[styles.bottomText, styles.errorText]}>{strings.slippageToleranceError}</Text>
          )}
        </ScrollView>

        <Button
          testID="applyButton"
          shelleyTheme
          title={strings.apply}
          disabled={isButtonDisabled}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    fontFamily: 'Rubik-Medium',
    color: '#242838',
  },
  textInfo: {
    fontSize: 12,
    color: COLORS.TEXT_INPUT,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Rubik-Regular',
    color: '#6B7384',
  },
  bottomText: {
    paddingTop: 16,
    color: '#4A5065',
    lineHeight: 16,
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
  },
  choicesContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    flexWrap: 'wrap',
  },
  choiceButton: {
    padding: 8,
  },
  selectedChoiceButton: {
    backgroundColor: COLORS.BORDER_GRAY,
    borderRadius: 8,
  },
  choiceLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.BLACK,
    fontFamily: 'Rubik-Medium',
  },
  selectedChoiceLabel: {
    color: COLORS.BLACK,
  },
  inputContainer: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C4CAD7',
    padding: 16,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    top: -7,
    left: 10,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 5,
    fontSize: 12,
    color: COLORS.ERROR_TEXT_COLOR_DARK,
    fontFamily: 'Rubik-Regular',
  },
  disabledInput: {
    color: COLORS.TEXT_INPUT,
  },
  disabledInputContainer: {
    backgroundColor: '#F0F3F5',
  },
  errorText: {
    color: COLORS.ALERT_TEXT_COLOR,
    fontSize: 12,
  },
  errorInput: {
    borderColor: COLORS.ALERT_TEXT_COLOR,
  },
  input: {
    height: 24,
    padding: 0,
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
  },
  inputFocused: {
    borderColor: '#242838',
  },
  percentLabel: {
    lineHeight: 24,
    fontFamily: 'Rubik-Regular',
    fontWeight: '400',
    color: '#6B7384',
    position: 'absolute',
    padding: 16,
    fontSize: 16,
    right: 0,
    top: 0,
  },
  darkColor: {
    color: '#242838',
  },
})

const validateSlippage = (text: string, format: NumberLocale) => {
  const slippage = parseNumber(text, format)
  return !isNaN(slippage) && slippage >= 0 && slippage <= 100
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
