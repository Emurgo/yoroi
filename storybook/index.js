// @flow
import {AppRegistry} from 'react-native'
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
let route = {
  params: {},
}
const navigation = {
  navigate: (route, _params) => {
    action(`navigated to ${route}`)
  },
  setParams: (params) => {
    action(params)
  },
  setOptions: (options) => {route = {...route, ...options}},
  addListener: (_fn) => (() => ({})),
}


addDecorator((storyFn) => storyFn({navigation, route}))
addDecorator(withProvider)

// Refer to
// https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI()

AppRegistry.registerComponent(appName, () => StorybookUIRoot)

export default StorybookUIRoot
