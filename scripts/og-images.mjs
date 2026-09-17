// Builds the social preview images, one per page and language, into public/og/.
//
// Run with `pnpm og` and commit the result. The images are generated here rather than at
// build or request time so that the site keeps its plain static output: no image service,
// nothing new to allow in the content security policy, and a shared link renders the same
// picture whether or not the visitor's chat app can reach our server.
//
// The wording comes from the locale files, so translating a page translates its preview.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const LOCALES = ['en', 'de', 'uk', 'ru', 'es']

// Which image belongs to which page, and where its words come from.
const PAGES = [
  { name: 'home', file: 'common', title: 'meta.title', description: 'meta.description' },
  { name: 'ch-zurich', file: 'ch-zurich', title: 'zh.meta.title', description: 'zh.meta.description' },
  { name: 'modelo-210', file: 'modelo-210', title: 'modelo210.metaTitle', description: 'modelo210.metaDescription' },
  { name: 'anlage-v', file: 'anlage-v', title: 'anlageV.metaTitle', description: 'anlageV.metaDescription' },
]

const WIDTH = 1200
const HEIGHT = 630
const INK = '#0f1f3d'
const INK_SOFT = '#46557a'
const BLUE = '#173f8a'
const PAPER = '#fbfcfe'
const FIELD = '#eaf1fb'
const RULE = '#c5d3e8'
const MARKER = '#ffe26a'
const FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif'

function read(locale, file) {
  return JSON.parse(readFileSync(new URL(`../i18n/locales/${locale}/${file}.json`, import.meta.url), 'utf8'))
}

function at(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object)
}

/** The brand prefix is already in the picture, so the headline does not repeat it. */
function headline(title) {
  const rest = title.replace(/^Dix\.Tax:\s*/, '')
  return rest.charAt(0).toLocaleUpperCase() + rest.slice(1)
}

/** The description is one or two sentences; the preview only has room for the first. */
function firstSentence(text) {
  const end = text.search(/[.?!]\s/)
  return end === -1 ? text : text.slice(0, end + 1)
}

/**
 * Rough width of a string. Nothing here can measure a rendered glyph, so each character
 * gets an advance typical for this kind of grotesk; the estimate only has to be close
 * enough to keep a headline out of the sheet on the right.
 */
function advance(char) {
  if ('iljtfrI.,:;!|\'()[] '.includes(char)) return 0.31
  if ('mwMW'.includes(char)) return 0.87
  if (char >= 'A' && char <= 'Z') return 0.68
  if (char >= '\u0410' && char <= '\u042f') return 0.68
  return 0.55
}

function width(text, size) {
  let sum = 0
  for (const char of text) sum += advance(char)
  return sum * size
}

/** Greedy wrap to a pixel width. */
function wrap(text, size, maxWidth, maxLines) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word
    if (width(candidate, size) > maxWidth && line) {
      if (lines.length === maxLines - 1) break
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

/** The largest of the offered sizes at which the headline still fits the space given. */
function fit(text, sizes, maxWidth, maxLines) {
  for (const size of sizes) {
    const lines = wrap(text, size, maxWidth, maxLines + 1)
    if (lines.length <= maxLines) return { size, lines }
  }
  const size = sizes[sizes.length - 1]
  return { size, lines: wrap(text, size, maxWidth, maxLines) }
}

function escape(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** A hint of the Liegenschaftenverzeichnis, so the picture looks like the product. */
function sheet(x, y) {
  const rows = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const top = y + 92 + i * 46
      const wide = 170 - (i % 3) * 30
      return `
        <rect x="${x + 28}" y="${top}" width="${wide}" height="10" rx="5" fill="${RULE}" />
        <rect x="${x + 244}" y="${top}" width="74" height="10" rx="5" fill="${i > 3 ? BLUE : RULE}" />
        <line x1="${x + 28}" y1="${top + 28}" x2="${x + 318}" y2="${top + 28}" stroke="${RULE}" stroke-width="1.5" />`
    })
    .join('')
  return `
    <g>
      <rect x="${x}" y="${y}" width="346" height="404" rx="14" fill="#ffffff" stroke="${RULE}" stroke-width="2" />
      <rect x="${x}" y="${y}" width="346" height="60" rx="14" fill="${FIELD}" />
      <rect x="${x}" y="${y + 46}" width="346" height="14" fill="${FIELD}" />
      <rect x="${x + 28}" y="${y + 22}" width="196" height="16" rx="8" fill="${BLUE}" />
      <rect x="${x + 236}" y="${y + 268}" width="90" height="118" rx="8" fill="${MARKER}" opacity="0.55" />
      ${rows}
    </g>`
}

// The text column ends well before the sheet on the right.
const COLUMN = 560

function svg({ title, subtitle }) {
  const { size, lines: titleLines } = fit(headline(title), [56, 50, 44, 38], COLUMN, 3)
  const step = Math.round(size * 1.2)
  const subLines = wrap(firstSentence(subtitle), 28, COLUMN, 2)
  // The block hangs from a fixed first baseline, clear of the wordmark above it.
  const titleTop = 196

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}" />
  <rect width="${WIDTH}" height="10" fill="${BLUE}" />
  ${sheet(752, 118)}
  <g font-family="${FONT}">
    <text x="80" y="118" font-size="34" font-weight="900" letter-spacing="3.2" fill="${INK}">DIX<tspan fill="${BLUE}">.TAX</tspan></text>
    ${titleLines
      .map(
        (line, i) =>
          `<text x="80" y="${titleTop + i * step}" font-size="${size}" font-weight="700" fill="${INK}">${escape(line)}</text>`,
      )
      .join('\n    ')}
    ${subLines
      .map(
        (line, i) =>
          `<text x="80" y="${titleTop + (titleLines.length - 1) * step + 62 + i * 38}" font-size="28" fill="${INK_SOFT}">${escape(line)}</text>`,
      )
      .join('\n    ')}
    <line x1="80" y1="530" x2="680" y2="530" stroke="${RULE}" stroke-width="2" />
    <text x="80" y="574" font-size="26" font-weight="600" fill="${BLUE}">dix.tax</text>
  </g>
</svg>`
}

const out = new URL('../public/og/', import.meta.url)
mkdirSync(out, { recursive: true })

for (const locale of LOCALES) {
  for (const page of PAGES) {
    const messages = read(locale, page.file)
    const markup = svg({
      title: at(messages, page.title),
      subtitle: at(messages, page.description),
    })
    const png = new Resvg(markup, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
    const name = `${page.name}-${locale}.png`
    writeFileSync(new URL(name, out), png)
    console.log(`${name}  ${(png.length / 1024).toFixed(0)} KB`)
  }
}
