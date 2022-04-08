/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {Provider} from 'react-redux'

import iconGear from '../../assets/img/gear.png'
import {Button} from '../../components'
import configureStore from '../../legacy/configureStore'
import type {State} from '../../legacy/state'
import {defaultNavigationOptions} from '../../navigationOptions'

type Props = {
  children?: React.ReactNode
  mockedState?: State
}

export const MockAppStateWrapper = ({children, mockedState = {} as any}: Props) => {
  const store = configureStore(true, true, mockedState)
  return <Provider store={store}>{children}</Provider>
}

export const mockScreenWithSettingsOption = (title = '', options: any) => ({
  title,
  headerRight: () => (
    <Button
      // eslint-disable-next-line
      style={{height: '80%'}}
      // eslint-disable-next-line
      onPress={() => console.log('clicked on settings button')}
      iconImage={iconGear}
      title=""
      withoutBackground
    />
  ),
  ...defaultNavigationOptions,
  ...options,
})

type MockedOptionsV2 = 'settings'
const V2_ITEMS = new Map<MockedOptionsV2, React.ReactNode>([
  [
    'settings',
    <TouchableOpacity
      style={{paddingRight: 5}}
      key="menu-dot"
      onPress={() => console.log('clicked on settings button')}
    >
      <Icon name="dots-vertical" size={30} color="#8A92A3" />
    </TouchableOpacity>,
  ],
])

export const mockV2NavigatorOptions = (options: any, mocks: Array<MockedOptionsV2> = []) => ({
  headerRight: () => {
    const components = mocks.map((mock) => V2_ITEMS.get(mock))
    return <>{components}</>
  },
  ...defaultNavigationOptions,
  ...options,
})
