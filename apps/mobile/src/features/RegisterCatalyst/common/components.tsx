import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Animated, Text, TextProps, View, ViewProps} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'

export const Description = ({style, ...props}: TextProps) => {
  const {palette: p} = useTheme()

  return (
    <Text
      {...props}
      style={[a.body_1_lg_regular, {color: p.gray_900}, style]}
    />
  )
}

export const Actions = ({style, ...props}: ViewProps) => {
  return <View {...props} style={[a.pt_lg, style]} />
}
export const Row = ({style, ...props}: ViewProps) => {
  return <View {...props} style={[{flexDirection: 'row'}, style]} />
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
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      style={[
        {
          borderWidth: 1,
          height: 60,
          width: 60,
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
        },
        {borderColor: p.gray_900},
        selected && {borderWidth: 2},
        selected && {borderColor: p.gray_max},
        error && {borderWidth: 2},
        error && {borderColor: p.sys_magenta_500},
        done && {backgroundColor: '#66F2D6', borderColor: '#66F2D6'},
      ]}
      onPress={onPress}
    >
      {!selected || done ? (
        <PinDigit
          style={[
            children === undefined && {},
            children === undefined && {color: p.gray_600},
            done && {},
            done && {color: p.black_static},
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
  const {palette: p} = useTheme()
  return (
    <Text
      {...props}
      style={[{fontSize: 20, lineHeight: 22}, {color: p.gray_max}, style]}
    />
  )
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
    <View style={[a.py_lg]}>
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
  const {palette: p} = useTheme()

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
        {height: 24, width: 2},
        {backgroundColor: p.gray_600},
        {
          opacity: opacity,
        },
      ]}
    />
  )
}
