import {isString} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import React, {forwardRef, ReactNode} from 'react'
import {type ViewProps, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../Icon'

interface AccordionProps extends ViewProps {
  /** Label for header of the accordion */
  label: ReactNode
  /** State of the accordion: true === show content */
  expanded?: boolean
  /** Trigger when header is pressed */
  onChange: (expanded: boolean) => void
  /** Style for the content wrapper */
  wrapperStyle?: ViewProps['style']
}

export const Accordion = forwardRef<View, AccordionProps>((props, ref) => {
  const {style, label, onChange, wrapperStyle, expanded = false, children, ...etc} = props

  const {atoms: ta, palette: p} = useTheme()

  const handleToggle = () => {
    onChange(!expanded)
  }

  return (
    <View ref={ref} style={[{backgroundColor: p.bg_color_max}, a.flex_1, style]} {...etc}>
      {/* Header */}
      <AccordionHeader expanded={expanded} onPress={handleToggle}>
        {label}
      </AccordionHeader>

      {/* Content */}
      {expanded && (
        <View style={[a.flex_1, a.pt_lg, wrapperStyle]}>{children}</View>
      )}
    </View>
  )
})

const AccordionHeader = ({
  children,
  expanded,
  onPress,
}: {
  children: React.ReactNode
  expanded?: boolean
  onPress: () => void
}) => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <TouchableOpacity onPress={onPress} style={[ta.flex_row, ta.justify_between, ta.align_center, {minHeight: 24}]}>
      <View style={ta.flex_1}>
        {isString(children) ? (
          <Text style={[a.body_1_lg_medium, a.font_semibold, {color: p.gray_800}]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>

      {expanded ? (
        <Icon.Chevron color={p.gray_800} direction="up" size={24} />
      ) : (
        <Icon.Chevron color={p.gray_800} direction="down" size={24} />
      )}
    </TouchableOpacity>
  )
} 