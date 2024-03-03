import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import CheckIcon from '../../illustrations/CheckIcon'

type StepProps = {
  currentStep: number
  currentStepTitle?: string
  todoStep: boolean
  pastStep: boolean
  displayStepNumber?: boolean
}
const Step = ({currentStep, currentStepTitle, displayStepNumber, todoStep, pastStep}: StepProps) => {
  const {styles} = useStyles()
  return (
    <>
      <Animated.View
        layout={Layout}
        style={[styles.step, todoStep && styles.todoStep, displayStepNumber === true && styles.markedStep]}
      >
        {displayStepNumber === true && !pastStep ? (
          <Animated.Text style={[styles.stepNumber, todoStep && styles.todoStepNumber]}>{currentStep}</Animated.Text>
        ) : (
          <CheckIcon />
        )}
      </Animated.View>

      {!todoStep && !pastStep && currentStepTitle !== undefined && (
        <Animated.Text layout={Layout} style={[styles.stepText]}>
          About recovery phrase
        </Animated.Text>
      )}
    </>
  )
}

type ProgressStepProps = {
  currentStep: number
  currentStepTitle?: string
  totalSteps: number
  displayStepNumber?: boolean
}
export const StepperProgress = ({currentStep, currentStepTitle, totalSteps, displayStepNumber}: ProgressStepProps) => {
  const steps: Array<React.ReactNode> = []
  for (let i = 0; i < totalSteps; i++) {
    steps.push(
      <Step
        currentStep={i + 1}
        currentStepTitle={currentStepTitle}
        displayStepNumber={displayStepNumber}
        pastStep={i + 1 < currentStep}
        todoStep={i + 1 > currentStep}
        key={i}
      />,
    )
  }
  const {styles} = useStyles()
  return (
    <Animated.View layout={Layout} style={[styles.bar]}>
      {steps}
    </Animated.View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    bar: {
      backgroundColor: theme.color['white-static'],
      flexDirection: 'row',
      gap: 16,
      marginVertical: 16,
    },
    step: {
      backgroundColor: theme.color.primary[600],
      alignItems: 'center',
      justifyContent: 'center',
      height: 24,
      width: 24,
      borderRadius: 24,
    },
    markedStep: {
      alignSelf: 'center',
    },
    todoStep: {
      backgroundColor: theme.color['white-static'],
      borderWidth: 2,
      borderColor: theme.color.gray[400],
    },
    stepNumber: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: '500',
      color: theme.color.primary[100],
    },
    todoStepNumber: {
      color: theme.color.gray[400],
    },
    stepText: {
      fontFamily: 'Rubik',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 24,
      color: theme.color.primary[600],
      marginHorizontal: -8,
    },
  })
  return {styles} as const
}
