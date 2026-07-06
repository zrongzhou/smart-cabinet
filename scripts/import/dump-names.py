import sys, json

with open(sys.argv[1]) as f:
    d = json.load(f)
items = d.get("data", d)
print(f"total: {len(items)}")
for i in sorted(items, key=lambda x: x["slug"]):
    s = i["slug"]
    n = i["name"]["en"]
    z = i["name"].get("zh", "")
    print(f"{s} | {n} | {z}")
