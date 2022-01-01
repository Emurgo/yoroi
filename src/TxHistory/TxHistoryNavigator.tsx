import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {TouchableOpacity} from 'react-native'
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
import {buildOptionsWithDefault, SettingsButton, TxHistoryStackParamList} from '../navigation'
import {ReceiveProvider, useReceiveContextInfoModal} from '../Receive/Context'
import {ReceiveScreen} from '../Receive/ReceiveScreen'
import {TxDetails} from './TxDetails'
import {TxHistory} from './TxHistory'

const Stack = createStackNavigator<TxHistoryStackParamList>()

export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const walletMeta = useSelector(walletMetaSelector)
  const transactionInfos = useSelector(transactionsInfoSelector)
  return (
    <ReceiveProvider>
      <Stack.Navigator screenOptions={defaultStackNavigatorOptions} initialRouteName={TX_HISTORY_ROUTES.MAIN}>
        <Stack.Screen
          name="TxHistory"
          component={TxHistory}
          options={
            UI_V2
              ? buildOptionsWithDefault({title: walletMeta.name, headerRight: SettingsButton})
              : buildOptionsWithDefaultV1(walletMeta.name)
          }
        />

        <Stack.Screen
          name="TxDetails"
          component={TxDetails}
          options={({route}) => ({
            title: formatDateToSeconds(transactionInfos[route.params?.id].submittedAt),
            ...defaultNavigationOptions,
          })}
        />

        <Stack.Screen
          name="ReceiveScreen"
          component={ReceiveScreen}
          options={buildOptionsWithDefault({
            title: strings.receiveTitle,
            headerRight: ShowReceiveInfoButton,
            backgroundColor: '#fff',
          })}
        />
      </Stack.Navigator>
    </ReceiveProvider>
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

export const ShowReceiveInfoButton = () => {
  const {showInfoModal} = useReceiveContextInfoModal()

  return (
    <TouchableOpacity onPress={showInfoModal}>
      <Icon.Info size={25} color={COLORS.ACTION_GRAY} />
    </TouchableOpacity>
  )
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
