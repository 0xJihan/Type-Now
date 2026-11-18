# TypeNow Releases

This directory contains standalone release binaries and checksums for TypeNow.

## Available Packages (v0.1.0)

| Platform | Architecture | Package | Checksum (SHA-256) |
|---|---|---|---|
| macOS 12.0+ | Apple Silicon (`aarch64`) | [`TypeNow_0.1.0_aarch64.dmg`](TypeNow_0.1.0_aarch64.dmg) | `96ef74148e31565fb8c96c74c54cc69f05d69759bbcb6149583592b927a388ee` |
| macOS 12.0+ | Apple Silicon (`aarch64`) | [`TypeNow_0.1.0_macOS_aarch64.zip`](TypeNow_0.1.0_macOS_aarch64.zip) | `eae9f71504a08e25deabb30c11fec585b99139552f5dbe14f2641e7a0d55bbb5` |

## Multi-Platform Builds (macOS, Windows, Linux)

Automated multi-platform packaging is orchestrated via GitHub Actions in [`.github/workflows/release.yml`](../.github/workflows/release.yml) across:
- **macOS:** Apple Silicon (`aarch64`) & Intel (`x86_64`) `.dmg` and `.tar.gz`
- **Windows:** Windows 10/11 x64 `.msi` and setup `.exe`
- **Linux:** Ubuntu / Debian `.deb` and universal `.AppImage`

### macOS Gatekeeper Workaround

If macOS Gatekeeper prevents opening the downloaded app:
1. Open Terminal.
2. Type `xattr -cr ` (with a trailing space).
3. Drag and drop `TypeNow.app` from `/Applications` into Terminal:
   ```bash
   xattr -cr /Applications/TypeNow.app
   ```
4. Press Return.
