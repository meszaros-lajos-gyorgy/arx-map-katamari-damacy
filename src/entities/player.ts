import { ArxMap, Entity } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Shadow, Speed, Variable } from 'arx-level-generator/scripting/properties'

export function enhancePlayer(player: ArxMap['player'], gameState: Entity) {
  const size = new Variable('float', 'size', 0, true) // real height of the model (centimeters)
  const oldSize = new Variable('float', 'old_size', 0, true)
  const baseHeight = new Variable('int', 'base_height', 180) // model height (centimeters)
  const scaleFactor = new Variable('float', 'scale_factor', 0, true) // value to be passed to setscale command (percentage)
  const tmp = new Variable('float', 'tmp', 0, true) // helper for calculations

  player.script?.properties.push(new Speed(1.5), Shadow.off, size, oldSize, baseHeight, scaleFactor, tmp)

  const resize = new ScriptSubroutine(
    'resize',
    () => {
      return `
// scaleFactor % = (playerSize cm / playerBaseHeight cm) * 100
set ${scaleFactor.name} ${size.name}
div ${scaleFactor.name} ${baseHeight.name}
mul ${scaleFactor.name} 100

setscale ${scaleFactor.name}
sendevent player_resized ${gameState.ref} "~${size.name}~ ~${oldSize.name}~"
`
    },
    'gosub',
  )
  player.script?.subroutines.push(resize)

  player.script
    ?.on('grow', () => {
      return `
set ${oldSize.name} ${size.name}

// size cm += args[0] cm / 50
set ${tmp.name} ^&param1
div ${tmp.name} 50
inc ${size.name} ${tmp.name}

${resize.invoke()}
sendevent consumed ${gameState.ref} "~^&param1~ ~^$param2~ ~^$param3~"
`
    })
    .on('setsize', () => {
      return `
set ${size.name} ^&param1
${resize.invoke()}
`
    })
}
