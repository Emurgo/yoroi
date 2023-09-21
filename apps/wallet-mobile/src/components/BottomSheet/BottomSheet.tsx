import React from 'react'
import {KeyboardAvoidingView, Modal, NativeTouchEvent, Platform, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../Spacer'

type BottomSheetProps = {
  children: React.ReactNode
  height?: number
  debug?: boolean
  isExtendable?: boolean
  maxHeight?: `${number}%` | number
  title: string
}

export type BottomSheetRef = {
  openBottomSheet: () => void
  closeBottomSheet: () => void
  isOpen: boolean
  onResponderMove: ({nativeEvent}: {nativeEvent: NativeTouchEvent}) => void // in case it needs to be used outside
}

export const BottomSheet = React.forwardRef<BottomSheetRef, BottomSheetProps>(
  ({children, height = 300, debug = false, maxHeight = '80%', title, isExtendable = true}, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isExtended, setExtended] = React.useState(false)
    const [swipeLocationY, setSwipeLocationY] = React.useState(height)
    const [upDirectionCount, setUpDirectionCount] = React.useState(0)
    const [downDirectionCount, setDownDirectionCount] = React.useState(0)

    React.useImperativeHandle(ref, () => ({
      openBottomSheet,
      closeBottomSheet,
      isOpen,
      onResponderMove,
    }))

    const openBottomSheet = () => {
      setIsOpen(true)
    }

    const closeBottomSheet = () => {
      if (isExtended) setExtended(false)
      setIsOpen(false)
    }

    const extendBottomSheet = () => {
      setExtended(true)
    }

    const cleanDirectionCount = () => {
      setDownDirectionCount(0)
      setUpDirectionCount(0)
    }

    const onResponderMove = ({nativeEvent}: {nativeEvent: NativeTouchEvent}) => {
      if (swipeLocationY < nativeEvent.locationY) {
        const newState = downDirectionCount + 1
        if (newState > 4) {
          closeBottomSheet()
          cleanDirectionCount()
        } else setDownDirectionCount(newState)
      } else if (swipeLocationY > nativeEvent.locationY) {
        const newState = upDirectionCount + 1
        if (newState > 4) {
          extendBottomSheet()
          cleanDirectionCount()
        } else setUpDirectionCount(newState)
      }
      setSwipeLocationY(nativeEvent.locationY)
    }

    return (
      <>
        {isOpen && <View style={styles.backdrop} />}

        <Modal animationType="slide" visible={debug || isOpen} onRequestClose={closeBottomSheet} transparent={true}>
          <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'height' : undefined}>
            <View style={[styles.sheet, {height: isExtended && isExtendable ? maxHeight : height}]}>
              <Header title={title} onResponderMove={onResponderMove} />

              {children}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </>
    )
  },
)

const Header = ({
  onResponderMove,
  title,
}: {
  onResponderMove: ({nativeEvent}: {nativeEvent: NativeTouchEvent}) => void
  title: string
}) => {
  return (
    <View onResponderMove={onResponderMove} onStartShouldSetResponder={() => true} style={styles.header}>
      <Spacer height={8} />

      <SliderIndicator />

      <Spacer height={8} />

      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const SliderIndicator = () => <View style={styles.slider} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
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
