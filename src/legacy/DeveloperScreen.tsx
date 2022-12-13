/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {Alert, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity} from 'react-native'
import config from 'react-native-config'
import * as Keychain from 'react-native-keychain'

import {useAuth} from '../auth/AuthProvider'
import {Button, StatusBar, Text, TextInput} from '../components'
import {useCreateWallet} from '../hooks'
import {AppRoutes, useWalletNavigation} from '../navigation'
import {useSelectedWalletContext} from '../SelectedWallet'
import {generateAdaMnemonic} from './commonUtils'
import storage from './storage'
import {isEmptyString} from './utils'

const routes: Array<{label: string; path: keyof AppRoutes}> = [
  {label: 'Storybook', path: 'storybook'},
  {label: 'Skip to wallet list', path: 'app-root'},
]

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
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
  const {createWallet, isLoading} = useCreateWallet({
    onSuccess: async () => {
      resetToWalletSelection()
    },
  })
  const [wallet] = useSelectedWalletContext()
  const [addresses, setAddresses] = React.useState('')

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="light" />

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
          title="All kc"
          style={styles.button}
          onPress={() => Keychain.getAllGenericPasswordServices().then(console.log)}
        />
        <Button
          title="Logout"
          style={styles.button}
          onPress={() => {
            logout()
            navigation.goBack()
          }}
        />
        <Button
          disabled={isLoading}
          style={styles.button}
          onPress={() =>
            createWallet({
              mnemonicPhrase: config['WALLET_1_MNEMONIC'],
              name: 'Wallet 1',
              networkId: Number(config['WALLET_1_NETWORK_ID'] ?? 300),
              password: '1234567890',
              walletImplementationId: 'haskell-shelley',
              provider: '',
            })
          }
          title="Restore Wallet 1"
        />
        <Button
          disabled={isLoading}
          style={styles.button}
          onPress={() =>
            createWallet({
              mnemonicPhrase: config['WALLET_2_MNEMONIC'],
              name: 'Wallet 2',
              networkId: Number(config['WALLET_1_NETWORK_ID'] ?? 300),
              password: '1234567890',
              walletImplementationId: 'haskell-shelley',
              provider: '',
            })
          }
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
              provider: '',
            })
          }
          title="RO Mainnet For Forced Addresses"
        />
        {wallet?.networkId !== 1 && (
          <>
            <TextInput
              autoComplete={false}
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
