import { Entity, Light, Zone } from 'arx-level-generator'
import { Mesh } from 'three'

export type Place = {
  entities: Entity[]
  lights: Light[]
  meshes: Mesh[]
  zones: Zone[]
}
