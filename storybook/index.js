// @flow
import {AppRegistry} from 'react-native'
import React from 'react'
import {getStorybookUI, configure, addDecorator} from '@storybook/react-native'
import {loadStories} from './storyLoader'

import './rn-addons'
import {name as appName} from '../src/app.json'
import CenterView from './stories/CenterView'

// import stories
configure(() => {
  loadStories()
}, module)

addDecorator((storyFn) => <CenterView>{storyFn()}</CenterView>)


// Refer to
// https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI()

AppRegistry.registerComponent(appName, () => StorybookUIRoot)

export default StorybookUIRoot
