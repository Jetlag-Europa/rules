import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const docsDir = join(root, 'src/content/docs');

const masterSource = readFileSync(join(root, 'original_rules.md'), 'utf8');
const gameSource = readFileSync(join(root, 'game_specific_ruledoc.txt'), 'utf8');

function writeDoc(path, frontmatter, body) {
  const fullPath = join(docsDir, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  const fm = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (value && typeof value === 'object') {
        return `${key}:\n${Object.entries(value)
          .map(([nestedKey, nestedValue]) => `  ${nestedKey}: ${nestedValue}`)
          .join('\n')}`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    })
    .join('\n');
  writeFileSync(fullPath, `---\n${fm}\n---\n\n${body.trim()}\n`, 'utf8');
}

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex === -1) throw new Error(`Could not find start marker: ${start}`);
  const endIndex = end ? source.indexOf(end, startIndex + start.length) : source.length;
  if (end && endIndex === -1) throw new Error(`Could not find end marker: ${end}`);
  return source.slice(startIndex, endIndex).trim();
}

function stripFirstHeading(markdown) {
  return markdown.replace(/^#{1,6} .+\n+/, '').trim();
}

function promoteHeadings(markdown, levels = 1) {
  return markdown.replace(/^(#{2,6}) /gm, (match, hashes) => {
    const nextLevel = Math.max(2, hashes.length - levels);
    return `${'#'.repeat(nextLevel)} `;
  });
}

function page(title, order, body, extra = {}) {
  return {
    frontmatter: {
      title,
      sidebar: { order },
      ...extra,
    },
    body,
  };
}

function writeMasterSet(prefix, archived = false) {
  const archivedFields = archived
    ? {
        pagefind: false,
        banner: {
          content:
            'This is an archived master rules version. For current play, use <a href="/master/latest/">the latest master rules</a> unless your game document says otherwise.',
        },
      }
    : {};

  const section1 = sliceBetween(masterSource, '# Section 1 - Quickstart Guide', '# Section 2 - Setting Up Your Map');
  const section2 = sliceBetween(masterSource, '# Section 2 - Setting Up Your Map', '# Section 3 - Seeking');
  const section3 = sliceBetween(masterSource, '# Section 3 - Seeking', '# Section 4 - Hiding');
  const section4 = sliceBetween(masterSource, '# Section 4 - Hiding', '# Section 5 - General Tips');
  const section5 = sliceBetween(masterSource, '# Section 5 - General Tips', '# Section 6 - Experimental Game Designs');
  const section6 = sliceBetween(masterSource, '# Section 6 - Experimental Game Designs');

  const seekingIntro = sliceBetween(section3, '# Section 3 - Seeking', '## Matching Questions');
  const matching = sliceBetween(section3, '## Matching Questions', '## Measuring Questions');
  const measuring = sliceBetween(section3, '## Measuring Questions', '## Radar Questions');
  const radar = sliceBetween(section3, '## Radar Questions', '## Thermometer Questions');
  const thermometer = sliceBetween(section3, '## Thermometer Questions', '## Photo Questions');
  const photo = sliceBetween(section3, '## Photo Questions', '## Tentacle Questions');
  const tentacle = sliceBetween(section3, '## Tentacle Questions');

  const hidingIntro = sliceBetween(section4, '# Section 4 - Hiding', '## The Hider Deck');
  const hiderDeck = sliceBetween(section4, '## The Hider Deck', '### Curses');
  const curses = sliceBetween(section4, '### Curses');

  const pages = [
    ['index.md', page('Master Rules', 0, masterIndex(prefix, archived), archivedFields)],
    ['quickstart.md', page('Quickstart Guide', 1, stripFirstHeading(section1), archivedFields)],
    ['map-setup.md', page('Setting Up Your Map', 2, stripFirstHeading(section2), archivedFields)],
    ['seeking.md', page('Seeking Overview', 3, stripFirstHeading(seekingIntro), archivedFields)],
    ['matching-questions.md', page('Matching Questions', 4, promoteHeadings(stripFirstHeading(matching)), archivedFields)],
    ['measuring-questions.md', page('Measuring Questions', 5, promoteHeadings(stripFirstHeading(measuring)), archivedFields)],
    ['radar-questions.md', page('Radar Questions', 6, stripFirstHeading(radar), archivedFields)],
    ['thermometer-questions.md', page('Thermometer Questions', 7, stripFirstHeading(thermometer), archivedFields)],
    ['photo-questions.md', page('Photo Questions', 8, promoteHeadings(stripFirstHeading(photo)), archivedFields)],
    ['tentacle-questions.md', page('Tentacle Questions', 9, promoteHeadings(stripFirstHeading(tentacle)), archivedFields)],
    ['hiding.md', page('Hiding', 10, stripFirstHeading(hidingIntro), archivedFields)],
    ['hider-deck.md', page('The Hider Deck', 11, promoteHeadings(stripFirstHeading(hiderDeck)), archivedFields)],
    ['curses.md', page('Curses', 12, promoteHeadings(stripFirstHeading(curses), 2), archivedFields)],
    ['general-tips.md', page('General Tips', 13, stripFirstHeading(section5), archivedFields)],
    ['experimental-game-designs.md', page('Experimental Game Designs', 14, stripFirstHeading(section6), archivedFields)],
  ];

  for (const [file, { frontmatter, body }] of pages) {
    writeDoc(`${prefix}/${file}`, frontmatter, body);
  }
}

function masterIndex(prefix, archived) {
  const versionName = prefix.endsWith('latest')
    ? 'latest version'
    : prefix.split('/').at(-1).replace('-', '.');
  return `These pages contain the ${versionName} of the master Hide and Seek rules.

## Rulebook Sections

- [Quickstart Guide](./quickstart/)
- [Setting Up Your Map](./map-setup/)
- [Seeking Overview](./seeking/)
- [Matching Questions](./matching-questions/)
- [Measuring Questions](./measuring-questions/)
- [Radar Questions](./radar-questions/)
- [Thermometer Questions](./thermometer-questions/)
- [Photo Questions](./photo-questions/)
- [Tentacle Questions](./tentacle-questions/)
- [Hiding](./hiding/)
- [The Hider Deck](./hider-deck/)
- [Curses](./curses/)
- [General Tips](./general-tips/)
- [Experimental Game Designs](./experimental-game-designs/)

${archived ? 'For current play, start from the [latest master rules](/master/latest/).' : 'Older snapshots are available from the [master rules archive](/master/archive/).'}`;
}

function lineSection(lines, startTitle, endTitle) {
  const start = lines.findIndex((line) => line.trim() === startTitle);
  if (start === -1) throw new Error(`Could not find game section: ${startTitle}`);
  const end = endTitle ? lines.findIndex((line, index) => index > start && line.trim() === endTitle) : lines.length;
  if (endTitle && end === -1) throw new Error(`Could not find game section end: ${endTitle}`);
  return lines.slice(start + 1, end).join('\n').trim();
}

function asParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean).join('\n'))
    .filter(Boolean)
    .join('\n\n');
}

function bulletLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join('\n');
}

function gameSeekingPage(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const featureIndex = lines.findIndex((line) => line === 'Feature');
  const beforeFeature = lines.slice(0, featureIndex);
  const featureRows = [];
  for (let i = featureIndex + 2; i < lines.length; i += 2) {
    if (lines[i]?.startsWith('* =')) break;
    if (!lines[i + 1]) break;
    featureRows.push([lines[i], lines[i + 1]]);
  }

  const table = [
    '| Feature | Definition |',
    '| --- | --- |',
    ...featureRows.map(([feature, definition]) => `| ${feature} | ${definition} |`),
  ].join('\n');

  const thermometerIndex = beforeFeature.findIndex((line) => line === 'The following thermometers are available:');
  const radarIndex = beforeFeature.findIndex((line) => line === 'The following radar questions are available:');
  const customIndex = beforeFeature.findIndex((line) => line === 'Custom');
  const tentacleIndex = beforeFeature.findIndex((line) => line === 'The following tentacle questions are available:');
  const featureIntroIndex = beforeFeature.findIndex((line) => line === 'For matching and measuring questions, only features located within the game area count. The source of authority for locations is Google Maps, and measuring should be done to the pin on the map unless otherwise specified.');

  const intro = beforeFeature.slice(0, thermometerIndex).join('\n\n');
  const thermometers = beforeFeature.slice(thermometerIndex + 1, radarIndex);
  const radars = beforeFeature.slice(radarIndex + 1, customIndex);
  const tentacles = beforeFeature.slice(tentacleIndex + 1, featureIntroIndex);
  const featureIntro = beforeFeature.slice(featureIntroIndex, featureIndex).join('\n\n');

  return `${intro}

## Thermometer Questions

${thermometers.map((line) => `- ${line}`).join('\n')}

## Radar Questions

${radars.map((line) => `- ${line}`).join('\n')}

## Tentacle Questions

${tentacles.map((line) => `- ${line}`).join('\n')}

## Feature Definitions

${featureIntro}

${table}

*Covrigarie is not in the original home game and is special to H+S Bucharest 2026.*`;
}

