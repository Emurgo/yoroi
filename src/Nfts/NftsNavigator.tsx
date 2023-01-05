import {createStackNavigator} from '@react-navigation/stack'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native'

import {Icon} from '../components'
import {NftRoutes} from '../navigation'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  const strings = useStrings()
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState('')

  const handleCrossPress = () => {
    if (search.length > 0) {
      setSearch('')
    } else {
      setShowSearch(false)
    }
  }

  const handleBackPress = () => {
    setShowSearch(false)
    setSearch('')
  }

  return (
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
          header: showSearch
            ? () => (
                <View style={styles.header}>
                  <TouchableOpacity onPress={handleBackPress}>
                    <Icon.Chevron direction="left" color="#000000" />
                  </TouchableOpacity>
                  <TextInput
                    autoFocus
                    placeholder="Search NFT"
                    style={styles.input}
                    onChangeText={(search) => setSearch(search)}
                  />
                  <TouchableOpacity onPress={handleCrossPress}>
                    <Icon.Cross color="#000000" size={23} />
                  </TouchableOpacity>
                </View>
              )
            : undefined,
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowSearch(true)}>
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
  input: {
    width: '100%',
    flex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingRight: 20,
    paddingLeft: 10,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.nfts.title',
    defaultMessage: '!!!NFT Gallery',
  },
})
