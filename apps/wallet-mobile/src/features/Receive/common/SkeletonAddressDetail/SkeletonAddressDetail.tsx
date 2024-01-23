import React from 'react'
import { StyleSheet, View } from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { COLORS } from 'src/theme/config'

export const SkeletonAdressDetail = () => (
    <SkeletonPlaceholder borderRadius={8} backgroundColor={COLORS.LIGHT_GRAY} enabled  >
        <SkeletonPlaceholder.Item style={[styles.touchableCard]}>
            <View style={styles.skeleton} />
        </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
)
const styles = StyleSheet.create({
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
})