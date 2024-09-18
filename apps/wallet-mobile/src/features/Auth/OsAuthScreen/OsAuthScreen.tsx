import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, Platform, StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import fingerprintImage from '../../../assets/img/fingerprint.png'
import {Icon} from '../../../components/Icon'
import {ScreenBackground} from '../../../components/ScreenBackground'
import {Text} from '../../../components/Text'
import {supportsAndroidFingerprintOverlay} from '../common/biometrics'

type Props = {
  headings: Array<string>
  subHeadings?: Array<string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buttons: Array<any>
  onGoBack?: () => void
  addWelcomeMessage?: boolean
  // storybook only
  showFingerPlaceholder?: boolean
}

export const OsAuthScreen = ({
  headings,
  subHeadings,
  buttons,
  onGoBack,
  addWelcomeMessage,
  showFingerPlaceholder = false,
}: Props) => {
  const intl = useIntl()
  const {styles, colors} = useStyles()
  const [showImage, setShowImage] = React.useState(showFingerPlaceholder)

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      supportsAndroidFingerprintOverlay().then((isSupported) => {
        setShowImage(!isSupported || showFingerPlaceholder)
      })
      return
    }

    setShowImage(showFingerPlaceholder)
  }, [showFingerPlaceholder])

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.flex}>
        <View style={[styles.flex, onGoBack ? null : styles.mainPadded]}>
          {onGoBack && (
            <TouchableOpacity onPress={onGoBack}>
              <Icon.Chevron direction="left" size={28} color={colors.icon} />
            </TouchableOpacity>
          )}

          {headings.map((txt) => (
            <Text key={txt} style={styles.heading}>
              {txt}
            </Text>
          ))}

          {subHeadings && subHeadings.length > 0 ? (
            <View style={styles.subHeadingContainer}>
              {subHeadings.map((txt) => (
                <Text key={txt} style={styles.subHeading}>
                  {txt}
                </Text>
              ))}
            </View>
          ) : null}

          {addWelcomeMessage === true && intl != null && (
            <View style={styles.welcomeMessageContainer}>
              <Text style={styles.welcomeMessageText}>{intl.formatMessage(messages.welcomeMessage)}</Text>
            </View>
          )}

          {showImage === true && (
            <View style={styles.imageContainer}>
              <Image source={fingerprintImage} style={styles.image} />
            </View>
          )}
        </View>

        {buttons.length > 1 ? <Actions>{buttons}</Actions> : <Action>{buttons}</Action>}
      </SafeAreaView>
    </ScreenBackground>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.actions}>{children}</View>
}

const Action = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.action}>{children}</View>
}

const messages = defineMessages({
  welcomeMessage: {
    id: 'components.common.fingerprintscreenbase.welcomeMessage',
    defaultMessage: '!!!Welcome Back',
  },
})

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.flex_1,
      ...atoms.p_lg,
    },
    flex: {
      ...atoms.flex_1,
    },
    mainPadded: {
      ...atoms.pt_lg,
    },
    heading: {
      color: color.text_gray_max,
      ...atoms.text_center,
      ...atoms.heading_3_medium,
    },
    subHeadingContainer: {
      ...atoms.pt_md,
    },
    subHeading: {
      color: color.text_gray_medium,
      ...atoms.text_center,
    },
    imageContainer: {
      ...atoms.py_lg,
      width: '100%',
      height: 200,
      ...atoms.justify_center,
      ...atoms.align_center,
      backgroundColor: 'rgba(110, 110, 255, 0.4)',
      borderRadius: 8,
    },
    image: {
      height: 120,
      width: 120,
    },
    welcomeMessageContainer: {
      ...atoms.flex_1,
      ...atoms.justify_center,
      ...atoms.align_center,
    },
    welcomeMessageText: {
      color: color.text_gray_medium,
      ...atoms.text_center,
      fontSize: 50,
      lineHeight: 60,
    },
    actions: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    action: {
      ...atoms.flex_row,
      ...atoms.align_stretch,
    },
  })
  const colors = {
    icon: color.el_gray_max,
  }
  return {colors, styles} as const
}
