#!/usr/bin/env python3
"""Vendor ONLY verified CC0 login GLBs and 1K Poly Haven glTF. Branch-only tool.

Model bytes are downloaded once on CI, checksum logged, and committed to the PR.
Production never contacts asset providers. Fails closed if input files are invalid.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import urllib.request
import zipfile

ROOT = Path("public/login-brands/models")
ROOT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "WineShopPOS-CC0-Model-Vendor/1.0 (github.com/saifsiddiqui59/WineShopPOS)"}
LIMIT = 35 * 1024 * 1024

def get(url, limit=LIMIT):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as response:
        if response.status != 200:
            raise RuntimeError("HTTP " + str(response.status) + " from " + url)
        body = response.read(limit + 1)
    if not body or len(body) > limit:
        raise RuntimeError("Unexpected file size from " + url)
    return body

def as_glb(name, url, kind):
    content = get(url, 8 * 1024 * 1024)
    if not content.startswith(b"glTF") or len(content) < 24:
        raise ValueError("Not a GLB file: " + name)
    path = ROOT / (name + ".glb")
    path.write_bytes(content)
    print(name, len(content), hashlib.sha256(content).hexdigest())
    return {"name": name, "kind": kind, "path": "/" + path.relative_to(Path("public")).as_posix()}

def file_urls(node, key=""):
    if isinstance(node, dict):
        if isinstance(node.get("url"), str):
            yield key, node["url"], node
        for child_key, child in node.items():
            if child_key != "url":
                yield from file_urls(child, child_key)
    elif isinstance(node, list):
        for i, child in enumerate(node):
            yield from file_urls(child, str(i))

def valid_filename(name):
    pure = Path(name)
    if pure.is_absolute() or ".." in pure.parts or name.startswith("/"):
        raise ValueError("Unsafe model texture path")
    return pure

def poly_haven_wine():
    data = json.loads(get("https://api.polyhaven.com/files/wine_bottles_01", 4 * 1024 * 1024))
    if "gltf" not in data:
        raise ValueError("Poly Haven model has no glTF files; available=" + repr(list(data)))
    by_format = data["gltf"]
    one_k = by_format.get("1k", {}) if isinstance(by_format, dict) else {}
    possible = list(file_urls(one_k))
    model_files = [(key, url, meta) for key, url, meta in possible
                   if url.split("?")[0].lower().endswith((".gltf", ".zip", ".glb"))]
    if not model_files:
        raise ValueError("Poly Haven 1K glTF URL absent: " + repr(possible)[:1500])
    model_files.sort(key=lambda row: (not row[1].lower().endswith(".zip"), row[1]))
    _, url, meta = model_files[0]
    target = ROOT / "wine-bottles-01"
    target.mkdir(exist_ok=True)
    blob = get(url)
    if url.lower().endswith(".zip"):
        archive = target / "download.zip"
        archive.write_bytes(blob)
        with zipfile.ZipFile(archive) as z:
            files = z.infolist()
            if len(files) > 150 or sum(item.file_size for item in files) > 60 * 1024 * 1024:
                raise ValueError("Poly Haven archive exceeds asset budget")
            for item in files:
                if item.is_dir():
                    continue
                relative = valid_filename(item.filename)
                dest = target / relative
                dest.parent.mkdir(parents=True, exist_ok=True)
                with z.open(item) as src, dest.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
        archive.unlink()
    else:
        path = target / url.split("/")[-1].split("?")[0]
        path.write_bytes(blob)
        # Poly Haven API exposes referenced texture dependencies in "include".
        deps = meta.get("include", {})
        for name, dep_url, _ in file_urls(deps):
            clean_name = name if "." in name else dep_url.split("/")[-1].split("?")[0]
            relative = valid_filename(clean_name)
            dest = target / relative
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(get(dep_url, 8 * 1024 * 1024))
    gltf_paths = list(target.rglob("*.gltf")) + list(target.rglob("*.glb"))
    if not gltf_paths:
        raise RuntimeError("No Poly Haven glTF found after download")
    model = sorted(gltf_paths, key=lambda p: p.stat().st_size, reverse=True)[0]
    if model.suffix == ".gltf":
        document = json.loads(model.read_text(encoding="utf8"))
        for buffer in document.get("buffers", []):
            uri = buffer.get("uri")
            if uri and not uri.startswith("data:") and not (model.parent / valid_filename(uri)).is_file():
                raise ValueError("glTF missing buffer: " + uri)
        for tex in document.get("images", []):
            uri = tex.get("uri")
            if uri and not uri.startswith("data:") and not (model.parent / valid_filename(uri)).is_file():
                raise ValueError("glTF missing texture: " + uri)
    print("polyhaven", model, model.stat().st_size)
    return {"name": "Poly Haven four-bottle collection (original fictional labels)",
            "kind": "wine", "path": "/" + model.relative_to(Path("public")).as_posix()}

manifest = {"license": "CC0",
            "sources": ["https://polyhaven.com/a/wine_bottles_01",
                        "https://www.innerscene.com/tools/library"],
            "models": [
                poly_haven_wine(),
                as_glb("innerscene-wine", "https://www.innerscene.com/api/library/wine-bottle-original-drink-vessel-dff39232/download", "wine"),
                as_glb("innerscene-beer", "https://www.innerscene.com/api/library/beer-bottle-original-drink-vessel-1b0eeeac/download", "beer"),
                as_glb("innerscene-can", "https://www.innerscene.com/api/library/drink-can-original-drink-vessel-c636c4a2/download", "can"),
            ]}
(ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf8")
print("CC0_ASSETS_READY", json.dumps(manifest))
