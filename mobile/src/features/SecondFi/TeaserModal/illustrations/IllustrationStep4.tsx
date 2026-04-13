import * as React from 'react'
import {Image, View} from 'react-native'

import illustrationSource from '~/assets/img/illustration-secondfi-step4.png'

// Screen 4: "Your Yoroi wallet is getting bigger"
export const IllustrationStep4 = () => {
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
