import {usePortfolioTokenDiscovery} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {MediaPreview} from '../../../components/MediaPreview/MediaPreview'
import {SimpleTab} from '../../../components/SimpleTab/SimpleTab'
import {Space} from '../../../components/Space/Space'
import {useCopy} from '../../../hooks/useCopy'
import {time} from '../../../kernel/constants'
import {isEmptyString} from '../../../kernel/utils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {CopiableText} from './CopiableText'
import {useStrings} from './hooks/useStrings'

export const TokenDetails = ({tokenInfo}: {tokenInfo: Portfolio.Token.Info}) => {
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      <Header info={tokenInfo} />

      <Space width="lg" />

      <Info info={tokenInfo} />
    </View>
  )
}

const Header = ({info}: {info: Portfolio.Token.Info}) => {
  const {styles} = useStyles()
  const [policyId, assetName] = info.id.split('.')

  const title = !isEmptyString(info.ticker) ? info.ticker : !isEmptyString(info.name) ? info.name : ''

  return (
    <View style={styles.header}>
      <MediaPreview info={info} width={81} height={81} />

      <Space height="sm" />

      {!isEmptyString(title) && <Text style={styles.headerText}>{title}</Text>}

      <Text style={styles.headerText}>{`(${assetName})`}</Text>

      <Space height="xl" />

      <PolicyId policyId={policyId} />

      <Space height="lg" />

      <Fingerprint info={info} />
    </View>
  )
}

const Info = ({info}: {info: Portfolio.Token.Info}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const [activeTab, setActiveTab] = React.useState<'overview' | 'json'>('overview')

  const {tokenDiscovery} = usePortfolioTokenDiscovery(
    {
      id: info.id,
      network: wallet.networkManager.network,
      getTokenDiscovery: wallet.networkManager.tokenManager.api.tokenDiscovery,
    },
    {
      staleTime: time.session,
    },
  )

  return (
    <View style={styles.info}>
      <View style={styles.tabs}>
        <SimpleTab
          name={strings.overview}
          onPress={() => setActiveTab('overview')}
          isActive={activeTab === 'overview'}
        />

        <SimpleTab name={strings.json} onPress={() => setActiveTab('json')} isActive={activeTab === 'json'} />
      </View>

      <Space width="lg" />

      {/* ↓↓↓ TABS CONTENT ↓↓↓ */}

      <Overview info={info} discovery={tokenDiscovery} isActive={activeTab === 'overview'} />

      <Json discovery={tokenDiscovery} isActive={activeTab === 'json'} />
    </View>
  )
}

const Json = ({discovery, isActive}: {discovery?: Portfolio.Token.Discovery; isActive: boolean}) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const [, copy] = useCopy()

  if (!isActive || !discovery) return null

  const stringifiedMetadata = JSON.stringify(discovery.originalMetadata, null, 2)

  return (
    <View style={styles.json}>
      <View style={styles.jsonHeader}>
        <Text style={styles.jsonLabel}>{strings.metadata}</Text>

        <TouchableOpacity onPress={() => copy(stringifiedMetadata)} activeOpacity={0.5}>
          <Icon.Copy size={24} color={colors.copy} />
        </TouchableOpacity>
      </View>

      <Space height="sm" />

      <ScrollView bounces={false} style={styles.jsonContent}>
        <Text style={styles.metadata}>{stringifiedMetadata}</Text>
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
      <ScrollView bounces={false}>
        <Name info={info} />

        <Symbol info={info} />

        <TokenSupply discovery={discovery} />

        <Description info={info} />

        <Links info={info} />
      </ScrollView>
    )
  }
  return (
    <ScrollView bounces={false}>
      <Name info={info} />

      <Description info={info} />

      <Links info={info} />
    </ScrollView>
  )
}

