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
    src: 'items/provisions/food_leek',
    position: new Vector3(0, -10, 250),
    orientation: new Rotation(0, 0, MathUtils.degToRad(-90)),
  })
  entity.withScript()
  entity.script?.properties.push(Shadow.off)
  // entity.script?.on('load', () => {
  //   return `use_mesh "Goblin_king\\Goblin_king.teo"`
  // })

  map.entities.push(entity)

  return map
}
