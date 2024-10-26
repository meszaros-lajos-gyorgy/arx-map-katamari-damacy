import { Audio, Entity, Vector3 } from 'arx-level-generator'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'
import { Collision, Interactivity, Invulnerability, Shadow, Variable } from 'arx-level-generator/scripting/properties'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'

// -----------------

export type NpcTypes = 'goblin_base' | 'goblin_lord' | 'goblin_king'

const consumeSound = new Audio({
  filename: 'eat.wav',
  isNative: true,
  type: 'sfx',
})

const consumeSoundScript = new Sound(consumeSound.filename, SoundFlags.VaryPitch)

// -----------------

// TODO: https://github.com/arx-tools/arx-level-generator/issues/35
const collisionSoundScript = {
  play: () => `speak [goblin_ouch]`,
}

// -----------------

export function createRootNpc() {
  const entity = new Entity({
    src: 'npc/goblin_base',
  })

  entity.withScript()
  entity.script?.makeIntoRoot()

  // ----

  entity.script
    ?.on('init', () => {
      return `
 SET £type "goblin_lord"
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
 }

 IF (£type == "goblin_lord") {
  LOADANIM WAIT                       "Goblinlord_normal_wait"
  LOADANIM TALK_NEUTRAL               "Goblinlord_normal_talk_neutral_headonly"
  LOADANIM TALK_HAPPY                 "Goblinlord_normal_talk_happy_headonly"
  LOADANIM TALK_ANGRY                 "Goblinlord_normal_talk_angry_headonly"
 }

 IF (£type == "goblin_king") {
  LOADANIM WAIT                       "Goblin_normal_wait"
  LOADANIM TALK_NEUTRAL               "Goblin_normal_talk_neutral_headonly"
  LOADANIM TALK_HAPPY                 "Goblin_normal_talk_happy_headonly"
  LOADANIM TALK_ANGRY                 "Goblin_normal_talk_angry_headonly"
 }
    `
    })

  // ----

  const scale = new Variable('float', 'scale', 100)
  const isConsumable = new Variable('bool', 'is_consumable', false)

  entity.script?.properties.push(Collision.on, Shadow.off, Interactivity.off, Invulnerability.on, scale, isConsumable)
  entity.script
    ?.on('init', () => {
      return `
setweapon "none"
setgroup blob
      `
    })
    .on('initend', () => {
      return `setscale ${scale.name}`
    })
    .on('scale_threshold_change', () => {
      const tmp = new Variable('float', 'tmp', 0, true)
      return `
if (${scale.name} < ^&param1) {
  set ${isConsumable.name} 1
} else {
  set ${isConsumable.name} 0
}

set ${tmp.name} ^&param1
mul ${tmp.name} 3
if (${scale.name} > ${tmp.name}) {
  ${Collision.off}
} else {
  ${Collision.on}
}
      `
    })
    .on('collide_npc', () => {
      return `
if (${isConsumable.name} == 1) {
  sendevent grow player ~${scale.name}~
  ${Collision.off}
  ${consumeSoundScript.play()}
  objecthide self on
  sendevent consumed self nop
} else {
  random 50 {
    ${collisionSoundScript.play()}
  }
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
  size: { min: number; max: number }
  type: NpcTypes
}

export function createNpc({ position, size, type }: createNpcProps) {
  const entity = new Entity({
    src: 'npc/goblin_base',
  })

  entity.position = position
  entity.orientation.y = MathUtils.degToRad(randomBetween(-90, 90))

  entity.withScript()

  entity.script?.on('init', () => {
    const tmp = new Variable('float', 'tmp', 0, true)
    return `
 set ${tmp.name} ^rnd_40
 div ${tmp.name} 100
 inc ${tmp.name} 0.8
 SET_SPEAK_PITCH ${tmp.name}

 set £type "${type}"
    `
  })

  // ----

  const scale = new Variable('float', 'scale', 0, true)

  entity.script?.properties.push(scale)
  entity.script?.on('init', () => {
    return `
set ${scale.name} ^rnd_${size.max - size.min}
inc ${scale.name} ${size.min}
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
