import React, {  } from 'react'
import { StyleSheet, View } from 'react-native'
import { CopyButton, Text } from 'src/components';
import { COLORS } from 'src/theme';

import { useStrings } from '../useStrings';

type AddressDetailsProps = {
    address: string
    stakingHash: string
    spendingHash: string
    title?: string
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

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: '500'
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