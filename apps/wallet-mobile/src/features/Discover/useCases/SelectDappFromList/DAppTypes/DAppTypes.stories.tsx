import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {DAppTypes} from './DAppTypes'

storiesOf('Discover DAppTypes', module).add('initial', () => <Initial />)

const Initial = () => {
  return <DAppTypes types={['Category 1', 'Category 2']} onToggle={action('toggle')} selectedTypes={['Category 1']} />
}
