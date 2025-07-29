import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '~/ui/Icon'

type Props = {
  label: string
  disabled?: boolean
}

export const ExpandableItem = ({
  label,
  disabled,
  children,
}: React.PropsWithChildren<Props>) => {
  const {atoms: ta, palette: p} = useTheme()
  const [expanded, setExpanded] = React.useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <TouchableOpacity
      onPress={toggleExpand}
      activeOpacity={0.5}
      disabled={disabled}
    >
      <View style={[a.flex_row, a.align_center, a.justify_center, a.p_md]}>
        <Text style={[disabled ? ta.text_gray_medium : ta.text_gray_max]}>
          {label}
        </Text>

        <Icon.Chevron
          size={23}
          direction={expanded ? 'up' : 'down'}
          color={p.el_gray_medium}
        />
      </View>

      {expanded && <View style={[a.p_lg]}>{children}</View>}
    </TouchableOpacity>
  )
}
