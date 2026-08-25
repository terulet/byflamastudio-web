import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = (path) => readFileSync(join(root, path));
const text = (path) => read(path).toString('utf8');
const sha256 = (path) => createHash('sha256').update(read(path)).digest('hex');
const fail = (message) => {
  throw new Error(message);
};

function verifyChecksums(manifestPath, basePath) {
  const rows = text(manifestPath).trim().split('\n').filter(Boolean);
  for (const row of rows) {
    const match = row.match(/^([a-f0-9]{64})  (.+)$/);
    if (!match) fail(`Línia SHA-256 invàlida a ${manifestPath}: ${row}`);
    const [, expected, relative] = match;
    const path = join(basePath, relative).replace(`${root}/`, '');
    if (!existsSync(join(root, path))) fail(`Falta el fitxer declarat: ${path}`);
    if (sha256(path) !== expected) fail(`SHA-256 incorrecte: ${path}`);
  }
  return rows.length;
}

const rootHashCount = verifyChecksums('SHA256SUMS.txt', '.');
const snapshotHashCount = verifyChecksums('snapshots/SHA256SUMS.txt', 'snapshots');
if (snapshotHashCount !== 19) fail(`S'esperaven 19 instantànies i n'hi ha ${snapshotHashCount}`);

const bank = JSON.parse(text('questions.candidates.json'));
const evidence = JSON.parse(text('sources.evidence.json'));
const questions = bank.questions;
const sources = evidence.sources;
const sourceIds = new Set(sources.map((source) => source.id));
const questionIds = new Set();
const allowedScopes = new Set(['roses', 'catalunya', 'espanya', 'internacional']);

if (questions.length !== 25) fail(`S'esperaven 25 preguntes i n'hi ha ${questions.length}`);
if (sources.length !== 19) fail(`S'esperaven 19 fonts i n'hi ha ${sources.length}`);

for (const question of questions) {
  if (questionIds.has(question.id)) fail(`ID duplicat: ${question.id}`);
  questionIds.add(question.id);
  if (!sourceIds.has(question.sourceId)) fail(`Font desconeguda a ${question.id}: ${question.sourceId}`);
  if (!Array.isArray(question.options) || question.options.length !== 4) fail(`Opcions invàlides: ${question.id}`);
  if (new Set(question.options).size !== 4) fail(`Opcions duplicades: ${question.id}`);
  if (!Number.isInteger(question.correctOption) || question.correctOption < 0 || question.correctOption > 3) fail(`Resposta fora de rang: ${question.id}`);
  if (question.dynamic !== true) fail(`dynamic no és true: ${question.id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(question.reviewBy) || question.reviewBy <= '2026-08-24') fail(`reviewBy invàlid: ${question.id}`);
  if (!allowedScopes.has(question.scope)) fail(`Àmbit invàlid: ${question.id} → ${question.scope}`);

  const snapshotPath = `snapshots/${question.sourceId}.txt`;
  if (!existsSync(join(root, snapshotPath))) fail(`Falta la instantània: ${snapshotPath}`);
  const snapshot = text(snapshotPath);
  if (!snapshot.includes(`source_id: ${question.sourceId}`)) fail(`source_id incoherent: ${snapshotPath}`);
  if (!snapshot.includes(`canonical_url:`)) fail(`Falta URL canònica: ${snapshotPath}`);
  if (!snapshot.includes(`published_at:`)) fail(`Falta data de publicació: ${snapshotPath}`);
  if (!snapshot.includes(question.evidenceNeedle)) fail(`No es troba l'evidència de ${question.id}: ${question.evidenceNeedle}`);
}

console.log(`Paquet vàlid: ${questions.length} preguntes, ${sources.length} fonts, ${snapshotHashCount} instantànies, ${rootHashCount} hashes d'arrel.`);

