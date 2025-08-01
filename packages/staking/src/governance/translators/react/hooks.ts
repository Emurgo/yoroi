import * as React from 'react'
import {useGovernance} from './context'
import {GovernanceAction, VoteKind} from '../../manager'
import {CardanoTypes} from '../../../types'
import {StakingKeyState} from '../../types'

interface AsyncState<T> {
  data?: T
  error?: Error
  isLoading: boolean
}

interface MutationState<T> {
  data?: T
  error?: Error
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

export const useIsValidDRepID = (id: string) => {
  const {manager} = useGovernance()
  const [state, setState] = React.useState<
    AsyncState<void> & {isSuccess: boolean}
  >({
    isLoading: false,
    isSuccess: false,
  })

  const validate = React.useCallback(async (): Promise<void> => {
    setState({isLoading: true, isSuccess: false})
    try {
      await manager.validateDRepID(id)
      setState({data: undefined, isLoading: false, isSuccess: true})
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState({error: err, isLoading: false, isSuccess: false})
      throw err
    }
  }, [manager, id])

  // Auto-execute on mount/id change
  React.useEffect(() => {
    if (id) {
      validate().catch(() => {}) // Errors are handled in state
    }
  }, [validate, id])

  return {
    ...state,
    validate,
  }
}

export const useStakingKeyState = () => {
  const {manager} = useGovernance()
  const [state, setState] = React.useState<AsyncState<StakingKeyState>>({
    isLoading: false,
  })

  const getState = React.useCallback(
    async (stakingKeyHash: string): Promise<StakingKeyState> => {
      if (stakingKeyHash.length === 0) {
        throw new Error('Staking key hash cannot be empty')
      }

      setState({isLoading: true})
      try {
        const result = await manager.getStakingKeyState(stakingKeyHash)
        setState({data: result, isLoading: false})
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({error: err, isLoading: false})
        throw err
      }
    },
    [manager],
  )

  return {
    ...state,
    getState,
  }
}

export const useLatestGovernanceAction = (walletId: string) => {
  const {manager} = useGovernance()
  const [state, setState] = React.useState<
    AsyncState<GovernanceAction | null> & {isSuccess: boolean}
  >({
    isLoading: false,
    isSuccess: false,
  })

  const getLatest =
    React.useCallback(async (): Promise<GovernanceAction | null> => {
      setState({isLoading: true, isSuccess: false})
      try {
        const result = await manager.getLatestGovernanceAction()
        setState({data: result, isLoading: false, isSuccess: true})
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({error: err, isLoading: false, isSuccess: false})
        throw err
      }
    }, [manager])

  // Auto-execute on mount/walletId change
  React.useEffect(() => {
    if (walletId) {
      getLatest().catch(() => {}) // Errors are handled in state
    }
  }, [getLatest, walletId])

  return {
    ...state,
    getLatest,
  }
}

export const useUpdateLatestGovernanceAction = () => {
  const {manager} = useGovernance()
  const [state, setState] = React.useState<MutationState<void>>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const mutate = React.useCallback(
    async (action: GovernanceAction): Promise<void> => {
      setState({isLoading: true, isSuccess: false, isError: false})
      try {
        await manager.setLatestGovernanceAction(action)
        setState({
          data: undefined,
          isLoading: false,
          isSuccess: true,
          isError: false,
        })
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({
          error: err,
          isLoading: false,
          isSuccess: false,
          isError: true,
        })
        throw err
      }
    },
    [manager],
  )

  const updateLatestGovernanceAction = mutate

  return {
    ...state,
    mutate,
    updateLatestGovernanceAction,
  }
}

export const useDelegationCertificate = () => {
  const {manager} = useGovernance()
  const [state, setState] = React.useState<
    MutationState<CardanoTypes.Certificate>
  >({
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const createCertificate = React.useCallback(
    async (variables: {
      hash: string
      type: 'script' | 'key'
      stakingKey: CardanoTypes.PublicKey
    }): Promise<CardanoTypes.Certificate> => {
      setState({isLoading: true, isSuccess: false, isError: false})
      try {
        const result = await manager.createDelegationCertificate(
          variables.hash,
          variables.type,
          variables.stakingKey,
        )
        setState({
          data: result,
          isLoading: false,
          isSuccess: true,
          isError: false,
        })
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({
          error: err,
          isLoading: false,
          isSuccess: false,
          isError: true,
        })
        throw err
      }
    },
    [manager],
  )

  return {
    ...state,
    createCertificate,
  }
}

export const useVotingCertificate = () => {
  const {manager} = useGovernance()
  const [state, setState] = React.useState<
    MutationState<CardanoTypes.Certificate>
  >({
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const createCertificate = React.useCallback(
    async (variables: {
      vote: VoteKind
      stakingKey: CardanoTypes.PublicKey
    }): Promise<CardanoTypes.Certificate> => {
      setState({isLoading: true, isSuccess: false, isError: false})
      try {
        const result = await manager.createVotingCertificate(
          variables.vote,
          variables.stakingKey,
        )
        setState({
          data: result,
          isLoading: false,
          isSuccess: true,
          isError: false,
        })
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({
          error: err,
          isLoading: false,
          isSuccess: false,
          isError: true,
        })
        throw err
      }
    },
    [manager],
  )

  return {
    ...state,
    createCertificate,
  }
}

export const useBech32DRepID = () => {
  const {manager} = useGovernance()
  const [state, setState] = React.useState<AsyncState<string>>({
    isLoading: false,
  })

  const convert = React.useCallback(
    async (hexId: string): Promise<string> => {
      setState({isLoading: true})
      try {
        const result = await manager.convertHexKeyHashToBech32Format(hexId)
        setState({data: result, isLoading: false})
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({error: err, isLoading: false})
        throw err
      }
    },
    [manager],
  )

  return {
    ...state,
    convert,
  }
}
