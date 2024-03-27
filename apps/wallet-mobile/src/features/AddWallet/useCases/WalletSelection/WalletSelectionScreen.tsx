import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {NetworkError} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {FlatList, InteractionManager, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button'
import {Space} from '../../../../components/Space/Space'
import {showErrorDialog} from '../../../../dialogs'
import {errorMessages} from '../../../../i18n/global-messages'
import {isNightly} from '../../../../legacy/config'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../navigation'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../../../SelectedWallet'
import {WalletMeta} from '../../../../wallet-manager/types'
import {useWalletManager} from '../../../../wallet-manager/WalletManagerContext'
import * as HASKELL_SHELLEY from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import * as SANCHONET from '../../../../yoroi-wallets/cardano/constants/sanchonet/constants'
import * as HASKELL_SHELLEY_TESTNET from '../../../../yoroi-wallets/cardano/constants/testnet/constants'
import {InvalidState} from '../../../../yoroi-wallets/cardano/errors'
import {isJormungandr} from '../../../../yoroi-wallets/cardano/networks'
import {useOpenWallet, useWalletMetas} from '../../../../yoroi-wallets/hooks'
import {useLinksRequestWallet} from '../../../Links/common/useLinksRequestWallet'
import {useStrings} from '../../common/useStrings'
import {SupportIllustration} from '../../illustrations/SupportIllustration'
import {WalletListItem} from './WalletListItem'

export const WalletSelectionScreen = () => {
  useLinksRequestWallet()
  const strings = useStrings()
  const {styles} = useStyles()
  const walletManager = useWalletManager()
  const {navigateToTxHistory} = useWalletNavigation()
  const {walletMetas, isFetching, refetch} = useWalletMetas(walletManager, {
    select: (walletMetas) => walletMetas.sort(byName),
  })
  const intl = useIntl()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.allWalletsPageViewed()
    }, [track]),
  )

  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()

  const {openWallet} = useOpenWallet({
    onSuccess: ([wallet, walletMeta]) => {
      selectWalletMeta(walletMeta)
      selectWallet(wallet)
      navigateToTxHistory()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof InvalidState
          ? showErrorDialog(errorMessages.walletStateInvalid, intl)
          : error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  const onSelect = async (walletMeta: WalletMeta) => {
    if (walletMeta.isShelley || isJormungandr(walletMeta.networkId)) {
      await showErrorDialog(errorMessages.itnNotSupported, intl)
      return
    }

    return openWallet(walletMeta)
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Text style={styles.title}>{strings.header}</Text>

      <FlatList
        contentContainerStyle={styles.walletItemContainer}
        data={walletMetas}
        keyExtractor={(item) => item.id}
        renderItem={({item: walletMeta}) => <WalletListItem wallet={walletMeta} onPress={onSelect} />}
        ListEmptyComponent={null}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      />

      <SupportTicketLink />

      <Space height="l" />

      <ShelleyButton />

      <Space height="m" />

      <OnlyNightlyShelleyTestnetButton />

      <Space height="m" />

      <OnlyNightlyShelleySanchonetButton />

      <Space height="m" />

      <OnlyDevButton />
    </SafeAreaView>
  )
}

const SUPPORT_TICKET_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'

const SupportTicketLink = () => {
  const onPress = () => Linking.openURL(SUPPORT_TICKET_LINK)
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={styles.link} onPress={() => onPress()}>
      <SupportIllustration />

      <Text style={styles.linkText}>{strings.supportTicketLink.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  )
}

const ShelleyButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <Button
      onPress={() =>
        navigation.navigate('new-wallet', {
          screen: 'choose-create-restore',
          params: {
            networkId: HASKELL_SHELLEY.NETWORK_ID,
            walletImplementationId: HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
          },
        })
      }
      title={strings.addWalletButton}
      style={styles.topButton}
    />
  )
}

const OnlyNightlyShelleyTestnetButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {styles} = useStyles()

  if (!isNightly() && !__DEV__) return null

  return (
    <Button
      onPress={() =>
        navigation.navigate('new-wallet', {
          screen: 'choose-create-restore',
          params: {
            networkId: HASKELL_SHELLEY_TESTNET.NETWORK_ID,
            walletImplementationId: HASKELL_SHELLEY_TESTNET.WALLET_IMPLEMENTATION_ID,
          },
        })
      }
      title={`${strings.addWalletButton} (preprod)`}
      style={styles.button}
      testID="addWalletPreprodShelleyButton"
    />
  )
}

const OnlyNightlyShelleySanchonetButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {styles} = useStyles()

  if (!isNightly() && !__DEV__) return null

  const handleOnPress = () => {
    navigation.navigate('new-wallet', {
      screen: 'choose-create-restore',
      params: {
        networkId: SANCHONET.NETWORK_ID,
        walletImplementationId: SANCHONET.WALLET_IMPLEMENTATION_ID,
      },
    })
  }

  return <Button onPress={handleOnPress} title={`${strings.addWalletButton} (sanchonet)`} style={styles.button} />
}

const OnlyDevButton = () => {
  const navigation = useNavigation()
  const {styles} = useStyles()

  if (!__DEV__) return null

  return (
    <Button
      testID="btnDevOptions"
      onPress={() => navigation.navigate('developer')}
      title="Dev options"
      style={styles.button}
    />
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      ...theme.padding['x-l'],
      backgroundColor: theme.color['white-static'],
    },
    title: {
      textAlign: 'center',
      ...theme.typography['body-1-l-medium'],
      ...theme.padding['l'],
      color: theme.color.gray.max,
    },
    topButton: {
      backgroundColor: theme.color.primary[500],
    },
    button: {
      backgroundColor: theme.color.primary[500],
    },
    linkText: {
      color: theme.color.primary[500],
    },
    link: {
      ...theme.typography['button-2-m'],
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    walletItemContainer: {
      ...theme.padding['y-l'],
      gap: 8,
    },
  })
  return {styles} as const
}

const byName = (a: {name: string}, b: {name: string}) => {
  const nameA = a.name.toUpperCase()
  const nameB = b.name.toUpperCase()

  if (nameA < nameB) {
    return -1
  }
  if (nameA > nameB) {
    return 1
  }

  return 0
}
