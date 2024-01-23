import React, { RefObject, useRef, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import Share from 'react-native-share';
import ViewShot, { captureRef } from "react-native-view-shot";
import { Text } from 'src/components';
import { COLORS } from 'src/theme';

import { CaptureShareQRCodeCard } from '../CaptureShareQRCodeCard/CaptureShareQRCodeCard';
import { useStrings } from '../useStrings';

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

export function ShareQRCodeCard({ address, title }: ShareProps) {
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const strings = useStrings()
    const ref: RefObject<ViewShot> = useRef(null);

    const shareImage = async () => {
        setIsSharing(true);
        try {
            const uri = await captureRef(ref, {
                format: 'png',
                quality: 1,
                fileName: 'Share address'
            });
            setIsSharing(false);
            await Share.open({ url: uri, filename: 'Share-address', message: `${strings.address} ${address}` });
        } catch (e) {
            setIsSharing(false);
        }
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
