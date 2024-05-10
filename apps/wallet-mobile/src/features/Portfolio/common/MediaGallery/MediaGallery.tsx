import {FlashList, FlashListProps} from '@shopify/flash-list'
import {Balance, Portfolio} from '@yoroi/types'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {MediaPreview} from '../MediaPreview/MediaPreview'

type Props = {
  amounts: ReadonlyArray<Portfolio.Token.Amount>
  onSelect: (amount: Portfolio.Token.Amount) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  bounces?: FlashListProps<Balance.TokenInfo>['bounces']
  ListEmptyComponent?: FlashListProps<Balance.TokenInfo>['ListEmptyComponent']
  withVerticalPadding?: boolean
  readOnly?: boolean
}
export const MediaGallery = ({
  amounts = [],
  onSelect,
  onRefresh,
  isRefreshing,
  readOnly,
  bounces = false,
  ListEmptyComponent = undefined,
  withVerticalPadding = undefined,
}: Props) => {
  const dimensions = useWindowDimensions()
  const minSize = Math.min(dimensions.width, dimensions.height)
  const imageSize = (minSize - horizontalPadding * 2) / numberOfColumns - imageHorizontalPadding

  return (
    <GalleryList
      imageSize={imageSize}
      data={amounts}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      bounces={bounces}
      ListEmptyComponent={ListEmptyComponent}
      withVerticalPadding={withVerticalPadding}
      renderMedia={(amount) => (
        <TouchableOpacity onPress={() => onSelect(amount)} disabled={readOnly} key={amount.info.id}>
          <Media info={amount.info} imageSize={imageSize} />
        </TouchableOpacity>
      )}
    />
  )
}

function Media({info, imageSize}: {info: Portfolio.Token.Info; imageSize: number}) {
  return (
    <View>
      <View style={styles.imageWrapper}>
        <MediaPreview info={info} width={imageSize} height={imageSize} style={styles.image} />
      </View>

      <Spacer height={imagePadding} />

      <Text style={[styles.text, {width: imageSize}]}>{info.name}</Text>
    </View>
  )
}

const textHeight = 20
const imagePadding = 8
const rowSpacing = 14
const numberOfColumns = 2
const horizontalPadding = 16
const verticalPadding = 16
const gapBetweenColumns = horizontalPadding
const imageHorizontalPadding = gapBetweenColumns / numberOfColumns
const batchSize = 20

function GalleryList({
  data = [],
  imageSize,
  renderMedia,
  withVerticalPadding = false,
  ...rest
}: Partial<FlashListProps<Portfolio.Token.Amount>> & {
  renderMedia: (item: Portfolio.Token.Amount) => React.ReactElement
  withVerticalPadding?: boolean
  imageSize: number
  data: ReadonlyArray<Portfolio.Token.Amount>
}) {
  const [loadedAmounts, setLoadedAmounts] = React.useState(data.slice(0, batchSize))
  const [currentIndex, setCurrentIndex] = React.useState(batchSize)

  const handleOnEndReached = React.useCallback(() => {
    if (currentIndex >= data.length) return
    const nextBatch = data.slice(currentIndex, currentIndex + batchSize)
    setLoadedAmounts([...loadedAmounts, ...nextBatch])
    setCurrentIndex(currentIndex + batchSize)
  }, [currentIndex, data, loadedAmounts])

  return (
    <FlashList
      {...rest}
      data={loadedAmounts}
      numColumns={2}
      renderItem={({item, index}) => (
        <View
          style={[index % 2 === 0 ? {paddingRight: imageHorizontalPadding} : {paddingLeft: imageHorizontalPadding}]}
        >
          <View>{renderMedia(item)}</View>

          <Spacer height={rowSpacing} />
        </View>
      )}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingVertical: withVerticalPadding ? verticalPadding : undefined,
      }}
      keyExtractor={(_, index) => index.toString()}
      horizontal={false}
      estimatedItemSize={imageSize + imagePadding + textHeight + rowSpacing}
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={0.5}
    />
  )
}

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
  },
  image: {
    borderRadius: 8,
    overlayColor: '#FFFFFF',
  },
  text: {
    fontSize: 14,
    lineHeight: textHeight,
  },
})
