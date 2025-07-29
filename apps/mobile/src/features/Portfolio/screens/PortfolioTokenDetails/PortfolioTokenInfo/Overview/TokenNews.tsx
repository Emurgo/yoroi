import {atoms as a, useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {FlatList, Image, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Space} from '~/ui/Space/Space'
import NewsPlaceHolder from '../assets/img/token-news-place-holder.png'
export const TokenNews = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const [expanded, setExpanded] = useState(true)

  return (
    <Accordion
      label={strings.news}
      expanded={expanded}
      onChange={setExpanded}
      wrapperStyle={[a.flex_1]}
    >
      <FlatList
        horizontal
        data={Array.from({length: 10}).map((_, i) => i)}
        ItemSeparatorComponent={() => <Space.Width.sm />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        renderItem={({item}) => <NewsCard key={item} />}
      />
    </Accordion>
  )
}

const NewsCard = () => {
  const {atoms: ta, palette: p} = useTheme()
  return (
    <View
      style={[
        {position: 'relative', width: 164, height: 164},
        a.rounded_sm,
        a.flex_col,
        a.justify_end,
        a.align_end,
        a.px_lg,
        a.py_md,
      ]}
    >
      <LinearGradient
        style={[{...StyleSheet.absoluteFillObject}, a.rounded_sm, {zIndex: 10}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={['#08C29D00', '#0E1027']}
      />

      <Image
        style={[
          {...StyleSheet.absoluteFillObject},
          a.rounded_sm,
          {zIndex: 8, resizeMode: 'cover'},
        ]}
        source={NewsPlaceHolder}
      />

      <Text
        style={[
          {color: p.white_static, position: 'relative', zIndex: 11},
          a.body_3_sm_medium,
          a.font_semibold,
        ]}
      >
        Latest updates and news on Cardano Spot
      </Text>
    </View>
  )
}
