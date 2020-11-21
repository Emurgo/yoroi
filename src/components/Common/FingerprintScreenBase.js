// @flow

import React from 'react'
import {View, Image, TouchableOpacity, Platform} from 'react-native'
import {defineMessages} from 'react-intl'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'
import DeviceInfo from 'react-native-device-info'

import {Text, StatusBar, ScreenBackground} from '../UiKit'
import fingerprintImage from '../../assets/img/fingerprint.png'
import chevronLeft from '../../assets/img/chevron_left.png'
import {onDidMount} from '../../utils/renderUtils'

import styles from './styles/FingerprintScreenBase.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  welcomeMessage: {
    id: 'components.common.fingerprintscreenbase.welcomeMessage',
    defaultMessage: '!!!Welcome Back',
    description: 'some desc',
  },
})

type Props = {
  headings: Array<string>,
  subHeadings?: Array<string>,
  buttons: Array<any>,
  onGoBack?: () => any,
  error?: null | false | string,
  addWelcomeMessage?: boolean,
  intl?: any,
  showImage: boolean,
}

const FingerprintScreenBase = ({
  headings,
  subHeadings,
  buttons,
  onGoBack,
  error,
  addWelcomeMessage,
  intl,
  showImage,
}: Props) => (
  <ScreenBackground style={styles.container}>
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

      {/* eslint-disable indent */
      addWelcomeMessage === true &&
        intl != null && (
          <View style={styles.welcomeMessageContainer}>
            <Text style={styles.welcomeMessageText}>
              {intl.formatMessage(messages.welcomeMessage)}
            </Text>
          </View>
        )
      /* eslint-enable indent */
      }

      {showImage === true && (
        <View style={styles.imageContainer}>
          <Image source={fingerprintImage} style={styles.image} />
        </View>
      )}
    </View>

    {error != null && error !== false ? (
      <Text style={styles.error}>{error}</Text>
    ) : null}

    <View style={styles.controls}>{buttons}</View>
  </ScreenBackground>
)

type ExternalProps = {
  headings: Array<string>,
  subHeadings?: Array<string>,
  buttons: Array<any>,
  onGoBack?: () => any,
  error?: null | false | string,
  addWelcomeMessage?: boolean,
  intl?: any,
}

export default (compose(
  withStateHandlers(
    {
      showImage: false,
    },
    {
      shouldShowImage: () => (sdk: number): {showImage: boolean} => {
        // note(v-almonacid): the decrypt with biometrics prompt only appears
        // for API level >= 28
        const showImage = Platform.OS === 'android' && sdk < 28
        return {showImage}
      },
    },
  ),
  onDidMount(({shouldShowImage}) =>
    DeviceInfo.getApiLevel().then((sdk) => shouldShowImage(sdk)),
  ),
)(FingerprintScreenBase): ComponentType<ExternalProps>)
