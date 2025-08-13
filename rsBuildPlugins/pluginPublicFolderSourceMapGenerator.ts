import fs from 'node:fs'
import path from 'node:path'
import type { RsbuildEntry, RsbuildPluginAPI } from '@rsbuild/core'
import type { StatsAsset } from '@rspack/core'
import type { CheerioAPI } from 'cheerio'
import * as cheerio from 'cheerio'
const HASHED_JS_REGEX = /\.(?:[a-z0-9]{8})\.js$/i

export const pluginPublicFolderSourceMapGenerator = () => ({
  name: 'plugin-public-folder-source-map-generator',
  setup(api: RsbuildPluginAPI) {
    const apiConfig = api.getRsbuildConfig()
    const htmlConfig = apiConfig.html || {}
    const template = htmlConfig.template
    // TODO: template type function not handled for now
    if (typeof template !== 'string') {
      return
    }

    let html = ''
    try {
      const indexPath = path.resolve(api.context.rootPath, template)
      html = fs.readFileSync(indexPath, 'utf8')
    } catch {
      html = template
    }

    let entryMap: RsbuildEntry = {}

    // Load into Cheerio
    const $ = cheerio.load(html)

    //Parse and collect static <script src="/static/*.js"> entries
    const staticJsDir = path.resolve(api.context.rootPath, 'public')
    /**
     * Read all custom script from index.ejs file and add in source entry
     */
    $('script').each((_, el) => {
      const src = $(el).attr('src')
      if (src && src.startsWith('/static') && !HASHED_JS_REGEX.test(src)) {
        const fileName = path.basename(src, '.js') // e.g., "main.js"
        const absolutePath = path.resolve(staticJsDir, `.${src}`) // e.g., "/static/js"
        entryMap[fileName] = { import: absolutePath, html: false }
      }
    })

    api.modifyRsbuildConfig(async config => {
      config.source = {
        ...config.source,
        entry: {
          ...(typeof config.source?.entry === 'object' &&
          !Array.isArray(config.source.entry)
            ? config.source.entry
            : {}),
          ...entryMap
        }
      }
      return config
    })

    // Rewrite <script> tags with hashed names + integrity
    api.modifyHTML((html, { compilation }) => {
      /**
       * Load all assets and filter only file end with .js and file name that added in entry from index.ejs
       */
      const statAssetsJson = compilation.getStats().toJson()
        .assets as StatsAsset[]
      const entryNames = Object.keys(entryMap)

      const filteredEjsEntryJSFile: StatsAsset[] = statAssetsJson.filter(
        asset =>
          asset.name.endsWith('.js') &&
          entryNames.some(name => asset.chunkNames?.includes(name))
      )

      const $: CheerioAPI = cheerio.load(html)
      // Example: Get all script tags
      $('script').each((_, el) => {
        const src = $(el).attr('src')
        if (!src) return
        const basename: string = path.basename(src, '.js') // without ".js"
        if (src && src.endsWith('.js') && !HASHED_JS_REGEX.test(src)) {
          const asset = filteredEjsEntryJSFile.find(asset =>
            asset.chunkNames?.includes(basename)
          )
          if (asset?.name) {
            $(el).attr('src', `/${asset?.name}`)
          }
          if (asset?.integrity) {
            $(el).attr('integrity', asset.integrity)
          }
        }
      })
      return $.html()
    })
  }
})
