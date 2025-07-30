import { GenerateSW } from '@aaroon/workbox-rspack-plugin'
import {
  defineConfig,
  loadEnv,
  type RsbuildConfig,
  type SriAlgorithm
} from '@rsbuild/core'
import { pluginAssetsRetry } from '@rsbuild/plugin-assets-retry'
import { pluginBasicSsl } from '@rsbuild/plugin-basic-ssl'
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSass } from '@rsbuild/plugin-sass'
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { pluginEjs } from 'rsbuild-plugin-ejs'
import { pluginHtmlMinifierTerser } from 'rsbuild-plugin-html-minifier-terser'

import cspConfig from './csp.config'
import manifestConfig from './manifest.config'
import obfuscatorConfig from './obfuscator.config'
import { pluginFavicon } from './rsBuildPlugins/Favicon'
import WebpackObfuscatorPlugin from './rsBuildPlugins/pluginCodeObfuscator/WebpackObfuscatorPlugin'
import { pluginContentSecurityPolicy } from './rsBuildPlugins/pluginContentSecurityPolicy'
import { pluginCreateAssetIntegrity } from './rsBuildPlugins/pluginCreateAssetIntegrity'
import { pluginRenameAssetsAndReferences } from './rsBuildPlugins/pluginRenameAssetsAndReferences'

export default defineConfig(({ envMode, env }) => {
  const isProdBuild = env === 'production'
  const pwaEnabled = process.env.APP_PWA_ENABLE === 'true'
  const codeInspectorEnabled = process.env.APP_DEV_INSPECTION_ENABLED === 'true'
  const isProduction = envMode === 'production'

  const { publicVars, parsed, filePaths } = loadEnv({
    prefixes: ['APP_', 'AS_', 'npm_package_'],
    mode: envMode || process.env.NODE_ENV || 'development'
  })

  // Handle env-mode based code in the application
  parsed.APP_ENV_IS_PRODUCTION = `${isProduction}`
  publicVars.APP_ENV_IS_PRODUCTION = `${isProduction}`

  if (!filePaths.length) {
    console.warn(`
===========================================================
⚠️  Environment Configuration Warning
===========================================================

No environment configuration files were found matching the following names:
  1. .env
  2. .env.local
  3. .env.${envMode}
  4. .env.${envMode}.local (Preferred)

Please ensure you are running the script with the correct --env-mode.
Please Node: if you are running script for the first time, you may need to create a .env.production.local file from env.development file.
===========================================================
`)
    process.exit(1)
  }

  const rsBuildPlugins: RsbuildConfig['plugins'] = [
    pluginReact(),
    pluginNodePolyfill(),
    pluginEjs(),
    pluginSass()
  ]

  if (isProdBuild) {
    rsBuildPlugins.push(
      pluginAssetsRetry({
        inlineScript: false
      }),
      pluginHtmlMinifierTerser(),
      pluginFavicon('./public/favicon.svg', manifestConfig),
      pluginRenameAssetsAndReferences(),
      pluginCreateAssetIntegrity(),
      pluginContentSecurityPolicy({
        config: cspConfig
      })
    )
  }

  if (process.env.HTTPS === 'true') {
    rsBuildPlugins.push(pluginBasicSsl())
  }

  const config: RsbuildConfig = {
    dev: {
      lazyCompilation: true,
      progressBar: true
    },
    server: {
      headers: isProdBuild
        ? {
            'cache-control': 'max-age=31536000, s-maxage=31536000'
          }
        : {},
      publicDir: {
        copyOnBuild: false
      }
    },
    source: {
      define: publicVars,
      entry: {
        index: {
          import: './src/index.tsx',
          runtime: 'index.runtime'
        }
      }
    },
    output: {
      cleanDistPath: isProdBuild,
      distPath: {
        root: 'build'
      },
      legalComments: 'none',
      polyfill: isProdBuild ? 'usage' : 'off',
      sourceMap: {
        js: !isProdBuild
          ? // Use a more performant source map format for development
            'cheap-module-source-map'
          : isProduction
            ? // Generate hidden source map in production
              'hidden-source-map'
            : // Use a high quality source map format for other environments
              'source-map',
        css: false
      },
      copy: [
        {
          from: './public',
          to: './',
          globOptions: {
            ignore: ['**/favicon.svg', '**/index.ejs']
          }
        }
      ]
    },

    plugins: rsBuildPlugins,
    html: {
      template: './public/index.ejs',
      templateParameters: {
        ...parsed,
        PRE_CONNECT: process.env.PRE_CONNECT || '',
        DNS_PREFETCH: process.env.DNS_PREFETCH || '',
        APP_DYNATRACE_LINK: process.env.APP_DYNATRACE_LINK || ''
      },
      title: manifestConfig.appShortName || manifestConfig.appName,
      meta: {
        description: manifestConfig.appDescription || '',
        'og:title': manifestConfig.appShortName || manifestConfig.appName || '',
        'og:description': manifestConfig.appDescription || '',
        'og:type': 'website',
        'og:url': parsed.APP_URL,
        'og:image': `${parsed.APP_URL}/favicon.svg`,
        'twitter:card': 'summary',
        'twitter:title':
          manifestConfig.appShortName || manifestConfig.appName || '',
        'twitter:description': manifestConfig.appDescription || '',
        'twitter:url': parsed.APP_URL,
        'twitter:image': `${parsed.APP_URL}/favicon.svg`
      },
      tags: [
        tags => {
          for (const tag of tags) {
            if (tag.attrs?.rel === 'stylesheet') {
              tag.attrs.media = 'print'
            }
          }
        }
      ],
      inject: false
    },
    performance: {
      removeConsole: isProduction, // Remove console based on the env mode
      removeMomentLocale: isProdBuild,
      preload:
        (process.env.PRELOAD && {
          type: 'all-assets',
          include: process.env.PRELOAD?.split(',').map(fileName => {
            const [name, ext] = fileName.split('.')
            // eslint-disable-next-line
            return new RegExp(`^.*?\/${name}.*.${ext}$`)
          })
        }) ||
        undefined
    },
    tools: {
      rspack(_config, { appendPlugins }) {
        _config.output = _config.output || {}
        _config.output.sourceMapFilename = isProduction
          ? '../source-maps/[file].map' // Generate hidden source map in the root directory of the project in production
          : '[file].map' // Generates in the same directory for other envs
        // Only register the plugin when RSDOCTOR is true, as the plugin will increase the build time.
        if (isProdBuild && process.env.RSDOCTOR) {
          appendPlugins(
            new RsdoctorRspackPlugin({
              supports: {
                generateTileGraph: true
              }
            })
          )
        }

        // TODO: Optional
        if (isProdBuild && pwaEnabled) {
          appendPlugins(
            new GenerateSW({
              swDest: './sw.js',
              cleanupOutdatedCaches: true,
              inlineWorkboxRuntime: true,
              exclude: [/\.html$/, /\.map$/, /^manifest.*\.js$/]
            })
          )
        }

        if (!isProdBuild && codeInspectorEnabled) {
          appendPlugins(codeInspectorPlugin({ bundler: 'rspack' }))
        }

        if (isProdBuild) {
          appendPlugins(new WebpackObfuscatorPlugin(obfuscatorConfig, []))
        }
      }
    },
    security: {
      sri: {
        enable: 'auto',
        algorithm: 'sha256' as SriAlgorithm
      }
    }
  }

  return config
})
