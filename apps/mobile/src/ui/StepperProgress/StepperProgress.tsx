import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleProp, StyleSheet, Text, ViewStyle} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import {CheckIllustration} from '../CheckIllustration/CheckIllustration'

type StepperProgressProps = {
  currentStep: number
  currentStepTitle: string
  totalSteps: number
  style?: StyleProp<ViewStyle>
}

export const StepperProgress = ({
  currentStep,
  currentStepTitle,
  totalSteps,
  style,
}: StepperProgressProps) => {
  const {palette: p} = useTheme()

  if (currentStep > totalSteps)
    throw new Error(
      "StepperProgress: currentStep can't be greater that totalSteps",
    )

  const stepIndicatorFirstPart: Array<React.ReactNode> = Array.from({
    length: currentStep,
  }).map((_, index) => {
    if (index <= currentStep - 2) return <CheckIllustration key={index} />

    return (
      <Animated.View key={index} style={styles.root}>
        <Text style={[styles.currentStepTitle, {color: p.el_primary_medium}]}>
          {currentStep}
        </Text>

        <Animated.Text
          layout={Layout}
          style={[styles.currentStepTitle, {color: p.text_primary_medium}]}
        >
          {currentStepTitle}
        </Animated.Text>
      </Animated.View>
    )
  })

  const stepIndicatorSecondPart: Array<React.ReactNode> = Array.from({
    length: totalSteps - currentStep,
  }).map((_, index) => (
    <Animated.View key={index + currentStep + 1} style={styles.root}>
      <Text style={[styles.currentStepTitle, {color: p.el_primary_medium}]}>
        {index + currentStep + 1}
      </Text>

      <Animated.Text
        layout={Layout}
        style={[styles.currentStepTitle, {color: p.text_primary_medium}]}
      >
        {currentStepTitle}
      </Animated.Text>
    </Animated.View>
  ))

  const stepIndicator = [...stepIndicatorFirstPart, ...stepIndicatorSecondPart]

  return (
    <Animated.View layout={Layout} style={[styles.bar, style]}>
      {stepIndicator}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: 8,
  },
  bar: {
    flexDirection: 'row',
    gap: 16,
    ...a.py_lg,
  },
  currentStepTitle: {
    ...a.body_1_lg_medium,
  },
})
