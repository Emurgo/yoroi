import React from 'react'
import {StyleSheet, View} from 'react-native'

import {COLORS} from '../theme'
import {Text} from './Text'

type StepProps = {
  currentStep: number
  todoStep: boolean
  displayStepNumber?: boolean
}
const Step = ({currentStep, displayStepNumber, todoStep}: StepProps) => (
  <View style={[styles.step, todoStep && styles.todoStep, displayStepNumber === true && styles.markedStep]}>
    {displayStepNumber === true && (
      <Text small style={styles.stepNumber}>
        {currentStep}
      </Text>
    )}
  </View>
)

type ProgressStepProps = {
  currentStep: number
  totalSteps: number
  displayStepNumber?: boolean
}
export const ProgressStep = ({currentStep, totalSteps, displayStepNumber}: ProgressStepProps) => {
  const steps: Array<React.ReactNode> = []
  for (let i = 0; i < totalSteps; i++) {
    steps.push(
      <Step currentStep={i + 1} displayStepNumber={displayStepNumber} todoStep={i + 1 > currentStep} key={i} />,
    )
  }
  return <View style={[styles.bar]}>{steps}</View>
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.WHITE,
    height: 10,
    flexDirection: 'row',
  },
  step: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  markedStep: {
    marginHorizontal: 0.5,
  },
  todoStep: {
    backgroundColor: '#C9EDE5',
  },
  stepNumber: {
    fontSize: 7,
    lineHeight: 10,
    color: COLORS.WHITE,
  },
})
