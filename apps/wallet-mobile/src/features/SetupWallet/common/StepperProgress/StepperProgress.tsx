import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, ViewStyle} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import {CheckIllustration} from '../../illustrations/CheckIllustration'
import {Number1} from './Number1'
import {Number2} from './Number2'
import {Number2Empty} from './Number2Empty'
import {Number3} from './Number3'
import {Number3Empty} from './Number3Empty'
import {Number4} from './Number4'
import {Number4Empty} from './Number4Empty'

type StepProps = {
  currentStep: number
  currentStepTitle: string
  isNext: boolean
  isPrevious: boolean
}
const Step = ({currentStep, currentStepTitle, isNext, isPrevious}: StepProps) => {
  const {styles} = useStyles()
  const shouldDisplayStepTitle = !isNext && !isPrevious && currentStepTitle !== undefined

  const StepLogo = !isPrevious ? getStepperLogo(currentStep, isNext) : CheckIllustration

  return (
    <Animated.View style={styles.root}>
      {StepLogo && <StepLogo />}

      {shouldDisplayStepTitle && (
        <Animated.Text layout={Layout} style={[styles.currentStepTitle]}>
          {currentStepTitle}
        </Animated.Text>
      )}
    </Animated.View>
  )
}

type StepperProgressProps = {
  currentStep: number
  currentStepTitle: string
  totalSteps: number
  style?: ViewStyle
}
export const StepperProgress = ({currentStep, currentStepTitle, totalSteps, style}: StepperProgressProps) => {
  const stepIndicator: Array<React.ReactNode> = []
  for (let i = 0; i < totalSteps; i++) {
    const currentIndex = i + 1
    stepIndicator.push(
      <Step
        currentStep={currentIndex}
        currentStepTitle={currentStepTitle}
        isPrevious={currentIndex < currentStep}
        isNext={currentIndex > currentStep}
        key={i}
      />,
    )
  }
  const {styles} = useStyles()
  return (
    <Animated.View layout={Layout} style={[styles.bar, style]}>
      {stepIndicator}
    </Animated.View>
  )
}

const nonEmptyIcons = [Number1, Number2, Number3, Number4]
const emptyIcons = [null, Number2Empty, Number3Empty, Number4Empty]
const getStepperLogo = (step: number, empty: boolean) => {
  return empty ? emptyIcons[step - 1] : nonEmptyIcons[step - 1]
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      gap: 8,
    },
    bar: {
      flexDirection: 'row',
      gap: 16,
      ...theme.padding['y-l'],
    },
    currentStepTitle: {
      ...theme.typography['body-1-l-medium'],
      color: theme.color.primary[600],
    },
  })
  return {styles} as const
}
