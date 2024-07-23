import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Animated, StyleSheet, Text, TextProps, View, ViewProps} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {StepperProgress} from '../../../components/StepperProgress/StepperProgress'

export const Title = ({style, ...props}: TextProps) => {
  const styles = useStyles()

  return <Text {...props} style={[styles.title, style]} />
}
export const Description = ({style, ...props}: TextProps) => {
  const styles = useStyles()

  return <Text {...props} style={[styles.description, style]} />
}

export const Actions = ({style, ...props}: ViewProps) => {
  const styles = useStyles()

  return <View {...props} style={[styles.actions, style]} />
}
export const Instructions = (props: ViewProps) => <View {...props} />
export const Row = ({style, ...props}: ViewProps) => {
  const styles = useStyles()

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
  const styles = useStyles()

  return (
    <TouchableOpacity
      style={[styles.pinBox, selected && styles.pinBoxSelected, error && styles.pinBoxError, done && styles.pinDone]}
      onPress={onPress}
    >
      {!selected || done ? (
        <PinDigit style={[children === undefined && styles.pinDigitUnselected, done && styles.pinDigitDone]}>
          {children === undefined ? '—' : children}
        </PinDigit>
      ) : (
        <BlinkingCursor />
      )}
    </TouchableOpacity>
  )
}
export const PinDigit = ({style, ...props}: TextProps) => {
  const styles = useStyles()
  return <Text {...props} style={[styles.pinDigit, style]} />
}

export const Stepper = ({currentStep, totalSteps, title}: {currentStep: number; totalSteps: number; title: string}) => {
  const styles = useStyles()
  return (
    <View style={styles.stepper}>
      <StepperProgress currentStepTitle={title} currentStep={currentStep} totalSteps={totalSteps} />
    </View>
  )
}

const BlinkingCursor = () => {
  const [opacity] = React.useState(new Animated.Value(1))
  const styles = useStyles()

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
        {
          opacity: opacity,
        },
      ]}
    />
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    title: {
      ...atoms.heading_4_medium,
      color: color.gray_c900,
    },
    description: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    row: {
      flexDirection: 'row',
    },
    actions: {
      ...atoms.pt_lg,
    },
    pinBox: {
      borderWidth: 1,
      height: 60,
      width: 60,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: color.gray_c900,
    },
    pinDigit: {
      fontSize: 20,
      lineHeight: 22,
      color: color.gray_cmax,
    },
    pinBoxSelected: {
      borderWidth: 2,
      borderColor: color.gray_cmax,
    },
    pinBoxError: {
      borderColor: color.sys_magenta_c500,
      borderWidth: 2,
    },
    pinDigitUnselected: {
      color: color.gray_c600,
    },
    pinDone: {
      backgroundColor: '#66F2D6',
      borderColor: '#66F2D6',
    },
    stepper: {
      ...atoms.py_lg,
    },
    cursor: {
      backgroundColor: color.gray_c600,
      height: 24,
      width: 2,
    },
    pinDigitDone: {
      color: color.black_static,
    },
  })

  return styles
}
