import React, {useEffect, useRef, useState} from 'react'
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'

import {Button} from '../../../../components'
import {COLORS} from '../../../../theme'
import {useStrings} from '../../common/strings'

interface Choice {
  label: string
  value: string | number
}

const Choices: Choice[] = [
  {label: '0%', value: 0},
  {label: '0.1%', value: 0.1},
  {label: '0.5%', value: 0.5},
  {label: '1%', value: 1},
  {label: '2%', value: 2},
  {label: '3%', value: 3},
  {label: 'Manual', value: ''},
]

export const InputSlippageToleranceScreen = () => {
  const [selectedChoice, setSelectedChoice] = useState('1%')
  const [inputValue, setInputValue] = useState('1%')
  const inputRef = useRef<TextInput | null>(null)
  const strings = useStrings()

  const handleChoicePress = (choice: Choice) => {
    setSelectedChoice(choice.label)
    setInputValue(choice.label === 'Manual' ? '' : choice.label)
  }

  const handleInputChange = (text: string) => {
    setInputValue(text)
  }

  useEffect(() => {
    if (selectedChoice === 'Manual' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedChoice])

  const isInputEnabled = selectedChoice === 'Manual'

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.header}>{strings.defaultSlippage}</Text>

        <Text style={styles.textInfo}>{strings.slippageInfo}</Text>

        <View style={styles.choicesContainer}>
          {Choices.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.choiceButton, selectedChoice === choice.label && styles.selectedChoiceButton]}
              onPress={() => handleChoicePress(choice)}
            >
              <Text style={[styles.choiceLabel, selectedChoice === choice.label && styles.selectedChoiceLabel]}>
                {choice.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.inputContainer, !isInputEnabled && styles.disabledInputContainer]}>
          <Text style={[styles.label]}>{strings.slippageTolerance}</Text>

          <TextInput
            ref={inputRef}
            value={inputValue}
            onChangeText={handleInputChange}
            editable={isInputEnabled}
            selectTextOnFocus={isInputEnabled}
            autoFocus={isInputEnabled}
            style={[!isInputEnabled && styles.disabledInput]}
          />
        </View>

        {selectedChoice === 'Manual' && <Text style={styles.textInfo}>{strings.enterSlippage}</Text>}
      </View>

      <Button testID="applyButton" shelleyTheme title={strings.apply} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 13,
  },
  header: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
  },
  textInfo: {
    fontSize: 12,
    color: COLORS.TEXT_INPUT,
  },
  choicesContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  choiceButton: {
    padding: 8,
  },
  selectedChoiceButton: {
    backgroundColor: COLORS.BORDER_GRAY,
    borderRadius: 8,
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.BLACK,
  },
  selectedChoiceLabel: {
    color: COLORS.BLACK,
  },
  inputContainer: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C4CAD7',
    marginBottom: 10,
    width: '100%',
    padding: 16,
  },
  label: {
    position: 'absolute',
    top: -7,
    left: 10,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 5,
    fontSize: 12,
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
  disabledInput: {
    color: '#6B7384',
  },
  disabledInputContainer: {
    backgroundColor: '#F0F3F5',
  },
})
