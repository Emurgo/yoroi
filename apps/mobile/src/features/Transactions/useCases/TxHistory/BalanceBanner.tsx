import {amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {ResetErrorRef} from '../../../../components/Boundary/Boundary'
import {PairedBalance} from '../../../../components/PairedBalance/PairedBalance'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Icon} from '../../../../ui/Icon'
import {usePortfolioPrimaryBalance} from '../../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {usePrivacyMode} from '../../../Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'

export const BalanceBanner = React.forwardRef<ResetErrorRef>((_, ref) => {
  const {wallet, meta} = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {togglePrivacyMode} = usePrivacyMode()

  return (
    <View>
      <Spacer height={14} />

      <CenteredRow>
        <Icon.WalletAvatar
          style={{height: 40, width: 40, borderRadius: 20}}
          image={meta.avatar}
          size={40}
        />
      </CenteredRow>

      <Spacer height={10} />

      <TouchableOpacity
        onPress={() => togglePrivacyMode()}
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CenteredRow>
          <Balance amount={primaryBalance} />
        </CenteredRow>

        <CenteredRow>
          <PairedBalance amount={primaryBalance} ref={ref} />
        </CenteredRow>
      </TouchableOpacity>
    </View>
  )
})

type BalanceProps = {amount: Portfolio.Token.Amount; ignorePrivacy?: boolean}
const Balance = ({amount, ignorePrivacy}: BalanceProps) => {
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {palette: p} = useTheme()

  const balance = React.useMemo(
    () =>
      !isPrivacyActive || ignorePrivacy === true
        ? amountFormatter({template: '{{value}} {{ticker}}'})(amount)
        : amountFormatter({template: `${privacyPlaceholder} {{ticker}}`})(
            amount,
          ),
    [amount, ignorePrivacy, isPrivacyActive, privacyPlaceholder],
  )

  return (
    <CenteredRow>
      <Text
        style={[a.body_1_lg_medium, {color: p.gray_900}]}
        testID="balanceText"
      >
        {balance}
      </Text>
    </CenteredRow>
  )
}

const CenteredRow = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.justify_center, a.align_center]}>{children}</View>
}
