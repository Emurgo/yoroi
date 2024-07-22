/**
 * IMPORTANT:
 * Modals may have unexpected behaviours, particularly on iOS.
 * A few recommandations when using them:
 * - iOS: make sure you test in a *release* build and on a real device
 * - avoid chaining modals (ie. creating a dialog in which one modal is shown
 * after the other)
 * - when visibility is controled through a component state variable, remember
 * that setState() is a *request* to change the state. The actual change may
 * occur within several UI ticks and not immediately.
 * - avoid mixing modals with Alert.alert() as this may freeze the UI
 * on iOS. See https://github.com/facebook/react-native/issues/10471
 */
import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Modal as RNModal, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {isEmptyString} from '../../../kernel/utils'
import {Cross} from '../../Icon/Cross'

type Props = {
  onRequestClose: () => void
  visible: boolean
  children: React.ReactNode
  showCloseIcon?: boolean
  noPadding?: boolean
  title?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}

type NavigationHookProp = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: NavigationProp<any, any, any, any, any>
}

// Note(ppershing): we need to hide the modal when navigating
// from this screen as modals are shown over react-navigation
// Warning: This means that children components are unmounted
// while on different screen and therefore should not keep any
// important state!
// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
function ModalClassComponent({
  navigation,
  visible,
  showCloseIcon,
  onRequestClose,
  noPadding,
  children,
  title,
}: Props & NavigationHookProp) {
  const [isFocused, setIsFocused] = React.useState<boolean>(true)
  const {styles, colors} = useStyles()

  React.useEffect(() => {
    const focusSubscription = navigation.addListener('focus', () => setIsFocused(true))
    const blurSubscription = navigation.addListener('blur', () => setIsFocused(false))

    return () => {
      focusSubscription()
      blurSubscription()
    }
  }, [navigation])

  return (
    <RNModal transparent animationType="fade" visible={visible && isFocused} onRequestClose={onRequestClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, noPadding && styles.noPadding, !isEmptyString(title) && styles.withTitle]}>
          {!isEmptyString(title) && <Text style={styles.title}>{title}</Text>}

          {showCloseIcon && (
            <TouchableOpacity style={styles.close} onPress={onRequestClose}>
              <Cross size={26} color={colors.icon} />
            </TouchableOpacity>
          )}

          <View style={[styles.content, noPadding === true && styles.noPadding]}>{children}</View>
        </View>
      </View>
    </RNModal>
  )
}

export const Modal = (props: Props) => {
  const navigation = useNavigation()
  return <ModalClassComponent {...props} navigation={navigation} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'center',
      ...atoms.px_xl,
      backgroundColor: color.mobile_overlay,
    },
    noPadding: {
      padding: 0,
      marginTop: 0,
    },
    container: {
      height: 350,
      backgroundColor: color.bg_color_high,
      borderRadius: 4,
      ...atoms.px_xl,
    },
    close: {
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 13,
      ...atoms.p_lg,
    },
    content: {
      flex: 1,
      marginTop: 15,
    },
    withTitle: {
      paddingTop: 0,
      marginTop: 0,
    },
    title: {
      ...atoms.heading_3_medium,
      color: color.gray_c600,
      alignSelf: 'center',
      ...atoms.pt_sm,
    },
  })

  const colors = {
    icon: color.gray_c400,
  }
  return {styles, colors}
}
