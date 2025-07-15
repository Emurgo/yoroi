import {atoms as a, useTheme} from '@yoroi/theme'
import React, {ReactElement} from 'react'
import {TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {isEmptyString} from '../../kernel/utils'
import {Hr} from '../../ui/Hr/Hr'
import {Icon} from '../../ui/Icon'
import {Spacer} from '../../ui/Spacer/Spacer'
import {Text} from '../../ui/Text/Text'

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

          <Spacer height={5} />

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
      <View style={[{paddingVertical: 16}]}>
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          ]}
        >
          {icon}

          {icon && <Spacer width={10} />}

          <Text
            style={[
              {flex: 1},
              a.body_1_lg_medium,
              {color: p.gray_900},
              disabled && {color: p.gray_500},
            ]}
          >
            {label}
          </Text>

          <View>{children}</View>
        </View>

        {!isEmptyString(info) && (
          <>
            <Spacer height={12} />

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
        <View style={[{flexDirection: 'row', alignItems: 'center'}]}>
          {!isEmptyString(selected) && (
            <Text style={[a.body_1_lg_regular, {color: p.gray_500}]}>
              {selected}
            </Text>
          )}

          <Spacer width={16} />

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
