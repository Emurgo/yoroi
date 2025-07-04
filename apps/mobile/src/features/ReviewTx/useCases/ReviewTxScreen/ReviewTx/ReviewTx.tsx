import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  FlatList,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'

import {Button} from '../../../../../components/Button/Button'
import {SafeArea} from '../../../../../components/SafeArea'
import {
  ScrollView,
  useScrollView,
} from '../../../../../components/ScrollView/ScrollView'
import {isEmptyString} from '../../../../../kernel/utils'
import {useStrings} from '../../../common/hooks/useStrings'
import {FormattedMetadata, FormattedTx} from '../../../common/types'
import {MetadataTab} from '../ReviewTx/Metadata/MetadataTab'
import {OverviewTab} from '../ReviewTx/Overview/OverviewTab'
import {UTxOsTab} from '../ReviewTx/UTxOs/UTxOsTab'
import {MintTab} from './Mint/MintTab'
import {ReferenceInputsTab} from './ReferenceInputs/ReferenceInputs'

const MaterialTab = createMaterialTopTabNavigator()
type Tabs = 'overview' | 'utxos' | 'metadata' | 'mint' | 'reference_inputs'

export const ReviewTx = ({
  formattedTx,
  formattedMetadata,
  operations,
  operationsNotice,
  details,
  receiverCustomTitle,
  createdBy,
  onConfirm,
}: {
  formattedTx: FormattedTx
  formattedMetadata?: FormattedMetadata
  operations?: Array<React.ReactNode>
  operationsNotice?: React.ReactNode
  details?: {title: string; component: React.ReactNode}
  receiverCustomTitle?: React.ReactNode
  createdBy?: React.ReactNode
  onConfirm: () => void
}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const tabsData: Array<[string, Tabs]> = [
    [strings.overviewTab, 'overview'],
    [strings.utxosTab, 'utxos'],
  ]
  const [activeTab, setActiveTab] = React.useState<Tabs>(tabsData[0][1])

  const showMetadataTab =
    !isEmptyString(formattedMetadata?.hash) &&
    formattedMetadata?.metadata != null
  const showMintTab = !!formattedTx.mint
  const showReferenceInoutsTab = formattedTx.referenceInputs.length > 0

  if (showMetadataTab) tabsData.push([strings.metadataTab, 'metadata'])
  if (showMintTab) tabsData.push([strings.mintTab, 'mint'])
  if (showReferenceInoutsTab)
    tabsData.push([strings.referenceInputsTab, 'reference_inputs'])

  // intentionally not using ref
  const {
    isScrollBarShown: isOverviewScrollBarShown,
    setIsScrollBarShown: setOverviewIsScrollBarShown,
  } = useScrollView()
  const {
    isScrollBarShown: isUtxosScrollBarShown,
    setIsScrollBarShown: setUtxosIsScrollBarShown,
  } = useScrollView()
  const {
    isScrollBarShown: isMetadataScrollBarShown,
    setIsScrollBarShown: setMetadataIsScrollBarShown,
  } = useScrollView()
  const {
    isScrollBarShown: isMintScrollBarShown,
    setIsScrollBarShown: setMintIsScrollBarShown,
  } = useScrollView()
  const {
    isScrollBarShown: isReferenceInputsScrollBarShown,
    setIsScrollBarShown: setReferenceInputsIsScrollBarShown,
  } = useScrollView()

  const scrollbarActive =
    (isOverviewScrollBarShown && activeTab === 'overview') ||
    (isUtxosScrollBarShown && activeTab === 'utxos') ||
    (isMetadataScrollBarShown && activeTab === 'metadata') ||
    (isMintScrollBarShown && activeTab === 'mint') ||
    (isReferenceInputsScrollBarShown && activeTab === 'reference_inputs')

  return (
    <SafeArea style={styles.root}>
      <MaterialTab.Navigator
        tabBar={(props) => {
          setActiveTab(tabsData[props.state.index][1])
          return <TabBar {...props} tabsData={tabsData} />
        }}
      >
        <MaterialTab.Screen name="overview">
          {() => (
            <ScrollView
              style={styles.root}
              onScrollBarChange={setOverviewIsScrollBarShown}
            >
              <OverviewTab
                tx={formattedTx}
                extraOperations={operations}
                operationsNotice={operationsNotice}
                details={details}
                createdBy={createdBy}
                receiverCustomTitle={receiverCustomTitle}
              />
            </ScrollView>
          )}
        </MaterialTab.Screen>

        <MaterialTab.Screen name="utxos">
          {() => (
            <ScrollView
              style={styles.root}
              onScrollBarChange={setUtxosIsScrollBarShown}
            >
              <UTxOsTab tx={formattedTx} />
            </ScrollView>
          )}
        </MaterialTab.Screen>

        {showMetadataTab && (
          <MaterialTab.Screen name="metadata">
            {() => (
              <ScrollView
                style={styles.root}
                onScrollBarChange={setMetadataIsScrollBarShown}
              >
                <MetadataTab
                  hash={formattedMetadata?.hash ?? null}
                  metadata={formattedMetadata?.metadata ?? null}
                />
              </ScrollView>
            )}
          </MaterialTab.Screen>
        )}

        {showMintTab && (
          <MaterialTab.Screen name="mint">
            {() => (
              <ScrollView
                style={styles.root}
                onScrollBarChange={setMintIsScrollBarShown}
              >
                <MintTab mintData={formattedTx.mint} />
              </ScrollView>
            )}
          </MaterialTab.Screen>
        )}

        {showReferenceInoutsTab && (
          <MaterialTab.Screen name="reference_inputs">
            {() => (
              <ScrollView
                style={styles.root}
                onScrollBarChange={setReferenceInputsIsScrollBarShown}
              >
                <ReferenceInputsTab
                  referenceInputs={formattedTx.referenceInputs}
                />
              </ScrollView>
            )}
          </MaterialTab.Screen>
        )}
      </MaterialTab.Navigator>

      <Actions style={scrollbarActive && styles.actionsScroll}>
        <Button title={strings.confirm} onPress={onConfirm} />
      </Actions>
    </SafeArea>
  )
}

