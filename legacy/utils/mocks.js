// @flow

import React, {type Node} from 'react'
import {TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {Provider} from 'react-redux'

import iconGear from '../assets/img/gear.png'
import {Button} from '../components/UiKit'
import configureStore from '../helpers/configureStore'
import {defaultNavigationOptions} from '../navigationOptions'
import type {State} from '../state'

type Props = {|
  +children?: Node,
  +mockedState?: State,
|}

export const MockAppStateWrapper = ({children, mockedState = {}}: Props) => {
  const store = configureStore(true, true, mockedState)
  return <Provider store={store}>{children}</Provider>
}

export const mockScreenWithSettingsOption = (title: string = '', options: mixed) => ({
  title,
  headerRight: () => (
    <Button
      // eslint-disable-next-line
      style={{height: '80%'}}
      // eslint-disable-next-line
      onPress={() => alert('clicked on settings button')}
      iconImage={iconGear}
      title=""
      withoutBackground
    />
  ),
  ...defaultNavigationOptions,
  ...options,
})

type MockedOptionsV2 = 'settings'
const V2_ITEMS = new Map<MockedOptionsV2, React$Node>([
  [
    'settings',
    <TouchableOpacity style={{paddingRight: 5}} key="menu-dot" onPress={() => alert('clicked on settings button')}>
      <Icon name="dots-vertical" size={30} color="#8A92A3" />
    </TouchableOpacity>,
  ],
])

export const mockV2NavigatorOptions = (options: mixed, mocks: Array<MockedOptionsV2> = []) => ({
  headerRight: () => {
    const components = mocks.map((mock) => V2_ITEMS.get(mock))
    return <>{components}</>
  },
  ...defaultNavigationOptions,
  ...options,
})
