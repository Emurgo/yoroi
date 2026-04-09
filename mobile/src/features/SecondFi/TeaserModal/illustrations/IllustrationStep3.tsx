import * as React from 'react'
import {Image, View} from 'react-native'

import illustrationSource from '~/assets/img/illustration-secondfi-step3.png'

// Screen 3: "Your wallet in real life"
export const IllustrationStep3 = () => {
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
