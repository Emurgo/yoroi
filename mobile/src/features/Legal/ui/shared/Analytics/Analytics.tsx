import {time} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useBold} from '~/common/hooks/useBold'
import {useAnalyticsContext} from '~/features/Analytics/context/AnalyticsRootProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {metricsConsentRequestedStorageKeyManager} from '~/kernel/storage/storages'
import {Button, ButtonType} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'
import {Space} from '~/ui/Space/Space'
import {YoroiLogo} from '~/ui/YoroiLogo/YoroiLogo'

import {AnalyticsIllustration} from '../../illustrations/AnalyticsIllustration'

type Props =
  | {
      type: 'notice'
      onNext: () => void
    }
  | {
      type: 'settings'
    }

export const Analytics = (props: Props) => {
  if (props.type === 'settings') return <Settings />
  return <Notice onNext={props.onNext} />
}

const Notice = ({onNext}: {onNext?: () => void}) => {
  const strings = useStrings()
  const {setEnabled} = useAnalyticsContext()

  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, time.seconds(0.5))

    return () => clearTimeout(timeout)
  }, [])

  return (
    <SafeArea style={a.pt_2xl}>
      <ScrollView
        bounces={false}
        style={a.flex_1}
        contentContainerStyle={[a.px_lg, {paddingBottom: buttonHeight + 16}]}
        ref={scrollViewRef}
        persistentScrollbar
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Info showLogo />
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <Button
          size="S"
          type={ButtonType.Text}
          onPress={() => {
            try {
              metricsConsentRequestedStorageKeyManager.save(true)
            } catch {}
            setEnabled(false)
            onNext?.()
          }}
          title={strings.ui.skip}
        />

        <Space.Height.lg />

        <Button
          type={ButtonType.Primary}
          onPress={() => {
            try {
              metricsConsentRequestedStorageKeyManager.save(true)
            } catch {}
            setEnabled(true)
            onNext?.()
          }}
          title={strings.ui.accept}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}

const Settings = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const {enabled, setEnabled} = useAnalyticsContext()

  const handleOnToggle = React.useCallback(() => {
    setEnabled(!enabled)
  }, [enabled, setEnabled])

  return (
    <SafeArea style={[a.px_lg, a.gap_lg]}>
      <Info />

      <View style={[a.flex_row, a.align_center, a.justify_between]}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
          {strings.ui.toggle}
        </Text>

        <SettingsSwitch value={enabled} onValueChange={handleOnToggle} />
      </View>
    </SafeArea>
  )
}

const Info = ({showLogo}: {showLogo?: boolean}) => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const bold = useBold({style: a.body_1_lg_medium})

  const handleOnReadMore = () => {
    const url =
      'https://help.yoroi-wallet.com/en/article/whats-user-insights-1nmw7pq/'
    Linking.openURL(url).catch((error) => {
      logger.error('Error opening URL', {
        error,
        url,
        origin: 'Analytics',
      })
    })
  }

  const list = [
    {
      icon: '✓',
      key: 'anonymous',
      color: p.primary_700,
    },
    {
      icon: '✓',
      key: 'optout',
      color: p.primary_700,
    },
    {
      icon: '✕',
      key: 'private',
      color: p.sys_magenta_500,
    },
    {
      icon: '✕',
      key: 'noip',
      color: p.sys_magenta_500,
    },
    {
      icon: '✕',
      key: 'nosell',
      color: p.sys_magenta_500,
    },
  ] as const

  return (
    <View style={a.gap_lg}>
      {showLogo && (
        <>
          <Space.Height._2xl />
          <YoroiLogo />
          <Space.Height._2xl />
        </>
      )}

      <View style={a.align_center}>
        <AnalyticsIllustration />
      </View>

      <View style={a.align_center}>
        <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
          {strings.ui.analyticsHeader}
        </Text>
      </View>

      <View>
        {list.map(({icon, key, color}) => (
          <View key={key} style={[a.flex_row, a.align_center]}>
            <Text style={[a.body_1_lg_regular, {color}, a.pr_sm]}>{icon}</Text>

            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {key === 'private' || key === 'noip' || key === 'nosell'
                ? strings.ui[key](bold)
                : strings.ui[key]}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={handleOnReadMore}>
        <Text style={[a.link_1_lg, ta.text_primary_medium, a.text_center]}>
          {strings.ui.more}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const buttonHeight = 80
