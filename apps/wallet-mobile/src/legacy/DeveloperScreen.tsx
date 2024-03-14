/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useNavigation} from '@react-navigation/native'
import assert from 'assert'
import ExtendableError from 'es6-error'
import _ from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {Alert, InteractionManager, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity} from 'react-native'
import config from 'react-native-config'

import {useAuth} from '../auth/AuthProvider'
import {Button, Text, TextInput} from '../components'
import {useStatusBar} from '../components/hooks/useStatusBar'
import {showErrorDialog} from '../dialogs'
import {useLegalAgreement, useResetLegalAgreement} from '../features/Initialization/common'
import {errorMessages} from '../i18n/global-messages'
import {storageVersionMaker} from '../migrations/storageVersion'
import {AppRoutes, useWalletNavigation} from '../navigation'
import {useSelectedWalletContext} from '../SelectedWallet'
import {COLORS} from '../theme'
import {HexColor} from '../theme/types'
import {isEmptyString} from '../utils/utils'
import {NetworkError} from '../yoroi-wallets/cardano/errors'
import {generateAdaMnemonic} from '../yoroi-wallets/cardano/mnemonic'
import {useCreateWallet} from '../yoroi-wallets/hooks'
import {rootStorage} from '../yoroi-wallets/storage/rootStorage'
import {NetworkId} from '../yoroi-wallets/types'
import {CONFIG} from './config'

const routes: Array<{label: string; path: keyof AppRoutes}> = [
  {label: 'Storybook', path: 'storybook'},
  {label: 'Skip to wallet list', path: 'app-root'},
]

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: COLORS.BACKGROUND_LIGHT_GRAY,
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

const crash = () => {
  return Promise.reject(new Error('Forced crash'))
}

export const DeveloperScreen = () => {
  const navigation = useNavigation()
  const {logout} = useAuth()
  const {resetToWalletSelection} = useWalletNavigation()
  useStatusBar(COLORS.BACKGROUND_LIGHT_GRAY as HexColor)
  const intl = useIntl()
  const {createWallet, isLoading} = useCreateWallet({
    onSuccess: () => resetToWalletSelection(),
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })
  const [wallet] = useSelectedWalletContext()
  const [addresses, setAddresses] = React.useState('')
  const agreement = useLegalAgreement()
  const {reset: resetLegalAgreement} = useResetLegalAgreement()
  const agreedToLegal = agreement?.latestAcceptedAgreementsDate === CONFIG.AGREEMENT_DATE

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
              networkId: Number(config['WALLET_1_NETWORK_ID'] ?? 300) as NetworkId,
              password: '1234567890',
              walletImplementationId: 'haskell-shelley',
              addressMode: 'multiple',
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
              networkId: Number(config['WALLET_2_NETWORK_ID'] ?? 300) as NetworkId,
              password: '1234567890',
              walletImplementationId: 'haskell-shelley',
              addressMode: 'multiple',
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
              mnemonicPhrase: generateAdaMnemonic(),
              name: 'RO-Mainnet',
              networkId: 1,
              password: '1234567890',
              walletImplementationId: 'haskell-shelley',
              addressMode: 'single',
            })
          }
          title="RO Mainnet For Forced Addresses"
        />

        {wallet?.networkId !== 1 && (
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
              shelleyTheme
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

export class StorageError extends ExtendableError {}

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
