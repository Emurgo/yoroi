import {useFocusEffect} from '@react-navigation/native'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {LayoutAnimation, StyleSheet, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Spacer, StatusBar, Text} from '../../../../components'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useSync} from '../../../../yoroi-wallets/hooks'
import {StartSwapTokensScreen} from '../StartSwapTokensScreen'

type Tab = 'tokenSwap' | 'orders'

export const StartSwapScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const [activeTab, setActiveTab] = useState<Tab>('tokenSwap')
  const onSelectTab = (tab: Tab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setActiveTab(tab)
  }

  const {sync} = useSync(wallet)
  useFocusEffect(React.useCallback(() => sync(), [sync]))

  return (
    <View style={styles.scrollView}>
      <StatusBar type="light" />

      <ScrollView>
        <View style={styles.container}>
          <Tabs>
            <Tab
              onPress={() => {
                onSelectTab('tokenSwap')
              }}
              label={strings.tokenSwap}
              active={activeTab === 'tokenSwap'}
              testID="tokenSwapTabButton"
            />

            <Tab //
              onPress={() => {
                onSelectTab('orders')
              }}
              label={strings.orders}
              active={activeTab === 'orders'}
              testID="ordersTabButton"
            />
          </Tabs>

          <TabPanels>
            <Spacer height={4} />

            <TabPanel active={activeTab === 'tokenSwap'}>
              <StartSwapTokensScreen />
            </TabPanel>

            <TabPanel active={activeTab === 'orders'}>
              <Text>Orders Here TODO</Text>
            </TabPanel>
          </TabPanels>
        </View>
      </ScrollView>
    </View>
  )
}

const Tabs = ({children}: {children: React.ReactNode}) => <View style={styles.tabs}>{children}</View>
const Tab = ({
  onPress,
  active,
  label,
  testID,
}: {
  onPress: () => void
  active: boolean
  label: string
  testID: string
}) => (
  <TouchableOpacity style={styles.tab} onPress={onPress} testID={testID}>
    <View style={styles.centered}>
      <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>{label}</Text>
    </View>

    {active && <View style={styles.indicator} />}
  </TouchableOpacity>
)
const TabPanels = ({children}: {children: React.ReactNode}) => <View style={styles.tabNavigatorRoot}>{children}</View>
const TabPanel = ({active, children}: {active: boolean; children: React.ReactNode}) => <>{active ? children : null}</>

const messages = defineMessages({
  tokenSwap: {
    id: 'swap.swapScreen.tokenSwapTab',
    defaultMessage: '!!!Token Swap',
  },
  orders: {
    id: 'swap.swapScreen.ordersSwapTab',
    defaultMessage: '!!!Orders',
  },
})

const useStrings = () => {
  const intl = useIntl()
  return {
    tokenSwap: intl.formatMessage(messages.tokenSwap),
    orders: intl.formatMessage(messages.orders),
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },

  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    flex: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
  },
  tabTextActive: {
    color: COLORS.SHELLEY_BLUE,
  },
  tabTextInactive: {
    color: COLORS.TEXT_INPUT,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: COLORS.SHELLEY_BLUE,
  },

  tabNavigatorRoot: {
    flex: 1,
    paddingTop: 8,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
})
