import React from 'react'
import {KeyboardAvoidingView, NativeTouchEvent, Platform, Pressable, StyleSheet, Text, View} from 'react-native'
import Animated, {FadeIn} from 'react-native-reanimated'

import {Spacer} from '../../components'
import {useModal} from './ModalContext'

export const ModalScreen = () => {
  const {height, closeModal, content} = useModal()
  const [swipeLocationY, setSwipeLocationY] = React.useState(height)
  const [downDirectionCount, setDownDirectionCount] = React.useState(0)

  const cleanDirectionCount = () => {
    setDownDirectionCount(0)
  }

  const onResponderMove = ({nativeEvent}: {nativeEvent: NativeTouchEvent}) => {
    if (swipeLocationY < nativeEvent.locationY) {
      const newState = downDirectionCount + 1
      if (newState > 6) {
        closeModal()
        cleanDirectionCount()
      } else setDownDirectionCount(newState)
    }
    setSwipeLocationY(nativeEvent.locationY)
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.test}>
        <Pressable style={styles.backdrop} onPress={closeModal} />
      </Animated.View>

      <View
        style={[
          {
            height: height,
          },
          styles.animatedView,
        ]}
      >
        <View style={[styles.sheet]} onResponderMove={onResponderMove} onStartShouldSetResponder={() => true}>
          <Header />

          {content}
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const Header = () => {
  const {title} = useModal()
  return (
    <View style={styles.header}>
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
  test: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
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
  },
  title: {
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
    fontSize: 20,
    padding: 16,
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
