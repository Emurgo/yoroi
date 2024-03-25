import {useAsyncStorage} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React, {useCallback} from 'react'
import {useEffect} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import IllustrationDAppImage from '../../../assets/img/illustration-dapp.png'
import {Button, useModal} from '../../../components'
import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'

export const storageRootDAppExplorer = 'dapp-explorer-3'
export const storageDAppWelcome = 'dapp-explorer-welcome-dialog-3'

export const useShowWelcomeDApp = () => {
  const wallet = useSelectedWallet()
  const storage = useAsyncStorage()
  const {openModal, closeModal} = useModal()
  const {styles} = useStyles()
  const insets = useSafeAreaInsets()
  const dialogHeight = 494 + insets.bottom

  const dAppExplorerStorage = storage.join(`wallet/${wallet.id}/${storageRootDAppExplorer}/`)

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  useEffect(() => {
    dAppExplorerStorage.getItem(storageDAppWelcome).then((isShowed) => {
      if (isShowed === null) {
        openModal(
          'Welcome to Yoroi DApp Explorer',
          <View>
            <Image
              source={IllustrationDAppImage}
              style={{
                width: 343,
                height: 200,
              }}
            />

            <Text style={styles.welcomeText}>
              Discover, inspect, and connect to Cardano decentralized applications (DApps) with ease. Our solution helps
              to interact with DApps and their smart contracts, seamlessly enhancing your Cardano experience
            </Text>

            <View style={styles.actions}>
              <Button shelleyTheme onPress={handleClose} title="Next" />
            </View>
          </View>,
          dialogHeight,
        )

        dAppExplorerStorage.setItem(storageDAppWelcome, 'true')
      }
    })
  }, [closeModal, handleClose, openModal, dAppExplorerStorage, styles, insets.bottom])
}

const useStyles = () => {
  const {theme} = useTheme()
  const {typography, color, padding} = theme

  const styles = StyleSheet.create({
    root: {},
    welcomeText: {
      ...typography['body-1-l-regular'],
      color: color.gray['900'],
      marginTop: 16,
    },
    actions: {
      ...padding['y-l'],
    },
  })

  return {styles} as const
}
