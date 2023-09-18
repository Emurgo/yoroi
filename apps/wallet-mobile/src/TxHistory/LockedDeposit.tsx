import React from 'react'
import {useIntl} from 'react-intl'
import {View} from 'react-native'

import {Boundary, Spacer, Text} from '../components'
import {usePrivacyMode} from '../features/Settings/PrivacyMode/PrivacyMode'
import globalMessages from '../i18n/global-messages'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {useSelectedWallet} from '../SelectedWallet'
import {Amounts} from '../yoroi-wallets/utils'

export const LockedDeposit = () => {
  const {isPrivacyOff} = usePrivacyMode()
  const wallet = useSelectedWallet()
  const loadingAmount = formatTokenWithTextWhenHidden('...', wallet.primaryToken)
  const hiddenAmount = formatTokenWithTextWhenHidden('*.******', wallet.primaryToken)

  if (isPrivacyOff) return <FormattedAmount amount={hiddenAmount} />

  return (
    <Boundary
      loading={{
        fallback: <FormattedAmount amount={loadingAmount} />,
      }}
      error={{size: 'inline'}}
    >
      <LockedAmount />
    </Boundary>
  )
}

const LockedAmount = () => {
  const wallet = useSelectedWallet()
  const lockedAmount = Amounts.getAmount(wallet.portfolio.primary.locked, wallet.primaryTokenInfo.id)
  const amount = formatTokenWithText(lockedAmount.quantity, wallet.primaryToken)
  return <FormattedAmount amount={amount} />
}

const FormattedAmount = ({amount}: {amount: string}) => {
  return (
    <Row>
      <Label />

      <Spacer width={4} />

      <Text style={{fontFamily: 'Rubik-Medium', color: '#242838', fontSize: 12}}>{amount}</Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  return <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>{children}</View>
}

const Label = () => {
  const strings = useStrings()

  return <Text style={{color: '#242838'}}>{strings.lockedDeposit}:</Text>
}

const useStrings = () => {
  const intl = useIntl()

  return {
    lockedDeposit: intl.formatMessage(globalMessages.lockedDeposit),
  }
}
