import {atoms as a, useTheme} from '@yoroi/theme'

import {
  MaterialTopTabBarProps,
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs'
import * as React from 'react'
import {
  FlatList,
  ScrollView as RNScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import {FormattedMetadata, FormattedTx} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {ScrollViewProvider} from '~/ui/ScrollView/context'
import {isEmptyString} from '~/wallets/utils/string'

import {MetadataTab} from '../ReviewTx/Metadata/MetadataTab'
import {OverviewTab, ReviewDetailsProps} from '../ReviewTx/Overview/OverviewTab'
import {UTxOsTab} from '../ReviewTx/UTxOs/UTxOsTab'
import {MintTab} from './Mint/MintTab'
import {ReferenceInputsTab} from './ReferenceInputs/ReferenceInputs'

const MaterialTab = createMaterialTopTabNavigator()
type Tabs = 'overview' | 'utxos' | 'metadata' | 'mint' | 'reference_inputs'

const TabWrapper = ({
  children,
  onConfirm,
}: {
  children: React.ReactNode
  onConfirm: () => void
}) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const scrollViewRef = React.useRef<RNScrollView | null>(null)

  return (
    <ScrollViewProvider>
      <SafeArea>
        <ScrollView ref={scrollViewRef} style={[a.flex_1, ta.bg_color_max]}>
          {children}
        </ScrollView>
        <SafeArea.Footer>
          <Button title={strings.txReview.confirm} onPress={onConfirm} />
        </SafeArea.Footer>
      </SafeArea>
    </ScrollViewProvider>
  )
}

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
  details?: ReviewDetailsProps
  receiverCustomTitle?: React.ReactNode
  createdBy?: React.ReactNode
  onConfirm: () => void
}) => {
  const strings = useStrings()

  const baseTabs = React.useMemo<Array<[string, Tabs]>>(
    () => [
      [strings.txReview.tabLabel.overview, 'overview'],
      [strings.txReview.tabLabel.utxos, 'utxos'],
    ],
    [strings.txReview.tabLabel.overview, strings.txReview.tabLabel.utxos],
  )
  const showMetadataTab =
    !isEmptyString(formattedMetadata?.hash) &&
    formattedMetadata?.metadata != null
  const showMintTab = !!formattedTx.mint
  const showReferenceInoutsTab = formattedTx.referenceInputs.length > 0

  const tabsData = React.useMemo<Array<[string, Tabs]>>(() => {
    const arr = [...baseTabs]
    if (showMetadataTab)
      arr.push([strings.txReview.tabLabel.metadataTab, 'metadata'])
    if (showMintTab) arr.push([strings.txReview.tabLabel.mint, 'mint'])
    if (showReferenceInoutsTab)
      arr.push([strings.txReview.tabLabel.referenceInputs, 'reference_inputs'])
    return arr
  }, [
    baseTabs,
    showMetadataTab,
    showMintTab,
    showReferenceInoutsTab,
    strings.txReview.tabLabel.metadataTab,
    strings.txReview.tabLabel.mint,
    strings.txReview.tabLabel.referenceInputs,
  ])

  return (
    <MaterialTab.Navigator
      screenOptions={{swipeEnabled: false}}
      tabBar={(props) => <TabBar {...props} tabsData={tabsData} />}
    >
      <MaterialTab.Screen
        name="overview"
        component={() => (
          <TabWrapper onConfirm={onConfirm}>
            <OverviewTab
              tx={formattedTx}
              extraOperations={operations}
              operationsNotice={operationsNotice}
              details={details}
              createdBy={createdBy}
              receiverCustomTitle={receiverCustomTitle}
            />
          </TabWrapper>
        )}
      />

      <MaterialTab.Screen
        name="utxos"
        component={() => (
          <TabWrapper onConfirm={onConfirm}>
            <UTxOsTab tx={formattedTx} />
          </TabWrapper>
        )}
      />

      {showMetadataTab && (
        <MaterialTab.Screen
          name="metadata"
          component={() => (
            <TabWrapper onConfirm={onConfirm}>
              <MetadataTab
                hash={formattedMetadata?.hash ?? null}
                metadata={formattedMetadata?.metadata ?? null}
              />
            </TabWrapper>
          )}
        />
      )}

      {showMintTab && (
        <MaterialTab.Screen
          name="mint"
          component={() => (
            <TabWrapper onConfirm={onConfirm}>
              <MintTab mintData={formattedTx.mint} />
            </TabWrapper>
          )}
        />
      )}

      {showReferenceInoutsTab && (
        <MaterialTab.Screen
          name="reference_inputs"
          component={() => (
            <TabWrapper onConfirm={onConfirm}>
              <ReferenceInputsTab
                referenceInputs={formattedTx.referenceInputs}
              />
            </TabWrapper>
          )}
        />
      )}
    </MaterialTab.Navigator>
  )
}

const TabBar = ({
  navigation,
  state,
  tabsData,
}: MaterialTopTabBarProps & {
  tabsData: Array<Array<string>>
}) => {
  const {palette: p} = useTheme()

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
      style={[
        a.py_lg,
        a.border_b,
        {
          maxHeight: 50,
          borderBottomColor: p.gray_200,
        },
      ]}
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
  const {atoms: ta} = useTheme()

  return (
    <TouchableOpacity
      style={StyleSheet.flatten([
        a.align_center,
        a.justify_center,
        a.py_md,
        a.debug,
        style,
      ])}
      onPress={onPress}
      testID={testID}
    >
      <Text
        style={[
          a.body_1_lg_medium,
          active ? ta.text_primary_medium : ta.text_gray_medium,
          {color: 'red'},
          a.debug,
        ]}
      >
        {active ? 'active' : 'inactive'}
        {label}
      </Text>

      {active && (
        <View
          style={[
            a.absolute,
            a.w_full,
            {
              bottom: -2,
              height: 2.5,
              backgroundColor: ta.el_primary_medium.color,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  )
}
