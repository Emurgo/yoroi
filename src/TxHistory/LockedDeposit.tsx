import BigNumber from 'bignumber.js'
import React from 'react'
import {useIntl} from 'react-intl'
import {View} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'
import {useSelector} from 'react-redux'

import {Boundary, Spacer, Text} from '../components'
import globalMessages from '../i18n/global-messages'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {availableAssetsSelector, tokenBalanceSelector} from '../legacy/selectors'
import {useSelectedWallet} from '../SelectedWallet'
import {Token} from '../types'
import {YoroiWallet} from '../yoroi-wallets'
import {calcLockedDeposit} from '../yoroi-wallets/cardano/assetUtils'

type Props = {
  privacyMode?: boolean
}

export function LockedDeposit({privacyMode}: Props) {
  const availableAssets = useSelector(availableAssetsSelector)
  const tokenBalance = useSelector(tokenBalanceSelector)
  const token = availableAssets[tokenBalance.getDefaultId()]
  const loadingAmount = formatTokenWithTextWhenHidden('...', token)
  const hiddenAmount = formatTokenWithTextWhenHidden('*.******', token)

  if (privacyMode) return <FormattedAmount amount={hiddenAmount} />

  return (
    <Boundary
      loading={{
        fallback: <FormattedAmount amount={loadingAmount} />,
      }}
    >
      <LockedAmount token={token} />
    </Boundary>
  )
}

function LockedAmount({token}: {token: Token}) {
  const wallet = useSelectedWallet()
  const lockedAmount = useLockedAmount({
    wallet,
  })
  const amount = formatTokenWithText(new BigNumber(lockedAmount || 0), token)

  return <FormattedAmount amount={amount} />
}

function FormattedAmount({amount}: {amount: string}) {
  return (
    <Row>
      <Label />
      <Spacer width={4} />
      <Text style={{fontFamily: 'Rubik-Medium', color: '#242838', fontSize: 12}}>{amount}</Text>
    </Row>
  )
}

function Row({children}: {children: React.ReactNode}) {
  return <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>{children}</View>
}

function Label() {
  const strings = useStrings()

  return <Text style={{color: '#242838'}}>{strings.lockedDeposit}:</Text>
}

function useStrings() {
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
export function useLockedAmount({wallet}: {wallet: YoroiWallet}, options?: UseQueryOptions<string, Error>) {
  const query = useQuery({
    suspense: true,
    queryKey: [wallet.id, 'lockedAmount'],
    ...options,
    queryFn: () =>
      wallet
        .fetchUTXOs()
        .then((utxos) => calcLockedDeposit(utxos, wallet.networkId))
        .then((amount) => amount.toString()),
  })

  return query.data
}
