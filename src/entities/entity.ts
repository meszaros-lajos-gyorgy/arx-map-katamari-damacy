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

export enum EntityTypes {
  Goblin = 'goblin_base',
  GoblinLord = 'goblin_lord',
  GoblinKing = 'goblin_king',
  Ylside = 'human_ylside',
}

type EntityDefinition = {
  bumpSound: string
  consumedSound: string
  baseHeight: number
  mesh: string
  tweaks?: Record<string, string | string[]>
  idleAnimation: string
  talkAnimation: string
}

const entityDefinitions: Record<EntityTypes, EntityDefinition> = {
  [EntityTypes.Goblin]: {
    bumpSound: 'speak [goblin_generic]',
    consumedSound: 'speak [goblin_ouch]',
    baseHeight: 160,
    mesh: 'goblin_base/goblin_base.teo',
    idleAnimation: 'goblin_normal_wait',
    talkAnimation: 'goblin_normal_talk_neutral_headonly',
  },
  [EntityTypes.GoblinLord]: {
    bumpSound: 'speak [goblinlord_warning]',
    consumedSound: 'speak [goblinlord_ouch]',
    baseHeight: 210,
    mesh: 'goblin_lord/goblin_lord.teo',
    idleAnimation: 'goblinlord_normal_wait',
    talkAnimation: 'goblinlord_normal_talk_neutral_headonly',
  },
  [EntityTypes.GoblinKing]: {
    bumpSound: 'speak [alotar_irritated]',
    consumedSound: 'speak [alotar_pain]',
    baseHeight: 170,
    mesh: 'goblin_king/goblin_king.teo',
    idleAnimation: 'goblin_normal_wait',
    talkAnimation: 'goblin_normal_talk_neutral_headonly',
  },
  [EntityTypes.Ylside]: {
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

const types = [EntityTypes.Goblin, EntityTypes.GoblinLord, EntityTypes.GoblinKing, EntityTypes.Ylside]

// -----------------

// TODO: extract type variable here
const size = new Variable('float', 'size', 50) // real height of the model (centimeters)

const isConsumable = new Variable('bool', 'is_consumable', false)
const baseHeight = new Variable('int', 'base_height', 180) // model height (centimeters)
const scaleFactor = new Variable('float', 'scale_factor', 0, true) // value to be passed to setscale command (percentage)
const tmp = new Variable('float', 'tmp', 0, true) // helper for calculations
const lastSpokenAt = new Variable('int', 'last_spoken_at', 0, true) // (seconds)

export function createRootEntity() {
  const entity = new Entity({
    src: 'npc/entity',
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
      return `physical radius 30`
    })

  types.forEach((type) => {
    entity.script?.on('initend', () => {
      return `
if (£type == "${type}") {
  loadanim wait         "${entityDefinitions[type].idleAnimation}"
  loadanim talk_neutral "${entityDefinitions[type].talkAnimation}"
  set ${baseHeight.name} ${entityDefinitions[type].baseHeight}
}
`
    })
  })

  entity.script?.on('initend', () => {
    return resize.invoke()
  })

  entity.script
    ?.on('size_threshold_change', () => {
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

  types.forEach((type) => {
    entity.script?.on('collide_npc', () => {
      return `
if (£type == "${type}") {
  if (${isConsumable.name} == 1) {
    ${entityDefinitions[type].consumedSound}
  } else {
    if (^speaking == 0) {
      // throttle bump sound playing by 2 seconds intervals
      set ${tmp.name} ${lastSpokenAt.name}
      inc ${tmp.name} 2
      if (${tmp.name} < ^gameseconds) {
        set ${lastSpokenAt.name} ^gameseconds
      
        ${entityDefinitions[type].bumpSound}
      }
    }
  }
}
`
    })
  })

  entity.script?.on('restart', () => {
    return `objecthide self off`
  })

  // ------------------

  types.forEach((type) => {
    let tweaks: string[] = []

    if (entityDefinitions[type].tweaks !== undefined) {
      tweaks = Object.entries(entityDefinitions[type].tweaks).map(([key, value]) => {
        if (Array.isArray(value)) {
          return `tweak ${key} ${value.map((v) => `"${v}"`).join(' ')}`
        } else {
          return `tweak ${key} "${value}"`
        }
      })
    }

    entity.script?.on('initend', () => {
      return `
if (£type == "${type}") {
  use_mesh "${entityDefinitions[type].mesh}"
  ${tweaks.join('\n')}
}
`
    })
  })

  return entity
}

// -----------------

type createEntityProps = {
  position: Vector3
  /**
   * centimeters
   */
  height: number
  type: EntityTypes
}

export function createEntity({ position, height, type }: createEntityProps) {
  const entity = new Entity({
    src: 'npc/entity',
    position,
    orientation: new Rotation(0, MathUtils.degToRad(randomBetween(0, 360)), 0),
  })

  entity.withScript()

  const size = new Variable('float', 'size', height) // real height of the model (centimeters)

  entity.script?.properties.push(size)

  entity.script?.on('init', () => {
    return `
set £type "${type}"
      `
  })

  return entity
}
