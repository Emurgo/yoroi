import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../components'
import {useAuthWithOs} from '../../yoroi-wallets/auth'
import {useAuth} from '../AuthProvider'
import {Logo} from './Logo'

export const OsLoginScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {login} = useAuth()
  const {authWithOs, isLoading} = useAuthWithOs({onSuccess: login})

  return (
    <SafeAreaView edges={['bottom']} style={styles.root}>
      <TopSection />

      <MiddleSection>
        <Logo />
      </MiddleSection>

      <BottomSection>
        <Button title={strings.title} disabled={isLoading} shelleyTheme onPress={() => authWithOs()} />
      </BottomSection>
    </SafeAreaView>
  )
}

const TopSection = () => {
  const {styles} = useStyles()
  return <View style={styles.top} />
}

const MiddleSection = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.middle}>{children}</View>
}

const BottomSection = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.bottom}>{children}</View>
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.common.osloginscreen.button.title',
    defaultMessage: '!!!Login',
  },
})

const useStyles = () => {
  const {theme} = useTheme()
  const {padding} = theme
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      ...padding['l'],
    },
    top: {
      flex: 1,
    },
    middle: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottom: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
  })

  return {styles}
}
