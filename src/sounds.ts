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

export const hasteStartSoundScript = new Sound(hasteStartSound.filename, SoundFlags.VaryPitch)
export const eatSoundScript = new Sound(eatSound.filename, SoundFlags.VaryPitch)
export const ylsideDyingSoundScript = new Sound(ylsideDyingSound.filename, SoundFlags.VaryPitch)
