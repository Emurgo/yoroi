import React, { useState } from 'react'
import { Dimensions, FlatList, StyleSheet, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { COLORS, colors } from 'src/theme';

import { ShareDetailsCard } from '../ShareDetailsCard/ShareDetailsCard';
import { ShareQRCodeCard } from '../ShareQRCodeCard/ShareQRCodeCard';

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

    const renderItem = ({ item }) => {
        switch (item.cardType) {
            case 'QRCode':
                return <ShareQRCodeCard title={item.title} address={item.address} />;
            case 'Details':
                return <ShareDetailsCard address={item.address} stakingHash={item.stakingHash} spendingHash={item.spendingHash} title={item.title} />;
            default:
                return null;
        }
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
                    renderItem={renderItem}
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

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        maxHeight: 458,
        alignSelf: 'center',
        overflow: 'hidden',
        padding: 15
    }
})