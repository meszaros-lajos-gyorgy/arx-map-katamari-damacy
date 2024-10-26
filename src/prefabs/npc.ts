import { Audio, Entity, ScriptHandler, Vector3 } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'
import { Collision, Interactivity, Invulnerability, Shadow, Variable } from 'arx-level-generator/scripting/properties'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'

// -----------------

export type NpcTypes = 'goblin_base' | 'goblin_lord' | 'goblin_king'

// -----------------

const eatSound = new Audio({
  filename: 'eat.wav',
  isNative: true,
  type: 'sfx',
})

const eatSoundScript = new Sound(eatSound.filename, SoundFlags.VaryPitch | SoundFlags.EmitFromPlayer)

// TODO: https://github.com/arx-tools/arx-level-generator/issues/35
const bumpedSoundScript: Record<NpcTypes, { play: () => ScriptHandler }> = {
  goblin_base: {
    play: () => `speak [goblin_ouch]`,
  },
  goblin_lord: {
    play: () => `speak [goblinlord_ouch]`,
  },
  goblin_king: {
    play: () => `speak [alotar_irritated]`,
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

  entity.script
    ?.on('init', () => {
      return `
 SET £type "goblin_base"
 PHYSICAL RADIUS 30
 SET_MATERIAL FLESH
    `
    })
    .on('initend', () => {
      return `
 IF (£type == "goblin_base") 
 {
  LOADANIM WAIT                       "Goblin_normal_wait"
  LOADANIM TALK_NEUTRAL               "Goblin_normal_talk_neutral_headonly"
  LOADANIM TALK_HAPPY                 "Goblin_normal_talk_happy_headonly"
  LOADANIM TALK_ANGRY                 "Goblin_normal_talk_angry_headonly"
  set ${baseHeight.name} 151
 }

 IF (£type == "goblin_lord") {
  LOADANIM WAIT                       "Goblinlord_normal_wait"
  LOADANIM TALK_NEUTRAL               "Goblinlord_normal_talk_neutral_headonly"
  LOADANIM TALK_HAPPY                 "Goblinlord_normal_talk_happy_headonly"
  LOADANIM TALK_ANGRY                 "Goblinlord_normal_talk_angry_headonly"
  set ${baseHeight.name} 213
 }

 IF (£type == "goblin_king") {
  LOADANIM WAIT                       "Goblin_normal_wait"
  LOADANIM TALK_NEUTRAL               "Goblin_normal_talk_neutral_headonly"
  LOADANIM TALK_HAPPY                 "Goblin_normal_talk_happy_headonly"
  LOADANIM TALK_ANGRY                 "Goblin_normal_talk_angry_headonly"
  set ${baseHeight.name} 184
 }
    `
    })

  // ----

  entity.script?.properties.push(
    Collision.on,
    Shadow.off,
    Interactivity.off,
    Invulnerability.on,
    isConsumable,
    size,
    baseHeight,
    scaleFactor,
    tmp,
  )
  entity.script
    ?.on('init', () => {
      return `
setgroup consumables
      `
    })
    .on('initend', () => {
      return `
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

// if entity's size > 3 * player's size then turn collision off
set ${tmp.name} ^&param1
mul ${tmp.name} 3
if (${size.name} > ${tmp.name}) {
  ${Collision.off}
} else {
  ${Collision.on}
}

// if entity's size < player's size / 5 then hide entity
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
 SET_SPEAK_PITCH ${tmp.name}

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
  ${bumpedSoundScript[type].play()}
}
  `
    })

  // "load" event happens before "init", so this can't be moved to the root file
  // as when "load" runs the £type variable is not yet set
  if (type === 'goblin_lord') {
    entity.script?.on('load', () => {
      return `USE_MESH "Goblin_lord\\Goblin_lord.teo"`
    })
  }
  if (type === 'goblin_king') {
    entity.script?.on('load', () => {
      return `USE_MESH "Goblin_king\\Goblin_king.teo"`
    })
  }

  return entity
}
