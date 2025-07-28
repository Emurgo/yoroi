import {FlashList, FlashListProps} from '@shopify/flash-list'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Balance, Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text, TouchableOpacity, useWindowDimensions, View} from 'react-native'

import {MediaPreview} from '~/ui/MediaPreview/MediaPreview'
import {Space} from '~/ui/Space/Space'

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
  const imageSize =
    (minSize - horizontalPadding * 2) / numberOfColumns - imageHorizontalPadding

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
        <TouchableOpacity
          onPress={() => onSelect(amount)}
          disabled={readOnly}
          key={amount.info.id}
        >
          <Media info={amount.info} imageSize={imageSize} />
        </TouchableOpacity>
      )}
    />
  )
}

function Media({
  info,
  imageSize,
}: {
  info: Portfolio.Token.Info
  imageSize: number
}) {
  const {palette: p} = useTheme()
  return (
    <View>
      <View style={[{position: 'relative', overflow: 'hidden'}, a.rounded_sm]}>
        <MediaPreview
          info={info}
          width={imageSize}
          height={imageSize}
          style={[a.rounded_sm, {backgroundColor: p.gray_100}]}
        />
      </View>

      <Space.Height.sm />

      <Text
        style={[
          a.body_3_sm_medium,
          {width: imageSize, color: p.gray_600, lineHeight: textHeight},
        ]}
      >
        {info.name}
      </Text>
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
  const [loadedAmounts, setLoadedAmounts] = React.useState(
    data.slice(0, batchSize),
  )
  const [currentIndex, setCurrentIndex] = React.useState(batchSize)

  React.useEffect(() => {
    const loadedAmounts = data.slice(0, currentIndex + batchSize)
    setLoadedAmounts(loadedAmounts)
    setCurrentIndex(currentIndex + batchSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

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
          style={[
            index % 2 === 0
              ? {paddingRight: imageHorizontalPadding}
              : {paddingLeft: imageHorizontalPadding},
          ]}
        >
          <View>{renderMedia(item)}</View>

          <Space.Height.sm />
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
