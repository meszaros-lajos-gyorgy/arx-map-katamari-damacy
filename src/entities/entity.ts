import { Entity, EntityModel, Rotation, Vector3 } from 'arx-level-generator'
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
import { carrotModel, leekModel } from '@/models.js'
import {
  eatSoundScript,
  hasteStartSoundScript,
  metalOnClothSoundScript,
  metalOnWaterSoundScript,
  ylsideDyingSoundScript,
  ylsideGingleSoundScript,
} from '@/sounds.js'

// -----------------

export enum EntityTypes {
  Goblin = 'goblin_base',
  GoblinLord = 'goblin_lord',
  GoblinKing = 'goblin_king',
  Ylside = 'human_ylside',
  Carrot = 'carrot',
  Leek = 'food_leek',
}

type EntityDefinition = {
  sounds: {
    bumpFarFromConsumed?: string
    bumpAlmostConsumed?: string
    consumed?: string
  }
  baseHeight: number
  mesh: string | EntityModel
  tweaks?: Record<string, string | string[]>
  animations: {
    idle?: string
    talk?: string
    bumpFarFromConsumed?: string
    bumpAlmostConsumed?: string
  }
  /**
   * if not specified, then a random rotation will be applied
   */
  orientation?: Rotation
  /**
   * maximum of 2 words to describe the entity, like 'ylside' or 'goblin lord'
   */
  displayName: string
}

const entityDefinitions: Record<EntityTypes, EntityDefinition> = {
  [EntityTypes.Goblin]: {
    sounds: {
      bumpFarFromConsumed: 'speak [goblin_generic]',
      bumpAlmostConsumed: 'speak [goblin_help]',
      consumed: 'speak [goblin_ouch]',
    },
    baseHeight: 160,
    mesh: 'goblin_base/goblin_base.teo',
    animations: {
      idle: 'goblin_normal_wait',
      talk: 'goblin_normal_talk_neutral_headonly',
      bumpFarFromConsumed: 'human_misc_kick_rat',
      bumpAlmostConsumed: 'goblin_fight_grunt',
    },
    displayName: 'goblin',
  },
  [EntityTypes.GoblinLord]: {
    sounds: {
      bumpFarFromConsumed: 'speak [goblinlord_warning]',
      bumpAlmostConsumed: 'speak [goblinlord_mad]',
      consumed: `
    random 50 {
      speak [goblinlord_ouch]
    } else {
      speak [goblinlord_dying]
    }
`,
    },
    baseHeight: 210,
    mesh: 'goblin_lord/goblin_lord.teo',
    animations: {
      idle: 'goblinlord_normal_wait',
      talk: 'goblinlord_normal_talk_neutral_headonly',
      bumpFarFromConsumed: 'goblinlord_hit_short',
      bumpAlmostConsumed: 'goblinlord_fight_grunt',
    },
    displayName: 'goblin lord',
  },
  [EntityTypes.GoblinKing]: {
    sounds: {
      bumpFarFromConsumed: 'speak [alotar_favour]',
      bumpAlmostConsumed: 'speak [alotar_irritated]',
      consumed: 'speak [alotar_pain]',
    },
    baseHeight: 170,
    mesh: 'goblin_king/goblin_king.teo',
    animations: {
      idle: 'goblin_normal_wait',
      talk: 'goblin_normal_talk_neutral_headonly',
      bumpFarFromConsumed: 'human_misc_kick_rat',
      bumpAlmostConsumed: 'goblin_fight_grunt',
    },
    displayName: 'goblin king',
  },
  [EntityTypes.Ylside]: {
    sounds: {
      bumpFarFromConsumed: 'speak [ylside_password]',
      bumpAlmostConsumed: ylsideGingleSoundScript.play(),
      consumed: `
    random 30 {
      ${ylsideDyingSoundScript.play()}
    } else {
      ${hasteStartSoundScript.play()}
    }
`,
    },
    baseHeight: 180,
    mesh: 'human_base/human_base.teo',
    tweaks: {
      lower: 'human_ylside',
      skin: ['npc_human_base_hero_head', 'npc_human_ylside_head'],
    },
    animations: {
      idle: 'ylside_wait',
      talk: 'human_talk_neutral_headonly',
      bumpFarFromConsumed: 'human_hit_short',
      bumpAlmostConsumed: 'ylside_fight_grunt',
    },
    displayName: 'ylside',
  },
  [EntityTypes.Carrot]: {
    sounds: {
      bumpFarFromConsumed: metalOnClothSoundScript.play(),
      bumpAlmostConsumed: metalOnWaterSoundScript.play(),
      consumed: eatSoundScript.play(),
    },
    baseHeight: 52,
    mesh: carrotModel,
    orientation: new Rotation(0, 0, MathUtils.degToRad(90)),
    animations: {
      bumpFarFromConsumed: 'bee_grunt',
      bumpAlmostConsumed: 'blackthing_gethit',
    },
    displayName: 'carrot',
  },
  [EntityTypes.Leek]: {
    sounds: {
      bumpFarFromConsumed: metalOnClothSoundScript.play(),
      bumpAlmostConsumed: metalOnWaterSoundScript.play(),
      consumed: eatSoundScript.play(),
    },
    baseHeight: 75,
    mesh: leekModel,
    orientation: new Rotation(0, 0, MathUtils.degToRad(90)),
    animations: {
      bumpFarFromConsumed: 'bee_grunt',
      bumpAlmostConsumed: 'blackthing_gethit',
    },
    displayName: 'leek',
  },
}

// -----------------

const varSize = new Variable('float', 'size', 0, true) // real height of the model (centimeters)

