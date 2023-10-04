import React from 'react'
import {KeyboardAvoidingView, Modal, NativeTouchEvent, Platform, Pressable, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../Spacer'

type BottomSheetProps = {
  children: React.ReactNode
  height?: number
  debug?: boolean
  isExtendable?: boolean
  maxHeight?: `${number}%` | number
  title: string
  onClose?: () => void
}

export type DialogRef = {
  openDialog: () => void
  closeDialog: () => void
  isOpen: boolean
}

export const BottomSheet = React.forwardRef<DialogRef, BottomSheetProps>(
  ({children, height = 300, debug = false, maxHeight = '80%', title, isExtendable = false, onClose}, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isExtended, setExtended] = React.useState(false)
    const [swipeLocationY, setSwipeLocationY] = React.useState(height)
    const [upDirectionCount, setUpDirectionCount] = React.useState(0)
    const [downDirectionCount, setDownDirectionCount] = React.useState(0)

    React.useImperativeHandle(ref, () => ({
      openDialog,
      closeDialog,
      isOpen,
    }))

    const openDialog = () => {
      setIsOpen(true)
    }

    const closeDialog = () => {
      if (isExtended) setExtended(false)
      setIsOpen(false)
      onClose?.()
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
          closeDialog()
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
        {(debug || isOpen) && <View style={styles.backdrop} />}

        <Modal animationType="slide" visible={debug || isOpen} onRequestClose={closeDialog} transparent>
          <Pressable style={styles.backdropAction} onPress={closeDialog}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'height' : undefined}>
              <View
                style={[styles.sheet, {height: isExtended && isExtendable ? maxHeight : height}]}
                onResponderMove={onResponderMove}
                onStartShouldSetResponder={() => true}
              >
                <Header title={title} />

                {children}
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>
      </>
    )
  },
)

const Header = ({title}: {title: string}) => {
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
    color: 'black',
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
  backdropAction: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    opacity: 0.5,
    backgroundColor: 'black',
  },
})
