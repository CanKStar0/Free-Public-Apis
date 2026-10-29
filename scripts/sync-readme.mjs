import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const upstreamPath = path.resolve(
  root,
  process.env.UPSTREAM_API_INDEX ?? '../github-api-directory/README.md',
);
const readmePath = path.join(root, 'README.md');
const upstreamStart = '<!-- BEGIN GENERATED API DIRECTORY -->';
const upstreamEnd = '<!-- END GENERATED API DIRECTORY -->';
const categoryStart = '<!-- BEGIN GENERATED CATEGORY INDEX -->';
const categoryEnd = '<!-- END GENERATED CATEGORY INDEX -->';

function readSection(markdown, startMarker, endMarker, sourcePath) {
  const start = markdown.indexOf(startMarker);
  const end = markdown.indexOf(endMarker);
  if (start < 0 || end < start || markdown.indexOf(startMarker, start + startMarker.length) >= 0) {
    throw new Error(`Missing, repeated, or out-of-order generated markers in ${sourcePath}`);
  }
  return markdown.slice(start + startMarker.length, end).trim();
}

function githubAnchor(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function replaceSection(markdown, startMarker, endMarker, content, sourcePath) {
  const start = markdown.indexOf(startMarker);
  const end = markdown.indexOf(endMarker);
  if (start < 0 || end < start || markdown.indexOf(startMarker, start + startMarker.length) >= 0) {
    throw new Error(`Missing, repeated, or out-of-order generated markers in ${sourcePath}`);
  }
  return `${markdown.slice(0, start + startMarker.length)}\n\n${content}\n\n${markdown.slice(end)}`;
}

const upstream = fs.readFileSync(upstreamPath, 'utf8').replace(/\r\n/g, '\n');
const readme = fs.readFileSync(readmePath, 'utf8').replace(/\r\n/g, '\n');
const apiSection = readSection(upstream, upstreamStart, upstreamEnd, upstreamPath);
const categoryHeadings = [...apiSection.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
const apiRows = apiSection.split('\n').filter((line) => line.startsWith('- ['));

if (categoryHeadings.length === 0 || apiRows.length === 0) {
  throw new Error(`The upstream index has no categories or API rows: ${upstreamPath}`);
}

const invalidRows = apiRows.filter(
  (row) => !/^- \[[^\]]+\]\(https:\/\/findfreeapi\.com\/en\/service\/[^)]+\)$/.test(row),
);
if (invalidRows.length > 0) {
  throw new Error(`Found ${invalidRows.length} API rows without canonical FreeAPI detail links.`);
}

const categoryIndex = categoryHeadings.map((heading) => `[${heading}](#${githubAnchor(heading)})`).join(' · ');
let updated = replaceSection(readme, categoryStart, categoryEnd, categoryIndex, readmePath);
updated = replaceSection(updated, upstreamStart, upstreamEnd, apiSection, readmePath);

if (process.argv.includes('--check')) {
  if (updated !== readme) {
    console.error('README is out of date. Run node scripts/sync-readme.mjs.');
    process.exitCode = 1;
  } else {
    console.log(`README is current: ${apiRows.length} API links across ${categoryHeadings.length} categories.`);
  }
} else {
  fs.writeFileSync(readmePath, updated, 'utf8');
  console.log(`Updated README with ${apiRows.length} API links across ${categoryHeadings.length} categories.`);
}
