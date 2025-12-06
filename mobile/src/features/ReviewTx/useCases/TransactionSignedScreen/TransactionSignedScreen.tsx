import {atoms as a, useTheme} from '@yoroi/theme'

import {useRoute} from '@react-navigation/native'
import * as FileSystem from 'expo-file-system'
import * as React from 'react'
import {Alert, ScrollView, Text, View} from 'react-native'
import Share from 'react-native-share'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

export const TransactionSignedScreen = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()
  const route = useRoute()
  const params = route.params as ReviewTxRoutes['transaction-signed']
  const jsonString = params?.jsonString || ''

  const handleExport = React.useCallback(async () => {
    if (!jsonString) return
    try {
      const fileName = `yoroi-transaction-${Date.now()}.json`
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      })

      await Share.open({
        url: `file://${fileUri}`,
        type: 'application/json',
        title: strings.setupWallet.transactionExported,
        filename: fileName,
      })
    } catch (error) {
      // User cancelled or error occurred - ignore cancellation
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message)
        if (
          !errorMessage.includes('User did not share') &&
          !errorMessage.includes('User cancelled')
        ) {
          Alert.alert(strings.setupWallet.shareError, errorMessage)
        }
      }
    }
  }, [jsonString, strings])

  return (
    <SafeArea edges={['bottom']} style={[a.flex_1]}>
      <ScrollView
        contentContainerStyle={[a.p_lg]}
        bounces={false}
        style={[a.flex_1]}
      >
        <View style={[a.gap_md]}>
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
              {strings.setupWallet.transactionExported}
            </Text>
            <Copiable text={jsonString} />
          </View>

          <Space.Height.md />

          <View
            style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_lg]}
          >
            <Text
              style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
              selectable
            >
              {jsonString}
            </Text>
          </View>

          <Space.Height.lg />

          <Button
            type={ButtonType.Secondary}
            title={strings.setupWallet.export}
            onPress={handleExport}
          />
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <Button
          title={strings.txReview.submittedTxButton}
          onPress={resetToTxHistory}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
