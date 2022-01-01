import {useNavigation} from '@react-navigation/native'
import {StackNavigationOptions, StackNavigationProp} from '@react-navigation/stack'
import React from 'react'
import {TouchableOpacity} from 'react-native'

import {WALLET_ROOT_ROUTES} from '../legacy/RoutesList'
import {COLORS} from '../legacy/styles/config'
import {Icon} from './components/Icon'

export type TxHistoryStackParamList = {
  TxHistory: undefined
  TxDetails: {
    id: string
  }
  ReceiveScreen: undefined
}

export type TxHistoryStackRootProps = StackNavigationProp<TxHistoryStackParamList>

export const buildOptionsWithDefault = ({
  backgroundColor = COLORS.BACKGROUND_GRAY,
  title,
  headerRight,
}: {
  backgroundColor?: string
  title?: string
  headerRight?: () => React.ReactNode
} = {}): StackNavigationOptions => ({
  headerTintColor: COLORS.ERROR_TEXT_COLOR_DARK,
  headerTitleStyle: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
  headerRightContainerStyle: {
    paddingRight: 12,
  },
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor,
  },
  title,
  headerRight,
})

export const SettingsButton = () => {
  const navigation = useNavigation()

  return (
    <TouchableOpacity onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}>
      <Icon.Settings size={30} color={COLORS.ACTION_GRAY} />
    </TouchableOpacity>
  )
}
