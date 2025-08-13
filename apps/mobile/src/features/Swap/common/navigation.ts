import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

export const useNavigateTo = () => {
  const navigation = useNavigation()

  return useRef({
    selectProtocol: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'select-protocol',
            },
          },
        },
      }),
    selectTokenIn: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'select-token',
              params: {direction: 'in'},
            },
          },
        },
      }),
    selectTokenOut: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'select-token',
              params: {direction: 'out'},
            },
          },
        },
      }),
    startSwap: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'main',
            },
          },
        },
      }),
    orders: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'orders',
            },
          },
        },
      }),
    swapSettings: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'settings',
            },
          },
        },
      }),
    reviewSwap: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'review',
            },
          },
        },
      }),
    submittedTx: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'submitted-tx',
            },
          },
        },
      }),
    failedTx: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'failed-tx',
            },
          },
        },
      }),
    swapOpenOrders: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'orders',
            },
          },
        },
      }),
    resetToStartSwap: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'main',
            },
          },
        },
      }),
  }).current
}
