import {useTheme} from '@yoroi/theme'
import {PortfolioTokenBalances} from '@yoroi/types/lib/typescript/portfolio/balances'
import * as React from 'react'
import {FlatList, Text, View} from 'react-native'

import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {BalanceCard} from '~/ui/BalanceCard/BalanceCard'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'
import {useStrings} from '~/kernel/i18n/useStrings'

export const WalletBalance = ({
  image,
  plate,
  name,
}: {
  image: string
  plate: string
  name: string
}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const ftList = balances.fts ?? []
  const nftsList = balances.nfts ?? []
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_1]}>
      <Container>
        <Icon.WalletAvatar
          style={[{height: 80, width: 80}]}
          image={image}
          size={80}
        />
      </Container>

      <Space.Height.sm />

      <Container>
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {name}
        </Text>
      </Container>

      <Container>
        <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
          {plate}
        </Text>
      </Container>

      <Space.Height.lg />

      <BalanceCard />

      <Space.Height.lg />

      <TokenSquares>
        <TokenSquare
          count={ftList.length}
          list={ftList}
          title={strings.txReview.walletBalanceTokensTitle}
        />

        <Space.Width.lg />

        <TokenSquare
          count={nftsList.length}
          list={nftsList}
          title={strings.txReview.walletBalanceNFTsTitle}
        />
      </TokenSquares>
    </View>
  )
}

const TokenSquare = ({
  title,
  count,
  list,
}: {
  title: string
  count: number
  list: PortfolioTokenBalances['fts'] | PortfolioTokenBalances['nfts']
}) => {
  const {palette: p} = useTheme()

  if (list.length == 0) {
    return (
      <View
        style={[
          a.rounded_sm,
          a.flex_1,
          a.border,
          a.p_lg,
          {aspectRatio: 1},
          {borderColor: p.gray_200},
        ]}
      >
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {title}
        </Text>

        <Space.Height._2xs fill />

        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>-</Text>
      </View>
    )
  }

  return (
    <View
      style={[
        a.rounded_sm,
        a.flex_1,
        a.border,
        a.p_lg,
        {aspectRatio: 1},
        {borderColor: p.gray_200},
      ]}
    >
      <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
        {title}
      </Text>

      <Space.Height._2xs fill />

      <Text style={[a.heading_1_medium, {color: p.text_gray_max}]}>
        {count}
      </Text>

      <TokenList assetList={list} />
    </View>
  )
}

const TokenSquares = ({children}: {children: React.ReactNode}) => {
  return (
    <View style={[a.w_full, a.flex_1, a.flex_row, a.px_lg]}>{children}</View>
  )
}

const Container = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.align_center]}>{children}</View>
}

const TokenList = ({
  assetList,
}: {
  assetList: PortfolioTokenBalances['fts'] | PortfolioTokenBalances['nfts']
}) => {
  return (
    <FlatList
      horizontal
      data={assetList}
      style={[{maxHeight: 40}]}
      ItemSeparatorComponent={() => <Space.Width.sm />}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.info.id}
      renderItem={({item}) => <TokenInfoIcon info={item.info} size="lg" />}
    />
  )
}
