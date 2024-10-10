import {useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {Chain} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'

import {Space} from '../../../../../components/Space/Space'
import {useLanguage} from '../../../../../kernel/i18n'
import {Quantities} from '../../../../../yoroi-wallets/utils/utils'
import {usePortfolioPrimaryBalance} from '../../../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {AmountCard} from '../../../common/AmountCard/AmountCard'
import {useStrings} from '../../../common/useStrings'

export const EditAmount = ({disabled}: {disabled?: boolean}) => {
  const strings = useStrings()
  const {numberLocale} = useLanguage()
  const {
    selected: {network},
  } = useWalletManager()

  const isPreprod = network === Chain.Network.Preprod
  const isSancho = network === Chain.Network.Sancho

  const {wallet} = useSelectedWallet()
  const balance = usePortfolioPrimaryBalance({wallet})

  const {amount, orderType, amountInputChanged, provider, providerId} = useExchange()
  const providers = useExchangeProvidersByOrderType({orderType, providerListByOrderType: provider.list.byOrderType})

  const onChangeAmountQuantity = React.useCallback(
    (text: string) => {
      const [input, quantity] = Quantities.parseFromText(text, balance.info.decimals, numberLocale)
      const newValue = +quantity
      const displayValue = text === '' ? '' : input

      let inputErrorMessage = null

      if (orderType === 'sell') {
        const isNotEnoughBalance = new BigNumber(newValue).isGreaterThan(new BigNumber(balance.quantity.toString()))
        if (isNotEnoughBalance) inputErrorMessage = strings.notEnoughBalance
      }

      if (orderType === 'buy') {
        const providerSelected = Object.fromEntries(providers)[providerId]
        const minAda = providerSelected?.supportedOrders?.buy?.min ?? 0
        if (newValue > 0 && newValue < minAda && orderType === 'buy') inputErrorMessage = strings.minAdaRequired
      }

      const canExchange = inputErrorMessage == null && displayValue !== ''

      amountInputChanged(
        {
          ...amount,
          error: inputErrorMessage,
          displayValue,
          value: +quantity,
        },
        canExchange,
      )
    },
    [
      numberLocale,
      balance,
      providers,
      providerId,
      orderType,
      strings.notEnoughBalance,
      strings.minAdaRequired,
      amountInputChanged,
      amount,
    ],
  )

  if (isPreprod || isSancho) return null

  return (
    <>
      <Space height="xl" />

      <AmountCard
        label={strings.amountTitle}
        onChange={onChangeAmountQuantity}
        value={amount.displayValue}
        touched={true}
        amount={balance}
        error={amount.error ?? ''}
        inputEditable={!disabled}
      />
    </>
  )
}
