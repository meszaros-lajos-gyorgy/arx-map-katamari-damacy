import { Entity } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { PlayerControls, Variable } from 'arx-level-generator/scripting/properties'

export function createGameState() {
  const gameState = Entity.marker.withScript()

  const varHudLine1 = new Variable('string', 'hud_line_1', ' ')
  const varHudLine2 = new Variable('string', 'hud_line_2', ' ')
  const varHudLine3 = new Variable('string', 'hud_line_3', ' ')
  const varHudLine4 = new Variable('string', 'hud_line_4', ' ')
  const varTmp = new Variable('float', 'tmp', 0, true) // helper for calculations
  const varIsPlayerInLobby = new Variable('bool', 'is_player_in_lobby', false)

  gameState.script?.properties.push(varHudLine1, varHudLine2, varHudLine3, varHudLine4, varTmp, varIsPlayerInLobby)

  const redraw = new ScriptSubroutine('redraw', () => {
    return `
if (${varIsPlayerInLobby.name} == 1) {
  return
}

herosay ${varHudLine1.name}
herosay ${varHudLine2.name}
herosay ${varHudLine3.name}
herosay ${varHudLine4.name}
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
      // ^&param1 = new size of player, ^&param2 = old size of player
      return `
if (${varIsPlayerInLobby.name} == 1) {
  accept
}

sendevent -g consumables size_threshold_change "~^&param1~"

set ${varTmp.name} ^&param2
dec ${varTmp.name} ^&param1
sendevent -g sky rise "~${varTmp.name}~"

// display scale rounded to 2 decimals

// wholepart = (int)size
set §wholepart ^&param1

// decimaldigit1 = (int)((size - wholepart) * 10)
set ${varTmp.name} ^&param1
dec ${varTmp.name} §wholepart
mul ${varTmp.name} 10
set §decimaldigit1 ${varTmp.name}

// decimaldigit2 = (int)(((size - wholepart) * 10 - decimaldigit1) * 10)
set ${varTmp.name} ^&param1
dec ${varTmp.name} §wholepart
mul ${varTmp.name} 10
dec ${varTmp.name} §decimaldigit1
mul ${varTmp.name} 10
set §decimaldigit2 ${varTmp.name}

set ${varHudLine1.name} "player size: ~§wholepart~.~§decimaldigit1~~§decimaldigit2~cm"

${redraw.invoke()}
      `
    })
    .on('consumed', () => {
      return `
// display size of consumed entity rounded to 2 decimals

// wholepart = (int)size
set §wholepart ^&param1

// decimaldigit1 = (int)((size - wholepart) * 10)
set ${varTmp.name} ^&param1
dec ${varTmp.name} §wholepart
mul ${varTmp.name} 10
set §decimaldigit1 ${varTmp.name}

// decimaldigit2 = (int)(((size - wholepart) * 10 - decimaldigit1) * 10)
set ${varTmp.name} ^&param1
dec ${varTmp.name} §wholepart
mul ${varTmp.name} 10
dec ${varTmp.name} §decimaldigit1
mul ${varTmp.name} 10
set §decimaldigit2 ${varTmp.name}

if (^$param3 != '') {
  set ${varHudLine2.name} "last consumed: ~^$param2~ ~^$param3~ (~§wholepart~.~§decimaldigit1~~§decimaldigit2~cm)"
} else {
  set ${varHudLine2.name} "last consumed: ~^$param2~ (~§wholepart~.~§decimaldigit1~~§decimaldigit2~cm)"
}

${redraw.invoke()}
`
    })
    .on('victory', () => {
      const { delay } = useDelay()
      return `
${PlayerControls.off}

set ${varHudLine3.name} "[victory]"
${redraw.invoke()}

${delay(5000)} sendevent goto_lobby ${gameState.ref} nop
      `
    })
    .on('goto_lobby', () => {
      return `
set ${varIsPlayerInLobby.name} 1

set ${varHudLine1.name} " "
set ${varHudLine2.name} " "
set ${varHudLine3.name} " "
set ${varHudLine4.name} " "
`
    })
    .on('goto_level1', () => {
      return `
set ${varIsPlayerInLobby.name} 0
`
    })

  return gameState
}
