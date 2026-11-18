# TypeNow Releases

This directory contains standalone release binaries and SHA-256 checksums for TypeNow.

## Available Packages (v0.1.0)

| Platform | Architecture | Package Format | Download | Checksum (SHA-256) |
|---|---|---|---|---|
| **macOS 12.0+** | Apple Silicon (`aarch64`) | `.dmg` Installer | [`TypeNow_0.1.0_aarch64.dmg`](TypeNow_0.1.0_aarch64.dmg) | `96ef74148e31565fb8c96c74c54cc69f05d69759bbcb6149583592b927a388ee` |
| **macOS 12.0+** | Apple Silicon (`aarch64`) | `.zip` Portable App | [`TypeNow_0.1.0_macOS_aarch64.zip`](TypeNow_0.1.0_macOS_aarch64.zip) | `eae9f71504a08e25deabb30c11fec585b99139552f5dbe14f2641e7a0d55bbb5` |
| **Windows 10/11** | 64-bit (`x64`) | `.exe` Setup Installer | [`TypeNow_0.1.0_x64-setup.exe`](TypeNow_0.1.0_x64-setup.exe) | `28ec2540d122ad6662034452faa2d7692abb1fd4cd9b157c9d49a06d1d111e7b` |
| **Windows 10/11** | 64-bit (`x64`) | `.zip` Portable | [`TypeNow_0.1.0_x64_portable.zip`](TypeNow_0.1.0_x64_portable.zip) | `5d976ec28871eb63950e8fbfb957def00994d4a2a8bb4effe8be47bf07387675` |

---

### macOS Gatekeeper Workaround

If macOS Gatekeeper flags the application as unverified or damaged:
1. Open **Terminal**.
2. Type `xattr -cr ` *(with a trailing space)*.
3. Drag and drop `TypeNow.app` from `/Applications` into Terminal:
   ```bash
   xattr -cr /Applications/TypeNow.app
   ```
4. Press **Return** (Enter), then launch TypeNow normally.

### Windows SmartScreen Note

If Windows SmartScreen shows a prompt:
1. Click **More info**.
2. Click **Run anyway**.
