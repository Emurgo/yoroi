import React from 'react'
import {TextProps} from 'react-native'

import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import {Text} from '../Text'

type Props = TextProps & {
  text: string
}

export const HideableText = ({text, ...props}: Props) => {
  const {isPrivacyActive} = usePrivacyMode()
  const children = !isPrivacyActive ? text : text?.replaceAll(/./g, '\u25CF')

  return <Text {...props}>{children}</Text>
}
