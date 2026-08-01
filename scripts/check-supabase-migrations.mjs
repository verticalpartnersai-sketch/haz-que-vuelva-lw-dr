#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const migrationDirectory = path.resolve(
  process.argv[2] ?? "supabase/migrations",
);
const fileNamePattern = /^(\d{12})_([a-z0-9_]+)\.sql$/;

const failures = [];

function fail(message) {
  failures.push(message);
}

function stripComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ");
}

function normalize(sql) {
  return stripComments(sql).replace(/\s+/g, " ").trim().toLowerCase();
}

function createdPublicTables(sql) {
  return [
    ...sql.matchAll(
      /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z_][a-z0-9_]*)/gi,
    ),
  ].map((match) => match[1].toLowerCase());
}

function securityDefinerFunctions(sql, fileName) {
  const matches = [];
  const starts = [
    ...sql.matchAll(
      /create\s+or\s+replace\s+function\s+((?:public|app_private)\.([a-z_][a-z0-9_]*))\s*\(/gi,
    ),
  ];

  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index];
    const end = starts[index + 1]?.index ?? sql.length;
    const block = sql.slice(start.index, end);

    if (/\bsecurity\s+definer\b/i.test(block)) {
      matches.push({
        block,
        fileName,
        qualifiedName: start[1].toLowerCase(),
        functionName: start[2].toLowerCase(),
      });
    }
  }

  return matches;
}

const entries = (await readdir(migrationDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
  .map((entry) => entry.name)
  .sort();

if (entries.length === 0) {
  fail(`no SQL migrations found in ${migrationDirectory}`);
}

const migrations = [];
const versions = new Set();

for (const fileName of entries) {
  const match = fileName.match(fileNamePattern);
  if (!match) {
    fail(`${fileName}: migration filename must be <12 digits>_<snake_case>.sql`);
    continue;
  }

  const version = match[1];
  if (versions.has(version)) {
    fail(`${fileName}: duplicate migration version ${version}`);
  }
  versions.add(version);

  migrations.push({
    fileName,
    version,
    sql: await readFile(path.join(migrationDirectory, fileName), "utf8"),
  });
}

const combinedSql = migrations.map(({ sql }) => sql).join("\n");
const normalizedCombinedSql = normalize(combinedSql);

for (const tableName of new Set(createdPublicTables(combinedSql))) {
  const rlsPattern = new RegExp(
    `alter\\s+table\\s+(?:if\\s+exists\\s+)?public\\.${tableName}\\s+enable\\s+row\\s+level\\s+security`,
    "i",
  );
  if (!rlsPattern.test(normalizedCombinedSql)) {
    fail(`public.${tableName}: table is created without enabling RLS`);
  }
}

for (const migration of migrations) {
  for (const functionDefinition of securityDefinerFunctions(
    migration.sql,
    migration.fileName,
  )) {
    if (
      !/\bset\s+search_path\s*(?:=|to)\s*(?:''|'pg_catalog')/i.test(
        functionDefinition.block,
      )
    ) {
      fail(
        `${functionDefinition.fileName}: ${functionDefinition.qualifiedName} is SECURITY DEFINER without a fixed search_path`,
      );
    }

    const revokePattern = new RegExp(
      `revoke\\s+all\\s+on\\s+function\\s+${functionDefinition.qualifiedName.replace(".", "\\.")}\\s*\\(`,
      "i",
    );
    if (!revokePattern.test(normalizedCombinedSql)) {
      fail(
        `${functionDefinition.fileName}: ${functionDefinition.qualifiedName} never revokes default PUBLIC execution`,
      );
    }
  }
}

const privilegeBaselineIndex = migrations.findIndex(({ sql }) =>
  /revoke\s+usage\s+on\s+schema\s+public\s+from\s+public\s*,\s*anon/i.test(
    normalize(sql),
  ),
);

if (privilegeBaselineIndex === -1) {
  fail("missing minimum-privilege baseline for the public schema");
} else {
  const baselineAndLater = migrations.slice(privilegeBaselineIndex);
  const baselineSql = normalize(baselineAndLater[0].sql);

  const requiredBaselineStatements = [
    /revoke all privileges on all tables in schema public from anon/,
    /revoke all privileges on all sequences in schema public from anon/,
    /revoke execute on all functions in schema public from anon/,
    /alter default privileges for role postgres in schema public revoke all privileges on tables from anon, authenticated/,
    /alter default privileges for role postgres in schema public revoke all privileges on sequences from anon, authenticated/,
    /alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated/,
  ];

  for (const statement of requiredBaselineStatements) {
    if (!statement.test(baselineSql)) {
      fail(
        `${baselineAndLater[0].fileName}: incomplete minimum-privilege baseline (${statement.source})`,
      );
    }
  }

  for (const migration of baselineAndLater.slice(1)) {
    if (/\bgrant\b[\s\S]*?\bto\s+anon\b/i.test(stripComments(migration.sql))) {
      fail(`${migration.fileName}: anonymous grants are forbidden after baseline`);
    }
  }
}

if (failures.length > 0) {
  console.error("Supabase migration security check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Supabase migration security check passed (${migrations.length} migrations).`,
);
