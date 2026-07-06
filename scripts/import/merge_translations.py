#!/usr/bin/env python3
"""
Merge the four per-sheet zh/ar translation partials into a single
zh-ar-patch.json that scripts/import/translate.ts consumes.

Usage:
  python3 merge_translations.py            # merge + validate + write
  python3 merge_translations.py --check    # validate only, no write

Validates:
  - every partial is valid JSON
  - total product count == 26 (8+9+8+1)
  - no duplicate slugs across sheets
  - no "TODO" markers left in any file
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TRANS = os.path.join(HERE, "translations")
PARTIALS = [f"zh-ar-patch-partial-{i}.json" for i in range(4)]
OUT = os.path.join(TRANS, "zh-ar-patch.json")
EXPECTED_TOTAL = 26


def load(name):
    p = os.path.join(TRANS, name)
    with open(p, encoding="utf-8") as f:
        return json.load(f), p


def main():
    check_only = "--check" in sys.argv
    merged = {}
    per_sheet = []
    problems = []

    for fn in PARTIALS:
        try:
            data, path = load(fn)
        except Exception as e:
            problems.append(f"{fn}: INVALID JSON -> {e}")
            continue
        if not isinstance(data, dict):
            problems.append(f"{fn}: top-level not an object")
            continue
        # TODO check
        raw = open(path, encoding="utf-8").read()
        todos = raw.upper().count("TODO")
        if todos:
            problems.append(f"{fn}: {todos} TODO marker(s) remain")
        # duplicate slug check
        for slug in data:
            if slug in merged:
                problems.append(f"duplicate slug across sheets: {slug}")
        merged.update(data)
        per_sheet.append((fn, len(data)))

    print("Per-sheet product counts:")
    for fn, n in per_sheet:
        print(f"  {fn}: {n}")
    print(f"Merged total: {len(merged)} (expected {EXPECTED_TOTAL})")
    if len(merged) != EXPECTED_TOTAL:
        problems.append(f"total {len(merged)} != expected {EXPECTED_TOTAL}")

    if problems:
        print("\nVALIDATION FAILED:")
        for p in problems:
            print("  -", p)
        sys.exit(1)

    if check_only:
        print("\nVALIDATION OK (no write).")
        return

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    print(f"\nWROTE {OUT} ({len(merged)} products)")


if __name__ == "__main__":
    main()
