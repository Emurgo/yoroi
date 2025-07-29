import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {Text} from '~/ui/Text/Text'

type Props = {
  text?: string
  boldText?: boolean
  label?: string
  error?: boolean
  children?: React.ReactNode
}

export const Banner = ({error, text, boldText, label, children}: Props) => {
  const {palette: p} = useTheme()

  const bannerStyles = [
    a.p_lg,
    {alignItems: 'center' as const, justifyContent: 'center' as const},
    {backgroundColor: p.gray_100},
    ...(error === true ? [a.py_sm] : []),
    ...(error === true ? [{backgroundColor: p.bg_color_max}] : []),
  ]

  return (
    <View style={bannerStyles}>
      {label != null && (
        <Text error={error} small style={{marginBottom: 6}}>
          {label}
        </Text>
      )}

      {text != null && (
        <Text
          small={error}
          bold={boldText}
          style={[error != null && {color: p.sys_magenta_500}]}
        >
          {text}
        </Text>
      )}

      {children}
    </View>
  )
}

type ClickableProps = {
  onPress?: () => void
} & Props

export const ClickableBanner = ({onPress, ...rest}: ClickableProps) =>
  onPress ? (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
    >
      <Banner {...rest} />
    </TouchableOpacity>
  ) : (
    <Banner {...rest} />
  )
