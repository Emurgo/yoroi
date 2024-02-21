import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {Dimensions, StyleSheet, View} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import {Spacer} from '../../../../components'
import {useCopy} from '../../../../legacy/useCopy'
import {useKeyHashes} from '../../../../yoroi-wallets/hooks'
import {mocks} from '../mocks'
import {useReceive} from '../ReceiveProvider'
import {ShareDetailsCard} from '../ShareDetailsCard/ShareDetailsCard'
import {ShareQRCodeCard} from '../ShareQRCodeCard/ShareQRCodeCard'

type ShareProps = {
  address: string
  title: string
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

export const AddressDetailCard = ({title}: ShareProps) => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isSecondPage, setIsSecondPage] = useState(false)

  const {selectedAddress} = useReceive()

  const [isCopying, copy] = useCopy()

  const {styles, colors} = useStyles()

  const SCREEN_WIDTH = Dimensions.get('window').width
  const itemsPerPage = 1

  const keyHashes = useKeyHashes(selectedAddress != null ? selectedAddress : '')

  const cards: ReadonlyArray<CardItem> = [
    {cardType: 'QRCode', title, address: selectedAddress ?? ''},
    {
      cardType: 'Details',
      address: selectedAddress ?? '',
      stakingHash: keyHashes?.staking ?? '',
      spendingHash: keyHashes?.spending ?? '',
      title,
    },
  ] as const

  const totalPages = Math.ceil(cards.length / itemsPerPage)
  const circleIndex = Array.from({length: totalPages}, (_, index) => index + 1)

  const handleOnPageChange = (event: {nativeEvent: {contentOffset: {x: number}}}) => {
    const offset = event.nativeEvent.contentOffset.x
    const index = Math.floor(offset / (itemsPerPage * SCREEN_WIDTH - 64))
    setScrollPosition(index)
  }

  if (selectedAddress === undefined) {
    return
  }

  const renderItem = ({item}: {item: CardItem}) => {
    switch (item.cardType) {
      case 'QRCode':
        if (selectedAddress !== undefined) {
          return (
            <ShareQRCodeCard
              title={item.title}
              address={item.address}
              onLongPress={() => copy(mocks.address)}
              isCopying={isCopying}
            />
          )
        }
        return <></>
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
          onScroll={handleOnPageChange}
          snapToInterval={itemsPerPage * SCREEN_WIDTH}
          decelerationRate="fast"
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer}
        />
      </View>

      <Spacer height={12} />

      {isSecondPage && (
        <View style={styles.index}>
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
      flex: 1,
      alignSelf: 'center',
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
