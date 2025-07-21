# Yoroi SDK - Components & UI Guide

This guide covers all React components, hooks, and UI elements provided by the Yoroi SDK packages.

## Table of Contents

1. [Theme Components](#theme-components)
2. [Portfolio Components](#portfolio-components)
3. [DApp Connector Components](#dapp-connector-components)
4. [Common Components](#common-components)
5. [Staking Components](#staking-components)
6. [Notification Components](#notification-components)
7. [Custom Hooks](#custom-hooks)
8. [Styling Guide](#styling-guide)

---

## Theme Components

### ThemeProvider

The root theme provider that wraps your entire application.

```typescript
import { ThemeProvider } from '@yoroi/theme'

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: ThemeConfig
  onThemeChange?: (theme: ThemeConfig) => void
}

function App() {
  return (
    <ThemeProvider 
      initialTheme={customTheme}
      onThemeChange={(theme) => {
        // Save theme preference
        AsyncStorage.setItem('theme', JSON.stringify(theme))
      }}
    >
      <MainApp />
    </ThemeProvider>
  )
}
```

### useTheme Hook

Access theme data and controls throughout your application.

```typescript
import { useTheme } from '@yoroi/theme'

function MyComponent() {
  const {
    config,           // Current theme configuration
    palette,          // Color palette
    atoms,           // Atomic design system
    tokens,          // Design tokens
    selectTheme,     // Function to change theme
    isLight,         // Boolean: is light theme
    isDark,          // Boolean: is dark theme
    basePalette,     // Base palette colors
    basePaletteInverted  // Inverted palette
  } = useTheme()

  return (
    <View style={[atoms.bg_color_max, atoms.p_16]}>
      <Text style={atoms.text_primary_max}>
        Current theme: {config.name}
      </Text>
      <TouchableOpacity
        style={[atoms.btn_primary, atoms.mt_16]}
        onPress={() => selectTheme(isLight ? darkTheme : lightTheme)}
      >
        <Text style={atoms.text_button}>
          Switch to {isLight ? 'Dark' : 'Light'} Theme
        </Text>
      </TouchableOpacity>
    </View>
  )
}
```

### ThemeToggle Component

```typescript
import { useTheme } from '@yoroi/theme'
import { Switch } from 'react-native'

export function ThemeToggle() {
  const { isDark, selectTheme, lightTheme, darkTheme } = useTheme()

  return (
    <View style={styles.container}>
      <Text>Dark Mode</Text>
      <Switch
        value={isDark}
        onValueChange={(value) => {
          selectTheme(value ? darkTheme : lightTheme)
        }}
      />
    </View>
  )
}
```

---

## Portfolio Components

### TokenInfo Component

Display comprehensive token information using portfolio hooks.

```typescript
import { usePortfolioTokenInfo } from '@yoroi/portfolio'
import { useTheme } from '@yoroi/theme'

interface TokenInfoProps {
  tokenId: string
  showPrice?: boolean
  showMetadata?: boolean
}

export function TokenInfo({ 
  tokenId, 
  showPrice = true, 
  showMetadata = true 
}: TokenInfoProps) {
  const { atoms } = useTheme()
  const {
    data: tokenInfo,
    isLoading,
    error,
    refetch
  } = usePortfolioTokenInfo({
    tokenId,
    options: { enabled: !!tokenId }
  })

  if (isLoading) {
    return (
      <View style={[atoms.flex_center, atoms.p_16]}>
        <ActivityIndicator />
        <Text style={atoms.text_gray_medium}>Loading token info...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[atoms.bg_error_light, atoms.p_16, atoms.rounded_8]}>
        <Text style={atoms.text_error}>
          Failed to load token information
        </Text>
        <TouchableOpacity onPress={refetch} style={atoms.mt_8}>
          <Text style={atoms.text_primary_max}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!tokenInfo) return null

  return (
    <View style={[atoms.bg_color_max, atoms.p_16, atoms.rounded_12]}>
      {/* Token Header */}
      <View style={[atoms.flex_row, atoms.items_center]}>
        {tokenInfo.image && (
          <Image 
            source={{ uri: tokenInfo.image }} 
            style={[atoms.w_12, atoms.h_12, atoms.rounded_full]}
          />
        )}
        <View style={atoms.ml_12}>
          <Text style={[atoms.text_primary_max, atoms.font_semibold]}>
            {tokenInfo.name}
          </Text>
          <Text style={atoms.text_gray_medium}>
            {tokenInfo.symbol} • {tokenInfo.type}
          </Text>
        </View>
      </View>

      {/* Token Details */}
      {showMetadata && (
        <View style={atoms.mt_16}>
          {tokenInfo.description && (
            <Text style={[atoms.text_gray_max, atoms.mb_8]}>
              {tokenInfo.description}
            </Text>
          )}
          
          <View style={[atoms.flex_row, atoms.justify_between]}>
            <Text style={atoms.text_gray_medium}>Decimals:</Text>
            <Text style={atoms.text_primary_max}>{tokenInfo.decimals}</Text>
          </View>
          
          <View style={[atoms.flex_row, atoms.justify_between]}>
            <Text style={atoms.text_gray_medium}>Source:</Text>
            <Text style={atoms.text_primary_max}>{tokenInfo.source}</Text>
          </View>
        </View>
      )}

      {/* Price Information */}
      {showPrice && tokenInfo.price && (
        <View style={[atoms.mt_16, atoms.pt_16, atoms.border_t_gray]}>
          <View style={[atoms.flex_row, atoms.justify_between]}>
            <Text style={atoms.text_gray_medium}>Price (USD):</Text>
            <Text style={atoms.text_primary_max}>
              ${tokenInfo.price.usd.toFixed(6)}
            </Text>
          </View>
          
          {tokenInfo.price.change24h && (
            <View style={[atoms.flex_row, atoms.justify_between]}>
              <Text style={atoms.text_gray_medium}>24h Change:</Text>
              <Text style={[
                tokenInfo.price.change24h >= 0 
                  ? atoms.text_success 
                  : atoms.text_error
              ]}>
                {tokenInfo.price.change24h >= 0 ? '+' : ''}
                {tokenInfo.price.change24h.toFixed(2)}%
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
```

### TokenDiscovery Component

```typescript
import { usePortfolioTokenDiscovery } from '@yoroi/portfolio'

interface TokenDiscoveryProps {
  searchTerm: string
  onTokenSelect: (tokenId: string) => void
  limit?: number
}

export function TokenDiscovery({ 
  searchTerm, 
  onTokenSelect, 
  limit = 20 
}: TokenDiscoveryProps) {
  const { atoms } = useTheme()
  const {
    data: discoveryResults,
    isLoading,
    error
  } = usePortfolioTokenDiscovery({
    searchTerm,
    limit,
    options: { enabled: searchTerm.length >= 2 }
  })

  if (isLoading) {
    return (
      <View style={atoms.p_16}>
        <ActivityIndicator />
      </View>
    )
  }

  if (error) {
    return (
      <Text style={[atoms.text_error, atoms.p_16]}>
        Search failed. Please try again.
      </Text>
    )
  }

  if (!discoveryResults?.length) {
    return (
      <Text style={[atoms.text_gray_medium, atoms.p_16]}>
        No tokens found for "{searchTerm}"
      </Text>
    )
  }

  return (
    <FlatList
      data={discoveryResults}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            atoms.flex_row,
            atoms.items_center,
            atoms.p_16,
            atoms.border_b_gray
          ]}
          onPress={() => onTokenSelect(item.id)}
        >
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={[atoms.w_10, atoms.h_10, atoms.rounded_full]}
            />
          )}
          <View style={atoms.ml_12}>
            <Text style={atoms.text_primary_max}>{item.name}</Text>
            <Text style={atoms.text_gray_medium}>
              {item.symbol} • {item.fingerprint}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  )
}
```

### PortfolioSummary Component

```typescript
import { PortfolioBalanceManager } from '@yoroi/portfolio'
import { amountFormatter } from '@yoroi/portfolio'

interface PortfolioSummaryProps {
  balanceManager: PortfolioBalanceManager
  currency?: 'usd' | 'ada'
}

export function PortfolioSummary({ 
  balanceManager, 
  currency = 'usd' 
}: PortfolioSummaryProps) {
  const { atoms } = useTheme()
  const [totalValue, setTotalValue] = useState('0')
  const [balances, setBalances] = useState([])
  const [breakdown, setBreakdown] = useState(null)

  useEffect(() => {
    const updateData = () => {
      setTotalValue(balanceManager.getTotalValue(currency))
      setBalances(balanceManager.getBalances())
      setBreakdown(balanceManager.getPrimaryBreakdown())
    }

    updateData()
    
    // Subscribe to balance updates
    const unsubscribe = balanceManager.subscribe('refresh', updateData)
    return unsubscribe
  }, [balanceManager, currency])

  return (
    <View style={[atoms.bg_color_max, atoms.p_16, atoms.rounded_12]}>
      {/* Total Value */}
      <View style={atoms.mb_16}>
        <Text style={[atoms.text_gray_medium, atoms.mb_4]}>
          Total Portfolio Value
        </Text>
        <Text style={[atoms.text_primary_max, atoms.font_bold, atoms.text_2xl]}>
          {currency === 'usd' ? '$' : '₳'}{totalValue}
        </Text>
      </View>

      {/* Breakdown */}
      {breakdown && (
        <View style={[atoms.flex_row, atoms.justify_between, atoms.mb_16]}>
          <View style={atoms.items_center}>
            <Text style={atoms.text_gray_medium}>Native</Text>
            <Text style={atoms.text_primary_max}>
              {currency === 'usd' ? '$' : '₳'}{breakdown.native}
            </Text>
          </View>
          <View style={atoms.items_center}>
            <Text style={atoms.text_gray_medium}>Tokens</Text>
            <Text style={atoms.text_primary_max}>
              {currency === 'usd' ? '$' : '₳'}{breakdown.ft}
            </Text>
          </View>
          <View style={atoms.items_center}>
            <Text style={atoms.text_gray_medium}>NFTs</Text>
            <Text style={atoms.text_primary_max}>
              {currency === 'usd' ? '$' : '₳'}{breakdown.nft}
            </Text>
          </View>
        </View>
      )}

      {/* Top Holdings */}
      <Text style={[atoms.text_primary_max, atoms.font_semibold, atoms.mb_8]}>
        Top Holdings
      </Text>
      
      {balances.slice(0, 5).map((balance, index) => (
        <View
          key={balance.info.id}
          style={[atoms.flex_row, atoms.justify_between, atoms.py_8]}
        >
          <View style={[atoms.flex_row, atoms.items_center]}>
            <Text style={atoms.text_primary_max}>{balance.info.symbol}</Text>
            <Text style={[atoms.text_gray_medium, atoms.ml_8]}>
              {balance.info.name}
            </Text>
          </View>
          <View style={atoms.items_end}>
            <Text style={atoms.text_primary_max}>
              {amountFormatter({
                quantity: balance.quantity.total,
                decimals: balance.info.decimals,
                symbol: balance.info.symbol
              })}
            </Text>
            {balance.price && (
              <Text style={atoms.text_gray_medium}>
                {currency === 'usd' ? '$' : '₳'}
                {(balance.price[currency] * 
                  parseFloat(balance.quantity.total) / 
                  Math.pow(10, balance.info.decimals)
                ).toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  )
}
```

---

## DApp Connector Components

### DappConnectorProvider

React context provider for DApp connections.

```typescript
import { DappConnectorProvider } from '@yoroi/dapp-connector'

interface DappConnectorProviderProps {
  connector: DappConnector
  children: React.ReactNode
}

function App() {
  const [connector, setConnector] = useState(null)

  useEffect(() => {
    async function setupConnector() {
      const dappConnector = await setupDappConnector(wallet)
      setConnector(dappConnector)
    }
    setupConnector()
  }, [wallet])

  return (
    <DappConnectorProvider connector={connector}>
      <WalletApp />
    </DappConnectorProvider>
  )
}
```

### DappList Component

```typescript
import { useDappList } from '@yoroi/dapp-connector'

export function DappList() {
  const { atoms } = useTheme()
  const {
    data: dapps,
    isLoading,
    error,
    refetch
  } = useDappList()

  if (isLoading) {
    return <ActivityIndicator style={atoms.p_16} />
  }

  if (error) {
    return (
      <View style={[atoms.bg_error_light, atoms.p_16, atoms.m_16, atoms.rounded_8]}>
        <Text style={atoms.text_error}>Failed to load DApps</Text>
        <TouchableOpacity onPress={refetch} style={atoms.mt_8}>
          <Text style={atoms.text_primary_max}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <FlatList
      data={dapps}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <DappCard dapp={item} />
      )}
      contentContainerStyle={atoms.p_16}
    />
  )
}
```

### DappCard Component

```typescript
interface DappCardProps {
  dapp: DappInfo
  onConnect?: (dapp: DappInfo) => void
  onDisconnect?: (dapp: DappInfo) => void
}

export function DappCard({ dapp, onConnect, onDisconnect }: DappCardProps) {
  const { atoms } = useTheme()

  return (
    <View style={[
      atoms.bg_color_max,
      atoms.p_16,
      atoms.rounded_12,
      atoms.mb_12,
      atoms.shadow_sm
    ]}>
      {/* DApp Header */}
      <View style={[atoms.flex_row, atoms.items_center, atoms.mb_12]}>
        <Image
          source={{ uri: dapp.icon }}
          style={[atoms.w_12, atoms.h_12, atoms.rounded_8]}
        />
        <View style={atoms.ml_12}>
          <Text style={[atoms.text_primary_max, atoms.font_semibold]}>
            {dapp.name}
          </Text>
          <Text style={atoms.text_gray_medium}>{dapp.category}</Text>
        </View>
        
        {dapp.connected && (
          <View style={[
            atoms.bg_success_light,
            atoms.px_8,
            atoms.py_4,
            atoms.rounded_full,
            atoms.ml_auto
          ]}>
            <Text style={[atoms.text_success, atoms.font_small]}>
              Connected
            </Text>
          </View>
        )}
      </View>

      {/* DApp Description */}
      <Text style={[atoms.text_gray_max, atoms.mb_12]}>
        {dapp.description}
      </Text>

      {/* DApp Stats */}
      <View style={[atoms.flex_row, atoms.justify_between, atoms.mb_16]}>
        <View style={atoms.items_center}>
          <Text style={atoms.text_gray_medium}>Users</Text>
          <Text style={atoms.text_primary_max}>
            {dapp.stats?.users?.toLocaleString() || 'N/A'}
          </Text>
        </View>
        <View style={atoms.items_center}>
          <Text style={atoms.text_gray_medium}>TVL</Text>
          <Text style={atoms.text_primary_max}>
            {dapp.stats?.tvl || 'N/A'}
          </Text>
        </View>
        <View style={atoms.items_center}>
          <Text style={atoms.text_gray_medium}>Category</Text>
          <Text style={atoms.text_primary_max}>{dapp.category}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[atoms.flex_row, atoms.justify_end]}>
        <TouchableOpacity
          style={[atoms.btn_secondary, atoms.mr_8]}
          onPress={() => Linking.openURL(dapp.url)}
        >
          <Text style={atoms.text_secondary}>Visit</Text>
        </TouchableOpacity>
        
        {dapp.connected ? (
          <TouchableOpacity
            style={[atoms.btn_error]}
            onPress={() => onDisconnect?.(dapp)}
          >
            <Text style={atoms.text_button}>Disconnect</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[atoms.btn_primary]}
            onPress={() => onConnect?.(dapp)}
          >
            <Text style={atoms.text_button}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
```

### ConnectionStatus Component

```typescript
import { useContext } from 'react'
import { DappConnectorContext } from '@yoroi/dapp-connector'

export function ConnectionStatus() {
  const { atoms } = useTheme()
  const connector = useContext(DappConnectorContext)
  const [connections, setConnections] = useState([])

  useEffect(() => {
    if (!connector) return

    const loadConnections = async () => {
      const active = await connector.getActiveConnections()
      setConnections(active)
    }

    loadConnections()
    
    // Listen for connection changes
    const unsubscribe = connector.onConnectionChange(loadConnections)
    return unsubscribe
  }, [connector])

  if (!connections.length) {
    return (
      <View style={[atoms.p_16, atoms.items_center]}>
        <Text style={atoms.text_gray_medium}>
          No active DApp connections
        </Text>
      </View>
    )
  }

  return (
    <View style={atoms.p_16}>
      <Text style={[atoms.text_primary_max, atoms.font_semibold, atoms.mb_12]}>
        Active Connections ({connections.length})
      </Text>
      
      {connections.map((connection) => (
        <View
          key={connection.origin}
          style={[
            atoms.flex_row,
            atoms.items_center,
            atoms.justify_between,
            atoms.py_12,
            atoms.border_b_gray
          ]}
        >
          <View>
            <Text style={atoms.text_primary_max}>{connection.name}</Text>
            <Text style={atoms.text_gray_medium}>{connection.origin}</Text>
            <Text style={atoms.text_gray_min}>
              Connected {formatDate(connection.connectedAt)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[atoms.btn_error_outline]}
            onPress={() => connector.disconnect(connection.origin)}
          >
            <Text style={atoms.text_error}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}
```

---

## Common Components

### ErrorBoundary

```typescript
import { ErrorBoundary } from '@yoroi/common'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

// Custom fallback component
function ErrorFallback({ error }: { error: Error }) {
  const { atoms } = useTheme()
  
  return (
    <View style={[atoms.flex_center, atoms.p_16]}>
      <Text style={[atoms.text_error, atoms.font_semibold, atoms.mb_8]}>
        Something went wrong
      </Text>
      <Text style={[atoms.text_gray_medium, atoms.text_center]}>
        {error.message}
      </Text>
    </View>
  )
}

function App() {
  return (
    <ErrorBoundary
      fallback={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo)
        // Send to error reporting service
      }}
    >
      <YourApp />
    </ErrorBoundary>
  )
}
```

### SuspenseBoundary

```typescript
import { SuspenseBoundary } from '@yoroi/common'

// Loading component
function LoadingSpinner() {
  const { atoms } = useTheme()
  
  return (
    <View style={[atoms.flex_center, atoms.p_16]}>
      <ActivityIndicator size="large" />
      <Text style={[atoms.text_gray_medium, atoms.mt_8]}>
        Loading...
      </Text>
    </View>
  )
}

function App() {
  return (
    <SuspenseBoundary fallback={<LoadingSpinner />}>
      <LazyLoadedComponent />
    </SuspenseBoundary>
  )
}
```

---

## Staking Components

### CatalystProvider

```typescript
import { CatalystProvider } from '@yoroi/staking'

function App() {
  const catalystManager = useMemo(() => 
    new CatalystManager({
      network: Chain.Network.Mainnet,
      apiKey: 'catalyst-api-key'
    }), []
  )

  return (
    <CatalystProvider manager={catalystManager}>
      <GovernanceApp />
    </CatalystProvider>
  )
}
```

### VotingComponent

```typescript
import { useCatalyst } from '@yoroi/staking'

export function VotingComponent() {
  const { atoms } = useTheme()
  const {
    funds,
    proposals,
    vote,
    getVotingPower,
    isRegistered
  } = useCatalyst()

  const [selectedProposal, setSelectedProposal] = useState(null)
  const [votingPower, setVotingPower] = useState('0')

  useEffect(() => {
    async function loadVotingPower() {
      const power = await getVotingPower(walletId)
      setVotingPower(power)
    }
    loadVotingPower()
  }, [walletId])

  const handleVote = async (proposalId: string, choice: 'yes' | 'no') => {
    try {
      await vote({
        proposalId,
        choice,
        votingPower
      })
      // Show success message
    } catch (error) {
      // Show error message
    }
  }

  return (
    <View style={atoms.p_16}>
      <Text style={[atoms.text_primary_max, atoms.font_bold, atoms.mb_16]}>
        Catalyst Voting
      </Text>
      
      <View style={[atoms.bg_info_light, atoms.p_12, atoms.rounded_8, atoms.mb_16]}>
        <Text style={atoms.text_info}>
          Voting Power: {votingPower} ADA
        </Text>
      </View>

      <FlatList
        data={proposals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProposalCard
            proposal={item}
            onVote={(choice) => handleVote(item.id, choice)}
            votingPower={votingPower}
          />
        )}
      />
    </View>
  )
}
```

---

## Custom Hooks

### useMutationWithInvalidations

```typescript
import { useMutationWithInvalidations } from '@yoroi/common'

function useUpdateProfile() {
  return useMutationWithInvalidations({
    mutationFn: async (profileData) => {
      const response = await updateUserProfile(profileData)
      return response
    },
    invalidateQueries: ['user-profile', 'user-settings'],
    onSuccess: (data) => {
      console.log('Profile updated:', data)
    },
    onError: (error) => {
      console.error('Profile update failed:', error)
    }
  })
}

// Usage in component
function ProfileForm() {
  const updateProfile = useUpdateProfile()
  
  const handleSubmit = (formData) => {
    updateProfile.mutate(formData)
  }

  return (
    <View>
      <Button
        title="Update Profile"
        onPress={handleSubmit}
        disabled={updateProfile.isLoading}
      />
      {updateProfile.isLoading && <ActivityIndicator />}
    </View>
  )
}
```

### useObservableValue

```typescript
import { useObservableValue } from '@yoroi/common'

function BalanceDisplay({ walletManager }) {
  // Subscribe to observable balance updates
  const balance = useObservableValue(
    walletManager.balance$,
    '0' // initial value
  )

  return (
    <Text>Balance: {balance} ADA</Text>
  )
}
```

### useSyncStorageToState

```typescript
import { useSyncStorageToState } from '@yoroi/common'

function SettingsComponent() {
  const [darkMode, setDarkMode] = useSyncStorageToState(
    storage,
    'dark_mode',
    false // default value
  )

  return (
    <Switch
      value={darkMode}
      onValueChange={setDarkMode}
    />
  )
}
```

---

## Styling Guide

### Using Atoms

Atoms provide pre-defined styles for common UI patterns:

```typescript
import { useTheme } from '@yoroi/theme'

function StyledComponent() {
  const { atoms } = useTheme()

  return (
    <View style={[
      // Layout
      atoms.flex_1,
      atoms.flex_column,
      atoms.items_center,
      atoms.justify_center,
      
      // Spacing
      atoms.p_16,        // padding: 16
      atoms.m_8,         // margin: 8
      atoms.mt_16,       // marginTop: 16
      atoms.mb_12,       // marginBottom: 12
      
      // Colors
      atoms.bg_color_max,     // background color
      atoms.border_gray,      // border color
      
      // Typography
      atoms.text_primary_max, // text color
      atoms.font_semibold,    // font weight
      atoms.text_lg,          // font size
      
      // Border & Radius
      atoms.rounded_8,        // border radius
      atoms.border_1,         // border width
      
      // Shadow
      atoms.shadow_sm         // box shadow
    ]}>
      <Text style={atoms.text_primary_max}>
        Styled with atoms
      </Text>
    </View>
  )
}
```

### Using Design Tokens

```typescript
import { tokens } from '@yoroi/theme'

const styles = StyleSheet.create({
  container: {
    padding: tokens.space.md,
    borderRadius: tokens.radius.lg,
    ...tokens.shadows.md
  },
  title: {
    ...tokens.typography.heading2,
    marginBottom: tokens.space.sm
  },
  body: {
    ...tokens.typography.body,
    lineHeight: tokens.space.lg
  }
})
```

### Custom Theme Configuration

```typescript
import { ThemeConfig } from '@yoroi/theme'

const customTheme: ThemeConfig = {
  name: 'brand',
  palette: {
    // Primary colors
    primary: '#1a73e8',
    primaryLight: '#4285f4',
    primaryDark: '#1557b0',
    
    // Secondary colors
    secondary: '#34a853',
    secondaryLight: '#5bb974',
    secondaryDark: '#2d8f3f',
    
    // Background colors
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceVariant: '#e8eaed',
    
    // Text colors
    onBackground: '#202124',
    onSurface: '#5f6368',
    onPrimary: '#ffffff',
    
    // Status colors
    error: '#ea4335',
    warning: '#fbbc04',
    success: '#34a853',
    info: '#4285f4',
    
    // Border colors
    border: '#dadce0',
    borderLight: '#f1f3f4',
    
    // Additional brand colors
    accent: '#9c27b0',
    highlight: '#ff6d00'
  },
  
  // Custom typography
  typography: {
    fontFamily: 'CustomFont-Regular',
    fontFamilyBold: 'CustomFont-Bold',
    
    heading1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
      fontFamily: 'CustomFont-Bold'
    },
    
    // ... more typography definitions
  },
  
  // Custom spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  // Custom shadows
  shadows: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2
    },
    // ... more shadow definitions
  }
}
```

---

## Performance Optimization

### Memoization with React.memo

```typescript
import React from 'react'

const TokenCard = React.memo(function TokenCard({ 
  token, 
  onPress 
}: {
  token: TokenInfo
  onPress: (tokenId: string) => void
}) {
  const { atoms } = useTheme()
  
  return (
    <TouchableOpacity
      style={[atoms.bg_color_max, atoms.p_16, atoms.rounded_8]}
      onPress={() => onPress(token.id)}
    >
      <Text style={atoms.text_primary_max}>{token.name}</Text>
      <Text style={atoms.text_gray_medium}>{token.symbol}</Text>
    </TouchableOpacity>
  )
})
```

### Efficient List Rendering

```typescript
function TokenList({ tokens }: { tokens: TokenInfo[] }) {
  const renderToken = useCallback(({ item }: { item: TokenInfo }) => (
    <TokenCard
      key={item.id}
      token={item}
      onPress={handleTokenPress}
    />
  ), [handleTokenPress])

  const keyExtractor = useCallback((item: TokenInfo) => item.id, [])

  return (
    <FlatList
      data={tokens}
      renderItem={renderToken}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: 80,
        offset: 80 * index,
        index
      })}
    />
  )
}
```

---

## Testing Components

### Component Testing with React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native'
import { ThemeProvider } from '@yoroi/theme'
import { TokenInfo } from './TokenInfo'

// Test wrapper
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

describe('TokenInfo Component', () => {
  const mockToken = {
    id: 'test-token',
    name: 'Test Token',
    symbol: 'TEST',
    decimals: 6,
    type: 'ft'
  }

  it('renders token information correctly', () => {
    render(
      <TokenInfo tokenId="test-token" />,
      { wrapper: TestWrapper }
    )

    expect(screen.getByText('Test Token')).toBeTruthy()
    expect(screen.getByText('TEST • ft')).toBeTruthy()
  })

  it('shows loading state', () => {
    render(
      <TokenInfo tokenId="loading-token" />,
      { wrapper: TestWrapper }
    )

    expect(screen.getByText('Loading token info...')).toBeTruthy()
  })

  it('handles retry on error', () => {
    const { rerender } = render(
      <TokenInfo tokenId="error-token" />,
      { wrapper: TestWrapper }
    )

    // Verify error state
    expect(screen.getByText('Failed to load token information')).toBeTruthy()

    // Trigger retry
    fireEvent.press(screen.getByText('Retry'))
    
    // Component should attempt to refetch
  })
})
```

### Mock Providers for Testing

```typescript
// test-utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@yoroi/theme'
import { DappConnectorProvider } from '@yoroi/dapp-connector'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
}

export function TestProviders({ 
  children, 
  queryClient = createTestQueryClient() 
}: {
  children: React.ReactNode
  queryClient?: QueryClient
}) {
  const mockConnector = {
    // Mock connector implementation
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DappConnectorProvider connector={mockConnector}>
          {children}
        </DappConnectorProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Custom render function
export function renderWithProviders(
  ui: React.ReactElement,
  options?: any
) {
  return render(ui, {
    wrapper: TestProviders,
    ...options
  })
}
```

This comprehensive components guide covers all the React components, hooks, and UI patterns provided by the Yoroi SDK. Use these examples as building blocks for creating consistent, well-designed wallet applications.