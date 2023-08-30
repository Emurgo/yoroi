import React, {useState} from 'react'
import {LayoutAnimation, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Spacer, StatusBar, Text} from '../../../../components'
import {COLORS} from '../../../../theme'
import {useHideBottomTabBar} from '../../../../yoroi-wallets/hooks'
import {useStrings} from '../../common/strings'
import {CreateOrder} from './CreateOrder/CreateOrder'
import {ListOrders} from './ListOrders/ListOrders'

type TabOptions = 'createOrder' | 'listOrders'

export const StartSwapScreen = () => {
  useHideBottomTabBar()

  const strings = useStrings()
  const [activeTab, setActiveTab] = useState<TabOptions>('createOrder')
  const onSelectTab = (tab: TabOptions) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setActiveTab(tab)
  }

  return (
    <View style={styles.scrollView}>
      <StatusBar type="dark" />

      <View style={styles.container}>
        <Tabs>
          <Tab
            onPress={() => onSelectTab('createOrder')}
            label={strings.tokenSwap}
            active={activeTab === 'createOrder'}
            testID="createOrderTabButton"
          />

          <Tab
            onPress={() => onSelectTab('listOrders')}
            label={strings.orderSwap}
            active={activeTab === 'listOrders'}
            testID="listOrdersTabButton"
          />
        </Tabs>

        <Spacer height={2} />

        <TabPanels>
          <Spacer height={4} />

          <TabPanel active={activeTab === 'createOrder'}>
            <CreateOrder />
          </TabPanel>

          <TabPanel active={activeTab === 'listOrders'}>
            <ListOrders />
          </TabPanel>
        </TabPanels>
      </View>
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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },

  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: {width: 0.1, height: 0.1},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
