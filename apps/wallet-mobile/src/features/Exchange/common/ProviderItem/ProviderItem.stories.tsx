import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {lightPalette} from '@yoroi/theme'
import {Exchange} from '@yoroi/types'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon} from '../../../../components'
import {ProviderItem} from './ProviderItem'

storiesOf('Exchange ProviderItem', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Default', () => (
    <ProviderItem
      provider={Exchange.Provider.Banxa}
      fee={5}
      icon={<Icon.Check color={lightPalette.primary[600]} />}
      onPress={action('Provider Item Pressed')}
    />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
