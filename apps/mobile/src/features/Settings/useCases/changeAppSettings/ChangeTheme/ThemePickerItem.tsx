import {atoms as a, SupportedThemes, useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {TouchableOpacity, View} from 'react-native'

import {themeNames} from '~/~/kernel/i18n/global-messages'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'
import {useThemeStorageMaker} from '~/wallets/hooks'

type Props = {
  title: SupportedThemes
  selectTheme: (name: SupportedThemes) => void
  setLocalTheme: (name: SupportedThemes) => void
}

export const ThemePickerItem = ({title, selectTheme, setLocalTheme}: Props) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const themeStorage = useThemeStorageMaker()
  const {track} = useMetrics()

  const handleSelectTheme = (theme: SupportedThemes) => {
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
            <Icon.Check size={24} color={p.primary_600} />
          )}
        </Selected>
      </Row>
    </TouchableOpacity>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const {atoms: ta, palette: p} = useTheme()
  return (
    <View
      style={[
        a.flex_row,
        {borderBottomColor: p.gray_200},
        {borderBottomWidth: 1},
        a.py_lg,
      ]}
    >
      {children}
    </View>
  )
}

const Description = ({children}: {children: React.ReactNode}) => {
  const {atoms: ta, palette: p} = useTheme()
  return <View style={[{flex: 8}, {flexDirection: 'column'}]}>{children}</View>
}

const Selected = ({children}: {children: React.ReactNode}) => {
  const {atoms: ta, palette: p} = useTheme()
  return (
    <View style={[a.align_end, a.justify_center, {flex: 2}]}>{children}</View>
  )
}

const Title = ({children}: {children: React.ReactNode}) => {
  const {atoms: ta, palette: p} = useTheme()
  return (
    <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>{children}</Text>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    translateThemeName: (theme: SupportedThemes) =>
      intl.formatMessage(themeNames[theme]),
  }
}
