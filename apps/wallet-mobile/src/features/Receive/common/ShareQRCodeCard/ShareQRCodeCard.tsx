import { useTheme } from '@yoroi/theme';
import React, { RefObject, useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg'
import Animated, { FadeInDown, FadeOutDown, Layout } from 'react-native-reanimated';
import Share from 'react-native-share';
import ViewShot, { captureRef } from "react-native-view-shot";

import { Text } from '../../../../components';
import { COLORS } from '../../../../theme';
import { CaptureShareQRCodeCard } from '../CaptureShareQRCodeCard/CaptureShareQRCodeCard';
import { mocks } from '../mocks';
import { useStrings } from '../useStrings';

type ShareProps = {
    address?: string
    title?: string
    addressDetails?: AddressDetailsProps
    isCopying?: boolean
    onLongPress?: () => void
}

type AddressDetailsProps = {
    address: string
    stakingHash?: string
    spendingHash?: string
    title?: string
}

export function ShareQRCodeCard({ address, title, isCopying, onLongPress }: ShareProps) {
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const strings = useStrings()
    const ref: RefObject<ViewShot> = useRef(null);

    const { styles } = useStyles()

    const shareImage = () => {
        setIsSharing(true);
    };

    useEffect(() => {
        if (isSharing) {
            const captureAndShare = async () => {
                try {
                    await new Promise(resolve => setTimeout(resolve, 50));

                    const uri = await captureRef(ref, {
                        format: 'png',
                        quality: 1,
                        fileName: mocks.shareFileName
                    });

                    setIsSharing(false);
                    await Share.open({ url: uri, filename: mocks.shareFileName, message: `${strings.address} ${address}` });
                } catch (error) {
                    setIsSharing(false);
                }
            };

            captureAndShare();
        }
    }, [isSharing]);


    return (
        isSharing ? (
            <ViewShot ref={ref}>
                <CaptureShareQRCodeCard address={address} />
            </ViewShot>
        ) : (
            <View
                style={styles.card}
            >
                <LinearGradient
                    style={[StyleSheet.absoluteFill, { opacity: 1 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={['#E4E8F7', '#C6F7F7']}
                />

                <Text style={styles.title}>{title}</Text>

                <View style={styles.addressContainer}>
                    <View style={styles.qrCode}>
                        <QRCode value={address} size={158} backgroundColor={COLORS.LIGHT_GRAY} color={COLORS.BLACK} />
                    </View>

                    <Text style={styles.textAddress}>{address}</Text>
                </View>

                <TouchableOpacity
                    activeOpacity={.5}
                    onPress={shareImage}
                    onLongPress={onLongPress}
                >
                    <Text style={styles.textShareAddress}>{strings.shareLabel}</Text>
                </TouchableOpacity>

                {isCopying && (
                    <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
                        <Text style={styles.textCopy}>{strings.addressCopiedMsg}</Text>
                    </Animated.View>
                )}
            </View>
        )
    )
}

const useStyles = () => {

    const SCREEN_WIDTH = useWindowDimensions().width
    const theme = useTheme()

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
        skeleton: {
            width: '100%',
            height: '100%'
        },
        card: {
            borderRadius: 16,
            width: SCREEN_WIDTH - 34,
            alignItems: 'center',
            maxHeight: 458,
            height: '100%',
            minHeight: 394,
            alignSelf: 'center',
            overflow: 'hidden',
            paddingVertical: 16,
            gap: 32,
            paddingTop: 32
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
        },
        textCopy: {
            color: theme.theme.color['white-static'],
            textAlign: 'center',
            padding: 8,
            fontSize: 14,
            fontWeight: '500',
            fontFamily: 'Rubik-Medium',
        },
        isCopying: {
            position: 'absolute',
            backgroundColor: '#000',
            alignItems: 'center',
            justifyContent: 'center',
            bottom: 60,
            alignSelf: 'center',
            borderRadius: 4,
            zIndex: 10
        }
    })

    return { styles } as const
}
