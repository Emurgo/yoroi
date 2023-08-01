import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Linking, ScrollView, StyleSheet, Switch, TouchableOpacity, View} from 'react-native'

import {Button, Text} from '../../components'
import {useMetrics} from '../../metrics/metricsManager'
import {COLORS, spacing} from '../../theme'
import {AnalyticsImage} from './AnalyticsImage'

type Props = {
  type: 'notice' | 'settings'
  onClose?: () => null
}

export const Analytics = ({type, onClose}: Props) => {
  const strings = useStrings()
  const metrics = useMetrics()

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.centered}>
        {type === 'notice' && <Text style={styles.title}>{strings.header}</Text>}

        <AnalyticsImage />
      </View>

      <View style={styles.centered}>
        {type === 'settings' && (
          <Text style={styles.paragraph} bold>
            {strings.header}
          </Text>
        )}

        <Text style={styles.paragraph} bold={type === 'notice'}>
          {strings.description}
        </Text>
      </View>

      <View style={styles.list}>
        {list.map(({style, icon, key}) => (
          <View key={key} style={styles.item}>
            <Text style={style}>{icon}</Text>

            <Text style={styles.text}>{strings[key]}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={() => Linking.openURL('')}>
        <Text style={styles.link}>{strings.more}</Text>
      </TouchableOpacity>

      {type === 'notice' && (
        <View style={styles.buttons}>
          <Button
            block
            outlineShelley
            onPress={() => {
              metrics.disable()
              onClose?.()
            }}
            title={strings.skip}
            style={styles.skip}
          />

          <Button
            block
            shelleyTheme
            onPress={() => {
              metrics.enable()
              onClose?.()
            }}
            title={strings.accept}
          />
        </View>
      )}

      {type === 'settings' && (
        <View style={styles.toggle}>
          <Text bold>{strings.toggle}</Text>

          <Switch
            value={metrics.isEnabled}
            onValueChange={() => (metrics.isEnabled ? metrics.disable() : metrics.enable())}
          />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  list: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  link: {
    color: COLORS.BLUE_LIGHTER,
    textAlign: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  centered: {
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
    gap: 8,
    marginTop: 12,
  },
  skip: {
    borderWidth: 0,
  },
  tick: {
    color: COLORS.DARK_BLUE,
    marginRight: 8,
  },
  cross: {
    color: COLORS.RED,
    marginRight: 8,
  },
  toggle: {display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
})

const list = [
  {style: styles.tick, icon: '✓', key: 'anonymous'},
  {style: styles.tick, icon: '✓', key: 'optout'},
  {style: styles.cross, icon: '✕', key: 'private'},
  {style: styles.cross, icon: '✕', key: 'noip'},
  {style: styles.cross, icon: '✕', key: 'nosell'},
] as const

const bold = {b: (text) => <Text bold>{text}</Text>}

const useStrings = () => {
  const intl = useIntl()
  return {
    header: intl.formatMessage(messages.header),
    description: intl.formatMessage(messages.description),
    anonymous: intl.formatMessage(messages.anonymous),
    optout: intl.formatMessage(messages.optout),
    private: intl.formatMessage(messages.private, bold),
    noip: intl.formatMessage(messages.noip, bold),
    nosell: intl.formatMessage(messages.nosell, bold),
    more: intl.formatMessage(messages.more),
    skip: intl.formatMessage(messages.skip),
    accept: intl.formatMessage(messages.accept),
    toggle: intl.formatMessage(messages.toggle),
  }
}

const messages = defineMessages({
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
