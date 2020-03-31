// @flow
import {AppRegistry} from 'react-native'
import {getStorybookUI, configure, addDecorator} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'
import {loadStories} from './storyLoader'

import './rn-addons'
import {name as appName} from '../src/app.json'

// import stories
configure(() => {
  loadStories()
}, module)

// mockup navigation prop
const navigation = {
  navigate: (route, params) => {
    action('navigated!')
    // console.log('navigated!')
  },
  setParams: (params) => {
    action(params)
    // console.log(params)
  },
  getParam: (param) => ({param: true}),
}

addDecorator((storyFn) => storyFn({navigation}))

// Refer to
// https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI()

AppRegistry.registerComponent(appName, () => StorybookUIRoot)

export default StorybookUIRoot
