import {useNavigation} from '@react-navigation/native'
import React, {ReactElement} from 'react'
import {Image, StyleSheet, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import chevronRight from '../assets/img/chevron_right.png'
import {Hr, Icon, Spacer, Text} from '../components'
import {SettingsRouteNavigation, SettingsStackRoutes} from '../navigation'
import {useTheme} from '../theme'

const Touchable = (props: TouchableOpacityProps) => <TouchableOpacity {...props} activeOpacity={0.5} />

type NavigateToProps = {
  to: keyof SettingsStackRoutes
  navigation: SettingsRouteNavigation
  children: React.ReactNode
  disabled?: boolean
}

const NavigateTo = ({navigation, to, ...props}: NavigateToProps) => {
  return <Touchable onPress={() => navigation.navigate(to)} {...props} />
}

type SettingsSectionProps = {
  title?: string
  children: React.ReactNode
}

export const SettingsSection = ({title, children}: SettingsSectionProps) => (
  <View style={styles.section}>
    {title != null && (
      <React.Fragment>
        <Text typography="body-2-regular" gray={600} style={styles.sectionTitle}>
          {title}
        </Text>
        <Hr />
      </React.Fragment>
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
        <Text style={styles.label} disabled={disabled}>
          {label}
        </Text>
        <View>{children}</View>
      </View>

      {info && (
        <React.Fragment>
          <Spacer height={12} />
          <Text typography="body-3-regular" gray={600}>
            {info}
          </Text>
        </React.Fragment>
      )}
    </View>
    <Hr />
  </View>
)

type SettingsBuildItemProps = {
  label: string
  value: string
}

export const SettingsBuildItem = ({label, value}: SettingsBuildItemProps) => (
  <SettingsItem label={label}>
    <Text typography="body-3-regular" secondary={400}>
      {value}
    </Text>
  </SettingsItem>
)

type NavigatedSettingsItemProps = {
  label: string
  navigateTo: keyof SettingsStackRoutes
  icon?: ReactElement
  disabled?: boolean
  selected?: string
}

export const NavigatedSettingsItem = ({label, navigateTo, icon, disabled, selected}: NavigatedSettingsItemProps) => {
  const navigation = useNavigation<SettingsRouteNavigation>()
  const {
    theme: {color},
  } = useTheme()

  return (
    <NavigateTo to={navigateTo} navigation={navigation} disabled={disabled}>
      <SettingsItem icon={icon} label={label} disabled={disabled}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {selected && <Text gray={500}>{selected}</Text>}
          <Spacer width={16} />
          <Icon.Chevron direction="right" size={28} color={color.gray['600']} />
        </View>
      </SettingsItem>
    </NavigateTo>
  )
}

type PressableSettingsItemProps = {
  label: string
  onPress: () => void
  disabled?: boolean
}

export const PressableSettingsItem = ({label, onPress, disabled}: PressableSettingsItemProps) => (
  <Touchable onPress={onPress} disabled={disabled}>
    <SettingsItem label={label}>
      <Image source={chevronRight} />
    </SettingsItem>
  </Touchable>
)

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
})
