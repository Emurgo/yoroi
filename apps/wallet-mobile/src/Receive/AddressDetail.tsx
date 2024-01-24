import React, { useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl';
import { Alert, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'
import Share from 'react-native-share';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import ViewShot, { captureRef } from "react-native-view-shot";

import { CopyButton, Text } from '../components'
import { COLORS, colors } from '../theme'

type ShareProps = {
  address?: string
  title?: string
  addressDetails?: AddressDetailsProps
}

type AddressDetailsProps = {
  address: string
  stakingHash?: string
  spendingHash?: string
  title?: string
}

export function AddressDetail({ address, title, addressDetails }: ShareProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const itemsPerPage = 1;

  const data = [
    { cardType: 'QRCode', title, address },
    { cardType: 'Details', address, stakingHash: addressDetails?.stakingHash, spendingHash: addressDetails?.spendingHash, title }]

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const circleIndex = Array.from({ length: totalPages }, (_, index) => index + 1);

  const onPageChange = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.floor(offset / (itemsPerPage * SCREEN_WIDTH - 64));
    setScrollPosition(index);
  };

  return (
    <>
      <View style={styles.container}>
        <LinearGradient
          style={[StyleSheet.absoluteFill, { opacity: 1 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          colors={['#E4E8F7', '#C6F7F7']}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ height: '100%' }}
          data={data}
          keyExtractor={(item, index) => index.toString()}
          pagingEnabled
          onScroll={onPageChange}
          snapToInterval={itemsPerPage * SCREEN_WIDTH}
          decelerationRate="fast"
          renderItem={({ item }) => {
            if (item.cardType === 'QRCode') {
              return <ShareQRCodeCard title={item.title} address={item.address} />;
            } else if (item.cardType === 'Details') {
              return <ShareDetailsCard address={item.address} stakingHash={item.stakingHash} spendingHash={item.spendingHash} title={item.title} />;
            }
          }}
        />
      </View>

      {
        totalPages > 1 && (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
            {
              circleIndex.map((index) => (
                <View
                  key={index + 'indexCard'}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 100,
                    backgroundColor: (index - 1) === scrollPosition ? colors.buttonBackgroundBlue : COLORS.GRAY,
                  }}
                />
              ))
            }
          </View>
        )
      }
    </>
  )
}

export function CaptureShareQRCodeCard({ address }: ShareProps) {
  const LogoRef = useRef();

  return (
    <View
      style={[styles.touchableCard]}
    >
      <LinearGradient
        style={[StyleSheet.absoluteFill, { opacity: 1 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={['#E4E8F7', '#C6F7F7']}
      />

      <Image ref={LogoRef.current} source={require('../assets/img/yoroi-logo-text.png')} style={{ height: 40, width: 40 }} />

      <View style={styles.addressContainer}>
        <View style={styles.qrCode}>
          <QRCode value={address} size={158} backgroundColor={COLORS.LIGHT_GRAY} color="black" />
        </View>

        <Text style={[styles.textAddress, { color: 'transparent' }]}>{address}</Text>
      </View>
    </View>
  )
}

export function ShareQRCodeCard({ address, title }: ShareProps) {
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const strings = useStrings()
  const ref = useRef<any>();

  const shareImage = () => {
    setIsSharing(true);

    setTimeout(async () => {
      try {
        const uri = await captureRef(ref, {
          format: 'png',
          quality: 1,
          fileName: 'Share address'
        });
        setIsSharing(false);
        await Share.open({ url: uri, filename: 'Share address', message: `${strings.address} ${address}` });
      } catch (e) {
        console.log(e);
        setIsSharing(false);
      }
    }, 100);
  };


  return (
    isSharing ? (
      <ViewShot ref={ref}>
        <CaptureShareQRCodeCard address={address} />
      </ViewShot>
    ) : (
      <TouchableOpacity
        style={styles.touchableCard}
        activeOpacity={.5}
        onPress={shareImage}
        onLongPress={() => Alert.alert('copy', address)}
      >

        <Text style={styles.title}>{title}</Text>

        <View style={styles.addressContainer}>
          <View style={styles.qrCode}>
            <QRCode value={address} size={158} backgroundColor={COLORS.LIGHT_GRAY} color="black" />
          </View>

          <Text style={styles.textAddress}>{address}</Text>
        </View>

        <Text style={styles.textShareAddress}>{strings.shareLabel}</Text>
      </TouchableOpacity>
    )
  )
}

export function ShareDetailsCard({ address, spendingHash, stakingHash }: AddressDetailsProps) {
  const strings = useStrings();

  return (
    <View style={styles.addressDetails}>

      <Text style={styles.title}>{strings.walletAddress}</Text>

      <View style={styles.textSection}>
        <Text style={[styles.textAddressDetails, { color: COLORS.GRAY }]}>{strings.address}</Text>

        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.textAddressDetails}>{address}</Text>

          <CopyButton value={address} />
        </View>
      </View>

      <View style={styles.textSection}>
        <Text style={[styles.textAddressDetails, { color: COLORS.GRAY }]}>{strings.stakingKeyHash}</Text>

        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.textAddressDetails}>{stakingHash}</Text>

          <CopyButton value={stakingHash} />
        </View>
      </View>

      <View style={styles.textSection}>
        <Text style={[styles.textAddressDetails, { color: COLORS.GRAY }]}>{strings.spendingKeyHash}</Text>

        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.textAddressDetails}>{spendingHash}</Text>

          <CopyButton value={spendingHash} />
        </View>
      </View>

    </View>
  )
}

export const SkeletonAdressDetail = () => (
  <SkeletonPlaceholder borderRadius={8} backgroundColor={COLORS.LIGHT_GRAY} enabled  >
    <SkeletonPlaceholder.Item style={[styles.touchableCard]}>
      <View style={styles.skeleton} />
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
)

const messages = defineMessages({
  shareLabel: {
    id: 'components.receive.addresscard.shareLabel',
    defaultMessage: '!!!Share address',
  },
  walletAddress: {
    id: 'components.receive.addresscard.walletAddress',
    defaultMessage: '!!!Wallet address details',
  },
  spendingKeyHash: {
    id: 'components.receive.addresscard.spendingKeyHash',
    defaultMessage: '!!!Spending key hash',
  },
  stakingKeyHash: {
    id: 'components.receive.addresscard.stakingKeyHash',
    defaultMessage: '!!!Staking key hash',
  },
  address: {
    id: 'components.receive.addresscard.address',
    defaultMessage: '!!!Address',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    shareLabel: intl.formatMessage(messages.shareLabel),
    walletAddress: intl.formatMessage(messages.walletAddress),
    spendingKeyHash: intl.formatMessage(messages.spendingKeyHash),
    stakingKeyHash: intl.formatMessage(messages.stakingKeyHash),
    address: intl.formatMessage(messages.address),
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    maxHeight: 458,
    alignSelf: 'center',
    overflow: 'hidden',
    padding: 15
  },
  qrCode: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16
  },
  addressContainer: {
    alignItems: 'center'
  },
  skeleton: {
    width: '100%',
    height: '100%'
  },
  touchableCard: {
    height: '100%',
    justifyContent: 'center',
    gap: 32,
    alignItems: 'center',
    marginHorizontal: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '500'
  },
  textAddress: {
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 300
  },
  textShareAddress: {
    fontWeight: '500',
    padding: 4,
    textTransform: 'uppercase'
  },
  addressDetails: {
    height: '100%',
    gap: 32,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 32,
  },
  textAddressDetails: {
    fontWeight: '400',
  },
  textSection: {
    gap: 4,
    maxWidth: 300,
    width: '100%'
  }
})
