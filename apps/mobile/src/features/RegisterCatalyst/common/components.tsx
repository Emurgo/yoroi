import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewProps,
} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {StepperProgress} from '../../../ui/StepperProgress/StepperProgress'

export const Description = ({style, ...props}: TextProps) => {
  const {color} = useTheme()

  return <Text {...props} style={[styles.description, {color: color.gray_900}, style]} />
}

export const Actions = ({style, ...props}: ViewProps) => {
  return <View {...props} style={[styles.actions, style]} />
}
export const Row = ({style, ...props}: ViewProps) => {
  return <View {...props} style={[styles.row, style]} />
}

export const PinBox = ({
  selected,
  children,
  error,
  done = false,
  onPress,
}: {
  selected?: boolean
  children: React.ReactNode
  done?: boolean
  error?: boolean
  onPress?: () => void
}) => {
  const {color} = useTheme()

  return (
    <TouchableOpacity
      style={[
        styles.pinBox,
        {borderColor: color.gray_900},
        selected && styles.pinBoxSelected,
        selected && {borderColor: color.gray_max},
        error && styles.pinBoxError,
        error && {borderColor: color.sys_magenta_500},
        done && styles.pinDone,
        done && {backgroundColor: '#66F2D6', borderColor: '#66F2D6'},
      ]}
      onPress={onPress}
    >
      {!selected || done ? (
        <PinDigit
          style={[
            children === undefined && styles.pinDigitUnselected,
            children === undefined && {color: color.gray_600},
            done && styles.pinDigitDone,
            done && {color: color.black_static},
          ]}
        >
          {children === undefined ? '—' : children}
        </PinDigit>
      ) : (
        <BlinkingCursor />
      )}
    </TouchableOpacity>
  )
}
const PinDigit = ({style, ...props}: TextProps) => {
  const {color} = useTheme()
  return <Text {...props} style={[styles.pinDigit, {color: color.gray_max}, style]} />
}

export const Stepper = ({
  currentStep,
  totalSteps,
  title,
}: {
  currentStep: number
  totalSteps: number
  title: string
}) => {
  return (
    <View style={styles.stepper}>
      <StepperProgress
        currentStepTitle={title}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
    </View>
  )
}

const BlinkingCursor = () => {
  const [opacity] = React.useState(new Animated.Value(1))
  const {color} = useTheme()

  React.useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    )

    blinkAnimation.start()

    return () => blinkAnimation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.cursor,
        {backgroundColor: color.gray_600},
        {
          opacity: opacity,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  description: {
    ...a.body_1_lg_regular,
  },
  row: {
    flexDirection: 'row',
  },
  actions: {
    ...a.pt_lg,
  },
  pinBox: {
    borderWidth: 1,
    height: 60,
    width: 60,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: {
    fontSize: 20,
    lineHeight: 22,
  },
  pinBoxSelected: {
    borderWidth: 2,
  },
  pinBoxError: {
    borderWidth: 2,
  },
  pinDigitUnselected: {},
  pinDone: {},
  stepper: {
    ...a.py_lg,
  },
  cursor: {
    height: 24,
    width: 2,
  },
  pinDigitDone: {},
})