import { createSignal } from 'solid-js'
import { APP_MODE } from '~/constants'
import { ProfileData } from '~/types'

export const initialProfile: ProfileData = {
  uuid: '',
  name: '',
  pType: 3,
  interval: 0,
  source: '',
  payload: '',
}
export const [appMode, setAppMode] = createSignal(APP_MODE.Board)
export const [profile, setProfile] = createSignal<ProfileData>(initialProfile)

export const updateProfileData = (
  key: keyof ProfileData,
  value: Partial<ProfileData[keyof ProfileData]>,
) => {
  setProfile({ ...profile(), [key]: value })
}
