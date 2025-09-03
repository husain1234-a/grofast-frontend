// v0 can run this script from the Scripts tab to refresh types/grofast.ts.

import { readFile, writeFile } from "node:fs/promises"
import openapiTS from "openapi-typescript"

async function main() {
  const spec = await readFile("openapi/grofast.yaml", "utf8")
  const dts = await openapiTS(spec, {
    // keep default, emit as ESM-compatible TS
  })
  // You can change the output path if you prefer .d.ts
  await writeFile("types/grofast.ts", dts, "utf8")
  console.log("[v0] Generated types to types/grofast.ts")
}

main().catch((err) => {
  console.error('Failed to generate OpenAPI types:', err)
  process.exit(1)
})
