/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {Icon} from '../components'
import {NftRoutes} from '../navigation'
import {NftDetails} from './NftDetails'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  const strings = useStrings()

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
        component={Nfts}
        options={{
          title: strings.title,
          headerLeft: () => null,
          headerRight: () => <Icon.Magnify size={26} />,
          headerLeftContainerStyle: {paddingLeft: 16},
          headerRightContainerStyle: {paddingRight: 16},
        }}
      />
      <Stack.Screen
        name="nft-details"
        component={NftDetails}
        options={{headerRightContainerStyle: {paddingRight: 16}}}
      />
    </Stack.Navigator>
  )
}

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
