import { Audio, Entity, ScriptHandler, Vector3 } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'
import {
  Collision,
  Interactivity,
  Invulnerability,
  Material,
  Shadow,
  Variable,
} from 'arx-level-generator/scripting/properties'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'

// -----------------

const eatSound = new Audio({
  filename: 'eat.wav',
  isNative: true,
  type: 'sfx',
})

const eatSoundScript = new Sound(eatSound.filename, SoundFlags.VaryPitch)

const hasteStartSound = new Audio({
  filename: 'magic_spell_speedstart.wav',
  isNative: true,
  type: 'sfx',
})

const hasteStartSoundScript = new Sound(hasteStartSound.filename, SoundFlags.VaryPitch)

// -----------------

export enum NpcTypes {
  Goblin = 'goblin_base',
  GoblinLord = 'goblin_lord',
  GoblinKing = 'goblin_king',
  Ylside = 'human_ylside',
}

type NpcData = {
  bumpSound: string
  baseHeight: number
  mesh: string
  tweaks?: Record<string, string | string[]>
  idleAnimation: string
  talkAnimation: string
}

const npcData: Record<NpcTypes, NpcData> = {
  [NpcTypes.Goblin]: {
    bumpSound: 'speak [goblin_ouch]',
    baseHeight: 151,
    mesh: 'goblin_base/goblin_base.teo',
    idleAnimation: 'goblin_normal_wait',
    talkAnimation: 'goblin_normal_talk_neutral_headonly',
  },
  [NpcTypes.GoblinLord]: {
    bumpSound: 'speak [goblinlord_ouch]',
    baseHeight: 213,
    mesh: 'goblin_lord/goblin_lord.teo',
    idleAnimation: 'goblinlord_normal_wait',
    talkAnimation: 'goblinlord_normal_talk_neutral_headonly',
  },
  [NpcTypes.GoblinKing]: {
    bumpSound: 'speak [alotar_irritated]',
    baseHeight: 184,
    mesh: 'goblin_king/goblin_king.teo',
    idleAnimation: 'goblin_normal_wait',
    talkAnimation: 'goblin_normal_talk_neutral_headonly',
  },
  [NpcTypes.Ylside]: {
    bumpSound: hasteStartSoundScript.play(),
    baseHeight: 182,
    mesh: 'human_base/human_base.teo',
    tweaks: {
      lower: 'human_ylside',
      skin: ['npc_human_base_hero_head', 'npc_human_ylside_head'],
    },
    idleAnimation: 'ylside_wait',
    talkAnimation: 'human_talk_neutral_headonly',
  },
}

// -----------------

const isConsumable = new Variable('bool', 'is_consumable', false)
const size = new Variable('float', 'size', 50) // real height of the model (centimeters)
const baseHeight = new Variable('int', 'base_height', 180) // model height (centimeters)
const scaleFactor = new Variable('float', 'scale_factor', 0, true) // value to be passed to setscale command (percentage)
const tmp = new Variable('float', 'tmp', 0, true) // helper for calculations

