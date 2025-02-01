import { Entity, Vector3 } from 'arx-level-generator'
import { Variable } from 'arx-level-generator/scripting/properties'
import { Vector2 } from 'three'
import { EntityTypes } from '@/entities/entity.js'
import { NonEmptyArray } from '@/types.js'

export type EntitySpawnProps = {
  position: Vector3
  entities: NonEmptyArray<EntityTypes>
  size: number | Vector2
}

export function createEntitySpawner({ position, entities, size }: EntitySpawnProps): Entity {
  const spawner = Entity.marker.withScript().at({
    position,
  })

  const varIdOfSpawnedEntity = new Variable('string', 'id_of_spawned_entity', '', true)

  spawner.script?.properties.push(varIdOfSpawnedEntity)

  spawner.script
    ?.on('spawn_entity', () => {
      return `
set §type ^rnd_${entities.length}

${entities
  .map((entity, index) => {
    return `if (§type == ${index}) spawn npc entity/${entity}/${entity}.teo self`
  })
  .join('\n')}

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
