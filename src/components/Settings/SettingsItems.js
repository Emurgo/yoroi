// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {TouchableOpacity, View, Image} from 'react-native'
import {useNavigation} from '@react-navigation/native'

import chevronRight from '../../assets/img/chevron_right.png'
import {Text} from '../UiKit'

import type {ComponentType} from 'react'

import styles from './styles/SettingsItems.style'

const Touchable = <Props>(props: Props) => <TouchableOpacity {...props} activeOpacity={0.5} />

type NavigateToProps = {
  to: string,
  navigation: any,
}
const NavigateTo = (compose(
  withHandlers({
    onPress:
      ({to, navigation}: NavigateToProps) =>
      () =>
        navigation.navigate(to),
  }),
)((props) => <Touchable {...props} />): ComponentType<NavigateToProps>)

type SettingsSectionProps = {
  title?: string,
  children: React$Node,
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

type SettingsItemProps = {|
  label: string,
  children: React$Node,
  disabled?: boolean,
|}

export const SettingsItem = ({label, children, disabled}: SettingsItemProps) => (
  <View style={styles.item}>
    <Text style={[styles.label, disabled === true && styles.disabled]}>{label}</Text>
    <View>{children}</View>
  </View>
)

type SettingsBuildItemProps = {|
  label: string,
  value: string,
|}

export const SettingsBuildItem = ({label, value}: SettingsBuildItemProps) => (
  <SettingsItem label={label}>
    <Text small secondary>
      {value}
    </Text>
  </SettingsItem>
)

type NavigatedSettingsItemProps = {|
  label: string,
  navigateTo: string,
  disabled?: boolean,
|}

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

type PressableSettingsItemProps = {|
  label: string,
  onPress: () => any,
|}

export const PressableSettingsItem = ({label, onPress}: PressableSettingsItemProps) => (
  <Touchable onPress={onPress}>
    <SettingsItem label={label}>
      <Image source={chevronRight} />
    </SettingsItem>
  </Touchable>
)
