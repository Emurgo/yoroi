import { useTheme } from '@yoroi/theme';
import React from 'react'
import { StyleSheet, Text } from 'react-native'
import Animated, { FadeInUp, FadeOut, Layout } from 'react-native-reanimated';

import { Icon } from '../../../../../src/components';
import { mocks } from '../mocks';
import { useStrings } from '../useStrings';

type InfoCardProps = {
    onLimit: boolean
}

export function InfoCard({ onLimit }: InfoCardProps) {
    const strings = useStrings();

    const { styles, colors } = useStyles()

    return (
        onLimit ?
            <Animated.View
                layout={Layout}
                entering={FadeInUp}
                exiting={FadeOut}
                style={styles.smallAddressCard}
            >
                <Icon.Info size={24} color={colors.icon} />


                <Text style={styles.text} >
                    {strings.infoAddressLimit}

                    <Text style={[styles.text, { color: colors.yoroiZendesk }]}>{mocks.yoroiZendesk}</Text>
                </Text>
            </Animated.View>
            : null
    )
}

const useStyles = () => {
    const { theme } = useTheme()

    const styles = StyleSheet.create({
        smallAddressCard: {
            borderRadius: 8,
            width: '100%',
            alignItems: 'flex-start',
            alignSelf: 'center',
            overflow: 'hidden',
            padding: 16,
            marginBottom: 16,
            gap: 12,
            backgroundColor: theme.color.cyan[100]
        },
        text: {
            fontWeight: '400',
            fontSize: 16,
            lineHeight: 22,
            fontFamily: "Rubik Regular"
        },
        footer: {
            width: '100%',
            justifyContent: 'space-between',
            flexDirection: 'row'
        },
        statusUnused: {
            borderRadius: 20,
            backgroundColor: theme.color.secondary[600],
            paddingVertical: 6,
            paddingHorizontal: 10,
            alignItems: 'center',
            justifyContent: 'center'
        },
        statusUnusedText: {
            color: theme.color['white-static'],
            fontFamily: "Rubik Regular"
        },
        statusUsed: {
            borderRadius: 20,
            backgroundColor: theme.color['white-static'],
            paddingVertical: 6,
            paddingHorizontal: 10,
            alignItems: 'center',
            justifyContent: 'center'
        },
        statusUsedText: {
            fontFamily: "Rubik Regular"
        },
        date: {
            fontFamily: "Rubik Regular",
            fontWeight: '400',
            fontSize: 14,
            lineHeight: 22,
            color: theme.color.gray[700]
        },
    })

    const colors = {
        icon: theme.color.primary[500],
        yoroiZendesk: theme.color.primary[500]
    }

    return { styles, colors } as const
}
