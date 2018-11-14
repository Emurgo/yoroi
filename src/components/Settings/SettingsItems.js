import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {Linking, Switch, TouchableHighlight, View} from 'react-native'
import {withNavigation} from 'react-navigation'

import CopyIcon from '../../assets/CopyIcon'
import {Text} from '../UiKit'
import {COLORS} from '../../styles/config'

import styles from './styles/SettingsItems.style'

const TouchableComponent = ({onPress, children}) => (
  <TouchableHighlight
    activeOpacity={0.9}
    underlayColor={COLORS.WHITE}
    onPress={onPress}
  >
    {children}
  </TouchableHighlight>
)

export const NavigateTo = compose(
  withNavigation,
  withHandlers({
    onPress: ({navigation, screen}) => () => navigation.navigate(screen),
  }),
)(TouchableComponent)

export const LinkTo = withHandlers({
  onPress: ({url}) => () => Linking.openURL(url),
})(TouchableComponent)

export const ItemIcon = () => (
  <CopyIcon width={styles.icon.size} height={styles.icon.size} />
)

export const ItemLink = ({label}) => <Text style={styles.link}>{label}</Text>

export const ItemToggle = ({value, onToggle, disabled}) => (
  <Switch value={value} onValueChange={onToggle} disabled={disabled} />
)

type SettingsSectionProps = {
  title?: string,
  children: React.Node,
}

export const SettingsSection = ({title, children}: SettingsSectionProps) => (
  <View style={styles.sectionContainer}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View>{children}</View>
  </View>
)

type SettingsItemProps = {
  title?: string,
  description: string,
  children: React.Node,
}

export const SettingsItem = ({
  title,
  description,
  children,
}: SettingsItemProps) => (
  <View style={styles.itemContainer}>
    <View style={styles.descriptionContainer}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
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
  <SettingsItem description={label}>
    <NavigateTo screen={navigateTo}>
      <ItemIcon />
    </NavigateTo>
  </SettingsItem>
)
