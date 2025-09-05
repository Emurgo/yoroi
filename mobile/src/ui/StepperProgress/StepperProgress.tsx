import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {StyleProp, Text, View, ViewStyle} from 'react-native'
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
  const {atoms: ta, palette: p} = useTheme()

  if (currentStep > totalSteps)
    throw new Error(
      "StepperProgress: currentStep can't be greater that totalSteps",
    )

  const stepIndicatorFirstPart: Array<React.ReactNode> = Array.from({
    length: currentStep,
  }).map((_, index) => {
    if (index <= currentStep - 2) return <CheckIllustration key={index} />

    return (
      <Animated.View key={index} style={[a.flex_row, a.gap_sm, a.align_center]}>
        <View
          style={[
            a.align_center,
            a.justify_center,
            a.rounded_full,
            {width: 24, height: 24, backgroundColor: p.el_primary_medium}, // Filled circle for active step
          ]}
        >
          <Text style={[a.body_2_md_medium, {color: p.white_static}]}>
            {currentStep}
          </Text>
        </View>

        <Animated.Text
          layout={Layout}
          style={[a.body_1_lg_medium, ta.text_primary_medium]}
        >
          {currentStepTitle}
        </Animated.Text>
      </Animated.View>
    )
  })

  const stepIndicatorSecondPart: Array<React.ReactNode> = Array.from({
    length: totalSteps - currentStep,
  }).map((_, index) => (
    <Animated.View
      key={index + currentStep + 1}
      style={[a.flex_row, a.gap_sm, a.align_center]}
    >
      <View
        style={[
          a.align_center,
          a.justify_center,
          a.rounded_full,
          a.border,
          {width: 24, height: 24},
          {borderColor: p.el_primary_medium},
        ]}
      >
        <Text style={[a.body_2_md_medium, ta.el_primary_medium]}>
          {index + currentStep + 1}
        </Text>
      </View>

      <Animated.Text
        layout={Layout}
        style={[a.body_1_lg_medium, ta.text_primary_medium]}
      />
    </Animated.View>
  ))

  const stepIndicator = [...stepIndicatorFirstPart, ...stepIndicatorSecondPart]

  return (
    <Animated.View
      layout={Layout}
      style={[a.flex_row, a.gap_lg, a.py_lg, style]}
    >
      {stepIndicator}
    </Animated.View>
  )
}
