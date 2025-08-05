import {Chain, Portfolio} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {Linking} from 'react-native'
// import {useSwap} from '~/features/Swap/common/useSwap'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {ReviewTxRoutes, SettingsStackRoutes} from '../types'

export const useWalletNavigation = () => {
  const navigation = useNavigation()
  const {network} = useSelectedNetwork()
  // const swapForm = useSwap()

  return React.useRef({
    navigation,

    resetToTxHistory: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [
                {name: 'wallet-selection'},
                {
                  name: 'main-wallet-routes',
                  state: {
                    routes: [
                      {
                        name: 'history',
                        state: {
                          routes: [{name: 'history-list'}],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
    },

    resetToStartTransfer: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [
                {name: 'wallet-selection'},
                {
                  name: 'main-wallet-routes',
                  state: {
                    routes: [
                      {
                        name: 'history',
                        state: {
                          routes: [{name: 'send-start-tx'}],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
    },

    navigateToStartTransfer: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'send-start-tx',
          },
        },
      })
    },

    navigateToTxReview: (params?: ReviewTxRoutes['review-tx']) => {
      navigation.navigate('manage-wallets', {
        screen: 'review-tx-routes',
        params: {
          screen: 'review-tx',
          params,
        },
      })
    },

    resetToWalletSetupInit: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [
                {
                  name: 'setup-wallet',
                  state: {
                    routes: [{name: 'setup-wallet-choose-setup-type-init'}],
                  },
                },
              ],
            },
          },
        ],
      })
    },

    resetToWalletSetup: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [
                {name: 'wallet-selection'},
                {
                  name: 'setup-wallet',
                  state: {
                    routes: [{name: 'setup-wallet-choose-setup-type'}],
                  },
                },
              ],
            },
          },
        ],
      })
    },

    resetToWalletSelection: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [{name: 'wallet-selection'}],
            },
          },
        ],
      })
    },

    navigateToStakingDashboard: () => {
      navigation.navigate('manage-wallets', {
        screen: 'staking-dashboard',
        params: {
          screen: 'staking-dashboard-main',
        },
      })
    },

    navigateToMenu: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'menu',
          params: {
            screen: '_menu',
          },
        },
      })
    },

    navigateToSettings: () => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'main-settings',
        },
      })
    },

    navigateToChangeNetwork: () => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'change-network',
        },
      })
    },

    navigateToTxHistory: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'history-list',
          },
        },
      })
    },

    navigateToAppSettings: () => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'app-settings',
        },
      })
    },

    navigateToCollateralSettings: (
      params?: SettingsStackRoutes['manage-collateral'],
    ) => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'manage-collateral',
          params,
        },
      })
    },

    navigateToNotificationDisplayDuration: () => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'manage-notifications',
          params: {
            screen: 'manage-notification-display-duration',
          },
        },
      })
    },

    navigateToNotificationSettings: () => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'manage-notifications',
        },
      })
    },

    navigateToNotifications: () => {
      navigation.navigate('notifications')
    },

    navigateToAnalyticsSettings: () => {
      navigation.navigate('manage-wallets', {
        screen: 'toggle-analytics-settings',
        params: {
          screen: 'settings',
        },
      })
    },

    navigateToGovernanceCentre: () => {
      navigation.navigate('manage-wallets', {
        screen: 'governance',
        params: {
          screen: 'staking-gov-home',
        },
      })
    },

    navigateToDiscoverBrowserDapp: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'discover',
          params: {
            screen: 'discover-browser',
            params: {
              screen: 'discover-browse-dapp',
            },
          },
        },
      })
    },

    navigateToSwap: (tokenOutId?: Portfolio.Token.Id) => {
      if (network === Chain.Network.Preprod) {
        navigation.navigate('manage-wallets', {
          screen: 'main-wallet-routes',
          params: {
            screen: 'history',
            params: {
              screen: 'swap-preprod-notice',
            },
          },
        })
        return
      }

      // TODO: REVISIT when swap is ready
      // swapForm.action({type: 'ResetForm'})
      //
      // if (tokenOutId !== undefined) {
      //   swapForm.action({type: 'TokenOutIdChanged', value: tokenOutId})
      //   swapForm.action({type: 'TokenOutInputTouched'})
      // }

      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap-main',
          },
        },
      })
    },

    navigateToExchange: () => {
      if (network === Chain.Network.Preprod) {
        Linking.openURL(
          'https://docs.cardano.org/cardano-testnets/tools/faucet/',
        )
        return
      }

      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'exchange-create-order',
          },
        },
      })
    },

    navigateToUtxoList: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {screen: 'history', params: {screen: 'utxo-list'}},
      })
    },

    navigateToUtxoConsolidation: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {screen: 'history', params: {screen: 'utxo-consolidation'}},
      })
    },

    navigateToTxDetails: (id: string) => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {screen: 'tx-details', params: {id}},
        },
      })
    },
  } as const).current
}
