import type { TPluginContentSecurityPolicyConfig } from './rsBuildPlugins/pluginContentSecurityPolicy/contentSecurityPolicy.Type'

const cspConfig: TPluginContentSecurityPolicyConfig = {
  userDefinedCsp: {
    'style-src': [
      `'unsafe-inline'`,
      'https://cdn.jsdelivr.net',
      'https://subzero.axisbank.com'
    ],
    'font-src': ['https://cdn.jsdelivr.net', 'https://subzero.axisbank.com'],
    'media-src': ['https://youtube.com']
  }
}

export default cspConfig
