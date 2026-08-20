const fs = require('fs');
const path = require('path');

// 1、当前目录（gallery）
const rootDir = __dirname;
// 输出索引文件
const outIndexPath = path.join(rootDir, 'asset-index.json');

// 过滤：只识别【文件夹】，排除html/js/css/json这些文件
function listPetFolders() {
  const allEntry = fs.readdirSync(rootDir, { withFileTypes: true });
  return allEntry
    .filter(item => item.isDirectory())
    .map(item => item.name);
}

function main() {
  const petList = [];
  const folderNames = listPetFolders();

  for (const folderName of folderNames) {
    const petJsonPath = path.join(rootDir, folderName, 'pet.json');
    // 如果这个宠物文件夹里面没有 pet.json → 直接跳过（不符合规范，不录入索引）
    if (!fs.existsSync(petJsonPath)) {
      console.log(`⚠️ 跳过：${folderName} 缺少 pet.json`);
      continue;
    }
    try {
      const raw = fs.readFileSync(petJsonPath, 'utf8');
      const petInfo = JSON.parse(raw);
      petList.push({
        path: folderName,
        displayName: petInfo.displayName || folderName,
        author: petInfo.author || "匿名开发者",
        filterKey: petInfo.filterKey || "pet-meme",
        platform: petInfo.platform || "OpenClaw"
      })
    } catch (err) {
      console.log(`❌ 读取失败 ${folderName}，JSON语法错误`);
    }
  }

  // 写入最终 asset-index.json
  const final = { petList };
  fs.writeFileSync(outIndexPath, JSON.stringify(final, null, 2), 'utf8');
  console.log(`✅ 完成！一共识别到 ${petList.length} 套宠物，已自动生成 asset-index.json`);
}

main();
