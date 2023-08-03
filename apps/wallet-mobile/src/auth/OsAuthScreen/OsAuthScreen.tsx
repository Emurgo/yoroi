import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, Platform, StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import fingerprintImage from '../../assets/img/fingerprint.png'
import {Icon, ScreenBackground, StatusBar, Text} from '../../components'
import {COLORS} from '../../theme'
import {supportsAndroidFingerprintOverlay} from '../biometrics'

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
      <SafeAreaView style={{flex: 1}}>
        <StatusBar type="dark" />

        <View style={[styles.main, onGoBack ? null : styles.mainPadded]}>
          {onGoBack && (
            <TouchableOpacity onPress={onGoBack}>
              <Icon.Chevron direction="left" size={28} color={COLORS.WHITE} />
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
  return <View style={styles.actions}>{children}</View>
}

const Action = ({children}: {children: React.ReactNode}) => {
  return <View style={styles.action}>{children}</View>
}

const messages = defineMessages({
  welcomeMessage: {
    id: 'components.common.fingerprintscreenbase.welcomeMessage',
    defaultMessage: '!!!Welcome Back',
  },
})

const headingTextStyle = {
  color: COLORS.WHITE,
  textAlign: 'center',
} as const

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  main: {
    flex: 1,
  },
  mainPadded: {
    paddingTop: 25,
  },
  heading: {
    ...headingTextStyle,
    fontSize: 22,
    lineHeight: 28,
  },
  subHeadingContainer: {
    marginVertical: 10,
  },
  subHeading: {
    ...headingTextStyle,
  },
  imageContainer: {
    marginVertical: 20,
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(110, 110, 255, 0.4)',
    borderRadius: 8,
  },
  image: {
    height: 120,
    width: 120,
  },
  welcomeMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeMessageText: {
    ...headingTextStyle,
    fontSize: 50,
    lineHeight: 60,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
})
