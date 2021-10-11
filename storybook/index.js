// @flow

import './rn-addons'

import AsyncStorage from '@react-native-community/async-storage'
import {addDecorator, configure, getStorybookUI} from '@storybook/react-native'
import {Platform} from 'react-native'

import {withIntlProp, withNavigationProps, withProvider} from './decorators'
import {loadStories} from './storyLoader'

configure(() => loadStories(), module)

addDecorator(withProvider)
addDecorator(withNavigationProps)
addDecorator(withIntlProp)

// Refer to
// https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI({
  host: Platform.OS === 'android' ? '10.0.2.2' : '0.0.0.0',
  asyncStorage: AsyncStorage,
})

export default StorybookUIRoot

export * from './decorators'
export * from './LayoutGrid'
export * from './navigation'
export * from './SafeAreaInsets'
