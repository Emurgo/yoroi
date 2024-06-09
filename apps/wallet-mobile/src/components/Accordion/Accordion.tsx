import {isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React, {forwardRef, ReactNode} from 'react'
import {type ViewProps, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../Icon'

export interface AccordionProps extends ViewProps {
  /** Label for header of the accordion */
  label: ReactNode
  /** State of the accordion: true === show content */
  expanded?: boolean
  /** Trigger when header is pressed */
  onChange: (expanded: boolean) => void

  wrapperStyle?: ViewProps['style']
}

export const Accordion = forwardRef<View, AccordionProps>((props, ref) => {
  const {style, label, onChange, wrapperStyle, expanded = false, children, ...etc} = props

  const {styles} = useStyles()

  const handleToggle = () => {
    onChange(!expanded)
  }

  return (
    <View ref={ref} style={[styles.root, style]} {...etc}>
      {/* Header */}
      <AccordionHeader expanded={expanded} onPress={handleToggle}>
        {label}
      </AccordionHeader>

      {/* Content */}
      {expanded && (
        <View style={[styles.content, expanded ? styles.visible : styles.hidden, wrapperStyle]}>{children}</View>
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
  const {styles} = useStyles()

  return (
    <TouchableOpacity onPress={onPress} style={styles.header}>
      <View style={styles.headerLabelContainer}>
        {isString(children) ? <Text style={styles.headerLabel}>{children}</Text> : children}
      </View>

      {expanded ? <Icon.Chevron direction="up" size={24} /> : <Icon.Chevron direction="down" size={24} />}
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.gray_cmin,
    },
    header: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
      minHeight: 24,
    },
    headerLabelContainer: {
      ...atoms.flex_1,
    },
    headerLabel: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_c800,
    },
    content: {
      ...atoms.flex_1,
      ...atoms.pt_lg,
    },
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  })

  return {styles} as const
}
