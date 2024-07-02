import {useTheme} from '@yoroi/theme'
import React from 'react'
import {FallbackProps} from 'react-error-boundary'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {ErrorImage} from './Illustrations/ErrorImage'

export const SomethingWentWrong = (_props: FallbackProps) => {
  const styles = useStyles()
  const strings = useStrings()
  return (
    <SafeAreaView edges={['bottom', 'left', 'right', 'top']} style={styles.root}>
      <ErrorImage />

      <View style={styles.content}>
        <Text style={styles.title}>{strings.title}</Text>

        <Text style={styles.description}>{strings.description}</Text>
      </View>
    </SafeAreaView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    description: intl.formatMessage(messages.description),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.somethingWentWrong.title',
    defaultMessage: '!!!Oops!',
  },
  description: {
    id: 'components.somethingWentWrong.description',
    defaultMessage: '!!!Something went wrong.\nTry to reload this page or restart the app.',
  },
})

const useStyles = () => {
  const theme = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      ...theme.atoms.justify_center,
      ...theme.atoms.align_center,
      ...theme.atoms.gap_2xl,
      backgroundColor: theme.color.gray_cmin,
    },
    content: {
      ...theme.atoms.justify_center,
      ...theme.atoms.align_center,
      ...theme.atoms.gap_xs,
    },
    title: {
      color: theme.color.gray_c900,
      ...theme.atoms.font_semibold,
      ...theme.atoms.text_center,
      fontSize: 20,
      lineHeight: 30,
    },
    description: {
      color: theme.color.gray_c600,
      ...theme.atoms.font_normal,
      ...theme.atoms.text_center,
      fontSize: 16,
      lineHeight: 24,
    },
  })
  return styles
}
