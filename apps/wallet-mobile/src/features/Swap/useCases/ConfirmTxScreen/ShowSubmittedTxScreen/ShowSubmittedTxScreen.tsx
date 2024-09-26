import {createTypeGuardFromSchema, isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {z} from 'zod'

import {Button, ButtonType} from '../../../../../components/Button/NewButton'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../components/Text'
import {useBlockGoBack, useUnsafeParams, useWalletNavigation} from '../../../../../kernel/navigation'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../../common/strings'
import {SubmittedTxImage} from './SubmittedTxImage'

const schema = z.object({txId: z.string()})
const isParams = createTypeGuardFromSchema(schema)

export const ShowSubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const styles = useStyles()
  const {wallet} = useSelectedWallet()
  const explorers = wallet.networkManager.explorers
  const walletNavigate = useWalletNavigation()

  const unsafeParams = useUnsafeParams()
  const params = isParams(unsafeParams) ? unsafeParams : null

  if (!params) throw new Error('Invalid params')

  const navigateToExplorer = () => {
    const txId = params?.txId ?? ''
    Linking.openURL(explorers.cardanoscan.tx(txId))
  }

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <View style={styles.container}>
        <SubmittedTxImage />

        <Text style={styles.title}>{strings.transactionSigned}</Text>

        <Text style={styles.text}>{strings.transactionDisplay}</Text>

        <Spacer height={20} />

        {isString(params?.txId) && (
          <Button type={ButtonType.Text} size="S" onPress={navigateToExplorer} title={strings.seeOnExplorer} />
        )}

        <View style={styles.bottomFixed}>
          <Button onPress={() => walletNavigate.navigateToTxHistory()} title={strings.goToTransactions} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      flex: 1,
    },
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
      color: color.gray_max,
      ...atoms.heading_3_medium,
      padding: 4,
      textAlign: 'center',
    },
    text: {
      color: color.gray_600,
      ...atoms.body_2_md_regular,
      textAlign: 'center',
      maxWidth: 300,
    },
  })

  return styles
}
