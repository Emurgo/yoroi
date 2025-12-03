import {Quantities} from '@yoroi/cardano-wallet/utils/utils'
import {useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {Chain} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import BigNumber from 'bignumber.js'
import * as React from 'react'

import {ExchangeAmountCard} from '~/features/Exchange/common/ExchangeAmountCard/ExchangeAmountCard'
import {usePortfolioPrimaryBalance} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

export const EditAmount = ({disabled}: {disabled?: boolean}) => {
  const strings = useStrings()
  const {numberLocale} = useLanguage()
  const {
    selected: {network},
  } = useWalletManager()

  const isPreprod = network === Chain.Network.Preprod

  const {wallet} = useSelectedWallet()
  const balance = usePortfolioPrimaryBalance({wallet})

  const {amount, orderType, amountInputChanged, provider, providerId} =
    useExchange()
  const providers = useExchangeProvidersByOrderType({
    orderType,
    providerListByOrderType: provider.list.byOrderType,
  })

  const onChangeAmountQuantity = React.useCallback(
    (text: string) => {
      const [input, quantity] = Quantities.parseFromText(
        text,
        balance.info.decimals,
        numberLocale,
      )
      const newValue = +quantity
      const displayValue = text === '' ? '' : input

      let inputErrorMessage = null

      if (orderType === 'sell') {
        const isNotEnoughBalance = new BigNumber(newValue).isGreaterThan(
          new BigNumber(balance.quantity.toString()),
        )
        if (isNotEnoughBalance)
          inputErrorMessage = strings.exchange.notEnoughBalance
      }

      if (orderType === 'buy') {
        const providerSelected = Object.fromEntries(providers)[providerId]
        const minAda = providerSelected?.supportedOrders?.buy?.min ?? 0
        if (newValue > 0 && newValue < minAda && orderType === 'buy')
          inputErrorMessage = strings.exchange.minAdaRequired
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
      strings.exchange.notEnoughBalance,
      strings.exchange.minAdaRequired,
      amountInputChanged,
      amount,
    ],
  )

  if (isPreprod) return null

  return (
    <>
      <Space.Height.xl />

      <ExchangeAmountCard
        label={strings.exchange.amountTitle}
        onChange={onChangeAmountQuantity}
        value={amount.displayValue}
        touched={true}
        amount={balance}
        error={amount.error ?? undefined}
        inputEditable={!disabled}
      />
    </>
  )
}
