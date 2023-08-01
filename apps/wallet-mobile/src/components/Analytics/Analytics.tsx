import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, ScrollView, StyleSheet, Switch, View} from 'react-native'

import image from '../../assets/img/analytics.png'
import {Button, Text} from '../../components'
import {useMetrics} from '../../metrics/metricsManager'
import {spacing} from '../../theme'

type Props = {
  type: 'notice' | 'settings'
  onClose?: () => null
}

export const Analytics = ({type, onClose}: Props) => {
  const intl = useIntl()
  const metrics = useMetrics()

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.title}>{intl.formatMessage(messages.title)}</Text>

          <Image source={image} />
        </View>

        <Text style={styles.paragraph}>{intl.formatMessage(messages.header)}</Text>

        <Text style={styles.paragraph}>{intl.formatMessage(messages.description)}</Text>

        <View style={styles.list}>
          <Text style={styles.text}>
            <Text style={styles.tick}>✓</Text>

            {intl.formatMessage(messages.anonymous, bold)}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.tick}>✓</Text>

            {intl.formatMessage(messages.optout, bold)}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.cross}>✕</Text>

            {intl.formatMessage(messages.private, bold)}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.cross}>✕</Text>

            {intl.formatMessage(messages.noip, bold)}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.cross}>✕</Text>

            {intl.formatMessage(messages.nosell, bold)}
          </Text>
        </View>

        <Text>{intl.formatMessage(messages.more)}</Text>
      </View>

      {type === 'notice' && (
        <View style={styles.buttons}>
          <Button
            block
            outlineShelley
            onPress={() => {
              metrics.disable()
              onClose?.()
            }}
            title={intl.formatMessage(messages.skip)}
            style={styles.button}
          />

          <Button
            block
            shelleyTheme
            onPress={() => {
              metrics.enable()
              onClose?.()
            }}
            title={intl.formatMessage(messages.accept)}
            style={styles.button}
          />
        </View>
      )}

      {type === 'settings' && (
        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text bold>{intl.formatMessage(messages.toggle)}</Text>

          <Switch
            value={metrics.isEnabled}
            onValueChange={() => (metrics.isEnabled ? metrics.disable() : metrics.enable())}
          />
        </View>
      )}
    </ScrollView>
  )
}

const bold = {b: (text) => <Text bold>{text}</Text>}

const styles = StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  list: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  buttons: {
    flexDirection: 'column',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 10,
  },
  tick: {
    color: 'blue',
    marginRight: 12,
  },
  cross: {
    color: 'red',
    marginRight: 12,
  },
})

const messages = defineMessages({
  title: {
    id: 'components.analytics.title',
    defaultMessage: '!!!User insights',
  },
  header: {
    id: 'components.analytics.header',
    defaultMessage: '!!!Join the journey to improve Yoroi',
  },
  description: {
    id: 'components.analytics.description',
    defaultMessage: '!!!Share user insights to help us fine tune Yoroi to better serve your needs.',
  },
  anonymous: {
    id: 'components.analytics.anonymous',
    defaultMessage: '!!!Anonymous analytics data',
  },
  optout: {
    id: 'components.analytics.optout',
    defaultMessage: '!!!You can always opt-out via Settings',
  },
  private: {
    id: 'components.analytics.private',
    defaultMessage: '!!!We <b>cannot</b> access private keys',
  },
  noip: {
    id: 'components.analytics.noip',
    defaultMessage: '!!!We <b>are not</b> recording IP addresses',
  },
  nosell: {
    id: 'components.analytics.nosell',
    defaultMessage: '!!!We <b>do not</b> sell data',
  },
  more: {
    id: 'components.analytics.more',
    defaultMessage: '!!!Learn more about user insights',
  },
  skip: {
    id: 'components.analytics.skip',
    defaultMessage: '!!!Skip',
  },
  accept: {
    id: 'components.analytics.accept',
    defaultMessage: '!!!Accept',
  },
  toggle: {
    id: 'components.analytics.toggle',
    defaultMessage: '!!!Allow Yoroi analytics',
  },
})
