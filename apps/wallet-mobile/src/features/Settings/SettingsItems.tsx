import _ from 'lodash'
import React, {ReactElement} from 'react'
import {StyleSheet, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Hr, Icon, Spacer, Text} from '../../components'
import {COLORS} from '../../theme'
import {lightPalette} from '../../theme'

const Touchable = (props: TouchableOpacityProps) => <TouchableOpacity {...props} activeOpacity={0.5} />

type SettingsSectionProps = {
  title?: string
  children: React.ReactNode
}

export const SettingsSection = ({title, children}: SettingsSectionProps) => (
  <View style={styles.section}>
    {title != null && (
      <>
        <Text
          style={[
            styles.sectionTitle,
            {fontFamily: 'Rubik-Regular', color: lightPalette.gray['600'], fontSize: 14, lineHeight: 22},
          ]}
        >
          {title}
        </Text>

        <Hr />
      </>
    )}

    <View>{children}</View>
  </View>
)

type SettingsItemProps = {
  label: string
  children: React.ReactNode
  disabled?: boolean
  icon?: ReactElement
  info?: string
}

export const SettingsItem = ({label, children, disabled, icon, info}: SettingsItemProps) => (
  <View>
    <View style={styles.itemInner}>
      <View style={styles.itemMainContent}>
        {icon}

        {icon && <Spacer width={10} />}

        <Text
          style={[
            styles.label,
            disabled && styles.disabled,
            {fontFamily: 'Rubik-Medium', color: lightPalette.gray['900'], fontSize: 16, lineHeight: 24},
          ]}
        >
          {label}
        </Text>

        <View>{children}</View>
      </View>

      {!_.isNil(info) && (
        <>
          <Spacer height={12} />

          <Text
            style={{
              fontFamily: 'Rubik-Regular',
              color: lightPalette.gray['600'],
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            {info}
          </Text>
        </>
      )}
    </View>

    <Hr />
  </View>
)
type NavigatedSettingsItemProps = {
  label: string
  onNavigate: () => void
  icon?: ReactElement
  disabled?: boolean
  selected?: string
}

export const NavigatedSettingsItem = ({label, onNavigate, icon, disabled, selected}: NavigatedSettingsItemProps) => {
  return (
    <Touchable onPress={onNavigate} disabled={disabled}>
      <SettingsItem icon={icon} label={label} disabled={disabled}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {!_.isNil(selected) && (
            <Text
              style={{
                fontFamily: 'Rubik-Regular',
                color: lightPalette.gray['500'],
                fontSize: 16,
                lineHeight: 24,
              }}
            >
              {selected}
            </Text>
          )}

          <Spacer width={16} />

          <Icon.Chevron direction="right" size={28} color={lightPalette.gray['600']} />
        </View>
      </SettingsItem>
    </Touchable>
  )
}

const styles = StyleSheet.create({
  itemInner: {
    paddingVertical: 16,
  },
  itemMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    paddingBottom: 5,
  },
  disabled: {
    color: COLORS.DISABLED,
  },
})