const TabBar = ({
  navigation,
  state,
  tabsData,
}: MaterialTopTabBarProps & {tabsData: Array<Array<string>>}) => {
  const {styles} = useStyles()

  return (
    <FlatList
      data={tabsData}
      renderItem={({item: [label, key], index}) => (
        <Tab
          key={key}
          active={state.index === index}
          label={label}
          onPress={() => navigation.navigate(key)}
        />
      )}
      style={styles.tabBar}
      showsHorizontalScrollIndicator={false}
      bounces={false}
      horizontal
    />
  )
}

export const Tab = ({
  onPress,
  active,
  label,
  testID,
  style,
}: TouchableOpacityProps & {active: boolean; label: string}) => {
  const {styles} = useStyles()

  return (
    <TouchableOpacity
      style={[styles.tab, style]}
      onPress={onPress}
      testID={testID}
    >
      <View style={styles.tabContainer}>
        <Text
          style={[
            styles.tabText,
            active ? styles.tabTextActive : styles.tabTextInactive,
          ]}
        >
          {label}
        </Text>
      </View>

      {active && <View style={styles.indicator} />}
    </TouchableOpacity>
  )
}

const Actions = ({
  children,
  style,
}: {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}) => {
  const {styles} = useStyles()
  return <View style={[styles.actions, style]}>{children}</View>
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    actions: {
      ...atoms.p_lg,
    },
    tabBar: {
      marginHorizontal: 16, // to include the border
      maxHeight: 50,
      borderBottomWidth: 1,
      borderBottomColor: color.gray_200,
    },
    tab: {
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.py_md,
    },
    tabContainer: {
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.px_lg,
    },
    tabText: {
      ...atoms.body_1_lg_medium,
    },
    tabTextActive: {
      color: color.primary_600,
    },
    tabTextInactive: {
      color: color.gray_600,
    },
    indicator: {
      ...atoms.absolute,
      bottom: -2,
      height: 2.5,
      width: '100%',
      backgroundColor: color.el_primary_medium,
    },
    actionsScroll: {
      ...atoms.border_t,
      borderTopColor: color.gray_200,
    },
  })

  const colors = {
    lightGray: color.gray_200,
  }
  return {styles, colors} as const
}
