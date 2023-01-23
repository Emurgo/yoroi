import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SearchProvider} from './SearchContext'
import {SearchHeader} from './SearchHeader'

storiesOf('Search Header', module)
  .add('Hidden', () => {
    return (
      <SearchProvider value={{visible: false}}>
        <SearchHeader placeholder="Search something" />
      </SearchProvider>
    )
  })
  .add('Visible', () => {
    return (
      <SearchProvider value={{visible: true}}>
        <SearchHeader placeholder="Search something" />
      </SearchProvider>
    )
  })
  .add('With some text', () => {
    return (
      <SearchProvider value={{search: 'Lorem ipsum', visible: true}}>
        <SearchHeader placeholder="Search something" />
      </SearchProvider>
    )
  })
