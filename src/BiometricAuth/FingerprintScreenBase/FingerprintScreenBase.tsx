import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, Platform, StyleSheet, TouchableOpacity, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {SafeAreaView} from 'react-native-safe-area-context'

import chevronLeft from '../../assets/img/chevron_left.png'
import fingerprintImage from '../../assets/img/fingerprint.png'
import {ScreenBackground, StatusBar, Text} from '../../components'
import {COLORS} from '../../theme'

type Props = {
  headings: Array<string>
  subHeadings?: Array<string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buttons: Array<any>
  onGoBack?: () => void
  error?: null | false | string
  addWelcomeMessage?: boolean
}

export const FingerprintScreenBase = ({headings, subHeadings, buttons, onGoBack, error, addWelcomeMessage}: Props) => {
  const intl = useIntl()
  const [showImage, setShowImage] = React.useState(false)

  React.useEffect(() => {
    DeviceInfo.getApiLevel().then((sdk) => {
      setShowImage(Platform.OS === 'android' && sdk < 28)
    })
  }, [])

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        <StatusBar type="dark" />

        <View style={[styles.main, onGoBack ? null : styles.mainPadded]}>
          {onGoBack && (
            <TouchableOpacity onPress={onGoBack} style={styles.goBack}>
              <Image source={chevronLeft} style={styles.chevron} />
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

        {error != null && error !== false ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.controls}>{buttons}</View>
      </SafeAreaView>
    </ScreenBackground>
  )
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
  goBack: {
    width: 30,
  },
  chevron: {
    tintColor: COLORS.WHITE,
    marginVertical: 10,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  error: {
    color: COLORS.RED,
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 17,
    textAlign: 'center',
  },
})
