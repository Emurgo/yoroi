import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  FlatList,
  StyleProp,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'

import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {FormattedMetadata, FormattedTx} from '~/features/ReviewTx/common/types'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView, useScrollView} from '~/ui/ScrollView/ScrollView'
import {isEmptyString} from '~/wallets/utils/string'
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
  const {palette: p} = useTheme()
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
    <SafeArea style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <MaterialTab.Navigator
        tabBar={(props) => {
          setActiveTab(tabsData[props.state.index][1])
          return <TabBar {...props} tabsData={tabsData} />
        }}
      >
        <MaterialTab.Screen name="overview">
          {() => (
            <ScrollView
              style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
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
              style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
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
                style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
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
                style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
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
                style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
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

      <Actions
        style={scrollbarActive && [a.border_t, {borderTopColor: p.gray_200}]}
      >
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
        {
          marginHorizontal: 16,
          maxHeight: 50,
          borderBottomWidth: 1,
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
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      style={[a.align_center, a.justify_center, a.py_md, style]}
      onPress={onPress}
      testID={testID}
    >
      <View style={[a.align_center, a.justify_center, a.px_lg]}>
        <Text
          style={[
            a.body_1_lg_medium,
            active ? {color: p.primary_600} : {color: p.gray_600},
          ]}
        >
          {label}
        </Text>
      </View>

      {active && (
        <View
          style={[
            a.absolute,
            {
              bottom: -2,
              height: 2.5,
              width: '100%',
              backgroundColor: p.el_primary_medium,
            },
          ]}
        />
      )}
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
  return <View style={[a.p_lg, style]}>{children}</View>
}
