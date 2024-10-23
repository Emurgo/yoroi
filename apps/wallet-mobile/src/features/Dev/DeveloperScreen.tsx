/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {Api} from '@yoroi/types'
import assert from 'assert'
import _ from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {Alert, InteractionManager, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity} from 'react-native'
import config from 'react-native-config'

import {Button} from '../../components/Button/Button'
import {Text} from '../../components/Text'
import {TextInput} from '../../components/TextInput/TextInput'
import {agreementDate} from '../../kernel/config'
import {showErrorDialog} from '../../kernel/dialogs'
import {errorMessages} from '../../kernel/i18n/global-messages'
import {AppRoutes, useWalletNavigation} from '../../kernel/navigation'
import {storageVersionMaker} from '../../kernel/storage/migrations/storageVersion'
import {rootStorage} from '../../kernel/storage/rootStorage'
import {isEmptyString} from '../../kernel/utils'
import {generateAdaMnemonic} from '../../yoroi-wallets/cardano/mnemonic/mnemonic'
import {useAuth} from '../Auth/AuthProvider'
import {useLegalAgreement, useResetLegalAgreement} from '../Initialization/common'
import {useCreateWalletMnemonic} from '../WalletManager/common/hooks/useCreateWalletMnemonic'
import {useWalletManager} from '../WalletManager/context/WalletManagerProvider'

const routes: Array<{label: string; path: keyof AppRoutes}> = [
  {label: 'Storybook', path: 'storybook'},
  {label: 'Skip to wallet list', path: 'manage-wallets'},
  {label: 'Playground', path: 'playground'},
]

const crash = () => {
  return Promise.reject(new Error('Forced crash'))
}

