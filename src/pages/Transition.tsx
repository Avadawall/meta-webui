import { Show, createEffect, onMount } from 'solid-js'
import { fetchModeBackendVersionAPI } from '~/apis'
import { APP_MODE } from '~/constants'
import {
  WsMsg,
  appMode,
  endpoint,
  setAppMode,
  setLatestConnectionMsg,
  useWsRequest,
} from '~/signals'
import Inputs from './Inputs'
import Overview from './Overview'

const ProtectedResources = () => {
  const latestConnectionMsg = useWsRequest<WsMsg>('connections')

  createEffect(() => setLatestConnectionMsg(latestConnectionMsg()))

  return null
}

export default () => {
  onMount(async () => {
    let mode = await fetchModeBackendVersionAPI()

    if (mode == undefined) {
      mode = APP_MODE.AddNew
    }

    setAppMode(mode)
  })

  return (
    <div>
      <Show when={appMode() == APP_MODE.Board}>
        <Show when={endpoint()}>
          <ProtectedResources />
        </Show>
        <Overview />
      </Show>
      <Show when={appMode() != APP_MODE.Board}>
        <Inputs />
      </Show>
    </div>
  )
}
