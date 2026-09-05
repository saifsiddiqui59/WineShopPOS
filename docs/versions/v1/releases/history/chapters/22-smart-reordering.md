# Chapter 22 — Smart Reordering

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Suggest orders using facts already in the POS instead of AI.

## Formula
- history window default: 30 days
- average daily sales = units sold / history days
- days remaining = current stock / average daily sales
- desired quantity = max(avg daily × target days, minimum stock)
- suggested bottles = max(0, desired quantity - current stock)
- suggested cases = ceil(suggested bottles / units per case)

`reorder_suggestions` ignores voided/fully returned sales and returns only products below minimum or within target days.

The UI can create a Purchase Order from a recommendation.

## Tests
A product selling 11/day, stock 18, target 7 days should show low days remaining and a positive case suggestion.
