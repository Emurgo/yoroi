import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {TouchableOpacity, View, Image} from 'react-native'
import {withNavigation} from 'react-navigation'

import chevronRight from '../../assets/img/chevron_right.png'
import {Text} from '../UiKit'

import styles from './styles/SettingsItems.style'

const Touchable = (props) => <TouchableOpacity activeOpacity={0.5} {...props} />

const NavigateTo = compose(
  withNavigation,
  withHandlers({
    onPress: ({navigation, to}) => () => navigation.navigate(to),
  }),
)((props) => <Touchable {...props} />)

type SettingsSectionProps = {
  title?: string,
  children: React.Node,
}

export const SettingsSection = ({title, children}: SettingsSectionProps) => (
  <View style={styles.section}>
    {!!title && <Text style={styles.sectionTitle}>{title}</Text>}
    <View style={styles.sectionContent}>{children}</View>
  </View>
)

type SettingsItemProps = {
  label: string,
  children: React.Node,
}

export const SettingsItem = ({label, children}: SettingsItemProps) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.iconContainer}>{children}</View>
  </View>
)

type NavigatedSettingsItemProps = {
  label: string,
  navigateTo: string,
}

export const NavigatedSettingsItem = ({
  label,
  navigateTo,
}: NavigatedSettingsItemProps) => (
  <NavigateTo to={navigateTo}>
    <SettingsItem label={label}>
      <Image source={chevronRight} />
    </SettingsItem>
  </NavigateTo>
)

type PressableSettingsItemProps = {
  label: string,
  onPress: () => any,
}

export const PressableSettingsItem = ({
  label,
  onPress,
}: PressableSettingsItemProps) => (
  <Touchable onPress={onPress}>
    <SettingsItem label={label}>
      <Image source={chevronRight} />
    </SettingsItem>
  </Touchable>
)
