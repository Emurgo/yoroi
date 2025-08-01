import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import React, {useState} from 'react'
import {ImageSourcePropType, View, ViewStyle} from 'react-native'

import {useSetupWallet} from '@yoroi/setup-wallet'
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
  const {palette: p} = useTheme()
  const [walletName, setWalletName] = useState(defaultWalletName ?? '')
  const [error, setError] = useState('')
  const {walletImplementation} = useSetupWallet()

  const handleSubmit = () => {
    if (walletName.length === 0) {
      setError(strings.setupWallet.walletNameForm.walletNameErrorMustBeFilled)
      return
    }

    if (walletName.length > 20) {
      setError(strings.setupWallet.walletNameForm.walletNameErrorTooLong)
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
            <View style={[a.align_center, a.mb_lg]}>
              <Icon.WalletAvatar image={image} />
            </View>

            <Space.Height.lg />
          </>
        )}

        <TextInput
          label={strings.setupWallet.walletNameForm.walletNameInputLabel}
          value={walletName}
          onChangeText={(text) => {
            setWalletName(text)
            setError('')
          }}
          error={error}
          autoFocus
          autoComplete="off"
          testID="walletNameInput"
        />

        <Space.Height.lg />

        <Button
          title={strings.setupWallet.walletNameForm.save}
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
          small
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
  const {palette: p} = useTheme()
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
      style={{
        backgroundColor: p.bg_color_max,
        height: 10,
        ...a.flex_row,
      }}
    >
      {steps}
    </View>
  )
}
