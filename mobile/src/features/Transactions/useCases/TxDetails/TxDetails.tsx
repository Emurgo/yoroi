import {isArray, isString} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'

import {useRoute} from '@react-navigation/native'
import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {useFormattedTxFromWalletTransaction} from '~/features/ReviewTx/common/hooks/useFormattedTxFromWalletTransaction'
import {FormattedMetadata} from '~/features/ReviewTx/common/types'
import {ReviewTx} from '~/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/ReviewTx'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

export const TxDetails = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const route = useRoute()
  const params = route.params as Params | undefined
  const id = params?.id

  const {wallet} = useSelectedWallet()

  if (!id) {
    throw new App.Errors.InvalidState('Transaction ID is required')
  }

  const explorers = wallet.networkManager.explorers

  // Get raw WalletTransaction
  const walletTransaction = React.useMemo(() => {
    return wallet.getRawTransaction(id)
  }, [wallet, id])

  // Convert to FormattedTx
  const {formattedTx, isLoading, error} =
    useFormattedTxFromWalletTransaction(walletTransaction)

  // Format metadata from WalletTransaction
  const formattedMetadata: FormattedMetadata = React.useMemo(() => {
    if (!walletTransaction?.metadata) {
      return {hash: null, metadata: null}
    }

    // Try to extract metadata similar to processMetadata
    const metadataItems: string[] = []
    for (const item of walletTransaction.metadata) {
      if (!item?.label) continue

      const msg = item.map_json?.msg
      if (isArray(msg)) {
        metadataItems.push(...(msg as string[]))
      } else if (isString(msg)) {
        metadataItems.push(msg)
      } else if (item.text_scalar) {
        metadataItems.push(item.text_scalar)
      }
    }

    // For historical transactions, we don't have the hash
    // Return null hash but include metadata if available
    return {
      hash: null,
      metadata: metadataItems.length > 0 ? {msg: metadataItems} : null,
    }
  }, [walletTransaction?.metadata])

  if (!walletTransaction) {
    throw new App.Errors.InvalidState('TX selected is gone')
  }

  if (isLoading || !formattedTx) {
    return <SafeArea>{/* TODO: Add loading state */}</SafeArea>
  }

  if (error) {
    throw error
  }

  return (
    <SafeArea>
      <ReviewTx
        formattedTx={formattedTx}
        formattedMetadata={formattedMetadata}
        readOnly={true}
      />
      <SafeArea.Footer>
        <View style={[a.flex_col, a.gap_sm]}>
          <View style={[a.flex_row, a.align_center, a.gap_sm]}>
            <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
              {strings.transactions.transactionId}
            </Text>
            <Space.Width.sm />
            <Copiable text={walletTransaction.id} style={a.flex_1}>
              <Text
                style={[
                  a.flex_1,
                  a.body_2_md_regular,
                  {color: p.text_gray_medium},
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {walletTransaction.id}
              </Text>
            </Copiable>
          </View>
          <Button
            onPress={() =>
              Linking.openURL(explorers.cardanoscan.tx(walletTransaction.id))
            }
            title={strings.transactions.openInExplorer}
          />
        </View>
      </SafeArea.Footer>
    </SafeArea>
  )
}

type Params = {
  id: string
}
