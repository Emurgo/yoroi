import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon} from '../../../../components'
import {BanxaLogo} from '../../illustrations/BanxaLogo'
import {ProviderItem} from './ProviderItem'

storiesOf('Exchange ProviderItem', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Default', () => (
    <ProviderItem
      label="Banxa"
      fee="1% fee (very cheap king)"
      leftAdornment={<BanxaLogo size={40} />}
      rightAdornment={<Icon.Check color="#7892E8" />}
      onPress={action('Provider Item Pressed')}
    />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
