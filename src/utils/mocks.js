// @flow

import React, {type Node} from 'react'
import {Provider} from 'react-redux'

import {defaultNavigationOptions} from '../navigationOptions'
import {Button} from '../components/UiKit'
import iconGear from '../assets/img/gear.png'
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

export const mockScreenWithSettingsOption = (title: string = '') => ({
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
})
