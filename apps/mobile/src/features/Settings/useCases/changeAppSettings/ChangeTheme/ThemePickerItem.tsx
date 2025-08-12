import {atoms as a, ThemeName, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'

type Props = {
  title: ThemeName
}

export const ThemePickerItem = ({title}: Props) => {
  const {palette: p, selectTheme, config} = useTheme()

  const strings = useStrings()
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
    selectTheme(theme)
  }
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => handleSelectTheme(title)}
    >
      <Row>
        <Description>
          <Title>{strings.settings.theme.translateThemeName(title)}</Title>
        </Description>

        <Selected>
          {config === title && <Icon.Check size={24} color={p.primary_600} />}
        </Selected>
      </Row>
    </TouchableOpacity>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()
  return (
    <View
      style={[a.flex_row, {borderBottomColor: p.gray_200}, a.border_b, a.py_lg]}
    >
      {children}
    </View>
  )
}
const Description = ({children}: {children: React.ReactNode}) => {
  return (
    <View
      style={[
        {
          flex: 8,
        },
        a.flex_col,
      ]}
    >
      {children}
    </View>
  )
}
const Selected = ({children}: {children: React.ReactNode}) => {
  return (
    <View
      style={[
        a.align_end,
        a.justify_center,
        {
          flex: 2,
        },
      ]}
    >
      {children}
    </View>
  )
}
const Title = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()
  return (
    <Text
      style={[
        {
          color: p.gray_900,
        },
        a.body_1_lg_medium,
      ]}
    >
      {children}
    </Text>
  )
}
