import { mkdirSync, readdirSync, renameSync, writeFileSync } from 'fs'
import { join } from 'path'

const out = join(import.meta.dirname, '..', 'out')
const sub = join(out, 'personalize')

mkdirSync(sub, { recursive: true })

for (const e of readdirSync(out)) {
  if (e === 'personalize') continue
  renameSync(join(out, e), join(sub, e))
}

writeFileSync(join(out, 'index.html'), '<!DOCTYPE html><meta charset="utf-8"><title>Redirect</title><meta http-equiv="refresh" content="0;URL=personalize/"><link rel="canonical" href="personalize/">')
