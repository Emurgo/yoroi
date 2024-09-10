import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, ViewStyle} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import {CheckIllustration} from '../../features/SetupWallet/illustrations/Check'
import {Number1} from './Number1'
import {Number2} from './Number2'
import {Number2Empty} from './Number2Empty'
import {Number3} from './Number3'
import {Number3Empty} from './Number3Empty'
import {Number4} from './Number4'
import {Number4Empty} from './Number4Empty'

export type StepperProgressProps = {
  currentStep: number
  currentStepTitle: string
  totalSteps: number
  style?: ViewStyle
}

export const StepperProgress = ({currentStep, currentStepTitle, totalSteps, style}: StepperProgressProps) => {
  const {styles} = useStyles()

  if (currentStep > totalSteps) throw new Error("StepperProgress: currentStep can't be greater that totalSteps")

  // 4 non empty icons > 3 empty icons
  if (4 < totalSteps) throw new Error('StepperProgress: not enough icons to cover total steps')

  const stepIndicatorFirstPart: Array<React.ReactNode> = Array.from({length: currentStep}).map((_, index) => {
    if (index <= currentStep - 2) return <CheckIllustration key={index} />

    return (
      <Animated.View key={index} style={styles.root}>
        <Logo step={currentStep} />

        <Animated.Text layout={Layout} style={styles.currentStepTitle}>
          {currentStepTitle}
        </Animated.Text>
      </Animated.View>
    )
  })

  const stepIndicatorSecondPart: Array<React.ReactNode> = Array.from({length: totalSteps - currentStep}).map(
    (_, index) => <Logo key={index + currentStep + 1} step={index + currentStep + 1} empty />,
  )

  const stepIndicator = [...stepIndicatorFirstPart, ...stepIndicatorSecondPart]

  return (
    <Animated.View layout={Layout} style={[styles.bar, style]}>
      {stepIndicator}
    </Animated.View>
  )
}

const Logo = ({empty = false, step}: {empty?: boolean; step: number}) => {
  const {colors} = useStyles()

  if (empty && step === 2) return <Number2Empty color={colors.blue} />
  if (empty && step === 3) return <Number3Empty color={colors.blue} />
  if (empty && step === 4) return <Number4Empty color={colors.blue} />

  if (step === 1) return <Number1 color={colors.blue} />
  if (step === 2) return <Number2 color={colors.blue} />
  if (step === 3) return <Number3 color={colors.blue} />
  if (step === 4) return <Number4 color={colors.blue} />

  return null
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      gap: 8,
    },
    bar: {
      flexDirection: 'row',
      gap: 16,
      ...atoms.py_lg,
    },
    currentStepTitle: {
      ...atoms.body_1_lg_medium,
      color: color.text_primary_medium,
    },
  })

  const colors = {
    blue: color.el_primary_medium,
  }

  return {styles, colors} as const
}
