import {useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {TouchableOpacity, TouchableOpacityProps} from 'react-native'
import {useSelector} from 'react-redux'

import {Button} from '../../legacy/components/UiKit'
import {UI_V2} from '../../legacy/config/config'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {TX_HISTORY_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {transactionsInfoSelector, walletMetaSelector} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'
import {formatDateToSeconds} from '../../legacy/utils/format'
import iconGear from '../assets/img/icon/gear.png'
import {Icon} from '../components'
import {buildOptionsWithDefault, TxHistoryStackParamList} from '../navigation'
import {ReceiveScreen} from '../Receive/ReceiveScreen'
import {ModalInfo, ModalInfoProvider, useModalInfo} from './ModalInfo'
import {TxDetails} from './TxDetails'
import {TxHistory} from './TxHistory'

const Stack = createStackNavigator<TxHistoryStackParamList>()

export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const walletMeta = useSelector(walletMetaSelector)
  const transactionInfos = useSelector(transactionsInfoSelector)
  return (
    <ModalInfoProvider>
      <Stack.Navigator screenOptions={defaultStackNavigatorOptions} initialRouteName={TX_HISTORY_ROUTES.MAIN}>
        <Stack.Screen
          name="history-list"
          component={TxHistory}
          options={
            UI_V2
              ? buildOptionsWithDefault({title: walletMeta.name, headerRight: () => <HeaderRightHistory />})
              : buildOptionsWithDefaultV1(walletMeta.name)
          }
        />

        <Stack.Screen
          name="history-details"
          component={TxDetails}
          options={({route}) => ({
            title: formatDateToSeconds(transactionInfos[route.params?.id].submittedAt),
            ...defaultNavigationOptions,
          })}
        />

        <Stack.Screen
          name="receive"
          component={ReceiveScreen}
          options={buildOptionsWithDefault({
            title: strings.receiveTitle,
            headerRight: () => <HeaderRightReceive />,
            backgroundColor: '#fff',
          })}
        />
      </Stack.Navigator>
      <ModalInfo />
    </ModalInfoProvider>
  )
}

const messages = defineMessages({
  receiveTitle: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    receiveTitle: intl.formatMessage(messages.receiveTitle),
  }
}

const ModalInfoIconButton = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity {...props}>
      <Icon.Info size={25} color={COLORS.ACTION_GRAY} />
    </TouchableOpacity>
  )
}

const SettingsIconButton = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity {...props}>
      <Icon.Settings size={30} color={COLORS.ACTION_GRAY} />
    </TouchableOpacity>
  )
}

const HeaderRightReceive = () => {
  const {showModalInfo} = useModalInfo()

  return <ModalInfoIconButton onPress={showModalInfo} />
}

const HeaderRightHistory = () => {
  const navigation = useNavigation()

  return <SettingsIconButton onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)} />
}

const buildOptionsWithDefaultV1 =
  (title: string) =>
  ({navigation}) => ({
    ...defaultNavigationOptions,
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
        iconImage={iconGear}
        title=""
        withoutBackground
      />
    ),
    title,
  })
