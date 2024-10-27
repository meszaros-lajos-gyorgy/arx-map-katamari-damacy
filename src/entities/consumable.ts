import { Entity, Rotation, Vector3 } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
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
import { hasteStartSoundScript } from '@/sounds.js'

// -----------------

export enum ConsumableTypes {
  Goblin = 'goblin_base',
  GoblinLord = 'goblin_lord',
  GoblinKing = 'goblin_king',
  Ylside = 'human_ylside',
}

type ConsumableData = {
  bumpSound: string
  consumedSound: string
  baseHeight: number
  mesh: string
  tweaks?: Record<string, string | string[]>
  idleAnimation: string
  talkAnimation: string
}

const npcData: Record<ConsumableTypes, ConsumableData> = {
  [ConsumableTypes.Goblin]: {
    bumpSound: 'speak [goblin_generic]',
    consumedSound: 'speak [goblin_ouch]',
    baseHeight: 160,
    mesh: 'goblin_base/goblin_base.teo',
    idleAnimation: 'goblin_normal_wait',
    talkAnimation: 'goblin_normal_talk_neutral_headonly',
  },
  [ConsumableTypes.GoblinLord]: {
    bumpSound: 'speak [goblinlord_warning]',
    consumedSound: 'speak [goblinlord_ouch]',
    baseHeight: 210,
    mesh: 'goblin_lord/goblin_lord.teo',
    idleAnimation: 'goblinlord_normal_wait',
    talkAnimation: 'goblinlord_normal_talk_neutral_headonly',
  },
  [ConsumableTypes.GoblinKing]: {
    bumpSound: 'speak [alotar_irritated]',
    consumedSound: 'speak [alotar_pain]',
    baseHeight: 170,
    mesh: 'goblin_king/goblin_king.teo',
    idleAnimation: 'goblin_normal_wait',
    talkAnimation: 'goblin_normal_talk_neutral_headonly',
  },
  [ConsumableTypes.Ylside]: {
    bumpSound: 'speak [ylside_password]',
    consumedSound: hasteStartSoundScript.play(),
    baseHeight: 180,
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
const lastSpokenAt = new Variable('int', 'last_spoken_at', 0, true) // (seconds)

export function createRootConsumable() {
  const entity = new Entity({
    src: 'npc/goblin_base',
  })

  entity.withScript()
  entity.script?.makeIntoRoot()

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
    lastSpokenAt,
  )
  entity.script
    ?.on('init', () => {
      return `
setgroup consumables

set ${tmp.name} ^rnd_40
div ${tmp.name} 100
inc ${tmp.name} 0.8
set_speak_pitch ${tmp.name}
`
    })
    .on('initend', () => {
      return `
physical radius 30

if (£type == "${ConsumableTypes.Goblin}") {
  loadanim wait         "${npcData[ConsumableTypes.Goblin].idleAnimation}"
  loadanim talk_neutral "${npcData[ConsumableTypes.Goblin].talkAnimation}"
  set ${baseHeight.name} ${npcData[ConsumableTypes.Goblin].baseHeight}
}

if (£type == "${ConsumableTypes.GoblinLord}") {
  loadanim wait         "${npcData[ConsumableTypes.GoblinLord].idleAnimation}"
  loadanim talk_neutral "${npcData[ConsumableTypes.GoblinLord].talkAnimation}"
  set ${baseHeight.name} ${npcData[ConsumableTypes.GoblinLord].baseHeight}
}

if (£type == "${ConsumableTypes.GoblinKing}") {
  loadanim wait         "${npcData[ConsumableTypes.GoblinKing].idleAnimation}"
  loadanim talk_neutral "${npcData[ConsumableTypes.GoblinKing].talkAnimation}"
  set ${baseHeight.name} ${npcData[ConsumableTypes.GoblinKing].baseHeight}
}

if (£type == "${ConsumableTypes.Ylside}") {
  loadanim wait         "${npcData[ConsumableTypes.Ylside].idleAnimation}"
  loadanim talk_neutral "${npcData[ConsumableTypes.Ylside].talkAnimation}"
  set ${baseHeight.name} ${npcData[ConsumableTypes.Ylside].baseHeight}
}

${resize.invoke()}
      `
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

if (${isConsumable.name} == 1) {
  if (£type == "${ConsumableTypes.Goblin}") {
    ${npcData[ConsumableTypes.Goblin].consumedSound}
  }
  if (£type == "${ConsumableTypes.GoblinLord}") {
    ${npcData[ConsumableTypes.GoblinLord].consumedSound}
  }
  if (£type == "${ConsumableTypes.GoblinKing}") {
    ${npcData[ConsumableTypes.GoblinKing].consumedSound}
  }
  if (£type == "${ConsumableTypes.Ylside}") {
    ${npcData[ConsumableTypes.Ylside].consumedSound}
  }
} else {
  if (^speaking == 0) {
    // throttle bump sound playing by 2 seconds intervals
    set ${tmp.name} ${lastSpokenAt.name}
    inc ${tmp.name} 2
    if (${tmp.name} < ^gameseconds) {
      set ${lastSpokenAt.name} ^gameseconds
      
      if (£type == "${ConsumableTypes.Goblin}") {
        ${npcData[ConsumableTypes.Goblin].bumpSound}
      }
      if (£type == "${ConsumableTypes.GoblinLord}") {
        ${npcData[ConsumableTypes.GoblinLord].bumpSound}
      }
      if (£type == "${ConsumableTypes.GoblinKing}") {
        ${npcData[ConsumableTypes.GoblinKing].bumpSound}
      }
      if (£type == "${ConsumableTypes.Ylside}") {
        ${npcData[ConsumableTypes.Ylside].bumpSound}
      }
    }
  }
}
  `
    })
    .on('restart', () => {
      return `
objecthide self off
      `
    })

  return entity
}

// -----------------

type createConsumableProps = {
  position: Vector3
  sizeRange: { min: number; max: number }
  type: ConsumableTypes
}

export function createConsumable({ position, sizeRange, type }: createConsumableProps) {
  // for testing baseHeight of npcs:
  // sizeRange.min = 100
  // sizeRange.max = 100

  const entity = new Entity({
    src: 'npc/goblin_base',
    position,
    orientation: new Rotation(0, MathUtils.degToRad(randomBetween(0, 360)), 0),
  })

  entity.withScript()

  entity.script?.on('init', () => {
    return `
set £type "${type}"

set ${size.name} ^rnd_${sizeRange.max - sizeRange.min}
inc ${size.name} ${sizeRange.min}
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
