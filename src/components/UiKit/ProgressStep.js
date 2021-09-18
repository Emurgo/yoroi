// @flow

import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {COLORS} from '../../styles/config'
import Text from './Text'

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

type StepProps = {|
  currentStep: number,
  todoStep: boolean,
  displayStepNumber?: boolean,
|}
const Step = ({currentStep, displayStepNumber, todoStep}: StepProps) => (
  <View style={[styles.step, todoStep && styles.todoStep, displayStepNumber === true && styles.markedStep]}>
    {displayStepNumber === true && (
      <Text small style={styles.stepNumber}>
        {currentStep}
      </Text>
    )}
  </View>
)

type ProgressStepProps = {|
  currentStep: number,
  totalSteps: number,
  displayStepNumber?: boolean,
|}
const ProgressStep = ({currentStep, totalSteps, displayStepNumber}: ProgressStepProps) => {
  const steps = []
  for (let i = 0; i < totalSteps; i++) {
    steps.push(
      <Step currentStep={i + 1} displayStepNumber={displayStepNumber} todoStep={i + 1 > currentStep} key={i} />,
    )
  }
  return <View style={[styles.bar]}>{steps}</View>
}

export default ProgressStep
