import React from 'react'

import {usePrivacyModeContext} from '../../Settings/PrivacyMode/PrivacyModeContext'
import {Text} from '..'

type Props = {
  children: string
}

export const HideableText = ({children, ...props}: Props) => {
  const {privaceModeStatus} = usePrivacyModeContext()
  return <Text {...props}>{privaceModeStatus === 'SHOWN' ? children : children.replaceAll(/./g, '\u25CF')}</Text>
}
