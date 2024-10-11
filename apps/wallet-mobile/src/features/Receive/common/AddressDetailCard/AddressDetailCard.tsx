import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import {useCopy} from '../../../../components/Clipboard/ClipboardProvider'
import {ShareQRCodeCard} from '../../../../components/ShareQRCodeCard/ShareQRCodeCard'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {isEmptyString} from '../../../../kernel/utils'
import {useKeyHashes} from '../../../../yoroi-wallets/hooks'
import {useReceive} from '../ReceiveProvider'
import {ShareDetailsCard} from '../ShareDetailsCard/ShareDetailsCard'
import {useStrings} from '../useStrings'

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
  const {styles, colors} = useStyles()
  const {copy} = useCopy()
  const {track} = useMetrics()
  const strings = useStrings()

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

  const handleOnPageChange = (event: {nativeEvent: {contentOffset: {x: number}}}) => {
    const offset = event.nativeEvent.contentOffset.x
    const index = Math.floor(offset / (itemsPerPage * screenWidth - minToSwitchPage))
    setScrollPosition(Math.max(index, 0))
  }

  const renderItem = ({item}: {item: CardItem}) => {
    switch (item.cardType) {
      case 'QRCode':
        return (
          <ShareQRCodeCard
            title={item.title}
            qrContent={item.address}
            shareContent={`${strings.address} ${item.address}`}
            onLongPress={(event) => copy({text: item.address, feedback: strings.addressCopiedMsg, event})}
            testID="receive:address-detail-card"
            onShare={() => track.receiveShareAddressClicked()}
            shareLabel={strings.shareLabel}
          />
        )
      case 'Details':
        return (
          <ShareDetailsCard address={item.address} stakingHash={item.stakingHash} spendingHash={item.spendingHash} />
        )
      default:
        return null
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.container}>
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
          contentContainerStyle={styles.contentContainer}
        />
      </View>

      <Spacer height={12} />

      <View style={styles.index}>
        {cardIndicators.map((index) => (
          <View
            key={index + '-indicator'}
            style={[
              styles.circle,
              {
                backgroundColor: index === scrollPosition ? colors.active : colors.inactive,
              },
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.align_center,
    },
    container: {
      borderRadius: 10,
      ...atoms.flex_1,
    },
    index: {
      ...atoms.flex_row,
      gap: 6,
    },
    circle: {
      width: 12,
      height: 12,
      borderRadius: 100,
    },
    contentContainer: {
      gap: 10,
    },
  })
  const colors = {
    active: color.el_primary_medium,
    inactive: color.gray_300,
  }
  return {styles, colors} as const
}
