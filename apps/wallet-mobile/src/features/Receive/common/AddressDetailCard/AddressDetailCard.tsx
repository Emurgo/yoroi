import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {Dimensions, StyleSheet, View} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import {Spacer} from '../../../../components'
import {useCopy} from '../../../../legacy/useCopy'
import {mocks} from '../mocks'
import {ShareDetailsCard} from '../ShareDetailsCard/ShareDetailsCard'
import {ShareQRCodeCard} from '../ShareQRCodeCard/ShareQRCodeCard'

type ShareProps = {
  address: string
  title: string
  addressDetails?: AddressDetailsProps
}

type AddressDetailsProps = {
  stakingHash?: string
  spendingHash?: string
}

type CardItem = {
  title: ShareProps['title']
  address: ShareProps['address']
} & (
  | {
      cardType: 'QRCode'
    }
  | ({cardType: 'Details'} & AddressDetailsProps)
)

export const AddressDetailCard = ({address, title, addressDetails}: ShareProps) => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isSecondPage, setIsSecondPage] = useState(false)

  const [isCopying, copy] = useCopy()

  const {styles, colors} = useStyles()

  const SCREEN_WIDTH = Dimensions.get('window').width
  const itemsPerPage = 1

  const cards: ReadonlyArray<CardItem> = [
    {cardType: 'QRCode', title, address},
    {
      cardType: 'Details',
      address: address,
      stakingHash: addressDetails?.stakingHash,
      spendingHash: addressDetails?.spendingHash,
      title,
    },
  ] as const

  const totalPages = Math.ceil(cards.length / itemsPerPage)
  const circleIndex = Array.from({length: totalPages}, (_, index) => index + 1)

  const onPageChange = (event: {nativeEvent: {contentOffset: {x: number}}}) => {
    const offset = event.nativeEvent.contentOffset.x
    const index = Math.floor(offset / (itemsPerPage * SCREEN_WIDTH - 64))
    setScrollPosition(index)
  }

  const renderItem = ({item}: {item: CardItem}) => {
    switch (item.cardType) {
      case 'QRCode':
        return (
          <ShareQRCodeCard
            title={item.title}
            address={item.address}
            onLongPress={() => copy(mocks.address)}
            isCopying={isCopying}
          />
        )
      case 'Details':
        if (Boolean(item.address) && Boolean(item.stakingHash) && Boolean(item.spendingHash) && Boolean(item.title)) {
          setIsSecondPage(true)
          return (
            <ShareDetailsCard
              address={item.address}
              stakingHash={item.stakingHash}
              spendingHash={item.spendingHash}
              title={item.title}
            />
          )
        }
    }
    return null
  }

  return (
    <>
      <View style={styles.container}>
        <Animated.FlatList
          layout={Layout}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={cards}
          keyExtractor={(_) => _.cardType}
          pagingEnabled
          onScroll={onPageChange}
          snapToInterval={itemsPerPage * SCREEN_WIDTH}
          decelerationRate="fast"
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer}
        />
      </View>

      {isSecondPage && (
        <View style={styles.index}>
          <Spacer height={12} />

          {circleIndex.map((index) => (
            <View
              key={index + 'indexCard'}
              style={[
                styles.circle,
                {
                  backgroundColor: index - 1 === scrollPosition ? colors.indexActive : colors.indexInactive,
                },
              ]}
            />
          ))}
        </View>
      )}
    </>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      borderRadius: 10,
      width: '100%',
      alignItems: 'center',
      maxHeight: 458,
      height: '100%',
      minHeight: 394,
      alignSelf: 'center',
      overflow: 'hidden',
    },
    index: {
      flexDirection: 'row',
      gap: 6,
    },
    circle: {
      width: 12,
      height: 12,
      borderRadius: 100,
    },
    contentContainer: {gap: 10},
  })

  const colors = {
    indexActive: theme.color.primary[600],
    indexInactive: theme.color.gray[400],
  }
  return {styles, colors}
}
