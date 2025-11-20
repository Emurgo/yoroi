import {Chain, Portfolio} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as Linking from 'expo-linking'
import * as React from 'react'

import {useSwap} from '~/features/Swap/common/useSwap'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'

import {ReviewTxRoutes, SettingsStackRoutes} from '../types'

export const useWalletNavigation = () => {
  const navigation = useNavigation()
  const selectedNetworkHook = useSelectedNetwork()
  const swapForm = useSwap()

  const selectedNetworkRef = React.useRef(selectedNetworkHook)
  selectedNetworkRef.current = selectedNetworkHook
  const swapFormRef = React.useRef(swapForm)
  swapFormRef.current = swapForm

  const walletNavigation = React.useRef({
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
            name: 'setup-wallet',
            state: {
              routes: [{name: 'setup-wallet-choose-setup-type-init'}],
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

    navigateToReceiveSingle: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'receive-single',
          },
        },
      })
    },

    navigateToReceiveMultiple: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'receive-multiple',
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

    navigateToDiscoverDappSelection: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'discover',
          params: {
            screen: 'discover-select-dapp-from-list',
          },
        },
      })
    },

    navigateToSwap: () => {
      const currentNetwork = selectedNetworkRef.current.network

      if (currentNetwork === Chain.Network.Preprod) {
        navigation.navigate('manage-wallets', {
          screen: 'main-wallet-routes',
          params: {
            screen: 'history',
            params: {
              screen: 'swap',
              params: {
                screen: 'preprod-notice',
              },
            },
          },
        })
        return
      }

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
      })
    },

    resetToSwapWithToken: () => {
      const currentNetwork = selectedNetworkRef.current.network

      if (currentNetwork === Chain.Network.Preprod) {
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
                            index: 1,
                            routes: [
                              {name: 'history-list'},
                              {
                                name: 'swap',
                                state: {
                                  routes: [{name: 'preprod-notice'}],
                                },
                              },
                            ],
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
        return
      }

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
                          index: 1,
                          routes: [
                            {name: 'history-list'},
                            {
                              name: 'swap',
                              state: {
                                routes: [{name: 'main'}],
                              },
                            },
                          ],
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

    navigateToSwapPreprodNotice: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'preprod-notice',
            },
          },
        },
      })
    },

    resetTabAndSwap: () => {
      navigation.reset({
        index: 0,
        routes: [
          {name: 'manage-wallets', params: {screen: 'main-wallet-routes'}},
        ],
      })
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
      })
    },

    navigateToExchange: () => {
      const currentNetwork = selectedNetworkRef.current.network
      if (currentNetwork === Chain.Network.Preprod) {
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

    navigateToSendStartTx: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {screen: 'history', params: {screen: 'send-start-tx'}},
      })
    },

    navigateToSendListAmounts: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {screen: 'send-list-amounts-to-send'},
        },
      })
    },

    navigateToSendEditAmount: (amount: Portfolio.Token.Amount) => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {screen: 'send-edit-amount', params: {amount}},
        },
      })
    },

    navigateToSendSelectToken: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {screen: 'send-select-token-from-list'},
        },
      })
    },

    navigateToSendSubmittedTx: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {screen: 'send-submitted-tx'},
        },
      })
    },

    navigateToSendFailedTx: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {screen: 'send-failed-tx'},
        },
      })
    },

    navigateToReceiveSpecificAmount: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {screen: 'receive-specific-amount'},
        },
      })
    },

    navigateToCatalystVotingDashboard: () => {
      navigation.navigate('manage-wallets', {
        screen: 'voting-registration',
        params: {
          screen: 'download-catalyst',
        },
      })
    },

    navigateToCatalystDisplayPin: () => {
      navigation.navigate('manage-wallets', {
        screen: 'voting-registration',
        params: {
          screen: 'display-pin',
        },
      })
    },

    navigateToCatalystConfirmPin: () => {
      navigation.navigate('manage-wallets', {
        screen: 'voting-registration',
        params: {
          screen: 'confirm-pin',
        },
      })
    },

    navigateToCatalystCreateTx: () => {
      navigation.navigate('manage-wallets', {
        screen: 'voting-registration',
        params: {
          screen: 'create-tx',
        },
      })
    },

    navigateToCatalystQrCode: () => {
      navigation.navigate('manage-wallets', {
        screen: 'voting-registration',
        params: {
          screen: 'qr-code',
        },
      })
    },

    navigateToAnalyticsSettings: () => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {screen: 'analytics'},
      })
    },

    navigateToAirdrop: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'menu',
          params: {
            screen: 'airdrop',
          },
        },
      })
    },
  } as const)

  return walletNavigation.current
}
