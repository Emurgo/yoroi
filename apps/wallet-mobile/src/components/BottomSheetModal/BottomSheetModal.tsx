import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet'
import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {Modal as RNModal, StyleSheet, Text, TouchableOpacity, View, ViewStyle} from 'react-native'

import {Icon} from '../Icon'
import {Spacer} from '../Spacer'

type BottomSheetModalProps = {
  title: string
  content: string | React.ReactNode
  isOpen: boolean
  onClose?: () => void
  containerStyle?: ViewStyle
}

export const BottomSheetModal = ({title, content, isOpen = false, onClose, containerStyle}: BottomSheetModalProps) => {
  const navigation = useNavigation()

  const [showBackdropComp, setShowBackdropComp] = React.useState(true)

  const bottomSheetRef = React.useRef<BottomSheet>(null)

  const snapPoints = ['1%', '50%']

  const handleSheetChanges = React.useCallback(
    (index: number) => {
      console.log('handleSheetChanges', index)
      if (index === 0) {
        setShowBackdropComp(false)
        onClose?.()
      }
    },
    [onClose],
  )

  React.useEffect(() => {
    if (!isOpen) {
      bottomSheetRef.current?.close()
      setShowBackdropComp(false)
    } else {
      setShowBackdropComp(true)
    }
  }, [isOpen, onClose])

  const handleOnClose = () => {
    setShowBackdropComp(false)
    onClose?.()
  }

  return (
    <RNModal
      transparent
      animationType="fade"
      visible={showBackdropComp}
      onRequestClose={() => {
        console.log('ON COLSE REQUEST MODAL ')
        navigation.goBack()
      }}
    >
      <BottomSheet
        ref={bottomSheetRef}
        index={isOpen ? 1 : 0}
        snapPoints={snapPoints}
        backdropComponent={(props) =>
          showBackdropComp === false ? (
            <></>
          ) : (
            <BottomSheetBackdrop
              {...props}
              opacity={0.5}
              enableTouchThrough={false}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              style={[{backgroundColor: 'rgba(0, 0, 0, 1)'}, StyleSheet.absoluteFillObject]}
              onPress={handleOnClose}
            />
          )
        }
        onChange={handleSheetChanges}
      >
        <View style={[styles.container, containerStyle]}>
          <View style={styles.header}>
            <View style={styles.empty} />

            <Text style={styles.sheetTitle}>{title}</Text>

            <TouchableOpacity style={styles.close} onPress={handleOnClose}>
              <Icon.CrossCircle size={28} />
            </TouchableOpacity>
          </View>

          <Spacer height={35} />

          {content}
        </View>
      </BottomSheet>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
  },
  close: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sheetTitle: {
    flex: 4,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#242838',
    textAlign: 'center',
  },
  empty: {
    flex: 1,
  },
})
