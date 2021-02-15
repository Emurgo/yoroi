// @flow

import React from 'react'
import {Text, View, FlatList, TouchableOpacity} from 'react-native'
import type {Node} from 'react'
import baseStyle from './base.style'
import assetListTransactionStyle from './assetListTransaction.style'

type nodeStyle = typeof baseStyle | typeof assetListTransactionStyle

// to be updated later
type tokenType = {|
  assetName: string,
  assetId: string,
  balance: string,
|}

type props = {
  assets: Array<any>,
  styles: nodeStyle,
  onSelect?: (tokenType) => any,
}

const assetRow: ({|
  styles: nodeStyle,
  assetName: string,
  assetId: string,
  balance: any, // TODO
  isLast: boolean,
  backColor: {|backgroundColor: string|},
  onSelect?: (tokenType) => any,
|}) => Node = ({styles, assetName, assetId, balance, backColor, onSelect}) => {
  const item = (
    <>
      <View>
        <Text style={styles.assetName}>{assetName}</Text>
        <Text style={styles.assetMeta}>{assetId}</Text>
      </View>
      <View>
        <Text style={styles.assetBalance}>{balance}</Text>
      </View>
    </>
  )

  if (onSelect == null) {
    return (
      <View style={[styles.assetRow, styles.py5, styles.px5, backColor]}>
        {item}
      </View>
    )
  } else {
    return (
      <TouchableOpacity
        onPress={() => onSelect({assetName, assetId, balance})}
        style={[styles.assetRow, styles.py5, styles.px5, backColor]}
      >
        {item}
      </TouchableOpacity>
    )
  }
}

const AssetList: (props) => Node = ({assets, styles, onSelect}) => {
  const colors = [styles.rowColor1, styles.rowColor2]

  return (
    <View>
      <View style={styles.assetTitle}>
        <Text style={styles.assetHeading}>Assets</Text>
        <Text style={styles.assetHeading}>Amount</Text>
      </View>
      <View>
        <FlatList
          data={assets}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) =>
            assetRow({
              ...item,
              styles,
              backColor: colors[index % colors.length],
              onSelect,
            })
          }
        />
      </View>
    </View>
  )
}
export default AssetList
