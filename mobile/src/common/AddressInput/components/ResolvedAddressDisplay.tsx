import {nameServerName} from '@yoroi/resolver'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Resolver} from '@yoroi/types'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

type ResolvedAddressDisplayProps = {
  resolvedAddress: string | null
  selectedNameServer: Resolver.NameServer | null
}

export const ResolvedAddressDisplay = ({
  resolvedAddress,
  selectedNameServer,
}: ResolvedAddressDisplayProps) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  // Show resolved address if we have one
  // For domains/handles: show nameServer + resolved address
  // For direct addresses: show just the resolved address (when validated)
  const hide = resolvedAddress == null

  const serverName =
    hide || selectedNameServer == null
      ? null
      : nameServerName[selectedNameServer]
  const shortenAddress = hide ? '' : shortenString(resolvedAddress ?? '')
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
