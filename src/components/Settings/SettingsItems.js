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

export const NavigationWrapper = compose(
  withNavigation,
  withHandlers({
    onPress: ({navigation, dstScreen}) => () => navigation.navigate(dstScreen),
  }),
)(TouchableComponent)

export const UrlWrapper = withHandlers({
  onPress: ({dstUrl}) => () => Linking.openURL(dstUrl),
})(TouchableComponent)

export const ItemIcon = () => (
  <CopyIcon width={styles.icon.size} height={styles.icon.size} />
)

export const ItemLink = ({label}) => <Text style={styles.link}>{label}</Text>

export const ItemToggle = ({value, onToggle}) => (
  <Switch value={value} onValueChange={onToggle} />
)

export const SettingsItem = ({title, description, children}) => (
  <View style={styles.itemContainer}>
    <View style={styles.descriptionContainer}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
    <View style={styles.iconContainer}>{children}</View>
  </View>
)

export const SettingsLink = ({label, dstScreen}) => (
  <View style={styles.linkContainer}>
    <NavigationWrapper dstScreen={dstScreen}>
      <ItemLink label={label} />
    </NavigationWrapper>
  </View>
)
