import React from 'react'
import { StyleSheet, useWindowDimensions,View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'

import { Text } from '../../../../components'
import { COLORS } from '../../../../theme'
import { YoroiLogoIllustration } from '../../illustrations/YoroiLogo'

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
    const logoWidth = 35
    const logoHeight = 37

    const {styles} = useStyles()

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

            <YoroiLogoIllustration height={logoHeight} width={logoWidth} />

            <View style={styles.addressContainer}>
                <View style={styles.qrCode}>
                    <QRCode value={address} size={158} backgroundColor={COLORS.LIGHT_GRAY} color="black" />
                </View>

                <Text style={[styles.textAddress, { color: 'transparent' }]}>{address}</Text>
            </View>
        </View>
    )
}

const useStyles = () => {

    const SCREEN_WIDTH = useWindowDimensions().width

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
            borderRadius: 10,
            width: SCREEN_WIDTH - 34,
            alignItems: 'center',
            maxHeight: 458,
            height: '100%',
            minHeight: 394,
            alignSelf: 'center',
            overflow: 'hidden',
            paddingVertical: 15,
            gap: 32,
            justifyContent: 'center'
        },
        textAddress: {
            textAlign: 'center',
            fontWeight: '500',
            maxWidth: 300
        },
    })

    return {styles} as const
}
