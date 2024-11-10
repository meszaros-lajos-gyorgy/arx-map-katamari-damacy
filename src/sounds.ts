import { Audio } from 'arx-level-generator'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'

const hasteStart = new Audio({ filename: 'magic_spell_speedstart.wav' })
const eat = new Audio({ filename: 'eat.wav' })
const ylsideDeath = new Audio({ filename: 'ylside_death.wav' })
const ylsideGingle = new Audio({ filename: 'ylside_gingle.wav' })
const metalOnWater = new Audio({ filename: 'metal_on_water_1.wav' })
const metalOnCloth = new Audio({ filename: 'metal_on_cloth_1.wav' })
const sfxPlayerAppears4 = new Audio({ filename: 'sfx_player_appears4.wav' })
const snakeTeleport = new Audio({ filename: 'snake_teleport.wav' })

export const hasteStartSoundScript = new Sound(hasteStart.filename, SoundFlags.VaryPitch)
export const eatSoundScript = new Sound(eat.filename, SoundFlags.VaryPitch)
export const ylsideDeathSoundScript = new Sound(ylsideDeath.filename, SoundFlags.VaryPitch)
export const ylsideGingleSoundScript = new Sound(ylsideGingle.filename, SoundFlags.VaryPitch)
export const metalOnWaterSoundScript = new Sound(metalOnWater.filename, SoundFlags.VaryPitch)
export const metalOnClothSoundScript = new Sound(metalOnCloth.filename, SoundFlags.VaryPitch)
export const sfxPlayerAppears4SoundScript = new Sound(
  sfxPlayerAppears4.filename,
  SoundFlags.VaryPitch | SoundFlags.EmitFromPlayer,
)
export const snakeTeleportSoundScript = new Sound(snakeTeleport.filename, SoundFlags.None)
