const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 配置
const PHOTOGRAPHY_DIR = path.join(__dirname, '../public/images/photography');

// 卡片缩略图配置（用于卡片轮播展示）
const CARD_WIDTH = 480;
const CARD_HEIGHT = 600;
const CARD_QUALITY = 85;

// 全尺寸配置（用于lightbox/文件夹查看）
const FULL_WIDTH = 1600;
const FULL_QUALITY = 90;

// 颜色代码用于控制台输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

async function generateThumbnails() {
  console.log(`${colors.bright}${colors.blue}开始生成缩略图...${colors.reset}\n`);

  const categories = ['portrait', 'landscape', 'humanist'];
  let totalProcessed = 0;
  let totalGenerated = 0;

  for (const category of categories) {
    const categoryDir = path.join(PHOTOGRAPHY_DIR, category);
    const thumbnailDir = path.join(categoryDir, 'thumbnails');

    // 检查分类目录是否存在
    if (!fs.existsSync(categoryDir)) {
      console.log(`${colors.yellow}⚠ 跳过不存在的分类: ${category}${colors.reset}`);
      continue;
    }

    // 创建缩略图目录
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
      console.log(`${colors.green}✓ 创建目录: ${category}/thumbnails/${colors.reset}`);
    }

    // 读取所有 JPG 文件
    const files = fs.readdirSync(categoryDir).filter(file =>
      file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')
    );

    console.log(`${colors.bright}处理分类: ${category} (${files.length} 张图片)${colors.reset}`);

    for (const file of files) {
      const inputPath = path.join(categoryDir, file);
      const baseName = file.replace(/\.(jpg|jpeg)$/i, '');

      // 卡片缩略图文件名
      const cardFilename = `${baseName}-card.webp`;
      const cardPath = path.join(thumbnailDir, cardFilename);

      // 全尺寸文件名
      const fullFilename = `${baseName}-full.webp`;
      const fullPath = path.join(thumbnailDir, fullFilename);

      try {
        const originalSize = fs.statSync(inputPath).size;

        // 生成卡片缩略图（480x600px，纵向）
        await sharp(inputPath)
          .resize(CARD_WIDTH, CARD_HEIGHT, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: CARD_QUALITY })
          .toFile(cardPath);

        const cardSize = fs.statSync(cardPath).size;

        // 生成全尺寸图片（1600px宽，保持原始纵横比）
        await sharp(inputPath)
          .resize(FULL_WIDTH, null, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: FULL_QUALITY })
          .toFile(fullPath);

        const fullSize = fs.statSync(fullPath).size;

        console.log(`  ${colors.green}✓${colors.reset} ${file}`);
        console.log(`    Card: ${cardFilename} (${formatBytes(cardSize)})`);
        console.log(`    Full: ${fullFilename} (${formatBytes(fullSize)})`);
        console.log(`    总压缩: ${formatBytes(originalSize)} → ${formatBytes(cardSize + fullSize)} (-${((1 - (cardSize + fullSize) / originalSize) * 100).toFixed(1)}%)`);

        totalGenerated += 2; // 每张原图生成2个文件
      } catch (error) {
        console.log(`  ${colors.red}✗${colors.reset} ${file}: ${error.message}`);
      }

      totalProcessed++;
    }

    console.log('');
  }

  console.log(`${colors.bright}${colors.green}完成！${colors.reset}`);
  console.log(`处理: ${totalProcessed} 张原图`);
  console.log(`生成: ${totalGenerated} 个文件 (${totalProcessed} × card + ${totalProcessed} × full)`);
  console.log(`保存位置: ${PHOTOGRAPHY_DIR}/{category}/thumbnails/\n`);
}

// 格式化字节大小
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 运行
generateThumbnails().catch(error => {
  console.error(`${colors.red}错误: ${error.message}${colors.reset}`);
  process.exit(1);
});