export function createRootNpc() {
  const entity = new Entity({
    src: 'npc/goblin_base',
  })

  entity.withScript()
  entity.script?.makeIntoRoot()

  // ----

  const resize = new ScriptSubroutine(
    'resize',
    () => {
      return `
// scaleFactor % = (playerSize cm / playerBaseHeight cm) * 100
set ${scaleFactor.name} ${size.name}
div ${scaleFactor.name} ${baseHeight.name}
mul ${scaleFactor.name} 100

setscale ${scaleFactor.name}
  `
    },
    'gosub',
  )
  entity.script?.subroutines.push(resize)

  entity.script?.on('initend', () => {
    return `
physical radius 30

if (£type == "${NpcTypes.Goblin}") {
  loadanim wait         "${npcData[NpcTypes.Goblin].idleAnimation}"
  loadanim talk_neutral "${npcData[NpcTypes.Goblin].talkAnimation}"
  set ${baseHeight.name} ${npcData[NpcTypes.Goblin].baseHeight}
}

if (£type == "${NpcTypes.GoblinLord}") {
  loadanim wait         "${npcData[NpcTypes.GoblinLord].idleAnimation}"
  loadanim talk_neutral "${npcData[NpcTypes.GoblinLord].talkAnimation}"
  set ${baseHeight.name} ${npcData[NpcTypes.GoblinLord].baseHeight}
}

if (£type == "${NpcTypes.GoblinKing}") {
  loadanim wait         "${npcData[NpcTypes.GoblinKing].idleAnimation}"
  loadanim talk_neutral "${npcData[NpcTypes.GoblinKing].talkAnimation}"
  set ${baseHeight.name} ${npcData[NpcTypes.GoblinKing].baseHeight}
}

if (£type == "${NpcTypes.Ylside}") {
  loadanim wait         "${npcData[NpcTypes.Ylside].idleAnimation}"
  loadanim talk_neutral "${npcData[NpcTypes.Ylside].talkAnimation}"
  set ${baseHeight.name} ${npcData[NpcTypes.Ylside].baseHeight}
}
    `
  })

  // ----

  entity.script?.properties.push(
    Collision.on,
    Shadow.off,
    Interactivity.off,
    Invulnerability.on,
    Material.flesh,
    isConsumable,
    size,
    baseHeight,
    scaleFactor,
    tmp,
  )
  entity.script
    ?.on('init', () => {
      return `setgroup consumables`
    })
    .on('initend', () => {
      return resize.invoke()
    })
    .on('size_threshold_change', () => {
      return `
if (${size.name} < ^&param1) {
  set ${isConsumable.name} 1
} else {
  set ${isConsumable.name} 0
}

// if entity's size > player's size * 3
// then turn collision off
set ${tmp.name} ^&param1
mul ${tmp.name} 3
if (${size.name} > ${tmp.name}) {
  ${Collision.off}
} else {
  ${Collision.on}
}

// if entity's size < player's size / 5
// then hide entity
set ${tmp.name} ^&param1
div ${tmp.name} 5
if (${size.name} < ${tmp.name}) {
  objecthide self on
}
      `
    })
    .on('collide_npc', () => {
      return `
if (${isConsumable.name} == 1) {
  sendevent grow player ~${size.name}~
  ${Collision.off}
  objecthide self on
  sendevent consumed self nop
}
      `
    })
    .on('restart', () => {
      return `objecthide self off`
    })

  return entity
}

// -----------------

type createNpcProps = {
  position: Vector3
  sizeRange: { min: number; max: number }
  type: NpcTypes
}

export function createNpc({ position, sizeRange, type }: createNpcProps) {
  const entity = new Entity({
    src: 'npc/goblin_base',
  })

  entity.position = position
  entity.orientation.y = MathUtils.degToRad(randomBetween(-90, 90))

  entity.withScript()

  entity.script?.on('init', () => {
    return `
 set ${tmp.name} ^rnd_40
 div ${tmp.name} 100
 inc ${tmp.name} 0.8
 set_speak_pitch ${tmp.name}

 set £type "${type}"
    `
  })

  // ----

  entity.script?.properties.push(size)
  entity.script
    ?.on('init', () => {
      return `
set ${size.name} ^rnd_${sizeRange.max - sizeRange.min}
inc ${size.name} ${sizeRange.min}
      `
    })
    .on('collide_npc', () => {
      return `
if (${isConsumable.name} == 1) {
  ${eatSoundScript.play()}
} else {
  ${npcData[type].bumpSound}
}
  `
    })

  if (npcData[type].tweaks !== undefined) {
    Object.entries(npcData[type].tweaks).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        entity.script?.on('initend', () => {
          return `tweak ${key} ${value.map((v) => `"${v}"`).join(' ')}`
        })
      } else {
        entity.script?.on('initend', () => {
          return `tweak ${key} "${value}"`
        })
      }
    })
  }

  // "load" event happens before "init", so this can't be moved to the root file
  // as when "load" runs the £type variable is not yet set
  entity.script?.on('load', () => {
    return `use_mesh "${npcData[type].mesh}"`
  })

  return entity
}
