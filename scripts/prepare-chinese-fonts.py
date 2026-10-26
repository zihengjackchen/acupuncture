"""Regenerate the site's self-hosted Noto SC variable WOFF2 subsets.

Setup: python -m pip install "fonttools[woff]==4.67.0" "brotli==1.2.1"
Run: python scripts/prepare-chinese-fonts.py
Downloads are pinned and verified, cached under .qa/font-sources by default.
Keep the generated fonts, coverage manifest, and OFL license files together.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen

import fontTools
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
COMMIT = 'e7db6ca603fd4862010383ff17ffd6cc4ffac1c0'
UPSTREAM = f'https://raw.githubusercontent.com/google/fonts/{COMMIT}/ofl'
FONTS = [
    ('NotoSerifSC', 'noto-serif-sc', '050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9', '5e0da210fb04058a8c0087985d2d456b931c2579811a49655721d3cf0c36b6d6'),
    ('NotoSansSC', 'noto-sans-sc', 'a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da', '1c05c68c34f9708415aada51f17e1b0092d2cea709bf4a94cd38114f9e73d7d9'),
]


def chinese_character(cp):
    return (0x2E80 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF
            or 0xFE10 <= cp <= 0xFE1F or 0xFE30 <= cp <= 0xFE4F
            or 0xFF00 <= cp <= 0xFFEF or 0x20000 <= cp <= 0x323AF
            or cp in {0xB7, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026})


def cached_download(url, destination, expected_hash):
    if destination.exists():
        data = destination.read_bytes()
        if hashlib.sha256(data).hexdigest() == expected_hash:
            return data
    with urlopen(Request(url, headers={'User-Agent': 'Wangs-Harmony-font-build'}), timeout=60) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != expected_hash:
        raise ValueError(f'Upstream checksum mismatch: {url}')
    destination.write_bytes(data)
    return data


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--cache-dir', type=Path, default=ROOT / '.qa/font-sources')
args = parser.parse_args()
args.cache_dir.mkdir(parents=True, exist_ok=True)
sources = [*ROOT.glob('content/**/*.zh.md'), ROOT / 'i18n/zh.yaml',
           *ROOT.glob('layouts/**/*.html'), *ROOT.glob('assets/js/**/*.js'),
           *ROOT.glob('data/**/*.json'), *ROOT.glob('data/**/*.yaml'), *ROOT.glob('data/**/*.yml')]
characters = set('中文')
for source in sources:
    characters.update(c for c in source.read_text(encoding='utf-8') if chinese_character(ord(c)))
codepoints = sorted(map(ord, characters))
manifest = {'upstreamCommit': COMMIT, 'weights': [400, 600], 'fontTools': fontTools.__version__,
            'codepoints': codepoints, 'fonts': []}
outputs = {}
for family, slug, source_hash, license_hash in FONTS:
    source = cached_download(f'{UPSTREAM}/{family.lower()}/{family}%5Bwght%5D.ttf', args.cache_dir / f'{family}.ttf', source_hash)
    license_text = cached_download(f'{UPSTREAM}/{family.lower()}/OFL.txt', args.cache_dir / f'OFL-{family}.txt', license_hash)
    font = TTFont(io.BytesIO(source), recalcTimestamp=False)
    missing = set(codepoints) - set(font.getBestCmap())
    if missing:
        raise ValueError(f'{family} cannot cover site characters: ' + ', '.join(f'{chr(cp)} U+{cp:04X}' for cp in sorted(missing)))
    options = subset.Options()
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17]
    options.layout_features = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    font = instantiateVariableFont(font, {'wght': (400, 600)}, inplace=True)
    font.flavor = 'woff2'
    buffer = io.BytesIO()
    font.save(buffer)
    data = buffer.getvalue()
    with TTFont(io.BytesIO(data)) as check:
        assert set(codepoints) <= set(check.getBestCmap()), 'Subset lost requested characters'
        axis = check['fvar'].axes[0]
        assert (axis.axisTag, axis.minValue, axis.maxValue) == ('wght', 400, 600)
    filename = f'{slug}-variable.woff2'
    outputs[ROOT / 'static/fonts' / filename] = data
    outputs[ROOT / 'static/fonts' / f'OFL-{family}.txt'] = b'\n'.join(line.rstrip() for line in license_text.splitlines()) + b'\n'
    manifest['fonts'].append({'file': filename, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    print(f'{filename}: {len(data):,} bytes, {len(codepoints)} codepoints, weights 400-600')

for target, data in outputs.items():
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
manifest_path = ROOT / 'assets/fonts/chinese-coverage.json'
manifest_path.parent.mkdir(parents=True, exist_ok=True)
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
