import {ClaimApi, ClaimToken} from './types'

const claimTokensResponse: {[key: string]: ClaimToken} = {
  accepted: {
    status: 'accepted',
    amounts: {
      '.': '2000000',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '44',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '410',
      '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52': '5',
      '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44': '2463889379',
      '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0': '148',
      '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53': '100008',
      '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c54': '10000000012',
      '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c55': '100000000000000020',
    },
  },
  processing: {
    status: 'processing',
    amounts: {
      '.': '2000000',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '44',
    },
  },
  done: {
    status: 'done',
    amounts: {
      '.': '2000000',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '44',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '410',
      '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52': '5',
      '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44': '2463889379',
      '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0': '148',
      '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53': '100008',
      '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c54': '10000000012',
      '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c55': '100000000000000020',
    },
    txHash: '3a27ac29f4218a4503ed241a19e59291835b38ccdb1f1f71ae4dc889d7dbfeb4',
  },
} as const

export const claimApiMockResponses = {
  claimTokens: claimTokensResponse,
} as const

const claimTokensApi = {
  success: {
    accepted: () => {
      return Promise.resolve(claimTokensResponse.accepted)
    },
    processing: () => {
      return Promise.resolve(claimTokensResponse.processing)
    },
    done: () => {
      return Promise.resolve(claimTokensResponse.done)
    },
  },
  error: () => {
    return Promise.reject(new Error('Something went wrong'))
  },
  loading: () => {
    return new Promise(() => null) as unknown as ClaimToken
  },
} as const

export const claimApiMockFetchers = {
  claimTokens: claimTokensApi,
} as const

const claimApiError: ClaimApi = {
  claimTokens: claimTokensApi.error,
  address: 'address',
  primaryTokenId: '.',
} as const

export const claimApiMockInstances = {
  error: claimApiError,
} as const