function formatGameHeadings(text) {
  const headings = new Set([
    'Transport Modes Allowed',
    'Custom',
    'Deck Modifications for Accessible Mode',
    'Power-ups',
    'Photo Questions',
    'Matching Questions',
    'Curses',
    'Distances and Coordinates',
    'Matching and Tentacles',
  ]);
  const smallHeadings = [
    'Tallest Building Visible from Transit Station / Any Building Visible from Transit Station',
    'Tallest Structure in Your Current Sightline',
    'Trace Nearest Street/Path',
    'Widest Street',
    'Transit Line',
    "Station Name's Length",
  ];

  return text
    .split('\n')
    .map((raw) => {
      const line = raw.trim();
      if (!line) return '';
      const cleanLine = line.replace(/^[^\p{L}\p{N}]+ /u, '');
      if (headings.has(line)) return `## ${line}`;
      if (smallHeadings.includes(cleanLine)) return `### ${line}`;
      return line;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatDeckPage(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const removedStart = lines.findIndex((line) => line.startsWith('The following cards from the Base Game'));
  const addedStart = lines.findIndex((line) => line.startsWith('The following cards from Expansion Pack'));
  const footnoteStart = lines.findIndex((line) => line.startsWith('* ='));
  const curseModStart = lines.findIndex((line) => line === 'Curse Modifications');

  const removed = lines.slice(removedStart + 1, addedStart);
  const added = lines.slice(addedStart + 1, footnoteStart);
  const footnote = lines[footnoteStart];
  const curseModifications = lines.slice(curseModStart + 1).join('\n\n');

  return `## Removed From Base Game

${removed.map((line) => `- ${line}`).join('\n')}

## Added From Expansion Pack Volume 1

${added.map((line) => `- ${line}`).join('\n')}

${footnote}

## Curse Modifications

${curseModifications}`;
}

function formatClarifications(text) {
  const lines = text.split('\n');
  const headings = new Set([
    'Power-ups',
    'Photo Questions',
    'Matching Questions',
    'Curses',
    'Distances and Coordinates',
    'Matching and Tentacles',
  ]);
  const smallHeadings = [
    'Tallest Building Visible from Transit Station / Any Building Visible from Transit Station',
    'Tallest Structure in Your Current Sightline',
    'Trace Nearest Street/Path',
    'Widest Street',
    'Transit Line',
    "Station Name's Length",
  ];

  const output = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) {
      output.push('');
      continue;
    }

    if (line === 'When the game') {
      output.push(`| When the game says... | It's a hit when Google Maps says... | It's a miss when Google Maps says... |
| --- | --- | --- |
| 500 m | 500 m | 501 m |
| 1 km | 1 km | 1.1 km |
| 2 km | 2 km | 2.1 km |
| 5 km | 5 km | 5.1 km |
| 10 km | 10 km | 11 km |
| 15 km | 15 km | 16 km |
| 25 km | 25 km | 26 km |`);
      while (i < lines.length && lines[i].trim() !== '26 km') i += 1;
      while (i + 1 < lines.length && lines[i + 1].trim() === '26 km') i += 1;
      continue;
    }

    const cleanLine = line.replace(/^[^\p{L}\p{N}]+ /u, '');
    const curseMatch = line.match(/^(.+?Curse of [^:]+):\s*(.+)$/u);
    if (headings.has(line)) {
      output.push(`## ${line}`);
    } else if (smallHeadings.includes(cleanLine)) {
      output.push(`### ${line}`);
    } else if (curseMatch) {
      output.push(`### ${curseMatch[1]}`);
      output.push(curseMatch[2]);
    } else {
      output.push(line);
    }
  }

  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function writeGamePages() {
  const lines = gameSource.split('\n');
  const intro = lines.slice(0, lines.findIndex((line) => line.trim() === 'Summary')).join('\n').trim();
  const summary = lineSection(lines, 'Summary', 'Amendments');
  const hiding = lineSection(lines, 'Hiding', 'The Endgame');
  const endgame = lineSection(lines, 'The Endgame', 'Transport and Tickets');
  const transport = lineSection(lines, 'Transport and Tickets', 'Seeking');
  const seeking = lineSection(lines, 'Seeking', 'Deck Composition');
  const deck = lineSection(lines, 'Deck Composition', 'Accessible Mode');
  const accessibility = lineSection(lines, 'Accessible Mode', 'Other clarifications');
  const clarifications = lineSection(lines, 'Other clarifications');

  const base = 'games/bucharest-2026';
  const common = {
    description: 'Game-specific rules for Hide + Seek Bucharest on 21 June 2026.',
  };

  writeDoc(`${base}/index.md`, {
    title: 'Hide + Seek Bucharest 2026',
    ...common,
    sidebar: { order: 0, label: 'Overview' },
  }, `${asParagraphs(intro)}

## Rule Pages

- [Schedule and Win Condition](./schedule/)
- [Hiding and Endgame](./hiding/)
- [Transport and Tickets](./transport/)
- [Seeking Changes](./seeking/)
- [Deck Changes](./deck/)
- [Accessible Mode](./accessibility/)
- [Clarifications](./clarifications/)

## Base Rules

This game is based on the [latest master rules](/master/latest/) unless a game-specific page says otherwise.`);

  writeDoc(`${base}/schedule.md`, {
    title: 'Schedule and Win Condition',
    ...common,
    sidebar: { order: 1 },
  }, asParagraphs(summary));

  writeDoc(`${base}/hiding.md`, {
    title: 'Hiding and Endgame',
    ...common,
    sidebar: { order: 2 },
  }, `## Hiding

${bulletLines(hiding)}

## Endgame

${bulletLines(endgame)}`);

  writeDoc(`${base}/transport.md`, {
    title: 'Transport and Tickets',
    ...common,
    sidebar: { order: 3 },
  }, formatGameHeadings(asParagraphs(transport)));

  writeDoc(`${base}/seeking.md`, {
    title: 'Seeking Changes',
    ...common,
    sidebar: { order: 4 },
  }, gameSeekingPage(seeking));

  writeDoc(`${base}/deck.md`, {
    title: 'Deck Changes',
    ...common,
    sidebar: { order: 5 },
  }, formatDeckPage(deck));

  writeDoc(`${base}/accessibility.md`, {
    title: 'Accessible Mode',
    ...common,
    sidebar: { order: 6 },
  }, formatGameHeadings(asParagraphs(accessibility)));

  writeDoc(`${base}/clarifications.md`, {
    title: 'Clarifications',
    ...common,
    sidebar: { order: 7 },
  }, formatClarifications(clarifications));
}

function writeStaticPages() {
  writeDoc('index.md', {
    title: 'Rules Library',
    description: 'Browse master rules and permanent game-specific rule documents.',
    sidebar: { order: 0 },
  }, `## Start Here

- [Latest Master Rules](/master/latest/)
- [Master Rules Archive](/master/archive/)
- [Hide + Seek Bucharest 2026](/games/bucharest-2026/)
- [New Game Template](/templates/game-rules-template/)

Use the search box in the header to search the published rule pages.`);

  writeDoc('master/archive.md', {
    title: 'Master Rules Archive',
    description: 'Older master rule snapshots that remain accessible without appearing in the main sidebar.',
    sidebar: { order: 99 },
  }, `Only the latest master rules are shown in the main sidebar. Archived versions remain available from this page and by direct link.

## Versions

- [Latest](/master/latest/)
- [v1.0](/master/v1-0/)

Archived pages are currently excluded from search to avoid duplicate results. Remove \`pagefind: false\` from archived page frontmatter if you want archived versions to appear in search results.`);

  writeDoc('templates/game-rules-template.md', {
    title: 'Game Rules Template',
    description: 'Copy this structure when creating a new game-specific rule document.',
    sidebar: { order: 1 },
    pagefind: false,
  }, `Use this as the structure for a new game folder.

\`\`\`text
games/
  city-year/
    index.md
    schedule.md
    hiding.md
    transport.md
    seeking.md
    deck.md
    accessibility.md
    clarifications.md
\`\`\`

Each page should include frontmatter:

\`\`\`md
---
title: Hide + Seek City 2026
description: Game-specific rules for Hide + Seek City on 1 January 2026.
sidebar:
  order: 0
---
\`\`\`

Keep the overview page short and link to the detailed pages.`);
}

writeStaticPages();
writeMasterSet('master/latest');
writeMasterSet('master/v1-0', true);
writeGamePages();
