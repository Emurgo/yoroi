import {parseNumber} from '@yoroi/common'
import {
  useNotificationsConfig,
  useUpdateNotificationsConfig,
} from '@yoroi/notifications'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, Text, TouchableOpacity, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useFormatNumber} from '~/kernel/i18n/useFormatNumber'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {TextInput} from '~/ui/TextInput/TextInput'

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

export const ManageNotificationDisplayDurationScreen = () => {
  const config = useConfig()
  const {mutate: updateConfig} = useUpdateNotificationsConfig()
  const navigation = useNavigation()
  const formatNumber = useFormatNumber()

  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const savedChoice = getChoiceByValue(config.displayDuration)
  const [selectedChoiceId, setSelectedChoiceId] = React.useState<ChoiceKind>(
    savedChoice.id,
  )
  const selectedChoice = getChoiceById(selectedChoiceId)
  const defaultInputValue =
    savedChoice.id === 'Manual' ? formatNumber(config.displayDuration) : ''
  const [inputValue, setInputValue] = React.useState(defaultInputValue)

  const isSelectedChoiceManual = selectedChoiceId === 'Manual'
  const isInputEnabled = isSelectedChoiceManual
  const isInputEmpty = inputValue === ''
  const hasError = isSelectedChoiceManual && !isInputValid(inputValue ?? '')
  const isButtonDisabled = hasError || (isSelectedChoiceManual && isInputEmpty)
  const shouldDisplayError = !isInputEmpty && hasError

  const handleChoicePress = (id: ChoiceKind) => {
    setSelectedChoiceId(id)
  }

  const handleInputChange = (text: string) => {
    setInputValue(text)
  }

  const handleSubmit = () => {
    const displayDuration =
      selectedChoice.id === 'Manual'
        ? parseNumber(inputValue)
        : selectedChoice.value
    updateConfig({displayDuration})
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView style={[a.flex_1, ta.bg_color_max]}>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[a.flex_1, a.py_lg]}
      >
        <ScrollView bounces={false} style={[a.flex_1, a.px_lg]}>
          <Text style={[a.py_lg, a.body_1_lg_regular, ta.text_gray_max]}>
            {strings.manageNotificationDisplayDuration.description}
          </Text>

          <View style={[a.flex_row, a.pb_xl, a.flex_wrap]}>
            {CHOICES.map((choice, index) => {
              const isSelected = selectedChoiceId === choice.id
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    a.p_sm,
                    isSelected && {
                      backgroundColor: p.el_gray_min,
                      ...a.rounded_sm,
                    },
                  ]}
                  onPress={() => handleChoicePress(choice.id)}
                >
                  <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                    {getLabelById(choice.id, strings)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={a.relative}>
            <Text
              style={[
                ta.text_gray_max,
                ta.bg_color_max,
                a.z_20,
                a.absolute,
                a.body_3_sm_regular,
                {top: -3, left: 11, paddingHorizontal: 3},
              ]}
            >
              {strings.manageNotificationDisplayDuration.displayDuration}
            </Text>

            <TextInput
              value={
                selectedChoice.id === 'Manual'
                  ? inputValue
                  : formatNumber(selectedChoice.value)
              }
              onChangeText={handleInputChange}
              editable={isInputEnabled}
              key={isInputEnabled ? 'enabled' : 'disabled'}
              selectTextOnFocus={isInputEnabled}
              autoFocus={isInputEnabled}
              style={[
                ta.text_gray_medium,
                a.body_1_lg_regular,
                !isSelectedChoiceManual && {backgroundColor: p.gray_100},
              ]}
              keyboardType="numeric"
              selectionColor={p.input_selected}
              right={
                <Text
                  style={[
                    ta.text_gray_medium,
                    a.body_1_lg_regular,
                    a.p_lg,
                    a.absolute,
                    {right: 0, top: 0},
                  ]}
                >
                  {strings.manageNotificationDisplayDuration.seconds}
                </Text>
              }
              error={shouldDisplayError}
              errorText={
                shouldDisplayError
                  ? strings.manageNotificationDisplayDuration.inputError
                  : undefined
              }
            />
          </View>
        </ScrollView>

        <Actions>
          <Button
            testID="applyButton"
            title={strings.manageNotificationDisplayDuration.apply}
            disabled={isButtonDisabled}
            onPress={handleSubmit}
          />
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const Actions = (props: ViewProps) => {
  return <View {...props} style={[a.pt_lg, a.px_lg]} />
}

const getLabelById = (
  id: ChoiceKind,
  strings: ReturnType<typeof useStrings>,
) => {
  switch (id) {
    case '2s':
      return strings.manageNotificationDisplayDuration.twoSeconds
    case '4s':
      return strings.manageNotificationDisplayDuration.fourSeconds
    case '6s':
      return strings.manageNotificationDisplayDuration.sixSeconds
    case '8s':
      return strings.manageNotificationDisplayDuration.eightSeconds
    case '10s':
      return strings.manageNotificationDisplayDuration.tenSeconds
    case '12s':
      return strings.manageNotificationDisplayDuration.twelveSeconds
    case 'Manual':
      return strings.manageNotificationDisplayDuration.manual
  }
}

const getChoiceById = (id: ChoiceKind): Choice => {
  return CHOICES.find((choice) => choice.id === id) ?? {id: 'Manual'}
}

const getChoiceByValue = (value: number): Choice => {
  return (
    CHOICES.find(
      (choice) => choice.id !== 'Manual' && choice.value === value,
    ) ?? {id: 'Manual'}
  )
}

const isInputValid = (text: string) => {
  const isNumeric = /^[0-9]*$/.test(text)
  const parsed = parseNumber(text)
  return isNumeric && typeof parsed === 'number' && parsed >= 1 && parsed <= 60
}

const useConfig = () => {
  const {data: config} = useNotificationsConfig()
  if (!config) {
    throw new Error('Config not found')
  }
  return {
    ...config,
    displayDuration: config.displayDuration ?? 8,
  }
}
