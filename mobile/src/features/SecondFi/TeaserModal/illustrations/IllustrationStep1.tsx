import * as React from 'react'
import {Image, View} from 'react-native'

import illustrationSource from '~/assets/img/illustration-secondfi-step1.png'

// Screen 1: "Yoroi is reaching further"
export const IllustrationStep1 = () => {
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
