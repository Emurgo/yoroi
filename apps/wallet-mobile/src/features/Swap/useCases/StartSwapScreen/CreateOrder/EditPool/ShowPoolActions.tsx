import {getMinAdaReceiveAfterSlippage, useSwap} from '@yoroi/swap'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {
  ExpandableInfoCard,
  HeaderWrapper,
  HiddenInfoWrapper,
  MainInfoWrapper,
  Spacer,
} from '../../../../../../components'
import {useLanguage} from '../../../../../../i18n'
import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../../common/navigation'
import {PoolIcon} from '../../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../../../../common/SwapFormProvider'
import {BottomSheetState} from '../CreateOrder'

export const ShowPoolActions = ({openDialog}: {openDialog: ({title, content}: BottomSheetState) => void}) => {
  const navigateTo = useNavigateTo()
  const {numberLocale} = useLanguage()
  const {createOrder} = useSwap()
  const strings = useStrings()
  const {isBuyTouched, isSellTouched, isPoolTouched} = useSwapTouched()
  const {selectedPool, amounts} = createOrder
  const wallet = useSelectedWallet()
  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const tokenName = buyTokenInfo.ticker ?? buyTokenInfo.name
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

  if (!isBuyTouched || !isSellTouched || selectedPool === undefined) {
    return <></>
  }

  const totalAmount = Quantities.format(amounts.buy.quantity, buyTokenInfo.decimals ?? 0)
  const id = selectedPool.poolId
  const expanded = id === hiddenInfoOpenId

  const poolProviderFormatted = capitalize(selectedPool.provider)
  const poolStatus = isPoolTouched ? '' : ` ${strings.autoPool}`
  const poolTitle = `${poolProviderFormatted}${poolStatus}`

  return (
    <ExpandableInfoCard
      key={id}
      header={
        <Header
          onPressExpand={() => setHiddenInfoOpenId(hiddenInfoOpenId !== id ? id : null)}
          onPressLabel={() => {
            if (createOrder.type === 'limit') {
              navigateTo.selectPool()
            } else {
              setHiddenInfoOpenId(hiddenInfoOpenId !== id ? id : null)
            }
          }}
          expanded={expanded}
        >
          <View style={styles.flex}>
            <PoolIcon size={25} providerId={selectedPool.provider} />

            <Spacer width={10} />

            <Text>{poolTitle}</Text>
          </View>
        </Header>
      }
      info={
        <HiddenInfo
          totalFees={Quantities.format(selectedPool.batcherFee.quantity, Number(wallet.primaryTokenInfo.decimals))}
          minReceived={getMinAdaReceiveAfterSlippage(
            amounts.buy.quantity,
            createOrder.slippage,
            buyTokenInfo.decimals ?? 0,
            numberLocale,
          )}
          minAda={Quantities.format(selectedPool.deposit.quantity, Number(wallet.primaryTokenInfo.decimals))}
          buyTokenName={tokenName}
          openDialog={openDialog}
        />
      }
      expanded={expanded}
    >
      <MainInfo totalAmount={totalAmount} tokenName={tokenName} />
    </ExpandableInfoCard>
  )
}

const Header = ({
  children,
  expanded,
  onPressExpand,
  onPressLabel,
}: {
  children: React.ReactNode
  expanded?: boolean
  onPressExpand: () => void
  onPressLabel: () => void
}) => {
  return (
    <HeaderWrapper expanded={expanded} onPress={onPressExpand}>
      <TouchableOpacity onPress={onPressLabel}>{children}</TouchableOpacity>
    </HeaderWrapper>
  )
}

const HiddenInfo = ({
  totalFees,
  minAda,
  minReceived,
  buyTokenName,
  openDialog,
}: {
  totalFees: string
  minAda: string
  minReceived: string
  buyTokenName: string
  openDialog: ({title, content}: BottomSheetState) => void
}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  return (
    <View>
      {[
        {
          label: strings.swapMinAdaTitle,
          value: `${minAda} ${wallet.primaryTokenInfo.ticker}`,
          info: strings.swapMinAda,
        },
        {
          label: strings.swapMinReceivedTitle,
          value: `${minReceived} ${buyTokenName}`,
          info: strings.swapMinReceived,
        },
        {
          label: strings.swapFeesTitle,
          value: `${totalFees} ${wallet.primaryTokenInfo.ticker}`,
          info: strings.swapFees,
        },
      ].map((item) => (
        <HiddenInfoWrapper
          key={item.label}
          value={item.value}
          label={item.label}
          info={item.info}
          onPress={() => openDialog({title: item.label, content: item.info})}
        />
      ))}
    </View>
  )
}

const MainInfo = ({totalAmount, tokenName}: {totalAmount: string; tokenName: string}) => {
  const strings = useStrings()

  return (
    <View>
      {[{label: `${strings.total} ${totalAmount} ${tokenName} `}].map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} isLast={index === 0} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
