import { Entity } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { PlayerControls, Variable } from 'arx-level-generator/scripting/properties'

export function createGameState() {
  const gameState = Entity.marker.withScript()

  const hudLine1 = new Variable('string', 'hud_line_1', ' ')
  const hudLine2 = new Variable('string', 'hud_line_2', ' ')
  const hudLine3 = new Variable('string', 'hud_line_3', ' ')
  const hudLine4 = new Variable('string', 'hud_line_4', ' ')
  const tmp = new Variable('float', 'tmp', 0, true) // helper for calculations

  gameState.script?.properties.push(hudLine1, hudLine2, hudLine3, hudLine4, tmp)

  const redraw = new ScriptSubroutine('redraw', () => {
    return `
herosay ${hudLine1.name}
herosay ${hudLine2.name}
herosay ${hudLine3.name}
herosay ${hudLine4.name}
    `
  })

  gameState.script?.subroutines.push(redraw)

  gameState.script
    ?.on('initend', () => {
      const { loop } = useDelay()
      return `
// setmainevent and the main event in general doesn't seem to be working for markers
// https://wiki.arx-libertatis.org/Script:setmainevent
${redraw.invoke()}
${loop(1000)} ${redraw.invoke()}
      `
    })
    .on('player_resized', () => {
      return `
sendevent -g consumables size_threshold_change ~^&param1~

// display scale rounded to 2 decimals

// wholepart = (int)size
set §wholepart ^&param1

// decimaldigit1 = (int)((size - wholepart) * 10)
set ${tmp.name} ^&param1
dec ${tmp.name} §wholepart
mul ${tmp.name} 10
set §decimaldigit1 ${tmp.name}

// decimaldigit2 = (int)(((size - wholepart) * 10 - decimaldigit1) * 10)
set ${tmp.name} ^&param1
dec ${tmp.name} §wholepart
mul ${tmp.name} 10
dec ${tmp.name} §decimaldigit1
mul ${tmp.name} 10
set §decimaldigit2 ${tmp.name}

set ${hudLine1.name} "player size: ~§wholepart~.~§decimaldigit1~~§decimaldigit2~cm"

${redraw.invoke()}
      `
    })
    .on('victory', () => {
      return `
set ${hudLine2.name} [victory]
${PlayerControls.off}

${redraw.invoke()}
      `
    })

  return gameState
}
