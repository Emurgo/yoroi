import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {FlatList, Image, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import NewsPlaceHolder from '../../../../../../assets/img/token-news-place-holder.png'
import {Accordion} from '../../../../../../components/Accordion/Accordion'
import {Spacer} from '../../../../../../components/Spacer/Spacer'
import {useStrings} from '../../../../common/hooks/useStrings'
export const TokenNews = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const [expanded, setExpanded] = useState(true)

  return (
    <Accordion label={strings.news} expanded={expanded} onChange={setExpanded} wrapperStyle={styles.root}>
      <FlatList
        horizontal
        data={Array.from({length: 10}).map((_, i) => i)}
        ItemSeparatorComponent={() => <Spacer width={8} />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        renderItem={({item}) => <NewsCard key={item} />}
      />
    </Accordion>
  )
}

const NewsCard = () => {
  const {styles} = useStyles()
  return (
    <View style={styles.card}>
      <LinearGradient
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={['#08C29D00', '#0E1027']}
      />

      <Image style={styles.cardImage} source={NewsPlaceHolder} />

      <Text style={styles.title}>Latest updates and news on Cardano Spot</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
    },
    gradient: {
      ...StyleSheet.absoluteFillObject,
      ...atoms.rounded_sm,
      zIndex: 10,
    },
    card: {
      position: 'relative',
      width: 164,
      height: 164,
      ...atoms.rounded_sm,
      ...atoms.flex_col,
      ...atoms.justify_end,
      ...atoms.align_end,
      ...atoms.px_lg,
      ...atoms.py_md,
    },
    cardImage: {
      ...StyleSheet.absoluteFillObject,
      ...atoms.rounded_sm,
      zIndex: 8,
      resizeMode: 'cover',
    },
    title: {
      color: color.white_static,
      position: 'relative',
      zIndex: 11,
      ...atoms.body_3_sm_medium,
      ...atoms.font_semibold,
    },
  })

  const colors = {
    label: color.gray_600,
  }

  return {styles, colors} as const
}
