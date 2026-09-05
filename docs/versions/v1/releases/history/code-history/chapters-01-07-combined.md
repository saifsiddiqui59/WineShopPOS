# WineShopPOS — Chapters 1–7 Combined Actual Git Code History

> Generated from the actual Git repository. No code is reconstructed from memory.

## Chapter → commit mapping

| Chapter | Commit | Subject |
|---:|---|---|
| 1 | `a108679a04` | Chapter 1 - Initial Wine Shop POS setup |
| 2 | `d6d8334dae` | Chapters 2-6 - POS UI barcode billing and local inventory |
| 3 | `d6d8334dae` | Chapters 2-6 - POS UI barcode billing and local inventory |
| 4 | `d6d8334dae` | Chapters 2-6 - POS UI barcode billing and local inventory |
| 5 | `d6d8334dae` | Chapters 2-6 - POS UI barcode billing and local inventory |
| 6 | `d6d8334dae` | Chapters 2-6 - POS UI barcode billing and local inventory |
| 7 | `ec3b8e201c` | Chapter 7 - Receive stock purchases and case handling |

## Unique historical milestone commits

# Milestone: Chapter 1

## Commit metadata

```text
Commit: a108679a04a70374c059c2eea3df72aa80730932
Short: a108679
Author: saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
Date: 2026-08-29T08:39:03-04:00
Subject: Chapter 1 - Initial Wine Shop POS setup
```

## Exact patch

```diff
commit a108679a04a70374c059c2eea3df72aa80730932
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Sat Aug 29 08:39:03 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Sat Aug 29 08:39:03 2026 -0400

    Chapter 1 - Initial Wine Shop POS setup
---
 .gitattributes       |    1 +
 .gitignore           |   24 +
 .oxlintrc.json       |    8 +
 README.md            |   16 +
 index.html           |   13 +
 package-lock.json    | 1330 ++++++++++++++++++++++++++++++++++++++++++++++++++
 package.json         |   25 +
 public/favicon.svg   |    1 +
 public/icons.svg     |   24 +
 src/App.css          |  184 +++++++
 src/App.jsx          |  122 +++++
 src/assets/hero.png  |  Bin 0 -> 13057 bytes
 src/assets/react.svg |    1 +
 src/assets/vite.svg  |    1 +
 src/index.css        |  111 +++++
 src/main.jsx         |   10 +
 vite.config.js       |    7 +
 17 files changed, 1878 insertions(+)

diff --git a/.gitattributes b/.gitattributes
new file mode 100644
index 0000000..6313b56
--- /dev/null
+++ b/.gitattributes
@@ -0,0 +1 @@
+* text=auto eol=lf
diff --git a/.gitignore b/.gitignore
new file mode 100644
index 0000000..a547bf3
--- /dev/null
+++ b/.gitignore
@@ -0,0 +1,24 @@
+# Logs
+logs
+*.log
+npm-debug.log*
+yarn-debug.log*
+yarn-error.log*
+pnpm-debug.log*
+lerna-debug.log*
+
+node_modules
+dist
+dist-ssr
+*.local
+
+# Editor directories and files
+.vscode/*
+!.vscode/extensions.json
+.idea
+.DS_Store
+*.suo
+*.ntvs*
+*.njsproj
+*.sln
+*.sw?
diff --git a/.oxlintrc.json b/.oxlintrc.json
new file mode 100644
index 0000000..1255078
--- /dev/null
+++ b/.oxlintrc.json
@@ -0,0 +1,8 @@
+{
+  "$schema": "./node_modules/oxlint/configuration_schema.json",
+  "plugins": ["react", "oxc"],
+  "rules": {
+    "react/rules-of-hooks": "error",
+    "react/only-export-components": ["warn", { "allowConstantExport": true }]
+  }
+}
diff --git a/README.md b/README.md
new file mode 100644
index 0000000..d937833
--- /dev/null
+++ b/README.md
@@ -0,0 +1,16 @@
+# React + Vite
+
+This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.
+
+Currently, two official plugins are available:
+
+- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
+- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
+
+## React Compiler
+
+The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
+
+## Expanding the Oxlint configuration
+
+If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
diff --git a/index.html b/index.html
new file mode 100644
index 0000000..1b9f1fa
--- /dev/null
+++ b/index.html
@@ -0,0 +1,13 @@
+<!doctype html>
+<html lang="en">
+  <head>
+    <meta charset="UTF-8" />
+    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
+    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+    <title>wineshoppos</title>
+  </head>
+  <body>
+    <div id="root"></div>
+    <script type="module" src="/src/main.jsx"></script>
+  </body>
+</html>
diff --git a/package-lock.json b/package-lock.json
new file mode 100644
index 0000000..56eee77
--- /dev/null
+++ b/package-lock.json
@@ -0,0 +1,1330 @@
+{
+  "name": "wineshoppos",
+  "version": "0.0.0",
+  "lockfileVersion": 3,
+  "requires": true,
+  "packages": {
+    "": {
+      "name": "wineshoppos",
+      "version": "0.0.0",
+      "dependencies": {
+        "lucide-react": "^1.37.0",
+        "react": "^19.2.8",
+        "react-dom": "^19.2.8",
+        "react-router-dom": "^7.18.3"
+      },
+      "devDependencies": {
+        "@types/react": "^19.2.18",
+        "@types/react-dom": "^19.2.4",
+        "@vitejs/plugin-react": "^6.1.0",
+        "oxlint": "^1.79.0",
+        "vite": "^8.2.2"
+      }
+    },
+    "node_modules/@oxc-project/types": {
+      "version": "0.147.0",
+      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.147.0.tgz",
+      "integrity": "sha512-IJ3s6ltHLp45S0bh7phkX+gJO7A1Wuz2EaqpAhb8WjqDwbzMiWKHhyyT42tskaWjEYXtHtVCPpnBJVT9+dcRLg==",
+      "dev": true,
+      "license": "MIT",
+      "funding": {
+        "url": "https://github.com/sponsors/Boshen"
+      }
+    },
+    "node_modules/@oxlint/binding-android-arm-eabi": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-android-arm-eabi/-/binding-android-arm-eabi-1.80.0.tgz",
+      "integrity": "sha512-RM3Plj+biQpxa5d1GOOX6ciDlcUROmm4OZ/pLTpitkQt2mJv4jhtY4cbgaetOm5UKWZe05/TGQ6o1Vl8EOHkrA==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-android-arm64": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-android-arm64/-/binding-android-arm64-1.80.0.tgz",
+      "integrity": "sha512-YlO5JEf0Yr2bUUlu8O8daVcUxtcGGbcSmyV7E7nSbJbfAdxTE0PFPwgnIlw7wXJaTYjb+qs5hI5q3jxUkI7cAw==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-darwin-arm64": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-darwin-arm64/-/binding-darwin-arm64-1.80.0.tgz",
+      "integrity": "sha512-BULDOyO3AhsmdWfQeIUCykDt3dd7XZBGLhp1eIh56skRv01O+cNjNPwXMIbeW1x4+pxcln5if72wcRgViVo7PA==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-darwin-x64": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-darwin-x64/-/binding-darwin-x64-1.80.0.tgz",
+      "integrity": "sha512-YJ4JzLw7N5TDSQFlA0hAQGHvnDZgyypm1yunObVWcWiF9KM7eGCJKYKLgTC2Fi/57OdnBhbj4OkzPGdFQJ6HyA==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-freebsd-x64": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-freebsd-x64/-/binding-freebsd-x64-1.80.0.tgz",
+      "integrity": "sha512-AYUIk5QnL0s8oWAYsREZwkRYy1SupJTXALo93J1TgzHywxQtdM99FecRMQ87MXEdPQ0j1TmEpeeq3fGNkpvMqg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-arm-gnueabihf": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.80.0.tgz",
+      "integrity": "sha512-9hBZVANupQ89W9dXyE0n8doCyaW5pDyGn3y6XlIMPZ+rIKuyqkr3SNUXmVJIhuvUq0NBU3RBiSXXE69l4XI6KA==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-arm-musleabihf": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm-musleabihf/-/binding-linux-arm-musleabihf-1.80.0.tgz",
+      "integrity": "sha512-SvS2uKqzY+pbfuvAHzH4338R6Zwo805GAwrIMVvK1KxoOWCIjZUdfzTCvilD7z6JK91v011+zYMryabhDo2AsQ==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-arm64-gnu": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.80.0.tgz",
+      "integrity": "sha512-tCLadyqRVL3pQTRPNg7cjXKvcvS4fbyXeQHhKk5BTJ1oftQln5/yIIWbu/Xom/DX41zv2P9QGt6+D/TtQVtY3A==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-arm64-musl": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.80.0.tgz",
+      "integrity": "sha512-XfpCNRlOPcLlJl4Bn/FUhjqlR6BVavEykERBf/MV7YA9VZDa5g5znVqYhyviMafcxS9Pe/i/kPvHNO0U6svEHQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-ppc64-gnu": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.80.0.tgz",
+      "integrity": "sha512-3I4yMwcFG9NeO8ioY6JBBuKsIm5GL/x7MATt1S4tVWaxPu5HcJ+XnLUbcVBTxG8q2Wu56HSj+NmXQiVYb1lp6A==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-riscv64-gnu": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-riscv64-gnu/-/binding-linux-riscv64-gnu-1.80.0.tgz",
+      "integrity": "sha512-E1wAKymkpe1/E8helzBKdm81OBOF+ezxRyXRMEuik3ZpWDER5CPOKZwF66RsdwW98uwZv8UTFremUQtC1CzdJA==",
+      "cpu": [
+        "riscv64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-riscv64-musl": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-riscv64-musl/-/binding-linux-riscv64-musl-1.80.0.tgz",
+      "integrity": "sha512-+gLRGD4sIo3+VA++iham5UxD9tKSoJ/VOrROCEXIcknrYtQg6iIQgvjN0cpiRF7N6UYC7pJbvHJlDnMge5LRpQ==",
+      "cpu": [
+        "riscv64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-s390x-gnu": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.80.0.tgz",
+      "integrity": "sha512-aR0PrzHj9leW3NmzBAAP4EzdoBNoJcs9sjnIQPIwyRnBGYrRbXUIpEB5Q39AqK3PLY5JK5uEhDQDiUa1QSAstw==",
+      "cpu": [
+        "s390x"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-x64-gnu": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.80.0.tgz",
+      "integrity": "sha512-vSVh5cSo3Xxs6ghBCcFJlpbkbENzDog1qXtoXLa/HC3aCrR4XO76GZbXmQoCPHnu99nQpdCeC3H9tdNICfDh7A==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-linux-x64-musl": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-x64-musl/-/binding-linux-x64-musl-1.80.0.tgz",
+      "integrity": "sha512-FfzBXpNQ8u7/ZI/p8bl73MeZ508Ax3hxWp3SiJpEFiC+BB9XcXy5FAZHTLKDPSzrUpxQZSZJAVdDmuJp/+HDBQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-openharmony-arm64": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-openharmony-arm64/-/binding-openharmony-arm64-1.80.0.tgz",
+      "integrity": "sha512-zMzbkumtmprCgRwoYNzcB3iC39fXdJIMLMU33KdCjEGLlJGOEt1+LwQ4LF8ndLzAEKVz4BR0y3V6Xrkk3Nm3yA==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "openharmony"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-win32-arm64-msvc": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.80.0.tgz",
+      "integrity": "sha512-ib6iRcrXsk4t1fm3iKcwksyWh1ZkZXC/2mEzakl0ai2+6HZunf1WWMZ/xP9EJAvw9g9K4UVTC3NF/+G2qLrbTQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-win32-ia32-msvc": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-win32-ia32-msvc/-/binding-win32-ia32-msvc-1.80.0.tgz",
+      "integrity": "sha512-xhRWBMpLxZvgKAH6+DJZmpP+W8Y8UdQOSU1JfxSWNXsaBaRGW77j+1hCuNHlzj7OH4SPN8fYd1q0o2qrDtoVyw==",
+      "cpu": [
+        "ia32"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@oxlint/binding-win32-x64-msvc": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/@oxlint/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.80.0.tgz",
+      "integrity": "sha512-yAnO7lwBYQnz2pcfBPIGQQZWIX5zd5R/1aAKIF3oE+TVj7IhoHcROjOkz3sRDngzqhfPKfFaXqug5j5rE5dn6Q==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-android-arm-eabi": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.6.tgz",
+      "integrity": "sha512-b+jTcARdTiFLI6jB4a5XjTm0RWd6KcRfQj/I2356fxUZemiho9zQLxo0RtCuMDAyKcLo6cEltkgbQp6d1+sjjQ==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-android-arm64": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.6.tgz",
+      "integrity": "sha512-lkWU8ZJaRk9q3CIEY1Tc7vIFALp3Xw5NfGJo2hQg5oIqNgxWi1zI+IiDEK3r70BF5Dzol1tcXsnzsRc8NLhG+Q==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-darwin-arm64": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.6.tgz",
+      "integrity": "sha512-dgR56NYnvAszm7Ob1B2/Vn0e8bUQYZH2UjVaMMtMVOCKFSfjhfLmuA/9+O+F+ajUdG6B/bSssrKW6JJYASa8jA==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-darwin-x64": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.6.tgz",
+      "integrity": "sha512-vpVxFvUCFioJqug7OTvqptkc4yb8UX0AwfDmJpaR/0sWz+BUmqSVAf7c8JkUgnN8YLspb4a/N6NhTyMAmdyQ7Q==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-freebsd-x64": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.6.tgz",
+      "integrity": "sha512-h1wG6Y6K3JlRswxsI64qQJqBAy4vrLuHgRbc8CZMGSWTOFRY6ghMApM1NKzB2I0n5xV1fjkE18SuVl2QpLeNpA==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.6.tgz",
+      "integrity": "sha512-tbCiqub0q2MVWJKgF5PoAlNWCtQydiOYSLIkd8sByqK/6MMYLJRcSXSYodqYtd0O+Fw7QaVmKKlS4oL94YRZ0w==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-linux-arm64-gnu": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.6.tgz",
+      "integrity": "sha512-oxK9+baEBPhZG5HB4URY+uU04zJWeZlH6Tb9rB5DK4DF9XR1uXNLXt5Q5ZsugTKayNCNLhkcwz/ye74hRI98dg==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-linux-arm64-musl": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.6.tgz",
+      "integrity": "sha512-muWCk27FVBEZtv0MsK8gnfSmgczA8KQ0uRVJbTABKhkRfQc38aUrcb7fhi3BNiyseFmgcRsoMfQsSNJ+DbZdSw==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.6.tgz",
+      "integrity": "sha512-eWDoSfU7Co2qj3vgB3Dt4lj1mG6CoWbcJQkRMP3XJplyCMtuaq3LHvPFjS9QIPvMGWVadJC04Xiy0IdcVPtnwQ==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-linux-s390x-gnu": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.6.tgz",
+      "integrity": "sha512-2bWNjRSIayvupRKxXUY2tWG9fYdoUlTqWywHRvE8Eq3GvuQ+f2HeIkve697fIt+IQs/PV8yFsdWuhp1aJ1PdnA==",
+      "cpu": [
+        "s390x"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-linux-x64-gnu": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.6.tgz",
+      "integrity": "sha512-KekI0gS0wLxe1UBSQSjenBVwou/JkcQPDzBPICGZjxUv9k3RteHDPBQaiOicZUFKRIH2wKEimGwVpnJsbPzu7w==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-linux-x64-musl": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.6.tgz",
+      "integrity": "sha512-TvtPnfVr+HtyGiDmPK4VWmlNm7QhNNAcK5Q9A7aOXsI8545yCyaoMaicXrFZ72JzeYjaUVk7yT243zT0jzjFKQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-openharmony-arm64": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.6.tgz",
+      "integrity": "sha512-iOo0VEay2XFhaCcH0sps5XIimkSuOnNaZrf6+ZkoSOQBJPKNU48RkmJv0/lSpipexu5P+ouFgafe5IGr/DiQfg==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "openharmony"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-win32-arm64-msvc": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.6.tgz",
+      "integrity": "sha512-y5NTmmasMS455JlOCO4ZM9krIchv3Mvm1crL1iUPGOPgEzSkves9n0SdC5Sjz6+qWDFhd8/JpfWMH8NSWNHe+A==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/binding-win32-x64-msvc": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.6.tgz",
+      "integrity": "sha512-np8iZSLfXlAD4kWhiyq/u0Yt8oZDtRQ8lGhQaCXo2rl37KNjeU0GjJuwr4P3oeZ++ROfofsKNBqR5LTO8aXyWQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      }
+    },
+    "node_modules/@rolldown/pluginutils": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
+      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/@types/react": {
+      "version": "19.2.18",
+      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.2.18.tgz",
+      "integrity": "sha512-AnzbBERsrLKtk2XSfTbYRLjQPdy116Sty4q+T+Bp3IC4l6jNBvreVPAHmpq9qhXQM7CXZPjLVmGMw9sy+hxQ3w==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "csstype": "^3.2.2"
+      }
+    },
+    "node_modules/@types/react-dom": {
+      "version": "19.2.5",
+      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.5.tgz",
+      "integrity": "sha512-fMPwH9v7r/pp43yUd2/Mbiex5KouJwwR3dzHkhLREUC6764VyDsqxhAxv6OFEYR1RhjOyD1naqba8ECDBe7ZQg==",
+      "dev": true,
+      "license": "MIT",
+      "peerDependencies": {
+        "@types/react": "^19.2.0"
+      }
+    },
+    "node_modules/@vitejs/plugin-react": {
+      "version": "6.1.1",
+      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-6.1.1.tgz",
+      "integrity": "sha512-yxLaQV9gkhS8ezJqCM6+ndU7mDY6gqAg75NQ+0IjwEI8IYOmQCgkRwHKVSfWXW076DsqMo0Dk+0FK1U+M5RgFw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@rolldown/pluginutils": "^1.0.1"
+      },
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      },
+      "peerDependencies": {
+        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0",
+        "babel-plugin-react-compiler": "^1.0.0",
+        "oxc-transform-react": "^0.145.0",
+        "vite": "^8.0.0"
+      },
+      "peerDependenciesMeta": {
+        "@rolldown/plugin-babel": {
+          "optional": true
+        },
+        "babel-plugin-react-compiler": {
+          "optional": true
+        },
+        "oxc-transform-react": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/cookie": {
+      "version": "1.1.1",
+      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
+      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=18"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/express"
+      }
+    },
+    "node_modules/csstype": {
+      "version": "3.2.3",
+      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
+      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/detect-libc": {
+      "version": "2.1.2",
+      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
+      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
+      "dev": true,
+      "license": "Apache-2.0",
+      "engines": {
+        "node": ">=8"
+      }
+    },
+    "node_modules/fdir": {
+      "version": "6.5.0",
+      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
+      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=12.0.0"
+      },
+      "peerDependencies": {
+        "picomatch": "^3 || ^4"
+      },
+      "peerDependenciesMeta": {
+        "picomatch": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/fsevents": {
+      "version": "2.3.3",
+      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
+      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
+      "dev": true,
+      "hasInstallScript": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
+      }
+    },
+    "node_modules/lightningcss": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
+      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
+      "dev": true,
+      "license": "MPL-2.0",
+      "dependencies": {
+        "detect-libc": "^2.0.3"
+      },
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      },
+      "optionalDependencies": {
+        "lightningcss-android-arm64": "1.33.0",
+        "lightningcss-darwin-arm64": "1.33.0",
+        "lightningcss-darwin-x64": "1.33.0",
+        "lightningcss-freebsd-x64": "1.33.0",
+        "lightningcss-linux-arm-gnueabihf": "1.33.0",
+        "lightningcss-linux-arm64-gnu": "1.33.0",
+        "lightningcss-linux-arm64-musl": "1.33.0",
+        "lightningcss-linux-x64-gnu": "1.33.0",
+        "lightningcss-linux-x64-musl": "1.33.0",
+        "lightningcss-win32-arm64-msvc": "1.33.0",
+        "lightningcss-win32-x64-msvc": "1.33.0"
+      }
+    },
+    "node_modules/lightningcss-android-arm64": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
+      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-darwin-arm64": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
+      "integrity": "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-darwin-x64": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
+      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-freebsd-x64": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
+      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-linux-arm-gnueabihf": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
+      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-linux-arm64-gnu": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
+      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-linux-arm64-musl": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
+      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-linux-x64-gnu": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
+      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-linux-x64-musl": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
+      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-win32-arm64-msvc": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
+      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lightningcss-win32-x64-msvc": {
+      "version": "1.33.0",
+      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
+      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MPL-2.0",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/parcel"
+      }
+    },
+    "node_modules/lucide-react": {
+      "version": "1.37.0",
+      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-1.37.0.tgz",
+      "integrity": "sha512-LPsB4rD1TD6wZu1djKOf9vUnS1jTNaHbolXebXDgiTdb6jeA1agIJhJsIybCmjKmQClcOaal1o1OaiYahEftyQ==",
+      "license": "ISC",
+      "peerDependencies": {
+        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
+      }
+    },
+    "node_modules/nanoid": {
+      "version": "3.3.18",
+      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz",
+      "integrity": "sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/ai"
+        }
+      ],
+      "license": "MIT",
+      "bin": {
+        "nanoid": "bin/nanoid.cjs"
+      },
+      "engines": {
+        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
+      }
+    },
+    "node_modules/oxlint": {
+      "version": "1.80.0",
+      "resolved": "https://registry.npmjs.org/oxlint/-/oxlint-1.80.0.tgz",
+      "integrity": "sha512-5nTiSps4qdbCWLbxzuO00alHkEO2exR9YMN/ig6QXWrLsYSG0KaObOAM+l6oU2LcKPWoSAGYbkZIGEu1ViiWKA==",
+      "dev": true,
+      "license": "MIT",
+      "bin": {
+        "oxlint": "bin/oxlint"
+      },
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/Boshen"
+      },
+      "optionalDependencies": {
+        "@oxlint/binding-android-arm-eabi": "1.80.0",
+        "@oxlint/binding-android-arm64": "1.80.0",
+        "@oxlint/binding-darwin-arm64": "1.80.0",
+        "@oxlint/binding-darwin-x64": "1.80.0",
+        "@oxlint/binding-freebsd-x64": "1.80.0",
+        "@oxlint/binding-linux-arm-gnueabihf": "1.80.0",
+        "@oxlint/binding-linux-arm-musleabihf": "1.80.0",
+        "@oxlint/binding-linux-arm64-gnu": "1.80.0",
+        "@oxlint/binding-linux-arm64-musl": "1.80.0",
+        "@oxlint/binding-linux-ppc64-gnu": "1.80.0",
+        "@oxlint/binding-linux-riscv64-gnu": "1.80.0",
+        "@oxlint/binding-linux-riscv64-musl": "1.80.0",
+        "@oxlint/binding-linux-s390x-gnu": "1.80.0",
+        "@oxlint/binding-linux-x64-gnu": "1.80.0",
+        "@oxlint/binding-linux-x64-musl": "1.80.0",
+        "@oxlint/binding-openharmony-arm64": "1.80.0",
+        "@oxlint/binding-win32-arm64-msvc": "1.80.0",
+        "@oxlint/binding-win32-ia32-msvc": "1.80.0",
+        "@oxlint/binding-win32-x64-msvc": "1.80.0"
+      },
+      "peerDependencies": {
+        "oxlint-tsgolint": ">=7.0.2001",
+        "vite-plus": "*"
+      },
+      "peerDependenciesMeta": {
+        "oxlint-tsgolint": {
+          "optional": true
+        },
+        "vite-plus": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/picocolors": {
+      "version": "1.1.1",
+      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
+      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
+      "dev": true,
+      "license": "ISC"
+    },
+    "node_modules/picomatch": {
+      "version": "4.0.7",
+      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
+      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=12"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/jonschlinkert"
+      }
+    },
+    "node_modules/postcss": {
+      "version": "8.5.26",
+      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.26.tgz",
+      "integrity": "sha512-u82N74LFzG8ca+dD8puPnplTXoGH4fTPpVGuIbt36G3qvNlkvfD0lEAZSxaly3KX8TS/L1A1gsCEmvKmBcVbkQ==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/postcss/"
+        },
+        {
+          "type": "tidelift",
+          "url": "https://tidelift.com/funding/github/npm/postcss"
+        },
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/ai"
+        }
+      ],
+      "license": "MIT",
+      "dependencies": {
+        "nanoid": "^3.3.17",
+        "picocolors": "^1.1.1",
+        "source-map-js": "^1.2.1"
+      },
+      "engines": {
+        "node": "^10 || ^12 || >=14"
+      }
+    },
+    "node_modules/react": {
+      "version": "19.2.8",
+      "resolved": "https://registry.npmjs.org/react/-/react-19.2.8.tgz",
+      "integrity": "sha512-PWaYA1L/q9u2u7xYQi+Y3L3Yfnie7XyLeaJICV1MGD6LprsBxcAqGjYyr0eY3p+QdsA+x/Irkt4Qif8D63+Sbw==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/react-dom": {
+      "version": "19.2.8",
+      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.2.8.tgz",
+      "integrity": "sha512-rVprimfGBG3DR+Tq0IQG2DT5PxKth1WIGDmj5yPmlzr4YBe7uyE+Du4oVqTDXZSHGGGXRtTJEGSSePyQCMBglQ==",
+      "license": "MIT",
+      "dependencies": {
+        "scheduler": "^0.27.0"
+      },
+      "peerDependencies": {
+        "react": "^19.2.8"
+      }
+    },
+    "node_modules/react-router": {
+      "version": "7.18.3",
+      "resolved": "https://registry.npmjs.org/react-router/-/react-router-7.18.3.tgz",
+      "integrity": "sha512-gyXgtdr5uACJ5b1Q4udzjVV+tb/rlHIMJKuJ0e89R4Kzgz47z/rgP0dIKxktqIEUhDHluGTPJJH/wRha7CyqsA==",
+      "license": "MIT",
+      "dependencies": {
+        "cookie": "^1.0.1",
+        "set-cookie-parser": "^2.6.0"
+      },
+      "engines": {
+        "node": ">=20.0.0"
+      },
+      "peerDependencies": {
+        "react": ">=18",
+        "react-dom": ">=18"
+      },
+      "peerDependenciesMeta": {
+        "react-dom": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/react-router-dom": {
+      "version": "7.18.3",
+      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-7.18.3.tgz",
+      "integrity": "sha512-ytVbyBBM7vMfRCam25r0WMhSVSom909A8p+8m0/f1w853dz/xfFu6etAT2SEbVoSnI+ZoPRDqIsQXVT89gp7kg==",
+      "license": "MIT",
+      "dependencies": {
+        "react-router": "7.18.3"
+      },
+      "engines": {
+        "node": ">=20.0.0"
+      },
+      "peerDependencies": {
+        "react": ">=18",
+        "react-dom": ">=18"
+      }
+    },
+    "node_modules/rolldown": {
+      "version": "1.2.6",
+      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.6.tgz",
+      "integrity": "sha512-vMM4q3aixf46GiF1Kok8jDPFsEpXgFWGjUHXNkNHNm+Y2adXAG2dbX91jkti3i0ZRsOlcmbuzAz1poObSHCmUA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@oxc-project/types": "=0.147.0",
+        "@rolldown/pluginutils": "^1.0.0"
+      },
+      "bin": {
+        "rolldown": "bin/cli.mjs"
+      },
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      },
+      "optionalDependencies": {
+        "@rolldown/binding-android-arm-eabi": "1.2.6",
+        "@rolldown/binding-android-arm64": "1.2.6",
+        "@rolldown/binding-darwin-arm64": "1.2.6",
+        "@rolldown/binding-darwin-x64": "1.2.6",
+        "@rolldown/binding-freebsd-x64": "1.2.6",
+        "@rolldown/binding-linux-arm-gnueabihf": "1.2.6",
+        "@rolldown/binding-linux-arm64-gnu": "1.2.6",
+        "@rolldown/binding-linux-arm64-musl": "1.2.6",
+        "@rolldown/binding-linux-ppc64-gnu": "1.2.6",
+        "@rolldown/binding-linux-s390x-gnu": "1.2.6",
+        "@rolldown/binding-linux-x64-gnu": "1.2.6",
+        "@rolldown/binding-linux-x64-musl": "1.2.6",
+        "@rolldown/binding-openharmony-arm64": "1.2.6",
+        "@rolldown/binding-win32-arm64-msvc": "1.2.6",
+        "@rolldown/binding-win32-x64-msvc": "1.2.6"
+      }
+    },
+    "node_modules/scheduler": {
+      "version": "0.27.0",
+      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.27.0.tgz",
+      "integrity": "sha512-eNv+WrVbKu1f3vbYJT/xtiF5syA5HPIMtf9IgY/nKg0sWqzAUEvqY/xm7OcZc/qafLx/iO9FgOmeSAp4v5ti/Q==",
+      "license": "MIT"
+    },
+    "node_modules/set-cookie-parser": {
+      "version": "2.7.2",
+      "resolved": "https://registry.npmjs.org/set-cookie-parser/-/set-cookie-parser-2.7.2.tgz",
+      "integrity": "sha512-oeM1lpU/UvhTxw+g3cIfxXHyJRc/uidd3yK1P242gzHds0udQBYzs3y8j4gCCW+ZJ7ad0yctld8RYO+bdurlvw==",
+      "license": "MIT"
+    },
+    "node_modules/source-map-js": {
+      "version": "1.2.1",
+      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
+      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
+      "dev": true,
+      "license": "BSD-3-Clause",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/tinyglobby": {
+      "version": "0.2.17",
+      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
+      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "fdir": "^6.5.0",
+        "picomatch": "^4.0.4"
+      },
+      "engines": {
+        "node": ">=12.0.0"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/SuperchupuDev"
+      }
+    },
+    "node_modules/vite": {
+      "version": "8.2.2",
+      "resolved": "https://registry.npmjs.org/vite/-/vite-8.2.2.tgz",
+      "integrity": "sha512-cFKLV/PRgAUlIRm5WjMjJ86jrftzpqcgH+Us+DS8mI3CDNiH30Whrz8uHL3+MOLPAgqbMBAqWdAHAphOAM+z/Q==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "lightningcss": "^1.33.0",
+        "picomatch": "^4.0.5",
+        "postcss": "^8.5.26",
+        "rolldown": "~1.2.4",
+        "tinyglobby": "^0.2.17"
+      },
+      "bin": {
+        "vite": "bin/vite.js"
+      },
+      "engines": {
+        "node": "^20.19.0 || >=22.12.0"
+      },
+      "funding": {
+        "url": "https://github.com/vitejs/vite?sponsor=1"
+      },
+      "optionalDependencies": {
+        "fsevents": "~2.3.3"
+      },
+      "peerDependencies": {
+        "@types/node": "^20.19.0 || >=22.12.0",
+        "@vitejs/devtools": "^0.4.0 || ^0.5.0",
+        "esbuild": "^0.27.0 || ^0.28.0",
+        "jiti": ">=1.21.0",
+        "less": "^4.0.0",
+        "sass": "^1.70.0",
+        "sass-embedded": "^1.70.0",
+        "stylus": ">=0.54.8",
+        "sugarss": "^5.0.0",
+        "terser": "^5.16.0",
+        "tsx": "^4.8.1",
+        "yaml": "^2.4.2"
+      },
+      "peerDependenciesMeta": {
+        "@types/node": {
+          "optional": true
+        },
+        "@vitejs/devtools": {
+          "optional": true
+        },
+        "esbuild": {
+          "optional": true
+        },
+        "jiti": {
+          "optional": true
+        },
+        "less": {
+          "optional": true
+        },
+        "sass": {
+          "optional": true
+        },
+        "sass-embedded": {
+          "optional": true
+        },
+        "stylus": {
+          "optional": true
+        },
+        "sugarss": {
+          "optional": true
+        },
+        "terser": {
+          "optional": true
+        },
+        "tsx": {
+          "optional": true
+        },
+        "yaml": {
+          "optional": true
+        }
+      }
+    }
+  }
+}
diff --git a/package.json b/package.json
new file mode 100644
index 0000000..30f596e
--- /dev/null
+++ b/package.json
@@ -0,0 +1,25 @@
+{
+  "name": "wineshoppos",
+  "private": true,
+  "version": "0.0.0",
+  "type": "module",
+  "scripts": {
+    "dev": "vite",
+    "build": "vite build",
+    "lint": "oxlint",
+    "preview": "vite preview"
+  },
+  "dependencies": {
+    "lucide-react": "^1.37.0",
+    "react": "^19.2.8",
+    "react-dom": "^19.2.8",
+    "react-router-dom": "^7.18.3"
+  },
+  "devDependencies": {
+    "@types/react": "^19.2.18",
+    "@types/react-dom": "^19.2.4",
+    "@vitejs/plugin-react": "^6.1.0",
+    "oxlint": "^1.79.0",
+    "vite": "^8.2.2"
+  }
+}
diff --git a/public/favicon.svg b/public/favicon.svg
new file mode 100644
index 0000000..6893eb1
--- /dev/null
+++ b/public/favicon.svg
@@ -0,0 +1 @@
+<svg xmlns="http://www.w3.org/2000/svg" width="48" height="46" fill="none" viewBox="0 0 48 46"><path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" style="fill:#863bff;fill:color(display-p3 .5252 .23 1);fill-opacity:1"/><mask id="a" width="48" height="46" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M25.842 44.938c-.664.844-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.183c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.498 0-3.579-1.842-3.579H1.133c-.92 0-1.456-1.04-.92-1.787L9.91.473c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.578 1.842 3.578h11.377c.943 0 1.473 1.088.89 1.832L25.843 44.94z" style="fill:#000;fill-opacity:1"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#ede6ff" rx="5.508" ry="14.704" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -4.47 31.516)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#ede6ff" rx="10.399" ry="29.851" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -39.328 7.883)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#7e14ff" rx="5.508" ry="30.487" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -25.913 -14.639)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -32.644 -3.334)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -34.34 30.47)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#ede6ff" rx="14.072" ry="22.078" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="rotate(93.35 24.506 48.493)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx=".387" cy="8.972" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(39.51 .387 8.972)"/></g><g filter="url(#k)"><ellipse cx="47.523" cy="-6.092" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 47.523 -6.092)"/></g><g filter="url(#l)"><ellipse cx="41.412" cy="6.333" fill="#47bfff" rx="5.971" ry="9.665" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 41.412 6.333)"/></g><g filter="url(#m)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#n)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#o)"><ellipse cx="35.651" cy="29.907" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 35.651 29.907)"/></g><g filter="url(#p)"><ellipse cx="38.418" cy="32.4" fill="#47bfff" rx="5.971" ry="15.297" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 38.418 32.4)"/></g></g><defs><filter id="b" width="60.045" height="41.654" x="-19.77" y="16.149" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-54.613" y="-7.533" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-49.64" y="2.03" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-45.045" y="20.029" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-43.513" y="21.178" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="15.756" y="-17.901" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-27.636" y="-22.853" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="20.116" y="-38.415" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="24.641" y="-11.323" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="8.244" y="-2.416" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="18.713" y="10.588" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter></defs></svg>
\ No newline at end of file
diff --git a/public/icons.svg b/public/icons.svg
new file mode 100644
index 0000000..e952219
--- /dev/null
+++ b/public/icons.svg
@@ -0,0 +1,24 @@
+<svg xmlns="http://www.w3.org/2000/svg">
+  <symbol id="bluesky-icon" viewBox="0 0 16 17">
+    <g clip-path="url(#bluesky-clip)"><path fill="#08060d" d="M7.75 7.735c-.693-1.348-2.58-3.86-4.334-5.097-1.68-1.187-2.32-.981-2.74-.79C.188 2.065.1 2.812.1 3.251s.241 3.602.398 4.13c.52 1.744 2.367 2.333 4.07 2.145-2.495.37-4.71 1.278-1.805 4.512 3.196 3.309 4.38-.71 4.987-2.746.608 2.036 1.307 5.91 4.93 2.746 2.72-2.746.747-4.143-1.747-4.512 1.702.189 3.55-.4 4.07-2.145.156-.528.397-3.691.397-4.13s-.088-1.186-.575-1.406c-.42-.19-1.06-.395-2.741.79-1.755 1.24-3.64 3.752-4.334 5.099"/></g>
+    <defs><clipPath id="bluesky-clip"><path fill="#fff" d="M.1.85h15.3v15.3H.1z"/></clipPath></defs>
+  </symbol>
+  <symbol id="discord-icon" viewBox="0 0 20 19">
+    <path fill="#08060d" d="M16.224 3.768a14.5 14.5 0 0 0-3.67-1.153c-.158.286-.343.67-.47.976a13.5 13.5 0 0 0-4.067 0c-.128-.306-.317-.69-.476-.976A14.4 14.4 0 0 0 3.868 3.77C1.546 7.28.916 10.703 1.231 14.077a14.7 14.7 0 0 0 4.5 2.306q.545-.748.965-1.587a9.5 9.5 0 0 1-1.518-.74q.191-.14.372-.293c2.927 1.369 6.107 1.369 8.999 0q.183.152.372.294-.723.437-1.52.74.418.838.963 1.588a14.6 14.6 0 0 0 4.504-2.308c.37-3.911-.63-7.302-2.644-10.309m-9.13 8.234c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.894 0 1.614.82 1.599 1.82.001 1-.705 1.82-1.6 1.82m5.91 0c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.893 0 1.614.82 1.599 1.82 0 1-.706 1.82-1.6 1.82"/>
+  </symbol>
+  <symbol id="documentation-icon" viewBox="0 0 21 20">
+    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="m15.5 13.333 1.533 1.322c.645.555.967.833.967 1.178s-.322.623-.967 1.179L15.5 18.333m-3.333-5-1.534 1.322c-.644.555-.966.833-.966 1.178s.322.623.966 1.179l1.534 1.321"/>
+    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M17.167 10.836v-4.32c0-1.41 0-2.117-.224-2.68-.359-.906-1.118-1.621-2.08-1.96-.599-.21-1.349-.21-2.848-.21-2.623 0-3.935 0-4.983.369-1.684.591-3.013 1.842-3.641 3.428C3 6.449 3 7.684 3 10.154v2.122c0 2.558 0 3.838.706 4.726q.306.383.713.671c.76.536 1.79.64 3.581.66"/>
+    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M3 10a2.78 2.78 0 0 1 2.778-2.778c.555 0 1.209.097 1.748-.047.48-.129.854-.503.982-.982.145-.54.048-1.194.048-1.749a2.78 2.78 0 0 1 2.777-2.777"/>
+  </symbol>
+  <symbol id="github-icon" viewBox="0 0 19 19">
+    <path fill="#08060d" fill-rule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" clip-rule="evenodd"/>
+  </symbol>
+  <symbol id="social-icon" viewBox="0 0 20 20">
+    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M12.5 6.667a4.167 4.167 0 1 0-8.334 0 4.167 4.167 0 0 0 8.334 0"/>
+    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M2.5 16.667a5.833 5.833 0 0 1 8.75-5.053m3.837.474.513 1.035c.07.144.257.282.414.309l.93.155c.596.1.736.536.307.965l-.723.73a.64.64 0 0 0-.152.531l.207.903c.164.715-.213.991-.84.618l-.872-.52a.63.63 0 0 0-.577 0l-.872.52c-.624.373-1.003.094-.84-.618l.207-.903a.64.64 0 0 0-.152-.532l-.723-.729c-.426-.43-.289-.864.306-.964l.93-.156a.64.64 0 0 0 .412-.31l.513-1.034c.28-.562.735-.562 1.012 0"/>
+  </symbol>
+  <symbol id="x-icon" viewBox="0 0 19 19">
+    <path fill="#08060d" fill-rule="evenodd" d="M1.893 1.98c.052.072 1.245 1.769 2.653 3.77l2.892 4.114c.183.261.333.48.333.486s-.068.089-.152.183l-.522.593-.765.867-3.597 4.087c-.375.426-.734.834-.798.905a1 1 0 0 0-.118.148c0 .01.236.017.664.017h.663l.729-.83c.4-.457.796-.906.879-.999a692 692 0 0 0 1.794-2.038c.034-.037.301-.34.594-.675l.551-.624.345-.392a7 7 0 0 1 .34-.374c.006 0 .93 1.306 2.052 2.903l2.084 2.965.045.063h2.275c1.87 0 2.273-.003 2.266-.021-.008-.02-1.098-1.572-3.894-5.547-2.013-2.862-2.28-3.246-2.273-3.266.008-.019.282-.332 2.085-2.38l2-2.274 1.567-1.782c.022-.028-.016-.03-.65-.03h-.674l-.3.342a871 871 0 0 1-1.782 2.025c-.067.075-.405.458-.75.852a100 100 0 0 1-.803.91c-.148.172-.299.344-.99 1.127-.304.343-.32.358-.345.327-.015-.019-.904-1.282-1.976-2.808L6.365 1.85H1.8zm1.782.91 8.078 11.294c.772 1.08 1.413 1.973 1.425 1.984.016.017.241.02 1.05.017l1.03-.004-2.694-3.766L7.796 5.75 5.722 2.852l-1.039-.004-1.039-.004z" clip-rule="evenodd"/>
+  </symbol>
+</svg>
diff --git a/src/App.css b/src/App.css
new file mode 100644
index 0000000..f90339d
--- /dev/null
+++ b/src/App.css
@@ -0,0 +1,184 @@
+.counter {
+  font-size: 16px;
+  padding: 5px 10px;
+  border-radius: 5px;
+  color: var(--accent);
+  background: var(--accent-bg);
+  border: 2px solid transparent;
+  transition: border-color 0.3s;
+  margin-bottom: 24px;
+
+  &:hover {
+    border-color: var(--accent-border);
+  }
+  &:focus-visible {
+    outline: 2px solid var(--accent);
+    outline-offset: 2px;
+  }
+}
+
+.hero {
+  position: relative;
+
+  .base,
+  .framework,
+  .vite {
+    inset-inline: 0;
+    margin: 0 auto;
+  }
+
+  .base {
+    width: 170px;
+    position: relative;
+    z-index: 0;
+  }
+
+  .framework,
+  .vite {
+    position: absolute;
+  }
+
+  .framework {
+    z-index: 1;
+    top: 34px;
+    height: 28px;
+    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
+      scale(1.4);
+  }
+
+  .vite {
+    z-index: 0;
+    top: 107px;
+    height: 26px;
+    width: auto;
+    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
+      scale(0.8);
+  }
+}
+
+#center {
+  display: flex;
+  flex-direction: column;
+  gap: 25px;
+  place-content: center;
+  place-items: center;
+  flex-grow: 1;
+
+  @media (max-width: 1024px) {
+    padding: 32px 20px 24px;
+    gap: 18px;
+  }
+}
+
+#next-steps {
+  display: flex;
+  border-top: 1px solid var(--border);
+  text-align: left;
+
+  & > div {
+    flex: 1 1 0;
+    padding: 32px;
+    @media (max-width: 1024px) {
+      padding: 24px 20px;
+    }
+  }
+
+  .icon {
+    margin-bottom: 16px;
+    width: 22px;
+    height: 22px;
+  }
+
+  @media (max-width: 1024px) {
+    flex-direction: column;
+    text-align: center;
+  }
+}
+
+#docs {
+  border-right: 1px solid var(--border);
+
+  @media (max-width: 1024px) {
+    border-right: none;
+    border-bottom: 1px solid var(--border);
+  }
+}
+
+#next-steps ul {
+  list-style: none;
+  padding: 0;
+  display: flex;
+  gap: 8px;
+  margin: 32px 0 0;
+
+  .logo {
+    height: 18px;
+  }
+
+  a {
+    color: var(--text-h);
+    font-size: 16px;
+    border-radius: 6px;
+    background: var(--social-bg);
+    display: flex;
+    padding: 6px 12px;
+    align-items: center;
+    gap: 8px;
+    text-decoration: none;
+    transition: box-shadow 0.3s;
+
+    &:hover {
+      box-shadow: var(--shadow);
+    }
+    .button-icon {
+      height: 18px;
+      width: 18px;
+    }
+  }
+
+  @media (max-width: 1024px) {
+    margin-top: 20px;
+    flex-wrap: wrap;
+    justify-content: center;
+
+    li {
+      flex: 1 1 calc(50% - 8px);
+    }
+
+    a {
+      width: 100%;
+      justify-content: center;
+      box-sizing: border-box;
+    }
+  }
+}
+
+#spacer {
+  height: 88px;
+  border-top: 1px solid var(--border);
+  @media (max-width: 1024px) {
+    height: 48px;
+  }
+}
+
+.ticks {
+  position: relative;
+  width: 100%;
+
+  &::before,
+  &::after {
+    content: '';
+    position: absolute;
+    top: -4.5px;
+    border: 5px solid transparent;
+  }
+
+  &::before {
+    left: 0;
+    border-left-color: var(--border);
+  }
+  &::after {
+    right: 0;
+    border-right-color: var(--border);
+  }
+}
diff --git a/src/App.jsx b/src/App.jsx
new file mode 100644
index 0000000..174b3f1
--- /dev/null
+++ b/src/App.jsx
@@ -0,0 +1,122 @@
+import { useState } from 'react'
+import heroImg from './assets/hero.png'
+import reactLogo from './assets/react.svg'
+import viteLogo from './assets/vite.svg'
+import './App.css'
+
+function App() {
+  const [count, setCount] = useState(0)
+
+  return (
+    <>
+      <section id="center">
+        <div className="hero">
+          <img src={heroImg} className="base" width="170" height="179" alt="" />
+          <img src={reactLogo} className="framework" alt="React logo" />
+          <img src={viteLogo} className="vite" alt="Vite logo" />
+        </div>
+        <div>
+          <h1>Get started</h1>
+          <p>
+            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
+          </p>
+        </div>
+        <button
+          type="button"
+          className="counter"
+          onClick={() => setCount((count) => count + 1)}
+        >
+          Count is {count}
+        </button>
+      </section>
+
+      <div className="ticks"></div>
+
+      <section id="next-steps">
+        <div id="docs">
+          <svg className="icon" role="presentation" aria-hidden="true">
+            <use href="/icons.svg#documentation-icon"></use>
+          </svg>
+          <h2>Documentation</h2>
+          <p>Your questions, answered</p>
+          <ul>
+            <li>
+              <a href="https://vite.dev/" target="_blank">
+                <img className="logo" src={viteLogo} alt="" />
+                Explore Vite
+              </a>
+            </li>
+            <li>
+              <a href="https://react.dev/" target="_blank">
+                <img className="button-icon" src={reactLogo} alt="" />
+                Learn more
+              </a>
+            </li>
+          </ul>
+        </div>
+        <div id="social">
+          <svg className="icon" role="presentation" aria-hidden="true">
+            <use href="/icons.svg#social-icon"></use>
+          </svg>
+          <h2>Connect with us</h2>
+          <p>Join the Vite community</p>
+          <ul>
+            <li>
+              <a href="https://github.com/vitejs/vite" target="_blank">
+                <svg
+                  className="button-icon"
+                  role="presentation"
+                  aria-hidden="true"
+                >
+                  <use href="/icons.svg#github-icon"></use>
+                </svg>
+                GitHub
+              </a>
+            </li>
+            <li>
+              <a href="https://chat.vite.dev/" target="_blank">
+                <svg
+                  className="button-icon"
+                  role="presentation"
+                  aria-hidden="true"
+                >
+                  <use href="/icons.svg#discord-icon"></use>
+                </svg>
+                Discord
+              </a>
+            </li>
+            <li>
+              <a href="https://x.com/vite_js" target="_blank">
+                <svg
+                  className="button-icon"
+                  role="presentation"
+                  aria-hidden="true"
+                >
+                  <use href="/icons.svg#x-icon"></use>
+                </svg>
+                X.com
+              </a>
+            </li>
+            <li>
+              <a href="https://bsky.app/profile/vite.dev" target="_blank">
+                <svg
+                  className="button-icon"
+                  role="presentation"
+                  aria-hidden="true"
+                >
+                  <use href="/icons.svg#bluesky-icon"></use>
+                </svg>
+                Bluesky
+              </a>
+            </li>
+          </ul>
+        </div>
+      </section>
+
+      <div className="ticks"></div>
+      <section id="spacer"></section>
+    </>
+  )
+}
+
+export default App
diff --git a/src/assets/hero.png b/src/assets/hero.png
new file mode 100644
index 0000000..02251f4
Binary files /dev/null and b/src/assets/hero.png differ
diff --git a/src/assets/react.svg b/src/assets/react.svg
new file mode 100644
index 0000000..6c87de9
--- /dev/null
+++ b/src/assets/react.svg
@@ -0,0 +1 @@
+<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
\ No newline at end of file
diff --git a/src/assets/vite.svg b/src/assets/vite.svg
new file mode 100644
index 0000000..5101b67
--- /dev/null
+++ b/src/assets/vite.svg
@@ -0,0 +1 @@
+<svg xmlns="http://www.w3.org/2000/svg" width="77" height="47" fill="none" aria-labelledby="vite-logo-title" viewBox="0 0 77 47"><title id="vite-logo-title">Vite</title><style>.parenthesis{fill:#000}@media (prefers-color-scheme:dark){.parenthesis{fill:#fff}}</style><path fill="#9135ff" d="M40.151 45.71c-.663.844-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.493c-.92 0-1.457-1.04-.92-1.788l7.479-10.471c1.07-1.498 0-3.578-1.842-3.578H15.443c-.92 0-1.456-1.04-.92-1.788l9.696-13.576c.213-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.472c-1.07 1.497 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.087.89 1.83L40.153 45.712z"/><mask id="a" width="48" height="47" x="14" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M40.047 45.71c-.663.843-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.389c-.92 0-1.457-1.04-.92-1.788l7.479-10.472c1.07-1.497 0-3.578-1.842-3.578H15.34c-.92 0-1.456-1.04-.92-1.788l9.696-13.575c.213-.297.556-.474.92-.474H53.93c.92 0 1.456 1.04.92 1.788L47.37 13.03c-1.07 1.498 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.088.89 1.831L40.049 45.712z"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#eee6ff" rx="5.508" ry="14.704" transform="rotate(269.814 20.96 11.29)scale(-1 1)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#eee6ff" rx="10.399" ry="29.851" transform="rotate(89.814 -16.902 -8.275)scale(1 -1)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#8900ff" rx="5.508" ry="30.487" transform="rotate(89.814 -19.197 -7.127)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.928 4.177)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.738 5.52)scale(1 -1)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#eee6ff" rx="14.072" ry="22.078" transform="rotate(93.35 31.245 55.578)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx="14.592" cy="9.743" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(39.51 14.592 9.743)"/></g><g filter="url(#k)"><ellipse cx="61.728" cy="-5.321" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 61.728 -5.32)"/></g><g filter="url(#l)"><ellipse cx="55.618" cy="7.104" fill="#00c2ff" rx="5.971" ry="9.665" transform="rotate(37.892 55.618 7.104)"/></g><g filter="url(#m)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#n)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#o)"><ellipse cx="49.857" cy="30.678" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 49.857 30.678)"/></g><g filter="url(#p)"><ellipse cx="52.623" cy="33.171" fill="#00c2ff" rx="5.971" ry="15.297" transform="rotate(37.892 52.623 33.17)"/></g></g><path d="M6.919 0c-9.198 13.166-9.252 33.575 0 46.789h6.215c-9.25-13.214-9.196-33.623 0-46.789zm62.424 0h-6.215c9.198 13.166 9.252 33.575 0 46.789h6.215c9.25-13.214 9.196-33.623 0-46.789" class="parenthesis"/><defs><filter id="b" width="60.045" height="41.654" x="-5.564" y="16.92" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-40.407" y="-6.762" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-35.435" y="2.801" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-30.84" y="20.8" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-29.307" y="21.949" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="29.961" y="-17.13" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-13.43" y="-22.082" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="34.321" y="-37.644" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="38.847" y="-10.552" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="22.45" y="-1.645" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="32.919" y="11.36" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter></defs></svg>
diff --git a/src/index.css b/src/index.css
new file mode 100644
index 0000000..2c84af0
--- /dev/null
+++ b/src/index.css
@@ -0,0 +1,111 @@
+:root {
+  --text: #6b6375;
+  --text-h: #08060d;
+  --bg: #fff;
+  --border: #e5e4e7;
+  --code-bg: #f4f3ec;
+  --accent: #aa3bff;
+  --accent-bg: rgba(170, 59, 255, 0.1);
+  --accent-border: rgba(170, 59, 255, 0.5);
+  --social-bg: rgba(244, 243, 236, 0.5);
+  --shadow:
+    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
+
+  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
+  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
+  --mono: ui-monospace, Consolas, monospace;
+
+  font: 18px/145% var(--sans);
+  letter-spacing: 0.18px;
+  color-scheme: light dark;
+  color: var(--text);
+  background: var(--bg);
+  font-synthesis: none;
+  text-rendering: optimizeLegibility;
+  -webkit-font-smoothing: antialiased;
+  -moz-osx-font-smoothing: grayscale;
+
+  @media (max-width: 1024px) {
+    font-size: 16px;
+  }
+}
+
+@media (prefers-color-scheme: dark) {
+  :root {
+    --text: #9ca3af;
+    --text-h: #f3f4f6;
+    --bg: #16171d;
+    --border: #2e303a;
+    --code-bg: #1f2028;
+    --accent: #c084fc;
+    --accent-bg: rgba(192, 132, 252, 0.15);
+    --accent-border: rgba(192, 132, 252, 0.5);
+    --social-bg: rgba(47, 48, 58, 0.5);
+    --shadow:
+      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
+  }
+
+  #social .button-icon {
+    filter: invert(1) brightness(2);
+  }
+}
+
+body {
+  margin: 0;
+}
+
+#root {
+  width: 1126px;
+  max-width: 100%;
+  margin: 0 auto;
+  text-align: center;
+  border-inline: 1px solid var(--border);
+  min-height: 100svh;
+  display: flex;
+  flex-direction: column;
+  box-sizing: border-box;
+}
+
+h1,
+h2 {
+  font-family: var(--heading);
+  font-weight: 500;
+  color: var(--text-h);
+}
+
+h1 {
+  font-size: 56px;
+  letter-spacing: -1.68px;
+  margin: 32px 0;
+  @media (max-width: 1024px) {
+    font-size: 36px;
+    margin: 20px 0;
+  }
+}
+h2 {
+  font-size: 24px;
+  line-height: 118%;
+  letter-spacing: -0.24px;
+  margin: 0 0 8px;
+  @media (max-width: 1024px) {
+    font-size: 20px;
+  }
+}
+p {
+  margin: 0;
+}
+
+code,
+.counter {
+  font-family: var(--mono);
+  display: inline-flex;
+  border-radius: 4px;
+  color: var(--text-h);
+}
+
+code {
+  font-size: 15px;
+  line-height: 135%;
+  padding: 4px 8px;
+  background: var(--code-bg);
+}
diff --git a/src/main.jsx b/src/main.jsx
new file mode 100644
index 0000000..b9a1a6d
--- /dev/null
+++ b/src/main.jsx
@@ -0,0 +1,10 @@
+import { StrictMode } from 'react'
+import { createRoot } from 'react-dom/client'
+import './index.css'
+import App from './App.jsx'
+
+createRoot(document.getElementById('root')).render(
+  <StrictMode>
+    <App />
+  </StrictMode>,
+)
diff --git a/vite.config.js b/vite.config.js
new file mode 100644
index 0000000..9982072
--- /dev/null
+++ b/vite.config.js
@@ -0,0 +1,7 @@
+import react from '@vitejs/plugin-react'
+import { defineConfig } from 'vite'
+
+// https://vite.dev/config/
+export default defineConfig({
+  plugins: [react()],
+})
```

