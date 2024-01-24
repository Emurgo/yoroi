import React from 'react'
import {TextProps} from 'react-native'

import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import {Text} from '..'

type Props = TextProps &
  Text['props'] & {
    text: string
  }

export const HideableText = ({text, ...props}: Props) => {
  const {isPrivacyOn} = usePrivacyMode()
  const children = isPrivacyOn ? text : text?.replaceAll(/./g, '\u25CF')

  return <Text {...props}>{children}</Text>
}
