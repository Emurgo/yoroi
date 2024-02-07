import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Boundary, Spacer, Text} from '../components'
import {usePrivacyMode} from '../features/Settings/PrivacyMode/PrivacyMode'
import globalMessages from '../i18n/global-messages'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {useSelectedWallet} from '../SelectedWallet'
import {useLockedAmount} from '../yoroi-wallets/hooks'

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
  const lockedAmount = useLockedAmount({wallet})
  const amount = formatTokenWithText(lockedAmount, wallet.primaryToken)
  return <FormattedAmount amount={amount} />
}

const FormattedAmount = ({amount}: {amount: string}) => {
  return (
    <Row>
      <Label />

      <Spacer width={4} />

      <Text style={styles.label}>{amount}</Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  return <View style={styles.root}>{children}</View>
}

const Label = () => {
  const strings = useStrings()

  return <Text style={styles.label}>{strings.lockedDeposit}:</Text>
}

const useStrings = () => {
  const intl = useIntl()

  return {
    lockedDeposit: intl.formatMessage(globalMessages.lockedDeposit),
  }
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#6B7384',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
  },
})
