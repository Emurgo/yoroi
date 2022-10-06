import BigNumber from 'bignumber.js'
import React from 'react'
import {useIntl} from 'react-intl'
import {View} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import {Boundary, Spacer, Text} from '../components'
import {useTokenInfo} from '../hooks'
import globalMessages from '../i18n/global-messages'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {isEmptyString} from '../legacy/utils'
import {useSelectedWallet} from '../SelectedWallet'
import {YoroiWallet} from '../yoroi-wallets'
import {calcLockedDeposit} from '../yoroi-wallets/cardano/assetUtils'
import {Quantity, Token} from '../yoroi-wallets/types'

type Props = {
  privacyMode?: boolean
}

export const LockedDeposit = ({privacyMode}: Props) => {
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})
  const loadingAmount = formatTokenWithTextWhenHidden('...', tokenInfo)
  const hiddenAmount = formatTokenWithTextWhenHidden('*.******', tokenInfo)

  if (privacyMode) return <FormattedAmount amount={hiddenAmount} />

  return (
    <Boundary
      loading={{
        fallback: <FormattedAmount amount={loadingAmount} />,
      }}
      error={{size: 'inline'}}
    >
      <LockedAmount tokenInfo={tokenInfo} />
    </Boundary>
  )
}

const LockedAmount = ({tokenInfo}: {tokenInfo: Token}) => {
  const wallet = useSelectedWallet()
  const lockedAmount = useLockedAmount({wallet})
  const amount = formatTokenWithText(new BigNumber(!isEmptyString(lockedAmount) ? lockedAmount : 0), tokenInfo)

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

/**
 * Calculate the lovelace locked up to hold utxos with assets
 * Important `minAdaRequired` is missing `has_hash_data`
 * which could be adding 10 in size to calc the words of the utxo
 *
 * @summary Returns the locked amount in Lovelace
 */
export const useLockedAmount = (
  {wallet}: {wallet: YoroiWallet},
  options?: UseQueryOptions<Quantity, Error, Quantity, [string, 'lockedAmount']>,
) => {
  const query = useQuery({
    ...options,
    suspense: true,
    queryKey: [wallet.id, 'lockedAmount'],
    queryFn: () =>
      wallet
        .fetchUTXOs()
        .then((utxos) => calcLockedDeposit(utxos, wallet.networkId))
        .then((amount) => amount.toString() as Quantity),
  })

  if (query.data == null) throw new Error('invalid state')

  return query.data
}
