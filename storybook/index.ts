import './rn-addons'

import AsyncStorage from '@react-native-async-storage/async-storage'
import {addDecorator, configure, getStorybookUI} from '@storybook/react-native'
import {Platform} from 'react-native'

import {withIntl, withCommonNavigation, withRedux} from './decorators'
import {loadStories} from './storyLoader'

configure(() => loadStories(), module)

addDecorator(withRedux)
addDecorator(withCommonNavigation)
addDecorator(withIntl)

// Refer to
// https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI({
  host: Platform.OS === 'android' ? '10.0.2.2' : '0.0.0.0',
  asyncStorage: AsyncStorage,
})

export default StorybookUIRoot

export * from './decorators'
export * from './mocks'
