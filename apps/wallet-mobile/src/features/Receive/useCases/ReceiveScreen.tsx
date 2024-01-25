import { useFocusEffect } from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useCopy } from 'src/legacy/useCopy'
import { useMetrics } from 'src/metrics/metricsManager'
import { useSelectedWallet } from 'src/SelectedWallet'
import { COLORS, colors } from 'src/theme'
import { useHideBottomTabBar, useReceiveAddresses } from 'src/yoroi-wallets/hooks'

import { Button, Spacer, StatusBar } from '../../../components'
import { AddressDetail } from '../common/AddressDetail/AddressDetail'
import { SkeletonAdressDetail } from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import { useStrings } from '../common/useStrings'


export const ReceiveScreen = () => {
    useHideBottomTabBar()
    const strings = useStrings()
    const wallet = useSelectedWallet()
    const receiveAddresses = useReceiveAddresses(wallet)

    const [isCopying, copy] = useCopy()

    const currentAddress = _.last(receiveAddresses)

    React.useEffect(() => {
        wallet.generateNewReceiveAddressIfNeeded()
    }, [wallet])

    const { track } = useMetrics()

    useFocusEffect(
        React.useCallback(() => {
            track.receivePageViewed()
        }, [track]),
    )

    return (
        <View style={styles.root}>
            <StatusBar type="dark" />

            <ScrollView>
                <Spacer height={24} />

                <Content>
                    <View style={styles.address}>
                        {currentAddress !== null ? (
                            <AddressDetail address={currentAddress} title={strings.addresscardTitle} />
                        ) : (
                            <SkeletonAdressDetail />
                        )}
                    </View>

                    <Spacer height={64} />

                    <Button
                        outline
                        title='request specific amount'
                        textStyles={{
                            color: colors.buttonBackgroundBlue
                        }}
                    />

                    <Spacer height={24} />

                    <Button
                        shelleyTheme
                        onPress={() => {
                            copy(currentAddress!)
                        }}
                        disabled={currentAddress === null ? true : false}
                        testID="copyReceiveAddressButton"
                        title='Copy address'
                        iconImage={require('../../src/assets/img/copy.png')}
                        isCopying={isCopying}
                    />

                </Content>
            </ScrollView>
        </View>
    )
}

const Content = (props) => <View {...props} style={styles.content} />

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    content: {
        paddingHorizontal: 16,
    },
    address: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 180,
        maxHeight: 458,
    },
})
