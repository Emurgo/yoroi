import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {makeList} from '../../../../../utils'
import {TokenEmptyList} from '../../../common/TokenEmptyList'
import {IOpenOrders} from '../../../common/useGetOpenOrders'
import {useShowOpenOrderModal} from '../../../common/useShowOpenOrderModal'
import {useStrings} from '../../../common/useStrings'
import {DAppTokenITem} from './DAppTokenItem/DAppTokenItem'

type Props = {
  tokensList: IOpenOrders[]
  isLoading: boolean
  isSearching: boolean
}
export const OpenOrdersTab = ({isLoading, tokensList, isSearching}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const hasEmpty = tokensList.length === 0

  const {onShow} = useShowOpenOrderModal()

  const onTokenPress = (order?: IOpenOrders) => {
    if (!order) return
    onShow(order)
  }

  const renderTokenItem = (item: IOpenOrders | undefined, index: number) => {
    return (
      <DAppTokenITem
        onPress={() => onTokenPress(item)}
        key={item?.id ?? index}
        tokenInfo={item ? item : undefined}
        splitTokenSymbol="/"
      />
    )
  }

  const renderHeaderList = () => {
    if (isLoading || hasEmpty) return null
    if (isSearching)
      return (
        <View>
          <Text style={styles.textAvailable}>{strings.countOpenOrders(tokensList.length)}</Text>

          <Spacer height={16} />
        </View>
      )

    return null
  }

  const renderFooterList = () => {
    if (isLoading)
      return (
        <View style={styles.containerLoading}>{makeList(3).map((_, index) => renderTokenItem(undefined, index))}</View>
      )

    if (tokensList.length === 0) return <TokenEmptyList emptyText={strings.noDataFound} />
    return null
  }

  return (
    <View style={styles.root}>
      <Spacer height={16} />

      <FlatList
        scrollEnabled={false}
        data={tokensList}
        ListHeaderComponent={renderHeaderList()}
        ListFooterComponent={renderFooterList()}
        ItemSeparatorComponent={() => <Spacer width={8} />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => renderTokenItem(item, index)}
      />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
    },
    containerLoading: {
      ...atoms.gap_lg,
    },
    textAvailable: {
      ...atoms.body_2_md_regular,
      color: color.gray_c700,
    },
  })

  return {styles} as const
}
