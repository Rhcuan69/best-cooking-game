// Sizzle & Serve — the hand-in program for make.fun's best cooking game bounty
// (Node 22, standard library only). The game itself is plain static files under
// game/ (game/index.html plus its ES modules; no library, no network request),
// and the screenshots are real renders of that code. This program copies both
// folders beside it into /output and writes /output/dossier.json, the summary
// the judge reads, using the vendored make.fun library.
//
// Run it outside the grader's container with MAKEFUN_OUTPUT_DIR standing in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// It writes the same bytes every run: nothing here reads the clock or rolls dice.
// Determinism matters because the grader runs this program twice and compares
// the two outputs byte for byte.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps, as the kit's gate spells them: the dossier text is capped
// at 160 KiB; the rest refuse an entry the scorer would refuse anyway (more
// than 4 screenshots, one over 256 KiB; game/ over 993 files or 48 MiB, or a
// path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
