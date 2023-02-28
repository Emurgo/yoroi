import {createStackNavigator} from '@react-navigation/stack'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon, Spacer} from '../components'
import {NftRoutes} from '../navigation'
import {SearchHeader, SearchProvider, useSearch} from '../Search'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  return (
    <SearchProvider>
      <Routes />
    </SearchProvider>
  )
}

const Routes = () => {
  const strings = useStrings()
  const [searchVisible, setSearchVisible] = useState(false)
  const {clearSearch} = useSearch()
  const handleSearchClose = () => {
    setSearchVisible(false)
    clearSearch()
  }
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleContainerStyle: {flex: 1, alignItems: 'center'},
        cardStyle: {backgroundColor: '#fff'},
      }}
      initialRouteName="nft-gallery"
    >
      <Stack.Screen
        name="nft-gallery"
        options={{
          title: strings.title,
          headerTitleAlign: 'center',
          header: searchVisible
            ? () => (
                <SafeAreaView edges={['left', 'top', 'right']}>
                  <SearchHeader placeholder={strings.search} onClose={handleSearchClose} />
                </SafeAreaView>
              )
            : undefined,
          headerLeft: () => <Spacer width={26} />,
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
  )
}

const styles = StyleSheet.create({
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