export const DeveloperScreen = () => {
  const navigation = useNavigation()
  const {styles} = useStyles()
  const {logout} = useAuth()
  const {resetToWalletSelection} = useWalletNavigation()
  const intl = useIntl()
  const {createWallet, isLoading} = useCreateWalletMnemonic({
    onSuccess: () => resetToWalletSelection(),
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })
  const {
    selected: {wallet},
  } = useWalletManager()
  const [addresses, setAddresses] = React.useState('')
  const agreement = useLegalAgreement()
  const {reset: resetLegalAgreement} = useResetLegalAgreement()
  const agreedToLegal = agreement?.latestAcceptedAgreementsDate === agreementDate

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView style={styles.container}>
        {routes.map((route) => (
          <Button
            key={route.path}
            style={styles.button}
            // https://github.com/react-navigation/react-navigation/issues/10802
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPress={() => navigation.navigate(route.path as any)}
            title={route.label}
          />
        ))}

        <TouchableOpacity onPress={() => storage.clearAll()}>
          <Text style={styles.link}>Clear storage</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={crash}>
          <Text style={styles.link}>Crash</Text>
        </TouchableOpacity>

        <Button
          title="reset storage version"
          style={styles.button}
          onPress={() => storageVersionMaker(rootStorage).remove()}
        />

        <Button
          title="Logout"
          style={styles.button}
          onPress={() => {
            logout()
            navigation.goBack()
          }}
          testID="btnLogout"
        />

        <Button
          title={`Reset Legal Agreement (Agreed: ${agreedToLegal})`}
          style={styles.button}
          onPress={() => {
            resetLegalAgreement()
          }}
          testID="btnResetAnalyticsConsent"
        />

        <Button
          disabled={isLoading}
          style={styles.button}
          onPress={() =>
            createWallet({
              mnemonicPhrase: config['WALLET_1_MNEMONIC'] ?? '',
              name: 'Wallet 1',
              password: '1234567890',
              implementation: 'cardano-cip1852',
              addressMode: 'multiple',
              accountVisual: 0,
            })
          }
          testID="btnRestoreWallet1"
          title="Restore Wallet 1"
        />

        <Button
          disabled={isLoading}
          style={styles.button}
          onPress={() =>
            createWallet({
              mnemonicPhrase: config['WALLET_2_MNEMONIC'] ?? '',
              name: 'Wallet 2',
              password: '1234567890',
              implementation: 'cardano-cip1852',
              addressMode: 'multiple',
              accountVisual: 0,
            })
          }
          testID="btnRestoreWallet2"
          title="Restore Wallet 2"
        />

        <Button
          disabled={isLoading}
          style={styles.button}
          onPress={() =>
            createWallet({
              mnemonicPhrase: config['WALLET_3_MNEMONIC'] ?? '',
              name: 'Wallet 3',
              password: '1234567890',
              implementation: 'cardano-cip1852',
              addressMode: 'multiple',
              accountVisual: 0,
            })
          }
          testID="btnRestoreWallet3"
          title="Restore Wallet 3"
        />

        <Button
          disabled={isLoading}
          style={styles.button}
          onPress={() =>
            createWallet({
              mnemonicPhrase: generateAdaMnemonic(),
              name: 'RO-Mainnet',
              password: '1234567890',
              implementation: 'cardano-cip1852',
              addressMode: 'single',
              accountVisual: 0,
            })
          }
          title="RO Mainnet For Forced Addresses"
        />

        <Button style={styles.button} onPress={() => navigation.navigate('notifications')} title="Notifications" />

        {!wallet?.isMainnet && (
          <>
            <TextInput
              autoComplete="off"
              editable
              maxLength={8096}
              multiline
              numberOfLines={20}
              onChangeText={(text) => setAddresses(text)}
              value={addresses}
              style={{padding: 2, fontSize: 8}}
              placeholder="Paste all addresses here separated by comma"
            />

            <Button
              disabled={isLoading || addresses.split(',').length > 50 || addresses.length === 0}
              style={styles.button}
              onPress={() => {
                storage
                  .keys('/wallet/', false)
                  .then((keys) => storage.readMany(keys.map((k) => `/wallet/${k}`)))
                  .then((wallets) => {
                    const id = wallets.flat().find((k) => (k as any)?.name === 'RO-Mainnet')?.id
                    if (!isEmptyString(id)) {
                      return Promise.resolve(id)
                    }
                    return Promise.reject('Missing wallet RO-Mainnet')
                  })
                  .then((id) => Promise.all([storage.read(`/wallet/${id}/data`), id]))
                  .then(([data, id]) => {
                    const _addresses = addresses.split(',')
                    const length = _addresses.length
                    if (length < 50) {
                      for (let i = 0; i < 50 - length; i++) {
                        _addresses.push(_addresses[_addresses.length - 1])
                      }
                    }
                    const newData = {...(data as any)}
                    newData.lastGeneratedAddressIndex = 50
                    newData.internalChain.addresses = _addresses
                    newData.externalChain.addresses = _addresses
                    return storage.write(`/wallet/${id}/data`, newData)
                  })
                  .then(() => {
                    Alert.alert('Success', 'Addresses updated')
                    resetToWalletSelection()
                  })
                  .catch((e) => {
                    Alert.alert('Error', e)
                  })
              }}
              title="Update forced addresses"
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      paddingTop: 50,
      backgroundColor: color.bg_color_max,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    button: {
      marginHorizontal: 16,
      marginVertical: 8,
    },
    link: {
      height: 32,
      fontSize: 16,
      textAlign: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
  })

  return {styles}
}

class StorageError extends Error {}

const checkPathFormat = (path: string) => path.startsWith('/') && !path.endsWith('/')

const parseJson = (json: string) => (json !== null ? JSON.parse(json) : undefined)

const read = async (path: string) => {
  assert(checkPathFormat(path), 'Wrong storage key path')

  try {
    const text = await AsyncStorage.getItem(path)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return parseJson(text!)
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

const readMany = async (paths: Array<string>) => {
  assert(_.every(paths, checkPathFormat), 'Wrong storage key path')

  try {
    const items = await AsyncStorage.multiGet(paths)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return items.map(([key, value]) => [key, parseJson(value!)])
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

const write = async (path: string, data: any) => {
  assert(path.startsWith('/'), 'Wrong storage key path')
  assert(!path.endsWith('/'), 'Wrong storage key path')
  assert(data !== undefined, 'Cannot store undefined')

  try {
    await AsyncStorage.setItem(path, JSON.stringify(data))
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

const remove = async (path: string) => {
  assert(path.startsWith('/'), 'Wrong storage key path')
  assert(!path.endsWith('/'), 'Wrong storage key path')

  try {
    await AsyncStorage.removeItem(path)
  } catch (error) {
    console.warn(`Missing storage key ${path}`)
    return false
  }
  return true
}

const clearAll = async () => {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

const keys = async (path: string, includeSubdirs?: boolean): Promise<Array<string>> => {
  try {
    const all = await AsyncStorage.getAllKeys()
    const matched = all.filter((key) => key.startsWith(path)).map((key) => key.substring(path.length))

    return includeSubdirs === true ? matched : matched.filter((key) => !key.includes('/'))
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

const storage = {
  read,
  readMany,
  write,
  remove,
  clearAll,
  keys,
}
