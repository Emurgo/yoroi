import {useCardAnimation} from '@react-navigation/stack'
import React from 'react'
import {
  Animated,
  GestureResponderEvent,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {Spacer} from '..'
import {useModal} from './ModalContext'

export const ModalScreen = () => {
  const {current} = useCardAnimation()
  const {height, closeModal, content, isOpen} = useModal()
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

      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
      >
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
          <View style={styles.sheet}>
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
  const {title} = useModal()
  return (
    <View style={styles.header} {...props}>
      <Spacer height={8} />

      <SliderIndicator />

      <Spacer height={8} />

      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const SliderIndicator = () => <View style={styles.slider} />

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  animatedView: {
    alignSelf: 'stretch',
  },
  sheet: {
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
    fontSize: 20,
    padding: 16,
    color: '#000',
  },
  header: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  slider: {
    height: 4,
    backgroundColor: 'black',
    width: 32,
    borderRadius: 10,
  },
})
