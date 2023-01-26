import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SearchProvider} from './SearchContext'
import {SearchHeader} from './SearchHeader'

storiesOf('Search Header', module).add('With some text', () => {
  return (
    <SearchProvider value={{search: 'Lorem ipsum'}}>
      <SearchHeader placeholder="Search something" />
    </SearchProvider>
  )
})
