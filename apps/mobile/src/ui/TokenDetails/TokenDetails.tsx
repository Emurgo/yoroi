import {time} from '@yoroi/common'
import {isPrimaryTokenInfo, usePortfolioTokenDiscovery} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {isEmptyString} from '~/wallets/utils/string'
import {Copiable} from '../Copiable'
import {ExplorerInfoLinks} from '../ExplorerInfoLinks/ExplorerInfoLinks'
import {SimpleTab} from '../SimpleTab/SimpleTab'
import {TokenInfoIcon} from '../TokenInfoIcon/TokenInfoIcon'
import {useStrings} from './hooks/useStrings'

export const TokenDetails = ({
  tokenInfo,
}: {
  tokenInfo: Portfolio.Token.Info | undefined
}) => {
  if (tokenInfo == null) return null

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <Header info={tokenInfo} />

      <Space.Width.lg />

      <Info info={tokenInfo} />
    </View>
  )
}

const Header = ({info}: {info: Portfolio.Token.Info}) => {
  const {palette: p} = useTheme()
  const [policy, assetName] = info?.id.split('.') ?? ['', '']

  const title = !isEmptyString(info.ticker)
    ? info.ticker
    : !isEmptyString(info.name)
      ? info.name
      : ''

  return (
    <View style={[a.align_center]}>
      <TokenInfoIcon info={info} size="xl" />

      <Space.Height.sm />

      {!isEmptyString(title) && (
        <Text
          style={[
            a.body_1_lg_medium,
            a.text_center,
            {color: p.text_gray_medium, maxWidth: 300},
          ]}
        >
          {title}
        </Text>
      )}

      {!isPrimaryTokenInfo(info) && (
        <Text
          style={[
            a.body_1_lg_medium,
            a.text_center,
            {color: p.text_gray_medium, maxWidth: 300},
          ]}
        >{`(${assetName})`}</Text>
      )}

      <Space.Height.xl />

      <PolicyId policyId={policy} />

      <Space.Height.lg />

      <Fingerprint info={info} />
    </View>
  )
}

const Info = ({info}: {info: Portfolio.Token.Info}) => {
  const {palette: p} = useTheme()
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
      <Text style={[a.body_2_md_regular, {color: p.text_gray_max}]}>
        {strings.adaDescription}
      </Text>
    )

  return (
    <View style={[a.flex_1]}>
      <View style={[a.flex_row]}>
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

      <Space.Width.lg />

      {/* TABS CONTENT */}
      {isDiscoveryLoading ? (
        <ActivityIndicator size={22} color={p.gray_300} />
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
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {copy} = useCopy()

  if (!isActive || !discovery) return null

  const stringifiedMetadata = JSON.stringify(
    discovery.originalMetadata,
    null,
    2,
  )

  return (
    <View
      style={[
        a.flex_1,
        a.pt_lg,
        {borderRadius: 8, backgroundColor: p.bg_color_min},
      ]}
    >
      <View style={[a.px_lg, a.flex_row, a.justify_between]}>
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {strings.metadata}
        </Text>

        <TouchableOpacity
          onPress={() => copy({text: stringifiedMetadata})}
          activeOpacity={0.5}
        >
          <Icon.Copy size={24} color={p.gray_900} />
        </TouchableOpacity>
      </View>

      <Space.Height.sm />

      <ScrollView bounces={false} style={[a.px_lg]}>
        <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
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
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (isEmptyString(policyId)) return null

  return (
    <Row>
      <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
        {strings.policyId}
      </Text>

      <Space.Width.lg />

      <View style={[a.flex_1, a.align_center]}>
        <Copiable text={policyId}>
          <Text
            style={[
              a.flex_1,
              a.text_right,
              a.body_2_md_regular,
              {color: p.text_gray_max},
            ]}
          >
            {policyId}
          </Text>
        </Copiable>
      </View>
    </Row>
  )
}

const Fingerprint = ({info}: {info: Portfolio.Token.Info}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (isEmptyString(info.fingerprint)) return null

  return (
    <Row>
      <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
        {strings.fingerprint}
      </Text>

      <Space.Width.lg />

      <View style={[a.flex_1, a.align_center]}>
        <Copiable text={info.fingerprint}>
          <Text
            style={[
              a.flex_1,
              a.text_right,
              a.body_2_md_regular,
              {color: p.text_gray_max},
            ]}
          >
            {info.fingerprint}
          </Text>
        </Copiable>
      </View>
    </Row>
  )
}

const Name = ({info}: {info: Portfolio.Token.Info}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (isEmptyString(info.name)) return null

  return (
    <Row>
      <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
        {strings.name}
      </Text>

      <Text
        style={[
          a.flex_1,
          a.text_right,
          a.body_2_md_regular,
          {color: p.text_gray_max},
        ]}
      >
        {info.name}
      </Text>
    </Row>
  )
}

const TokenSupply = ({discovery}: {discovery?: Portfolio.Token.Discovery}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View>
      <Space.Width.sm />

      <Row>
        <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
          {strings.tokenSupply}
        </Text>

        <Text
          style={[
            a.flex_1,
            a.text_right,
            a.body_2_md_regular,
            {color: p.text_gray_max},
          ]}
        >
          {isEmptyString(discovery?.supply) ? '-' : discovery?.supply}
        </Text>
      </Row>
    </View>
  )
}

const Symbol = ({info}: {info: Portfolio.Token.Info}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (isEmptyString(info.ticker)) return null

  return (
    <View>
      <Space.Width.sm />

      <Row>
        <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
          {strings.symbol}
        </Text>

        <Text
          style={[
            a.flex_1,
            a.text_right,
            a.body_2_md_regular,
            {color: p.text_gray_max},
          ]}
        >
          {info.ticker}
        </Text>
      </Row>
    </View>
  )
}

const Description = ({info}: {info: Portfolio.Token.Info}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (isEmptyString(info.description)) return null

  return (
    <View>
      <Space.Width.sm />

      <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
        {strings.description}
      </Text>

      <Text style={[a.body_2_md_regular, {color: p.text_gray_max}]}>
        {info.description}
      </Text>
    </View>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.flex_row, a.justify_between]}>{children}</View>
}
