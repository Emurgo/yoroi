import {useTheme} from '@yoroi/theme'
import {PortfolioTokenBalances} from '@yoroi/types/lib/typescript/portfolio/balances'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {Space} from '../../../components/Space/Space'
import {usePortfolioBalances} from '../../Portfolio/common/hooks/usePortfolioBalances'
import {TokenInfoIcon} from '../../Portfolio/common/TokenAmountItem/TokenInfoIcon'
import {BalanceCard} from '../../Portfolio/useCases/PortfolioDashboard/BalanceCard/BalanceCard'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './hooks/useStrings'

export const WalletBalance = ({image, plate, name}: {image: string; plate: string; name: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const ftList = balances.fts ?? []
  const nftsList = balances.nfts ?? []

  return (
    <View style={styles.root}>
      <Container>
        <Icon.WalletAvatar style={styles.walletChecksum} image={image} size={80} />
      </Container>

      <Space height="sm" />

      <Container>
        <Text style={styles.name}>{name}</Text>
      </Container>

      <Container>
        <Text style={styles.plate}>{plate}</Text>
      </Container>

      <Space height="lg" />

      <BalanceCard />

      <Space height="lg" />

      <TokenSquares>
        <TokenSquare count={ftList.length} list={ftList} title={strings.walletBalanceTokensTitle} />

        <Space width="lg" />

        <TokenSquare count={nftsList.length} list={nftsList} title={strings.walletBalanceNFTsTitle} />
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
  const {styles} = useStyles()

  if (list.length == 0) {
    return (
      <View style={styles.square}>
        <Text style={styles.squareTitle}>{title}</Text>

        <Space fill />

        <Text style={styles.squareTitle}>-</Text>
      </View>
    )
  }

  return (
    <View style={styles.square}>
      <Text style={styles.squareTitle}>{title}</Text>

      <Space fill />

      <Text style={styles.squareCount}>{count}</Text>

      <TokenList assetList={list} />
    </View>
  )
}

const TokenSquares = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()

  return <View style={styles.squares}>{children}</View>
}

const Container = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.container}>{children}</View>
}

const TokenList = ({assetList}: {assetList: PortfolioTokenBalances['fts'] | PortfolioTokenBalances['nfts']}) => {
  const {styles} = useStyles()

  return (
    <FlatList
      horizontal
      data={assetList}
      style={styles.assetList}
      ItemSeparatorComponent={() => <Space width="sm" />}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.info.id}
      renderItem={({item}) => <TokenInfoIcon info={item.info} size="md" />}
    />
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
    },
    container: {
      ...atoms.align_center,
    },
    walletChecksum: {
      height: 80,
      width: 80,
    },
    name: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    plate: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
    },
    squares: {
      ...atoms.w_full,
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.px_lg,
    },
    square: {
      ...atoms.rounded_sm,
      ...atoms.flex_1,
      ...atoms.border,
      ...atoms.p_lg,
      borderColor: color.gray_200,
      aspectRatio: 1,
    },
    squareTitle: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    squareCount: {
      ...atoms.heading_1_medium,
      color: color.text_gray_max,
    },
    assetList: {
      maxHeight: 40,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
