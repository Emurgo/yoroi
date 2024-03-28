import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {lightPalette} from '@yoroi/theme'
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
      fee={5}
      leftAdornment={<BanxaLogo size={40} />}
      rightAdornment={<Icon.Check color={lightPalette.primary[600]} />}
      onPress={action('Provider Item Pressed')}
    />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
