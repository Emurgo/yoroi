import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

type StepIndicatorProps = {
  currentStep: number
  totalSteps: number
}

export const StepIndicator = ({
  currentStep,
  totalSteps,
}: StepIndicatorProps) => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_row, a.gap_lg, a.justify_center, a.align_center]}>
      {Array.from({length: totalSteps}).map((_, index) => {
        const stepNumber = index + 1
        const isCurrent = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <View
            key={stepNumber}
            style={[
              a.align_center,
              a.justify_center,
              a.rounded_full,
              {
                width: 24,
                height: 24,
                backgroundColor:
                  isCurrent || isCompleted ? p.primary_500 : 'transparent',
                borderWidth: isCurrent || isCompleted ? 0 : 2,
                borderColor: p.gray_400,
              },
            ]}
          >
            <Text
              style={[
                a.body_2_md_medium,
                {
                  color: isCurrent || isCompleted ? p.white_static : p.gray_400,
                },
              ]}
            >
              {stepNumber}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
