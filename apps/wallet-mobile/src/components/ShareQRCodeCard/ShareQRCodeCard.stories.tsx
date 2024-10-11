import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ShareQRCodeCard} from './ShareQRCodeCard'

const address =
  'addr1qxstpe4lqp9y04s094twu6p63ht2rdhu9sdd40s5n0leppecjfk0ywkc7w8rxrdxp2xvkk9tewfr39n5naexzryg3c7sxmnh0t'

storiesOf('Receive ShareQRCodeCard', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with content', () => (
    <ShareQRCodeCard
      qrContent={address}
      shareContent={address}
      onLongPress={action('onLongPress')}
      title="Title"
      shareLabel="share label"
    />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
