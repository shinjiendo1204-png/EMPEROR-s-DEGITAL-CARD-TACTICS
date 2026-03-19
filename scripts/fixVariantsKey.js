const fs = require("fs")
const path = require("path")

const TARGET_DIR = "./data" // 必要なら ./data/packs

function generateId(prefix, index) {
  return `${prefix}_${index}`
}

function fixVariants(content) {
  let equipmentCount = 0
  let synergyCount = 0

  // equipmentブロック
  content = content.replace(
    /equipment:\s*{([\s\S]*?)}/g,
    (match, inner) => {
      let block = inner

      const hasId = /id:\s*"/.test(block)
      const hasNameKey = /nameKey:\s*"/.test(block)

      let id

      if (hasId) {
        id = block.match(/id:\s*"([^"]+)"/)?.[1]
      } else {
        id = generateId("equipment_auto", equipmentCount++)
      }

      if (!hasId) {
        block = `id: "${id}",\n      ${block}`
      }

      if (!hasNameKey) {
        block = block.replace(
          /id:\s*"([^"]+)"/,
          (m, idVal) => `id: "${idVal}",\n      nameKey: "${idVal}"`
        )
      }

      return `equipment: {\n      ${block}\n    }`
    }
  )

  // synergyブロック
  content = content.replace(
    /synergy:\s*{([\s\S]*?)}/g,
    (match, inner) => {
      let block = inner

      const hasId = /id:\s*"/.test(block)
      const hasNameKey = /nameKey:\s*"/.test(block)

      let id

      if (hasId) {
        id = block.match(/id:\s*"([^"]+)"/)?.[1]
      } else {
        id = generateId("synergy_auto", synergyCount++)
      }

      if (!hasId) {
        block = `id: "${id}",\n      ${block}`
      }

      if (!hasNameKey) {
        block = block.replace(
          /id:\s*"([^"]+)"/,
          (m, idVal) => `id: "${idVal}",\n      nameKey: "${idVal}"`
        )
      }

      return `synergy: {\n      ${block}\n    }`
    }
  )

  return content
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf-8")
  const updated = fixVariants(original)

  if (original !== updated) {
    fs.writeFileSync(filePath, updated)
    console.log("✅ Fixed:", filePath)
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)

    if (stat.isDirectory()) {
      walk(full)
    } else if (file.endsWith(".ts")) {
      processFile(full)
    }
  }
}

walk(TARGET_DIR)