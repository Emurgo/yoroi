import {nameServerName} from '@yoroi/resolver'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

export const ShowResolvedAddressSelected = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {targets, selectedTargetIndex} = useTransfer()
  const selectedTarget = targets[selectedTargetIndex]
  const selectedNameServer = selectedTarget?.receiver.selectedNameServer
  const address = selectedTarget?.entry.address ?? ''

  const hide = address.length === 0 || selectedNameServer == null

  const serverName = hide ? null : nameServerName[selectedNameServer]
  const shortenAddress = hide ? '' : shortenString(address)
  const resolvedAddressInfo = hide
    ? ''
    : `${strings.send.resolvedAddress}: ${shortenAddress}`

  // Always render container with fixed height to prevent layout shifts
  // Height = Space._2xs (2px) + text lineHeight (18px) ≈ 20px, using 22px for safety
  return (
    <View style={{minHeight: 22}}>
      <Space.Height._2xs />

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_3_sm_regular, ta.text_gray_max]} numberOfLines={1}>
          {serverName || ''}
        </Text>

        <Text
          style={[a.body_3_sm_regular, ta.text_gray_medium]}
          numberOfLines={1}
        >
          {resolvedAddressInfo}
        </Text>
      </View>
    </View>
  )
}

const shortenString = (text: string) => {
  if (text.length > 16) {
    return text.substring(0, 8) + '...' + text.substring(text.length - 8)
  }
  return text
}
