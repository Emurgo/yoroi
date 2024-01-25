import React, { useRef } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'

import { Text } from '../../../../components'
import { COLORS } from '../../../../theme'

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

            <Image ref={LogoRef.current} source={require('../../../../assets/img/yoroi-logo-text.png')} style={{ height: 40, width: 40 }} />

            <View style={styles.addressContainer}>
                <View style={styles.qrCode}>
                    <QRCode value={address} size={158} backgroundColor={COLORS.LIGHT_GRAY} color="black" />
                </View>

                <Text style={[styles.textAddress, { color: 'transparent' }]}>{address}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    qrCode: {
        backgroundColor: COLORS.BACKGROUND,
        padding: 10,
        borderRadius: 8,
        marginBottom: 16
    },
    addressContainer: {
        alignItems: 'center'
    },
    touchableCard: {
        height: '100%',
        justifyContent: 'center',
        gap: 32,
        alignItems: 'center',
        marginHorizontal: 16
    },
    textAddress: {
        textAlign: 'center',
        fontWeight: '500',
        maxWidth: 300
    },
})