const varIsConsumable = new Variable('bool', 'is_consumable', false)
const varAlmostConsumable = new Variable('bool', 'almost_consumable', false)
const varBaseHeight = new Variable('int', 'base_height', 0, true) // model height (centimeters)
const varScaleFactor = new Variable('float', 'scale_factor', 0, true) // value to be passed to setscale command (percentage)
const varTmp = new Variable('float', 'tmp', 0, true) // helper for calculations
const varLastSpokenAt = new Variable('int', 'last_spoken_at', 0, true) // (seconds)

export function createRootEntities(): Entity[] {
  return Object.values(EntityTypes).map((type) => {
    const entity = new Entity({
      src: `npc/entity/${type}`,
    })

    if (entityDefinitions[type].mesh instanceof EntityModel) {
      entity.model = entityDefinitions[type].mesh
    }

    entity.withScript()
    entity.script?.makeIntoRoot()

    const resize = new ScriptSubroutine(
      'resize',
      () => {
        return `
// scaleFactor % = (size cm / baseHeight cm) * 100
set ${varScaleFactor.name} ${varSize.name}
div ${varScaleFactor.name} ${varBaseHeight.name}
mul ${varScaleFactor.name} 100

setscale ${varScaleFactor.name}
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
      varIsConsumable,
      varAlmostConsumable,
      varSize,
      varBaseHeight,
      varScaleFactor,
      varTmp,
      varLastSpokenAt,
    )
    entity.script
      ?.on('init', () => {
        return `
setgroup consumables

set ${varTmp.name} ^rnd_40
div ${varTmp.name} 100
inc ${varTmp.name} 0.8
set_speak_pitch ${varTmp.name}

physical radius 25
physical height 200
`
      })
      .on('initend', () => {
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

        return `
loadanim wait "${entityDefinitions[type].animations.idle ?? 'gargoyle_wait'}"
${entityDefinitions[type].animations.talk ? `loadanim talk_neutral "${entityDefinitions[type].animations.talk}"` : ''}
${entityDefinitions[type].animations.bumpFarFromConsumed ? `loadanim hit_short "${entityDefinitions[type].animations.bumpFarFromConsumed}"` : ''}
${entityDefinitions[type].animations.bumpAlmostConsumed ? `loadanim hit "${entityDefinitions[type].animations.bumpAlmostConsumed}"` : ''}

set ${varBaseHeight.name} ${entityDefinitions[type].baseHeight}

${resize.invoke()}

${tweaks.join('\n')}
`
      })
      .on('reset', () => {
        return `
// TODO: reset variables
objecthide self off
`
      })
      .on('size_threshold_change', () => {
        return `
if (${varSize.name} < ^&param1) {
  // entity is smaller than player -> consumable
  set ${varIsConsumable.name} 1
  set ${varAlmostConsumable.name} 0
} else {
  // entity is larger than player -> not consumable
  set ${varIsConsumable.name} 0

  // 90% of entity is smaller than player -> almost consumable
  set ${varTmp.name} ${varSize.name}
  mul ${varTmp.name} 0.9
  if (${varTmp.name} < ^&param1) {
    set ${varAlmostConsumable.name} 1
  } else {
    set ${varAlmostConsumable.name} 0
  }
}

// if entity's size > player's size * 3
// then turn collision off
set ${varTmp.name} ^&param1
mul ${varTmp.name} 3
if (${varSize.name} > ${varTmp.name}) {
  ${Collision.off}
} else {
  ${Collision.on}
}

// if entity's size < player's size / 5
// then hide entity
set ${varTmp.name} ^&param1
div ${varTmp.name} 5
if (${varSize.name} < ${varTmp.name}) {
  objecthide self on
}
      `
      })
      .on('load', () => {
        if (typeof entityDefinitions[type].mesh === 'string') {
          return `use_mesh "${entityDefinitions[type].mesh}"`
        } else {
          return ''
        }
      })
      .on('collide_npc', () => {
        return `
if (${varIsConsumable.name} == 1) {
  sendevent grow player "~${varSize.name}~ ~${entityDefinitions[type].displayName}~"
  ${Collision.off}
  objecthide self on
  sendevent consumed self nop
  ${entityDefinitions[type].sounds.consumed ?? ''}
} else {
  if (^speaking == 0) {
    // throttle bump sounds by 2 seconds intervals
    set ${varTmp.name} ${varLastSpokenAt.name}
    inc ${varTmp.name} 2
    if (${varTmp.name} < ^gameseconds) {
      set ${varLastSpokenAt.name} ^gameseconds

      if (${varAlmostConsumable.name} == 1) {
        ${entityDefinitions[type].animations.bumpAlmostConsumed ? `playanim hit` : ''}
        ${entityDefinitions[type].sounds.bumpAlmostConsumed ?? entityDefinitions[type].sounds.bumpFarFromConsumed ?? ''}
      } else {
        ${entityDefinitions[type].animations.bumpFarFromConsumed ? `playanim hit_short` : ''}
        ${entityDefinitions[type].sounds.bumpFarFromConsumed ?? ''}
      }
    }
  }
}
`
      })

    return entity
  })
}

// -----------------

type createEntityProps = {
  position: Vector3
  /**
   * real height of the model in centimeters
   */
  size: number
  type: EntityTypes
}

export function createEntity({ position, size, type }: createEntityProps) {
  let orientation: Rotation
  if (entityDefinitions[type].orientation !== undefined) {
    orientation = entityDefinitions[type].orientation
  } else {
    orientation = new Rotation(0, MathUtils.degToRad(randomBetween(0, 360)), 0)
  }

  const entity = new Entity({
    src: `npc/entity/${type}`,
    position,
    orientation,
  })

  entity.withScript()

  const varSize = new Variable('float', 'size', size)

  entity.script?.properties.push(varSize)

  return entity
}
