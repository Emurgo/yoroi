// @flow

import React, {type Node} from 'react'
import {Provider} from 'react-redux'

import {TouchableOpacity} from 'react-native-gesture-handler'
import {defaultNavigationOptions} from '../navigationOptions'
import {Button} from '../components/UiKit'
import iconGear from '../assets/img/gear.png'
import StakeIcon from '../assets/StakingKeyRegisteredIcon'
import configureStore from '../helpers/configureStore'
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
    <TouchableOpacity
      key="navbar-icon-gear"
      // eslint-disable-next-line
      onPress={() => alert('clicked on settings button')}
    >
      <StakeIcon height={36} width={36} color="#323232" />
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
