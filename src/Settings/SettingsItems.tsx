import {NavigationProp, useNavigation} from '@react-navigation/native'
import React from 'react'
import {Image, StyleSheet, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import chevronRight from '../../legacy/assets/img/chevron_right.png'
import {COLORS} from '../../legacy/styles/config'
import {Text} from '../components'

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

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  label: {
    flex: 1,
  },
  disabled: {
    color: COLORS.DISABLED,
  },
  section: {
    marginTop: 16,
  },
  sectionContent: {
    marginHorizontal: 16,
    elevation: 1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 12,
    shadowOpacity: 0.06,
    shadowColor: 'black',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 5,
    paddingHorizontal: 28,
  },
})