## Exact source snapshot

### `.gitattributes`

```text
* text=auto eol=lf
```

### `.gitignore`

```text
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>wineshoppos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `package.json`

```json
{
  "name": "wineshoppos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^1.37.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "oxlint": "^1.79.0",
    "vite": "^8.2.2"
  }
}
```

### `src/App.css`

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
```

### `src/App.jsx`

```javascript
import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
```

### `src/index.css`

```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }

  #social .button-icon {
    filter: invert(1) brightness(2);
  }
}

body {
  margin: 0;
}

#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

h1,
h2 {
  font-family: var(--heading);
  font-weight: 500;
  color: var(--text-h);
}

h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
p {
  margin: 0;
}

code,
.counter {
  font-family: var(--mono);
  display: inline-flex;
  border-radius: 4px;
  color: var(--text-h);
}

code {
  font-size: 15px;
  line-height: 135%;
  padding: 4px 8px;
  background: var(--code-bg);
}
```

### `src/main.jsx`

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### `vite.config.js`

```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

# Milestone: Chapters 2, 3, 4, 5, 6

## Commit metadata

```text
Commit: d6d8334dae5b3821b43411cc070156bdfaae3f87
Short: d6d8334
Author: saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
Date: 2026-08-29T08:48:04-04:00
Subject: Chapters 2-6 - POS UI barcode billing and local inventory
```

## Exact patch

```diff
commit d6d8334dae5b3821b43411cc070156bdfaae3f87
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Sat Aug 29 08:48:04 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Sat Aug 29 08:48:04 2026 -0400

    Chapters 2-6 - POS UI barcode billing and local inventory
---
 src/App.jsx                 |  159 ++-----
 src/components/Layout.jsx   |  124 +++++
 src/context/ShopContext.jsx |  148 ++++++
 src/data/products.js        |  707 +++++++++++++++++++++++++++++
 src/index.css               | 1055 +++++++++++++++++++++++++++++++++++++++----
 src/main.jsx                |   22 +-
 src/pages/Dashboard.jsx     |  165 +++++++
 src/pages/Inventory.jsx     |  115 +++++
 src/pages/POS.jsx           |  444 ++++++++++++++++++
 src/pages/Placeholder.jsx   |   19 +
 src/pages/Products.jsx      |   99 ++++
 src/pages/Sales.jsx         |   78 ++++
 src/pages/Settings.jsx      |   64 +++
 13 files changed, 2985 insertions(+), 214 deletions(-)

