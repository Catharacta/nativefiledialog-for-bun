# nativefiledialog-for-bun

[![CI](https://github.com/Catharacta/nativefiledialog-for-bun/actions/workflows/build-binaries.yml/badge.svg)](https://github.com/Catharacta/nativefiledialog-for-bun/actions/workflows/build-binaries.yml)
[![npm version](https://img.shields.io/npm/v/nativefiledialog-for-bun.svg)](https://www.npmjs.com/package/nativefiledialog-for-bun)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Cross-platform native file dialogs (Open, Save, Pick Folder) for Bun.**

This library provides a high-performance, Promise-based API for native file dialogs in Bun, using a hybrid approach of **FFI (Bun.dlopen)** and **Script Fallbacks (PowerShell, osascript, zenity)** to ensure maximum compatibility and speed.

[日本語のREADMEはこちら](./README.ja.md)

---
