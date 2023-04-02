import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {Boundary} from '../../../../../components'
import {defaultStackNavigationOptionsV2, SendRoutes} from '../../../../../navigation'
import {SearchProvider} from '../../../../../Search'
import {useSearchHeaderOptions} from '../../../../../Search/SearchHeader'
import {SelectTokenFromListScreen} from './SelectTokenFromListScreen'

const Stack = createStackNavigator<SendRoutes>()

export const SelectTokenFromListScreenNavigator = () => {
  return (
    <SearchProvider>
      <Routes />
    </SearchProvider>
  )
}

const Routes = () => {
  const strings = useStrings()
  const {searchHeaderOptions} = useSearchHeaderOptions({
    placeHolderText: strings.searchPlaceholder,
    title: strings.searchTitle,
  })

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="send-select-token-from-list"
        options={{
          ...defaultStackNavigationOptionsV2,
          ...searchHeaderOptions,
        }}
      >
        {() => (
          <Boundary>
            <SelectTokenFromListScreen />
          </Boundary>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    searchTitle: intl.formatMessage(messages.searchTitle),
    searchPlaceholder: intl.formatMessage(messages.searchPlaceholder),
  }
}

const messages = defineMessages({
  searchTitle: {
    id: 'components.send.sendscreen.searchTitle',
    defaultMessage: '!!!Select Assets',
  },
  searchPlaceholder: {
    id: 'components.send.sendscreen.searchPlaceholder',
    defaultMessage: '!!!Search Assets',
  },
})
