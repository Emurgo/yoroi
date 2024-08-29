import {isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Icon} from '../Icon'
import {Spacer} from '../Spacer'

export type ExpandableInfoCardProps = {
  info: React.ReactNode
  expanded?: boolean
  children?: React.ReactNode
  header: React.ReactNode
  footer?: React.ReactNode
  withBoxShadow?: boolean
}

export const ExpandableInfoCard = ({
  children,
  expanded,
  info,
  header,
  withBoxShadow = false,
  footer,
}: ExpandableInfoCardProps) => {
  const {styles} = useStyles()

  return (
    <View>
      <Spacer height={8} />

      <View style={[styles.container, withBoxShadow && styles.shadowProp]}>
        {header}

        {children !== undefined && (
          <>
            <Spacer height={8} />

            {children}
          </>
        )}

        {expanded && (
          <>
            <Spacer height={8} />

            {info}
          </>
        )}

        {footer !== undefined && (
          <>
            <Spacer height={8} />

            {footer}
          </>
        )}
      </View>

      <Spacer height={8} />
    </View>
  )
}

export const HeaderWrapper = ({
  children,
  expanded,
  onPress,
}: {
  children: React.ReactNode
  expanded?: boolean
  onPress: () => void
}) => {
  const {styles, colors} = useStyles()

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.flexBetween}>
        {children}

        {expanded ? (
          <Icon.Chevron direction="up" color={colors.gray} size={24} />
        ) : (
          <Icon.Chevron color={colors.gray} direction="down" size={24} />
        )}
      </View>
    </TouchableOpacity>
  )
}

export const Footer = ({
  children,
  onPress,
  disabled,
}: {
  children: React.ReactNode
  onPress: () => void
  disabled?: boolean
}) => {
  const {styles} = useStyles()
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text style={[styles.buttonLabel, disabled && styles.footerDisabled]}>{children}</Text>
    </TouchableOpacity>
  )
}

export const HiddenInfoWrapper = ({
  label,
  info,
  onPress,
  value,
  icon,
}: {
  label: string
  info?: React.ReactNode
  onPress?: () => void
  value: React.ReactNode
  icon?: React.ReactNode
}) => {
  const {styles, colors} = useStyles()
  return (
    <View>
      <View style={styles.flexBetween}>
        <View style={styles.flex}>
          <Text style={[styles.text, styles.gray]}>{label}</Text>

          <Spacer width={8} />

          {info !== undefined && (
            <TouchableOpacity onPress={onPress}>
              <Icon.Info color={colors.gray} size={24} />
            </TouchableOpacity>
          )}
        </View>

        <Spacer width={5} />

        {isString(value) ? (
          <View style={styles.flex}>
            {icon !== undefined && (
              <View style={styles.flex}>
                {icon}

                <Spacer width={6} />
              </View>
            )}

            <Text style={styles.text}>{value}</Text>
          </View>
        ) : (
          value
        )}
      </View>

      <Spacer height={8} />
    </View>
  )
}

export const MainInfoWrapper = ({label, value, isLast = false}: {label: string; value?: string; isLast?: boolean}) => {
  const {styles} = useStyles()
  return (
    <View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>

        {isString(value) && <Text style={styles.value}>{value}</Text>}
      </View>

      {!isLast && <Spacer height={8} />}
    </View>
  )
}

export const ExpandableInfoCardSkeleton = () => {
  const {colors} = useStyles()

  return (
    <SkeletonPlaceholder backgroundColor={colors.skeletonBackground}>
      <View style={{height: 160, borderRadius: 8}}></View>
    </SkeletonPlaceholder>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.p_lg,
      borderColor: color.gray_200,
      backgroundColor: color.bg_color_max,
      borderRadius: 8,
      borderWidth: 1,
      width: '100%',
      height: 'auto',
    },
    shadowProp: {
      backgroundColor: color.bg_color_max,
      shadowColor: color.gray_max,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,

      elevation: 2,
      borderWidth: 0,
    },
    flexBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    flex: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      textAlign: 'left',
      ...atoms.body_1_lg_regular,
      color: color.gray_max,
    },
    gray: {
      color: color.gray_600,
      ...atoms.body_1_lg_regular,
    },
    buttonLabel: {
      paddingTop: 13,
      color: color.gray_max,
      ...atoms.body_2_md_medium,
    },
    info: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    value: {
      textAlign: 'right',
      flexShrink: 1,
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
    label: {
      color: color.gray_600,
      paddingRight: 8,
      ...atoms.body_1_lg_regular,
    },
    footerDisabled: {
      opacity: 0.5,
    },
  })

  const colors = {
    skeletonBackground: color.gray_200,
    gray: color.gray_max,
  }

  return {styles, colors}
}
