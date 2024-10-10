import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {usePortfolioPrimaryBreakdown} from '../../../Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {usePrivacyMode} from '../../../Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../common/strings'

export const LockedDeposit = ({ignorePrivacy = false}: {ignorePrivacy?: boolean}) => {
  const {wallet} = useSelectedWallet()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {lockedAsStorageCost} = usePortfolioPrimaryBreakdown({wallet})

  const amount = React.useMemo(
    () =>
      !isPrivacyActive || !ignorePrivacy
        ? amountFormatter({template: '{{value}} {{ticker}}'})({
            quantity: lockedAsStorageCost,
            info: wallet.portfolioPrimaryTokenInfo,
          })
        : amountFormatter({template: `${privacyPlaceholder} {{ticker}}`})({
            quantity: 0n,
            info: wallet.portfolioPrimaryTokenInfo,
          }),
    [ignorePrivacy, isPrivacyActive, lockedAsStorageCost, privacyPlaceholder, wallet.portfolioPrimaryTokenInfo],
  )

  return <FormattedAmount amount={amount} />
}

const FormattedAmount = ({amount}: {amount: string}) => {
  const styles = useStyles()
  return (
    <Row>
      <Label />

      <Spacer width={4} />

      <Text style={styles.label}>{amount}</Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const styles = useStyles()
  return <View style={styles.root}>{children}</View>
}

const Label = () => {
  const strings = useStrings()
  const styles = useStyles()

  return <Text style={styles.label}>{strings.lockedDeposit}:</Text>
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      color: color.gray_600,
      ...atoms.body_2_md_regular,
    },
  })

  return styles
}
