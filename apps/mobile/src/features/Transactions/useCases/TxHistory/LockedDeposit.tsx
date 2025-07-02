import {amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {usePortfolioPrimaryBreakdown} from '../../../Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {usePrivacyMode} from '../../../Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../common/strings'

export const LockedDeposit = ({
  ignorePrivacy = false,
}: {
  ignorePrivacy?: boolean
}) => {
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
    [
      ignorePrivacy,
      isPrivacyActive,
      lockedAsStorageCost,
      privacyPlaceholder,
      wallet.portfolioPrimaryTokenInfo,
    ],
  )

  return <FormattedAmount amount={amount} />
}

const FormattedAmount = ({amount}: {amount: string}) => {
  const {palette: p} = useTheme()
  return (
    <Row>
      <Label />

      <Spacer width={4} />

      <Text style={[{color: p.gray_600}, a.body_2_md_regular]}>{amount}</Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </View>
  )
}

const Label = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <Text style={[{color: p.gray_600}, a.body_2_md_regular]}>
      {strings.lockedDeposit}:
    </Text>
  )
}
