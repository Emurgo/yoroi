import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SearchBar} from './SearchBar'

storiesOf('SearchBar', module)
  .add('With Text', () => (
    <SearchBar
      value="Lorem ipsum"
      onBackPress={action('Back')}
      onClearPress={action('Clear')}
      onChangeText={action('Change')}
      placeholder="Search"
    />
  ))
  .add('With Large Text', () => (
    <SearchBar
      value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies ultricies, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl."
      onBackPress={action('Back')}
      onClearPress={action('Clear')}
      onChangeText={action('Change')}
      placeholder="Search"
    />
  ))
  .add('Without text', () => (
    <SearchBar
      value=""
      onBackPress={action('Back')}
      onClearPress={action('Clear')}
      onChangeText={action('Change')}
      placeholder="Search"
    />
  ))
