import {
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
  onMount,
} from 'solid-js'
import toast from 'solid-toast'
import { twMerge } from 'tailwind-merge'
import { fetchPrimitiveAPI } from '~/apis'
import { Button, ConfigTitle } from '~/components'
import { APP_MODE } from '~/constants'
import { decodeUtf8ase64 } from '~/helpers'
import { useI18n } from '~/i18n'
import {
  profile,
  setProfile,
  updateProfileData,
  useRequestErrHandle,
} from '~/signals'

const ProfileURL = (props: {
  name: string | undefined
  source: string | undefined
  interval: number | undefined
}) => {
  const [t] = useI18n()

  const [interval, setInterval] = createSignal('')
  const handleTextNum = (e) => {
    const inputValue = e.currentTarget.value
    const preVal = interval()

    if (!isNaN(inputValue)) {
      setInterval(inputValue)
      updateProfileData('interval', Number(inputValue))
    } else {
      setInterval('')
      setInterval(preVal)
    }
  }

  const divideAndRoundUp = (interval?: number): string => {
    if (interval !== undefined) {
      const result = interval / 60000

      return Math.ceil(result).toString()
    }

    return ''
  }

  onMount(() => {
    if (props.interval != undefined) {
      const val = divideAndRoundUp(props.interval)
      setInterval(val)
    }
  })

  return (
    <div class="flex flex-col gap-4">
      <div class="form-control w-2/4 self-center">
        <label for="url-name">{t('name')}</label>
        <input
          id="url-name"
          type="text"
          name="name"
          class="input input-bordered min-w-0 "
          value={props.name}
          onInput={(e) => {
            updateProfileData('name', e.currentTarget.value)
          }}
        />
      </div>

      <div class="form-control w-2/4 self-center">
        <label for="url-input">url</label>
        <input
          id="url-input"
          type="text"
          name="url"
          class="input input-bordered "
          placeholder={
            props.source == '' || props.source == undefined
              ? t('onlyHttpContent')
              : ''
          }
          value={props.source}
          onInput={(e) => {
            updateProfileData('source', e.currentTarget.value)
          }}
        />
      </div>

      <div class="form-control w-2/4 self-center">
        <label for="interval">{t('interval')}</label>
        <input
          id="interval"
          type="text"
          name="inetrval"
          class="input input-bordered"
          onClick={() => {
            if (interval() == '0') setInterval('')
          }}
          onfocus={() => {
            if (interval() == '0') setInterval('')
          }}
          value={interval() == '0' ? t('disabled') : interval()}
          onInput={handleTextNum}
        />
      </div>
    </div>
  )
}

const ProfileFile = (props: {
  name: string | undefined
  type: number | undefined
  payload: string | undefined
}) => {
  const [t] = useI18n()

  const handleFileUpload = (
    e: Event & {
      currentTarget: HTMLInputElement
      target: HTMLInputElement
    },
  ) => {
    if (e.target.files) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileContent = e.target?.result

        if (typeof fileContent === 'string') {
          updateProfileData('payload', fileContent)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleFileDownlaod = () => {
    if (props.payload !== undefined) {
      const file = new Blob([props.payload], { type: 'text/plain' })
      const fileURL = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = fileURL
      link.download = 'profile.yaml'
      link.click()
    }
  }

  return (
    <div class="flex flex-col gap-4">
      <div class="form-control w-2/4 self-center">
        <label for="url-name">{t('name')}</label>
        <input
          id="url-name"
          type="text"
          name="name"
          class="input input-bordered min-w-0 "
          value={props.name}
          onInput={(e) => {
            updateProfileData('name', e.currentTarget.value)
          }}
        />
      </div>

      <div class="mx-auto flex w-2/4 flex-row gap-4">
        <input
          id="file_upload"
          type="file"
          class="file-input file-input-bordered file-input-primary w-full"
          onChange={(e) => {
            handleFileUpload(e)
          }}
        />
      </div>
      <div class="mx-auto my-2 w-2/4">
        <Show when={props.type === APP_MODE.File}>
          <Button
            type="button"
            class="btn-primary w-full"
            onClick={() => handleFileDownlaod()}
          >
            {t('downloadProfile')}
          </Button>
        </Show>
      </div>
    </div>
  )
}

export default () => {
  const [t] = useI18n()

  const [profileData] = createResource(fetchPrimitiveAPI)
  const tabs = () => [
    {
      type: APP_MODE.Url,
      name: t('profileURL'),
    },
    {
      type: APP_MODE.File,
      name: t('profileFile'),
    },
  ]

  createEffect(() => {
    const data = profileData()

    if (data && data.payload !== undefined) {
      const payLoad = decodeUtf8ase64(data.payload)

      setProfile({ ...data, payload: payLoad })
    }
  })

  const postProfile = async () => {
    const request = useRequestErrHandle()
    try {
      const response = await request.put('primitive', {
        headers: {
          'Content-Type': 'application/json',
        },
        json: profile(),
      })

      if (response.ok) {
        toast.success(t('profileSuccess'))
      }
    } catch (error) {
      console.error((error as Error).message)
    }
  }

  return (
    <div class="flex h-full flex-col gap-2">
      <div class="flex items-center gap-2">
        <div class="tabs-boxed tabs gap-2">
          <For each={tabs()}>
            {(tab) => (
              <button
                class={twMerge(
                  profile()?.pType === tab.type && 'tab-active',
                  'tab tab-sm gap-2 px-2 sm:tab-md',
                )}
                onclick={() => {
                  updateProfileData('pType', tab.type)
                }}
                disabled={
                  profileData()?.pType === APP_MODE.File ||
                  profileData()?.pType === APP_MODE.Url
                }
              >
                <span>{tab.name}</span>
              </button>
            )}
          </For>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <Show
          when={
            profile().pType === APP_MODE.Url ||
            profile().pType === APP_MODE.AddNew
          }
        >
          <ConfigTitle withDivider>{t('profileURL')}</ConfigTitle>
          <ProfileURL
            name={profile().name}
            source={profile().source}
            interval={profile().interval}
          />
        </Show>
        <Show
          when={
            profile().pType === APP_MODE.File ||
            profile().pType === APP_MODE.AddNew
          }
        >
          <ConfigTitle withDivider>{t('profileFile')}</ConfigTitle>
          <ProfileFile
            name={profile().name}
            type={profile().pType}
            payload={profile().payload}
          />
        </Show>
        <div class="mx-auto my-8 w-2/4">
          <Button
            type="button"
            class="btn-primary w-full"
            onClick={() => postProfile()}
            disabled={profile().pType === APP_MODE.AddNew}
          >
            {t('submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}
