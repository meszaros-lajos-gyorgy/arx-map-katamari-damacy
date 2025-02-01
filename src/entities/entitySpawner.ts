import { Entity, Vector3 } from 'arx-level-generator'
import { Variable } from 'arx-level-generator/scripting/properties'
import { Vector2 } from 'three'
import { EntityTypes } from '@/entities/entity.js'

export type EntitySpawnProps = {
  position: Vector3
  entity: EntityTypes
  size: number | Vector2
}

export function createEntitySpawner({ position, entity, size }: EntitySpawnProps): Entity {
  const spawner = Entity.marker.withScript().at({
    position,
  })

  const varIdOfSpawnedEntity = new Variable('string', 'id_of_spawned_entity', '', true)

  spawner.script?.properties.push(varIdOfSpawnedEntity)

  spawner.script
    ?.on('spawn_entity', () => {
      return `
spawn npc entity/${entity}/${entity}.teo self
set ${varIdOfSpawnedEntity.name} ^last_spawned
${
  typeof size === 'number'
    ? `
sendevent set_size ^last_spawned ${size}
`
    : `
set §min ${size.x}
set §max ${size.y}
set §diff §max
dec §diff §min
set §size ^rnd_~§diff~
inc §size §min
sendevent set_size ^last_spawned ~§size~
`
}
`
    })
    .on('remove_entity', () => {
      return `
if (${varIdOfSpawnedEntity.name} != "") {
  destroy ~${varIdOfSpawnedEntity.name}~
  set ${varIdOfSpawnedEntity.name} ""
}
`
    })

  return spawner
}
