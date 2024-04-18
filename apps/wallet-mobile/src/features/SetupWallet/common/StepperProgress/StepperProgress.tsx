import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, ViewStyle} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import {CheckIllustration} from '../../illustrations/CheckIllustration'

type StepProps = {
  currentStep: number
  currentStepTitle: string
  isNext: boolean
  isPrevious: boolean
}
const Step = ({currentStep, currentStepTitle, isNext, isPrevious}: StepProps) => {
  const {styles} = useStyles()
  const shouldDisplayStepTitle = !isNext && !isPrevious && currentStepTitle !== undefined
  return (
    <Animated.View style={styles.root}>
      <Animated.View
        layout={Layout}
        style={[styles.step, isNext && styles.isNext, isPrevious && styles.isPrevious, styles.markedStep]}
      >
        {!isPrevious ? (
          <Animated.Text style={[styles.stepNumber, isNext && styles.isNextNumber]}>{currentStep}</Animated.Text>
        ) : (
          <CheckIllustration />
        )}
      </Animated.View>

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
      ...theme.atoms.py_lg,
    },
    step: {
      backgroundColor: theme.color.primary_c600,
      alignItems: 'center',
      justifyContent: 'center',
      height: 24,
      width: 24,
      borderRadius: 24,
    },
    markedStep: {
      alignSelf: 'center',
    },
    isNext: {
      backgroundColor: theme.color.white_static,
      borderWidth: 2,
      borderColor: theme.color.gray_c400,
    },
    isPrevious: {
      backgroundColor: theme.color.primary_c300,
    },
    stepNumber: {
      ...theme.atoms.body_2_md_medium,
      color: theme.color.primary_c100,
    },
    isNextNumber: {
      color: theme.color.gray_c400,
    },
    currentStepTitle: {
      ...(theme.atoms.body - 1 - lg - medium),
      color: theme.color.primary_c600,
    },
  })
  return {styles} as const
}
