import {time} from '@yoroi/common'
import {isPrimaryTokenInfo, usePortfolioTokenDiscovery} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {isEmptyString} from '../../../kernel/utils'
import {useCopy} from '../../../kernel/utils/clipboard'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {Copiable} from '../Copiable'
import {ExplorerInfoLinks} from '../ExplorerInfoLinks/ExplorerInfoLinks'
import {Icon} from '../Icon'
import {SimpleTab} from '../SimpleTab/SimpleTab'
import {Space} from '../Space/Space'
import {TokenInfoIcon} from '../TokenInfoIcon/TokenInfoIcon'
import {useStrings} from './hooks/useStrings'

export const TokenDetails = ({
  tokenInfo,
}: {
  tokenInfo: Portfolio.Token.Info | undefined
}) => {
  if (tokenInfo == null) return null

  return (
    <View style={styles.root}>
      <Header info={tokenInfo} />

      <Space width="lg" />

      <Info info={tokenInfo} />
    </View>
  )
}

const Header = ({info}: {info: Portfolio.Token.Info}) => {
  const {color} = useTheme()
  const [policy, assetName] = info?.id.split('.') ?? ['', '']

  const title = !isEmptyString(info.ticker)
    ? info.ticker
    : !isEmptyString(info.name)
      ? info.name
      : ''

  return (
    <View style={styles.header}>
      <TokenInfoIcon info={info} size="xl" />

      <Space height="sm" />

      {!isEmptyString(title) && (
        <Text style={[styles.headerText, {color: color.text_gray_medium}]}>
          {title}
        </Text>
      )}

      {!isPrimaryTokenInfo(info) && (
        <Text
          style={[styles.headerText, {color: color.text_gray_medium}]}
        >{`(${assetName})`}</Text>
      )}

      <Space height="xl" />

      <PolicyId policyId={policyId} />

      <Space height="lg" />

      <Fingerprint info={info} />
    </View>
  )
}

const Info = ({info}: {info: Portfolio.Token.Info}) => {
  const {color} = useTheme()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const [activeTab, setActiveTab] = React.useState<'overview' | 'json'>(
    'overview',
  )

  const {tokenDiscovery, isLoading: isDiscoveryLoading} =
    usePortfolioTokenDiscovery(
      {
        id: info.id,
        network: wallet.networkManager.network,
        getTokenDiscovery:
          wallet.networkManager.tokenManager.api.tokenDiscovery,
      },
      {
        staleTime: time.session,
        enabled: !isPrimaryTokenInfo(info),
      },
    )

  if (isPrimaryTokenInfo(info))
    return (
      <Text style={[styles.description, {color: color.text_gray_max}]}>
        {strings.adaDescription}
      </Text>
    )

  return (
    <View style={styles.info}>
      <View style={styles.tabs}>
        <SimpleTab
          name={strings.overview}
          onPress={() => setActiveTab('overview')}
          isActive={activeTab === 'overview'}
        />

        <SimpleTab
          name={strings.json}
          onPress={() => setActiveTab('json')}
          isActive={activeTab === 'json'}
        />
      </View>

      <Space width="lg" />

      {/* ↓↓↓ TABS CONTENT ↓↓↓ */}

      {isDiscoveryLoading ? (
        <ActivityIndicator size={22} color={color.gray_300} />
      ) : (
        <>
          <Overview
            info={info}
            discovery={tokenDiscovery}
            isActive={activeTab === 'overview'}
          />

          <Json discovery={tokenDiscovery} isActive={activeTab === 'json'} />
        </>
      )}
    </View>
  )
}

const Json = ({
  discovery,
  isActive,
}: {
  discovery?: Portfolio.Token.Discovery
  isActive: boolean
}) => {
  const {color} = useTheme()
  const strings = useStrings()
  const {copy} = useCopy()

  if (!isActive || !discovery) return null

  const stringifiedMetadata = JSON.stringify(
    discovery.originalMetadata,
    null,
    2,
  )

  return (
    <View style={[styles.json, {backgroundColor: color.bg_color_min}]}>
      <View style={styles.jsonHeader}>
        <Text style={[styles.jsonLabel, {color: color.text_gray_medium}]}>
          {strings.metadata}
        </Text>

        <TouchableOpacity
          onPress={() => copy({text: stringifiedMetadata})}
          activeOpacity={0.5}
        >
          <Icon.Copy size={24} color={color.gray_900} />
        </TouchableOpacity>
      </View>

      <Space height="sm" />

      <ScrollView bounces={false} style={styles.jsonContent}>
        <Text style={[styles.metadata, {color: color.text_gray_medium}]}>
          {stringifiedMetadata}
        </Text>
      </ScrollView>
    </View>
  )
}

