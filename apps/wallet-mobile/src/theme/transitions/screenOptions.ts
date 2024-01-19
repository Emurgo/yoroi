import {StackCardStyleInterpolator} from '@react-navigation/stack'
import {Easing} from 'react-native-reanimated'

/**
 * Options to be added in Stack.Screen to change transition
 * see more: https://reactnavigation.org/docs/stack-navigator/#animations
 */

const topToBottomTransitionSpec = {
  open: {
    animation: 'spring',
    config: {
      stiffness: 300,
      damping: 25,
      mass: 1,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    },
  },
  close: {
    animation: 'timing',
    config: {
      easing: Easing.inOut(Easing.sin),
      duration: 300,
    },
  },
} as const

const topToBottomCardStyleInterpolator: StackCardStyleInterpolator = ({current, layouts}) =>
  ({
    cardStyle: {
      opacity: current.progress,
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [-layouts.screen.height, 0],
          }),
        },
      ],
    },
  } as const)

/**
   * Usage:
   *    <Stack.Screen
            options={{
                ...topToBottom
            }}
        />
   */
export const topToBottom = {
  cardStyleInterpolator: topToBottomCardStyleInterpolator,
  transitionSpec: topToBottomTransitionSpec,
}
