import React, { } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';

import { CopyButton, Text } from '../../../../components';
import { COLORS } from '../../../../theme';
import { useStrings } from '../useStrings';

type AddressDetailsProps = {
    address: string
    stakingHash: string
    spendingHash: string
    title?: string
}

export function ShareDetailsCard({ address, spendingHash, stakingHash }: AddressDetailsProps) {
    const strings = useStrings();

    const { styles } = useStyles()

    return (
        <View style={styles.addressDetails}>
            <LinearGradient
                style={[StyleSheet.absoluteFill, { opacity: 1 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                colors={['#E4E8F7', '#C6F7F7']}
            />

            <Text style={styles.title}>{strings.walletAddress}</Text>

            <View style={styles.textSection}>
                <Text style={[styles.textAddressDetails, { color: COLORS.GRAY }]}>{strings.address}</Text>

                <View style={styles.textRow}>
                    <Text style={styles.textAddressDetails}>{address}</Text>

                    <CopyButton value={address} />
                </View>
            </View>

            <View style={styles.textSection}>
                <Text style={[styles.textAddressDetails, { color: COLORS.GRAY }]}>{strings.stakingKeyHash}</Text>

                <View style={styles.textRow}>
                    <Text style={styles.textAddressDetails}>{stakingHash}</Text>

                    <CopyButton value={stakingHash} />
                </View>
            </View>

            <View style={styles.textSection}>
                <Text style={[styles.textAddressDetails, { color: COLORS.GRAY }]}>{strings.spendingKeyHash}</Text>

                <View style={styles.textRow}>
                    <Text style={styles.textAddressDetails}>{spendingHash}</Text>

                    <CopyButton value={spendingHash} />
                </View>
            </View>

        </View>
    )
}

const useStyles = () => {
    const SCREEN_WIDTH = useWindowDimensions().width

    const styles = StyleSheet.create({
        title: {
            fontSize: 18,
            fontWeight: '500'
        },
        addressDetails: {
            borderRadius: 16,
            width: SCREEN_WIDTH - 34,
            alignItems: 'center',
            maxHeight: 458,
            height: '100%',
            minHeight: 394,
            alignSelf: 'center',
            overflow: 'hidden',
            paddingVertical: 15,
            gap: 26,
            paddingTop: 32,
        },
        textAddressDetails: {
            fontWeight: '400',
            maxWidth: 279
        },
        textSection: {
            gap: 4,
            maxWidth: 311,
            width: '100%'
        },
        textRow: {
            flexDirection: 'row',
            gap: 4
        }
    })

    return { styles } as const
}
