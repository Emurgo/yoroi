import {useCardAnimation} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Animated, GestureResponderEvent, Pressable, StyleSheet, Text, View} from 'react-native'

import {KeyboardAvoidingView, Spacer} from '..'
import {LoadingOverlay} from '../LoadingOverlay/LoadingOverlay'
import {useModal} from './ModalContext'

export const ModalScreen = () => {
  const styles = useStyles()
  const {current} = useCardAnimation()
  const {height, closeModal, content, isOpen, isLoading} = useModal()
  const [swipeLocationY, setSwipeLocationY] = React.useState(height)

  const onResponderMove = ({nativeEvent}: GestureResponderEvent) => {
    if (swipeLocationY < nativeEvent.locationY && isOpen) {
      setSwipeLocationY(height)
      closeModal()
      return
    }

    setSwipeLocationY(nativeEvent.locationY)
  }

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.cancellableArea} onPress={closeModal} />

      <KeyboardAvoidingView style={styles.root} keyboardVerticalOffset={0}>
        <Animated.View
          style={[
            {
              height: height,
              transform: [
                {
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
            styles.animatedView,
          ]}
        >
          <View style={[styles.rounded, styles.sheet]}>
            <LoadingOverlay loading={isLoading} style={styles.rounded} />

            <Header onResponderMove={onResponderMove} onStartShouldSetResponder={() => true} />

            {content}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  )
}

const Header = (props: {
  onResponderMove?: (event: GestureResponderEvent) => void
  onStartShouldSetResponder?: () => boolean
}) => {
  const styles = useStyles()
  const {title} = useModal()
  return (
    <View style={styles.header} {...props}>
      <Spacer height={8} />

      <SliderIndicator />

      <Spacer height={8} />

      {title !== '' && <Text style={styles.title}>{title}</Text>}
    </View>
  )
}

const SliderIndicator = () => {
  const styles = useStyles()
  return <View style={styles.slider} />
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      alignSelf: 'stretch',
    },
    cancellableArea: {
      flexGrow: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.64)',
    },
    animatedView: {
      alignSelf: 'stretch',
    },
    rounded: {
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
    },
    sheet: {
      flex: 1,
      backgroundColor: color.gray_c50,
      alignSelf: 'stretch',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    title: {
      ...atoms.heading_3_medium,
      padding: 14,
      color: color.gray_cmax,
    },
    header: {
      alignItems: 'center',
      alignSelf: 'stretch',
    },
    slider: {
      height: 4,
      backgroundColor: color.gray_c50,
      width: 32,
      borderRadius: 10,
    },
  })
  return styles
}
