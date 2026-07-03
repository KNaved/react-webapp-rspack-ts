import { Compilation, sources } from '@rspack/core'
import type { Compiler } from 'image-minimizer-webpack-plugin'
import type { ObfuscatorOptions } from 'javascript-obfuscator'
import JavaScriptObfuscator from 'javascript-obfuscator'
import { transfer } from 'multi-stage-sourcemap'
import multimatch from 'multimatch'
import type { RawSourceMap } from 'source-map'
// TODO: Need to remove and import these from RsPack Core

export type WebpackObfuscatorOptions = Omit<
  ObfuscatorOptions,
  | 'inputFileName'
  | 'sourceMapBaseUrl'
  | 'sourceMapFileName'
  | 'sourceMapMode'
  | 'sourceMapSourcesMode'
>

/**
 * JavaScript Obfuscator plugin
 */
export default class WebpackObfuscatorPlugin {
  /**
   * @type {string[]}
   */
  private static allowedExtensions: string[] = ['.js', '.mjs']

  /**
   * @type {string}
   */
  private static readonly baseIdentifiersPrefix: string = 'a'

  public excludes: string[] = []

  constructor(
    public options: WebpackObfuscatorOptions = {},
    excludes?: string | string[]
  ) {
    this.excludes = this.excludes.concat(excludes || [])
  }

  public apply(compiler: Compiler): void {
    const isDevServer = process.argv.find(v => v.includes('webpack-dev-server'))

    if (isDevServer) {
      console.info(
        'JavascriptObfuscator is disabled on webpack-dev-server as the reloading scripts ',
        'and the obfuscator can interfere with each other and break the build'
      )
      return
    }

    const pluginName = this.constructor.name

    compiler.hooks.compilation.tap(pluginName, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'WebpackObfuscator',
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COUNT
        },
        assets => {
          let identifiersPrefixCounter: number = 0
          const sourcemapOutput: { [index: string]: string } = {}

          compilation.chunks.forEach(chunk => {
            chunk.files.forEach((fileName: string) => {
              if (
                this.options.sourceMap &&
                fileName.toLowerCase().endsWith('.map')
              ) {
                let srcName = fileName
                  .toLowerCase()
                  .substr(0, fileName.length - 4)

                if (!this.shouldExclude(srcName)) {
                  const transferredSourceMap = transfer({
                    fromSourceMap: sourcemapOutput[srcName],
                    // @ts-ignore Wrong types
                    toSourceMap: compilation.assets[fileName].source()
                  })
                  const finalSourcemap = JSON.parse(transferredSourceMap)

                  finalSourcemap['sourcesContent'] = JSON.parse(
                    assets[fileName].source().toString()
                  )['sourcesContent']
                  assets[fileName] = new sources.RawSource(
                    JSON.stringify(finalSourcemap),
                    false
                  )
                }

                return
              }

              const isValidExtension =
                WebpackObfuscatorPlugin.allowedExtensions.some(
                  (extension: string) =>
                    fileName.toLowerCase().endsWith(extension)
                )

              if (!isValidExtension || this.shouldExclude(fileName)) {
                return
              }

              const asset = compilation.assets[fileName]
              const { inputSource, inputSourceMap } =
                this.extractSourceAndSourceMap(asset)
              const { obfuscatedSource, obfuscationSourceMap } = this.obfuscate(
                inputSource,
                fileName,
                identifiersPrefixCounter
              )

              if (this.options.sourceMap && inputSourceMap) {
                sourcemapOutput[fileName] = obfuscationSourceMap

                const transferredSourceMap = transfer({
                  fromSourceMap: obfuscationSourceMap,
                  // @ts-ignore Wrong types
                  toSourceMap: inputSourceMap
                })
                const finalSourcemap = JSON.parse(transferredSourceMap)
                finalSourcemap['sourcesContent'] =
                  inputSourceMap['sourcesContent']

                // @ts-ignore Wrong types
                assets[fileName] = new sources.SourceMapSource(
                  obfuscatedSource,
                  fileName,
                  finalSourcemap
                )
              } else {
                assets[fileName] = new sources.RawSource(
                  obfuscatedSource,
                  false
                )
              }

              identifiersPrefixCounter++
            })
          })
        }
      )
    })
  }

  private shouldExclude(filePath: string): boolean {
    return multimatch(filePath, this.excludes).length > 0
  }

  private extractSourceAndSourceMap(asset: any): {
    inputSource: string
    inputSourceMap: RawSourceMap
  } {
    if (asset.sourceAndMap) {
      const { source, map } = asset.sourceAndMap()
      return { inputSource: source, inputSourceMap: map }
    }
    return {
      inputSource: asset.source(),
      inputSourceMap: asset.map()
    }
  }

  private obfuscate(
    javascript: string,
    fileName: string,
    identifiersPrefixCounter: number
  ): { obfuscatedSource: string; obfuscationSourceMap: string } {
    const obfuscationResult = JavaScriptObfuscator.obfuscate(javascript, {
      identifiersPrefix: `${WebpackObfuscatorPlugin.baseIdentifiersPrefix}${identifiersPrefixCounter}`,
      inputFileName: fileName,
      sourceMapMode: 'separate',
      sourceMapFileName: fileName + '.map',
      ...this.options
    })

    return {
      obfuscatedSource: obfuscationResult.getObfuscatedCode(),
      obfuscationSourceMap: obfuscationResult.getSourceMap()
    }
  }
}
