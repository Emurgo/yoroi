import {createTypeGuardFromSchema, isString} from '@yoroi/common'
import {useExplorers} from '@yoroi/explorers'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {z} from 'zod'

import {Button, Spacer, Text} from '../../../../../components'
import {useBlockGoBack, useUnsafeParams, useWalletNavigation} from '../../../../../navigation'
import {useSelectedWallet} from '../../../../WalletManager/context/SelectedWalletContext'
import {useStrings} from '../../../common/strings'
import {SubmittedTxImage} from './SubmittedTxImage'

const schema = z.object({txId: z.string()})
const isParams = createTypeGuardFromSchema(schema)

export const ShowSubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const explorers = useExplorers(wallet.network)
  const walletNavigate = useWalletNavigation()

  const unsafeParams = useUnsafeParams()
  const params = isParams(unsafeParams) ? unsafeParams : null

  if (!params) throw new Error('Invalid params')

  const navigateToExplorer = () => {
    const txId = params?.txId ?? ''
    Linking.openURL(explorers.cardanoscan.tx(txId))
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
  const {atoms, color} = useTheme()
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
      color: color.gray_cmax,
      ...atoms.heading_3_medium,
      padding: 4,
      textAlign: 'center',
    },
    text: {
      color: color.gray_c600,
      ...atoms.body_2_md_regular,
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
