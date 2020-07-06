// @flow

import React from 'react'
import {View, Image, TouchableOpacity} from 'react-native'

import {Text, StatusBar, ScreenBackground} from '../UiKit'
import fingerprintImage from '../../assets/img/fingerprint.png'
import chevronLeft from '../../assets/img/chevron_left.png'

import styles from './styles/FingerprintScreenBase.style'

import type {ComponentType} from 'react'

const FingerprintScreenBase = ({
  headings,
  subHeadings,
  buttons,
  onGoBack,
  error,
}) => (
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

      <View style={styles.imageContainer}>
        <Image source={fingerprintImage} style={styles.image} />
      </View>
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
}

export default (FingerprintScreenBase: ComponentType<ExternalProps>)
