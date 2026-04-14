# Testing Guide

## Stack

- **Vitest** — test runner (native ESM, no config overhead, pairs with Vite)
- **@vitest/coverage-v8** — coverage via Node's built-in V8 engine

## Running Tests

```bash
npm test              # single run (CI-safe)
npm run test:watch    # watch mode (development)
npm run test:coverage # single run + HTML/LCOV coverage report in ./coverage/
```

## Structure

```
tests/
├── helpers/
│   └── params.ts                        # makeParams() factory — used everywhere
└── core/
    ├── parameters/
    │   └── shapeConstraints.test.ts     # constraint rules, normalization, shape change
    ├── model/
    │   ├── validators.test.ts           # all validation rules + boundary values
    │   └── buildModel.test.ts           # integration: full pipeline per shape/mode
    └── builders/
        ├── keychainTab.test.ts          # shapeEdgeDistance + tab placement math
        ├── triangleTag.test.ts          # bounding-box geometry assertions
        ├── starTag.test.ts              # bounding-box geometry assertions
        └── heartTag.test.ts             # bounding-box geometry assertions
```

## Test Utility Layer

**`tests/helpers/params.ts`** exports one function:

```typescript
makeParams(overrides?: Partial<ModelParams>): ModelParams
```

It merges `DEFAULT_PARAMS` with your overrides. Every test file that needs a
`ModelParams` object should use this — it keeps tests focused only on the
fields that matter for the behaviour under test.

## Writing New Tests

### Where to put them

| What you are testing | Where |
|---|---|
| A constraint / rule / pure function | Colocate under `tests/core/parameters/` or `tests/core/model/` |
| A shape builder | `tests/core/builders/<shapeName>Tag.test.ts` |
| Full model pipeline | `tests/core/model/buildModel.test.ts` |

### Naming convention

```
tests/core/<same-path-as-src>/<module>.test.ts
```

### Test naming style

Use behaviour-driven descriptions that read as sentences:

```typescript
it('allows only top and bottom positions for triangle')
it('snaps heart position "top" to the default "bottom"')
it('rejects inside hole when shape height is less than holeDiameter + 12')
```

### Adding a new shape

1. Create `tests/core/builders/<newShape>Tag.test.ts`
2. Verify the bounding box via `measurements.measureBoundingBox(geom)` from
   `@jscad/modeling`. Be aware that non-convex shapes (like the star) may have
   a bounding box smaller than their outer radius — check the actual geometry
   first and document the expected values with a comment.
3. Add the new shape to the `shapes` array in `buildModel.test.ts` (the
   `it.each` coverage test will then exercise it automatically).
4. If the shape has keychain constraints, add them to
   `SHAPE_KEYCHAIN_CONSTRAINTS` in `shapeConstraints.ts` and add coverage in
   `shapeConstraints.test.ts`.

### Adding a new validation rule

Add tests to `tests/core/model/validators.test.ts`. Always include:
- One test for each boundary value (exactly at the limit → should pass)
- One test for each out-of-range value (just past the limit → should fail)
- A check that the error message mentions the relevant field/parameter

## Key Design Decisions

- **No JSCAD mocking.** Builders are tested with the real `@jscad/modeling`
  library so that geometry regressions are caught. The library is pure
  computation and runs in Node without any browser shims.

- **`buildModel` tests use `text: ''`** for most cases to keep the suite fast
  by skipping the font-rendering pipeline. A small number of text-mode tests
  use a single character (`'A'`) to exercise the text path without inflating
  run time.

- **Shape-constraint tests use reference equality (`toBe`)** to verify that
  `normalizeKeychainForShape` returns the same object when no normalization is
  needed. This documents an intentional performance contract.
