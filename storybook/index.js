// @flow

import {Platform} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {getStorybookUI, configure, addDecorator} from '@storybook/react-native'

import {withProvider, withNavigationProps} from './decorators'
import {loadStories} from './storyLoader'
import './rn-addons'

configure(() => loadStories(), module)

addDecorator(withProvider)
addDecorator(withNavigationProps)

// Refer to
// https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI({
  host: Platform.OS === 'android' ? '10.0.2.2' : '0.0.0.0',
  asyncStorage: AsyncStorage,
})

export default StorybookUIRoot

export * from './decorators'
