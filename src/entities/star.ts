import { Color, Entity, EntityModel, Rotation, Texture, Vector3 } from 'arx-level-generator'
import { Glow } from 'arx-level-generator/scripting/classes'
import { Collision, Interactivity, Scale, Shadow, Variable } from 'arx-level-generator/scripting/properties'
import { getLowestPolygonIdx, scaleUV, toArxCoordinateSystem, translateUV } from 'arx-level-generator/tools/mesh'
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector2 } from 'three'

type createStarProps = {
  size: number
  position: Vector3
  /**
   * default value is undefined, which means no rotation is done to the model
   */
  orientation?: Rotation
}

const texture = new Texture({
  filename: '[METAL]_HUMAN_CANDLE_CHURCH01.jpg',
  isNative: true,
})

const geometry = new SphereGeometry(1, 13, 13)
const material = new MeshBasicMaterial({
  map: texture,
})

scaleUV(new Vector2(0.1, 0.1), geometry)
translateUV(new Vector2(0.5, 0), geometry)

let mesh = new Mesh(geometry, material)
mesh = toArxCoordinateSystem(mesh)

const starModel = EntityModel.fromThreeJsObj(mesh, {
  filename: 'star.ftl',
  originIdx: getLowestPolygonIdx(geometry),
})

const glow = new Glow({
  color: Color.white,
  size: 1,
})

export function createRootStar(): Entity {
  const star = new Entity({
    src: 'fix_inter/star',
    model: starModel,
  })
  star.withScript()
  star.script?.makeIntoRoot()

  const varYOffset = new Variable('float', 'y_offset', 0)

  star.script?.properties.push(Shadow.off, Interactivity.off, Collision.off, varYOffset)

  star.script
    ?.on('init', () => {
      return `
${glow.on()}
setgroup sky
`
    })
    .on('rise', () => {
      return `
move 0 ^&param1 0
inc ${varYOffset.name} ^&param1
`
    })
    .on('reset', () => {
      return `
mul ${varYOffset.name} -1
move 0 ${varYOffset.name} 0
set ${varYOffset.name} 0
`
    })

  return star
}

export function createStar({ position, orientation, size }: createStarProps): Entity {
  const star = new Entity({
    src: 'fix_inter/star',
    position,
    orientation,
  })
  star.withScript()

  star.script?.properties.push(new Scale(size))

  return star
}
