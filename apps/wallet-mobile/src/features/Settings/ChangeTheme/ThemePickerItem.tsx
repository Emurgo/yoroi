import {SupportedThemes, useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {Text} from '../../../components/Text'
import {themeNames} from '../../../kernel/i18n/global-messages'
import {useThemeStorageMaker} from '../../../yoroi-wallets/hooks'

type Props = {
  title: SupportedThemes
  selectTheme: (name: SupportedThemes) => void
  setLocalTheme: (name: SupportedThemes) => void
}

export const ThemePickerItem = ({title, selectTheme, setLocalTheme}: Props) => {
  const {colors} = useStyles()
  const strings = useStrings()
  const themeStorage = useThemeStorageMaker()

  const handleSelectTheme = (theme: SupportedThemes) => {
    setLocalTheme(theme)
    selectTheme(theme)
  }
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={() => handleSelectTheme(title)}>
      <Row>
        <Description>
          <Title>{strings.translateThemeName(title)}</Title>
        </Description>

        <Selected>{themeStorage.read() === title && <Icon.Check size={24} color={colors.checkIcon} />}</Selected>
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
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      borderBottomColor: color.gray_200,
      borderBottomWidth: 1,
      ...atoms.py_lg,
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
      color: color.gray_900,
      ...atoms.body_1_lg_medium,
    },
  })
  const colors = {
    checkIcon: color.primary_600,
  }
  return {styles, colors}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    translateThemeName: (theme: SupportedThemes) => intl.formatMessage(themeNames[theme]),
  }
}
