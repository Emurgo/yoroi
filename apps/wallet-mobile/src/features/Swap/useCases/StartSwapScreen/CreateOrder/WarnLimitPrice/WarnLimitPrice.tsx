import {SwapState} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../../../components'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../../../../WalletManager/Context/SelectedWalletContext'
import {PRICE_PRECISION} from '../../../../common/constants'
import {useStrings} from '../../../../common/strings'

export interface LimitPriceWarningProps {
  onConfirm?: () => void
  orderData: SwapState['orderData']
}

export const WarnLimitPrice = ({onConfirm, orderData}: LimitPriceWarningProps) => {
  const strings = useStrings()
  const styles = useStyles()
  const limitPrice = Quantities.format(orderData.limitPrice ?? Quantities.zero, orderData.tokens.priceDenomination)
  const wallet = useSelectedWallet()
  const {closeModal} = useModal()
  const tokenToSellInfo = useTokenInfo({wallet, tokenId: orderData.amounts.sell.tokenId})
  const tokenToBuyInfo = useTokenInfo({wallet, tokenId: orderData.amounts.buy.tokenId})

  const tokenToSellName = tokenToSellInfo.ticker ?? tokenToSellInfo.name ?? '-'
  const tokenToBuyName = tokenToBuyInfo.ticker ?? tokenToBuyInfo.name ?? '-'
  const marketPrice = Quantities.format(
    orderData.selectedPoolCalculation?.prices.market ?? Quantities.zero,
    orderData.tokens.priceDenomination,
    PRICE_PRECISION,
  )

  const name = `${tokenToSellName}/${tokenToBuyName}`

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>{strings.limitPriceWarningDescription}</Text>

        <Spacer height={16} />

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.label}>{strings.limitPriceWarningYourPrice}</Text>

            <View style={styles.textWrapper}>
              <Text style={styles.value}>{limitPrice}</Text>

              <Text style={styles.value}>{name}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{strings.limitPriceWarningMarketPrice}</Text>

            <View style={styles.textWrapper}>
              <Text style={styles.value}>{marketPrice}</Text>

              <Text style={styles.value}>{name}</Text>
            </View>
          </View>
        </View>
      </View>

      <Spacer fill />

      <View style={styles.buttonsWrapper}>
        <Button
          testID="swapCancelButton"
          outlineShelley
          title={strings.limitPriceWarningBack}
          onPress={closeModal}
          containerStyle={styles.buttonContainer}
        />

        <Button
          testID="swapConfirmButton"
          shelleyTheme
          title={strings.limitPriceWarningConfirm}
          onPress={onConfirm}
          containerStyle={styles.buttonContainer}
        />
      </View>

      <Spacer height={23} />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    buttonContainer: {
      flex: 1,
    },
    buttonsWrapper: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      gap: 16,
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
    },
    label: {
      color: color.gray[600],
      ...typography['body-1-l-regular'],
    },
    value: {
      color: color.gray.max,
      ...typography['body-1-l-regular'],
      textAlign: 'right',
    },
    textWrapper: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      flex: 1,
      flexWrap: 'wrap',
      gap: 4,
    },
    table: {
      flexDirection: 'column',
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    description: {
      ...typography['body-1-l-regular'],
      color: color.gray[900],
    },
  })

  return styles
}
