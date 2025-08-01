import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useWindowDimensions, View} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useReceive} from '~/features/Receive/common/ReceiveProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Space} from '~/ui/Space/Space'
import {useKeyHashes} from '~/wallets/hooks'
import {isEmptyString} from '~/wallets/utils/string'
import {ShareDetailsCard} from '../ShareDetailsCard/ShareDetailsCard'
import {ShareQRCodeCard} from '../ShareQRCodeCard/ShareQRCodeCard'

type AddressDetailCardProps = {
  title: string
}

type AddressDetailsProps = {
  stakingHash?: string
  spendingHash?: string
}

type CardItem = {
  title: AddressDetailCardProps['title']
  address: string
} & (
  | {
      cardType: 'QRCode'
    }
  | ({cardType: 'Details'} & AddressDetailsProps)
)

export const AddressDetailCard = ({title}: AddressDetailCardProps) => {
  const {copy} = useCopy()
  const {track} = useMetrics()
  const strings = useStrings()
  const {palette: p} = useTheme()

  const {selectedAddress: address} = useReceive()
  const {spending, staking} = useKeyHashes({address})
  const stakingHash = staking ?? ''
  const spendingHash = spending ?? ''

  const [scrollPosition, setScrollPosition] = React.useState(0)
  const cards: ReadonlyArray<CardItem> = [
    {cardType: 'QRCode', title, address},
    {
      cardType: 'Details',
      address,
      stakingHash,
      spendingHash,
      title,
    },
  ] as const
  const screenWidth = useWindowDimensions().width
  const itemsPerPage = 1
  const minToSwitchPage = 64
  const totalPages = Math.ceil(cards.length / itemsPerPage)
  const cardIndicators = Array.from({length: totalPages}, (_, index) => index)

  if (isEmptyString(address)) return

  const handleOnPageChange = (event: {
    nativeEvent: {contentOffset: {x: number}}
  }) => {
    const offset = event.nativeEvent.contentOffset.x
    const index = Math.floor(
      offset / (itemsPerPage * screenWidth - minToSwitchPage),
    )
    setScrollPosition(Math.max(index, 0))
  }

  const renderItem = ({item}: {item: CardItem}) => {
    switch (item.cardType) {
      case 'QRCode':
        return (
          <ShareQRCodeCard
            title={item.title}
            qrContent={item.address}
            shareContent={`${strings.receive.address} ${item.address}`}
            onLongPress={(event) =>
              copy({
                text: item.address,
                feedback: strings.receive.addressCopiedMsg,
                event,
              })
            }
            testID="receive:address-detail-card"
            onShare={() => track.receiveShareAddressClicked()}
            shareLabel={strings.receive.shareLabel}
          />
        )
      case 'Details':
        return (
          <ShareDetailsCard
            address={item.address}
            stakingHash={item.stakingHash}
            spendingHash={item.spendingHash}
          />
        )
      default:
        return null
    }
  }

  return (
    <View style={[a.align_center]}>
      <View style={[{borderRadius: 10}, a.flex_1]}>
        <Animated.FlatList
          layout={Layout}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={cards}
          keyExtractor={(_) => _.cardType}
          pagingEnabled
          onScroll={handleOnPageChange}
          snapToInterval={itemsPerPage * screenWidth}
          decelerationRate="fast"
          renderItem={renderItem}
          contentContainerStyle={{gap: 10}}
        />
      </View>

      <Space.Height.sm />

      <View style={[a.flex_row, {gap: 6}]}>
        {cardIndicators.map((index) => (
          <View
            key={index + '-indicator'}
            style={[
              {
                width: 12,
                height: 12,
                borderRadius: 100,
                backgroundColor:
                  index === scrollPosition ? p.el_primary_medium : p.gray_300,
              },
            ]}
          />
        ))}
      </View>
    </View>
  )
}
