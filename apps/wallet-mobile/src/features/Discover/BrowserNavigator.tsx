import {createStackNavigator} from '@react-navigation/stack'
import {useAsyncStorage} from '@yoroi/common'
import {connectionStorageMaker, dappConnectorMaker, DappConnectorProvider} from '@yoroi/dapp-connector'
import {useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'
import * as React from 'react'
import {Alert, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {BrowserRoutes} from 'src/navigation'

import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {useSelectedWallet} from '../WalletManager/Context'
import {BrowseDappScreen} from './useCases/BrowseDapp/BrowseDappScreen'
import {SearchDappInBrowserScreen} from './useCases/SearchDappInBrowser/SearchDappInBrowserScreen'

const Tab = createStackNavigator<BrowserRoutes>()

export const BrowserNavigator = () => {
  const {styles} = useStyles()

  const appStorage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const manager = React.useMemo(() => createDappConnector(appStorage, wallet), [appStorage, wallet])

  return (
    <DappConnectorProvider manager={manager}>
      <SafeAreaView edges={['left', 'right', 'top']} style={styles.root}>
        <Tab.Navigator
          screenOptions={{
            animationEnabled: false,
            headerShown: false,
          }}
        >
          <Tab.Screen name="discover-browse-dapp" component={BrowseDappScreen} />

          <Tab.Screen name="discover-search-dapp-in-browser" component={SearchDappInBrowserScreen} />
        </Tab.Navigator>
      </SafeAreaView>
    </DappConnectorProvider>
  )
}

const createDappConnector = (appStorage: App.Storage, wallet: YoroiWallet) => {
  const handlerWallet = {
    id: wallet.id,
    networkId: wallet.networkId,
    confirmConnection: async (origin: string) => {
      return new Promise<boolean>((resolve) => {
        // TODO: Use modal with translations here instead of alert
        Alert.alert('Confirm connection', `Do you want to connect to ${origin}?`, [
          {text: 'Cancel', style: 'cancel', onPress: () => resolve(false)},
          {text: 'OK', onPress: () => resolve(true)},
        ])
      })
    },
  }
  const storage = connectionStorageMaker({storage: appStorage.join('dapp-connections/')})
  return dappConnectorMaker(storage, handlerWallet)
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
  })

  return {styles} as const
}
