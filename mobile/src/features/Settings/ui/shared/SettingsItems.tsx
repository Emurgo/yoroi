import {isEmptyString} from '@yoroi/cardano-wallet/utils/string'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {Hr} from '~/ui/Hr/Hr'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'

type SettingsSectionProps = React.PropsWithChildren<{
  title?: string
}>

export const SettingsSection = ({title, children}: SettingsSectionProps) => {
  const {palette: p, atoms: ta} = useTheme()

  return (
    <View>
      {title != null && (
        <View style={a.gap_xs}>
          <Text style={[a.body_2_md_regular, ta.text_gray_max]}>{title}</Text>

          <Hr color={p.gray_200} />
        </View>
      )}

      {children}
    </View>
  )
}

type SettingsItemProps = React.PropsWithChildren<{
  label: string
  disabled?: boolean
  icon?: React.ReactElement
  info?: string
}>

export const SettingsItem = ({
  label,
  children,
  disabled,
  icon,
  info,
}: SettingsItemProps) => {
  const {palette: p, atoms: ta} = useTheme()

  return (
    <View>
      <View style={[a.py_lg, a.gap_sm]}>
        <View style={[a.flex_row, a.justify_between, a.align_center, a.gap_sm]}>
          {icon}

          <Text
            style={[
              a.flex_1,
              a.body_1_lg_medium,
              ta.text_gray_max,
              disabled && ta.text_gray_medium,
            ]}
          >
            {label}
          </Text>

          <View>{children}</View>
        </View>

        {!isEmptyString(info) && (
          <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>{info}</Text>
        )}
      </View>

      <Hr color={p.gray_200} />
    </View>
  )
}
export type NavigatedSettingsItemProps = {
  label: string
  onNavigate: () => void
  icon?: React.ReactElement
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
  const {palette: p, atoms: ta} = useTheme()
  return (
    <TouchableOpacity onPress={onNavigate} disabled={disabled}>
      <SettingsItem icon={icon} label={label} disabled={disabled}>
        <View style={[a.flex_row, a.align_center, a.gap_md]}>
          {!isEmptyString(selected) && (
            <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
              {selected}
            </Text>
          )}

          <Icon.Chevron direction="right" size={28} color={p.el_gray_min} />
        </View>
      </SettingsItem>
    </TouchableOpacity>
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
