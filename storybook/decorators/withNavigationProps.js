// @flow

import {action} from '@storybook/addon-actions'

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

type NavigationProps = {navigation: typeof navigation, route: typeof route}
type StoryFn = (navigationProps: NavigationProps) => any

export const withNavigationProps = (storyFn: StoryFn) => storyFn({navigation, route})
