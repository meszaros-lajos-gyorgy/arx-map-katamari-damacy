import { Entity, Rotation, Vector3 } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Collision, Material, Shadow, Variable } from 'arx-level-generator/scripting/properties'

export function createRootSnakeTeleportDoor() {
  const entity = new Entity({
    src: 'fix_inter/snake_teleport_door',
  })
  entity.withScript()
  entity.script?.makeIntoRoot()

  const varScale = new Variable('int', 'scale', 0)

  entity.script?.properties.push(Collision.off, Material.water, Shadow.off, varScale)

  const scale = new ScriptSubroutine(
    'scale',
    () => {
      return `
inc ${varScale.name} 1
setscale ${varScale.name}
`
    },
    'goto',
  )

  const appear = new ScriptSubroutine(
    'appear',
    () => {
      return `
object_hide self no
TIMERscale -m 100 1 ${scale.invoke()}
TIMERcheck off
`
    },
    'goto',
  )

  const check = new ScriptSubroutine(
    'check',
    () => {
      return `${appear.invoke()}`
    },
    'goto',
  )

  entity.script?.subroutines.push(scale, appear, check)

  entity.script
    ?.on('init', () => {
      return `
loadanim action1 "snake_teleport_door_wait"
object_hide self yes
setscale ${varScale.name}
`
    })
    .on('initend', () => {
      return `
// TWEAK SKIN fix_inter_shot_0 fix_inter_shot_~§leading_to~
playanim -l action1
TIMERcheck -im 0 1000 ${check.invoke()}
`
    })

  return entity
}

type createSnakeTeleportDoorProps = {
  position?: Vector3
  orientation?: Rotation
}

export function createSnakeTeleportDoor({ position, orientation }: createSnakeTeleportDoorProps = {}) {
  const entity = new Entity({
    src: 'fix_inter/snake_teleport_door',
    position,
    orientation,
  })

  entity.withScript()

  entity.script?.on('init', () => {
    return `
// SET §local_teleporter 0
// SET §leading_to 3
// SET £destination MARKER_0324
`
  })

  return entity
}
