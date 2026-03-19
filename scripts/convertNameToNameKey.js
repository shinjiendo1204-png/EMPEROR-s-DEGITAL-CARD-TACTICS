const fs = require("fs")
const path = require("path")

const TARGET_DIR = "./data"

function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8")

  let updated = content

  // name削除
  updated = updated.replace(/\s*name:\s*".*?",?\n/g, "\n")

  // idの後にnameKey追加（既にあればスキップ）
  updated = updated.replace(
    /id:\s*"([^"]+)",/g,
    (match, id) => {
      if (match.includes("nameKey")) return match
      return `id: "${id}",\n  nameKey: "${id}",`
    }
  )

  if (updated !== content) {
    fs.writeFileSync(filePath, updated)
    console.log("✅ Updated:", filePath)
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      walk(fullPath)
    } else if (file.endsWith(".ts")) {
      processFile(fullPath)
    }
  }
}

walk(TARGET_DIR)