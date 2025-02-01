import { Entity, EntityModel, Rotation, Vector3 } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { useDelay } from 'arx-level-generator/scripting/hooks'
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
import { carrotModel, cheeseModel, humanBaseModel, leekModel } from '@/models.js'
import {
  eatSoundScript,
  hasteStartSoundScript,
  metalOnClothSoundScript,
  metalOnWaterSoundScript,
  ylsideDeathSoundScript,
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
  Cheese = 'cheese',
}

type EntitySounds = 'bumpFarFromConsumed' | 'bumpAlmostConsumed' | 'consumed'
type NonNativeEntityAnimations = 'bumpFarFromConsumed' | 'bumpAlmostConsumed'
type EntityAnimations = 'idle' | 'talk' | NonNativeEntityAnimations

type EntityDefinition = {
  sounds: Partial<Record<EntitySounds, string>>
  baseHeight: number
  mesh: string | EntityModel
  tweaks?: Record<string, string | string[]>
  animations: Partial<Record<EntityAnimations, string>>
  /**
   * if not specified, then a random rotation will be applied
   */
  orientation?: Rotation
  /**
   * maximum of 2 words to describe the entity, like 'ylside' or 'goblin lord'
   */
  displayName: string
  /**
   * in milliseconds
   */
  delays?: {
    start?: {
      animations?: Partial<Record<NonNativeEntityAnimations, number>>
      sounds?: Omit<Partial<Record<EntitySounds, number>>, 'consumed'>
    }
    end?: {
      animations?: Partial<Record<NonNativeEntityAnimations, number>>
      sounds?: Omit<Partial<Record<EntitySounds, number>>, 'consumed'>
    }
  }
}

