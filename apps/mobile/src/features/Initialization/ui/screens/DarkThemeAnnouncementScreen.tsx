import {useFocusEffect} from '@react-navigation/native'
import {UseQueryOptions, useSuspenseQuery} from '@tanstack/react-query'
import {
  parseBoolean,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Platform, Pressable, Switch, Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

import {DarkThemeIlustration} from '../illustrations/DarkThemeIlustration'
import {LightThemeIlustration} from '../illustrations/LightThemeIlustration'

export const DarkThemeAnnouncementScreen = () => {
  const strings = useStrings()
  const {isDark, atoms: ta, palette: p} = useTheme()
  const {track} = useMetrics()
  const {setScreenShown, isPending: isSetScreenShownLoading} =
    useSetScreenShown()

  const scrollViewRef = React.useRef<ScrollView | null>(null)

  useFocusEffect(
    React.useCallback(() => {
      track.onboardingThemePageViewed()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  const {resetToWalletSetupInit} = useWalletNavigation()

  const navigate = () => {
    setScreenShown()
    resetToWalletSetupInit()
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'top', 'bottom']}
      style={[a.flex_1, ta.bg_color_max, a.px_lg]}
    >
      <ScrollView
        bounces={false}
        ref={scrollViewRef}
        persistentScrollbar={true}
        showsVerticalScrollIndicator={true}
      >
        <View style={[a.align_center, a.pt_2xl]}>
          <Space.Height._2xl />

          {isDark ? <DarkThemeIlustration /> : <LightThemeIlustration />}

          <Space.Height._2xl />

          <Text style={[a.heading_3_medium, a.text_center]}>
            {strings.initialization.darkThemeAnnouncement.header}
          </Text>

          <Text
            style={[
              a.body_1_lg_regular,
              {color: p.el_gray_medium},
              a.text_center,
              a.py_sm,
            ]}
          >
            {strings.initialization.darkThemeAnnouncement.description}
          </Text>

          <Toggle />

          <Text
            style={[
              {color: p.el_gray_medium},
              a.text_center,
              a.body_3_sm_regular,
            ]}
          >
            {strings.initialization.darkThemeAnnouncement.changeTheme}
          </Text>
        </View>
      </ScrollView>

      <Button
        title={strings.initialization.darkThemeAnnouncement.continue}
        disabled={isSetScreenShownLoading}
        onPress={navigate}
      />

      {Platform.OS === 'android' && <Space.Height.lg />}
    </SafeAreaView>
  )
}

const Toggle = () => {
  const {isLight, isDark, selectTheme, atoms: ta, palette: p} = useTheme()
  const {track} = useMetrics()

  const handleOnValueChange = () => {
    selectTheme(isLight ? 'default-dark' : 'default-light')
    track.themeSelected({theme: isLight ? 'dark' : 'light'})
  }

  return (
    <View style={[a.pb_2xl, {position: 'relative'}]}>
      <Switch
        style={{transform: [{scaleX: 1.3}, {scaleY: 1.3}]}}
        value={!isLight}
        onValueChange={handleOnValueChange}
        trackColor={{false: p.gray_100, true: p.gray_100}}
        thumbColor={isLight ? p.sys_yellow_500 : p.el_primary_medium}
      />

      {isDark && Platform.OS === 'ios' && (
        <Pressable
          style={{
            width: 35,
            height: 35,
            top: -2,
            right: 8,
            backgroundColor: p.gray_100,
            position: 'absolute',
            borderRadius: 9999,
          }}
          onPress={handleOnValueChange}
        />
      )}
    </View>
  )
}

const darkThemeAnnouncementShownKey = 'dark-theme-announcement-shown-key'
export const useShowDarkThemeAnnouncementScreen = (
  options: Partial<
    UseQueryOptions<
      boolean,
      Error,
      boolean,
      ['useShowDarkThemeAnnouncementScreen']
    >
  > = {},
) => {
  const storage = useAsyncStorage()

  const query = useSuspenseQuery({
    ...options,
    queryKey: ['useShowDarkThemeAnnouncementScreen'],
    queryFn: () =>
      storage
        .getItem(darkThemeAnnouncementShownKey)
        .then((value) => parseBoolean(value) ?? true),
  })

  return {
    ...query,
    showDarkThemeAnnouncement: query.data,
  }
}

const useSetScreenShown = () => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: async () =>
      storage.setItem(darkThemeAnnouncementShownKey, JSON.stringify(false)),
    invalidateQueries: [['useShowDarkThemeAnnouncementScreen']],
  })

  return {
    ...mutation,
    setScreenShown: mutation.mutate,
  }
}
