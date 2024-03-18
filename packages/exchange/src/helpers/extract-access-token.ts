export const extractAccessTokenFromBaseUrl = (
  baseUrl: string,
): {access_token: string | null} => {
  const url = new URL(baseUrl)
  const params = new URLSearchParams(url.search)

  return {access_token: params.get('access_token')}
}
