import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet'
import {useNavigation} from '@react-navigation/native'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Modal as RNModal, StyleSheet, Text, View} from 'react-native'

type BottomSheetProps = {
  title: string
  content: string | React.ReactNode
  isOpen: boolean
  onClose?: () => void
}

export const BottomSheetModal = ({title, content, isOpen = false, onClose}: BottomSheetProps) => {
  const navigation = useNavigation()

  const [showBackdropComp, setShowBackdropComp] = useState(true)

  const bottomSheetRef = useRef<BottomSheet>(null)

  const snapPoints = ['1%', '50%']

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log('handleSheetChanges', index)
      if (index === 0) {
        setShowBackdropComp(false)
        onClose?.()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) {
      bottomSheetRef.current?.close()
      setShowBackdropComp(false)
    } else {
      setShowBackdropComp(true)
    }
  }, [isOpen, onClose])

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
              onPress={() => {
                setShowBackdropComp(false)
                onClose?.()
              }}
            />
          )
        }
        onChange={handleSheetChanges}
      >
        <View style={styles.container}>
          <Text style={styles.sheetTitle}>{title}</Text>

          <View style={styles.sheetContent}>{content}</View>
        </View>
      </BottomSheet>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 20,
    paddingBottom: 24,
  },
  sheetContent: {
    paddingHorizontal: 16,
  },
})
