#!/usr/bin/env node
import { existsSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const [, , command] = process.argv

if (command === 'init') {
  const dest = join(process.cwd(), 'nomicad.config.json')

  if (existsSync(dest)) {
    console.log('nomicad.config.json already exists — no changes made.')
    process.exit(0)
  }

  const src = join(__dirname, '..', 'nomicad.config.example.json')
  copyFileSync(src, dest)
  console.log('Created nomicad.config.json')
  console.log('Edit it to set language ("en" or "pt-BR"), defaultColor, and units.')
} else {
  console.log('NomiCAD CLI')
  console.log('')
  console.log('Commands:')
  console.log('  init    Create nomicad.config.json from the built-in template')
  console.log('')
  console.log('Usage:')
  console.log('  npx nomicad init')
}
