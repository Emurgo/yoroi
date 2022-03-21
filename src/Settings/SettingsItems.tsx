import {NavigationProp, useNavigation} from '@react-navigation/native'
import React from 'react'
import {Image, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import chevronRight from '../../legacy/assets/img/chevron_right.png'
import styles from '../../legacy/components/Settings/styles/SettingsItems.style'
import {Text} from '../../legacy/components/UiKit'

const Touchable = (props: TouchableOpacityProps) => <TouchableOpacity {...props} activeOpacity={0.5} />

type NavigateToProps = {
  to: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: NavigationProp<any>
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
      <Text small secondary style={styles.sectionTitle}>
        {title}
      </Text>
    )}
    <View style={styles.sectionContent}>{children}</View>
  </View>
)

type SettingsItemProps = {
  label: string
  children: React.ReactNode
  disabled?: boolean
}

export const SettingsItem = ({label, children, disabled}: SettingsItemProps) => (
  <View style={styles.item}>
    <Text style={[styles.label, disabled === true && styles.disabled]}>{label}</Text>
    <View>{children}</View>
  </View>
)

type SettingsBuildItemProps = {
  label: string
  value: string
}

export const SettingsBuildItem = ({label, value}: SettingsBuildItemProps) => (
  <SettingsItem label={label}>
    <Text small secondary>
      {value}
    </Text>
  </SettingsItem>
)

type NavigatedSettingsItemProps = {
  label: string
  navigateTo: string
  disabled?: boolean
}

export const NavigatedSettingsItem = ({label, navigateTo, disabled}: NavigatedSettingsItemProps) => {
  const navigation = useNavigation()
  return (
    <NavigateTo to={navigateTo} navigation={navigation} disabled={disabled}>
      <SettingsItem label={label} disabled={disabled}>
        <Image source={chevronRight} />
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
