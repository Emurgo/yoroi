import {getDexUrlByProtocol} from '@yoroi/swap'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'

import * as React from 'react'
import {Linking, Text, TouchableOpacity} from 'react-native'

import {ProtocolIcon} from '../ProtocolIcon/ProtocolIcon'

type Props = {
  protocol: Swap.Protocol
  fallbackImageUrl?: string
  nameOverride?: string
  append?: string
  onPress?: () => void
  preventOpenLink?: boolean
}

export const ProtocolAvatar = ({
  protocol,
  fallbackImageUrl,
  nameOverride,
  append = '',
  onPress,
  preventOpenLink = false,
}: Props) => {
  const {palette: p} = useTheme()
  const defaultName = `${protocol.charAt(0).toUpperCase()}${protocol.slice(1).replace(/-/, ' ')}${append}`
  const formattedName = nameOverride ?? defaultName

  return (
    <TouchableOpacity
      onPress={
        onPress ?? (() => Linking.openURL(getDexUrlByProtocol(protocol)))
      }
      style={[a.flex_row, a.align_center, a.gap_sm]}
      disabled={preventOpenLink}
    >
      <ProtocolIcon
        protocol={protocol}
        size={18}
        fallbackImageUrl={fallbackImageUrl}
      />

      <Text
        style={[
          a.body_1_lg_regular,
          {color: p.text_gray_medium},
          !preventOpenLink && a.body_1_lg_medium,
          !preventOpenLink && {color: p.text_primary_medium},
        ]}
      >
        {formattedName}
      </Text>
    </TouchableOpacity>
  )
}
