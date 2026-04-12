#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Constants ──────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = ['en', 'pt-BR']
const SUPPORTED_UNITS     = ['mm']

const DEFAULT_CONFIG = {
  language:               'en',
  defaultColor:           '#4a9eff',
  units:                  'mm',
  projectName:            'NomiCAD',
  sidebarBackgroundColor: '#13132b',
  sidebarTextColor:       '#e0e0f0',
}

const CONFIG_FILENAME = 'nomicad.config.json'
const CONFIG_PATH     = join(process.cwd(), CONFIG_FILENAME)

// ── Config I/O ─────────────────────────────────────────────────────────────

function readConfig() {
  if (!existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG }
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {
    console.error(`Error: Could not parse ${CONFIG_FILENAME} — check for JSON syntax errors.`)
    process.exit(1)
  }
}

function writeConfig(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

/**
 * Ensures a config file exists before a set/reset command writes to it.
 * If it does not exist it is created from defaults (not from the example
 * template) so the file is always valid before a partial key update.
 */
function ensureConfig() {
  if (!existsSync(CONFIG_PATH)) {
    writeConfig({ ...DEFAULT_CONFIG })
    console.log(`Created ${CONFIG_FILENAME} with default values.`)
  }
}

// ── Validators ─────────────────────────────────────────────────────────────

function assertLanguage(value) {
  if (!SUPPORTED_LANGUAGES.includes(value)) {
    console.error(
      `Error: Unsupported language "${value}".\n` +
      `Supported values: ${SUPPORTED_LANGUAGES.join(', ')}`,
    )
    process.exit(1)
  }
}

function assertColor(value) {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
    console.error(
      `Error: Invalid color "${value}".\n` +
      `Expected a 6-digit hex color, e.g. "#2e67a9".`,
    )
    process.exit(1)
  }
}

function assertUnits(value) {
  if (!SUPPORTED_UNITS.includes(value)) {
    console.error(
      `Error: Unsupported unit "${value}".\n` +
      `Supported values: ${SUPPORTED_UNITS.join(', ')}`,
    )
    process.exit(1)
  }
}

// ── Commands ───────────────────────────────────────────────────────────────

function cmdInit() {
  if (existsSync(CONFIG_PATH)) {
    console.log(`${CONFIG_FILENAME} already exists — no changes made.`)
    return
  }

  const src = join(__dirname, '..', 'nomicad.config.example.json')
  copyFileSync(src, CONFIG_PATH)
  console.log(`Created ${CONFIG_FILENAME}`)
  console.log('Edit it to set language ("en" or "pt-BR"), defaultColor, and units.')
}

function cmdConfigGet() {
  const config = readConfig()
  console.log(JSON.stringify(config, null, 2))
}

function cmdConfigSet(key, value) {
  if (!key) {
    console.error('Usage: npx nomicad config set <key> <value>')
    console.error('Keys:  language, defaultColor, units')
    process.exit(1)
  }
  if (value === undefined) {
    console.error(`Error: Missing value for "${key}".`)
    console.error(`Usage: npx nomicad config set ${key} <value>`)
    process.exit(1)
  }

  switch (key) {
    case 'language':               assertLanguage(value); break
    case 'defaultColor':           assertColor(value);    break
    case 'units':                  assertUnits(value);    break
    case 'projectName':            /* any non-empty string is valid */ break
    case 'sidebarBackgroundColor': assertColor(value);    break
    case 'sidebarTextColor':       assertColor(value);    break
    default:
      console.error(
        `Error: Unknown config key "${key}".\n` +
        `Supported keys: language, defaultColor, units, projectName, sidebarBackgroundColor, sidebarTextColor`,
      )
      process.exit(1)
  }

  ensureConfig()
  const config = readConfig()
  config[key] = value
  writeConfig(config)
  console.log(`  ${key}: ${value}`)
}

function cmdConfigReset() {
  writeConfig({ ...DEFAULT_CONFIG })
  console.log(`Reset ${CONFIG_FILENAME} to default values.`)
  console.log(JSON.stringify(DEFAULT_CONFIG, null, 2))
}

// ── Help ───────────────────────────────────────────────────────────────────

function printHelp() {
  console.log('NomiCAD CLI\n')
  console.log('Usage:  npx nomicad <command> [options]\n')
  console.log('Commands:')
  console.log('  init                                  Create nomicad.config.json from the built-in template')
  console.log('  config get                            Print the current configuration')
  console.log('  config set language <value>                  Set language  (supported: en, pt-BR)')
  console.log('  config set defaultColor <hex>               Set UI accent color and default object color (e.g. "#2e67a9")')
  console.log('  config set units <value>                    Set units  (supported: mm)')
  console.log('  config set projectName <name>               Set the display name shown in the sidebar header')
  console.log('  config set sidebarBackgroundColor <hex>     Set sidebar background color (e.g. "#1e1e2f")')
  console.log('  config set sidebarTextColor <hex>           Set sidebar text color (e.g. "#ffffff")')
  console.log('  config reset                                Restore all values to defaults\n')
  console.log('Examples:')
  console.log('  npx nomicad init')
  console.log('  npx nomicad config get')
  console.log('  npx nomicad config set language pt-BR')
  console.log('  npx nomicad config set defaultColor "#2e67a9"')
  console.log('  npx nomicad config set projectName "Maker Tags"')
  console.log('  npx nomicad config set units mm')
  console.log('  npx nomicad config reset')
}

// ── Dispatch ───────────────────────────────────────────────────────────────

const [,, command, sub, key, value] = process.argv

if (command === 'init') {
  cmdInit()
} else if (command === 'config') {
  if (sub === 'get') {
    cmdConfigGet()
  } else if (sub === 'set') {
    cmdConfigSet(key, value)
  } else if (sub === 'reset') {
    cmdConfigReset()
  } else {
    const got = sub ? `"${sub}"` : '(none)'
    console.error(`Error: Unknown config subcommand ${got}. Expected: get, set, reset`)
    process.exit(1)
  }
} else {
  printHelp()
}
