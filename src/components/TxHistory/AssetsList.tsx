import React from 'react'
import {useIntl} from 'react-intl'
import {Alert, StyleSheet, View} from 'react-native'

import {actionMessages} from '../../../legacy/i18n/global-messages'
import {TxListActionsBanner} from './TxListActionsBanner'

// type Props = {
//   refreshing: boolean
//   onRefresh: () => void
// }

export const AssetsList = () => {
  const strings = useStrings()
  const handlePress = () => Alert.alert(strings.soon, strings.soon)

  return (
    <View style={styles.listRoot}>
      <TxListActionsBanner
        actions="assets"
        onPressNFTs={handlePress}
        onPressTokens={handlePress}
        onSearch={handlePress}
      />
      {/* <SectionList
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={() => <View />}
        renderSectionHeader={() => <View />}
        sections={['1']}
        keyExtractor={() => 'asset-id-key'}
        stickySectionHeadersEnabled={false}
      /> */}
    </View>
  )
}

// NOTE: layout is following inVision spec
// https://projects.invisionapp.com/d/main?origin=v7#/console/21500065/456867605/inspect?scrollOffset=2856#project_console
const styles = StyleSheet.create({
  listRoot: {
    flex: 1,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    soon: intl.formatMessage(actionMessages.soon),
  }
}
