import {atoms as a, useTheme} from '@yoroi/theme'

import React, {useState} from 'react'
import {ImageSourcePropType, Text, View, ViewStyle} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

type Props = {
  onSubmit: ({name}: {name: string}) => void
  defaultWalletName?: string
  image?: ImageSourcePropType
  progress?: {
    currentStep: number
    totalSteps: number
  }
  containerStyle?: ViewStyle
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
  isWaiting?: boolean
}

export const WalletNameForm = ({
  onSubmit,
  image,
  progress,
  containerStyle,
  topContent,
  bottomContent,
  defaultWalletName,
  isWaiting = false,
}: Props) => {
  const strings = useStrings()
  // const {palette: p} = useTheme()
  const [walletName, setWalletName] = useState(defaultWalletName ?? '')
  const [error, setError] = useState('')
  // const {walletImplementation} = useSetupWallet()

  const handleSubmit = () => {
    if (walletName.length === 0) {
      setError(strings.setupWallet.walletNameErrorMustBeFilled)
      return
    }

    if (walletName.length > 20) {
      setError(strings.setupWallet.walletNameErrorTooLong)
      return
    }

    onSubmit({name: walletName})
  }

  return (
    <View style={[a.flex_1, containerStyle]}>
      {topContent}

      <View style={[a.flex_1, a.p_lg]}>
        {progress && (
          <ProgressStep
            currentStep={progress.currentStep}
            totalSteps={progress.totalSteps}
            displayStepNumber
          />
        )}

        <Space.Height.lg />

        {image && (
          <>
            <View style={[a.align_center, a.pb_lg]}>
              <Icon.WalletAvatar
                image={typeof image === 'string' ? image : ''}
              />
            </View>

            <Space.Height.lg />
          </>
        )}

        <TextInput
          label={strings.setupWallet.walletDetailsNameInput}
          value={walletName}
          onChangeText={(text) => {
            setWalletName(text)
            setError('')
          }}
          errorText={error}
          autoFocus
          autoComplete="off"
          testID="walletNameInput"
        />

        <Space.Height.lg />

        <Button
          title={strings.setupWallet.save}
          onPress={handleSubmit}
          disabled={isWaiting}
          testID="saveButton"
        />
      </View>

      {bottomContent}
    </View>
  )
}

type StepProps = {
  currentStep: number
  todoStep: boolean
  displayStepNumber?: boolean
}
const Step = ({currentStep, displayStepNumber, todoStep}: StepProps) => {
  const {palette: p} = useTheme()
  return (
    <View
      style={[
        a.align_center,
        a.justify_center,
        a.flex_grow,
        {
          backgroundColor: p.secondary_400,
        },
        todoStep && {
          backgroundColor: p.secondary_200,
        },
        displayStepNumber === true && {
          backgroundColor: p.secondary_200,
        },
      ]}
    >
      {displayStepNumber === true && (
        <Text
          style={{
            fontSize: 7,
            lineHeight: 10,
            color: p.gray_min,
          }}
        >
          {currentStep}
        </Text>
      )}
    </View>
  )
}

type ProgressStepProps = {
  currentStep: number
  totalSteps: number
  displayStepNumber?: boolean
}
export const ProgressStep = ({
  currentStep,
  totalSteps,
  displayStepNumber,
}: ProgressStepProps) => {
  const {atoms: ta} = useTheme()
  const steps: Array<React.ReactNode> = []
  for (let i = 0; i < totalSteps; i++) {
    steps.push(
      <Step
        currentStep={i + 1}
        displayStepNumber={displayStepNumber}
        todoStep={i + 1 > currentStep}
        key={i}
      />,
    )
  }
  return (
    <View
      style={[
        a.flex_row,
        ta.bg_color_max,
        {
          height: 10,
        },
      ]}
    >
      {steps}
    </View>
  )
}
