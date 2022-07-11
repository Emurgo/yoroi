import React from 'react'

import {usePrivacyModeContext} from '../../Settings/PrivacyMode/PrivacyModeContext'
import {Text} from '..'

type Props = {
  children: string
}

export const HideableText = ({children}: Props) => {
  const {privaceModeStatus} = usePrivacyModeContext()
  return <Text>{privaceModeStatus === 'SHOWN' ? children : children.replaceAll(/./g, '*')}</Text>
}
