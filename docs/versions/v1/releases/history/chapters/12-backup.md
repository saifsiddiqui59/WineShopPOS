# Chapter 12 — Backup / Restore

Status: COMPLETE

Implemented:

- Export JSON Backup
- Import JSON Backup
- basic backup-file validation
- restore Products
- restore Inventory
- restore Sales
- restore Purchases
- Demo Reset

Backup format:

```json
{
  "meta": {
    "app": "WineShopPOS",
    "formatVersion": 1
  },
  "data": {
    "products": [],
    "inventory": {},
    "sales": [],
    "purchases": []
  }
}
```

This provides a local recovery mechanism before a real database is connected.
