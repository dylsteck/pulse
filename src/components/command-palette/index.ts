export { CommandPalette } from './command-palette-dialog'
export { AssetIcon } from './asset-icon'

export function openCommandPalette() {
  document.dispatchEvent(new CustomEvent('open-command-palette'))
}
