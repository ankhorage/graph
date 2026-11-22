# AGENTS.md

## Repository

Package: `@ankhorage/graph`

Canonical generic directed graph model, deterministic algorithms, and provider-neutral persistence port for Ankhorage packages and compatible external consumers.

## Current architecture only

Only the current Ankhorage architecture is valid. Do not add deprecated APIs, compatibility aliases, shims, dual old/new paths, or historical-state fallbacks. Cross-package usage must go through published public APIs and declared dependencies.

## Required repository instructions

Before changing any file, read this file and inspect `.agents/skills/`. Load the repository-local coding-rules and project-structure skills for every change, plus hexagonal architecture for structural work.

## Scope

This package owns generic graph data, algorithms, and provider-neutral persistence contracts only. It must not depend on Cytoscape, project detection, package managers, GitHub, dependency analysis, rendering concerns, or provider clients, credentials, SDKs, and query languages.
