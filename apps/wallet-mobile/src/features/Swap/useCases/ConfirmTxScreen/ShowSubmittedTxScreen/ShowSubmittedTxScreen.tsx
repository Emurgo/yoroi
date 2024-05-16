import {createTypeGuardFromSchema, isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {z} from 'zod'

import {Button, Spacer, Text} from '../../../../../components'
import {useBlockGoBack, useUnsafeParams, useWalletNavigation} from '../../../../../navigation'
import {getNetworkConfigById} from '../../../../../yoroi-wallets/cardano/networks'
import {useSelectedWallet} from '../../../../WalletManager/Context/SelectedWalletContext'
import {useStrings} from '../../../common/strings'
import {SubmittedTxImage} from './SubmittedTxImage'

const schema = z.object({txId: z.string()})
const isParams = createTypeGuardFromSchema(schema)

export const ShowSubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const walletNavigate = useWalletNavigation()

  const unsafeParams = useUnsafeParams()
  const params = isParams(unsafeParams) ? unsafeParams : null

  const navigateToExplorer = () => {
    const txId = params?.txId ?? ''
    Linking.openURL(getNetworkConfigById(wallet.networkId).EXPLORER_URL_FOR_TX(txId))
  }

  return (
    <SafeAreaView style={{flex: 1}} edges={['left', 'right', 'bottom']}>
      <View style={styles.container}>
        <SubmittedTxImage />

        <Text style={styles.title}>{strings.transactionSigned}</Text>

        <Text style={styles.text}>{strings.transactionDisplay}</Text>

        <Spacer height={20} />

        {isString(params?.txId) && (
          <Button
            onPress={navigateToExplorer}
            title={strings.seeOnExplorer}
            style={styles.explorerButton}
            outlineShelley
          />
        )}

        <View style={styles.bottomFixed}>
          <Button
            onPress={() => walletNavigate.navigateToTxHistory()}
            title={strings.goToTransactions}
            style={styles.button}
            shelleyTheme
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    bottomFixed: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    title: {
      color: color.gray.max,
      ...typography['heading-3-medium'],
      padding: 4,
      textAlign: 'center',
    },
    text: {
      color: color.gray[600],
      ...typography['body-2-m-regular'],
      textAlign: 'center',
      maxWidth: 300,
    },
    button: {
      paddingHorizontal: 20,
    },
    explorerButton: {
      borderColor: 'transparent',
    },
  })

  return styles
}