const PolicyId = ({policyId}: {policyId: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  if (isEmptyString(policyId)) return null

  return (
    <Row>
      <Text style={styles.label}>{strings.policyId}</Text>

      <Space width="lg" />

      <View style={styles.copiableText}>
        <CopiableText textStyle={styles.value} text={policyId} multiline />
      </View>
    </Row>
  )
}

const Fingerprint = ({info}: {info: Portfolio.Token.Info}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  if (isEmptyString(info.fingerprint)) return null

  return (
    <Row>
      <Text style={styles.label}>{strings.fingerprint}</Text>

      <Space width="lg" />

      <View style={styles.copiableText}>
        <CopiableText textStyle={styles.value} text={info.fingerprint} multiline />
      </View>
    </Row>
  )
}

const Name = ({info}: {info: Portfolio.Token.Info}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  if (isEmptyString(info.name)) return null

  return (
    <Row>
      <Text style={styles.label}>{strings.name}</Text>

      <Text style={styles.value}>{info.name}</Text>
    </Row>
  )
}

const TokenSupply = ({discovery}: {discovery?: Portfolio.Token.Discovery}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  if (!discovery || isEmptyString(discovery.supply)) return null

  return (
    <View>
      <Space width="sm" />

      <Row>
        <Text style={styles.label}>{strings.tokenSupply}</Text>

        <Text style={styles.value}>{discovery.supply}</Text>
      </Row>
    </View>
  )
}

const Symbol = ({info}: {info: Portfolio.Token.Info}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  if (isEmptyString(info.ticker)) return null

  return (
    <View>
      <Space width="sm" />

      <Row>
        <Text style={styles.label}>{strings.symbol}</Text>

        <Text style={styles.value}>{info.ticker}</Text>
      </Row>
    </View>
  )
}

const Description = ({info}: {info: Portfolio.Token.Info}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  if (isEmptyString(info.description)) return null

  return (
    <View>
      <Space width="sm" />

      <Text style={styles.label}>{strings.description}</Text>

      <Text style={styles.description}>{info.description}</Text>
    </View>
  )
}

const Links = ({info}: {info: Portfolio.Token.Info}) => {
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const strings = useStrings()

  const handleOpenLink = async (direction: 'cardanoscan' | 'adaex') => {
    if (info == null) return
    if (direction === 'cardanoscan') {
      await Linking.openURL(wallet.networkManager.explorers.cardanoscan.token(info.id))
    } else {
      await Linking.openURL(wallet.networkManager.explorers.cexplorer.token(info.id))
    }
  }

  return (
    <View>
      <Space width="sm" />

      <Text style={styles.label}>{strings.details}</Text>

      <View style={styles.linkGroup}>
        <TouchableOpacity onPress={() => handleOpenLink('cardanoscan')}>
          <Text style={styles.link}>Cardanoscan</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleOpenLink('adaex')}>
          <Text style={styles.link}>Adaex</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.row}>{children}</View>
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    header: {
      ...atoms.align_center,
    },
    headerText: {
      ...atoms.body_1_lg_medium,
      ...atoms.text_center,
      color: color.text_gray_medium,
      maxWidth: 300,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    label: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
    },
    value: {
      ...atoms.text_right,
      ...atoms.body_2_md_regular,
      color: color.text_gray_max,
    },
    description: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_max,
    },
    tabs: {
      ...atoms.flex_row,
    },
    link: {
      ...atoms.link_1_lg_underline,
      color: color.text_primary_medium,
    },
    linkGroup: {
      ...atoms.flex_row,
      ...atoms.gap_lg,
    },
    copiableText: {
      ...atoms.flex_1,
      ...atoms.align_center,
    },
    json: {
      ...atoms.flex_1,
      ...atoms.pt_lg,
      borderRadius: 8,
      backgroundColor: color.bg_color_min,
    },
    jsonHeader: {
      ...atoms.px_lg,
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    jsonLabel: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    jsonContent: {
      ...atoms.px_lg,
    },
    info: {
      ...atoms.flex_1,
    },
    metadata: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