diff --git a/src/App.jsx b/src/App.jsx
index 174b3f1..def6000 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -1,122 +1,49 @@
-import { useState } from 'react'
-import heroImg from './assets/hero.png'
-import reactLogo from './assets/react.svg'
-import viteLogo from './assets/vite.svg'
-import './App.css'
-
-function App() {
-  const [count, setCount] = useState(0)
+import { Route, Routes } from "react-router-dom";
+import Layout from "./components/Layout";
+import Dashboard from "./pages/Dashboard";
+import Inventory from "./pages/Inventory";
+import POS from "./pages/POS";
+import Placeholder from "./pages/Placeholder";
+import Products from "./pages/Products";
+import Sales from "./pages/Sales";
+import Settings from "./pages/Settings";

+export default function App() {
   return (
-    <>
-      <section id="center">
-        <div className="hero">
-          <img src={heroImg} className="base" width="170" height="179" alt="" />
-          <img src={reactLogo} className="framework" alt="React logo" />
-          <img src={viteLogo} className="vite" alt="Vite logo" />
-        </div>
-        <div>
-          <h1>Get started</h1>
-          <p>
-            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
-          </p>
-        </div>
-        <button
-          type="button"
-          className="counter"
-          onClick={() => setCount((count) => count + 1)}
-        >
-          Count is {count}
-        </button>
-      </section>
+    <Routes>
+      <Route element={<Layout />}>
+        <Route index element={<Dashboard />} />

-      <div className="ticks"></div>
+        <Route path="pos" element={<POS />} />

-      <section id="next-steps">
-        <div id="docs">
-          <svg className="icon" role="presentation" aria-hidden="true">
-            <use href="/icons.svg#documentation-icon"></use>
-          </svg>
-          <h2>Documentation</h2>
-          <p>Your questions, answered</p>
-          <ul>
-            <li>
-              <a href="https://vite.dev/" target="_blank">
-                <img className="logo" src={viteLogo} alt="" />
-                Explore Vite
-              </a>
-            </li>
-            <li>
-              <a href="https://react.dev/" target="_blank">
-                <img className="button-icon" src={reactLogo} alt="" />
-                Learn more
-              </a>
-            </li>
-          </ul>
-        </div>
-        <div id="social">
-          <svg className="icon" role="presentation" aria-hidden="true">
-            <use href="/icons.svg#social-icon"></use>
-          </svg>
-          <h2>Connect with us</h2>
-          <p>Join the Vite community</p>
-          <ul>
-            <li>
-              <a href="https://github.com/vitejs/vite" target="_blank">
-                <svg
-                  className="button-icon"
-                  role="presentation"
-                  aria-hidden="true"
-                >
-                  <use href="/icons.svg#github-icon"></use>
-                </svg>
-                GitHub
-              </a>
-            </li>
-            <li>
-              <a href="https://chat.vite.dev/" target="_blank">
-                <svg
-                  className="button-icon"
-                  role="presentation"
-                  aria-hidden="true"
-                >
-                  <use href="/icons.svg#discord-icon"></use>
-                </svg>
-                Discord
-              </a>
-            </li>
-            <li>
-              <a href="https://x.com/vite_js" target="_blank">
-                <svg
-                  className="button-icon"
-                  role="presentation"
-                  aria-hidden="true"
-                >
-                  <use href="/icons.svg#x-icon"></use>
-                </svg>
-                X.com
-              </a>
-            </li>
-            <li>
-              <a href="https://bsky.app/profile/vite.dev" target="_blank">
-                <svg
-                  className="button-icon"
-                  role="presentation"
-                  aria-hidden="true"
-                >
-                  <use href="/icons.svg#bluesky-icon"></use>
-                </svg>
-                Bluesky
-              </a>
-            </li>
-          </ul>
-        </div>
-      </section>
+        <Route path="products" element={<Products />} />

-      <div className="ticks"></div>
-      <section id="spacer"></section>
-    </>
-  )
-}
+        <Route path="inventory" element={<Inventory />} />
+
+        <Route
+          path="purchases"
+          element={
+            <Placeholder
+              title="Purchases"
+              description="Supplier purchases and receive-stock workflow"
+            />
+          }
+        />

-export default App
+        <Route path="sales" element={<Sales />} />
+
+        <Route
+          path="reports"
+          element={
+            <Placeholder
+              title="Reports"
+              description="Sales, inventory and performance reporting"
+            />
+          }
+        />
+
+        <Route path="settings" element={<Settings />} />
+      </Route>
+    </Routes>
+  );
+}
diff --git a/src/components/Layout.jsx b/src/components/Layout.jsx
new file mode 100644
index 0000000..42789ba
--- /dev/null
+++ b/src/components/Layout.jsx
@@ -0,0 +1,124 @@
+import { NavLink, Outlet } from "react-router-dom";
+import {
+  BarChart3,
+  LayoutDashboard,
+  Package,
+  ReceiptText,
+  ScanBarcode,
+  Settings,
+  ShoppingBag,
+  Truck,
+  Warehouse,
+  Wine,
+} from "lucide-react";
+
+const navigation = [
+  {
+    path: "/",
+    label: "Dashboard",
+    icon: LayoutDashboard,
+  },
+  {
+    path: "/pos",
+    label: "POS Billing",
+    icon: ScanBarcode,
+  },
+  {
+    path: "/products",
+    label: "Products",
+    icon: Package,
+  },
+  {
+    path: "/inventory",
+    label: "Inventory",
+    icon: Warehouse,
+  },
+  {
+    path: "/purchases",
+    label: "Purchases",
+    icon: Truck,
+  },
+  {
+    path: "/sales",
+    label: "Sales",
+    icon: ReceiptText,
+  },
+  {
+    path: "/reports",
+    label: "Reports",
+    icon: BarChart3,
+  },
+  {
+    path: "/settings",
+    label: "Settings",
+    icon: Settings,
+  },
+];
+
+export default function Layout() {
+  return (
+    <div className="app-shell">
+      <aside className="sidebar">
+        <div className="brand">
+          <div className="brand-icon">
+            <Wine size={25} />
+          </div>
+
+          <div>
+            <div className="brand-name">WineShop POS</div>
+            <div className="brand-subtitle">Retail Management</div>
+          </div>
+        </div>
+
+        <nav className="nav-menu">
+          {navigation.map((item) => {
+            const Icon = item.icon;
+
+            return (
+              <NavLink
+                key={item.path}
+                to={item.path}
+                end={item.path === "/"}
+                className={({ isActive }) =>
+                  isActive ? "nav-item active" : "nav-item"
+                }
+              >
+                <Icon size={19} />
+                <span>{item.label}</span>
+              </NavLink>
+            );
+          })}
+        </nav>
+
+        <div className="sidebar-footer">
+          <ShoppingBag size={18} />
+          <div>
+            <strong>Demo Store</strong>
+            <span>Local prototype</span>
+          </div>
+        </div>
+      </aside>
+
+      <main className="main-area">
+        <header className="topbar">
+          <div>
+            <h1>Wine Shop Management</h1>
+            <p>Barcode billing & inventory</p>
+          </div>
+
+          <div className="user-pill">
+            <div className="avatar">A</div>
+            <div>
+              <strong>Admin</strong>
+              <span>Administrator</span>
+            </div>
+          </div>
+        </header>
+
+        <div className="page-area">
+          <Outlet />
+        </div>
+      </main>
+    </div>
+  );
+}
diff --git a/src/context/ShopContext.jsx b/src/context/ShopContext.jsx
new file mode 100644
index 0000000..2a6a22e
--- /dev/null
+++ b/src/context/ShopContext.jsx
@@ -0,0 +1,148 @@
+import { createContext, useContext, useEffect, useState } from "react";
+import { products } from "../data/products";
+
+const ShopContext = createContext(null);
+
+const INVENTORY_KEY = "wineshop_inventory_v1";
+const SALES_KEY = "wineshop_sales_v1";
+
+function createInitialInventory() {
+  let saved = {};
+
+  try {
+    saved = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {};
+  } catch {
+    saved = {};
+  }
+
+  return products.reduce((result, product) => {
+    result[product.id] =
+      typeof saved[product.id] === "number"
+        ? saved[product.id]
+        : product.openingStock;
+
+    return result;
+  }, {});
+}
+
+function createInitialSales() {
+  try {
+    return JSON.parse(localStorage.getItem(SALES_KEY)) || [];
+  } catch {
+    return [];
+  }
+}
+
+export function ShopProvider({ children }) {
+  const [inventory, setInventory] = useState(createInitialInventory);
+  const [sales, setSales] = useState(createInitialSales);
+
+  useEffect(() => {
+    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
+  }, [inventory]);
+
+  useEffect(() => {
+    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
+  }, [sales]);
+
+  function getStock(productId) {
+    return inventory[productId] ?? 0;
+  }
+
+  function completeSale(cart, paymentMethod) {
+    if (!cart.length) {
+      return {
+        ok: false,
+        message: "Cart is empty.",
+      };
+    }
+
+    for (const item of cart) {
+      const available = inventory[item.product.id] ?? 0;
+
+      if (item.quantity > available) {
+        return {
+          ok: false,
+          message: `Only ${available} unit(s) of ${item.product.name} are available.`,
+        };
+      }
+    }
+
+    const updatedInventory = { ...inventory };
+
+    cart.forEach((item) => {
+      updatedInventory[item.product.id] -= item.quantity;
+    });
+
+    const subtotal = cart.reduce(
+      (total, item) => total + item.product.price * item.quantity,
+      0
+    );
+
+    const invoiceNumber = `INV-${new Date()
+      .toISOString()
+      .slice(0, 10)
+      .replaceAll("-", "")}-${String(sales.length + 1).padStart(4, "0")}`;
+
+    const sale = {
+      id: crypto.randomUUID(),
+      invoiceNumber,
+      createdAt: new Date().toISOString(),
+      paymentMethod,
+      subtotal,
+      discount: 0,
+      grandTotal: subtotal,
+      items: cart.map((item) => ({
+        productId: item.product.id,
+        productName: item.product.name,
+        barcode: item.product.barcode,
+        quantity: item.quantity,
+        unitPrice: item.product.price,
+        lineTotal: item.product.price * item.quantity,
+      })),
+    };
+
+    setInventory(updatedInventory);
+    setSales((currentSales) => [sale, ...currentSales]);
+
+    return {
+      ok: true,
+      sale,
+    };
+  }
+
+  function resetDemo() {
+    const initialInventory = products.reduce((result, product) => {
+      result[product.id] = product.openingStock;
+      return result;
+    }, {});
+
+    setInventory(initialInventory);
+    setSales([]);
+  }
+
+  return (
+    <ShopContext.Provider
+      value={{
+        products,
+        inventory,
+        sales,
+        getStock,
+        completeSale,
+        resetDemo,
+      }}
+    >
+      {children}
+    </ShopContext.Provider>
+  );
+}
+
+export function useShop() {
+  const context = useContext(ShopContext);
+
+  if (!context) {
+    throw new Error("useShop must be used inside ShopProvider");
+  }
+
+  return context;
+}
diff --git a/src/data/products.js b/src/data/products.js
new file mode 100644
index 0000000..98d3b0b
--- /dev/null
+++ b/src/data/products.js
@@ -0,0 +1,707 @@
+export const products = [
+  {
+    id: "p001",
+    barcode: "8900000010001",
+    sku: "WH-RS-180",
+    name: "Royal Stag 180ml",
+    brand: "Royal Stag",
+    category: "Whisky",
+    size: "180 ml",
+    purchasePrice: 150,
+    price: 210,
+    minimumStock: 12,
+    unitsPerCase: 48,
+    openingStock: 48,
+  },
+  {
+    id: "p002",
+    barcode: "8900000010002",
+    sku: "WH-RS-375",
+    name: "Royal Stag 375ml",
+    brand: "Royal Stag",
+    category: "Whisky",
+    size: "375 ml",
+    purchasePrice: 285,
+    price: 410,
+    minimumStock: 10,
+    unitsPerCase: 24,
+    openingStock: 30,
+  },
+  {
+    id: "p003",
+    barcode: "8900000010003",
+    sku: "WH-RS-750",
+    name: "Royal Stag 750ml",
+    brand: "Royal Stag",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 540,
+    price: 780,
+    minimumStock: 12,
+    unitsPerCase: 12,
+    openingStock: 36,
+  },
+  {
+    id: "p004",
+    barcode: "8900000010004",
+    sku: "WH-BP-375",
+    name: "Blenders Pride 375ml",
+    brand: "Blenders Pride",
+    category: "Whisky",
+    size: "375 ml",
+    purchasePrice: 620,
+    price: 850,
+    minimumStock: 8,
+    unitsPerCase: 24,
+    openingStock: 20,
+  },
+  {
+    id: "p005",
+    barcode: "8900000010005",
+    sku: "WH-BP-750",
+    name: "Blenders Pride 750ml",
+    brand: "Blenders Pride",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 1200,
+    price: 1650,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 24,
+  },
+  {
+    id: "p006",
+    barcode: "8900000010006",
+    sku: "WH-IB-180",
+    name: "Imperial Blue 180ml",
+    brand: "Imperial Blue",
+    category: "Whisky",
+    size: "180 ml",
+    purchasePrice: 125,
+    price: 180,
+    minimumStock: 12,
+    unitsPerCase: 48,
+    openingStock: 45,
+  },
+  {
+    id: "p007",
+    barcode: "8900000010007",
+    sku: "WH-IB-375",
+    name: "Imperial Blue 375ml",
+    brand: "Imperial Blue",
+    category: "Whisky",
+    size: "375 ml",
+    purchasePrice: 245,
+    price: 350,
+    minimumStock: 10,
+    unitsPerCase: 24,
+    openingStock: 32,
+  },
+  {
+    id: "p008",
+    barcode: "8900000010008",
+    sku: "WH-IB-750",
+    name: "Imperial Blue 750ml",
+    brand: "Imperial Blue",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 460,
+    price: 680,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 28,
+  },
+  {
+    id: "p009",
+    barcode: "8900000010009",
+    sku: "WH-MD1-750",
+    name: "McDowell's No.1 750ml",
+    brand: "McDowell's",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 500,
+    price: 730,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 30,
+  },
+  {
+    id: "p010",
+    barcode: "8900000010010",
+    sku: "WH-RC-750",
+    name: "Royal Challenge 750ml",
+    brand: "Royal Challenge",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 620,
+    price: 850,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 24,
+  },
+  {
+    id: "p011",
+    barcode: "8900000010011",
+    sku: "WH-SIG-750",
+    name: "Signature Rare Aged 750ml",
+    brand: "Signature",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 780,
+    price: 1100,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 18,
+  },
+  {
+    id: "p012",
+    barcode: "8900000010012",
+    sku: "WH-AB-750",
+    name: "Antiquity Blue 750ml",
+    brand: "Antiquity",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 1100,
+    price: 1550,
+    minimumStock: 6,
+    unitsPerCase: 12,
+    openingStock: 15,
+  },
+  {
+    id: "p013",
+    barcode: "8900000010013",
+    sku: "WH-OC-750",
+    name: "Officer's Choice 750ml",
+    brand: "Officer's Choice",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 390,
+    price: 570,
+    minimumStock: 12,
+    unitsPerCase: 12,
+    openingStock: 34,
+  },
+  {
+    id: "p014",
+    barcode: "8900000010014",
+    sku: "WH-8PM-750",
+    name: "8PM Whisky 750ml",
+    brand: "8PM",
+    category: "Whisky",
+    size: "750 ml",
+    purchasePrice: 430,
+    price: 620,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 27,
+  },
+
+  {
+    id: "p015",
+    barcode: "8900000010015",
+    sku: "BE-KFP-650",
+    name: "Kingfisher Premium 650ml",
+    brand: "Kingfisher",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 105,
+    price: 160,
+    minimumStock: 24,
+    unitsPerCase: 12,
+    openingStock: 72,
+  },
+  {
+    id: "p016",
+    barcode: "8900000010016",
+    sku: "BE-KFS-650",
+    name: "Kingfisher Strong 650ml",
+    brand: "Kingfisher",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 120,
+    price: 180,
+    minimumStock: 24,
+    unitsPerCase: 12,
+    openingStock: 84,
+  },
+  {
+    id: "p017",
+    barcode: "8900000010017",
+    sku: "BE-KFU-330",
+    name: "Kingfisher Ultra 330ml",
+    brand: "Kingfisher",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 95,
+    price: 150,
+    minimumStock: 18,
+    unitsPerCase: 24,
+    openingStock: 48,
+  },
+  {
+    id: "p018",
+    barcode: "8900000010018",
+    sku: "BE-KFUM-650",
+    name: "Kingfisher Ultra Max 650ml",
+    brand: "Kingfisher",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 150,
+    price: 220,
+    minimumStock: 18,
+    unitsPerCase: 12,
+    openingStock: 48,
+  },
+  {
+    id: "p019",
+    barcode: "8900000010019",
+    sku: "BE-TS-650",
+    name: "Tuborg Strong 650ml",
+    brand: "Tuborg",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 125,
+    price: 190,
+    minimumStock: 24,
+    unitsPerCase: 12,
+    openingStock: 78,
+  },
+  {
+    id: "p020",
+    barcode: "8900000010020",
+    sku: "BE-TG-650",
+    name: "Tuborg Green 650ml",
+    brand: "Tuborg",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 115,
+    price: 175,
+    minimumStock: 18,
+    unitsPerCase: 12,
+    openingStock: 60,
+  },
+  {
+    id: "p021",
+    barcode: "8900000010021",
+    sku: "BE-BUD-330",
+    name: "Budweiser Premium 330ml",
+    brand: "Budweiser",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 110,
+    price: 170,
+    minimumStock: 18,
+    unitsPerCase: 24,
+    openingStock: 42,
+  },
+  {
+    id: "p022",
+    barcode: "8900000010022",
+    sku: "BE-BM-500",
+    name: "Budweiser Magnum 500ml",
+    brand: "Budweiser",
+    category: "Beer",
+    size: "500 ml",
+    purchasePrice: 135,
+    price: 210,
+    minimumStock: 18,
+    unitsPerCase: 24,
+    openingStock: 50,
+  },
+  {
+    id: "p023",
+    barcode: "8900000010023",
+    sku: "BE-CE-650",
+    name: "Carlsberg Elephant 650ml",
+    brand: "Carlsberg",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 130,
+    price: 200,
+    minimumStock: 18,
+    unitsPerCase: 12,
+    openingStock: 54,
+  },
+  {
+    id: "p024",
+    barcode: "8900000010024",
+    sku: "BE-CS-650",
+    name: "Carlsberg Smooth 650ml",
+    brand: "Carlsberg",
+    category: "Beer",
+    size: "650 ml",
+    purchasePrice: 120,
+    price: 185,
+    minimumStock: 18,
+    unitsPerCase: 12,
+    openingStock: 55,
+  },
+  {
+    id: "p025",
+    barcode: "8900000010025",
+    sku: "BE-HEI-330",
+    name: "Heineken 330ml",
+    brand: "Heineken",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 115,
+    price: 180,
+    minimumStock: 12,
+    unitsPerCase: 24,
+    openingStock: 36,
+  },
+  {
+    id: "p026",
+    barcode: "8900000010026",
+    sku: "BE-B91B-330",
+    name: "Bira 91 Blonde 330ml",
+    brand: "Bira 91",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 105,
+    price: 165,
+    minimumStock: 12,
+    unitsPerCase: 24,
+    openingStock: 30,
+  },
+  {
+    id: "p027",
+    barcode: "8900000010027",
+    sku: "BE-B91W-330",
+    name: "Bira 91 White 330ml",
+    brand: "Bira 91",
+    category: "Beer",
+    size: "330 ml",
+    purchasePrice: 115,
+    price: 180,
+    minimumStock: 12,
+    unitsPerCase: 24,
+    openingStock: 34,
+  },
+
+  {
+    id: "p028",
+    barcode: "8900000010028",
+    sku: "RU-OM-180",
+    name: "Old Monk 180ml",
+    brand: "Old Monk",
+    category: "Rum",
+    size: "180 ml",
+    purchasePrice: 130,
+    price: 190,
+    minimumStock: 12,
+    unitsPerCase: 48,
+    openingStock: 38,
+  },
+  {
+    id: "p029",
+    barcode: "8900000010029",
+    sku: "RU-OM-375",
+    name: "Old Monk 375ml",
+    brand: "Old Monk",
+    category: "Rum",
+    size: "375 ml",
+    purchasePrice: 260,
+    price: 380,
+    minimumStock: 10,
+    unitsPerCase: 24,
+    openingStock: 28,
+  },
+  {
+    id: "p030",
+    barcode: "8900000010030",
+    sku: "RU-OM-750",
+    name: "Old Monk 750ml",
+    brand: "Old Monk",
+    category: "Rum",
+    size: "750 ml",
+    purchasePrice: 500,
+    price: 720,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 31,
+  },
+  {
+    id: "p031",
+    barcode: "8900000010031",
+    sku: "RU-MCR-750",
+    name: "McDowell's Celebration Rum 750ml",
+    brand: "McDowell's",
+    category: "Rum",
+    size: "750 ml",
+    purchasePrice: 430,
+    price: 630,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 24,
+  },
+  {
+    id: "p032",
+    barcode: "8900000010032",
+    sku: "RU-CON-750",
+    name: "Contessa Rum 750ml",
+    brand: "Contessa",
+    category: "Rum",
+    size: "750 ml",
+    purchasePrice: 410,
+    price: 600,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 20,
+  },
+
+  {
+    id: "p033",
+    barcode: "8900000010033",
+    sku: "VO-MM-180",
+    name: "Magic Moments 180ml",
+    brand: "Magic Moments",
+    category: "Vodka",
+    size: "180 ml",
+    purchasePrice: 140,
+    price: 210,
+    minimumStock: 10,
+    unitsPerCase: 48,
+    openingStock: 35,
+  },
+  {
+    id: "p034",
+    barcode: "8900000010034",
+    sku: "VO-MM-375",
+    name: "Magic Moments 375ml",
+    brand: "Magic Moments",
+    category: "Vodka",
+    size: "375 ml",
+    purchasePrice: 280,
+    price: 410,
+    minimumStock: 10,
+    unitsPerCase: 24,
+    openingStock: 28,
+  },
+  {
+    id: "p035",
+    barcode: "8900000010035",
+    sku: "VO-MM-750",
+    name: "Magic Moments 750ml",
+    brand: "Magic Moments",
+    category: "Vodka",
+    size: "750 ml",
+    purchasePrice: 540,
+    price: 790,
+    minimumStock: 10,
+    unitsPerCase: 12,
+    openingStock: 26,
+  },
+  {
+    id: "p036",
+    barcode: "8900000010036",
+    sku: "VO-ROM-750",
+    name: "Romanov 750ml",
+    brand: "Romanov",
+    category: "Vodka",
+    size: "750 ml",
+    purchasePrice: 420,
+    price: 620,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 21,
+  },
+  {
+    id: "p037",
+    barcode: "8900000010037",
+    sku: "VO-SMI-375",
+    name: "Smirnoff 375ml",
+    brand: "Smirnoff",
+    category: "Vodka",
+    size: "375 ml",
+    purchasePrice: 420,
+    price: 610,
+    minimumStock: 8,
+    unitsPerCase: 24,
+    openingStock: 18,
+  },
+  {
+    id: "p038",
+    barcode: "8900000010038",
+    sku: "VO-SMI-750",
+    name: "Smirnoff 750ml",
+    brand: "Smirnoff",
+    category: "Vodka",
+    size: "750 ml",
+    purchasePrice: 820,
+    price: 1180,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 22,
+  },
+  {
+    id: "p039",
+    barcode: "8900000010039",
+    sku: "VO-WM-750",
+    name: "White Mischief 750ml",
+    brand: "White Mischief",
+    category: "Vodka",
+    size: "750 ml",
+    purchasePrice: 390,
+    price: 570,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 19,
+  },
+
+  {
+    id: "p040",
+    barcode: "8900000010040",
+    sku: "BR-MH-750",
+    name: "Mansion House 750ml",
+    brand: "Mansion House",
+    category: "Brandy",
+    size: "750 ml",
+    purchasePrice: 610,
+    price: 890,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 22,
+  },
+  {
+    id: "p041",
+    barcode: "8900000010041",
+    sku: "BR-MOR-750",
+    name: "Morpheus Brandy 750ml",
+    brand: "Morpheus",
+    category: "Brandy",
+    size: "750 ml",
+    purchasePrice: 780,
+    price: 1120,
+    minimumStock: 6,
+    unitsPerCase: 12,
+    openingStock: 16,
+  },
+  {
+    id: "p042",
+    barcode: "8900000010042",
+    sku: "BR-HB-750",
+    name: "Honey Bee Brandy 750ml",
+    brand: "Honey Bee",
+    category: "Brandy",
+    size: "750 ml",
+    purchasePrice: 480,
+    price: 700,
+    minimumStock: 8,
+    unitsPerCase: 12,
+    openingStock: 18,
+  },
+
+  {
+    id: "p043",
+    barcode: "8900000010043",
+    sku: "WI-SCS-750",
+    name: "Sula Cabernet Shiraz 750ml",
+    brand: "Sula",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 620,
+    price: 900,
+    minimumStock: 5,
+    unitsPerCase: 6,
+    openingStock: 14,
+  },
+  {
+    id: "p044",
+    barcode: "8900000010044",
+    sku: "WI-SCB-750",
+    name: "Sula Chenin Blanc 750ml",
+    brand: "Sula",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 600,
+    price: 870,
+    minimumStock: 5,
+    unitsPerCase: 6,
+    openingStock: 12,
+  },
+  {
+    id: "p045",
+    barcode: "8900000010045",
+    sku: "WI-SBR-750",
+    name: "Sula Brut 750ml",
+    brand: "Sula",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 780,
+    price: 1150,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 10,
+  },
+  {
+    id: "p046",
+    barcode: "8900000010046",
+    sku: "WI-SZR-750",
+    name: "Sula Zinfandel Rosé 750ml",
+    brand: "Sula",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 690,
+    price: 980,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 11,
+  },
+  {
+    id: "p047",
+    barcode: "8900000010047",
+    sku: "WI-FCR-750",
+    name: "Fratelli Cabernet Red 750ml",
+    brand: "Fratelli",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 560,
+    price: 820,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 12,
+  },
+  {
+    id: "p048",
+    barcode: "8900000010048",
+    sku: "WI-FCB-750",
+    name: "Fratelli Chenin Blanc 750ml",
+    brand: "Fratelli",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 540,
+    price: 790,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 10,
+  },
+  {
+    id: "p049",
+    barcode: "8900000010049",
+    sku: "WI-GZLR-750",
+    name: "Grover Zampa La Réserve 750ml",
+    brand: "Grover Zampa",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 760,
+    price: 1100,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 9,
+  },
+  {
+    id: "p050",
+    barcode: "8900000010050",
+    sku: "WI-GZAC-750",
+    name: "Grover Zampa Art Collection 750ml",
+    brand: "Grover Zampa",
+    category: "Wine",
+    size: "750 ml",
+    purchasePrice: 650,
+    price: 950,
+    minimumStock: 4,
+    unitsPerCase: 6,
+    openingStock: 8,
+  },
+];
diff --git a/src/index.css b/src/index.css
index 2c84af0..32891a8 100644
--- a/src/index.css
+++ b/src/index.css
@@ -1,111 +1,986 @@
-:root {
-  --text: #6b6375;
-  --text-h: #08060d;
-  --bg: #fff;
-  --border: #e5e4e7;
-  --code-bg: #f4f3ec;
-  --accent: #aa3bff;
-  --accent-bg: rgba(170, 59, 255, 0.1);
-  --accent-border: rgba(170, 59, 255, 0.5);
-  --social-bg: rgba(244, 243, 236, 0.5);
-  --shadow:
-    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
-
-  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
-  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
-  --mono: ui-monospace, Consolas, monospace;
-
-  font: 18px/145% var(--sans);
-  letter-spacing: 0.18px;
-  color-scheme: light dark;
-  color: var(--text);
-  background: var(--bg);
-  font-synthesis: none;
-  text-rendering: optimizeLegibility;
-  -webkit-font-smoothing: antialiased;
-  -moz-osx-font-smoothing: grayscale;
-
-  @media (max-width: 1024px) {
-    font-size: 16px;
-  }
-}
-
-@media (prefers-color-scheme: dark) {
-  :root {
-    --text: #9ca3af;
-    --text-h: #f3f4f6;
-    --bg: #16171d;
-    --border: #2e303a;
-    --code-bg: #1f2028;
-    --accent: #c084fc;
-    --accent-bg: rgba(192, 132, 252, 0.15);
-    --accent-border: rgba(192, 132, 252, 0.5);
-    --social-bg: rgba(47, 48, 58, 0.5);
-    --shadow:
-      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
-  }
-
-  #social .button-icon {
-    filter: invert(1) brightness(2);
-  }
+* {
+  box-sizing: border-box;
+}
+
+html,
+body,
+#root {
+  min-height: 100%;
+  margin: 0;
 }

 body {
+  font-family:
+    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
+    "Segoe UI", sans-serif;
+  background: #f4f5f7;
+  color: #17181c;
+}
+
+button,
+input {
+  font: inherit;
+}
+
+button {
+  cursor: pointer;
+}
+
+.app-shell {
+  display: flex;
+  min-height: 100vh;
+}
+
+.sidebar {
+  position: fixed;
+  inset: 0 auto 0 0;
+  width: 250px;
+  display: flex;
+  flex-direction: column;
+  background: #23111b;
+  color: #fff;
+  z-index: 20;
+}
+
+.brand {
+  display: flex;
+  align-items: center;
+  gap: 12px;
+  padding: 24px 21px;
+  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
+}
+
+.brand-icon {
+  width: 44px;
+  height: 44px;
+  display: grid;
+  place-items: center;
+  border-radius: 12px;
+  background: #8e244d;
+}
+
+.brand-name {
+  font-weight: 800;
+  letter-spacing: -0.3px;
+}
+
+.brand-subtitle {
+  margin-top: 2px;
+  font-size: 12px;
+  color: #c6b5bd;
+}
+
+.nav-menu {
+  display: flex;
+  flex-direction: column;
+  gap: 5px;
+  padding: 19px 12px;
+  flex: 1;
+}
+
+.nav-item {
+  display: flex;
+  align-items: center;
+  gap: 12px;
+  min-height: 45px;
+  padding: 0 13px;
+  border-radius: 9px;
+  color: #cdbfc5;
+  text-decoration: none;
+  font-size: 14px;
+  font-weight: 600;
+}
+
+.nav-item:hover {
+  background: rgba(255, 255, 255, 0.06);
+  color: #fff;
+}
+
+.nav-item.active {
+  background: #8e244d;
+  color: #fff;
+}
+
+.sidebar-footer {
+  margin: 14px;
+  padding: 14px;
+  display: flex;
+  align-items: center;
+  gap: 10px;
+  border-radius: 10px;
+  background: rgba(255, 255, 255, 0.06);
+}
+
+.sidebar-footer div {
+  display: flex;
+  flex-direction: column;
+}
+
+.sidebar-footer strong {
+  font-size: 13px;
+}
+
+.sidebar-footer span {
+  color: #c6b5bd;
+  font-size: 11px;
+  margin-top: 2px;
+}
+
+.main-area {
+  width: calc(100% - 250px);
+  margin-left: 250px;
+}
+
+.topbar {
+  height: 75px;
+  padding: 0 30px;
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  background: #fff;
+  border-bottom: 1px solid #e7e8eb;
+}
+
+.topbar h1 {
   margin: 0;
+  font-size: 17px;
 }

