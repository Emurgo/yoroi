import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {DAppTypes} from './DAppTypes'
import {action} from '@storybook/addon-actions'

storiesOf('Discover DAppTypes', module).add('initial', () => <Initial />)

const Initial = () => {
  return (
    <DAppTypes
      types={['Category 1', 'Category 2']}
      onToggle={action('toggle')}
      listCategoriesSelected={['Category 1']}
    />
  )
}
