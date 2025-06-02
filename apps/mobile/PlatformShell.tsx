import {RouterContainer} from './src/kernel/navigation/Router'

export function PlatformShell({children}: React.PropsWithChildren) {
  return <RouterContainer>{children}</RouterContainer>
}
