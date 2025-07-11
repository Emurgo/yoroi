import {useTheme} from '@yoroi/theme'
import {PortfolioTokenBalances} from '@yoroi/types/lib/typescript/portfolio/balances'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../ui/Icon'
import {Space} from '../../../ui/Space/Space'
import {usePortfolioBalances} from '../../Portfolio/common/hooks/usePortfolioBalances'
import {TokenInfoIcon} from '../../../ui/TokenInfoIcon/TokenInfoIcon'
import {BalanceCard} from '../../../ui/BalanceCard/BalanceCard'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './hooks/useStrings'

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
  const {color} = useTheme()

  return (
    <View style={styles.root}>
      <Container>
        <Icon.WalletAvatar
          style={styles.walletChecksum}
          image={image}
          size={80}
        />
      </Container>

      <Space height="sm" />

      <Container>
        <Text style={[styles.name, {color: color.text_gray_medium}]}>{name}</Text>
      </Container>

      <Container>
        <Text style={[styles.plate, {color: color.text_gray_low}]}>{plate}</Text>
      </Container>

      <Space height="lg" />

      <BalanceCard />

      <Space height="lg" />

      <TokenSquares>
        <TokenSquare
          count={ftList.length}
          list={ftList}
          title={strings.walletBalanceTokensTitle}
        />

        <Space width="lg" />

        <TokenSquare
          count={nftsList.length}
          list={nftsList}
          title={strings.walletBalanceNFTsTitle}
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
  const {color} = useTheme()

  if (list.length == 0) {
    return (
      <View style={[styles.square, {borderColor: color.gray_200}]}>
        <Text style={[styles.squareTitle, {color: color.text_gray_medium}]}>{title}</Text>

        <Space fill />

        <Text style={[styles.squareTitle, {color: color.text_gray_medium}]}>-</Text>
      </View>
    )
  }

  return (
    <View style={[styles.square, {borderColor: color.gray_200}]}>
      <Text style={[styles.squareTitle, {color: color.text_gray_medium}]}>{title}</Text>

      <Space fill />

      <Text style={[styles.squareCount, {color: color.text_gray_max}]}>{count}</Text>

      <TokenList assetList={list} />
    </View>
  )
}

const TokenSquares = ({children}: {children: React.ReactNode}) => {
  return <View style={styles.squares}>{children}</View>
}

const Container = ({children}: {children: React.ReactNode}) => {
  return <View style={styles.container}>{children}</View>
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
      style={styles.assetList}
      ItemSeparatorComponent={() => <Space width="sm" />}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.info.id}
      renderItem={({item}) => <TokenInfoIcon info={item.info} size="lg" />}
    />
  )
}

const styles = StyleSheet.create({
  root: {
    ...a.flex_1,
  },
  container: {
    ...a.align_center,
  },
  walletChecksum: {
    height: 80,
    width: 80,
  },
  name: {
    ...a.body_1_lg_medium,
  },
  plate: {
    ...a.body_2_md_regular,
  },
  squares: {
    ...a.w_full,
    ...a.flex_1,
    ...a.flex_row,
    ...a.px_lg,
  },
  square: {
    ...a.rounded_sm,
    ...a.flex_1,
    ...a.border,
    ...a.p_lg,
    aspectRatio: 1,
  },
  squareTitle: {
    ...a.body_1_lg_medium,
  },
  squareCount: {
    ...a.heading_1_medium,
  },
  assetList: {
    maxHeight: 40,
  },
})