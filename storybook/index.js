// @flow
import {AppRegistry, Platform} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {getStorybookUI, configure, addDecorator} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import {withProvider} from './decorators'
import {loadStories} from './storyLoader'

import './rn-addons'
import {name as appName} from '../src/app.json'

// import stories
configure(() => {
  loadStories()
}, module)

// mockup navigation prop
// some stories may require specific navigation parameters to work; these should
// be specified locally in the story file
const route = {
  params: {},
}
const navigation = {
  navigate: action('navigate'),
  setParams: action('setParams'),
  setOptions: action('setOptions'),
  addListener: action('addListener'),
}

addDecorator((storyFn) => storyFn({navigation, route}))
addDecorator(withProvider)

// Refer to
// https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI({
  host: Platform.OS === 'android' ? '10.0.2.2' : '0.0.0.0',
  asyncStorage: AsyncStorage,
})

AppRegistry.registerComponent(appName, () => StorybookUIRoot)

export default StorybookUIRoot
