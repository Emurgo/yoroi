import {parseBoolean, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, Pressable, StyleSheet, Switch, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button, Text} from '../../../components'
import {Space} from '../../../components/Space/Space'
import {useWalletNavigation} from '../../../kernel/navigation'
import {ThemeIlustration} from '../illustrations/ThemeIlustration'

export const DarkThemeAnnouncement = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {setScreenShown, isLoading: isSetScreenShownLoading} = useSetScreenShown()

  const scrollViewRef = React.useRef<ScrollView | null>(null)

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
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.root}>
      <ScrollView bounces={false} ref={scrollViewRef} persistentScrollbar={true} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <Space height="_2xl" />

          <ThemeIlustration />

          <Space height="_2xl" />

          <Text style={styles.title}>{strings.header}</Text>

          <Text style={styles.description}>{strings.description}</Text>

          <Toggle />

          <Text style={styles.caption}>{strings.changeTheme}</Text>
        </View>
      </ScrollView>

      <Button title={strings.continue} disabled={isSetScreenShownLoading} onPress={navigate} shelleyTheme />

      {Platform.OS === 'android' && <Space height="lg" />}
    </SafeAreaView>
  )
}

export const Toggle = () => {
  const {styles, color} = useStyles()
  const {isLight, isDark, selectThemeName} = useTheme()

  const handleOnValueChange = () => selectThemeName(isLight ? 'default-dark' : 'default-light')

  return (
    <View style={styles.toggle}>
      <Switch
        style={styles.switch}
        value={!isLight}
        onValueChange={handleOnValueChange}
        trackColor={{false: color.gray_c100, true: color.gray_c100}}
        thumbColor={isLight ? color.sys_yellow_c500 : color.el_primary_medium}
      />

      {isDark && Platform.OS === 'ios' && <Pressable style={styles.switchCircle} onPress={handleOnValueChange} />}
    </View>
  )
}

export const darkThemeAnnouncementShownKey = 'dark-theme-announcement-shown-key'
export const useShowDarkThemeAnnouncementScreen = (
  options: UseQueryOptions<boolean, Error, boolean, ['useShowDarkThemeAnnouncementScreen']> = {},
) => {
  const storage = useAsyncStorage()

  const query = useQuery({
    useErrorBoundary: true,
    suspense: true,
    ...options,
    queryKey: ['useShowDarkThemeAnnouncementScreen'],
    queryFn: () => storage.getItem(darkThemeAnnouncementShownKey).then((value) => parseBoolean(value) ?? true),
  })

  return {
    ...query,
    showDarkThemeAnnouncement: query.data,
  }
}

const useSetScreenShown = () => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: async () => storage.setItem(darkThemeAnnouncementShownKey, JSON.stringify(false)),
    invalidateQueries: [['useShowDarkThemeAnnouncementScreen']],
  })

  return {
    ...mutation,
    setScreenShown: mutation.mutate,
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.bg_color_high,
      ...atoms.px_lg,
    },
    content: {
      alignItems: 'center',
      ...atoms.pt_2xl,
      ...atoms.body_1_lg_regular,
    },
    title: {
      ...atoms.heading_3_medium,
      textAlign: 'center',
    },
    description: {
      ...atoms.body_1_lg_regular,
      color: color.el_gray_medium,
      textAlign: 'center',
      ...atoms.py_sm,
    },
    caption: {
      color: color.el_gray_medium,
      textAlign: 'center',
      ...atoms.body_3_sm_regular,
    },
    toggle: {
      ...atoms.pb_2xl,
      position: 'relative',
    },
    switch: {
      transform: [{scaleX: 1.3}, {scaleY: 1.3}],
    },
    switchCircle: {
      width: 35,
      height: 35,
      bottom: '50%',
      right: -5,
      backgroundColor: color.gray_c100,
      position: 'relative',
      borderRadius: 9999,
    },
  })

  return {styles, color}
}

const useStrings = () => {
  const intl = useIntl()
  return {
    header: intl.formatMessage(messages.header),
    description: intl.formatMessage(messages.description),
    changeTheme: intl.formatMessage(messages.changeTheme),
    continue: intl.formatMessage(messages.continue),
  }
}

const messages = defineMessages({
  header: {
    id: 'walletinit.theme.tryDarkTheme',
    defaultMessage: '!!!Try Yoroi dark theme',
  },
  description: {
    id: 'walletinit.theme.description',
    defaultMessage:
      '!!!Press the theme switcher and dive into the new stylish theme crafted to enhance your Cardano wallet experience',
  },
  changeTheme: {
    id: 'walletinit.theme.chanageTheme',
    defaultMessage: '!!!Anonymous analytics data',
  },
  continue: {
    id: 'components.walletinit.walletform.continueButton',
    defaultMessage: '!!!Continue',
  },
})
