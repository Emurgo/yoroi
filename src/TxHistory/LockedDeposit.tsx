import BigNumber from 'bignumber.js'
import React from 'react'
import {useIntl} from 'react-intl'
import {View} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'
import {useSelector} from 'react-redux'

import {Boundary, Spacer, Text} from '../components'
import globalMessages from '../i18n/global-messages'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {getCardanoNetworkConfigById} from '../legacy/networks'
import {availableAssetsSelector, tokenBalanceSelector} from '../legacy/selectors'
import {cardanoValueFromRemoteFormat} from '../legacy/utils'
import {useSelectedWallet} from '../SelectedWallet'
import {BigNum, minAdaRequired, YoroiWallet} from '../yoroi-wallets'

type Props = {
  privacyMode?: boolean
}

export function LockedDeposit({privacyMode}: Props) {
  const wallet = useSelectedWallet()
  const lockedAmount = useLockedAmount({
    wallet,
  })
  const availableAssets = useSelector(availableAssetsSelector)
  const tokenBalance = useSelector(tokenBalanceSelector)
  const token = availableAssets[tokenBalance.getDefaultId()]

  const loadingAmount = formatTokenWithTextWhenHidden('...', token)
  const hiddenAmount = formatTokenWithTextWhenHidden('*.******', token)
  const amount = formatTokenWithText(new BigNumber(lockedAmount || 0), token)

  if (privacyMode) return <FormattedLockedAmount amount={hiddenAmount} />

  return (
    <Boundary
      loading={{
        fallback: <FormattedLockedAmount amount={loadingAmount} />,
      }}
    >
      <FormattedLockedAmount amount={amount} />
    </Boundary>
  )
}

function FormattedLockedAmount({amount}: {amount: string}) {
  return (
    <AlignHorizontal>
      <Label />
      <Spacer width={4} />
      <Text style={{fontFamily: 'Rubik-Medium', color: '#242838', fontSize: 12}}>{amount}</Text>
    </AlignHorizontal>
  )
}

function AlignHorizontal({children}: {children: React.ReactNode}) {
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
    queryFn: async () => {
      const networkConfig = getCardanoNetworkConfigById(wallet.networkId)
      const minUtxoValue = await BigNum.fromStr(networkConfig.MINIMUM_UTXO_VAL)
      const utxos = await wallet.fetchUTXOs()
      const utxosWithAssets = utxos.filter((u) => u.assets.length > 0)
      const promises = utxosWithAssets.map(async (u) => {
        return await cardanoValueFromRemoteFormat(u)
          .then((v) => minAdaRequired(v, minUtxoValue))
          .then((v) => v.toStr())
      })
      const results = await Promise.all(promises)
      const totalLocked = results.reduce((acc, v) => acc.plus(v), new BigNumber(0))

      return totalLocked.toString()
    },
  })

  return query.data
}
