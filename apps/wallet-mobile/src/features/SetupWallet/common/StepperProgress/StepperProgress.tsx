import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, ViewStyle} from 'react-native'
import Animated, {LinearTransition} from 'react-native-reanimated'

import {CheckIllustration} from '../../illustrations/Check'
import {Number1} from '../../illustrations/Number1'
import {Number2} from '../../illustrations/Number2'
import {Number2Empty} from '../../illustrations/Number2Empty'
import {Number3} from '../../illustrations/Number3'
import {Number3Empty} from '../../illustrations/Number3Empty'
import {Number4} from '../../illustrations/Number4'
import {Number4Empty} from '../../illustrations/Number4Empty'

type StepperProgressProps = {
  currentStep: number
  currentStepTitle: string
  totalSteps: number
  style?: ViewStyle
}

export const StepperProgress = ({currentStep, currentStepTitle, totalSteps, style}: StepperProgressProps) => {
  const {styles} = useStyles()

  if (currentStep > totalSteps) throw new Error("StepperProgress: currentStep can't be greater that totalSteps")
  if (nonEmptyIcons.length < totalSteps || emptyIcons.length < totalSteps)
    throw new Error('StepperProgress: total steps greater that number of icons')

  const stepIndicatorFirstPart: Array<React.ReactNode> = Array.from({length: currentStep}).map((_, index) => {
    if (index <= currentStep - 2) return <CheckIllustration key={index} />

    return (
      <Animated.View key={index} style={styles.root}>
        {getStepperLogo(currentStep, false)}

        <Animated.Text layout={LinearTransition} style={styles.currentStepTitle}>
          {currentStepTitle}
        </Animated.Text>
      </Animated.View>
    )
  })

  const stepIndicatorSecondPart: Array<React.ReactNode> = Array.from({length: totalSteps - currentStep}).map(
    (_, index) => getStepperLogo(index + currentStep + 1, true),
  )

  const stepIndicator = [...stepIndicatorFirstPart, ...stepIndicatorSecondPart]

  return (
    <Animated.View layout={LinearTransition} style={[styles.bar, style]}>
      {stepIndicator}
    </Animated.View>
  )
}

const nonEmptyIcons = [<Number1 key="1" />, <Number2 key="2" />, <Number3 key="3" />, <Number4 key="4" />]
const emptyIcons = [null, <Number2Empty key="5" />, <Number3Empty key="6" />, <Number4Empty key="7" />]
const getStepperLogo = (step: number, empty: boolean) => {
  return empty ? emptyIcons[step - 1] : nonEmptyIcons[step - 1]
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
    currentStepTitle: {
      ...atoms.body_1_lg_medium,
      color: color.primary_c600,
    },
  })
  return {styles} as const
}