-#root {
-  width: 1126px;
-  max-width: 100%;
-  margin: 0 auto;
+.topbar p {
+  margin: 3px 0 0;
+  color: #8a8c94;
+  font-size: 12px;
+}
+
+.user-pill {
+  display: flex;
+  align-items: center;
+  gap: 10px;
+}
+
+.avatar {
+  width: 38px;
+  height: 38px;
+  border-radius: 50%;
+  display: grid;
+  place-items: center;
+  color: #fff;
+  font-weight: 800;
+  background: #8e244d;
+}
+
+.user-pill > div:last-child {
+  display: flex;
+  flex-direction: column;
+}
+
+.user-pill strong {
+  font-size: 13px;
+}
+
+.user-pill span {
+  color: #8a8c94;
+  font-size: 11px;
+}
+
+.page-area {
+  padding: 28px;
+}
+
+.page-heading {
+  margin-bottom: 22px;
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  gap: 20px;
+}
+
+.page-heading h2 {
+  margin: 0;
+  font-size: 25px;
+  letter-spacing: -0.5px;
+}
+
+.page-heading p {
+  margin: 5px 0 0;
+  color: #787b83;
+  font-size: 13px;
+}
+
+.page-actions {
+  display: flex;
+  gap: 9px;
+}
+
+.panel {
+  background: #fff;
+  border: 1px solid #e5e6e9;
+  border-radius: 13px;
+  padding: 20px;
+  box-shadow: 0 2px 7px rgba(28, 23, 26, 0.025);
+}
+
+.panel-header {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  gap: 15px;
+  margin-bottom: 17px;
+}
+
+.panel-header h3,
+.panel h3 {
+  margin: 0;
+  font-size: 16px;
+}
+
+.panel-header p,
+.panel > p {
+  margin: 4px 0 0;
+  color: #8a8c94;
+  font-size: 12px;
+}
+
+.stats-grid {
+  display: grid;
+  grid-template-columns: repeat(4, minmax(0, 1fr));
+  gap: 16px;
+  margin-bottom: 18px;
+}
+
+.stat-card {
+  position: relative;
+  min-height: 145px;
+  padding: 20px;
+  border-radius: 13px;
+  background: #fff;
+  border: 1px solid #e5e6e9;
+}
+
+.stat-icon {
+  width: 39px;
+  height: 39px;
+  display: grid;
+  place-items: center;
+  border-radius: 10px;
+  margin-bottom: 17px;
+  background: #f5e9ee;
+  color: #8e244d;
+}
+
+.stat-label {
+  color: #73767d;
+  font-size: 12px;
+  font-weight: 600;
+}
+
+.stat-value {
+  margin-top: 3px;
+  font-size: 25px;
+  font-weight: 800;
+  letter-spacing: -0.5px;
+}
+
+.stat-note {
+  margin-top: 5px;
+  color: #97999f;
+  font-size: 11px;
+}
+
+.dashboard-grid {
+  display: grid;
+  grid-template-columns: 1.4fr 1fr;
+  gap: 18px;
+}
+
+.simple-list {
+  display: flex;
+  flex-direction: column;
+}
+
+.simple-list-row {
+  padding: 13px 0;
+  display: flex;
+  justify-content: space-between;
+  gap: 15px;
+  border-bottom: 1px solid #f0f0f1;
+}
+
+.simple-list-row:last-child {
+  border-bottom: 0;
+}
+
+.simple-list-row > div {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.simple-list-row strong {
+  font-size: 13px;
+}
+
+.simple-list-row span {
+  color: #8d8f96;
+  font-size: 11px;
+}
+
+.align-right {
+  text-align: right;
+}
+
+.stock-low {
+  color: #b42318;
+  font-size: 12px;
+  font-weight: 700;
+}
+
+.empty-state {
+  padding: 25px 5px;
+  color: #8a8c94;
+  font-size: 13px;
   text-align: center;
-  border-inline: 1px solid var(--border);
-  min-height: 100svh;
+}
+
+.large-empty-state {
+  min-height: 350px;
+  display: grid;
+  place-items: center;
+  align-content: center;
+  gap: 5px;
+  text-align: center;
+  color: #96989e;
+}
+
+.large-empty-state h3 {
+  margin-top: 10px;
+  color: #33353a;
+}
+
+.large-empty-state p {
+  margin: 0;
+}
+
+.demo-note {
+  margin-top: 17px;
+  padding: 11px 14px;
+  border-radius: 8px;
+  background: #fff8e6;
+  border: 1px solid #f3dfac;
+  color: #775d1c;
+  font-size: 11px;
+}
+
+.pos-layout {
+  display: grid;
+  grid-template-columns: minmax(0, 1fr) 330px;
+  gap: 18px;
+  align-items: start;
+}
+
+.pos-left {
   display: flex;
   flex-direction: column;
-  box-sizing: border-box;
+  gap: 17px;
 }

-h1,
-h2 {
-  font-family: var(--heading);
-  font-weight: 500;
-  color: var(--text-h);
+.input-label {
+  margin-bottom: 9px;
+  display: flex;
+  align-items: center;
+  gap: 7px;
+  font-size: 13px;
+  font-weight: 700;
 }

-h1 {
-  font-size: 56px;
-  letter-spacing: -1.68px;
-  margin: 32px 0;
-  @media (max-width: 1024px) {
-    font-size: 36px;
-    margin: 20px 0;
-  }
+.barcode-input-row {
+  display: flex;
+  gap: 9px;
 }
-h2 {
-  font-size: 24px;
-  line-height: 118%;
-  letter-spacing: -0.24px;
-  margin: 0 0 8px;
-  @media (max-width: 1024px) {
-    font-size: 20px;
-  }
+
+.barcode-input,
+.search-input,
+.settings-fields input {
+  width: 100%;
+  height: 45px;
+  padding: 0 13px;
+  border: 1px solid #dcdde0;
+  border-radius: 9px;
+  outline: none;
+  background: #fff;
+}
+
+.barcode-input {
+  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
+  letter-spacing: 1px;
+}
+
+.barcode-input:focus,
+.search-input:focus {
+  border-color: #8e244d;
+  box-shadow: 0 0 0 3px rgba(142, 36, 77, 0.09);
+}
+
+.primary-button,
+.secondary-button,
+.danger-button {
+  min-height: 42px;
+  padding: 0 16px;
+  border-radius: 8px;
+  font-weight: 700;
+  border: 0;
+}
+
+.primary-button {
+  background: #8e244d;
+  color: #fff;
+}
+
+.primary-button:hover {
+  background: #761d40;
+}
+
+.secondary-button {
+  background: #fff;
+  border: 1px solid #dcdde0;
+}
+
+.pos-message {
+  margin-top: 12px;
+  padding: 9px 11px;
+  border-radius: 7px;
+  font-size: 12px;
+}
+
+.pos-message.info {
+  background: #edf4ff;
+  color: #315883;
+}
+
+.pos-message.success {
+  background: #eaf8ee;
+  color: #246b39;
+}
+
+.pos-message.error {
+  background: #fff0ef;
+  color: #a12b23;
+}
+
+.search-results {
+  margin-top: 10px;
+  border: 1px solid #e2e3e5;
+  border-radius: 9px;
+  overflow: hidden;
+}
+
+.search-result {
+  width: 100%;
+  padding: 11px 13px;
+  border: 0;
+  border-bottom: 1px solid #ededee;
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  background: #fff;
+  text-align: left;
+}
+
+.search-result:last-child {
+  border-bottom: 0;
+}
+
+.search-result:hover {
+  background: #faf7f8;
+}
+
+.search-result > div,
+.search-result-right {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.search-result strong {
+  font-size: 12px;
+}
+
+.search-result span {
+  color: #8a8c94;
+  font-size: 10px;
+}
+
+.search-result-right {
+  text-align: right;
+}
+
+.text-button {
+  padding: 0;
+  border: 0;
+  background: transparent;
+  font-size: 12px;
+  font-weight: 700;
+}
+
+.danger-text {
+  color: #b42318;
+}
+
+.cart-empty {
+  min-height: 190px;
+  display: grid;
+  place-items: center;
+  align-content: center;
+  gap: 4px;
+  color: #a5a6aa;
+}
+
+.cart-empty strong {
+  margin-top: 8px;
+  color: #55575c;
+}
+
+.cart-empty span {
+  font-size: 12px;
+}
+
+.cart-table {
+  display: flex;
+  flex-direction: column;
+}
+
+.cart-row {
+  display: grid;
+  grid-template-columns: minmax(190px, 1fr) 120px 120px 35px;
+  gap: 14px;
+  align-items: center;
+  padding: 13px 0;
+  border-bottom: 1px solid #ededee;
+}
+
+.cart-row:last-child {
+  border-bottom: 0;
+}
+
+.cart-product,
+.cart-price {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.cart-product strong {
+  font-size: 13px;
+}
+
+.cart-product span,
+.cart-price span {
+  color: #8e9097;
+  font-size: 10px;
+}
+
+.cart-price {
+  text-align: right;
+}
+
+.quantity-control {
+  height: 34px;
+  display: grid;
+  grid-template-columns: 34px 1fr 34px;
+  align-items: center;
+  border: 1px solid #dedfe2;
+  border-radius: 7px;
+  overflow: hidden;
+}
+
+.quantity-control button {
+  height: 100%;
+  border: 0;
+  display: grid;
+  place-items: center;
+  background: #f6f6f7;
+}
+
+.quantity-control strong {
+  text-align: center;
+  font-size: 12px;
+}
+
+.icon-button {
+  width: 33px;
+  height: 33px;
+  display: grid;
+  place-items: center;
+  border: 0;
+  border-radius: 7px;
+  background: transparent;
+}
+
+.icon-button.danger {
+  color: #b42318;
+}
+
+.icon-button:hover {
+  background: #f7f7f8;
+}
+
+.checkout-panel {
+  position: sticky;
+  top: 94px;
+  padding: 21px;
+  border-radius: 13px;
+  background: #23111b;
+  color: #fff;
 }
-p {
+
+.checkout-panel h3 {
   margin: 0;
+  font-size: 18px;
+}
+
+.checkout-panel > div:first-child p {
+  margin: 4px 0 0;
+  color: #bbaeb4;
+  font-size: 11px;
+}
+
+.bill-lines {
+  margin-top: 23px;
+  padding: 16px 0;
+  display: flex;
+  flex-direction: column;
+  gap: 12px;
+  border-top: 1px solid rgba(255, 255, 255, 0.11);
+  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
+}
+
+.bill-lines > div,
+.grand-total {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+}
+
+.bill-lines span {
+  color: #bbaeb4;
+  font-size: 12px;
+}
+
+.bill-lines strong {
+  font-size: 13px;
+}
+
+.grand-total {
+  padding: 19px 0;
 }

-code,
-.counter {
-  font-family: var(--mono);
-  display: inline-flex;
-  border-radius: 4px;
-  color: var(--text-h);
+.grand-total span {
+  font-size: 13px;
 }

-code {
-  font-size: 15px;
-  line-height: 135%;
-  padding: 4px 8px;
-  background: var(--code-bg);
+.grand-total strong {
+  font-size: 26px;
+}
+
+.payment-title {
+  margin-bottom: 9px;
+  color: #cdbfc5;
+  font-size: 11px;
+  font-weight: 700;
+}
+
+.payment-options {
+  display: grid;
+  grid-template-columns: repeat(3, 1fr);
+  gap: 7px;
+}
+
+.payment-button {
+  min-height: 67px;
+  border: 1px solid rgba(255, 255, 255, 0.13);
+  border-radius: 8px;
+  display: grid;
+  place-items: center;
+  gap: 4px;
+  background: rgba(255, 255, 255, 0.05);
+  color: #d9cfd3;
+  font-size: 10px;
+  font-weight: 700;
+}
+
+.payment-button.selected {
+  border-color: #d85d8c;
+  background: #8e244d;
+  color: #fff;
+}
+
+.complete-sale {
+  width: 100%;
+  margin-top: 17px;
+  padding: 14px;
+  border: 0;
+  border-radius: 9px;
+  display: flex;
+  justify-content: space-between;
+  background: #cf477b;
+  color: #fff;
+  font-weight: 800;
+}
+
+.complete-sale:disabled {
+  opacity: 0.45;
+  cursor: not-allowed;
+}
+
+.test-barcode-box {
+  margin-top: 19px;
+  padding: 12px;
+  display: flex;
+  flex-direction: column;
+  gap: 4px;
+  border-radius: 8px;
+  background: rgba(255, 255, 255, 0.06);
+}
+
+.test-barcode-box strong {
+  font-size: 11px;
+}
+
+.test-barcode-box span {
+  color: #bbaeb4;
+  font-size: 10px;
+}
+
+.test-barcode-box code {
+  padding: 5px 7px;
+  border-radius: 5px;
+  background: rgba(0, 0, 0, 0.22);
+  color: #f4bdd2;
+}
+
+.cart-count {
+  padding: 8px 11px;
+  border-radius: 8px;
+  display: flex;
+  align-items: center;
+  gap: 7px;
+  background: #fff;
+  border: 1px solid #e3e4e6;
+  font-size: 12px;
+  font-weight: 700;
+}
+
+.table-toolbar {
+  margin-bottom: 17px;
+}
+
+.table-search {
+  max-width: 430px;
+  height: 42px;
+  padding: 0 12px;
+  display: flex;
+  align-items: center;
+  gap: 8px;
+  border: 1px solid #dedfe2;
+  border-radius: 8px;
+}
+
+.table-search input {
+  width: 100%;
+  border: 0;
+  outline: 0;
+}
+
+.data-table-wrapper {
+  overflow-x: auto;
+}
+
+.data-table {
+  width: 100%;
+  border-collapse: collapse;
+}
+
+.data-table th {
+  padding: 11px 12px;
+  text-align: left;
+  background: #f7f7f8;
+  color: #7c7e84;
+  border-bottom: 1px solid #e4e5e7;
+  font-size: 10px;
+  text-transform: uppercase;
+  letter-spacing: 0.5px;
+}
+
+.data-table td {
+  padding: 12px;
+  border-bottom: 1px solid #eeeeef;
+  font-size: 12px;
+  vertical-align: middle;
+}
+
+.data-table tbody tr:hover {
+  background: #fcfafb;
+}
+
+.table-product {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.table-product span {
+  color: #919399;
+  font-size: 10px;
+}
+
+.category-badge {
+  padding: 5px 8px;
+  border-radius: 999px;
+  background: #f2edf0;
+  color: #673249;
+  font-size: 10px;
+  font-weight: 700;
+}
+
+.mono {
+  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
+}
+
+.stock-status {
+  padding: 5px 8px;
+  border-radius: 999px;
+  font-size: 9px;
+  font-weight: 800;
+}
+
+.stock-status.good {
+  background: #e8f6ec;
+  color: #26703b;
+}
+
+.stock-status.low {
+  background: #ffeceb;
+  color: #a62b23;
+}
+
+.coming-soon {
+  min-height: 350px;
+  display: grid;
+  place-items: center;
+  align-content: center;
+  text-align: center;
+}
+
+.settings-grid {
+  display: grid;
+  grid-template-columns: 1fr 1fr;
+  gap: 18px;
+}
+
+.settings-fields {
+  margin-top: 20px;
+  display: grid;
+  gap: 14px;
+}
+
+.settings-fields label {
+  display: grid;
+  gap: 6px;
+  color: #76787f;
+  font-size: 11px;
+  font-weight: 700;
+}
+
+.settings-fields input {
+  color: #4f5157;
+  background: #f8f8f9;
+}
+
+.danger-zone {
+  border-color: #efc7c3;
+}
+
+.danger-zone p {
+  margin: 9px 0 18px;
+}
+
+.danger-button {
+  display: flex;
+  align-items: center;
+  gap: 8px;
+  background: #b42318;
+  color: #fff;
+}
+
+@media (max-width: 1100px) {
+  .stats-grid {
+    grid-template-columns: repeat(2, 1fr);
+  }
+
+  .dashboard-grid,
+  .settings-grid {
+    grid-template-columns: 1fr;
+  }
+
+  .pos-layout {
+    grid-template-columns: 1fr;
+  }
+
+  .checkout-panel {
+    position: static;
+  }
+}
+
+@media (max-width: 780px) {
+  .sidebar {
+    width: 72px;
+  }
+
+  .brand {
+    padding: 16px 14px;
+  }
+
+  .brand > div:last-child,
+  .nav-item span,
+  .sidebar-footer div {
+    display: none;
+  }
+
+  .nav-item {
+    justify-content: center;
+  }
+
+  .sidebar-footer {
+    justify-content: center;
+  }
+
+  .main-area {
+    width: calc(100% - 72px);
+    margin-left: 72px;
+  }
+
+  .topbar {
+    padding: 0 16px;
+  }
+
+  .page-area {
+    padding: 18px;
+  }
+
+  .stats-grid {
+    grid-template-columns: 1fr;
+  }
+
+  .cart-row {
+    grid-template-columns: 1fr;
+  }
+
+  .cart-price {
+    text-align: left;
+  }
+
+  .page-heading {
+    align-items: flex-start;
+    flex-direction: column;
+  }
 }
diff --git a/src/main.jsx b/src/main.jsx
index b9a1a6d..6d9c6de 100644
--- a/src/main.jsx
+++ b/src/main.jsx
@@ -1,10 +1,16 @@
-import { StrictMode } from 'react'
-import { createRoot } from 'react-dom/client'
-import './index.css'
-import App from './App.jsx'
+import { StrictMode } from "react";
+import { createRoot } from "react-dom/client";
+import { BrowserRouter } from "react-router-dom";
+import App from "./App";
+import { ShopProvider } from "./context/ShopContext";
+import "./index.css";

-createRoot(document.getElementById('root')).render(
+createRoot(document.getElementById("root")).render(
   <StrictMode>
-    <App />
-  </StrictMode>,
-)
+    <BrowserRouter>
+      <ShopProvider>
+        <App />
+      </ShopProvider>
+    </BrowserRouter>
+  </StrictMode>
+);
diff --git a/src/pages/Dashboard.jsx b/src/pages/Dashboard.jsx
new file mode 100644
index 0000000..073cffe
--- /dev/null
+++ b/src/pages/Dashboard.jsx
@@ -0,0 +1,165 @@
+import {
+  IndianRupee,
+  PackageCheck,
+  ReceiptText,
+  TriangleAlert,
+} from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function Dashboard() {
+  const { products, sales, getStock } = useShop();
+
+  const today = new Date().toDateString();
+
+  const todaysSales = sales.filter(
+    (sale) => new Date(sale.createdAt).toDateString() === today
+  );
+
+  const revenue = todaysSales.reduce(
+    (total, sale) => total + sale.grandTotal,
+    0
+  );
+
+  const averageBill = todaysSales.length
+    ? revenue / todaysSales.length
+    : 0;
+
+  const lowStockProducts = products.filter(
+    (product) => getStock(product.id) <= product.minimumStock
+  );
+
+  const inventoryValue = products.reduce(
+    (total, product) =>
+      total + getStock(product.id) * product.purchasePrice,
+    0
+  );
+
+  const cards = [
+    {
+      label: "Today's Sales",
+      value: money.format(revenue),
+      icon: IndianRupee,
+      note: "Revenue today",
+    },
+    {
+      label: "Bills Today",
+      value: todaysSales.length,
+      icon: ReceiptText,
+      note: `Avg ${money.format(averageBill)}`,
+    },
+    {
+      label: "Low Stock",
+      value: lowStockProducts.length,
+      icon: TriangleAlert,
+      note: "Needs attention",
+    },
+    {
+      label: "Inventory Value",
+      value: money.format(inventoryValue),
+      icon: PackageCheck,
+      note: "At purchase cost",
+    },
+  ];
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Dashboard</h2>
+          <p>Store overview and today's performance</p>
+        </div>
+      </div>
+
+      <div className="stats-grid">
+        {cards.map((card) => {
+          const Icon = card.icon;
+
+          return (
+            <div className="stat-card" key={card.label}>
+              <div className="stat-icon">
+                <Icon size={21} />
+              </div>
+
+              <div className="stat-label">{card.label}</div>
+              <div className="stat-value">{card.value}</div>
+              <div className="stat-note">{card.note}</div>
+            </div>
+          );
+        })}
+      </div>
+
+      <div className="dashboard-grid">
+        <section className="panel">
+          <div className="panel-header">
+            <div>
+              <h3>Recent Sales</h3>
+              <p>Latest completed bills</p>
+            </div>
+          </div>
+
+          {sales.length === 0 ? (
+            <div className="empty-state">
+              No sales yet. Open POS and complete your first bill.
+            </div>
+          ) : (
+            <div className="simple-list">
+              {sales.slice(0, 7).map((sale) => (
+                <div className="simple-list-row" key={sale.id}>
+                  <div>
+                    <strong>{sale.invoiceNumber}</strong>
+                    <span>
+                      {new Date(sale.createdAt).toLocaleString("en-IN")}
+                    </span>
+                  </div>
+
+                  <div className="align-right">
+                    <strong>{money.format(sale.grandTotal)}</strong>
+                    <span>{sale.paymentMethod}</span>
+                  </div>
+                </div>
+              ))}
+            </div>
+          )}
+        </section>
+
+        <section className="panel">
+          <div className="panel-header">
+            <div>
+              <h3>Low Stock Products</h3>
+              <p>Products at or below minimum level</p>
+            </div>
+          </div>
+
+          {lowStockProducts.length === 0 ? (
+            <div className="empty-state">No low-stock products.</div>
+          ) : (
+            <div className="simple-list">
+              {lowStockProducts.slice(0, 8).map((product) => (
+                <div className="simple-list-row" key={product.id}>
+                  <div>
+                    <strong>{product.name}</strong>
+                    <span>{product.category}</span>
+                  </div>
+
+                  <div className="stock-low">
+                    {getStock(product.id)} left
+                  </div>
+                </div>
+              ))}
+            </div>
+          )}
+        </section>
+      </div>
+
+      <div className="demo-note">
+        Development mode: product prices and barcodes are dummy test data.
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Inventory.jsx b/src/pages/Inventory.jsx
new file mode 100644
index 0000000..e36c169
--- /dev/null
+++ b/src/pages/Inventory.jsx
@@ -0,0 +1,115 @@
+import { useMemo, useState } from "react";
+import { Search } from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function Inventory() {
+  const { products, getStock } = useShop();
+  const [search, setSearch] = useState("");
+
+  const filteredProducts = useMemo(() => {
+    const value = search.toLowerCase().trim();
+
+    return products.filter((product) => {
+      if (!value) {
+        return true;
+      }
+
+      return (
+        product.name.toLowerCase().includes(value) ||
+        product.brand.toLowerCase().includes(value) ||
+        product.barcode.includes(value)
+      );
+    });
+  }, [products, search]);
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Inventory</h2>
+          <p>Current local stock levels</p>
+        </div>
+
+        <div className="page-actions">
+          <button className="secondary-button">+ Receive Stock</button>
+          <button className="primary-button">+ New Product</button>
+        </div>
+      </div>
+
+      <div className="panel">
+        <div className="table-toolbar">
+          <div className="table-search">
+            <Search size={18} />
+
+            <input
+              value={search}
+              onChange={(event) => setSearch(event.target.value)}
+              placeholder="Search inventory..."
+            />
+          </div>
+        </div>
+
+        <div className="data-table-wrapper">
+          <table className="data-table">
+            <thead>
+              <tr>
+                <th>Product</th>
+                <th>Category</th>
+                <th>Barcode</th>
+                <th>Current Stock</th>
+                <th>Minimum</th>
+                <th>Status</th>
+                <th>Inventory Value</th>
+              </tr>
+            </thead>
+
+            <tbody>
+              {filteredProducts.map((product) => {
+                const stock = getStock(product.id);
+                const low = stock <= product.minimumStock;
+
+                return (
+                  <tr key={product.id}>
+                    <td>
+                      <div className="table-product">
+                        <strong>{product.name}</strong>
+                        <span>{product.size}</span>
+                      </div>
+                    </td>
+
+                    <td>{product.category}</td>
+                    <td className="mono">{product.barcode}</td>
+                    <td>
+                      <strong>{stock}</strong>
+                    </td>
+                    <td>{product.minimumStock}</td>
+                    <td>
+                      <span
+                        className={
+                          low
+                            ? "stock-status low"
+                            : "stock-status good"
+                        }
+                      >
+                        {low ? "LOW STOCK" : "IN STOCK"}
+                      </span>
+                    </td>
+                    <td>
+                      {money.format(stock * product.purchasePrice)}
+                    </td>
+                  </tr>
+                );
+              })}
+            </tbody>
+          </table>
+        </div>
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/POS.jsx b/src/pages/POS.jsx
new file mode 100644
index 0000000..ef38367
--- /dev/null
+++ b/src/pages/POS.jsx
@@ -0,0 +1,444 @@
+import { useEffect, useMemo, useRef, useState } from "react";
+import {
+  Banknote,
+  CreditCard,
+  Minus,
+  Plus,
+  ScanBarcode,
+  Search,
+  ShoppingCart,
+  Smartphone,
+  Trash2,
+} from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function POS() {
+  const { products, getStock, completeSale } = useShop();
+
+  const [barcode, setBarcode] = useState("");
+  const [search, setSearch] = useState("");
+  const [cart, setCart] = useState([]);
+  const [paymentMethod, setPaymentMethod] = useState("CASH");
+  const [message, setMessage] = useState(
+    "Ready to scan. Try barcode 8900000010016"
+  );
+  const [messageType, setMessageType] = useState("info");
+
+  const barcodeRef = useRef(null);
+
+  useEffect(() => {
+    barcodeRef.current?.focus();
+  }, []);
+
+  const searchResults = useMemo(() => {
+    const value = search.trim().toLowerCase();
+
+    if (!value) {
+      return [];
+    }
+
+    return products
+      .filter(
+        (product) =>
+          product.name.toLowerCase().includes(value) ||
+          product.brand.toLowerCase().includes(value) ||
+          product.sku.toLowerCase().includes(value) ||
+          product.barcode.includes(value)
+      )
+      .slice(0, 8);
+  }, [search, products]);
+
+  function currentCartQuantity(productId) {
+    return (
+      cart.find((item) => item.product.id === productId)?.quantity || 0
+    );
+  }
+
+  function addProduct(product) {
+    const available = getStock(product.id);
+    const alreadyInCart = currentCartQuantity(product.id);
+
+    if (available <= 0) {
+      setMessage(`${product.name} is OUT OF STOCK.`);
+      setMessageType("error");
+      return;
+    }
+
+    if (alreadyInCart + 1 > available) {
+      setMessage(`Only ${available} unit(s) of ${product.name} available.`);
+      setMessageType("error");
+      return;
+    }
+
+    setCart((currentCart) => {
+      const existing = currentCart.find(
+        (item) => item.product.id === product.id
+      );
+
+      if (existing) {
+        return currentCart.map((item) =>
+          item.product.id === product.id
+            ? { ...item, quantity: item.quantity + 1 }
+            : item
+        );
+      }
+
+      return [...currentCart, { product, quantity: 1 }];
+    });
+
+    setMessage(`${product.name} added to cart.`);
+    setMessageType("success");
+  }
+
+  function handleBarcodeSubmit(event) {
+    event.preventDefault();
+
+    const scannedBarcode = barcode.trim();
+
+    if (!scannedBarcode) {
+      return;
+    }
+
+    const product = products.find(
+      (item) => item.barcode === scannedBarcode
+    );
+
+    if (!product) {
+      setMessage(`PRODUCT NOT FOUND: ${scannedBarcode}`);
+      setMessageType("error");
+    } else {
+      addProduct(product);
+    }
+
+    setBarcode("");
+
+    requestAnimationFrame(() => {
+      barcodeRef.current?.focus();
+    });
+  }
+
+  function changeQuantity(productId, delta) {
+    const item = cart.find(
+      (cartItem) => cartItem.product.id === productId
+    );
+
+    if (!item) {
+      return;
+    }
+
+    const newQuantity = item.quantity + delta;
+
+    if (newQuantity <= 0) {
+      removeItem(productId);
+      return;
+    }
+
+    const available = getStock(productId);
+
+    if (newQuantity > available) {
+      setMessage(`Only ${available} unit(s) available.`);
+      setMessageType("error");
+      return;
+    }
+
+    setCart((currentCart) =>
+      currentCart.map((cartItem) =>
+        cartItem.product.id === productId
+          ? { ...cartItem, quantity: newQuantity }
+          : cartItem
+      )
+    );
+  }
+
+  function removeItem(productId) {
+    setCart((currentCart) =>
+      currentCart.filter(
+        (item) => item.product.id !== productId
+      )
+    );
+  }
+
+  const subtotal = cart.reduce(
+    (total, item) => total + item.product.price * item.quantity,
+    0
+  );
+
+  const itemCount = cart.reduce(
+    (total, item) => total + item.quantity,
+    0
+  );
+
+  function handleCompleteSale() {
+    const result = completeSale(cart, paymentMethod);
+
+    if (!result.ok) {
+      setMessage(result.message);
+      setMessageType("error");
+      return;
+    }
+
+    setMessage(
+      `${result.sale.invoiceNumber} completed successfully for ${money.format(
+        result.sale.grandTotal
+      )}.`
+    );
+    setMessageType("success");
+    setCart([]);
+    setSearch("");
+
+    requestAnimationFrame(() => {
+      barcodeRef.current?.focus();
+    });
+  }
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>POS Billing</h2>
+          <p>Scan barcode or search a product manually</p>
+        </div>
+
+        <div className="cart-count">
+          <ShoppingCart size={18} />
+          {itemCount} item(s)
+        </div>
+      </div>
+
+      <div className="pos-layout">
+        <section className="pos-left">
+          <div className="panel barcode-panel">
+            <form onSubmit={handleBarcodeSubmit}>
+              <label className="input-label">
+                <ScanBarcode size={18} />
+                Scan Barcode
+              </label>
+
+              <div className="barcode-input-row">
+                <input
+                  ref={barcodeRef}
+                  className="barcode-input"
+                  value={barcode}
+                  onChange={(event) =>
+                    setBarcode(event.target.value)
+                  }
+                  placeholder="Scan barcode and press Enter"
+                  autoComplete="off"
+                />
+
+                <button className="primary-button" type="submit">
+                  Add
+                </button>
+              </div>
+            </form>
+
+            <div className={`pos-message ${messageType}`}>
+              {message}
+            </div>
+          </div>
+
+          <div className="panel">
+            <label className="input-label">
+              <Search size={18} />
+              Manual Product Search
+            </label>
+
+            <input
+              className="search-input"
+              value={search}
+              onChange={(event) => setSearch(event.target.value)}
+              placeholder="Search by product, brand, SKU or barcode"
+            />
+
+            {searchResults.length > 0 && (
+              <div className="search-results">
+                {searchResults.map((product) => (
+                  <button
+                    type="button"
+                    className="search-result"
+                    key={product.id}
+                    onClick={() => addProduct(product)}
+                  >
+                    <div>
+                      <strong>{product.name}</strong>
+                      <span>
+                        {product.barcode} · {product.sku}
+                      </span>
+                    </div>
+
+                    <div className="search-result-right">
+                      <strong>{money.format(product.price)}</strong>
+                      <span>Stock: {getStock(product.id)}</span>
+                    </div>
+                  </button>
+                ))}
+              </div>
+            )}
+          </div>
+
+          <div className="panel">
+            <div className="panel-header">
+              <div>
+                <h3>Current Cart</h3>
+                <p>Products added to this bill</p>
+              </div>
+
+              {cart.length > 0 && (
+                <button
+                  className="text-button danger-text"
+                  onClick={() => setCart([])}
+                >
+                  Clear Cart
+                </button>
+              )}
+            </div>
+
+            {cart.length === 0 ? (
+              <div className="cart-empty">
+                <ShoppingCart size={42} />
+                <strong>Cart is empty</strong>
+                <span>Scan a barcode to begin billing.</span>
+              </div>
+            ) : (
+              <div className="cart-table">
+                {cart.map((item) => (
+                  <div className="cart-row" key={item.product.id}>
+                    <div className="cart-product">
+                      <strong>{item.product.name}</strong>
+                      <span>
+                        {item.product.barcode} · Stock{" "}
+                        {getStock(item.product.id)}
+                      </span>
+                    </div>
+
+                    <div className="quantity-control">
+                      <button
+                        onClick={() =>
+                          changeQuantity(item.product.id, -1)
+                        }
+                      >
+                        <Minus size={16} />
+                      </button>
+
+                      <strong>{item.quantity}</strong>
+
+                      <button
+                        onClick={() =>
+                          changeQuantity(item.product.id, 1)
+                        }
+                      >
+                        <Plus size={16} />
+                      </button>
+                    </div>
+
+                    <div className="cart-price">
+                      <span>{money.format(item.product.price)} each</span>
+                      <strong>
+                        {money.format(
+                          item.product.price * item.quantity
+                        )}
+                      </strong>
+                    </div>
+
+                    <button
+                      className="icon-button danger"
+                      onClick={() => removeItem(item.product.id)}
+                    >
+                      <Trash2 size={17} />
+                    </button>
+                  </div>
+                ))}
+              </div>
+            )}
+          </div>
+        </section>
+
+        <aside className="checkout-panel">
+          <div>
+            <h3>Bill Summary</h3>
+            <p>{itemCount} item(s)</p>
+          </div>
+
+          <div className="bill-lines">
+            <div>
+              <span>Subtotal</span>
+              <strong>{money.format(subtotal)}</strong>
+            </div>
+
+            <div>
+              <span>Discount</span>
+              <strong>{money.format(0)}</strong>
+            </div>
+          </div>
+
+          <div className="grand-total">
+            <span>Grand Total</span>
+            <strong>{money.format(subtotal)}</strong>
+          </div>
+
+          <div className="payment-title">Payment Method</div>
+
+          <div className="payment-options">
+            <button
+              className={
+                paymentMethod === "CASH"
+                  ? "payment-button selected"
+                  : "payment-button"
+              }
+              onClick={() => setPaymentMethod("CASH")}
+            >
+              <Banknote size={21} />
+              CASH
+            </button>
+
+            <button
+              className={
+                paymentMethod === "UPI"
+                  ? "payment-button selected"
+                  : "payment-button"
+              }
+              onClick={() => setPaymentMethod("UPI")}
+            >
+              <Smartphone size={21} />
+              UPI
+            </button>
+
+            <button
+              className={
+                paymentMethod === "CARD"
+                  ? "payment-button selected"
+                  : "payment-button"
+              }
+              onClick={() => setPaymentMethod("CARD")}
+            >
+              <CreditCard size={21} />
+              CARD
+            </button>
+          </div>
+
+          <button
+            className="complete-sale"
+            onClick={handleCompleteSale}
+            disabled={cart.length === 0}
+          >
+            Complete Sale
+            <span>{money.format(subtotal)}</span>
+          </button>
+
+          <div className="test-barcode-box">
+            <strong>Test Scanner</strong>
+            <span>Try typing:</span>
+            <code>8900000010016</code>
+            <span>Then press Enter.</span>
+          </div>
+        </aside>
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Placeholder.jsx b/src/pages/Placeholder.jsx
new file mode 100644
index 0000000..cd9af54
--- /dev/null
+++ b/src/pages/Placeholder.jsx
@@ -0,0 +1,19 @@
+export default function Placeholder({ title, description }) {
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>{title}</h2>
+          <p>{description}</p>
+        </div>
+      </div>
+
+      <div className="panel coming-soon">
+        <h3>{title}</h3>
+        <p>
+          This module is reserved for the next development chapters.
+        </p>
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Products.jsx b/src/pages/Products.jsx
new file mode 100644
index 0000000..279103d
--- /dev/null
+++ b/src/pages/Products.jsx
@@ -0,0 +1,99 @@
+import { useMemo, useState } from "react";
+import { Search } from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function Products() {
+  const { products, getStock } = useShop();
+  const [search, setSearch] = useState("");
+
+  const filteredProducts = useMemo(() => {
+    const value = search.toLowerCase().trim();
+
+    if (!value) {
+      return products;
+    }
+
+    return products.filter(
+      (product) =>
+        product.name.toLowerCase().includes(value) ||
+        product.brand.toLowerCase().includes(value) ||
+        product.category.toLowerCase().includes(value) ||
+        product.barcode.includes(value) ||
+        product.sku.toLowerCase().includes(value)
+    );
+  }, [products, search]);
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Product Master</h2>
+          <p>{products.length} development products loaded</p>
+        </div>
+      </div>
+
+      <div className="panel">
+        <div className="table-toolbar">
+          <div className="table-search">
+            <Search size={18} />
+
+            <input
+              value={search}
+              onChange={(event) => setSearch(event.target.value)}
+              placeholder="Search product, barcode, SKU or category"
+            />
+          </div>
+        </div>
+
+        <div className="data-table-wrapper">
+          <table className="data-table">
+            <thead>
+              <tr>
+                <th>Product</th>
+                <th>Barcode</th>
+                <th>SKU</th>
+                <th>Category</th>
+                <th>Stock</th>
+                <th>Selling Price</th>
+              </tr>
+            </thead>
+
+            <tbody>
+              {filteredProducts.map((product) => (
+                <tr key={product.id}>
+                  <td>
+                    <div className="table-product">
+                      <strong>{product.name}</strong>
+                      <span>{product.brand}</span>
+                    </div>
+                  </td>
+
+                  <td className="mono">{product.barcode}</td>
+                  <td>{product.sku}</td>
+                  <td>
+                    <span className="category-badge">
+                      {product.category}
+                    </span>
+                  </td>
+                  <td>{getStock(product.id)}</td>
+                  <td>{money.format(product.price)}</td>
+                </tr>
+              ))}
+            </tbody>
+          </table>
+        </div>
+      </div>
+
+      <div className="demo-note">
+        Barcodes and prices are dummy development values and are not official
+        product data.
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Sales.jsx b/src/pages/Sales.jsx
new file mode 100644
index 0000000..0525db6
--- /dev/null
+++ b/src/pages/Sales.jsx
@@ -0,0 +1,78 @@
+import { ReceiptText } from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+const money = new Intl.NumberFormat("en-IN", {
+  style: "currency",
+  currency: "INR",
+  maximumFractionDigits: 0,
+});
+
+export default function Sales() {
+  const { sales } = useShop();
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Sales History</h2>
+          <p>Completed local transactions</p>
+        </div>
+      </div>
+
+      <div className="panel">
+        {sales.length === 0 ? (
+          <div className="large-empty-state">
+            <ReceiptText size={48} />
+            <h3>No sales yet</h3>
+            <p>Complete a transaction from POS Billing.</p>
+          </div>
+        ) : (
+          <div className="data-table-wrapper">
+            <table className="data-table">
+              <thead>
+                <tr>
+                  <th>Invoice</th>
+                  <th>Date & Time</th>
+                  <th>Items</th>
+                  <th>Payment</th>
+                  <th>Total</th>
+                </tr>
+              </thead>
+
+              <tbody>
+                {sales.map((sale) => (
+                  <tr key={sale.id}>
+                    <td>
+                      <strong>{sale.invoiceNumber}</strong>
+                    </td>
+
+                    <td>
+                      {new Date(sale.createdAt).toLocaleString("en-IN")}
+                    </td>
+
+                    <td>
+                      {sale.items.reduce(
+                        (total, item) => total + item.quantity,
+                        0
+                      )}
+                    </td>
+
+                    <td>
+                      <span className="category-badge">
+                        {sale.paymentMethod}
+                      </span>
+                    </td>
+
+                    <td>
+                      <strong>{money.format(sale.grandTotal)}</strong>
+                    </td>
+                  </tr>
+                ))}
+              </tbody>
+            </table>
+          </div>
+        )}
+      </div>
+    </div>
+  );
+}
diff --git a/src/pages/Settings.jsx b/src/pages/Settings.jsx
new file mode 100644
index 0000000..2cdfadf
--- /dev/null
+++ b/src/pages/Settings.jsx
@@ -0,0 +1,64 @@
+import { RotateCcw } from "lucide-react";
+import { useShop } from "../context/ShopContext";
+
+export default function Settings() {
+  const { resetDemo } = useShop();
+
+  function handleReset() {
+    const confirmed = window.confirm(
+      "Reset inventory and delete all local demo sales?"
+    );
+
+    if (confirmed) {
+      resetDemo();
+      window.alert("Demo data has been reset.");
+    }
+  }
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>Settings</h2>
+          <p>Prototype application settings</p>
+        </div>
+      </div>
+
+      <div className="settings-grid">
+        <section className="panel">
+          <h3>Store Information</h3>
+
+          <div className="settings-fields">
+            <label>
+              Store Name
+              <input value="Demo Wine Shop" readOnly />
+            </label>
+
+            <label>
+              Currency
+              <input value="INR (₹)" readOnly />
+            </label>
+
+            <label>
+              Data Mode
+              <input value="Browser LocalStorage" readOnly />
+            </label>
+          </div>
+        </section>
+
+        <section className="panel danger-zone">
+          <h3>Demo Data</h3>
+          <p>
+            Reset all inventory quantities back to opening stock and remove
+            local sales.
+          </p>
+
+          <button className="danger-button" onClick={handleReset}>
+            <RotateCcw size={18} />
+            Reset Demo Data
+          </button>
+        </section>
+      </div>
+    </div>
+  );
+}
```

## Exact source snapshot

### `.gitattributes`

```text
* text=auto eol=lf
```

### `.gitignore`

```text
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>wineshoppos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `package.json`

```json
{
  "name": "wineshoppos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^1.37.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "oxlint": "^1.79.0",
    "vite": "^8.2.2"
  }
}
```

### `src/App.css`

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
```

### `src/App.jsx`

```javascript
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Placeholder from "./pages/Placeholder";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />

        <Route path="pos" element={<POS />} />

        <Route path="products" element={<Products />} />

        <Route path="inventory" element={<Inventory />} />

        <Route
          path="purchases"
          element={
            <Placeholder
              title="Purchases"
              description="Supplier purchases and receive-stock workflow"
            />
          }
        />

        <Route path="sales" element={<Sales />} />

        <Route
          path="reports"
          element={
            <Placeholder
              title="Reports"
              description="Sales, inventory and performance reporting"
            />
          }
        />

        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
```

### `src/components/Layout.jsx`

```javascript
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  ReceiptText,
  ScanBarcode,
  Settings,
  ShoppingBag,
  Truck,
  Warehouse,
  Wine,
} from "lucide-react";

const navigation = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/pos",
    label: "POS Billing",
    icon: ScanBarcode,
  },
  {
    path: "/products",
    label: "Products",
    icon: Package,
  },
  {
    path: "/inventory",
    label: "Inventory",
    icon: Warehouse,
  },
  {
    path: "/purchases",
    label: "Purchases",
    icon: Truck,
  },
  {
    path: "/sales",
    label: "Sales",
    icon: ReceiptText,
  },
  {
    path: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Wine size={25} />
          </div>

          <div>
            <div className="brand-name">WineShop POS</div>
            <div className="brand-subtitle">Retail Management</div>
          </div>
        </div>

        <nav className="nav-menu">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ShoppingBag size={18} />
          <div>
            <strong>Demo Store</strong>
            <span>Local prototype</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <h1>Wine Shop Management</h1>
            <p>Barcode billing & inventory</p>
          </div>

          <div className="user-pill">
            <div className="avatar">A</div>
            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <div className="page-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

### `src/context/ShopContext.jsx`

```javascript
import { createContext, useContext, useEffect, useState } from "react";
import { products } from "../data/products";

const ShopContext = createContext(null);

const INVENTORY_KEY = "wineshop_inventory_v1";
const SALES_KEY = "wineshop_sales_v1";

function createInitialInventory() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {};
  } catch {
    saved = {};
  }

  return products.reduce((result, product) => {
    result[product.id] =
      typeof saved[product.id] === "number"
        ? saved[product.id]
        : product.openingStock;

    return result;
  }, {});
}

function createInitialSales() {
  try {
    return JSON.parse(localStorage.getItem(SALES_KEY)) || [];
  } catch {
    return [];
  }
}

export function ShopProvider({ children }) {
  const [inventory, setInventory] = useState(createInitialInventory);
  const [sales, setSales] = useState(createInitialSales);

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

  function getStock(productId) {
    return inventory[productId] ?? 0;
  }

  function completeSale(cart, paymentMethod) {
    if (!cart.length) {
      return {
        ok: false,
        message: "Cart is empty.",
      };
    }

    for (const item of cart) {
      const available = inventory[item.product.id] ?? 0;

      if (item.quantity > available) {
        return {
          ok: false,
          message: `Only ${available} unit(s) of ${item.product.name} are available.`,
        };
      }
    }

    const updatedInventory = { ...inventory };

    cart.forEach((item) => {
      updatedInventory[item.product.id] -= item.quantity;
    });

    const subtotal = cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    const invoiceNumber = `INV-${new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "")}-${String(sales.length + 1).padStart(4, "0")}`;

    const sale = {
      id: crypto.randomUUID(),
      invoiceNumber,
      createdAt: new Date().toISOString(),
      paymentMethod,
      subtotal,
      discount: 0,
      grandTotal: subtotal,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        quantity: item.quantity,
        unitPrice: item.product.price,
        lineTotal: item.product.price * item.quantity,
      })),
    };

    setInventory(updatedInventory);
    setSales((currentSales) => [sale, ...currentSales]);

    return {
      ok: true,
      sale,
    };
  }

  function resetDemo() {
    const initialInventory = products.reduce((result, product) => {
      result[product.id] = product.openingStock;
      return result;
    }, {});

    setInventory(initialInventory);
    setSales([]);
  }

  return (
    <ShopContext.Provider
      value={{
        products,
        inventory,
        sales,
        getStock,
        completeSale,
        resetDemo,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
```

### `src/data/products.js`

```javascript
export const products = [
  {
    id: "p001",
    barcode: "8900000010001",
    sku: "WH-RS-180",
    name: "Royal Stag 180ml",
    brand: "Royal Stag",
    category: "Whisky",
    size: "180 ml",
    purchasePrice: 150,
    price: 210,
    minimumStock: 12,
    unitsPerCase: 48,
    openingStock: 48,
  },
  {
    id: "p002",
    barcode: "8900000010002",
    sku: "WH-RS-375",
    name: "Royal Stag 375ml",
    brand: "Royal Stag",
    category: "Whisky",
    size: "375 ml",
    purchasePrice: 285,
    price: 410,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 30,
  },
  {
    id: "p003",
    barcode: "8900000010003",
    sku: "WH-RS-750",
    name: "Royal Stag 750ml",
    brand: "Royal Stag",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 540,
    price: 780,
    minimumStock: 12,
    unitsPerCase: 12,
    openingStock: 36,
  },
  {
    id: "p004",
    barcode: "8900000010004",
    sku: "WH-BP-375",
    name: "Blenders Pride 375ml",
    brand: "Blenders Pride",
    category: "Whisky",
    size: "375 ml",
    purchasePrice: 620,
    price: 850,
    minimumStock: 8,
    unitsPerCase: 24,
    openingStock: 20,
  },
  {
    id: "p005",
    barcode: "8900000010005",
    sku: "WH-BP-750",
    name: "Blenders Pride 750ml",
    brand: "Blenders Pride",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 1200,
    price: 1650,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 24,
  },
  {
    id: "p006",
    barcode: "8900000010006",
    sku: "WH-IB-180",
    name: "Imperial Blue 180ml",
    brand: "Imperial Blue",
    category: "Whisky",
    size: "180 ml",
    purchasePrice: 125,
    price: 180,
    minimumStock: 12,
    unitsPerCase: 48,
    openingStock: 45,
  },
  {
    id: "p007",
    barcode: "8900000010007",
    sku: "WH-IB-375",
    name: "Imperial Blue 375ml",
    brand: "Imperial Blue",
    category: "Whisky",
    size: "375 ml",
    purchasePrice: 245,
    price: 350,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 32,
  },
  {
    id: "p008",
    barcode: "8900000010008",
    sku: "WH-IB-750",
    name: "Imperial Blue 750ml",
    brand: "Imperial Blue",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 460,
    price: 680,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 28,
  },
  {
    id: "p009",
    barcode: "8900000010009",
    sku: "WH-MD1-750",
    name: "McDowell's No.1 750ml",
    brand: "McDowell's",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 500,
    price: 730,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 30,
  },
  {
    id: "p010",
    barcode: "8900000010010",
    sku: "WH-RC-750",
    name: "Royal Challenge 750ml",
    brand: "Royal Challenge",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 620,
    price: 850,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 24,
  },
  {
    id: "p011",
    barcode: "8900000010011",
    sku: "WH-SIG-750",
    name: "Signature Rare Aged 750ml",
    brand: "Signature",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 780,
    price: 1100,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 18,
  },
  {
    id: "p012",
    barcode: "8900000010012",
    sku: "WH-AB-750",
    name: "Antiquity Blue 750ml",
    brand: "Antiquity",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 1100,
    price: 1550,
    minimumStock: 6,
    unitsPerCase: 12,
    openingStock: 15,
  },
  {
    id: "p013",
    barcode: "8900000010013",
    sku: "WH-OC-750",
    name: "Officer's Choice 750ml",
    brand: "Officer's Choice",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 390,
    price: 570,
    minimumStock: 12,
    unitsPerCase: 12,
    openingStock: 34,
  },
  {
    id: "p014",
    barcode: "8900000010014",
    sku: "WH-8PM-750",
    name: "8PM Whisky 750ml",
    brand: "8PM",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 430,
    price: 620,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 27,
  },

  {
    id: "p015",
    barcode: "8900000010015",
    sku: "BE-KFP-650",
    name: "Kingfisher Premium 650ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 105,
    price: 160,
    minimumStock: 24,
    unitsPerCase: 12,
    openingStock: 72,
  },
  {
    id: "p016",
    barcode: "8900000010016",
    sku: "BE-KFS-650",
    name: "Kingfisher Strong 650ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 120,
    price: 180,
    minimumStock: 24,
    unitsPerCase: 12,
    openingStock: 84,
  },
  {
    id: "p017",
    barcode: "8900000010017",
    sku: "BE-KFU-330",
    name: "Kingfisher Ultra 330ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 95,
    price: 150,
    minimumStock: 18,
    unitsPerCase: 24,
    openingStock: 48,
  },
  {
    id: "p018",
    barcode: "8900000010018",
    sku: "BE-KFUM-650",
    name: "Kingfisher Ultra Max 650ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 150,
    price: 220,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 48,
  },
  {
    id: "p019",
    barcode: "8900000010019",
    sku: "BE-TS-650",
    name: "Tuborg Strong 650ml",
    brand: "Tuborg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 125,
    price: 190,
    minimumStock: 24,
    unitsPerCase: 12,
    openingStock: 78,
  },
  {
    id: "p020",
    barcode: "8900000010020",
    sku: "BE-TG-650",
    name: "Tuborg Green 650ml",
    brand: "Tuborg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 115,
    price: 175,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 60,
  },
  {
    id: "p021",
    barcode: "8900000010021",
    sku: "BE-BUD-330",
    name: "Budweiser Premium 330ml",
    brand: "Budweiser",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 110,
    price: 170,
    minimumStock: 18,
    unitsPerCase: 24,
    openingStock: 42,
  },
  {
    id: "p022",
    barcode: "8900000010022",
    sku: "BE-BM-500",
    name: "Budweiser Magnum 500ml",
    brand: "Budweiser",
    category: "Beer",
    size: "500 ml",
    purchasePrice: 135,
    price: 210,
    minimumStock: 18,
    unitsPerCase: 24,
    openingStock: 50,
  },
  {
    id: "p023",
    barcode: "8900000010023",
    sku: "BE-CE-650",
    name: "Carlsberg Elephant 650ml",
    brand: "Carlsberg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 130,
    price: 200,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 54,
  },
  {
    id: "p024",
    barcode: "8900000010024",
    sku: "BE-CS-650",
    name: "Carlsberg Smooth 650ml",
    brand: "Carlsberg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 120,
    price: 185,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 55,
  },
  {
    id: "p025",
    barcode: "8900000010025",
    sku: "BE-HEI-330",
    name: "Heineken 330ml",
    brand: "Heineken",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 115,
    price: 180,
    minimumStock: 12,
    unitsPerCase: 24,
    openingStock: 36,
  },
  {
    id: "p026",
    barcode: "8900000010026",
    sku: "BE-B91B-330",
    name: "Bira 91 Blonde 330ml",
    brand: "Bira 91",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 105,
    price: 165,
    minimumStock: 12,
    unitsPerCase: 24,
    openingStock: 30,
  },
  {
    id: "p027",
    barcode: "8900000010027",
    sku: "BE-B91W-330",
    name: "Bira 91 White 330ml",
    brand: "Bira 91",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 115,
    price: 180,
    minimumStock: 12,
    unitsPerCase: 24,
    openingStock: 34,
  },

  {
    id: "p028",
    barcode: "8900000010028",
    sku: "RU-OM-180",
    name: "Old Monk 180ml",
    brand: "Old Monk",
    category: "Rum",
    size: "180 ml",
    purchasePrice: 130,
    price: 190,
    minimumStock: 12,
    unitsPerCase: 48,
    openingStock: 38,
  },
  {
    id: "p029",
    barcode: "8900000010029",
    sku: "RU-OM-375",
    name: "Old Monk 375ml",
    brand: "Old Monk",
    category: "Rum",
    size: "375 ml",
    purchasePrice: 260,
    price: 380,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 28,
  },
  {
    id: "p030",
    barcode: "8900000010030",
    sku: "RU-OM-750",
    name: "Old Monk 750ml",
    brand: "Old Monk",
    category: "Rum",
    size: "750 ml",
    purchasePrice: 500,
    price: 720,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 31,
  },
  {
    id: "p031",
    barcode: "8900000010031",
    sku: "RU-MCR-750",
    name: "McDowell's Celebration Rum 750ml",
    brand: "McDowell's",
    category: "Rum",
    size: "750 ml",
    purchasePrice: 430,
    price: 630,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 24,
  },
  {
    id: "p032",
    barcode: "8900000010032",
    sku: "RU-CON-750",
    name: "Contessa Rum 750ml",
    brand: "Contessa",
    category: "Rum",
    size: "750 ml",
    purchasePrice: 410,
    price: 600,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 20,
  },

  {
    id: "p033",
    barcode: "8900000010033",
    sku: "VO-MM-180",
    name: "Magic Moments 180ml",
    brand: "Magic Moments",
    category: "Vodka",
    size: "180 ml",
    purchasePrice: 140,
    price: 210,
    minimumStock: 10,
    unitsPerCase: 48,
    openingStock: 35,
  },
  {
    id: "p034",
    barcode: "8900000010034",
    sku: "VO-MM-375",
    name: "Magic Moments 375ml",
    brand: "Magic Moments",
    category: "Vodka",
    size: "375 ml",
    purchasePrice: 280,
    price: 410,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 28,
  },
  {
    id: "p035",
    barcode: "8900000010035",
    sku: "VO-MM-750",
    name: "Magic Moments 750ml",
    brand: "Magic Moments",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 540,
    price: 790,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 26,
  },
  {
    id: "p036",
    barcode: "8900000010036",
    sku: "VO-ROM-750",
    name: "Romanov 750ml",
    brand: "Romanov",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 420,
    price: 620,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 21,
  },
  {
    id: "p037",
    barcode: "8900000010037",
    sku: "VO-SMI-375",
    name: "Smirnoff 375ml",
    brand: "Smirnoff",
    category: "Vodka",
    size: "375 ml",
    purchasePrice: 420,
    price: 610,
    minimumStock: 8,
    unitsPerCase: 24,
    openingStock: 18,
  },
  {
    id: "p038",
    barcode: "8900000010038",
    sku: "VO-SMI-750",
    name: "Smirnoff 750ml",
    brand: "Smirnoff",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 820,
    price: 1180,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 22,
  },
  {
    id: "p039",
    barcode: "8900000010039",
    sku: "VO-WM-750",
    name: "White Mischief 750ml",
    brand: "White Mischief",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 390,
    price: 570,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 19,
  },

  {
    id: "p040",
    barcode: "8900000010040",
    sku: "BR-MH-750",
    name: "Mansion House 750ml",
    brand: "Mansion House",
    category: "Brandy",
    size: "750 ml",
    purchasePrice: 610,
    price: 890,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 22,
  },
  {
    id: "p041",
    barcode: "8900000010041",
    sku: "BR-MOR-750",
    name: "Morpheus Brandy 750ml",
    brand: "Morpheus",
    category: "Brandy",
    size: "750 ml",
    purchasePrice: 780,
    price: 1120,
    minimumStock: 6,
    unitsPerCase: 12,
    openingStock: 16,
  },
  {
    id: "p042",
    barcode: "8900000010042",
    sku: "BR-HB-750",
    name: "Honey Bee Brandy 750ml",
    brand: "Honey Bee",
    category: "Brandy",
    size: "750 ml",
    purchasePrice: 480,
    price: 700,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 18,
  },

  {
    id: "p043",
    barcode: "8900000010043",
    sku: "WI-SCS-750",
    name: "Sula Cabernet Shiraz 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 620,
    price: 900,
    minimumStock: 5,
    unitsPerCase: 6,
    openingStock: 14,
  },
  {
    id: "p044",
    barcode: "8900000010044",
    sku: "WI-SCB-750",
    name: "Sula Chenin Blanc 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 600,
    price: 870,
    minimumStock: 5,
    unitsPerCase: 6,
    openingStock: 12,
  },
  {
    id: "p045",
    barcode: "8900000010045",
    sku: "WI-SBR-750",
    name: "Sula Brut 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 780,
    price: 1150,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 10,
  },
  {
    id: "p046",
    barcode: "8900000010046",
    sku: "WI-SZR-750",
    name: "Sula Zinfandel Rosé 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 690,
    price: 980,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 11,
  },
  {
    id: "p047",
    barcode: "8900000010047",
    sku: "WI-FCR-750",
    name: "Fratelli Cabernet Red 750ml",
    brand: "Fratelli",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 560,
    price: 820,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 12,
  },
  {
    id: "p048",
    barcode: "8900000010048",
    sku: "WI-FCB-750",
    name: "Fratelli Chenin Blanc 750ml",
    brand: "Fratelli",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 540,
    price: 790,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 10,
  },
  {
    id: "p049",
    barcode: "8900000010049",
    sku: "WI-GZLR-750",
    name: "Grover Zampa La Réserve 750ml",
    brand: "Grover Zampa",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 760,
    price: 1100,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 9,
  },
  {
    id: "p050",
    barcode: "8900000010050",
    sku: "WI-GZAC-750",
    name: "Grover Zampa Art Collection 750ml",
    brand: "Grover Zampa",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 650,
    price: 950,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 8,
  },
];
```

### `src/index.css`

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  background: #f4f5f7;
  color: #17181c;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 250px;
  display: flex;
  flex-direction: column;
  background: #23111b;
  color: #fff;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 21px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #8e244d;
}

.brand-name {
  font-weight: 800;
  letter-spacing: -0.3px;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #c6b5bd;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 19px 12px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 45px;
  padding: 0 13px;
  border-radius: 9px;
  color: #cdbfc5;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.nav-item.active {
  background: #8e244d;
  color: #fff;
}

.sidebar-footer {
  margin: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-footer div {
  display: flex;
  flex-direction: column;
}

.sidebar-footer strong {
  font-size: 13px;
}

.sidebar-footer span {
  color: #c6b5bd;
  font-size: 11px;
  margin-top: 2px;
}

.main-area {
  width: calc(100% - 250px);
  margin-left: 250px;
}

.topbar {
  height: 75px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e7e8eb;
}

.topbar h1 {
  margin: 0;
  font-size: 17px;
}

.topbar p {
  margin: 3px 0 0;
  color: #8a8c94;
  font-size: 12px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  background: #8e244d;
}

.user-pill > div:last-child {
  display: flex;
  flex-direction: column;
}

.user-pill strong {
  font-size: 13px;
}

.user-pill span {
  color: #8a8c94;
  font-size: 11px;
}

.page-area {
  padding: 28px;
}

.page-heading {
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-heading h2 {
  margin: 0;
  font-size: 25px;
  letter-spacing: -0.5px;
}

.page-heading p {
  margin: 5px 0 0;
  color: #787b83;
  font-size: 13px;
}

.page-actions {
  display: flex;
  gap: 9px;
}

.panel {
  background: #fff;
  border: 1px solid #e5e6e9;
  border-radius: 13px;
  padding: 20px;
  box-shadow: 0 2px 7px rgba(28, 23, 26, 0.025);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 17px;
}

.panel-header h3,
.panel h3 {
  margin: 0;
  font-size: 16px;
}

.panel-header p,
.panel > p {
  margin: 4px 0 0;
  color: #8a8c94;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.stat-card {
  position: relative;
  min-height: 145px;
  padding: 20px;
  border-radius: 13px;
  background: #fff;
  border: 1px solid #e5e6e9;
}

.stat-icon {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  margin-bottom: 17px;
  background: #f5e9ee;
  color: #8e244d;
}

.stat-label {
  color: #73767d;
  font-size: 12px;
  font-weight: 600;
}

.stat-value {
  margin-top: 3px;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.stat-note {
  margin-top: 5px;
  color: #97999f;
  font-size: 11px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
}

.simple-list {
  display: flex;
  flex-direction: column;
}

.simple-list-row {
  padding: 13px 0;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #f0f0f1;
}

.simple-list-row:last-child {
  border-bottom: 0;
}

.simple-list-row > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.simple-list-row strong {
  font-size: 13px;
}

.simple-list-row span {
  color: #8d8f96;
  font-size: 11px;
}

.align-right {
  text-align: right;
}

.stock-low {
  color: #b42318;
  font-size: 12px;
  font-weight: 700;
}

.empty-state {
  padding: 25px 5px;
  color: #8a8c94;
  font-size: 13px;
  text-align: center;
}

.large-empty-state {
  min-height: 350px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
  text-align: center;
  color: #96989e;
}

.large-empty-state h3 {
  margin-top: 10px;
  color: #33353a;
}

.large-empty-state p {
  margin: 0;
}

.demo-note {
  margin-top: 17px;
  padding: 11px 14px;
  border-radius: 8px;
  background: #fff8e6;
  border: 1px solid #f3dfac;
  color: #775d1c;
  font-size: 11px;
}

.pos-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 18px;
  align-items: start;
}

.pos-left {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.input-label {
  margin-bottom: 9px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
}

.barcode-input-row {
  display: flex;
  gap: 9px;
}

.barcode-input,
.search-input,
.settings-fields input {
  width: 100%;
  height: 45px;
  padding: 0 13px;
  border: 1px solid #dcdde0;
  border-radius: 9px;
  outline: none;
  background: #fff;
}

.barcode-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 1px;
}

.barcode-input:focus,
.search-input:focus {
  border-color: #8e244d;
  box-shadow: 0 0 0 3px rgba(142, 36, 77, 0.09);
}

.primary-button,
.secondary-button,
.danger-button {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 700;
  border: 0;
}

.primary-button {
  background: #8e244d;
  color: #fff;
}

.primary-button:hover {
  background: #761d40;
}

.secondary-button {
  background: #fff;
  border: 1px solid #dcdde0;
}

.pos-message {
  margin-top: 12px;
  padding: 9px 11px;
  border-radius: 7px;
  font-size: 12px;
}

.pos-message.info {
  background: #edf4ff;
  color: #315883;
}

.pos-message.success {
  background: #eaf8ee;
  color: #246b39;
}

.pos-message.error {
  background: #fff0ef;
  color: #a12b23;
}

.search-results {
  margin-top: 10px;
  border: 1px solid #e2e3e5;
  border-radius: 9px;
  overflow: hidden;
}

.search-result {
  width: 100%;
  padding: 11px 13px;
  border: 0;
  border-bottom: 1px solid #ededee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  text-align: left;
}

.search-result:last-child {
  border-bottom: 0;
}

.search-result:hover {
  background: #faf7f8;
}

.search-result > div,
.search-result-right {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.search-result strong {
  font-size: 12px;
}

.search-result span {
  color: #8a8c94;
  font-size: 10px;
}

.search-result-right {
  text-align: right;
}

.text-button {
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 700;
}

.danger-text {
  color: #b42318;
}

.cart-empty {
  min-height: 190px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  color: #a5a6aa;
}

.cart-empty strong {
  margin-top: 8px;
  color: #55575c;
}

.cart-empty span {
  font-size: 12px;
}

.cart-table {
  display: flex;
  flex-direction: column;
}

.cart-row {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) 120px 120px 35px;
  gap: 14px;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid #ededee;
}

.cart-row:last-child {
  border-bottom: 0;
}

.cart-product,
.cart-price {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cart-product strong {
  font-size: 13px;
}

.cart-product span,
.cart-price span {
  color: #8e9097;
  font-size: 10px;
}

.cart-price {
  text-align: right;
}

.quantity-control {
  height: 34px;
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  align-items: center;
  border: 1px solid #dedfe2;
  border-radius: 7px;
  overflow: hidden;
}

.quantity-control button {
  height: 100%;
  border: 0;
  display: grid;
  place-items: center;
  background: #f6f6f7;
}

.quantity-control strong {
  text-align: center;
  font-size: 12px;
}

.icon-button {
  width: 33px;
  height: 33px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
}

.icon-button.danger {
  color: #b42318;
}

.icon-button:hover {
  background: #f7f7f8;
}

.checkout-panel {
  position: sticky;
  top: 94px;
  padding: 21px;
  border-radius: 13px;
  background: #23111b;
  color: #fff;
}

.checkout-panel h3 {
  margin: 0;
  font-size: 18px;
}

.checkout-panel > div:first-child p {
  margin: 4px 0 0;
  color: #bbaeb4;
  font-size: 11px;
}

.bill-lines {
  margin-top: 23px;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
}

.bill-lines > div,
.grand-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bill-lines span {
  color: #bbaeb4;
  font-size: 12px;
}

.bill-lines strong {
  font-size: 13px;
}

.grand-total {
  padding: 19px 0;
}

.grand-total span {
  font-size: 13px;
}

.grand-total strong {
  font-size: 26px;
}

.payment-title {
  margin-bottom: 9px;
  color: #cdbfc5;
  font-size: 11px;
  font-weight: 700;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}

.payment-button {
  min-height: 67px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  display: grid;
  place-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #d9cfd3;
  font-size: 10px;
  font-weight: 700;
}

.payment-button.selected {
  border-color: #d85d8c;
  background: #8e244d;
  color: #fff;
}

.complete-sale {
  width: 100%;
  margin-top: 17px;
  padding: 14px;
  border: 0;
  border-radius: 9px;
  display: flex;
  justify-content: space-between;
  background: #cf477b;
  color: #fff;
  font-weight: 800;
}

.complete-sale:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.test-barcode-box {
  margin-top: 19px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
}

.test-barcode-box strong {
  font-size: 11px;
}

.test-barcode-box span {
  color: #bbaeb4;
  font-size: 10px;
}

.test-barcode-box code {
  padding: 5px 7px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.22);
  color: #f4bdd2;
}

.cart-count {
  padding: 8px 11px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fff;
  border: 1px solid #e3e4e6;
  font-size: 12px;
  font-weight: 700;
}

.table-toolbar {
  margin-bottom: 17px;
}

.table-search {
  max-width: 430px;
  height: 42px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dedfe2;
  border-radius: 8px;
}

.table-search input {
  width: 100%;
  border: 0;
  outline: 0;
}

.data-table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 11px 12px;
  text-align: left;
  background: #f7f7f8;
  color: #7c7e84;
  border-bottom: 1px solid #e4e5e7;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #eeeeef;
  font-size: 12px;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: #fcfafb;
}

.table-product {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.table-product span {
  color: #919399;
  font-size: 10px;
}

.category-badge {
  padding: 5px 8px;
  border-radius: 999px;
  background: #f2edf0;
  color: #673249;
  font-size: 10px;
  font-weight: 700;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.stock-status {
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
}

.stock-status.good {
  background: #e8f6ec;
  color: #26703b;
}

.stock-status.low {
  background: #ffeceb;
  color: #a62b23;
}

.coming-soon {
  min-height: 350px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.settings-fields {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.settings-fields label {
  display: grid;
  gap: 6px;
  color: #76787f;
  font-size: 11px;
  font-weight: 700;
}

.settings-fields input {
  color: #4f5157;
  background: #f8f8f9;
}

.danger-zone {
  border-color: #efc7c3;
}

.danger-zone p {
  margin: 9px 0 18px;
}

.danger-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #b42318;
  color: #fff;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .pos-layout {
    grid-template-columns: 1fr;
  }

  .checkout-panel {
    position: static;
  }
}

@media (max-width: 780px) {
  .sidebar {
    width: 72px;
  }

  .brand {
    padding: 16px 14px;
  }

  .brand > div:last-child,
  .nav-item span,
  .sidebar-footer div {
    display: none;
  }

  .nav-item {
    justify-content: center;
  }

  .sidebar-footer {
    justify-content: center;
  }

  .main-area {
    width: calc(100% - 72px);
    margin-left: 72px;
  }

  .topbar {
    padding: 0 16px;
  }

  .page-area {
    padding: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .cart-row {
    grid-template-columns: 1fr;
  }

  .cart-price {
    text-align: left;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

### `src/main.jsx`

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ShopProvider } from "./context/ShopContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ShopProvider>
        <App />
      </ShopProvider>
    </BrowserRouter>
  </StrictMode>
);
```

### `src/pages/Dashboard.jsx`

```javascript
import {
  IndianRupee,
  PackageCheck,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const { products, sales, getStock } = useShop();

  const today = new Date().toDateString();

  const todaysSales = sales.filter(
    (sale) => new Date(sale.createdAt).toDateString() === today
  );

  const revenue = todaysSales.reduce(
    (total, sale) => total + sale.grandTotal,
    0
  );

  const averageBill = todaysSales.length
    ? revenue / todaysSales.length
    : 0;

  const lowStockProducts = products.filter(
    (product) => getStock(product.id) <= product.minimumStock
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + getStock(product.id) * product.purchasePrice,
    0
  );

  const cards = [
    {
      label: "Today's Sales",
      value: money.format(revenue),
      icon: IndianRupee,
      note: "Revenue today",
    },
    {
      label: "Bills Today",
      value: todaysSales.length,
      icon: ReceiptText,
      note: `Avg ${money.format(averageBill)}`,
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: TriangleAlert,
      note: "Needs attention",
    },
    {
      label: "Inventory Value",
      value: money.format(inventoryValue),
      icon: PackageCheck,
      note: "At purchase cost",
    },
  ];

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Store overview and today's performance</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="stat-card" key={card.label}>
              <div className="stat-icon">
                <Icon size={21} />
              </div>

              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-note">{card.note}</div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Sales</h3>
              <p>Latest completed bills</p>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="empty-state">
              No sales yet. Open POS and complete your first bill.
            </div>
          ) : (
            <div className="simple-list">
              {sales.slice(0, 7).map((sale) => (
                <div className="simple-list-row" key={sale.id}>
                  <div>
                    <strong>{sale.invoiceNumber}</strong>
                    <span>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="align-right">
                    <strong>{money.format(sale.grandTotal)}</strong>
                    <span>{sale.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Low Stock Products</h3>
              <p>Products at or below minimum level</p>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="empty-state">No low-stock products.</div>
          ) : (
            <div className="simple-list">
              {lowStockProducts.slice(0, 8).map((product) => (
                <div className="simple-list-row" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>

                  <div className="stock-low">
                    {getStock(product.id)} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="demo-note">
        Development mode: product prices and barcodes are dummy test data.
      </div>
    </div>
  );
}
```

### `src/pages/Inventory.jsx`

```javascript
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Inventory() {
  const { products, getStock } = useShop();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return products.filter((product) => {
      if (!value) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.barcode.includes(value)
      );
    });
  }, [products, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Inventory</h2>
          <p>Current local stock levels</p>
        </div>

        <div className="page-actions">
          <button className="secondary-button">+ Receive Stock</button>
          <button className="primary-button">+ New Product</button>
        </div>
      </div>

      <div className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search inventory..."
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>Current Stock</th>
                <th>Minimum</th>
                <th>Status</th>
                <th>Inventory Value</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const stock = getStock(product.id);
                const low = stock <= product.minimumStock;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <strong>{product.name}</strong>
                        <span>{product.size}</span>
                      </div>
                    </td>

                    <td>{product.category}</td>
                    <td className="mono">{product.barcode}</td>
                    <td>
                      <strong>{stock}</strong>
                    </td>
                    <td>{product.minimumStock}</td>
                    <td>
                      <span
                        className={
                          low
                            ? "stock-status low"
                            : "stock-status good"
                        }
                      >
                        {low ? "LOW STOCK" : "IN STOCK"}
                      </span>
                    </td>
                    <td>
                      {money.format(stock * product.purchasePrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

### `src/pages/POS.jsx`

```javascript
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  ScanBarcode,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function POS() {
  const { products, getStock, completeSale } = useShop();

  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [message, setMessage] = useState(
    "Ready to scan. Try barcode 8900000010016"
  );
  const [messageType, setMessageType] = useState("info");

  const barcodeRef = useRef(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(value) ||
          product.brand.toLowerCase().includes(value) ||
          product.sku.toLowerCase().includes(value) ||
          product.barcode.includes(value)
      )
      .slice(0, 8);
  }, [search, products]);

  function currentCartQuantity(productId) {
    return (
      cart.find((item) => item.product.id === productId)?.quantity || 0
    );
  }

  function addProduct(product) {
    const available = getStock(product.id);
    const alreadyInCart = currentCartQuantity(product.id);

    if (available <= 0) {
      setMessage(`${product.name} is OUT OF STOCK.`);
      setMessageType("error");
      return;
    }

    if (alreadyInCart + 1 > available) {
      setMessage(`Only ${available} unit(s) of ${product.name} available.`);
      setMessageType("error");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { product, quantity: 1 }];
    });

    setMessage(`${product.name} added to cart.`);
    setMessageType("success");
  }

  function handleBarcodeSubmit(event) {
    event.preventDefault();

    const scannedBarcode = barcode.trim();

    if (!scannedBarcode) {
      return;
    }

    const product = products.find(
      (item) => item.barcode === scannedBarcode
    );

    if (!product) {
      setMessage(`PRODUCT NOT FOUND: ${scannedBarcode}`);
      setMessageType("error");
    } else {
      addProduct(product);
    }

    setBarcode("");

    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }

  function changeQuantity(productId, delta) {
    const item = cart.find(
      (cartItem) => cartItem.product.id === productId
    );

    if (!item) {
      return;
    }

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const available = getStock(productId);

    if (newQuantity > available) {
      setMessage(`Only ${available} unit(s) available.`);
      setMessageType("error");
      return;
    }

    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.product.id === productId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  }

  function removeItem(productId) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product.id !== productId
      )
    );
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function handleCompleteSale() {
    const result = completeSale(cart, paymentMethod);

    if (!result.ok) {
      setMessage(result.message);
      setMessageType("error");
      return;
    }

    setMessage(
      `${result.sale.invoiceNumber} completed successfully for ${money.format(
        result.sale.grandTotal
      )}.`
    );
    setMessageType("success");
    setCart([]);
    setSearch("");

    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>POS Billing</h2>
          <p>Scan barcode or search a product manually</p>
        </div>

        <div className="cart-count">
          <ShoppingCart size={18} />
          {itemCount} item(s)
        </div>
      </div>

      <div className="pos-layout">
        <section className="pos-left">
          <div className="panel barcode-panel">
            <form onSubmit={handleBarcodeSubmit}>
              <label className="input-label">
                <ScanBarcode size={18} />
                Scan Barcode
              </label>

              <div className="barcode-input-row">
                <input
                  ref={barcodeRef}
                  className="barcode-input"
                  value={barcode}
                  onChange={(event) =>
                    setBarcode(event.target.value)
                  }
                  placeholder="Scan barcode and press Enter"
                  autoComplete="off"
                />

                <button className="primary-button" type="submit">
                  Add
                </button>
              </div>
            </form>

            <div className={`pos-message ${messageType}`}>
              {message}
            </div>
          </div>

          <div className="panel">
            <label className="input-label">
              <Search size={18} />
              Manual Product Search
            </label>

            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, brand, SKU or barcode"
            />

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((product) => (
                  <button
                    type="button"
                    className="search-result"
                    key={product.id}
                    onClick={() => addProduct(product)}
                  >
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        {product.barcode} · {product.sku}
                      </span>
                    </div>

                    <div className="search-result-right">
                      <strong>{money.format(product.price)}</strong>
                      <span>Stock: {getStock(product.id)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Current Cart</h3>
                <p>Products added to this bill</p>
              </div>

              {cart.length > 0 && (
                <button
                  className="text-button danger-text"
                  onClick={() => setCart([])}
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={42} />
                <strong>Cart is empty</strong>
                <span>Scan a barcode to begin billing.</span>
              </div>
            ) : (
              <div className="cart-table">
                {cart.map((item) => (
                  <div className="cart-row" key={item.product.id}>
                    <div className="cart-product">
                      <strong>{item.product.name}</strong>
                      <span>
                        {item.product.barcode} · Stock{" "}
                        {getStock(item.product.id)}
                      </span>
                    </div>

                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, -1)
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, 1)
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="cart-price">
                      <span>{money.format(item.product.price)} each</span>
                      <strong>
                        {money.format(
                          item.product.price * item.quantity
                        )}
                      </strong>
                    </div>

                    <button
                      className="icon-button danger"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="checkout-panel">
          <div>
            <h3>Bill Summary</h3>
            <p>{itemCount} item(s)</p>
          </div>

          <div className="bill-lines">
            <div>
              <span>Subtotal</span>
              <strong>{money.format(subtotal)}</strong>
            </div>

            <div>
              <span>Discount</span>
              <strong>{money.format(0)}</strong>
            </div>
          </div>

          <div className="grand-total">
            <span>Grand Total</span>
            <strong>{money.format(subtotal)}</strong>
          </div>

          <div className="payment-title">Payment Method</div>

          <div className="payment-options">
            <button
              className={
                paymentMethod === "CASH"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CASH")}
            >
              <Banknote size={21} />
              CASH
            </button>

            <button
              className={
                paymentMethod === "UPI"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("UPI")}
            >
              <Smartphone size={21} />
              UPI
            </button>

            <button
              className={
                paymentMethod === "CARD"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CARD")}
            >
              <CreditCard size={21} />
              CARD
            </button>
          </div>

          <button
            className="complete-sale"
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
          >
            Complete Sale
            <span>{money.format(subtotal)}</span>
          </button>

          <div className="test-barcode-box">
            <strong>Test Scanner</strong>
            <span>Try typing:</span>
            <code>8900000010016</code>
            <span>Then press Enter.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
```

### `src/pages/Placeholder.jsx`

```javascript
export default function Placeholder({ title, description }) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="panel coming-soon">
        <h3>{title}</h3>
        <p>
          This module is reserved for the next development chapters.
        </p>
      </div>
    </div>
  );
}
```

### `src/pages/Products.jsx`

```javascript
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Products() {
  const { products, getStock } = useShop();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.category.toLowerCase().includes(value) ||
        product.barcode.includes(value) ||
        product.sku.toLowerCase().includes(value)
    );
  }, [products, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Product Master</h2>
          <p>{products.length} development products loaded</p>
        </div>
      </div>

      <div className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, barcode, SKU or category"
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Selling Price</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="table-product">
                      <strong>{product.name}</strong>
                      <span>{product.brand}</span>
                    </div>
                  </td>

                  <td className="mono">{product.barcode}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span className="category-badge">
                      {product.category}
                    </span>
                  </td>
                  <td>{getStock(product.id)}</td>
                  <td>{money.format(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="demo-note">
        Barcodes and prices are dummy development values and are not official
        product data.
      </div>
    </div>
  );
}
```

### `src/pages/Sales.jsx`

```javascript
import { ReceiptText } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Sales() {
  const { sales } = useShop();

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Sales History</h2>
          <p>Completed local transactions</p>
        </div>
      </div>

      <div className="panel">
        {sales.length === 0 ? (
          <div className="large-empty-state">
            <ReceiptText size={48} />
            <h3>No sales yet</h3>
            <p>Complete a transaction from POS Billing.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong>{sale.invoiceNumber}</strong>
                    </td>

                    <td>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {sale.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}
                    </td>

                    <td>
                      <span className="category-badge">
                        {sale.paymentMethod}
                      </span>
                    </td>

                    <td>
                      <strong>{money.format(sale.grandTotal)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

### `src/pages/Settings.jsx`

```javascript
import { RotateCcw } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function Settings() {
  const { resetDemo } = useShop();

  function handleReset() {
    const confirmed = window.confirm(
      "Reset inventory and delete all local demo sales?"
    );

    if (confirmed) {
      resetDemo();
      window.alert("Demo data has been reset.");
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Settings</h2>
          <p>Prototype application settings</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel">
          <h3>Store Information</h3>

          <div className="settings-fields">
            <label>
              Store Name
              <input value="Demo Wine Shop" readOnly />
            </label>

            <label>
              Currency
              <input value="INR (₹)" readOnly />
            </label>

            <label>
              Data Mode
              <input value="Browser LocalStorage" readOnly />
            </label>
          </div>
        </section>

        <section className="panel danger-zone">
          <h3>Demo Data</h3>
          <p>
            Reset all inventory quantities back to opening stock and remove
            local sales.
          </p>

          <button className="danger-button" onClick={handleReset}>
            <RotateCcw size={18} />
            Reset Demo Data
          </button>
        </section>
      </div>
    </div>
  );
}
```

### `vite.config.js`

```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

# Milestone: Chapter 7

## Commit metadata

```text
Commit: ec3b8e201c0631e0bf6b05c489cd8ad6323d1af9
Short: ec3b8e2
Author: saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
Date: 2026-08-29T09:32:05-04:00
Subject: Chapter 7 - Receive stock purchases and case handling
```

## Exact patch

```diff
commit ec3b8e201c0631e0bf6b05c489cd8ad6323d1af9
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Sat Aug 29 09:32:05 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Sat Aug 29 09:32:05 2026 -0400

    Chapter 7 - Receive stock purchases and case handling
---
 src/App.jsx                 |  30 +-
 src/context/ShopContext.jsx | 348 ++++++++++++++--
 src/index.css               | 504 +++++++++++++++++++++++
 src/pages/Purchases.jsx     | 951 ++++++++++++++++++++++++++++++++++++++++++++
 4 files changed, 1788 insertions(+), 45 deletions(-)

diff --git a/src/App.jsx b/src/App.jsx
index def6000..b98ccda 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -3,8 +3,9 @@ import Layout from "./components/Layout";
 import Dashboard from "./pages/Dashboard";
 import Inventory from "./pages/Inventory";
 import POS from "./pages/POS";
-import Placeholder from "./pages/Placeholder";
 import Products from "./pages/Products";
+import Purchases from "./pages/Purchases";
+import Placeholder from "./pages/Placeholder";
 import Sales from "./pages/Sales";
 import Settings from "./pages/Settings";

@@ -16,21 +17,25 @@ export default function App() {

         <Route path="pos" element={<POS />} />

-        <Route path="products" element={<Products />} />
+        <Route
+          path="products"
+          element={<Products />}
+        />

-        <Route path="inventory" element={<Inventory />} />
+        <Route
+          path="inventory"
+          element={<Inventory />}
+        />

         <Route
           path="purchases"
-          element={
-            <Placeholder
-              title="Purchases"
-              description="Supplier purchases and receive-stock workflow"
-            />
-          }
+          element={<Purchases />}
         />

-        <Route path="sales" element={<Sales />} />
+        <Route
+          path="sales"
+          element={<Sales />}
+        />

         <Route
           path="reports"
@@ -42,7 +47,10 @@ export default function App() {
           }
         />

-        <Route path="settings" element={<Settings />} />
+        <Route
+          path="settings"
+          element={<Settings />}
+        />
       </Route>
     </Routes>
   );
diff --git a/src/context/ShopContext.jsx b/src/context/ShopContext.jsx
index 2a6a22e..8f0be49 100644
--- a/src/context/ShopContext.jsx
+++ b/src/context/ShopContext.jsx
@@ -1,24 +1,33 @@
 import { createContext, useContext, useEffect, useState } from "react";
-import { products } from "../data/products";
+import { products as seedProducts } from "../data/products";

 const ShopContext = createContext(null);

 const INVENTORY_KEY = "wineshop_inventory_v1";
 const SALES_KEY = "wineshop_sales_v1";
+const PURCHASES_KEY = "wineshop_purchases_v1";

-function createInitialInventory() {
-  let saved = {};
-
+function loadJSON(key, fallback) {
   try {
-    saved = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {};
+    const value = localStorage.getItem(key);
+
+    if (!value) {
+      return fallback;
+    }
+
+    return JSON.parse(value);
   } catch {
-    saved = {};
+    return fallback;
   }
+}
+
+function createInitialInventory() {
+  const savedInventory = loadJSON(INVENTORY_KEY, {});

-  return products.reduce((result, product) => {
+  return seedProducts.reduce((result, product) => {
     result[product.id] =
-      typeof saved[product.id] === "number"
-        ? saved[product.id]
+      typeof savedInventory[product.id] === "number"
+        ? savedInventory[product.id]
         : product.openingStock;

     return result;
@@ -26,25 +35,49 @@ function createInitialInventory() {
 }

 function createInitialSales() {
-  try {
-    return JSON.parse(localStorage.getItem(SALES_KEY)) || [];
-  } catch {
-    return [];
-  }
+  return loadJSON(SALES_KEY, []);
+}
+
+function createInitialPurchases() {
+  return loadJSON(PURCHASES_KEY, []);
 }

 export function ShopProvider({ children }) {
-  const [inventory, setInventory] = useState(createInitialInventory);
-  const [sales, setSales] = useState(createInitialSales);
+  const [products] = useState(seedProducts);
+
+  const [inventory, setInventory] = useState(
+    createInitialInventory
+  );
+
+  const [sales, setSales] = useState(
+    createInitialSales
+  );
+
+  const [purchases, setPurchases] = useState(
+    createInitialPurchases
+  );

   useEffect(() => {
-    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
+    localStorage.setItem(
+      INVENTORY_KEY,
+      JSON.stringify(inventory)
+    );
   }, [inventory]);

   useEffect(() => {
-    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
+    localStorage.setItem(
+      SALES_KEY,
+      JSON.stringify(sales)
+    );
   }, [sales]);

+  useEffect(() => {
+    localStorage.setItem(
+      PURCHASES_KEY,
+      JSON.stringify(purchases)
+    );
+  }, [purchases]);
+
   function getStock(productId) {
     return inventory[productId] ?? 0;
   }
@@ -58,12 +91,15 @@ export function ShopProvider({ children }) {
     }

     for (const item of cart) {
-      const available = inventory[item.product.id] ?? 0;
+      const available =
+        inventory[item.product.id] ?? 0;

       if (item.quantity > available) {
         return {
           ok: false,
-          message: `Only ${available} unit(s) of ${item.product.name} are available.`,
+          message:
+            `Only ${available} unit(s) of ` +
+            `${item.product.name} are available.`,
         };
       }
     }
@@ -71,18 +107,26 @@ export function ShopProvider({ children }) {
     const updatedInventory = { ...inventory };

     cart.forEach((item) => {
-      updatedInventory[item.product.id] -= item.quantity;
+      updatedInventory[item.product.id] -=
+        item.quantity;
     });

     const subtotal = cart.reduce(
-      (total, item) => total + item.product.price * item.quantity,
+      (total, item) =>
+        total +
+        item.product.price * item.quantity,
       0
     );

-    const invoiceNumber = `INV-${new Date()
-      .toISOString()
-      .slice(0, 10)
-      .replaceAll("-", "")}-${String(sales.length + 1).padStart(4, "0")}`;
+    const invoiceNumber =
+      `INV-${new Date()
+        .toISOString()
+        .slice(0, 10)
+        .replaceAll("-", "")}-` +
+      `${String(sales.length + 1).padStart(
+        4,
+        "0"
+      )}`;

     const sale = {
       id: crypto.randomUUID(),
@@ -92,18 +136,25 @@ export function ShopProvider({ children }) {
       subtotal,
       discount: 0,
       grandTotal: subtotal,
+
       items: cart.map((item) => ({
         productId: item.product.id,
         productName: item.product.name,
         barcode: item.product.barcode,
         quantity: item.quantity,
         unitPrice: item.product.price,
-        lineTotal: item.product.price * item.quantity,
+        lineTotal:
+          item.product.price *
+          item.quantity,
       })),
     };

     setInventory(updatedInventory);
-    setSales((currentSales) => [sale, ...currentSales]);
+
+    setSales((currentSales) => [
+      sale,
+      ...currentSales,
+    ]);

     return {
       ok: true,
@@ -111,14 +162,238 @@ export function ShopProvider({ children }) {
     };
   }

+  function receiveStock({
+    supplierName,
+    invoiceNumber,
+    invoiceDate,
+    items,
+    notes = "",
+  }) {
+    if (!supplierName?.trim()) {
+      return {
+        ok: false,
+        message: "Supplier name is required.",
+      };
+    }
+
+    if (!invoiceNumber?.trim()) {
+      return {
+        ok: false,
+        message:
+          "Supplier invoice number is required.",
+      };
+    }
+
+    if (!items?.length) {
+      return {
+        ok: false,
+        message: "Add at least one product.",
+      };
+    }
+
+    const duplicateInvoice = purchases.some(
+      (purchase) =>
+        purchase.invoiceNumber
+          .trim()
+          .toLowerCase() ===
+        invoiceNumber.trim().toLowerCase()
+    );
+
+    if (duplicateInvoice) {
+      return {
+        ok: false,
+        message:
+          "This supplier invoice already exists.",
+      };
+    }
+
+    const updatedInventory = {
+      ...inventory,
+    };
+
+    const purchaseItems = [];
+
+    for (const item of items) {
+      const product = products.find(
+        (productItem) =>
+          productItem.id === item.productId
+      );
+
+      if (!product) {
+        return {
+          ok: false,
+          message:
+            "Invalid product selected.",
+        };
+      }
+
+      const quantity =
+        Number(item.quantity);
+
+      const purchasePrice =
+        Number(item.purchasePrice);
+
+      const caseCount =
+        Number(item.caseCount) || 0;
+
+      const unitsPerCase =
+        Number(item.unitsPerCase) || 1;
+
+      const looseBottles =
+        Number(item.looseBottles) || 0;
+
+      if (
+        !Number.isInteger(quantity) ||
+        quantity <= 0
+      ) {
+        return {
+          ok: false,
+          message:
+            `Invalid quantity for ${product.name}.`,
+        };
+      }
+
+      if (
+        Number.isNaN(purchasePrice) ||
+        purchasePrice < 0
+      ) {
+        return {
+          ok: false,
+          message:
+            `Invalid purchase price for ${product.name}.`,
+        };
+      }
+
+      if (
+        caseCount < 0 ||
+        looseBottles < 0 ||
+        unitsPerCase <= 0
+      ) {
+        return {
+          ok: false,
+          message:
+            `Invalid case information for ${product.name}.`,
+        };
+      }
+
+      const stockBefore =
+        updatedInventory[product.id] ?? 0;
+
+      const stockAfter =
+        stockBefore + quantity;
+
+      updatedInventory[product.id] =
+        stockAfter;
+
+      purchaseItems.push({
+        productId: product.id,
+        productName: product.name,
+        barcode: product.barcode,
+
+        purchaseUnit:
+          caseCount > 0
+            ? "CASE"
+            : "BOTTLE",
+
+        caseCount,
+
+        unitsPerCase,
+
+        looseBottles,
+
+        quantity,
+
+        purchasePrice,
+
+        lineTotal:
+          quantity * purchasePrice,
+
+        stockBefore,
+
+        stockAfter,
+      });
+    }
+
+    const total =
+      purchaseItems.reduce(
+        (sum, item) =>
+          sum + item.lineTotal,
+        0
+      );
+
+    const totalUnits =
+      purchaseItems.reduce(
+        (sum, item) =>
+          sum + item.quantity,
+        0
+      );
+
+    const purchaseNumber =
+      `PUR-${new Date()
+        .toISOString()
+        .slice(0, 10)
+        .replaceAll("-", "")}-` +
+      `${String(
+        purchases.length + 1
+      ).padStart(4, "0")}`;
+
+    const purchase = {
+      id: crypto.randomUUID(),
+
+      purchaseNumber,
+
+      supplierName:
+        supplierName.trim(),
+
+      invoiceNumber:
+        invoiceNumber.trim(),
+
+      invoiceDate:
+        invoiceDate ||
+        new Date()
+          .toISOString()
+          .slice(0, 10),
+
+      createdAt:
+        new Date().toISOString(),
+
+      notes,
+
+      total,
+
+      totalUnits,
+
+      items: purchaseItems,
+    };
+
+    setInventory(updatedInventory);
+
+    setPurchases((currentPurchases) => [
+      purchase,
+      ...currentPurchases,
+    ]);
+
+    return {
+      ok: true,
+      purchase,
+    };
+  }
+
   function resetDemo() {
-    const initialInventory = products.reduce((result, product) => {
-      result[product.id] = product.openingStock;
-      return result;
-    }, {});
+    const initialInventory =
+      products.reduce(
+        (result, product) => {
+          result[product.id] =
+            product.openingStock;
+
+          return result;
+        },
+        {}
+      );

     setInventory(initialInventory);
     setSales([]);
+    setPurchases([]);
   }

   return (
@@ -127,8 +402,10 @@ export function ShopProvider({ children }) {
         products,
         inventory,
         sales,
+        purchases,
         getStock,
         completeSale,
+        receiveStock,
         resetDemo,
       }}
     >
@@ -138,10 +415,13 @@ export function ShopProvider({ children }) {
 }

 export function useShop() {
-  const context = useContext(ShopContext);
+  const context =
+    useContext(ShopContext);

   if (!context) {
-    throw new Error("useShop must be used inside ShopProvider");
+    throw new Error(
+      "useShop must be used inside ShopProvider"
+    );
   }

   return context;
diff --git a/src/index.css b/src/index.css
index 32891a8..f49d369 100644
--- a/src/index.css
+++ b/src/index.css
@@ -984,3 +984,507 @@ button {
     flex-direction: column;
   }
 }
+
+/* =========================================================
+   CHAPTER 7 - PURCHASE / RECEIVE STOCK
+   ========================================================= */
+
+.receive-heading-icon {
+  display: flex;
+  align-items: center;
+  gap: 7px;
+  padding: 9px 12px;
+  border-radius: 8px;
+  background: #fff;
+  border: 1px solid #e2e3e5;
+  font-size: 12px;
+  font-weight: 700;
+}
+
+.purchase-message {
+  margin-bottom: 18px;
+  padding: 12px 14px;
+  border-radius: 9px;
+  font-size: 12px;
+  font-weight: 600;
+}
+
+.purchase-message.info {
+  background: #edf4ff;
+  color: #315883;
+}
+
+.purchase-message.success {
+  background: #eaf8ee;
+  color: #246b39;
+  border: 1px solid #cbe8d3;
+}
+
+.purchase-message.error {
+  background: #fff0ef;
+  color: #a12b23;
+  border: 1px solid #f2c6c3;
+}
+
+.purchase-layout {
+  display: grid;
+  grid-template-columns: minmax(0, 1fr) 320px;
+  gap: 18px;
+  align-items: start;
+}
+
+.purchase-main {
+  display: flex;
+  flex-direction: column;
+  gap: 18px;
+}
+
+.purchase-form-grid {
+  display: grid;
+  grid-template-columns: repeat(2, minmax(0, 1fr));
+  gap: 16px;
+}
+
+.purchase-form-grid label,
+.purchase-item-row label {
+  display: flex;
+  flex-direction: column;
+  gap: 6px;
+  color: #676970;
+  font-size: 11px;
+  font-weight: 700;
+}
+
+.purchase-form-grid input,
+.purchase-item-row input {
+  width: 100%;
+  height: 42px;
+  padding: 0 11px;
+  border: 1px solid #dcdde0;
+  border-radius: 8px;
+  outline: none;
+  background: #fff;
+}
+
+.purchase-form-grid input:focus,
+.purchase-item-row input:focus {
+  border-color: #8e244d;
+  box-shadow: 0 0 0 3px rgba(142, 36, 77, 0.08);
+}
+
+.input-with-icon,
+.price-input {
+  display: flex;
+  align-items: center;
+  gap: 7px;
+  padding-left: 10px;
+  border: 1px solid #dcdde0;
+  border-radius: 8px;
+  background: #fff;
+}
+
+.input-with-icon input,
+.price-input input {
+  border: 0;
+  box-shadow: none;
+  padding-left: 0;
+}
+
+.input-with-icon input:focus,
+.price-input input:focus {
+  box-shadow: none;
+}
+
+.purchase-search {
+  height: 44px;
+  display: flex;
+  align-items: center;
+  gap: 8px;
+  padding: 0 12px;
+  border: 1px solid #dcdde0;
+  border-radius: 8px;
+}
+
+.purchase-search:focus-within {
+  border-color: #8e244d;
+  box-shadow: 0 0 0 3px rgba(142, 36, 77, 0.08);
+}
+
+.purchase-search input {
+  width: 100%;
+  border: 0;
+  outline: 0;
+}
+
+.purchase-search-results {
+  margin-top: 9px;
+  overflow: hidden;
+  border: 1px solid #e2e3e5;
+  border-radius: 9px;
+}
+
+.purchase-search-result {
+  width: 100%;
+  padding: 12px 13px;
+  border: 0;
+  border-bottom: 1px solid #eeeeef;
+  display: grid;
+  grid-template-columns: 1fr 140px 25px;
+  gap: 10px;
+  align-items: center;
+  background: #fff;
+  text-align: left;
+}
+
+.purchase-search-result:last-child {
+  border-bottom: 0;
+}
+
+.purchase-search-result:hover {
+  background: #fbf8f9;
+}
+
+.purchase-search-result > div {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.purchase-search-result strong {
+  font-size: 12px;
+}
+
+.purchase-search-result span {
+  color: #8d8f96;
+  font-size: 10px;
+}
+
+.purchase-search-right {
+  text-align: right;
+}
+
+.purchase-empty {
+  min-height: 180px;
+  display: grid;
+  place-items: center;
+  align-content: center;
+  gap: 4px;
+  color: #9a9ca2;
+}
+
+.purchase-empty strong {
+  margin-top: 8px;
+  color: #55575c;
+}
+
+.purchase-empty span {
+  font-size: 11px;
+}
+
+.purchase-items {
+  display: flex;
+  flex-direction: column;
+}
+
+.purchase-item-row {
+  padding: 14px 0;
+  display: grid;
+  grid-template-columns:
+    minmax(180px, 1fr)
+    110px
+    140px
+    115px
+    36px;
+  gap: 12px;
+  align-items: end;
+  border-bottom: 1px solid #ededee;
+}
+
+.purchase-item-row:last-child {
+  border-bottom: 0;
+}
+
+.purchase-product-info {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.purchase-product-info strong {
+  font-size: 13px;
+}
+
+.purchase-product-info span {
+  color: #8f9197;
+  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
+  font-size: 10px;
+}
+
+.purchase-product-info small {
+  color: #476a52;
+  font-size: 10px;
+  font-weight: 700;
+}
+
+.purchase-line-total {
+  min-height: 42px;
+  display: flex;
+  flex-direction: column;
+  justify-content: center;
+  text-align: right;
+}
+
+.purchase-line-total span {
+  color: #919399;
+  font-size: 9px;
+}
+
+.purchase-line-total strong {
+  margin-top: 2px;
+  font-size: 13px;
+}
+
+.purchase-summary {
+  position: sticky;
+  top: 94px;
+  padding: 21px;
+  border-radius: 13px;
+  background: #23111b;
+  color: #fff;
+}
+
+.purchase-summary-title h3 {
+  margin: 0;
+  font-size: 17px;
+}
+
+.purchase-summary-title span {
+  display: block;
+  margin-top: 4px;
+  color: #bbaeb4;
+  font-size: 10px;
+}
+
+.purchase-summary-lines {
+  margin-top: 20px;
+  padding: 15px 0;
+  border-top: 1px solid rgba(255,255,255,0.1);
+  border-bottom: 1px solid rgba(255,255,255,0.1);
+  display: flex;
+  flex-direction: column;
+  gap: 11px;
+}
+
+.purchase-summary-lines > div {
+  display: flex;
+  justify-content: space-between;
+}
+
+.purchase-summary-lines span {
+  color: #c4b6bc;
+  font-size: 11px;
+}
+
+.purchase-summary-lines strong {
+  font-size: 12px;
+}
+
+.purchase-grand-total {
+  padding: 18px 0;
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+}
+
+.purchase-grand-total span {
+  font-size: 12px;
+}
+
+.purchase-grand-total strong {
+  font-size: 23px;
+}
+
+.receive-stock-button {
+  width: 100%;
+  min-height: 49px;
+  padding: 0 14px;
+  border: 0;
+  border-radius: 9px;
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  gap: 8px;
+  background: #cf477b;
+  color: #fff;
+  font-weight: 800;
+}
+
+.receive-stock-button:hover {
+  background: #b83868;
+}
+
+.receive-stock-button:disabled {
+  opacity: 0.45;
+  cursor: not-allowed;
+}
+
+.purchase-help {
+  margin-top: 18px;
+  padding: 12px;
+  display: flex;
+  flex-direction: column;
+  gap: 5px;
+  border-radius: 8px;
+  background: rgba(255,255,255,0.06);
+}
+
+.purchase-help strong {
+  font-size: 10px;
+}
+
+.purchase-help span {
+  color: #bbaeb4;
+  font-size: 10px;
+  line-height: 1.5;
+}
+
+@media (max-width: 1100px) {
+  .purchase-layout {
+    grid-template-columns: 1fr;
+  }
+
+  .purchase-summary {
+    position: static;
+  }
+
+  .purchase-item-row {
+    grid-template-columns: 1fr 100px 130px;
+  }
+
+  .purchase-line-total {
+    text-align: left;
+  }
+}
+
+@media (max-width: 700px) {
+  .purchase-form-grid {
+    grid-template-columns: 1fr;
+  }
+
+  .purchase-item-row {
+    grid-template-columns: 1fr;
+  }
+
+  .purchase-search-result {
+    grid-template-columns: 1fr;
+  }
+
+  .purchase-search-right {
+    text-align: left;
+  }
+}
+
+/* =========================================================
+   CHAPTER 7.3 - CASE / CARTON PURCHASES
+   ========================================================= */
+
+.case-purchase-items {
+  gap: 14px;
+}
+
+.case-purchase-row {
+  padding: 16px;
+  border: 1px solid #e6e7e9;
+  border-radius: 10px;
+  background: #fcfcfd;
+}
+
+.case-product-header {
+  display: flex;
+  justify-content: space-between;
+  gap: 15px;
+  align-items: flex-start;
+  margin-bottom: 15px;
+}
+
+.case-entry-grid {
+  display: grid;
+  grid-template-columns:
+    repeat(
+      4,
+      minmax(0, 1fr)
+    );
+  gap: 12px;
+}
+
+.case-entry-grid label {
+  display: flex;
+  flex-direction: column;
+  gap: 6px;
+  color: #676970;
+  font-size: 10px;
+  font-weight: 700;
+}
+
+.case-entry-grid input {
+  width: 100%;
+  height: 40px;
+  padding: 0 10px;
+  border: 1px solid #dcdde0;
+  border-radius: 7px;
+  outline: none;
+  background: #fff;
+}
+
+.case-entry-grid input:focus {
+  border-color: #8e244d;
+  box-shadow:
+    0 0 0 3px
+    rgba(142, 36, 77, 0.08);
+}
+
+.case-calculation {
+  margin-top: 13px;
+  padding: 11px 12px;
+  border-radius: 8px;
+  display: grid;
+  grid-template-columns:
+    1fr 1fr 1fr;
+  gap: 15px;
+  background: #f4f1f2;
+}
+
+.case-calculation > div {
+  display: flex;
+  flex-direction: column;
+  gap: 3px;
+}
+
+.case-calculation span {
+  color: #8a8c94;
+  font-size: 9px;
+  font-weight: 700;
+}
+
+.case-calculation strong {
+  font-size: 12px;
+}
+
+.purchase-history-panel {
+  margin-top: 18px;
+}
+
+@media (max-width: 900px) {
+  .case-entry-grid {
+    grid-template-columns:
+      repeat(2, 1fr);
+  }
+}
+
+@media (max-width: 600px) {
+  .case-entry-grid,
+  .case-calculation {
+    grid-template-columns:
+      1fr;
+  }
+}
diff --git a/src/pages/Purchases.jsx b/src/pages/Purchases.jsx
new file mode 100644
index 0000000..004bad3
--- /dev/null
+++ b/src/pages/Purchases.jsx
@@ -0,0 +1,951 @@
+import { useMemo, useState } from "react";
+import {
+  CalendarDays,
+  IndianRupee,
+  PackagePlus,
+  Plus,
+  Search,
+  Trash2,
+  Truck,
+} from "lucide-react";
+
+import { useShop } from "../context/ShopContext";
+
+const money =
+  new Intl.NumberFormat("en-IN", {
+    style: "currency",
+    currency: "INR",
+    maximumFractionDigits: 0,
+  });
+
+export default function Purchases() {
+  const {
+    products,
+    purchases,
+    getStock,
+    receiveStock,
+  } = useShop();
+
+  const [supplierName, setSupplierName] =
+    useState("");
+
+  const [invoiceNumber, setInvoiceNumber] =
+    useState("");
+
+  const [invoiceDate, setInvoiceDate] =
+    useState(
+      new Date()
+        .toISOString()
+        .slice(0, 10)
+    );
+
+  const [notes, setNotes] =
+    useState("");
+
+  const [search, setSearch] =
+    useState("");
+
+  const [items, setItems] =
+    useState([]);
+
+  const [message, setMessage] =
+    useState("");
+
+  const [
+    messageType,
+    setMessageType,
+  ] = useState("info");
+
+  const searchResults =
+    useMemo(() => {
+      const value =
+        search.trim().toLowerCase();
+
+      if (!value) {
+        return [];
+      }
+
+      return products
+        .filter(
+          (product) =>
+            product.name
+              .toLowerCase()
+              .includes(value) ||
+            product.brand
+              .toLowerCase()
+              .includes(value) ||
+            product.sku
+              .toLowerCase()
+              .includes(value) ||
+            product.barcode.includes(value)
+        )
+        .slice(0, 8);
+    }, [search, products]);
+
+  function calculateQuantity(item) {
+    const cases =
+      Number(item.caseCount) || 0;
+
+    const unitsPerCase =
+      Number(item.unitsPerCase) || 0;
+
+    const loose =
+      Number(item.looseBottles) || 0;
+
+    return (
+      cases * unitsPerCase +
+      loose
+    );
+  }
+
+  function addProduct(product) {
+    const alreadyAdded =
+      items.some(
+        (item) =>
+          item.productId === product.id
+      );
+
+    if (alreadyAdded) {
+      setMessage(
+        `${product.name} is already added.`
+      );
+
+      setMessageType("error");
+      return;
+    }
+
+    setItems(
+      (currentItems) => [
+        ...currentItems,
+        {
+          productId: product.id,
+          productName:
+            product.name,
+          barcode:
+            product.barcode,
+          currentStock:
+            getStock(product.id),
+
+          caseCount: 1,
+
+          unitsPerCase:
+            product.unitsPerCase || 1,
+
+          looseBottles: 0,
+
+          purchasePrice:
+            product.purchasePrice,
+        },
+      ]
+    );
+
+    setSearch("");
+
+    setMessage(
+      `${product.name} added.`
+    );
+
+    setMessageType("success");
+  }
+
+  function updateItem(
+    productId,
+    field,
+    value
+  ) {
+    setItems(
+      (currentItems) =>
+        currentItems.map(
+          (item) =>
+            item.productId ===
+            productId
+              ? {
+                  ...item,
+                  [field]: value,
+                }
+              : item
+        )
+    );
+  }
+
+  function removeItem(productId) {
+    setItems(
+      (currentItems) =>
+        currentItems.filter(
+          (item) =>
+            item.productId !==
+            productId
+        )
+    );
+  }
+
+  const totalUnits =
+    items.reduce(
+      (total, item) =>
+        total +
+        calculateQuantity(item),
+      0
+    );
+
+  const purchaseTotal =
+    items.reduce(
+      (total, item) => {
+        const quantity =
+          calculateQuantity(item);
+
+        const price =
+          Number(
+            item.purchasePrice
+          ) || 0;
+
+        return (
+          total +
+          quantity * price
+        );
+      },
+      0
+    );
+
+  function clearForm() {
+    setSupplierName("");
+    setInvoiceNumber("");
+
+    setInvoiceDate(
+      new Date()
+        .toISOString()
+        .slice(0, 10)
+    );
+
+    setNotes("");
+    setSearch("");
+    setItems([]);
+  }
+
+  function handleReceiveStock() {
+    const formattedItems =
+      items.map((item) => ({
+        productId:
+          item.productId,
+
+        caseCount:
+          Number(item.caseCount) ||
+          0,
+
+        unitsPerCase:
+          Number(
+            item.unitsPerCase
+          ) || 1,
+
+        looseBottles:
+          Number(
+            item.looseBottles
+          ) || 0,
+
+        quantity:
+          calculateQuantity(item),
+
+        purchasePrice:
+          Number(
+            item.purchasePrice
+          ),
+      }));
+
+    const result =
+      receiveStock({
+        supplierName,
+        invoiceNumber,
+        invoiceDate,
+        items:
+          formattedItems,
+        notes,
+      });
+
+    if (!result.ok) {
+      setMessage(
+        result.message
+      );
+
+      setMessageType(
+        "error"
+      );
+
+      return;
+    }
+
+    setMessage(
+      `${result.purchase.purchaseNumber} received successfully. ` +
+      `${result.purchase.totalUnits} bottle(s) added to inventory.`
+    );
+
+    setMessageType(
+      "success"
+    );
+
+    clearForm();
+  }
+
+  return (
+    <div>
+      <div className="page-heading">
+        <div>
+          <h2>
+            Receive Stock
+          </h2>
+
+          <p>
+            Supplier purchases,
+            cases and loose bottles
+          </p>
+        </div>
+
+        <div className="receive-heading-icon">
+          <Truck size={20} />
+          New Purchase
+        </div>
+      </div>
+
+      {message && (
+        <div
+          className={`purchase-message ${messageType}`}
+        >
+          {message}
+        </div>
+      )}
+
+      <div className="purchase-layout">
+        <div className="purchase-main">
+          <section className="panel">
+            <div className="panel-header">
+              <div>
+                <h3>
+                  Supplier Information
+                </h3>
+
+                <p>
+                  Enter supplier invoice
+                  details
+                </p>
+              </div>
+            </div>
+
+            <div className="purchase-form-grid">
+              <label>
+                Supplier Name
+
+                <input
+                  value={
+                    supplierName
+                  }
+                  onChange={(
+                    event
+                  ) =>
+                    setSupplierName(
+                      event.target
+                        .value
+                    )
+                  }
+                  placeholder="ABC Distributors"
+                />
+              </label>
+
+              <label>
+                Supplier Invoice
+
+                <input
+                  value={
+                    invoiceNumber
+                  }
+                  onChange={(
+                    event
+                  ) =>
+                    setInvoiceNumber(
+                      event.target
+                        .value
+                    )
+                  }
+                  placeholder="ABC-45822"
+                />
+              </label>
+
+              <label>
+                Invoice Date
+
+                <div className="input-with-icon">
+                  <CalendarDays
+                    size={17}
+                  />
+
+                  <input
+                    type="date"
+                    value={
+                      invoiceDate
+                    }
+                    onChange={(
+                      event
+                    ) =>
+                      setInvoiceDate(
+                        event.target
+                          .value
+                      )
+                    }
+                  />
+                </div>
+              </label>
+
+              <label>
+                Notes
+
+                <input
+                  value={notes}
+                  onChange={(
+                    event
+                  ) =>
+                    setNotes(
+                      event.target
+                        .value
+                    )
+                  }
+                  placeholder="Optional notes"
+                />
+              </label>
+            </div>
+          </section>
+
+          <section className="panel">
+            <div className="panel-header">
+              <div>
+                <h3>
+                  Add Products
+                </h3>
+
+                <p>
+                  Search by product,
+                  barcode or SKU
+                </p>
+              </div>
+            </div>
+
+            <div className="purchase-search">
+              <Search size={18} />
+
+              <input
+                value={search}
+                onChange={(
+                  event
+                ) =>
+                  setSearch(
+                    event.target
+                      .value
+                  )
+                }
+                placeholder="Search product..."
+              />
+            </div>
+
+            {searchResults.length >
+              0 && (
+              <div className="purchase-search-results">
+                {searchResults.map(
+                  (product) => (
+                    <button
+                      key={
+                        product.id
+                      }
+                      type="button"
+                      className="purchase-search-result"
+                      onClick={() =>
+                        addProduct(
+                          product
+                        )
+                      }
+                    >
+                      <div>
+                        <strong>
+                          {
+                            product.name
+                          }
+                        </strong>
+
+                        <span>
+                          {
+                            product.barcode
+                          }{" "}
+                          ·{" "}
+                          {
+                            product.sku
+                          }
+                        </span>
+                      </div>
+
+                      <div className="purchase-search-right">
+                        <strong>
+                          {money.format(
+                            product.purchasePrice
+                          )}
+                        </strong>
+
+                        <span>
+                          Stock:{" "}
+                          {getStock(
+                            product.id
+                          )}
+                        </span>
+                      </div>
+
+                      <Plus
+                        size={18}
+                      />
+                    </button>
+                  )
+                )}
+              </div>
+            )}
+          </section>
+
+          <section className="panel">
+            <div className="panel-header">
+              <div>
+                <h3>
+                  Purchase Items
+                </h3>
+
+                <p>
+                  {items.length}{" "}
+                  product(s)
+                </p>
+              </div>
+            </div>
+
+            {items.length === 0 ? (
+              <div className="purchase-empty">
+                <PackagePlus
+                  size={42}
+                />
+
+                <strong>
+                  No products added
+                </strong>
+
+                <span>
+                  Search and add an
+                  existing product.
+                </span>
+              </div>
+            ) : (
+              <div className="purchase-items case-purchase-items">
+                {items.map(
+                  (item) => {
+                    const quantity =
+                      calculateQuantity(
+                        item
+                      );
+
+                    return (
+                      <div
+                        key={
+                          item.productId
+                        }
+                        className="case-purchase-row"
+                      >
+                        <div className="case-product-header">
+                          <div className="purchase-product-info">
+                            <strong>
+                              {
+                                item.productName
+                              }
+                            </strong>
+
+                            <span>
+                              {
+                                item.barcode
+                              }
+                            </span>
+
+                            <small>
+                              Current Stock:{" "}
+                              {getStock(
+                                item.productId
+                              )}
+                            </small>
+                          </div>
+
+                          <button
+                            type="button"
+                            className="icon-button danger"
+                            onClick={() =>
+                              removeItem(
+                                item.productId
+                              )
+                            }
+                          >
+                            <Trash2
+                              size={18}
+                            />
+                          </button>
+                        </div>
+
+                        <div className="case-entry-grid">
+                          <label>
+                            Cases
+
+                            <input
+                              type="number"
+                              min="0"
+                              step="1"
+                              value={
+                                item.caseCount
+                              }
+                              onChange={(
+                                event
+                              ) =>
+                                updateItem(
+                                  item.productId,
+                                  "caseCount",
+                                  event
+                                    .target
+                                    .value
+                                )
+                              }
+                            />
+                          </label>
+
+                          <label>
+                            Bottles / Case
+
+                            <input
+                              type="number"
+                              min="1"
+                              step="1"
+                              value={
+                                item.unitsPerCase
+                              }
+                              onChange={(
+                                event
+                              ) =>
+                                updateItem(
+                                  item.productId,
+                                  "unitsPerCase",
+                                  event
+                                    .target
+                                    .value
+                                )
+                              }
+                            />
+                          </label>
+
+                          <label>
+                            Loose Bottles
+
+                            <input
+                              type="number"
+                              min="0"
+                              step="1"
+                              value={
+                                item.looseBottles
+                              }
+                              onChange={(
+                                event
+                              ) =>
+                                updateItem(
+                                  item.productId,
+                                  "looseBottles",
+                                  event
+                                    .target
+                                    .value
+                                )
+                              }
+                            />
+                          </label>
+
+                          <label>
+                            Purchase Price
+                            / Bottle
+
+                            <div className="price-input">
+                              <IndianRupee
+                                size={
+                                  15
+                                }
+                              />
+
+                              <input
+                                type="number"
+                                min="0"
+                                step="0.01"
+                                value={
+                                  item.purchasePrice
+                                }
+                                onChange={(
+                                  event
+                                ) =>
+                                  updateItem(
+                                    item.productId,
+                                    "purchasePrice",
+                                    event
+                                      .target
+                                      .value
+                                  )
+                                }
+                              />
+                            </div>
+                          </label>
+                        </div>
+
+                        <div className="case-calculation">
+                          <div>
+                            <span>
+                              Calculation
+                            </span>
+
+                            <strong>
+                              {Number(
+                                item.caseCount
+                              ) ||
+                                0}{" "}
+                              ×{" "}
+                              {Number(
+                                item.unitsPerCase
+                              ) ||
+                                0}{" "}
+                              +{" "}
+                              {Number(
+                                item.looseBottles
+                              ) ||
+                                0}
+                            </strong>
+                          </div>
+
+                          <div>
+                            <span>
+                              Total
+                              Received
+                            </span>
+
+                            <strong>
+                              {quantity}{" "}
+                              bottles
+                            </strong>
+                          </div>
+
+                          <div>
+                            <span>
+                              Line Total
+                            </span>
+
+                            <strong>
+                              {money.format(
+                                quantity *
+                                  (Number(
+                                    item.purchasePrice
+                                  ) ||
+                                    0)
+                              )}
+                            </strong>
+                          </div>
+                        </div>
+                      </div>
+                    );
+                  }
+                )}
+              </div>
+            )}
+          </section>
+        </div>
+
+        <aside className="purchase-summary">
+          <div className="purchase-summary-title">
+            <h3>
+              Purchase Summary
+            </h3>
+
+            <span>
+              {items.length} product(s)
+            </span>
+          </div>
+
+          <div className="purchase-summary-lines">
+            <div>
+              <span>
+                Total Products
+              </span>
+
+              <strong>
+                {items.length}
+              </strong>
+            </div>
+
+            <div>
+              <span>
+                Total Bottles
+              </span>
+
+              <strong>
+                {totalUnits}
+              </strong>
+            </div>
+          </div>
+
+          <div className="purchase-grand-total">
+            <span>
+              Total Purchase
+            </span>
+
+            <strong>
+              {money.format(
+                purchaseTotal
+              )}
+            </strong>
+          </div>
+
+          <button
+            className="receive-stock-button"
+            onClick={
+              handleReceiveStock
+            }
+            disabled={
+              items.length === 0 ||
+              totalUnits === 0
+            }
+          >
+            <PackagePlus
+              size={19}
+            />
+
+            Receive Stock
+          </button>
+
+          <div className="purchase-help">
+            <strong>
+              Inventory Rule
+            </strong>
+
+            <span>
+              Cases are converted
+              into individual
+              sellable bottles
+              before inventory is
+              updated.
+            </span>
+          </div>
+        </aside>
+      </div>
+
+      <section className="panel purchase-history-panel">
+        <div className="panel-header">
+          <div>
+            <h3>
+              Purchase History
+            </h3>
+
+            <p>
+              Previously received
+              supplier purchases
+            </p>
+          </div>
+        </div>
+
+        {purchases.length === 0 ? (
+          <div className="empty-state">
+            No purchases recorded.
+          </div>
+        ) : (
+          <div className="data-table-wrapper">
+            <table className="data-table">
+              <thead>
+                <tr>
+                  <th>
+                    Purchase
+                  </th>
+                  <th>
+                    Supplier
+                  </th>
+                  <th>
+                    Supplier Invoice
+                  </th>
+                  <th>
+                    Invoice Date
+                  </th>
+                  <th>
+                    Products
+                  </th>
+                  <th>
+                    Bottles
+                  </th>
+                  <th>
+                    Total
+                  </th>
+                </tr>
+              </thead>
+
+              <tbody>
+                {purchases.map(
+                  (purchase) => (
+                    <tr
+                      key={
+                        purchase.id
+                      }
+                    >
+                      <td>
+                        <strong>
+                          {
+                            purchase.purchaseNumber
+                          }
+                        </strong>
+                      </td>
+
+                      <td>
+                        {
+                          purchase.supplierName
+                        }
+                      </td>
+
+                      <td>
+                        {
+                          purchase.invoiceNumber
+                        }
+                      </td>
+
+                      <td>
+                        {
+                          purchase.invoiceDate
+                        }
+                      </td>
+
+                      <td>
+                        {
+                          purchase.items
+                            .length
+                        }
+                      </td>
+
+                      <td>
+                        {purchase.totalUnits ??
+                          purchase.items.reduce(
+                            (
+                              total,
+                              item
+                            ) =>
+                              total +
+                              item.quantity,
+                            0
+                          )}
+                      </td>
+
+                      <td>
+                        <strong>
+                          {money.format(
+                            purchase.total
+                          )}
+                        </strong>
+                      </td>
+                    </tr>
+                  )
+                )}
+              </tbody>
+            </table>
+          </div>
+        )}
+      </section>
+    </div>
+  );
+}
```

## Exact source snapshot

### `.gitattributes`

```text
* text=auto eol=lf
```

### `.gitignore`

```text
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>wineshoppos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `package.json`

```json
{
  "name": "wineshoppos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^1.37.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "oxlint": "^1.79.0",
    "vite": "^8.2.2"
  }
}
```

### `src/App.css`

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
```

### `src/App.jsx`

```javascript
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Placeholder from "./pages/Placeholder";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />

        <Route path="pos" element={<POS />} />

        <Route
          path="products"
          element={<Products />}
        />

        <Route
          path="inventory"
          element={<Inventory />}
        />

        <Route
          path="purchases"
          element={<Purchases />}
        />

        <Route
          path="sales"
          element={<Sales />}
        />

        <Route
          path="reports"
          element={
            <Placeholder
              title="Reports"
              description="Sales, inventory and performance reporting"
            />
          }
        />

        <Route
          path="settings"
          element={<Settings />}
        />
      </Route>
    </Routes>
  );
}
```

### `src/components/Layout.jsx`

```javascript
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  ReceiptText,
  ScanBarcode,
  Settings,
  ShoppingBag,
  Truck,
  Warehouse,
  Wine,
} from "lucide-react";

const navigation = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/pos",
    label: "POS Billing",
    icon: ScanBarcode,
  },
  {
    path: "/products",
    label: "Products",
    icon: Package,
  },
  {
    path: "/inventory",
    label: "Inventory",
    icon: Warehouse,
  },
  {
    path: "/purchases",
    label: "Purchases",
    icon: Truck,
  },
  {
    path: "/sales",
    label: "Sales",
    icon: ReceiptText,
  },
  {
    path: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Wine size={25} />
          </div>

          <div>
            <div className="brand-name">WineShop POS</div>
            <div className="brand-subtitle">Retail Management</div>
          </div>
        </div>

        <nav className="nav-menu">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ShoppingBag size={18} />
          <div>
            <strong>Demo Store</strong>
            <span>Local prototype</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <h1>Wine Shop Management</h1>
            <p>Barcode billing & inventory</p>
          </div>

          <div className="user-pill">
            <div className="avatar">A</div>
            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <div className="page-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

### `src/context/ShopContext.jsx`

```javascript
import { createContext, useContext, useEffect, useState } from "react";
import { products as seedProducts } from "../data/products";

const ShopContext = createContext(null);

const INVENTORY_KEY = "wineshop_inventory_v1";
const SALES_KEY = "wineshop_sales_v1";
const PURCHASES_KEY = "wineshop_purchases_v1";

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function createInitialInventory() {
  const savedInventory = loadJSON(INVENTORY_KEY, {});

  return seedProducts.reduce((result, product) => {
    result[product.id] =
      typeof savedInventory[product.id] === "number"
        ? savedInventory[product.id]
        : product.openingStock;

    return result;
  }, {});
}

function createInitialSales() {
  return loadJSON(SALES_KEY, []);
}

function createInitialPurchases() {
  return loadJSON(PURCHASES_KEY, []);
}

export function ShopProvider({ children }) {
  const [products] = useState(seedProducts);

  const [inventory, setInventory] = useState(
    createInitialInventory
  );

  const [sales, setSales] = useState(
    createInitialSales
  );

  const [purchases, setPurchases] = useState(
    createInitialPurchases
  );

  useEffect(() => {
    localStorage.setItem(
      INVENTORY_KEY,
      JSON.stringify(inventory)
    );
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(
      SALES_KEY,
      JSON.stringify(sales)
    );
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(
      PURCHASES_KEY,
      JSON.stringify(purchases)
    );
  }, [purchases]);

  function getStock(productId) {
    return inventory[productId] ?? 0;
  }

  function completeSale(cart, paymentMethod) {
    if (!cart.length) {
      return {
        ok: false,
        message: "Cart is empty.",
      };
    }

    for (const item of cart) {
      const available =
        inventory[item.product.id] ?? 0;

      if (item.quantity > available) {
        return {
          ok: false,
          message:
            `Only ${available} unit(s) of ` +
            `${item.product.name} are available.`,
        };
      }
    }

    const updatedInventory = { ...inventory };

    cart.forEach((item) => {
      updatedInventory[item.product.id] -=
        item.quantity;
    });

    const subtotal = cart.reduce(
      (total, item) =>
        total +
        item.product.price * item.quantity,
      0
    );

    const invoiceNumber =
      `INV-${new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll("-", "")}-` +
      `${String(sales.length + 1).padStart(
        4,
        "0"
      )}`;

    const sale = {
      id: crypto.randomUUID(),
      invoiceNumber,
      createdAt: new Date().toISOString(),
      paymentMethod,
      subtotal,
      discount: 0,
      grandTotal: subtotal,

      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        quantity: item.quantity,
        unitPrice: item.product.price,
        lineTotal:
          item.product.price *
          item.quantity,
      })),
    };

    setInventory(updatedInventory);

    setSales((currentSales) => [
      sale,
      ...currentSales,
    ]);

    return {
      ok: true,
      sale,
    };
  }

  function receiveStock({
    supplierName,
    invoiceNumber,
    invoiceDate,
    items,
    notes = "",
  }) {
    if (!supplierName?.trim()) {
      return {
        ok: false,
        message: "Supplier name is required.",
      };
    }

    if (!invoiceNumber?.trim()) {
      return {
        ok: false,
        message:
          "Supplier invoice number is required.",
      };
    }

    if (!items?.length) {
      return {
        ok: false,
        message: "Add at least one product.",
      };
    }

    const duplicateInvoice = purchases.some(
      (purchase) =>
        purchase.invoiceNumber
          .trim()
          .toLowerCase() ===
        invoiceNumber.trim().toLowerCase()
    );

    if (duplicateInvoice) {
      return {
        ok: false,
        message:
          "This supplier invoice already exists.",
      };
    }

    const updatedInventory = {
      ...inventory,
    };

    const purchaseItems = [];

    for (const item of items) {
      const product = products.find(
        (productItem) =>
          productItem.id === item.productId
      );

      if (!product) {
        return {
          ok: false,
          message:
            "Invalid product selected.",
        };
      }

      const quantity =
        Number(item.quantity);

      const purchasePrice =
        Number(item.purchasePrice);

      const caseCount =
        Number(item.caseCount) || 0;

      const unitsPerCase =
        Number(item.unitsPerCase) || 1;

      const looseBottles =
        Number(item.looseBottles) || 0;

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return {
          ok: false,
          message:
            `Invalid quantity for ${product.name}.`,
        };
      }

      if (
        Number.isNaN(purchasePrice) ||
        purchasePrice < 0
      ) {
        return {
          ok: false,
          message:
            `Invalid purchase price for ${product.name}.`,
        };
      }

      if (
        caseCount < 0 ||
        looseBottles < 0 ||
        unitsPerCase <= 0
      ) {
        return {
          ok: false,
          message:
            `Invalid case information for ${product.name}.`,
        };
      }

      const stockBefore =
        updatedInventory[product.id] ?? 0;

      const stockAfter =
        stockBefore + quantity;

      updatedInventory[product.id] =
        stockAfter;

      purchaseItems.push({
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,

        purchaseUnit:
          caseCount > 0
            ? "CASE"
            : "BOTTLE",

        caseCount,

        unitsPerCase,

        looseBottles,

        quantity,

        purchasePrice,

        lineTotal:
          quantity * purchasePrice,

        stockBefore,

        stockAfter,
      });
    }

    const total =
      purchaseItems.reduce(
        (sum, item) =>
          sum + item.lineTotal,
        0
      );

    const totalUnits =
      purchaseItems.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

    const purchaseNumber =
      `PUR-${new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll("-", "")}-` +
      `${String(
        purchases.length + 1
      ).padStart(4, "0")}`;

    const purchase = {
      id: crypto.randomUUID(),

      purchaseNumber,

      supplierName:
        supplierName.trim(),

      invoiceNumber:
        invoiceNumber.trim(),

      invoiceDate:
        invoiceDate ||
        new Date()
          .toISOString()
          .slice(0, 10),

      createdAt:
        new Date().toISOString(),

      notes,

      total,

      totalUnits,

      items: purchaseItems,
    };

    setInventory(updatedInventory);

    setPurchases((currentPurchases) => [
      purchase,
      ...currentPurchases,
    ]);

    return {
      ok: true,
      purchase,
    };
  }

  function resetDemo() {
    const initialInventory =
      products.reduce(
        (result, product) => {
          result[product.id] =
            product.openingStock;

          return result;
        },
        {}
      );

    setInventory(initialInventory);
    setSales([]);
    setPurchases([]);
  }

  return (
    <ShopContext.Provider
      value={{
        products,
        inventory,
        sales,
        purchases,
        getStock,
        completeSale,
        receiveStock,
        resetDemo,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context =
    useContext(ShopContext);

  if (!context) {
    throw new Error(
      "useShop must be used inside ShopProvider"
    );
  }

  return context;
}
```

### `src/data/products.js`

```javascript
export const products = [
  {
    id: "p001",
    barcode: "8900000010001",
    sku: "WH-RS-180",
    name: "Royal Stag 180ml",
    brand: "Royal Stag",
    category: "Whisky",
    size: "180 ml",
    purchasePrice: 150,
    price: 210,
    minimumStock: 12,
    unitsPerCase: 48,
    openingStock: 48,
  },
  {
    id: "p002",
    barcode: "8900000010002",
    sku: "WH-RS-375",
    name: "Royal Stag 375ml",
    brand: "Royal Stag",
    category: "Whisky",
    size: "375 ml",
    purchasePrice: 285,
    price: 410,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 30,
  },
  {
    id: "p003",
    barcode: "8900000010003",
    sku: "WH-RS-750",
    name: "Royal Stag 750ml",
    brand: "Royal Stag",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 540,
    price: 780,
    minimumStock: 12,
    unitsPerCase: 12,
    openingStock: 36,
  },
  {
    id: "p004",
    barcode: "8900000010004",
    sku: "WH-BP-375",
    name: "Blenders Pride 375ml",
    brand: "Blenders Pride",
    category: "Whisky",
    size: "375 ml",
    purchasePrice: 620,
    price: 850,
    minimumStock: 8,
    unitsPerCase: 24,
    openingStock: 20,
  },
  {
    id: "p005",
    barcode: "8900000010005",
    sku: "WH-BP-750",
    name: "Blenders Pride 750ml",
    brand: "Blenders Pride",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 1200,
    price: 1650,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 24,
  },
  {
    id: "p006",
    barcode: "8900000010006",
    sku: "WH-IB-180",
    name: "Imperial Blue 180ml",
    brand: "Imperial Blue",
    category: "Whisky",
    size: "180 ml",
    purchasePrice: 125,
    price: 180,
    minimumStock: 12,
    unitsPerCase: 48,
    openingStock: 45,
  },
  {
    id: "p007",
    barcode: "8900000010007",
    sku: "WH-IB-375",
    name: "Imperial Blue 375ml",
    brand: "Imperial Blue",
    category: "Whisky",
    size: "375 ml",
    purchasePrice: 245,
    price: 350,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 32,
  },
  {
    id: "p008",
    barcode: "8900000010008",
    sku: "WH-IB-750",
    name: "Imperial Blue 750ml",
    brand: "Imperial Blue",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 460,
    price: 680,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 28,
  },
  {
    id: "p009",
    barcode: "8900000010009",
    sku: "WH-MD1-750",
    name: "McDowell's No.1 750ml",
    brand: "McDowell's",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 500,
    price: 730,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 30,
  },
  {
    id: "p010",
    barcode: "8900000010010",
    sku: "WH-RC-750",
    name: "Royal Challenge 750ml",
    brand: "Royal Challenge",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 620,
    price: 850,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 24,
  },
  {
    id: "p011",
    barcode: "8900000010011",
    sku: "WH-SIG-750",
    name: "Signature Rare Aged 750ml",
    brand: "Signature",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 780,
    price: 1100,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 18,
  },
  {
    id: "p012",
    barcode: "8900000010012",
    sku: "WH-AB-750",
    name: "Antiquity Blue 750ml",
    brand: "Antiquity",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 1100,
    price: 1550,
    minimumStock: 6,
    unitsPerCase: 12,
    openingStock: 15,
  },
  {
    id: "p013",
    barcode: "8900000010013",
    sku: "WH-OC-750",
    name: "Officer's Choice 750ml",
    brand: "Officer's Choice",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 390,
    price: 570,
    minimumStock: 12,
    unitsPerCase: 12,
    openingStock: 34,
  },
  {
    id: "p014",
    barcode: "8900000010014",
    sku: "WH-8PM-750",
    name: "8PM Whisky 750ml",
    brand: "8PM",
    category: "Whisky",
    size: "750 ml",
    purchasePrice: 430,
    price: 620,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 27,
  },

  {
    id: "p015",
    barcode: "8900000010015",
    sku: "BE-KFP-650",
    name: "Kingfisher Premium 650ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 105,
    price: 160,
    minimumStock: 24,
    unitsPerCase: 12,
    openingStock: 72,
  },
  {
    id: "p016",
    barcode: "8900000010016",
    sku: "BE-KFS-650",
    name: "Kingfisher Strong 650ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 120,
    price: 180,
    minimumStock: 24,
    unitsPerCase: 12,
    openingStock: 84,
  },
  {
    id: "p017",
    barcode: "8900000010017",
    sku: "BE-KFU-330",
    name: "Kingfisher Ultra 330ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 95,
    price: 150,
    minimumStock: 18,
    unitsPerCase: 24,
    openingStock: 48,
  },
  {
    id: "p018",
    barcode: "8900000010018",
    sku: "BE-KFUM-650",
    name: "Kingfisher Ultra Max 650ml",
    brand: "Kingfisher",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 150,
    price: 220,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 48,
  },
  {
    id: "p019",
    barcode: "8900000010019",
    sku: "BE-TS-650",
    name: "Tuborg Strong 650ml",
    brand: "Tuborg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 125,
    price: 190,
    minimumStock: 24,
    unitsPerCase: 12,
    openingStock: 78,
  },
  {
    id: "p020",
    barcode: "8900000010020",
    sku: "BE-TG-650",
    name: "Tuborg Green 650ml",
    brand: "Tuborg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 115,
    price: 175,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 60,
  },
  {
    id: "p021",
    barcode: "8900000010021",
    sku: "BE-BUD-330",
    name: "Budweiser Premium 330ml",
    brand: "Budweiser",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 110,
    price: 170,
    minimumStock: 18,
    unitsPerCase: 24,
    openingStock: 42,
  },
  {
    id: "p022",
    barcode: "8900000010022",
    sku: "BE-BM-500",
    name: "Budweiser Magnum 500ml",
    brand: "Budweiser",
    category: "Beer",
    size: "500 ml",
    purchasePrice: 135,
    price: 210,
    minimumStock: 18,
    unitsPerCase: 24,
    openingStock: 50,
  },
  {
    id: "p023",
    barcode: "8900000010023",
    sku: "BE-CE-650",
    name: "Carlsberg Elephant 650ml",
    brand: "Carlsberg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 130,
    price: 200,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 54,
  },
  {
    id: "p024",
    barcode: "8900000010024",
    sku: "BE-CS-650",
    name: "Carlsberg Smooth 650ml",
    brand: "Carlsberg",
    category: "Beer",
    size: "650 ml",
    purchasePrice: 120,
    price: 185,
    minimumStock: 18,
    unitsPerCase: 12,
    openingStock: 55,
  },
  {
    id: "p025",
    barcode: "8900000010025",
    sku: "BE-HEI-330",
    name: "Heineken 330ml",
    brand: "Heineken",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 115,
    price: 180,
    minimumStock: 12,
    unitsPerCase: 24,
    openingStock: 36,
  },
  {
    id: "p026",
    barcode: "8900000010026",
    sku: "BE-B91B-330",
    name: "Bira 91 Blonde 330ml",
    brand: "Bira 91",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 105,
    price: 165,
    minimumStock: 12,
    unitsPerCase: 24,
    openingStock: 30,
  },
  {
    id: "p027",
    barcode: "8900000010027",
    sku: "BE-B91W-330",
    name: "Bira 91 White 330ml",
    brand: "Bira 91",
    category: "Beer",
    size: "330 ml",
    purchasePrice: 115,
    price: 180,
    minimumStock: 12,
    unitsPerCase: 24,
    openingStock: 34,
  },

  {
    id: "p028",
    barcode: "8900000010028",
    sku: "RU-OM-180",
    name: "Old Monk 180ml",
    brand: "Old Monk",
    category: "Rum",
    size: "180 ml",
    purchasePrice: 130,
    price: 190,
    minimumStock: 12,
    unitsPerCase: 48,
    openingStock: 38,
  },
  {
    id: "p029",
    barcode: "8900000010029",
    sku: "RU-OM-375",
    name: "Old Monk 375ml",
    brand: "Old Monk",
    category: "Rum",
    size: "375 ml",
    purchasePrice: 260,
    price: 380,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 28,
  },
  {
    id: "p030",
    barcode: "8900000010030",
    sku: "RU-OM-750",
    name: "Old Monk 750ml",
    brand: "Old Monk",
    category: "Rum",
    size: "750 ml",
    purchasePrice: 500,
    price: 720,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 31,
  },
  {
    id: "p031",
    barcode: "8900000010031",
    sku: "RU-MCR-750",
    name: "McDowell's Celebration Rum 750ml",
    brand: "McDowell's",
    category: "Rum",
    size: "750 ml",
    purchasePrice: 430,
    price: 630,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 24,
  },
  {
    id: "p032",
    barcode: "8900000010032",
    sku: "RU-CON-750",
    name: "Contessa Rum 750ml",
    brand: "Contessa",
    category: "Rum",
    size: "750 ml",
    purchasePrice: 410,
    price: 600,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 20,
  },

  {
    id: "p033",
    barcode: "8900000010033",
    sku: "VO-MM-180",
    name: "Magic Moments 180ml",
    brand: "Magic Moments",
    category: "Vodka",
    size: "180 ml",
    purchasePrice: 140,
    price: 210,
    minimumStock: 10,
    unitsPerCase: 48,
    openingStock: 35,
  },
  {
    id: "p034",
    barcode: "8900000010034",
    sku: "VO-MM-375",
    name: "Magic Moments 375ml",
    brand: "Magic Moments",
    category: "Vodka",
    size: "375 ml",
    purchasePrice: 280,
    price: 410,
    minimumStock: 10,
    unitsPerCase: 24,
    openingStock: 28,
  },
  {
    id: "p035",
    barcode: "8900000010035",
    sku: "VO-MM-750",
    name: "Magic Moments 750ml",
    brand: "Magic Moments",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 540,
    price: 790,
    minimumStock: 10,
    unitsPerCase: 12,
    openingStock: 26,
  },
  {
    id: "p036",
    barcode: "8900000010036",
    sku: "VO-ROM-750",
    name: "Romanov 750ml",
    brand: "Romanov",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 420,
    price: 620,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 21,
  },
  {
    id: "p037",
    barcode: "8900000010037",
    sku: "VO-SMI-375",
    name: "Smirnoff 375ml",
    brand: "Smirnoff",
    category: "Vodka",
    size: "375 ml",
    purchasePrice: 420,
    price: 610,
    minimumStock: 8,
    unitsPerCase: 24,
    openingStock: 18,
  },
  {
    id: "p038",
    barcode: "8900000010038",
    sku: "VO-SMI-750",
    name: "Smirnoff 750ml",
    brand: "Smirnoff",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 820,
    price: 1180,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 22,
  },
  {
    id: "p039",
    barcode: "8900000010039",
    sku: "VO-WM-750",
    name: "White Mischief 750ml",
    brand: "White Mischief",
    category: "Vodka",
    size: "750 ml",
    purchasePrice: 390,
    price: 570,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 19,
  },

  {
    id: "p040",
    barcode: "8900000010040",
    sku: "BR-MH-750",
    name: "Mansion House 750ml",
    brand: "Mansion House",
    category: "Brandy",
    size: "750 ml",
    purchasePrice: 610,
    price: 890,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 22,
  },
  {
    id: "p041",
    barcode: "8900000010041",
    sku: "BR-MOR-750",
    name: "Morpheus Brandy 750ml",
    brand: "Morpheus",
    category: "Brandy",
    size: "750 ml",
    purchasePrice: 780,
    price: 1120,
    minimumStock: 6,
    unitsPerCase: 12,
    openingStock: 16,
  },
  {
    id: "p042",
    barcode: "8900000010042",
    sku: "BR-HB-750",
    name: "Honey Bee Brandy 750ml",
    brand: "Honey Bee",
    category: "Brandy",
    size: "750 ml",
    purchasePrice: 480,
    price: 700,
    minimumStock: 8,
    unitsPerCase: 12,
    openingStock: 18,
  },

  {
    id: "p043",
    barcode: "8900000010043",
    sku: "WI-SCS-750",
    name: "Sula Cabernet Shiraz 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 620,
    price: 900,
    minimumStock: 5,
    unitsPerCase: 6,
    openingStock: 14,
  },
  {
    id: "p044",
    barcode: "8900000010044",
    sku: "WI-SCB-750",
    name: "Sula Chenin Blanc 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 600,
    price: 870,
    minimumStock: 5,
    unitsPerCase: 6,
    openingStock: 12,
  },
  {
    id: "p045",
    barcode: "8900000010045",
    sku: "WI-SBR-750",
    name: "Sula Brut 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 780,
    price: 1150,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 10,
  },
  {
    id: "p046",
    barcode: "8900000010046",
    sku: "WI-SZR-750",
    name: "Sula Zinfandel Rosé 750ml",
    brand: "Sula",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 690,
    price: 980,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 11,
  },
  {
    id: "p047",
    barcode: "8900000010047",
    sku: "WI-FCR-750",
    name: "Fratelli Cabernet Red 750ml",
    brand: "Fratelli",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 560,
    price: 820,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 12,
  },
  {
    id: "p048",
    barcode: "8900000010048",
    sku: "WI-FCB-750",
    name: "Fratelli Chenin Blanc 750ml",
    brand: "Fratelli",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 540,
    price: 790,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 10,
  },
  {
    id: "p049",
    barcode: "8900000010049",
    sku: "WI-GZLR-750",
    name: "Grover Zampa La Réserve 750ml",
    brand: "Grover Zampa",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 760,
    price: 1100,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 9,
  },
  {
    id: "p050",
    barcode: "8900000010050",
    sku: "WI-GZAC-750",
    name: "Grover Zampa Art Collection 750ml",
    brand: "Grover Zampa",
    category: "Wine",
    size: "750 ml",
    purchasePrice: 650,
    price: 950,
    minimumStock: 4,
    unitsPerCase: 6,
    openingStock: 8,
  },
];
```

### `src/index.css`

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  background: #f4f5f7;
  color: #17181c;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 250px;
  display: flex;
  flex-direction: column;
  background: #23111b;
  color: #fff;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 21px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #8e244d;
}

.brand-name {
  font-weight: 800;
  letter-spacing: -0.3px;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #c6b5bd;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 19px 12px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 45px;
  padding: 0 13px;
  border-radius: 9px;
  color: #cdbfc5;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.nav-item.active {
  background: #8e244d;
  color: #fff;
}

.sidebar-footer {
  margin: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-footer div {
  display: flex;
  flex-direction: column;
}

.sidebar-footer strong {
  font-size: 13px;
}

.sidebar-footer span {
  color: #c6b5bd;
  font-size: 11px;
  margin-top: 2px;
}

.main-area {
  width: calc(100% - 250px);
  margin-left: 250px;
}

.topbar {
  height: 75px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e7e8eb;
}

.topbar h1 {
  margin: 0;
  font-size: 17px;
}

.topbar p {
  margin: 3px 0 0;
  color: #8a8c94;
  font-size: 12px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  background: #8e244d;
}

.user-pill > div:last-child {
  display: flex;
  flex-direction: column;
}

.user-pill strong {
  font-size: 13px;
}

.user-pill span {
  color: #8a8c94;
  font-size: 11px;
}

.page-area {
  padding: 28px;
}

.page-heading {
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-heading h2 {
  margin: 0;
  font-size: 25px;
  letter-spacing: -0.5px;
}

.page-heading p {
  margin: 5px 0 0;
  color: #787b83;
  font-size: 13px;
}

.page-actions {
  display: flex;
  gap: 9px;
}

.panel {
  background: #fff;
  border: 1px solid #e5e6e9;
  border-radius: 13px;
  padding: 20px;
  box-shadow: 0 2px 7px rgba(28, 23, 26, 0.025);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 17px;
}

.panel-header h3,
.panel h3 {
  margin: 0;
  font-size: 16px;
}

.panel-header p,
.panel > p {
  margin: 4px 0 0;
  color: #8a8c94;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.stat-card {
  position: relative;
  min-height: 145px;
  padding: 20px;
  border-radius: 13px;
  background: #fff;
  border: 1px solid #e5e6e9;
}

.stat-icon {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  margin-bottom: 17px;
  background: #f5e9ee;
  color: #8e244d;
}

.stat-label {
  color: #73767d;
  font-size: 12px;
  font-weight: 600;
}

.stat-value {
  margin-top: 3px;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.stat-note {
  margin-top: 5px;
  color: #97999f;
  font-size: 11px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
}

.simple-list {
  display: flex;
  flex-direction: column;
}

.simple-list-row {
  padding: 13px 0;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #f0f0f1;
}

.simple-list-row:last-child {
  border-bottom: 0;
}

.simple-list-row > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.simple-list-row strong {
  font-size: 13px;
}

.simple-list-row span {
  color: #8d8f96;
  font-size: 11px;
}

.align-right {
  text-align: right;
}

.stock-low {
  color: #b42318;
  font-size: 12px;
  font-weight: 700;
}

.empty-state {
  padding: 25px 5px;
  color: #8a8c94;
  font-size: 13px;
  text-align: center;
}

.large-empty-state {
  min-height: 350px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
  text-align: center;
  color: #96989e;
}

.large-empty-state h3 {
  margin-top: 10px;
  color: #33353a;
}

.large-empty-state p {
  margin: 0;
}

.demo-note {
  margin-top: 17px;
  padding: 11px 14px;
  border-radius: 8px;
  background: #fff8e6;
  border: 1px solid #f3dfac;
  color: #775d1c;
  font-size: 11px;
}

.pos-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 18px;
  align-items: start;
}

.pos-left {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.input-label {
  margin-bottom: 9px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
}

.barcode-input-row {
  display: flex;
  gap: 9px;
}

.barcode-input,
.search-input,
.settings-fields input {
  width: 100%;
  height: 45px;
  padding: 0 13px;
  border: 1px solid #dcdde0;
  border-radius: 9px;
  outline: none;
  background: #fff;
}

.barcode-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 1px;
}

.barcode-input:focus,
.search-input:focus {
  border-color: #8e244d;
  box-shadow: 0 0 0 3px rgba(142, 36, 77, 0.09);
}

.primary-button,
.secondary-button,
.danger-button {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 700;
  border: 0;
}

.primary-button {
  background: #8e244d;
  color: #fff;
}

.primary-button:hover {
  background: #761d40;
}

.secondary-button {
  background: #fff;
  border: 1px solid #dcdde0;
}

.pos-message {
  margin-top: 12px;
  padding: 9px 11px;
  border-radius: 7px;
  font-size: 12px;
}

.pos-message.info {
  background: #edf4ff;
  color: #315883;
}

.pos-message.success {
  background: #eaf8ee;
  color: #246b39;
}

.pos-message.error {
  background: #fff0ef;
  color: #a12b23;
}

.search-results {
  margin-top: 10px;
  border: 1px solid #e2e3e5;
  border-radius: 9px;
  overflow: hidden;
}

.search-result {
  width: 100%;
  padding: 11px 13px;
  border: 0;
  border-bottom: 1px solid #ededee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  text-align: left;
}

.search-result:last-child {
  border-bottom: 0;
}

.search-result:hover {
  background: #faf7f8;
}

.search-result > div,
.search-result-right {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.search-result strong {
  font-size: 12px;
}

.search-result span {
  color: #8a8c94;
  font-size: 10px;
}

.search-result-right {
  text-align: right;
}

.text-button {
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 700;
}

.danger-text {
  color: #b42318;
}

.cart-empty {
  min-height: 190px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  color: #a5a6aa;
}

.cart-empty strong {
  margin-top: 8px;
  color: #55575c;
}

.cart-empty span {
  font-size: 12px;
}

.cart-table {
  display: flex;
  flex-direction: column;
}

.cart-row {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) 120px 120px 35px;
  gap: 14px;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid #ededee;
}

.cart-row:last-child {
  border-bottom: 0;
}

.cart-product,
.cart-price {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cart-product strong {
  font-size: 13px;
}

.cart-product span,
.cart-price span {
  color: #8e9097;
  font-size: 10px;
}

.cart-price {
  text-align: right;
}

.quantity-control {
  height: 34px;
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  align-items: center;
  border: 1px solid #dedfe2;
  border-radius: 7px;
  overflow: hidden;
}

.quantity-control button {
  height: 100%;
  border: 0;
  display: grid;
  place-items: center;
  background: #f6f6f7;
}

.quantity-control strong {
  text-align: center;
  font-size: 12px;
}

.icon-button {
  width: 33px;
  height: 33px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
}

.icon-button.danger {
  color: #b42318;
}

.icon-button:hover {
  background: #f7f7f8;
}

.checkout-panel {
  position: sticky;
  top: 94px;
  padding: 21px;
  border-radius: 13px;
  background: #23111b;
  color: #fff;
}

.checkout-panel h3 {
  margin: 0;
  font-size: 18px;
}

.checkout-panel > div:first-child p {
  margin: 4px 0 0;
  color: #bbaeb4;
  font-size: 11px;
}

.bill-lines {
  margin-top: 23px;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
}

.bill-lines > div,
.grand-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bill-lines span {
  color: #bbaeb4;
  font-size: 12px;
}

.bill-lines strong {
  font-size: 13px;
}

.grand-total {
  padding: 19px 0;
}

.grand-total span {
  font-size: 13px;
}

.grand-total strong {
  font-size: 26px;
}

.payment-title {
  margin-bottom: 9px;
  color: #cdbfc5;
  font-size: 11px;
  font-weight: 700;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}

.payment-button {
  min-height: 67px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  display: grid;
  place-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #d9cfd3;
  font-size: 10px;
  font-weight: 700;
}

.payment-button.selected {
  border-color: #d85d8c;
  background: #8e244d;
  color: #fff;
}

.complete-sale {
  width: 100%;
  margin-top: 17px;
  padding: 14px;
  border: 0;
  border-radius: 9px;
  display: flex;
  justify-content: space-between;
  background: #cf477b;
  color: #fff;
  font-weight: 800;
}

.complete-sale:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.test-barcode-box {
  margin-top: 19px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
}

.test-barcode-box strong {
  font-size: 11px;
}

.test-barcode-box span {
  color: #bbaeb4;
  font-size: 10px;
}

.test-barcode-box code {
  padding: 5px 7px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.22);
  color: #f4bdd2;
}

.cart-count {
  padding: 8px 11px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fff;
  border: 1px solid #e3e4e6;
  font-size: 12px;
  font-weight: 700;
}

.table-toolbar {
  margin-bottom: 17px;
}

.table-search {
  max-width: 430px;
  height: 42px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dedfe2;
  border-radius: 8px;
}

.table-search input {
  width: 100%;
  border: 0;
  outline: 0;
}

.data-table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 11px 12px;
  text-align: left;
  background: #f7f7f8;
  color: #7c7e84;
  border-bottom: 1px solid #e4e5e7;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #eeeeef;
  font-size: 12px;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: #fcfafb;
}

.table-product {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.table-product span {
  color: #919399;
  font-size: 10px;
}

.category-badge {
  padding: 5px 8px;
  border-radius: 999px;
  background: #f2edf0;
  color: #673249;
  font-size: 10px;
  font-weight: 700;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.stock-status {
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
}

.stock-status.good {
  background: #e8f6ec;
  color: #26703b;
}

.stock-status.low {
  background: #ffeceb;
  color: #a62b23;
}

.coming-soon {
  min-height: 350px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.settings-fields {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.settings-fields label {
  display: grid;
  gap: 6px;
  color: #76787f;
  font-size: 11px;
  font-weight: 700;
}

.settings-fields input {
  color: #4f5157;
  background: #f8f8f9;
}

.danger-zone {
  border-color: #efc7c3;
}

.danger-zone p {
  margin: 9px 0 18px;
}

.danger-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #b42318;
  color: #fff;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .pos-layout {
    grid-template-columns: 1fr;
  }

  .checkout-panel {
    position: static;
  }
}

@media (max-width: 780px) {
  .sidebar {
    width: 72px;
  }

  .brand {
    padding: 16px 14px;
  }

  .brand > div:last-child,
  .nav-item span,
  .sidebar-footer div {
    display: none;
  }

  .nav-item {
    justify-content: center;
  }

  .sidebar-footer {
    justify-content: center;
  }

  .main-area {
    width: calc(100% - 72px);
    margin-left: 72px;
  }

  .topbar {
    padding: 0 16px;
  }

  .page-area {
    padding: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .cart-row {
    grid-template-columns: 1fr;
  }

  .cart-price {
    text-align: left;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}

/* =========================================================
   CHAPTER 7 - PURCHASE / RECEIVE STOCK
   ========================================================= */

.receive-heading-icon {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e2e3e5;
  font-size: 12px;
  font-weight: 700;
}

.purchase-message {
  margin-bottom: 18px;
  padding: 12px 14px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 600;
}

.purchase-message.info {
  background: #edf4ff;
  color: #315883;
}

.purchase-message.success {
  background: #eaf8ee;
  color: #246b39;
  border: 1px solid #cbe8d3;
}

.purchase-message.error {
  background: #fff0ef;
  color: #a12b23;
  border: 1px solid #f2c6c3;
}

.purchase-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;
}

.purchase-main {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.purchase-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.purchase-form-grid label,
.purchase-item-row label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #676970;
  font-size: 11px;
  font-weight: 700;
}

.purchase-form-grid input,
.purchase-item-row input {
  width: 100%;
  height: 42px;
  padding: 0 11px;
  border: 1px solid #dcdde0;
  border-radius: 8px;
  outline: none;
  background: #fff;
}

.purchase-form-grid input:focus,
.purchase-item-row input:focus {
  border-color: #8e244d;
  box-shadow: 0 0 0 3px rgba(142, 36, 77, 0.08);
}

.input-with-icon,
.price-input {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-left: 10px;
  border: 1px solid #dcdde0;
  border-radius: 8px;
  background: #fff;
}

.input-with-icon input,
.price-input input {
  border: 0;
  box-shadow: none;
  padding-left: 0;
}

.input-with-icon input:focus,
.price-input input:focus {
  box-shadow: none;
}

.purchase-search {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #dcdde0;
  border-radius: 8px;
}

.purchase-search:focus-within {
  border-color: #8e244d;
  box-shadow: 0 0 0 3px rgba(142, 36, 77, 0.08);
}

.purchase-search input {
  width: 100%;
  border: 0;
  outline: 0;
}

.purchase-search-results {
  margin-top: 9px;
  overflow: hidden;
  border: 1px solid #e2e3e5;
  border-radius: 9px;
}

.purchase-search-result {
  width: 100%;
  padding: 12px 13px;
  border: 0;
  border-bottom: 1px solid #eeeeef;
  display: grid;
  grid-template-columns: 1fr 140px 25px;
  gap: 10px;
  align-items: center;
  background: #fff;
  text-align: left;
}

.purchase-search-result:last-child {
  border-bottom: 0;
}

.purchase-search-result:hover {
  background: #fbf8f9;
}

.purchase-search-result > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.purchase-search-result strong {
  font-size: 12px;
}

.purchase-search-result span {
  color: #8d8f96;
  font-size: 10px;
}

.purchase-search-right {
  text-align: right;
}

.purchase-empty {
  min-height: 180px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  color: #9a9ca2;
}

.purchase-empty strong {
  margin-top: 8px;
  color: #55575c;
}

.purchase-empty span {
  font-size: 11px;
}

.purchase-items {
  display: flex;
  flex-direction: column;
}

.purchase-item-row {
  padding: 14px 0;
  display: grid;
  grid-template-columns:
    minmax(180px, 1fr)
    110px
    140px
    115px
    36px;
  gap: 12px;
  align-items: end;
  border-bottom: 1px solid #ededee;
}

.purchase-item-row:last-child {
  border-bottom: 0;
}

.purchase-product-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.purchase-product-info strong {
  font-size: 13px;
}

.purchase-product-info span {
  color: #8f9197;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
}

.purchase-product-info small {
  color: #476a52;
  font-size: 10px;
  font-weight: 700;
}

.purchase-line-total {
  min-height: 42px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: right;
}

.purchase-line-total span {
  color: #919399;
  font-size: 9px;
}

.purchase-line-total strong {
  margin-top: 2px;
  font-size: 13px;
}

.purchase-summary {
  position: sticky;
  top: 94px;
  padding: 21px;
  border-radius: 13px;
  background: #23111b;
  color: #fff;
}

.purchase-summary-title h3 {
  margin: 0;
  font-size: 17px;
}

.purchase-summary-title span {
  display: block;
  margin-top: 4px;
  color: #bbaeb4;
  font-size: 10px;
}

.purchase-summary-lines {
  margin-top: 20px;
  padding: 15px 0;
  border-top: 1px solid rgba(255,255,255,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.purchase-summary-lines > div {
  display: flex;
  justify-content: space-between;
}

.purchase-summary-lines span {
  color: #c4b6bc;
  font-size: 11px;
}

.purchase-summary-lines strong {
  font-size: 12px;
}

.purchase-grand-total {
  padding: 18px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.purchase-grand-total span {
  font-size: 12px;
}

.purchase-grand-total strong {
  font-size: 23px;
}

.receive-stock-button {
  width: 100%;
  min-height: 49px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #cf477b;
  color: #fff;
  font-weight: 800;
}

.receive-stock-button:hover {
  background: #b83868;
}

.receive-stock-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.purchase-help {
  margin-top: 18px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
}

.purchase-help strong {
  font-size: 10px;
}

.purchase-help span {
  color: #bbaeb4;
  font-size: 10px;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .purchase-layout {
    grid-template-columns: 1fr;
  }

  .purchase-summary {
    position: static;
  }

  .purchase-item-row {
    grid-template-columns: 1fr 100px 130px;
  }

  .purchase-line-total {
    text-align: left;
  }
}

@media (max-width: 700px) {
  .purchase-form-grid {
    grid-template-columns: 1fr;
  }

  .purchase-item-row {
    grid-template-columns: 1fr;
  }

  .purchase-search-result {
    grid-template-columns: 1fr;
  }

  .purchase-search-right {
    text-align: left;
  }
}

/* =========================================================
   CHAPTER 7.3 - CASE / CARTON PURCHASES
   ========================================================= */

.case-purchase-items {
  gap: 14px;
}

.case-purchase-row {
  padding: 16px;
  border: 1px solid #e6e7e9;
  border-radius: 10px;
  background: #fcfcfd;
}

.case-product-header {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: flex-start;
  margin-bottom: 15px;
}

.case-entry-grid {
  display: grid;
  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );
  gap: 12px;
}

.case-entry-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #676970;
  font-size: 10px;
  font-weight: 700;
}

.case-entry-grid input {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #dcdde0;
  border-radius: 7px;
  outline: none;
  background: #fff;
}

.case-entry-grid input:focus {
  border-color: #8e244d;
  box-shadow:
    0 0 0 3px
    rgba(142, 36, 77, 0.08);
}

.case-calculation {
  margin-top: 13px;
  padding: 11px 12px;
  border-radius: 8px;
  display: grid;
  grid-template-columns:
    1fr 1fr 1fr;
  gap: 15px;
  background: #f4f1f2;
}

.case-calculation > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.case-calculation span {
  color: #8a8c94;
  font-size: 9px;
  font-weight: 700;
}

.case-calculation strong {
  font-size: 12px;
}

.purchase-history-panel {
  margin-top: 18px;
}

@media (max-width: 900px) {
  .case-entry-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .case-entry-grid,
  .case-calculation {
    grid-template-columns:
      1fr;
  }
}
```

### `src/main.jsx`

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ShopProvider } from "./context/ShopContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ShopProvider>
        <App />
      </ShopProvider>
    </BrowserRouter>
  </StrictMode>
);
```

### `src/pages/Dashboard.jsx`

```javascript
import {
  IndianRupee,
  PackageCheck,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const { products, sales, getStock } = useShop();

  const today = new Date().toDateString();

  const todaysSales = sales.filter(
    (sale) => new Date(sale.createdAt).toDateString() === today
  );

  const revenue = todaysSales.reduce(
    (total, sale) => total + sale.grandTotal,
    0
  );

  const averageBill = todaysSales.length
    ? revenue / todaysSales.length
    : 0;

  const lowStockProducts = products.filter(
    (product) => getStock(product.id) <= product.minimumStock
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + getStock(product.id) * product.purchasePrice,
    0
  );

  const cards = [
    {
      label: "Today's Sales",
      value: money.format(revenue),
      icon: IndianRupee,
      note: "Revenue today",
    },
    {
      label: "Bills Today",
      value: todaysSales.length,
      icon: ReceiptText,
      note: `Avg ${money.format(averageBill)}`,
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: TriangleAlert,
      note: "Needs attention",
    },
    {
      label: "Inventory Value",
      value: money.format(inventoryValue),
      icon: PackageCheck,
      note: "At purchase cost",
    },
  ];

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Store overview and today's performance</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="stat-card" key={card.label}>
              <div className="stat-icon">
                <Icon size={21} />
              </div>

              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-note">{card.note}</div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Sales</h3>
              <p>Latest completed bills</p>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="empty-state">
              No sales yet. Open POS and complete your first bill.
            </div>
          ) : (
            <div className="simple-list">
              {sales.slice(0, 7).map((sale) => (
                <div className="simple-list-row" key={sale.id}>
                  <div>
                    <strong>{sale.invoiceNumber}</strong>
                    <span>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="align-right">
                    <strong>{money.format(sale.grandTotal)}</strong>
                    <span>{sale.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Low Stock Products</h3>
              <p>Products at or below minimum level</p>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="empty-state">No low-stock products.</div>
          ) : (
            <div className="simple-list">
              {lowStockProducts.slice(0, 8).map((product) => (
                <div className="simple-list-row" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>

                  <div className="stock-low">
                    {getStock(product.id)} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="demo-note">
        Development mode: product prices and barcodes are dummy test data.
      </div>
    </div>
  );
}
```

### `src/pages/Inventory.jsx`

```javascript
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Inventory() {
  const { products, getStock } = useShop();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return products.filter((product) => {
      if (!value) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.barcode.includes(value)
      );
    });
  }, [products, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Inventory</h2>
          <p>Current local stock levels</p>
        </div>

        <div className="page-actions">
          <button className="secondary-button">+ Receive Stock</button>
          <button className="primary-button">+ New Product</button>
        </div>
      </div>

      <div className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search inventory..."
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>Current Stock</th>
                <th>Minimum</th>
                <th>Status</th>
                <th>Inventory Value</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const stock = getStock(product.id);
                const low = stock <= product.minimumStock;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <strong>{product.name}</strong>
                        <span>{product.size}</span>
                      </div>
                    </td>

                    <td>{product.category}</td>
                    <td className="mono">{product.barcode}</td>
                    <td>
                      <strong>{stock}</strong>
                    </td>
                    <td>{product.minimumStock}</td>
                    <td>
                      <span
                        className={
                          low
                            ? "stock-status low"
                            : "stock-status good"
                        }
                      >
                        {low ? "LOW STOCK" : "IN STOCK"}
                      </span>
                    </td>
                    <td>
                      {money.format(stock * product.purchasePrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

### `src/pages/POS.jsx`

```javascript
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  ScanBarcode,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function POS() {
  const { products, getStock, completeSale } = useShop();

  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [message, setMessage] = useState(
    "Ready to scan. Try barcode 8900000010016"
  );
  const [messageType, setMessageType] = useState("info");

  const barcodeRef = useRef(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(value) ||
          product.brand.toLowerCase().includes(value) ||
          product.sku.toLowerCase().includes(value) ||
          product.barcode.includes(value)
      )
      .slice(0, 8);
  }, [search, products]);

  function currentCartQuantity(productId) {
    return (
      cart.find((item) => item.product.id === productId)?.quantity || 0
    );
  }

  function addProduct(product) {
    const available = getStock(product.id);
    const alreadyInCart = currentCartQuantity(product.id);

    if (available <= 0) {
      setMessage(`${product.name} is OUT OF STOCK.`);
      setMessageType("error");
      return;
    }

    if (alreadyInCart + 1 > available) {
      setMessage(`Only ${available} unit(s) of ${product.name} available.`);
      setMessageType("error");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { product, quantity: 1 }];
    });

    setMessage(`${product.name} added to cart.`);
    setMessageType("success");
  }

  function handleBarcodeSubmit(event) {
    event.preventDefault();

    const scannedBarcode = barcode.trim();

    if (!scannedBarcode) {
      return;
    }

    const product = products.find(
      (item) => item.barcode === scannedBarcode
    );

    if (!product) {
      setMessage(`PRODUCT NOT FOUND: ${scannedBarcode}`);
      setMessageType("error");
    } else {
      addProduct(product);
    }

    setBarcode("");

    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }

  function changeQuantity(productId, delta) {
    const item = cart.find(
      (cartItem) => cartItem.product.id === productId
    );

    if (!item) {
      return;
    }

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const available = getStock(productId);

    if (newQuantity > available) {
      setMessage(`Only ${available} unit(s) available.`);
      setMessageType("error");
      return;
    }

    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.product.id === productId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  }

  function removeItem(productId) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product.id !== productId
      )
    );
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function handleCompleteSale() {
    const result = completeSale(cart, paymentMethod);

    if (!result.ok) {
      setMessage(result.message);
      setMessageType("error");
      return;
    }

    setMessage(
      `${result.sale.invoiceNumber} completed successfully for ${money.format(
        result.sale.grandTotal
      )}.`
    );
    setMessageType("success");
    setCart([]);
    setSearch("");

    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>POS Billing</h2>
          <p>Scan barcode or search a product manually</p>
        </div>

        <div className="cart-count">
          <ShoppingCart size={18} />
          {itemCount} item(s)
        </div>
      </div>

      <div className="pos-layout">
        <section className="pos-left">
          <div className="panel barcode-panel">
            <form onSubmit={handleBarcodeSubmit}>
              <label className="input-label">
                <ScanBarcode size={18} />
                Scan Barcode
              </label>

              <div className="barcode-input-row">
                <input
                  ref={barcodeRef}
                  className="barcode-input"
                  value={barcode}
                  onChange={(event) =>
                    setBarcode(event.target.value)
                  }
                  placeholder="Scan barcode and press Enter"
                  autoComplete="off"
                />

                <button className="primary-button" type="submit">
                  Add
                </button>
              </div>
            </form>

            <div className={`pos-message ${messageType}`}>
              {message}
            </div>
          </div>

          <div className="panel">
            <label className="input-label">
              <Search size={18} />
              Manual Product Search
            </label>

            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, brand, SKU or barcode"
            />

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((product) => (
                  <button
                    type="button"
                    className="search-result"
                    key={product.id}
                    onClick={() => addProduct(product)}
                  >
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        {product.barcode} · {product.sku}
                      </span>
                    </div>

                    <div className="search-result-right">
                      <strong>{money.format(product.price)}</strong>
                      <span>Stock: {getStock(product.id)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Current Cart</h3>
                <p>Products added to this bill</p>
              </div>

              {cart.length > 0 && (
                <button
                  className="text-button danger-text"
                  onClick={() => setCart([])}
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={42} />
                <strong>Cart is empty</strong>
                <span>Scan a barcode to begin billing.</span>
              </div>
            ) : (
              <div className="cart-table">
                {cart.map((item) => (
                  <div className="cart-row" key={item.product.id}>
                    <div className="cart-product">
                      <strong>{item.product.name}</strong>
                      <span>
                        {item.product.barcode} · Stock{" "}
                        {getStock(item.product.id)}
                      </span>
                    </div>

                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, -1)
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, 1)
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="cart-price">
                      <span>{money.format(item.product.price)} each</span>
                      <strong>
                        {money.format(
                          item.product.price * item.quantity
                        )}
                      </strong>
                    </div>

                    <button
                      className="icon-button danger"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="checkout-panel">
          <div>
            <h3>Bill Summary</h3>
            <p>{itemCount} item(s)</p>
          </div>

          <div className="bill-lines">
            <div>
              <span>Subtotal</span>
              <strong>{money.format(subtotal)}</strong>
            </div>

            <div>
              <span>Discount</span>
              <strong>{money.format(0)}</strong>
            </div>
          </div>

          <div className="grand-total">
            <span>Grand Total</span>
            <strong>{money.format(subtotal)}</strong>
          </div>

          <div className="payment-title">Payment Method</div>

          <div className="payment-options">
            <button
              className={
                paymentMethod === "CASH"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CASH")}
            >
              <Banknote size={21} />
              CASH
            </button>

            <button
              className={
                paymentMethod === "UPI"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("UPI")}
            >
              <Smartphone size={21} />
              UPI
            </button>

            <button
              className={
                paymentMethod === "CARD"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CARD")}
            >
              <CreditCard size={21} />
              CARD
            </button>
          </div>

          <button
            className="complete-sale"
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
          >
            Complete Sale
            <span>{money.format(subtotal)}</span>
          </button>

          <div className="test-barcode-box">
            <strong>Test Scanner</strong>
            <span>Try typing:</span>
            <code>8900000010016</code>
            <span>Then press Enter.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
```

### `src/pages/Placeholder.jsx`

```javascript
export default function Placeholder({ title, description }) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="panel coming-soon">
        <h3>{title}</h3>
        <p>
          This module is reserved for the next development chapters.
        </p>
      </div>
    </div>
  );
}
```

### `src/pages/Products.jsx`

```javascript
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Products() {
  const { products, getStock } = useShop();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.category.toLowerCase().includes(value) ||
        product.barcode.includes(value) ||
        product.sku.toLowerCase().includes(value)
    );
  }, [products, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Product Master</h2>
          <p>{products.length} development products loaded</p>
        </div>
      </div>

      <div className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, barcode, SKU or category"
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Selling Price</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="table-product">
                      <strong>{product.name}</strong>
                      <span>{product.brand}</span>
                    </div>
                  </td>

                  <td className="mono">{product.barcode}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span className="category-badge">
                      {product.category}
                    </span>
                  </td>
                  <td>{getStock(product.id)}</td>
                  <td>{money.format(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="demo-note">
        Barcodes and prices are dummy development values and are not official
        product data.
      </div>
    </div>
  );
}
```

### `src/pages/Purchases.jsx`

```javascript
import { useMemo, useState } from "react";
import {
  CalendarDays,
  IndianRupee,
  PackagePlus,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";

import { useShop } from "../context/ShopContext";

const money =
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export default function Purchases() {
  const {
    products,
    purchases,
    getStock,
    receiveStock,
  } = useShop();

  const [supplierName, setSupplierName] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [invoiceDate, setInvoiceDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [notes, setNotes] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [items, setItems] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [
    messageType,
    setMessageType,
  ] = useState("info");

  const searchResults =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return [];
      }

      return products
        .filter(
          (product) =>
            product.name
              .toLowerCase()
              .includes(value) ||
            product.brand
              .toLowerCase()
              .includes(value) ||
            product.sku
              .toLowerCase()
              .includes(value) ||
            product.barcode.includes(value)
        )
        .slice(0, 8);
    }, [search, products]);

  function calculateQuantity(item) {
    const cases =
      Number(item.caseCount) || 0;

    const unitsPerCase =
      Number(item.unitsPerCase) || 0;

    const loose =
      Number(item.looseBottles) || 0;

    return (
      cases * unitsPerCase +
      loose
    );
  }

  function addProduct(product) {
    const alreadyAdded =
      items.some(
        (item) =>
          item.productId === product.id
      );

    if (alreadyAdded) {
      setMessage(
        `${product.name} is already added.`
      );

      setMessageType("error");
      return;
    }

    setItems(
      (currentItems) => [
        ...currentItems,
        {
          productId: product.id,
          productName:
            product.name,
          barcode:
            product.barcode,
          currentStock:
            getStock(product.id),

          caseCount: 1,

          unitsPerCase:
            product.unitsPerCase || 1,

          looseBottles: 0,

          purchasePrice:
            product.purchasePrice,
        },
      ]
    );

    setSearch("");

    setMessage(
      `${product.name} added.`
    );

    setMessageType("success");
  }

  function updateItem(
    productId,
    field,
    value
  ) {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.productId ===
            productId
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        )
    );
  }

  function removeItem(productId) {
    setItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.productId !==
            productId
        )
    );
  }

  const totalUnits =
    items.reduce(
      (total, item) =>
        total +
        calculateQuantity(item),
      0
    );

  const purchaseTotal =
    items.reduce(
      (total, item) => {
        const quantity =
          calculateQuantity(item);

        const price =
          Number(
            item.purchasePrice
          ) || 0;

        return (
          total +
          quantity * price
        );
      },
      0
    );

  function clearForm() {
    setSupplierName("");
    setInvoiceNumber("");

    setInvoiceDate(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

    setNotes("");
    setSearch("");
    setItems([]);
  }

  function handleReceiveStock() {
    const formattedItems =
      items.map((item) => ({
        productId:
          item.productId,

        caseCount:
          Number(item.caseCount) ||
          0,

        unitsPerCase:
          Number(
            item.unitsPerCase
          ) || 1,

        looseBottles:
          Number(
            item.looseBottles
          ) || 0,

        quantity:
          calculateQuantity(item),

        purchasePrice:
          Number(
            item.purchasePrice
          ),
      }));

    const result =
      receiveStock({
        supplierName,
        invoiceNumber,
        invoiceDate,
        items:
          formattedItems,
        notes,
      });

    if (!result.ok) {
      setMessage(
        result.message
      );

      setMessageType(
        "error"
      );

      return;
    }

    setMessage(
      `${result.purchase.purchaseNumber} received successfully. ` +
      `${result.purchase.totalUnits} bottle(s) added to inventory.`
    );

    setMessageType(
      "success"
    );

    clearForm();
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>
            Receive Stock
          </h2>

          <p>
            Supplier purchases,
            cases and loose bottles
          </p>
        </div>

        <div className="receive-heading-icon">
          <Truck size={20} />
          New Purchase
        </div>
      </div>

      {message && (
        <div
          className={`purchase-message ${messageType}`}
        >
          {message}
        </div>
      )}

      <div className="purchase-layout">
        <div className="purchase-main">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  Supplier Information
                </h3>

                <p>
                  Enter supplier invoice
                  details
                </p>
              </div>
            </div>

            <div className="purchase-form-grid">
              <label>
                Supplier Name

                <input
                  value={
                    supplierName
                  }
                  onChange={(
                    event
                  ) =>
                    setSupplierName(
                      event.target
                        .value
                    )
                  }
                  placeholder="ABC Distributors"
                />
              </label>

              <label>
                Supplier Invoice

                <input
                  value={
                    invoiceNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setInvoiceNumber(
                      event.target
                        .value
                    )
                  }
                  placeholder="ABC-45822"
                />
              </label>

              <label>
                Invoice Date

                <div className="input-with-icon">
                  <CalendarDays
                    size={17}
                  />

                  <input
                    type="date"
                    value={
                      invoiceDate
                    }
                    onChange={(
                      event
                    ) =>
                      setInvoiceDate(
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              </label>

              <label>
                Notes

                <input
                  value={notes}
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional notes"
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  Add Products
                </h3>

                <p>
                  Search by product,
                  barcode or SKU
                </p>
              </div>
            </div>

            <div className="purchase-search">
              <Search size={18} />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search product..."
              />
            </div>

            {searchResults.length >
              0 && (
              <div className="purchase-search-results">
                {searchResults.map(
                  (product) => (
                    <button
                      key={
                        product.id
                      }
                      type="button"
                      className="purchase-search-result"
                      onClick={() =>
                        addProduct(
                          product
                        )
                      }
                    >
                      <div>
                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          {
                            product.barcode
                          }{" "}
                          ·{" "}
                          {
                            product.sku
                          }
                        </span>
                      </div>

                      <div className="purchase-search-right">
                        <strong>
                          {money.format(
                            product.purchasePrice
                          )}
                        </strong>

                        <span>
                          Stock:{" "}
                          {getStock(
                            product.id
                          )}
                        </span>
                      </div>

                      <Plus
                        size={18}
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  Purchase Items
                </h3>

                <p>
                  {items.length}{" "}
                  product(s)
                </p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="purchase-empty">
                <PackagePlus
                  size={42}
                />

                <strong>
                  No products added
                </strong>

                <span>
                  Search and add an
                  existing product.
                </span>
              </div>
            ) : (
              <div className="purchase-items case-purchase-items">
                {items.map(
                  (item) => {
                    const quantity =
                      calculateQuantity(
                        item
                      );

                    return (
                      <div
                        key={
                          item.productId
                        }
                        className="case-purchase-row"
                      >
                        <div className="case-product-header">
                          <div className="purchase-product-info">
                            <strong>
                              {
                                item.productName
                              }
                            </strong>

                            <span>
                              {
                                item.barcode
                              }
                            </span>

                            <small>
                              Current Stock:{" "}
                              {getStock(
                                item.productId
                              )}
                            </small>
                          </div>

                          <button
                            type="button"
                            className="icon-button danger"
                            onClick={() =>
                              removeItem(
                                item.productId
                              )
                            }
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        </div>

                        <div className="case-entry-grid">
                          <label>
                            Cases

                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                item.caseCount
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.productId,
                                  "caseCount",
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </label>

                          <label>
                            Bottles / Case

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={
                                item.unitsPerCase
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.productId,
                                  "unitsPerCase",
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </label>

                          <label>
                            Loose Bottles

                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                item.looseBottles
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.productId,
                                  "looseBottles",
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </label>

                          <label>
                            Purchase Price
                            / Bottle

                            <div className="price-input">
                              <IndianRupee
                                size={
                                  15
                                }
                              />

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.purchasePrice
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    item.productId,
                                    "purchasePrice",
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />
                            </div>
                          </label>
                        </div>

                        <div className="case-calculation">
                          <div>
                            <span>
                              Calculation
                            </span>

                            <strong>
                              {Number(
                                item.caseCount
                              ) ||
                                0}{" "}
                              ×{" "}
                              {Number(
                                item.unitsPerCase
                              ) ||
                                0}{" "}
                              +{" "}
                              {Number(
                                item.looseBottles
                              ) ||
                                0}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Total
                              Received
                            </span>

                            <strong>
                              {quantity}{" "}
                              bottles
                            </strong>
                          </div>

                          <div>
                            <span>
                              Line Total
                            </span>

                            <strong>
                              {money.format(
                                quantity *
                                  (Number(
                                    item.purchasePrice
                                  ) ||
                                    0)
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="purchase-summary">
          <div className="purchase-summary-title">
            <h3>
              Purchase Summary
            </h3>

            <span>
              {items.length} product(s)
            </span>
          </div>

          <div className="purchase-summary-lines">
            <div>
              <span>
                Total Products
              </span>

              <strong>
                {items.length}
              </strong>
            </div>

            <div>
              <span>
                Total Bottles
              </span>

              <strong>
                {totalUnits}
              </strong>
            </div>
          </div>

          <div className="purchase-grand-total">
            <span>
              Total Purchase
            </span>

            <strong>
              {money.format(
                purchaseTotal
              )}
            </strong>
          </div>

          <button
            className="receive-stock-button"
            onClick={
              handleReceiveStock
            }
            disabled={
              items.length === 0 ||
              totalUnits === 0
            }
          >
            <PackagePlus
              size={19}
            />

            Receive Stock
          </button>

          <div className="purchase-help">
            <strong>
              Inventory Rule
            </strong>

            <span>
              Cases are converted
              into individual
              sellable bottles
              before inventory is
              updated.
            </span>
          </div>
        </aside>
      </div>

      <section className="panel purchase-history-panel">
        <div className="panel-header">
          <div>
            <h3>
              Purchase History
            </h3>

            <p>
              Previously received
              supplier purchases
            </p>
          </div>
        </div>

        {purchases.length === 0 ? (
          <div className="empty-state">
            No purchases recorded.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    Purchase
                  </th>
                  <th>
                    Supplier
                  </th>
                  <th>
                    Supplier Invoice
                  </th>
                  <th>
                    Invoice Date
                  </th>
                  <th>
                    Products
                  </th>
                  <th>
                    Bottles
                  </th>
                  <th>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchases.map(
                  (purchase) => (
                    <tr
                      key={
                        purchase.id
                      }
                    >
                      <td>
                        <strong>
                          {
                            purchase.purchaseNumber
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          purchase.supplierName
                        }
                      </td>

                      <td>
                        {
                          purchase.invoiceNumber
                        }
                      </td>

                      <td>
                        {
                          purchase.invoiceDate
                        }
                      </td>

                      <td>
                        {
                          purchase.items
                            .length
                        }
                      </td>

                      <td>
                        {purchase.totalUnits ??
                          purchase.items.reduce(
                            (
                              total,
                              item
                            ) =>
                              total +
                              item.quantity,
                            0
                          )}
                      </td>

                      <td>
                        <strong>
                          {money.format(
                            purchase.total
                          )}
                        </strong>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
```

### `src/pages/Sales.jsx`

```javascript
import { ReceiptText } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Sales() {
  const { sales } = useShop();

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Sales History</h2>
          <p>Completed local transactions</p>
        </div>
      </div>

      <div className="panel">
        {sales.length === 0 ? (
          <div className="large-empty-state">
            <ReceiptText size={48} />
            <h3>No sales yet</h3>
            <p>Complete a transaction from POS Billing.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong>{sale.invoiceNumber}</strong>
                    </td>

                    <td>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {sale.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}
                    </td>

                    <td>
                      <span className="category-badge">
                        {sale.paymentMethod}
                      </span>
                    </td>

                    <td>
                      <strong>{money.format(sale.grandTotal)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

### `src/pages/Settings.jsx`

```javascript
import { RotateCcw } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function Settings() {
  const { resetDemo } = useShop();

  function handleReset() {
    const confirmed = window.confirm(
      "Reset inventory and delete all local demo sales?"
    );

    if (confirmed) {
      resetDemo();
      window.alert("Demo data has been reset.");
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Settings</h2>
          <p>Prototype application settings</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel">
          <h3>Store Information</h3>

          <div className="settings-fields">
            <label>
              Store Name
              <input value="Demo Wine Shop" readOnly />
            </label>

            <label>
              Currency
              <input value="INR (₹)" readOnly />
            </label>

            <label>
              Data Mode
              <input value="Browser LocalStorage" readOnly />
            </label>
          </div>
        </section>

        <section className="panel danger-zone">
          <h3>Demo Data</h3>
          <p>
            Reset all inventory quantities back to opening stock and remove
            local sales.
          </p>

          <button className="danger-button" onClick={handleReset}>
            <RotateCcw size={18} />
            Reset Demo Data
          </button>
        </section>
      </div>
    </div>
  );
}
```

### `vite.config.js`

```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

