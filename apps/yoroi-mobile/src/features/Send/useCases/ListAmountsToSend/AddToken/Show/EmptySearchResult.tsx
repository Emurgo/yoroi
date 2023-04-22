import * as React from 'react'
import {Image, StyleSheet} from 'react-native'

import noAssetsImage from '../../../../../../assets/img/no-assets-found.png'
import {FadeIn} from '../../../../../../components/FadeIn'
import {Spacer} from '../../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../../components/Text'
import {useStrings} from '../../../../common/strings'

// use case: display a message when the search result is empty
export const EmptySearchResult = () => {
  const strings = useStrings()

  return (
    <FadeIn style={styles.root}>
      <Spacer height={160} />

      <Image source={noAssetsImage} style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.text}>{strings.noAssets}</Text>
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  text: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
  },
  image: {
    flex: 1,
    alignSelf: 'center',
    width: 200,
    height: 228,
  },
  root: {
    flex: 1,
    textAlign: 'center',
  },
})
