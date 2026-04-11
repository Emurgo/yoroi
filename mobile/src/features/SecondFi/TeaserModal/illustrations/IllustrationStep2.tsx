import * as React from 'react'
import {Image, View} from 'react-native'

import illustrationSource from '~/assets/img/illustration-secondfi-step2.png'

// Screen 2: "Soon, you'll have more options to grow"
export const IllustrationStep2 = () => {
  return (
    <View
      style={{
        width: 280,
        height: 280,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={illustrationSource}
        style={{width: 280, height: 280}}
        resizeMode="contain"
      />
    </View>
  )
}
