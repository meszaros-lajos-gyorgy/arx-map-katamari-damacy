import { Color, Entity, Rotation, Vector3 } from 'arx-level-generator'
import { Collision, Material, PlayerControls, Shadow } from 'arx-level-generator/scripting/properties'
import { snakeTeleportSoundScript } from '@/sounds.js'

export function createRootSnakeTeleportDoor() {
  const entity = new Entity({
    src: 'fix_inter/snake_teleport_door',
  })
  entity.withScript()
  entity.script?.makeIntoRoot()

  entity.script?.properties.push(Collision.off, Material.water, Shadow.off)

  entity.script
    ?.on('init', () => {
      return `
loadanim action1 "snake_teleport_door_wait"
`
    })
    .on('initend', () => {
      return `
// SETNAME [description_snaketeleporter_~§leading_to~]
// TWEAK SKIN fix_inter_shot_0 fix_inter_shot_~§leading_to~
PLAYANIM -L ACTION1
// TIMERcheck -i 0 1 GOTO CHECK
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
