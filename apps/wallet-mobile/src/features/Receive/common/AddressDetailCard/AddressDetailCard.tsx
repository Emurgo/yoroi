import { useTheme } from '@yoroi/theme';
import React, { useState } from 'react'
import { Dimensions, FlatList, StyleSheet, View } from 'react-native'

import { useCopy } from '../../../../legacy/useCopy';
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

export function AddressDetailCard({ address, title, addressDetails }: ShareProps) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isSecondPage, setIsSecondPage] = useState(false);

    const [isCopying, copy] = useCopy()

    const { theme } = useTheme()
    const { styles } = useStyles()

    const SCREEN_WIDTH = Dimensions.get('window').width;
    const itemsPerPage = 1;

    const data = [
        { cardType: 'QRCode', title, address },
        { cardType: 'Details', address: addressDetails?.address, stakingHash: addressDetails?.stakingHash, spendingHash: addressDetails?.spendingHash, title }]

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const circleIndex = Array.from({ length: totalPages }, (_, index) => index + 1);

    const onPageChange = (event: { nativeEvent: { contentOffset: { x: any; }; }; }) => {
        const offset = event.nativeEvent.contentOffset.x;
        const index = Math.floor(offset / (itemsPerPage * SCREEN_WIDTH - 64));
        setScrollPosition(index);
    };

    const renderItem = ({ item }: any) => {
        switch (item.cardType) {
            case 'QRCode':
                return <ShareQRCodeCard
                    title={item.title}
                    address={item.address}
                    onLongPress={() => copy(item.address)}
                    isCopying={isCopying}
                />;
            case 'Details':
                if ((Boolean(item.address)) && (Boolean(item.stakingHash)) && (Boolean(item.spendingHash)) && (Boolean(item.title))) {
                    setIsSecondPage(true)
                    return <ShareDetailsCard
                        address={item.address}
                        stakingHash={item.stakingHash}
                        spendingHash={item.spendingHash}
                        title={item.title}
                    />;
                } else {
                    return null;
                }
            default:
                return null;
        }
    };

    return (
        <>
            <View style={styles.container}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={data}
                    keyExtractor={(_, index) => index.toString()}
                    pagingEnabled
                    onScroll={onPageChange}
                    snapToInterval={itemsPerPage * SCREEN_WIDTH}
                    decelerationRate="fast"
                    renderItem={renderItem}
                    contentContainerStyle={styles.contentContainer}
                />
            </View>

            {
                isSecondPage && (
                    <View style={styles.index}>
                        {
                            circleIndex.map((index) => (
                                <View
                                    key={index + 'indexCard'}
                                    style={([styles.circle, {
                                        backgroundColor: (index - 1) === scrollPosition ?
                                            theme.color.primary[600] :
                                            theme.color.gray[400]
                                    }])}
                                />
                            ))
                        }
                    </View>
                )
            }
        </>
    )
}

const useStyles = () => {

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
            paddingVertical: 15
        },
        index: {
            flexDirection: 'row',
            gap: 6,
            marginTop: 12
        },
        circle: {
            width: 12,
            height: 12,
            borderRadius: 100,
        },
        contentContainer: { gap: 10 }
    })
    return { styles }
}
