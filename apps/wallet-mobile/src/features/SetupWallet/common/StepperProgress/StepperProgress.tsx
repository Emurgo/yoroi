import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, ViewStyle} from 'react-native'
import Animated, {LinearTransition} from 'react-native-reanimated'

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
        layout={LinearTransition}
        style={[styles.step, isNext && styles.isNext, isPrevious && styles.isPrevious, styles.markedStep]}
      >
        {!isPrevious ? (
          <Animated.Text style={[styles.stepNumber, isNext && styles.isNextNumber]}>{currentStep}</Animated.Text>
        ) : (
          <CheckIllustration />
        )}
      </Animated.View>

      {shouldDisplayStepTitle && (
        <Animated.Text layout={LinearTransition} style={[styles.currentStepTitle]}>
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
    <Animated.View layout={LinearTransition} style={[styles.bar, style]}>
      {stepIndicator}
    </Animated.View>
  )
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
    step: {
      backgroundColor: color.primary_c600,
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
      backgroundColor: color.white_static,
      borderWidth: 2,
      borderColor: color.gray_c400,
    },
    isPrevious: {
      backgroundColor: color.primary_c300,
    },
    stepNumber: {
      ...atoms.body_2_md_medium,
      color: color.primary_c100,
    },
    isNextNumber: {
      color: color.gray_c400,
    },
    currentStepTitle: {
      ...atoms.body_1_lg_medium,
      color: color.primary_c600,
    },
  })
  return {styles} as const
}
