import WebHttp, {
  WEB_HTTP_CONTEXT,
  type WebHttpAxiosConfig,
  type WebHttpConfig
} from '@am92/web-http'

import {
  AS_API_DOMAIN,
  AS_API_KEY,
  AS_API_TIMEOUT,
  AS_ENABLE_CRYPTOGRAPHY
} from '../env'
import { responseErrorInterceptor } from './Interceptor'

const AS_AXIOS_HTTP_CONFIG: WebHttpAxiosConfig = {
  baseURL: AS_API_DOMAIN,
  timeout: AS_API_TIMEOUT,
  /* To allow absolute URLs, set the following option to true in request parameters for that request
  * Example:
  * const OAUTH_BASE_URL = 'https://oauth.example.com'
    const accessTokenOption = {
      url: `${OAUTH_BASE_URL}/auth/handshake`,
      method: 'POST',
      webHttpConfig: {
        disableCrypto: true
      },
      allowAbsoluteUrls: true
    }
  */
  allowAbsoluteUrls: false
}

const AS_WEB_HTTP_CONFIG: WebHttpConfig = {
  disableCrypto: !AS_ENABLE_CRYPTOGRAPHY,
  disableHeaderInjection: false
}
export const asHttp = new WebHttp(AS_AXIOS_HTTP_CONFIG, AS_WEB_HTTP_CONFIG)
asHttp.context.set(WEB_HTTP_CONTEXT.API_KEY, AS_API_KEY)

// Rate Limiter Interceptor
asHttp.interceptors.response.use(response => response, responseErrorInterceptor)

// const AXIOS_HTTP_CONFIG: WebHttpAxiosConfig = { timeout: 30000 }
// const WEB_HTTP_CONFIG: WebHttpConfig = {
//   disableCrypto: true,
//   disableHeaderInjection: true
// }
// export const webHttp = new WebHttp(AXIOS_HTTP_CONFIG, WEB_HTTP_CONFIG)

export const HANDSHAKE_ENABLED_HTTP: WebHttp[] = []
