// @flow
import * as React from 'react'
import {View, StyleSheet} from 'react-native'

import Text from './Text'

import {COLORS} from '../../styles/config'

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

type Props = {|
  currentStep: number,
  totalSteps: number,
  displayStepNumber?: boolean,
|}

const Step = ({currentStep, displayStepNumber, todoStep}) => (
  <View style={[styles.step, todoStep && styles.todoStep, displayStepNumber === true && styles.markedStep]}>
    {displayStepNumber === true && (
      <Text small style={styles.stepNumber}>
        {currentStep}
      </Text>
    )}
  </View>
)

const ProgressStep = ({currentStep, totalSteps, displayStepNumber}: Props) => {
  const steps = []
  for (let i = 0; i < totalSteps; i++) {
    steps.push(
      <Step currentStep={i + 1} displayStepNumber={displayStepNumber} todoStep={i + 1 > currentStep} key={i} />,
    )
  }
  return <View style={[styles.bar]}>{steps}</View>
}

export default ProgressStep
