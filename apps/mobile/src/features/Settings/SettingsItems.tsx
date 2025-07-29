import {atoms as a, useTheme} from '@yoroi/theme'
import React, {ReactElement} from 'react'
import {TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Hr} from '~/ui/Hr/Hr'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {isEmptyString} from '~/wallets/utils/string'

const Touchable = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props} activeOpacity={0.5} />
)

type SettingsSectionProps = {
  title?: string
  children: React.ReactNode
}

export const SettingsSection = ({title, children}: SettingsSectionProps) => {
  const {palette: p} = useTheme()

  return (
    <View>
      {title != null && (
        <>
          <Text style={[a.body_2_md_regular, {color: p.gray_900}]}>
            {title}
          </Text>

          <Space.Height.xs />

          <Hr style={[{height: 1}, {backgroundColor: p.gray_200}]} />
        </>
      )}

      <View>{children}</View>
    </View>
  )
}

type SettingsItemProps = {
  label: string
  children: React.ReactNode
  disabled?: boolean
  icon?: ReactElement
  info?: string
}

export const SettingsItem = ({
  label,
  children,
  disabled,
  icon,
  info,
}: SettingsItemProps) => {
  const {palette: p} = useTheme()

  return (
    <View>
      <View style={a.py_lg}>
        <View style={[a.flex_row, a.justify_between, a.align_center]}>
          {icon}

          {icon && <Space.Width.sm />}

          <Text
            style={[
              a.flex_1,
              a.body_1_lg_medium,
              {color: disabled ? p.gray_500 : p.gray_900},
            ]}
          >
            {label}
          </Text>

          <View>{children}</View>
        </View>

        {!isEmptyString(info) && (
          <>
            <Space.Height.sm />

            <Text style={[a.body_3_sm_regular, {color: p.gray_600}]}>
              {info}
            </Text>
          </>
        )}
      </View>

      <Hr style={[{height: 1}, {backgroundColor: p.gray_200}]} />
    </View>
  )
}
export type NavigatedSettingsItemProps = {
  label: string
  onNavigate: () => void
  icon?: ReactElement
  disabled?: boolean
  selected?: string
}

export const NavigatedSettingsItem = ({
  label,
  onNavigate,
  icon,
  disabled,
  selected,
}: NavigatedSettingsItemProps) => {
  const {palette: p} = useTheme()
  return (
    <Touchable onPress={onNavigate} disabled={disabled}>
      <SettingsItem icon={icon} label={label} disabled={disabled}>
        <View style={[a.flex_row, a.align_center]}>
          {!isEmptyString(selected) && (
            <Text style={[a.body_1_lg_regular, {color: p.gray_500}]}>
              {selected}
            </Text>
          )}

          <Space.Width.md />

          <Icon.Chevron direction="right" size={28} color={p.el_gray_min} />
        </View>
      </SettingsItem>
    </Touchable>
  )
}

type SettingsBuildItemProps = {
  label: string
  value: string
}

export const SettingsBuildItem = ({label, value}: SettingsBuildItemProps) => (
  <SettingsItem label={label}>
    <Text secondary>{value}</Text>
  </SettingsItem>
)
