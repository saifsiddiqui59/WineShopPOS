# V4 Windows App Setup

Source branch: `V3`
Target branch: `V4`
Initial V4 base commit: `ae18a9a5b5f248ccdb74a0a111facf0bd6f49415`

The V4 branch is created directly from the latest `origin/V3` commit. No V3 file is edited by this bootstrap.

## Preview launcher

Current isolated V4 preview URL embedded in the setup:

`https://wspv4d66ca1d443.z29.web.core.windows.net/`

Run `V4_Windows_App_Setup.cmd` once on a Windows shop/test PC.

The setup creates Desktop and Start Menu shortcuts named **WineShopPOS V4 Preview**. The shortcuts start Microsoft Edge with `--app=<preview-url>`, so WineShopPOS opens in a standalone app-style window without normal browser tabs/address bar.

The setup does not require administrator rights and does not change browser enterprise policy.

Use `V4_Windows_App_Remove.cmd` to remove the shortcuts.

> V4 uses its own isolated Azure Static Website preview: `https://wspv4d66ca1d443.z29.web.core.windows.net/`. V3 preview and production are not overwritten by this deployment.
