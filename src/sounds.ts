import { Audio } from 'arx-level-generator'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'

const hasteStartSound = new Audio({
  filename: 'magic_spell_speedstart.wav',
  isNative: true,
})

const eatSound = new Audio({
  filename: 'eat.wav',
  isNative: true,
})

const ylsideDyingSound = new Audio({
  filename: 'ylside_death.wav',
  isNative: true,
})

const ylsideGingleSound = new Audio({
  filename: 'ylside_gingle.wav',
  isNative: true,
})

const metalOnWaterSound = new Audio({
  filename: 'metal_on_water_1.wav',
  isNative: true,
})

const metalOnClothSound = new Audio({
  filename: 'metal_on_cloth_1.wav',
  isNative: true,
})

export const hasteStartSoundScript = new Sound(hasteStartSound.filename, SoundFlags.VaryPitch)
export const eatSoundScript = new Sound(eatSound.filename, SoundFlags.VaryPitch)
export const ylsideDyingSoundScript = new Sound(ylsideDyingSound.filename, SoundFlags.VaryPitch)
export const ylsideGingleSoundScript = new Sound(ylsideGingleSound.filename, SoundFlags.VaryPitch)
export const metalOnWaterSoundScript = new Sound(metalOnWaterSound.filename, SoundFlags.VaryPitch)
export const metalOnClothSoundScript = new Sound(metalOnClothSound.filename, SoundFlags.VaryPitch)
