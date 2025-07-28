import {getDexUrlByProtocol} from '@yoroi/swap'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {Linking, Text, TouchableOpacity} from 'react-native'

import {ProtocolIcon} from '../ProtocolIcon/ProtocolIcon'

type Props = {
  protocol: Swap.Protocol
  append?: string
  onPress?: () => void
  preventOpenLink?: boolean
}

export const ProtocolAvatar = ({
  protocol,
  append = '',
  onPress,
  preventOpenLink = false,
}: Props) => {
  const {palette: p} = useTheme()
  const formattedName = `${protocol.charAt(0).toUpperCase()}${protocol.slice(1).replace(/-/, ' ')}${append}`

  return (
    <TouchableOpacity
      onPress={
        onPress ?? (() => Linking.openURL(getDexUrlByProtocol(protocol)))
      }
      style={[a.flex_row, a.align_center, a.gap_sm]}
      disabled={preventOpenLink}
    >
      <ProtocolIcon protocol={protocol} size={18} />

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
