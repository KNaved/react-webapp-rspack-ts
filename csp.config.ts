import type {
  TCspSource,
  TPluginContentSecurityPolicyConfig
} from './rsBuildPlugins/pluginContentSecurityPolicy/contentSecurityPolicy.Type'

const cspConfig: TPluginContentSecurityPolicyConfig = {
  userDefinedCsp: {
    'default-src': process.env.DEFAULT_SRC?.split(',') as TCspSource[],
    'script-src': process.env.SCRIPT_SRC?.split(',') as TCspSource[],
    'style-src': process.env.STYLE_SRC?.split(',') as TCspSource[],
    'img-src': process.env.IMG_SRC?.split(',') as TCspSource[],
    'connect-src': process.env.CONNECT_SRC?.split(',') as TCspSource[],
    'font-src': process.env.FONT_SRC?.split(',') as TCspSource[],
    'object-src': process.env.OBJECT_SRC?.split(',') as TCspSource[],
    'media-src': process.env.MEDIA_SRC?.split(',') as TCspSource[],
    'frame-src': process.env.FRAME_SRC?.split(',') as TCspSource[],
    'frame-ancestors': process.env.FRAME_ANCESTORS?.split(',') as TCspSource[],
    'form-action': process.env.FORM_ACTION?.split(',') as TCspSource[],
    'base-uri': process.env.BASE_URI?.split(',') as TCspSource[],
    'report-uri': process.env.REPORT_URI?.split(',') as TCspSource[], // Report-uri typically takes a URL
    'report-to': process.env.REPORT_TO?.split(',') as TCspSource[]
  },
  scriptDirective: {
    // true by default
    // If we require unsafe-inline and unsafe-eval then make it false
    hashEnabled: true
  },
  styleDirective: {
    // false by default
    hashEnabled: false
  }
}

export default cspConfig
