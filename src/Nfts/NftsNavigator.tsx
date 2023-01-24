import {createStackNavigator} from '@react-navigation/stack'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, SearchBar} from '../components'
import {NftRoutes} from '../navigation'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  const strings = useStrings()
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState('')

  const handleClearPress = () => {
    setSearch('')
  }

  const handleBackPress = () => {
    setShowSearch(false)
    setSearch('')
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleContainerStyle: {alignItems: 'center'},
        cardStyle: {backgroundColor: '#fff'},
      }}
      initialRouteName="nfts"
    >
      <Stack.Screen
        name="nfts"
        options={{
          title: strings.title,
          headerTitleAlign: 'center',
          header: showSearch
            ? () => (
                <SearchBar
                  placeholder={strings.search}
                  onChangeText={(search) => setSearch(search)}
                  value={search}
                  onClearPress={handleClearPress}
                  onBackPress={handleBackPress}
                />
              )
            : undefined,
          headerLeft: () => <View style={styles.iconPlaceholder} />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowSearch(true)} style={styles.center}>
              <Icon.Magnify size={26} />
            </TouchableOpacity>
          ),
          headerLeftContainerStyle: {paddingLeft: 16},
          headerRightContainerStyle: {paddingRight: 16},
        }}
      >
        {(props) => <Nfts {...props} search={search} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 26,
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
