declare module '*.svg' {
  const content: string
  export default content
}
declare module '*.svg?react' {
  import type * as React from 'react'

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export default ReactComponent
}

declare module '*.svg' {
  import type * as React from 'react'

  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >

  export default ReactComponent
}

interface Window {
  supportedBrowsers: RegExp
  __nonce__: string
}

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.scss' {
  const content: string
  export default content
}
