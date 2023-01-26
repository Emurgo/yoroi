import {createStackNavigator} from '@react-navigation/stack'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../components'
import {NftRoutes} from '../navigation'
import {SearchHeader, SearchProvider} from '../Search'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  const strings = useStrings()
  const [searchVisible, setSearchVisible] = useState(false)

  return (
    <SearchProvider>
      <Stack.Navigator
        screenOptions={{
          headerTitleContainerStyle: {width: '100%', alignItems: 'center'},
          cardStyle: {backgroundColor: '#fff'},
        }}
        initialRouteName="nfts"
      >
        <Stack.Screen
          name="nfts"
          options={{
            title: strings.title,
            headerTitleAlign: 'center',
            header: searchVisible
              ? () => <SearchHeader placeholder={strings.search} onClose={() => setSearchVisible(false)} />
              : undefined,
            headerLeft: () => <View style={styles.iconPlaceholder} />,
            headerRight: () => (
              <TouchableOpacity onPress={() => setSearchVisible(true)} style={styles.center}>
                <Icon.Magnify size={26} />
              </TouchableOpacity>
            ),
            headerLeftContainerStyle: {paddingLeft: 16},
            headerRightContainerStyle: {paddingRight: 16},
          }}
          component={Nfts}
        />
      </Stack.Navigator>
    </SearchProvider>
  )
}

const styles = StyleSheet.create({
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 0,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    search: intl.formatMessage(messages.search),
  }
}

const messages = defineMessages({
  title: {
    id: 'nft.navigation.title',
    defaultMessage: '!!!NFT Gallery',
  },
  search: {
    id: 'nft.navigation.search',
    defaultMessage: '!!!Search NFT',
  },
})
