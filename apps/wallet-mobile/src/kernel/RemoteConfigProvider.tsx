import remoteConfig from '@react-native-firebase/remote-config'
import * as React from 'react'
import {z} from 'zod'

const config = remoteConfig()

type RemoteConfigContext = {
  [K in keyof typeof defaultConfig]: (typeof defaultConfig)[K]
}

const defaultConfig = {
  isSwapEnabled: false,
}

const RemoteConfigContext = React.createContext<RemoteConfigContext>(defaultConfig)

export const useRemoteConfig = () => React.useContext(RemoteConfigContext)

export const RemoteConfigProvider = ({children}: {children: React.ReactNode}) => {
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    const init = async () => {
      await config.setDefaults(defaultConfig)
      await config.fetch(300)
      const active = await config.fetchAndActivate()
      setLoaded(active)
    }
    init()
  }, [])

  return (
    <RemoteConfigContext.Provider value={!loaded ? defaultConfig : safeRemoteConfig()}>
      {children}
    </RemoteConfigContext.Provider>
  )
}

const safeRemoteConfig = () => {
  const value = config.getAll()
  const parsed = RemoteConfigSchema.safeParse(value)
  if (parsed.success) return parsed.data
  return defaultConfig
}

const RemoteConfigSchema = z.object({
  isSwapEnabled: z.boolean(),
})

type RemoteConfigSchemaType = z.infer<typeof RemoteConfigSchema>

// Makes sure the validation schema and defaultConfig types are equal
type EqualityGuard<A, B> = Exclude<A, B> | Exclude<B, A>
const assert = <T extends never>() => null as T
assert<EqualityGuard<RemoteConfigSchemaType, RemoteConfigContext>>()
