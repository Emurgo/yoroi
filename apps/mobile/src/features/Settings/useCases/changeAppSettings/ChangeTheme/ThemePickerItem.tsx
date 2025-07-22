import {atoms as a, ThemeName, useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {themeNames} from '../../../../../kernel/i18n/global-messages'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {Icon} from '../../../../../ui/Icon'
import {Text} from '../../../../../ui/Text/Text'
import {useThemeStorageMaker} from '../../../../../wallets/hooks'

type Props = {
  title: ThemeName
  selectTheme: (name: ThemeName) => void
  setLocalTheme: (name: ThemeName) => void
}

export const ThemePickerItem = ({title, selectTheme, setLocalTheme}: Props) => {
  const {colors} = useStyles()
  const strings = useStrings()
  const themeStorage = useThemeStorageMaker()
  const {track} = useMetrics()

  const handleSelectTheme = (theme: ThemeName) => {
    track.themeSelected({
      theme:
        theme === 'default-light'
          ? 'light'
          : theme === 'default-dark'
            ? 'dark'
            : 'auto',
    })
    setLocalTheme(theme)
    selectTheme(theme)
  }
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => handleSelectTheme(title)}
    >
      <Row>
        <Description>
          <Title>{strings.translateThemeName(title)}</Title>
        </Description>

        <Selected>
          {themeStorage.read() === title && (
            <Icon.Check size={24} color={colors.checkIcon} />
          )}
        </Selected>
      </Row>
    </TouchableOpacity>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.row}>{children}</View>
}
const Description = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.description}>{children}</View>
}
const Selected = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.flag}>{children}</View>
}
const Title = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <Text style={styles.bodyMedium}>{children}</Text>
}

const useStyles = () => {
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      borderBottomColor: p.gray_200,
      borderBottomWidth: 1,
      ...a.py_lg,
    },
    flag: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      flex: 2,
    },
    description: {
      flex: 8,
      flexDirection: 'column',
    },
    bodyMedium: {
      color: p.gray_900,
      ...a.body_1_lg_medium,
    },
  })
  const colors = {
    checkIcon: p.primary_600,
  }
  return {styles, colors}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    translateThemeName: (theme: ThemeName) =>
      intl.formatMessage(themeNames[theme]),
  }
}