const Overview = ({
  info,
  discovery,
  isActive,
}: {
  info: Portfolio.Token.Info
  discovery?: Portfolio.Token.Discovery
  isActive: boolean
}) => {
  if (!isActive) return null

  if (info.type === 'ft') {
    return (
      <View>
        <Name info={info} />

        <Symbol info={info} />

        <TokenSupply discovery={discovery} />

        <Description info={info} />

        <ExplorerInfoLinks value={info.id} type="token" />
      </View>
    )
  }
  return (
    <View>
      <Name info={info} />

      <Description info={info} />

      <ExplorerInfoLinks value={info.id} type="token" />
    </View>
  )
}

const PolicyId = ({policyId}: {policyId: string}) => {
  const {color} = useTheme()
  const strings = useStrings()

  if (isEmptyString(policyId)) return null

  return (
    <Row>
      <Text style={[styles.label, {color: color.text_gray_low}]}>
        {strings.policyId}
      </Text>

      <Space width="lg" />

      <View style={styles.copiableText}>
        <Copiable text={policyId}>
          <Text style={[styles.value, {color: color.text_gray_max}]}>
            {policyId}
          </Text>
        </Copiable>
      </View>
    </Row>
  )
}

const Fingerprint = ({info}: {info: Portfolio.Token.Info}) => {
  const {color} = useTheme()
  const strings = useStrings()

  if (isEmptyString(info.fingerprint)) return null

  return (
    <Row>
      <Text style={[styles.label, {color: color.text_gray_low}]}>
        {strings.fingerprint}
      </Text>

      <Space width="lg" />

      <View style={styles.copiableText}>
        <Copiable text={info.fingerprint}>
          <Text style={[styles.value, {color: color.text_gray_max}]}>
            {info.fingerprint}
          </Text>
        </Copiable>
      </View>
    </Row>
  )
}

const Name = ({info}: {info: Portfolio.Token.Info}) => {
  const {color} = useTheme()
  const strings = useStrings()

  if (isEmptyString(info.name)) return null

  return (
    <Row>
      <Text style={[styles.label, {color: color.text_gray_low}]}>
        {strings.name}
      </Text>

      <Text style={[styles.value, {color: color.text_gray_max}]}>
        {info.name}
      </Text>
    </Row>
  )
}

const TokenSupply = ({discovery}: {discovery?: Portfolio.Token.Discovery}) => {
  const {color} = useTheme()
  const strings = useStrings()

  return (
    <View>
      <Space width="sm" />

      <Row>
        <Text style={[styles.label, {color: color.text_gray_low}]}>
          {strings.tokenSupply}
        </Text>

        <Text style={[styles.value, {color: color.text_gray_max}]}>
          {isEmptyString(discovery?.supply) ? '-' : discovery?.supply}
        </Text>
      </Row>
    </View>
  )
}

const Symbol = ({info}: {info: Portfolio.Token.Info}) => {
  const {color} = useTheme()
  const strings = useStrings()

  if (isEmptyString(info.ticker)) return null

  return (
    <View>
      <Space width="sm" />

      <Row>
        <Text style={[styles.label, {color: color.text_gray_low}]}>
          {strings.symbol}
        </Text>

        <Text style={[styles.value, {color: color.text_gray_max}]}>
          {info.ticker}
        </Text>
      </Row>
    </View>
  )
}

const Description = ({info}: {info: Portfolio.Token.Info}) => {
  const {color} = useTheme()
  const strings = useStrings()

  if (isEmptyString(info.description)) return null

  return (
    <View>
      <Space width="sm" />

      <Text style={[styles.label, {color: color.text_gray_low}]}>
        {strings.description}
      </Text>

      <Text style={[styles.description, {color: color.text_gray_max}]}>
        {info.description}
      </Text>
    </View>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  return <View style={styles.row}>{children}</View>
}

const styles = StyleSheet.create({
  root: {
    ...a.flex_1,
    ...a.px_lg,
  },
  header: {
    ...a.align_center,
  },
  headerText: {
    ...a.body_1_lg_medium,
    ...a.text_center,
    maxWidth: 300,
  },
  row: {
    ...a.flex_row,
    ...a.justify_between,
  },
  label: {
    ...a.body_2_md_regular,
  },
  value: {
    ...a.flex_1,
    ...a.text_right,
    ...a.body_2_md_regular,
  },
  description: {
    ...a.body_2_md_regular,
  },
  tabs: {
    ...a.flex_row,
  },
  copiableText: {
    ...a.flex_1,
    ...a.align_center,
  },
  json: {
    ...a.flex_1,
    ...a.pt_lg,
    borderRadius: 8,
  },
  jsonHeader: {
    ...a.px_lg,
    ...a.flex_row,
    ...a.justify_between,
  },
  jsonLabel: {
    ...a.body_1_lg_medium,
  },
  jsonContent: {
    ...a.px_lg,
  },
  info: {
    ...a.flex_1,
  },
  metadata: {
    ...a.body_2_md_regular,
  },
})
