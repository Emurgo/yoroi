import {SwapManagerSettings} from './manager'

export type SwapStorage = {
  settings: {
    read(): Promise<SwapManagerSettings>
    remove(): Promise<void>
    save(routing: SwapManagerSettings): Promise<void>
    key: string
  }

  clear(): Promise<void>
}