const entityDefinitions: Record<EntityTypes, EntityDefinition> = {
  [EntityTypes.Goblin]: {
    sounds: {
      bumpFarFromConsumed: 'speak [goblin_generic]',
      bumpAlmostConsumed: 'speak [goblin_help]',
      consumed: 'speak [goblin_ouch]',
    },
    baseHeight: 165,
    mesh: 'goblin_base/goblin_base.teo',
    animations: {
      idle: 'goblin_normal_wait',
      talk: 'goblin_normal_talk_neutral_headonly',
      bumpFarFromConsumed: 'human_misc_kick_rat',
      bumpAlmostConsumed: 'goblin_fight_grunt',
    },
    displayName: 'goblin',
    delays: {
      start: {
        animations: {
          bumpFarFromConsumed: 400,
        },
      },
    },
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
    baseHeight: 217,
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
    baseHeight: 180,
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
      ${ylsideDeathSoundScript.play()}
    } else {
      ${hasteStartSoundScript.play()}
    }
`,
    },
    baseHeight: 185,
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
    delays: {
      end: {
        sounds: {
          // length of sfx/ylside_gingle.wav is 6104ms, but the end is mostly silent
          bumpAlmostConsumed: 5000,
        },
      },
    },
  },
  [EntityTypes.Carrot]: {
    sounds: {
      bumpFarFromConsumed: metalOnClothSoundScript.play(),
      bumpAlmostConsumed: metalOnWaterSoundScript.play(),
      consumed: eatSoundScript.play(),
    },
    baseHeight: 20,
    mesh: carrotModel,
    orientation: new Rotation(0, 0, MathUtils.degToRad(90)),
    animations: {
      bumpFarFromConsumed: 'bee_grunt',
      bumpAlmostConsumed: 'blackthing_gethit',
    },
    displayName: 'carrot',
    delays: {
      end: {
        sounds: {
          // length of sfx/metal_on_cloth_1.wav is 734ms
          bumpFarFromConsumed: 734,
          // length of sfx/metal_on_water_1.wav is 688ms
          bumpAlmostConsumed: 688,
        },
      },
    },
  },
  [EntityTypes.Leek]: {
    sounds: {
      bumpFarFromConsumed: metalOnClothSoundScript.play(),
      bumpAlmostConsumed: metalOnWaterSoundScript.play(),
      consumed: eatSoundScript.play(),
    },
    baseHeight: 73,
    mesh: leekModel,
    orientation: new Rotation(0, 0, MathUtils.degToRad(90)),
    animations: {
      bumpFarFromConsumed: 'bee_grunt',
      bumpAlmostConsumed: 'blackthing_gethit',
    },
    displayName: 'leek',
    delays: {
      end: {
        sounds: {
          // length of sfx/metal_on_cloth_1.wav is 734ms
          bumpFarFromConsumed: 734,
          // length of sfx/metal_on_water_1.wav is 688ms
          bumpAlmostConsumed: 688,
        },
      },
    },
  },
  [EntityTypes.Cheese]: {
    sounds: {
      bumpFarFromConsumed: metalOnClothSoundScript.play(),
      bumpAlmostConsumed: metalOnWaterSoundScript.play(),
      consumed: eatSoundScript.play(),
    },
    baseHeight: 12,
    mesh: cheeseModel,
    animations: {
      bumpFarFromConsumed: 'bee_grunt',
      bumpAlmostConsumed: 'blackthing_gethit',
    },
    displayName: 'cheese',
    delays: {
      end: {
        sounds: {
          // length of sfx/metal_on_cloth_1.wav is 734ms
          bumpFarFromConsumed: 734,
          // length of sfx/metal_on_water_1.wav is 688ms
          bumpAlmostConsumed: 688,
        },
      },
    },
  },
}

// -----------------

const varSize = new Variable('float', 'size', 0, true) // real height of the model (centimeters)

const varIsConsumable = new Variable('bool', 'is_consumable', false)
const varAlmostConsumable = new Variable('bool', 'almost_consumable', false)
const varBaseHeight = new Variable('int', 'base_height', 0, true) // model height (centimeters)
const varScaleFactor = new Variable('float', 'scale_factor', 0, true) // value to be passed to setscale command (percentage)
const varTmp = new Variable('float', 'tmp', 0, true) // helper for calculations
const varStartedSpeakingAt = new Variable('int', 'started_speaking_at', 0, true) // (seconds)
const varIsUsingAltSkin = new Variable('bool', 'is_using_alt_skin', false)

const varResetBehaviorCounter = new Variable('int', 'reset_behavior_counter', 0, true)
const varIsBumping = new Variable('bool', 'is_bumping', false)

export function createRootEntities({ gameState }: { gameState: Entity }): Entity[] {
  return Object.values(EntityTypes).map((type) => {
    const entityDefinition = entityDefinitions[type]

    const entity = new Entity({
      src: `npc/entity/${type}`,
      ...(type === EntityTypes.Ylside
        ? {
            tweaks: {
              'npc/human_base/tweaks/human_base.ftl': humanBaseModel,
            },
          }
        : {}),
    })

    if (entityDefinition.mesh instanceof EntityModel) {
      entity.model = entityDefinition.mesh
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

    const resetBehavior = new ScriptSubroutine(
      'reset_behavior',
      () => {
        const { delay } = useDelay()
        return `
inc ${varResetBehaviorCounter.name} 1

if (${varResetBehaviorCounter.name} == 2) {
  set ${varIsBumping.name} 0

  // stop looking at the player after 1 second
  ${delay(1000)} behavior unstack
  ${delay(0)} settarget none
}
`
      },
      'goto',
    )

    entity.script?.subroutines.push(resize, resetBehavior)

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
      varStartedSpeakingAt,
      varIsUsingAltSkin,
      varResetBehaviorCounter,
      varIsBumping,
    )

    entity.script
      ?.on('init', () => {
        let orientation: Rotation
        if (entityDefinition.orientation !== undefined) {
          orientation = entityDefinition.orientation
        } else {
          orientation = new Rotation(0, MathUtils.degToRad(randomBetween(0, 360)), 0)
        }

        return `
setgroup consumables
behavior none
settarget none
// make sure the entity doesn't show up as a red dot on the minimap
setdetect -1

set ${varTmp.name} ^rnd_40
div ${varTmp.name} 100
inc ${varTmp.name} 0.8
set_speak_pitch ${varTmp.name}

physical radius 25
physical height 200

rotate ${orientation.toArxData().a} ${orientation.toArxData().b} ${orientation.toArxData().g}
`
      })
      .on('set_size', () => {
        return `
set ${varSize.name} ^&param1
${resize.invoke()}
`
      })
      .on('initend', () => {
        let tweaks: string[] = []

        if (entityDefinition.tweaks !== undefined) {
          tweaks = Object.entries(entityDefinition.tweaks).map(([key, value]) => {
            if (Array.isArray(value)) {
              return `tweak ${key} ${value.map((v) => `"${v}"`).join(' ')}`
            } else {
              return `tweak ${key} "${value}"`
            }
          })
        }

        const { animations } = entityDefinition

        return `
loadanim wait "${animations.idle ?? 'gargoyle_wait'}"
${animations.talk ? `loadanim talk_neutral "${animations.talk}"` : ''}
${animations.bumpFarFromConsumed ? `loadanim hit_short "${animations.bumpFarFromConsumed}"` : ''}
${animations.bumpAlmostConsumed ? `loadanim hit "${animations.bumpAlmostConsumed}"` : ''}

set ${varBaseHeight.name} ${entityDefinition.baseHeight}

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
        if (typeof entityDefinition.mesh === 'string') {
          return `use_mesh "${entityDefinition.mesh}"`
        } else {
          return ''
        }
      })
      .on('collide_npc', () => {
        const { delay } = useDelay()

        const { sounds, animations, delays } = entityDefinition

        return `
if (${varIsConsumable.name} == 1) {
  sendevent grow player "~${varSize.name}~ ~${entityDefinition.displayName}~"
  ${Collision.off}
  objecthide self on
  sendevent consumed self nop
  ${sounds.consumed ?? ''}
} else {
  if (^speaking == 0) {
    if (${varIsBumping.name} == 0) {

        set ${varStartedSpeakingAt.name} ^gameseconds
        set ${varIsBumping.name} 1
        set ${varResetBehaviorCounter.name} 0

        behavior stack
        behavior friendly
        settarget player

        if (${varAlmostConsumable.name} == 1) {
          if (${varIsUsingAltSkin.name} == 0) {
            set ${varIsUsingAltSkin.name} 1

            ${
              type === EntityTypes.Ylside
                ? `
              tweak lower "human_base"
              tweak skin "NPC_HUMAN_HERO_NAKED_BODY" "NPC_HUMAN_BASE_NAKED_BODY"
              sendevent consumed_special ${gameState.ref} "ylside_armor"
              play -op eat
            `
                : ``
            }
            ${
              type === EntityTypes.Goblin
                ? `
              tweak head "goblin_nohelm"
              sendevent consumed_special ${gameState.ref} "goblin_helmet"
              play -op eat
            `
                : ``
            }
          }
          ${delay(delays?.start?.sounds?.bumpAlmostConsumed ?? 0, false)} ${sounds.bumpAlmostConsumed ?? sounds.bumpFarFromConsumed ?? ''} ${delay(delays?.end?.sounds?.bumpAlmostConsumed ?? 0, false)} ${resetBehavior.invoke()}
          ${delay(delays?.start?.animations?.bumpAlmostConsumed ?? 0, false)} ${animations.bumpAlmostConsumed ? `playanim hit` : ''} ${delay(delays?.end?.animations?.bumpAlmostConsumed ?? 0, false)} ${resetBehavior.invoke()}
        } else {
          ${delay(delays?.start?.sounds?.bumpFarFromConsumed ?? 0, false)} ${sounds.bumpFarFromConsumed ?? ''} ${delay(delays?.end?.sounds?.bumpFarFromConsumed ?? 0, false)} ${resetBehavior.invoke()}
          ${delay(delays?.start?.animations?.bumpFarFromConsumed ?? 0, false)} ${animations.bumpFarFromConsumed ? `playanim hit_short` : ''} ${delay(delays?.end?.animations?.bumpFarFromConsumed ?? 0, false)} ${resetBehavior.invoke()}
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
  const entityDefinition = entityDefinitions[type]

  let orientation: Rotation
  if (entityDefinition.orientation !== undefined) {
    orientation = entityDefinition.orientation
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
