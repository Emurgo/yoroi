import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {BrowserSearchToolbar} from './BrowserSearchToolbar'

storiesOf('Discover BrowserSearchToolbar', module).add('initial', () => <Initial />)

const Initial = () => {
  const [_searchValue, setSearchValue] = React.useState('')

  return (
    <BrowserSearchToolbar
      onBack={action('onPress')}
      searchValue="Google"
      onSearchChange={(value) => setSearchValue(value)}
      onSearchSubmit={action('onPress')}
    />
  )
}
