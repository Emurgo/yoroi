import {amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {usePortfolioPrimaryBalance} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {usePrivacyMode} from '~/features/Settings/hooks/usePrivacyMode'
import {ResetErrorRef} from '~/ui/Boundary/Boundary'
import {Icon} from '~/ui/Icon'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {Space} from '~/ui/Space/Space'

export const BalanceBanner = React.forwardRef<ResetErrorRef>((_, ref) => {
  const {wallet, meta} = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {toggleIsPrivacyModeEnabled} = usePrivacyMode()

  return (
    <View>
      <Space.Height.sm />

      <CenteredRow>
        <Icon.WalletAvatar
          style={{height: 40, width: 40, borderRadius: 20}}
          image={meta.avatar}
          size={40}
        />
      </CenteredRow>

      <Space.Height.sm />

      <TouchableOpacity
        onPress={() => toggleIsPrivacyModeEnabled()}
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
  const {isPrivacyModeEnabled, privacyPlaceholder} = usePrivacyMode()
  const {palette: p} = useTheme()

  const balance = React.useMemo(
    () =>
      !isPrivacyModeEnabled || ignorePrivacy === true
        ? amountFormatter({template: '{{value}} {{ticker}}'})(amount)
        : amountFormatter({template: `${privacyPlaceholder} {{ticker}}`})(
            amount,
          ),
    [amount, ignorePrivacy, isPrivacyModeEnabled, privacyPlaceholder],
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
