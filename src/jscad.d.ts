declare module '@jscad/modeling' {
  export const primitives: any
  export const booleans: any
  export const transforms: any
  export const geometries: any
  export const text: any
  export const extrusions: any
  export const expansions: any
  export const hulls: any
  export const measurements: any
  export const modifiers: any
}

declare module '@jscad/stl-serializer' {
  export function serialize(
    options: { binary: boolean },
    ...geometries: any[]
  ): (string | ArrayBuffer)[]
  export const mimeType: string
}
