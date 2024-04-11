import {boolean, text} from '@storybook/addon-knobs'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ExpandableItem} from './ExpandableItem'

storiesOf('ExpandableItem', module).add('Default', () => (
  <ExpandableItem
    content={text('Content', 'This is the content')}
    label={text('label', 'This is a label')}
    disabled={boolean('disabled', false)}
  />
))
