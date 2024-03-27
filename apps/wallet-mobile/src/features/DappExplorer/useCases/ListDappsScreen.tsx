import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button} from '../../../components'
import {useNavigateTo} from '../common/navigation'

export const ListDappsScreen = () => {
  const navigateTo = useNavigateTo()
  return (
    <View style={styles.root}>
      <Button
        title="Go to Web Browser"
        shelleyTheme
        onPress={() => {
          navigateTo.webBrowser()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
