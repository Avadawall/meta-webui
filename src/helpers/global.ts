import { createSignal } from 'solid-js'

export const transformEndpointURL = (url: string) =>
  /^https?/.test(url) ? url : `${window.location.protocol}//${url}`

export const useStringBooleanMap = () => {
  const [map, setMap] = createSignal<Record<string, boolean>>({})
  const set = (name: string, value: boolean) => {
    setMap({
      ...map(),
      [name]: value,
    })
  }

  const setWithCallback = async (
    name: string,
    callback: () => Promise<void>,
  ) => {
    set(name, true)
    try {
      await callback()
    } catch {}
    set(name, false)
  }

  return {
    map,
    set,
    setWithCallback,
  }
}

export const decodeUtf8ase64 = (base64: string) => {
  let binaryString = atob(base64)
  let bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  let decoder = new TextDecoder('utf-8')
  let decodedString = decoder.decode(bytes)
  return decodedString
}
