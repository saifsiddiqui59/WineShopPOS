#!/usr/bin/env python3
"""One-time CC0 model packshot atlas uploader for a draft WineShopPOS feature branch.

Only runs under the existing isolated Playwright preview workflow. Does not touch
main, production assets, authentication, Azure resources or customer data.
"""
import base64
import hashlib
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

from PIL import Image

BRANCH = "feat/login-webgl-bottle-vortex-20261027"
REPO = "saifsiddiqui59/WineShopPOS"
TARGET = "public/login-brands/packshots/atlas.webp"
INPUT = Path("artifacts/login-orbit/packshots")
OUTPUT = Path("/tmp/wsp-login-atlas.webp")

def api(method, endpoint, data=None):
    token = os.environ["GITHUB_TOKEN"]
    req = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/{endpoint}",
        data=(json.dumps(data).encode() if data is not None else None),
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
            "User-Agent": "WineShopPOS-DEV-CC0-Atlas",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)

def main():
    if (os.environ.get("GITHUB_HEAD_REF") != BRANCH or
        os.environ.get("GITHUB_REPOSITORY") != REPO or
        os.environ.get("GITHUB_EVENT_NAME") != "pull_request"):
        raise SystemExit("Refusing atlas write outside fixed in-repo draft DEV branch.")
    try:
        current = api("GET", f"contents/{TARGET}?ref={BRANCH}")
    except urllib.error.HTTPError as error:
        if error.code != 404:
            raise
        current = None
    if current:
        print("CC0 packshot atlas already vendored; no GitHub changes.")
        return
    atlas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    for index in range(7):
        path = INPUT / f"packshot-{index}.webp"
        if not path.is_file():
            raise ValueError(f"Missing verified CC0 PBR packshot {index}")
        source = Image.open(path).convert("RGBA")
        if source.size != (384, 768):
            raise ValueError(f"Unexpected packshot dimensions for {index}: {source.size}")
        if source.getchannel("A").getbbox() is None:
            raise ValueError(f"Empty alpha / missing product in packshot {index}")
        source = source.resize((256, 512), Image.Resampling.LANCZOS)
        atlas.alpha_composite(source, ((index % 4) * 256, (index // 4) * 512))
    atlas.save(OUTPUT, "WEBP", quality=80, method=6, exact=True)
    blob = OUTPUT.read_bytes()
    if len(blob) > 300_000:
        raise ValueError("Packshot atlas exceeds 300 KB limit")
    digest = hashlib.sha256(blob).hexdigest()
    result = api("PUT", f"contents/{TARGET}", {
        "message": "assets(login): vendor seven licensed PBR packshots as 1K atlas",
        "content": base64.b64encode(blob).decode("ascii"),
        "branch": BRANCH,
    })
    print(f"DEV-only atlas published: {TARGET}, {len(blob)} bytes SHA256={digest}")
    print("GitHub commit " + result["commit"]["sha"])
if __name__ == "__main__":
    main()
