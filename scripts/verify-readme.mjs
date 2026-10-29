import fs from 'node:fs';

const readme = fs.readFileSync('README.md', 'utf8').replace(/\r\n/g, '\n');
const markers = {
  categories: ['<!-- BEGIN GENERATED CATEGORY INDEX -->', '<!-- END GENERATED CATEGORY INDEX -->'],
  apis: ['<!-- BEGIN GENERATED API DIRECTORY -->', '<!-- END GENERATED API DIRECTORY -->'],
};

function section(name) {
  const [startMarker, endMarker] = markers[name];
  const start = readme.indexOf(startMarker);
  const end = readme.indexOf(endMarker);
  if (
    start < 0 ||
    end < start ||
    readme.indexOf(startMarker, start + startMarker.length) >= 0 ||
    readme.indexOf(endMarker, end + endMarker.length) >= 0
  ) {
    throw new Error(`README has missing, repeated, or out-of-order ${name} markers.`);
  }
  return readme.slice(start + startMarker.length, end).trim();
}

function anchor(title) {
  return title.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

const categoryIndex = section('categories');
const apiDirectory = section('apis');
const categories = [...apiDirectory.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
const rows = apiDirectory.split('\n').filter((line) => line.startsWith('- ['));
const links = rows.map((row) => row.match(/^- \[[^\]]+\]\(https:\/\/findfreeapi\.com\/en\/service\/([^)]+)\)$/));

if (categories.length === 0 || rows.length === 0 || links.some((link) => link === null)) {
  throw new Error('README must contain categories and API rows linking to canonical FreeAPI detail pages.');
}

const uniqueSlugs = new Set(links.map((link) => link[1]));
if (uniqueSlugs.size !== links.length) {
  throw new Error('README contains duplicate FreeAPI detail-page slugs.');
}

const missingCategoryLinks = categories.filter((category) => !categoryIndex.includes(`[${category}](#${anchor(category)})`));
if (missingCategoryLinks.length > 0) {
  throw new Error(`Category navigation is missing ${missingCategoryLinks.length} links.`);
}

console.log(`README is structurally valid: ${links.length} API links across ${categories.length} categories.`);
