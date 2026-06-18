// Ambient declarations for static image imports (e.g. `import photo from './avatar.jpg'`).
//
// These types normally come from `next/image-types/global`, which Next.js wires up via the
// auto-generated `next-env.d.ts`. That file is gitignored, so it is absent in a fresh CI
// checkout (where `tsc --noEmit` runs before any `next build`/`next dev`). This committed
// reference guarantees the `*.jpg`/`*.png`/... module types are always available.
/// <reference types="next/image-types/global" />
