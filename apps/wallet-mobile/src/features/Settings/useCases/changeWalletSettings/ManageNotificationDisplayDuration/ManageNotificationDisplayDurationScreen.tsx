import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import * as React from 'react'
import {useTheme} from '@yoroi/theme'
import {KeyboardAvoidingView} from '../../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {SafeAreaView} from 'react-native-safe-area-context'
import {TextInput} from '../../../../../components/TextInput/TextInput'
import {Button} from '../../../../../components/Button/Button'
import {useFormatNumber} from '../../../../../kernel/i18n'
import {parseNumber} from '@yoroi/common'
import {useStrings} from './strings'
import {useNotificationDisplaySettings} from '../Notifications/NotificationsDisplaySettings'
import {useNotificationsConfig} from '@yoroi/notifications'

type ManualChoice = {
  id: 'Manual'
}

type GivenChoice = {
  id: '2s' | '4s' | '6s' | '8s' | '10s' | '12s'
  value: number
}

type Choice = ManualChoice | GivenChoice

type ChoiceKind = Choice['id']

const CHOICES: Readonly<Choice[]> = [
  {id: '2s', value: 2},
  {id: '4s', value: 4},
  {id: '6s', value: 6},
  {id: '8s', value: 8},
  {id: '10s', value: 10},
  {id: '12s', value: 12},
  {id: 'Manual'},
] as const

export const ManageNotificationDisplayDurationScreen = ({}) => {
  const {styles, colors} = useStyles()
  const formatNumber = useFormatNumber()
  const {data: config} = useNotificationsConfig()

  const strings = useStrings()
  const savedChoice = getChoiceByValue(config.displayDuration)
  const [selectedChoiceId, setSelectedChoiceId] = React.useState<ChoiceKind>(savedChoice.id)
  const selectedChoice = getChoiceById(selectedChoiceId)
  const defaultInputValue = savedChoice.id === 'Manual' ? formatNumber(config.displayDuration) : ''
  const [inputValue, setInputValue] = React.useState(defaultInputValue)

  const isSelectedChoiceManual = selectedChoiceId === 'Manual'
  const isInputEnabled = isSelectedChoiceManual
  const isInputEmpty = inputValue === ''
  const hasError = isSelectedChoiceManual && !isInputValid(inputValue)
  const isButtonDisabled = hasError || (isSelectedChoiceManual && isInputEmpty)
  const shouldDisplayError = !isInputEmpty && hasError

  const handleChoicePress = (id: ChoiceKind) => {
    setSelectedChoiceId(id)
  }

  const handleInputChange = (text: string) => {
    setInputValue(text)
  }

  const handleSubmit = async () => {}

  return (
    <KeyboardAvoidingView style={[styles.flex, styles.root]}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.flex, styles.safeAreaView]}>
        <ScrollView bounces={false} style={styles.flex}>
          <Text style={styles.description}>{strings.description}</Text>
          <View style={styles.choicesContainer}>
            {CHOICES.map((choice, index) => {
              const isSelected = selectedChoiceId === choice.id
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.choiceButton, isSelected && styles.selectedChoiceButton]}
                  onPress={() => handleChoicePress(choice.id)}
                >
                  <Text style={[styles.choiceLabel, isSelected && styles.selectedChoiceLabel]}>
                    {getLabelById(choice.id, strings)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{strings.displayDuration}</Text>

            <TextInput
              value={selectedChoice.id === 'Manual' ? inputValue : formatNumber(selectedChoice.value)}
              onChangeText={handleInputChange}
              editable={isInputEnabled}
              key={isInputEnabled ? 'enabled' : 'disabled'}
              selectTextOnFocus={isInputEnabled}
              autoFocus={isInputEnabled}
              style={[styles.input, !isSelectedChoiceManual && {backgroundColor: colors.background}]}
              keyboardType="numeric"
              selectionColor={colors.cursor}
              right={<Text style={styles.percentLabel}>{strings.seconds}</Text>}
              error={shouldDisplayError}
              errorText={shouldDisplayError ? 'Hello' : undefined}
            />
          </View>
        </ScrollView>
        <Button testID="applyButton" title={strings.apply} disabled={isButtonDisabled} onPress={handleSubmit} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const getLabelById = (id: ChoiceKind, strings: ReturnType<typeof useStrings>) => {
  switch (id) {
    case '2s':
      return strings.twoSeconds
    case '4s':
      return strings.fourSeconds
    case '6s':
      return strings.sixSeconds
    case '8s':
      return strings.eightSeconds
    case '10s':
      return strings.tenSeconds
    case '12s':
      return strings.twelveSeconds
    case 'Manual':
      return strings.manual
  }
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

const getChoiceById = (id: ChoiceKind): Choice => {
  return CHOICES.find((choice) => choice.id === id) ?? {id: 'Manual'}
}

const getChoiceByValue = (value: number): Choice => {
  return CHOICES.find((choice) => choice.id !== 'Manual' && choice.value === value) ?? {id: 'Manual'}
}

const isInputValid = (text: string) => {
  const isNumeric = /^[0-9]*$/.test(text)
  const parsed = parseNumber(text)
  return isNumeric && typeof parsed === 'number' && parsed >= 1 && parsed <= 60
}
