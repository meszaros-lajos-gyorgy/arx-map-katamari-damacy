import { ArxMap, Entity, QUADIFY, Rotation, SHADING_SMOOTH, Texture, Vector3 } from 'arx-level-generator'
import { createBox, createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { Shadow } from 'arx-level-generator/scripting/properties'
import { MathUtils, Vector2 } from 'three'

export function createMeasurementRoom(): ArxMap {
  const map = new ArxMap()

  map.polygons.addThreeJsMesh(
    createPlaneMesh({
      size: new Vector2(500, 1000),
    }),
    {
      tryToQuadify: QUADIFY,
      shading: SHADING_SMOOTH,
    },
  )

  map.polygons.addThreeJsMesh(
    createBox({
      position: new Vector3(0, -50, 300),
      size: new Vector3(100, 100, 100),
      texture: Texture.uvDebugTexture,
    }),
    {
      tryToQuadify: QUADIFY,
      shading: SHADING_SMOOTH,
    },
  )

  map.polygons.addThreeJsMesh(
    createBox({
      position: new Vector3(0, -150, 300),
      size: new Vector3(100, 100, 100),
      texture: Texture.uvDebugTexture,
    }),
    {
      tryToQuadify: QUADIFY,
      shading: SHADING_SMOOTH,
    },
  )

  map.polygons.addThreeJsMesh(
    createBox({
      position: new Vector3(0, -250, 300),
      size: new Vector3(100, 100, 100),
      texture: Texture.uvDebugTexture,
    }),
    {
      tryToQuadify: QUADIFY,
      shading: SHADING_SMOOTH,
    },
  )

  const entity = new Entity({
    // src: 'items/provisions/food_leek',
    // src: 'items/provisions/carrot',
    src: 'items/provisions/cheese',
    // src: 'npc/goblin_base',
    // src: 'npc/human_base',

    position: new Vector3(0, 0, 230),
    // orientation: new Rotation(0, 0, MathUtils.degToRad(-90)),
  })
  entity.withScript()
  entity.script?.properties.push(Shadow.off)
  entity.script?.on('init', () => {
    return `
// setweapon none
// loadanim die gargoyle_wait
// dodamage self 200

// tweak lower "human_ylside"
// tweak skin "npc_human_base_hero_head" "npc_human_ylside_head"
`
  })
  // entity.script?.on('load', () => {
  //   // return `use_mesh "goblin_king/goblin_king.teo"`
  //   return `use_mesh "goblin_lord/goblin_lord.teo"`
  // })

  map.entities.push(entity)

  return map
}
