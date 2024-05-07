import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Switch, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Button, Text} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {ThemeIlustration} from '../../illustrations/ThemeIlustration'

export const DarkThemeAnnouncement = () => {
  const {styles, color} = useStyles()
  const strings = useStrings()
  const {isLight, selectThemeName} = useTheme()

  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} ref={scrollViewRef} persistentScrollbar={true} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <Space height="md" />

          <ThemeIlustration />

          <Space height="_2xl" />

          <Text style={styles.title}>{strings.header}</Text>

          <Text style={styles.description}>{strings.description}</Text>

          <View style={styles.toggle}>
            <Switch
              value={isLight === false}
              onValueChange={() => selectThemeName(isLight === true ? 'default-dark' : 'default-light')}
              trackColor={{false: color.gray_c100, true: color.gray_c100}}
              thumbColor={isLight === true ? color.sys_yellow_c500 : color.el_primary_medium}
            />
          </View>

          <Text style={styles.caption}>{strings.changeTheme}</Text>
        </View>
      </ScrollView>

      <Button title={strings.continue} shelleyTheme />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    content: {
      alignItems: 'center',
      paddingTop: 60,
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
      paddingBottom: 44,
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
