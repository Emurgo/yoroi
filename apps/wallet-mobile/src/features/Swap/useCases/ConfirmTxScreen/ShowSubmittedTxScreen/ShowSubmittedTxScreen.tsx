import {createTypeGuardFromSchema, isString} from '@yoroi/common'
import React from 'react'
import {Linking, StyleSheet, View} from 'react-native'
import {z} from 'zod'

import {Button, Spacer, Text} from '../../../../../components'
import {useBlockGoBack, useUnsafeParams} from '../../../../../navigation'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {getNetworkConfigById} from '../../../../../yoroi-wallets/cardano/networks'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {SubmittedTxImage} from './SubmittedTxImage'

const schema = z.object({txId: z.string()})
const isParams = createTypeGuardFromSchema(schema)

export const ShowSubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()

  const unsafeParams = useUnsafeParams()
  const params = isParams(unsafeParams) ? unsafeParams : null

  const navigateToExplorer = () => {
    const txId = params?.txId ?? ''
    Linking.openURL(getNetworkConfigById(wallet.networkId).EXPLORER_URL_FOR_TX(txId))
  }

  return (
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
          onPress={() => navigate.swapOpenOrders()}
          title={strings.goToOrders}
          style={styles.button}
          shelleyTheme
        />
      </View>
    </View>
  )
}

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
    color: COLORS.BLACK,
    fontWeight: '600',
    fontSize: 20,
    padding: 4,
    textAlign: 'center',
    lineHeight: 30,
  },
  text: {
    color: COLORS.TEXT_INPUT,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
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
