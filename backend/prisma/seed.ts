import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: 'portrait',
    displayName: 'Portrait',
    description: 'Capturing the essence of human beings through portraiture',
    iconColor: '#EC4899',
    sortOrder: 1,
  },
  {
    name: 'landscape',
    displayName: 'Landscape',
    description: 'Exploring the beauty of natural scenery and environments',
    iconColor: '#10B981',
    sortOrder: 2,
  },
  {
    name: 'humanist',
    displayName: 'Humanist',
    description: 'Documentary and cultural photography celebrating humanity',
    iconColor: '#3B82F6',
    sortOrder: 3,
  },
];

const PHOTOS_PER_CATEGORY: Record<string, Array<{ title: string; filePath: string; thumbnailPath: string }>> = {
  portrait: [
    { title: 'Portrait Study 1', filePath: '/photos/photography/portrait/thumbnails/DSC_4769-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/DSC_4769-card.webp' },
    { title: 'Portrait Study 2', filePath: '/photos/photography/portrait/thumbnails/DSC_6428-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/DSC_6428-card.webp' },
    { title: 'Portrait Study 3', filePath: '/photos/photography/portrait/thumbnails/IMG_2781-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/IMG_2781-card.webp' },
    { title: 'Portrait Study 4', filePath: '/photos/photography/portrait/thumbnails/IMG_2923-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/IMG_2923-card.webp' },
    { title: 'Portrait Study 5', filePath: '/photos/photography/portrait/thumbnails/IMG_4382-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/IMG_4382-card.webp' },
  ],
  landscape: [
    { title: 'Mountain Vista', filePath: '/photos/photography/landscape/thumbnails/DSC_1093-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_1093-card.webp' },
    { title: 'Serene Waters', filePath: '/photos/photography/landscape/thumbnails/DSC_1174-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_1174-card.webp' },
    { title: 'Natural Beauty', filePath: '/photos/photography/landscape/thumbnails/DSC_1180-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_1180-card.webp' },
    { title: 'Wilderness Scene', filePath: '/photos/photography/landscape/thumbnails/DSC_1190-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_1190-card.webp' },
    { title: 'Scenic Overlook', filePath: '/photos/photography/landscape/thumbnails/DSC_1195-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_1195-card.webp' },
  ],
  humanist: [
    { title: 'Human Connection', filePath: '/photos/photography/humanist/thumbnails/DSC_3590-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_3590-card.webp' },
    { title: 'Daily Life', filePath: '/photos/photography/humanist/thumbnails/DSC_3592-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_3592-card.webp' },
    { title: 'Cultural Expression', filePath: '/photos/photography/humanist/thumbnails/DSC_3595-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_3595-card.webp' },
    { title: 'Social Documentary', filePath: '/photos/photography/humanist/thumbnails/DSC_3597-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_3597-card.webp' },
    { title: 'Life Stories', filePath: '/photos/photography/humanist/thumbnails/DSC_3642-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_3642-card.webp' },
  ],
};

async function main() {
  const existingCount = await prisma.photoCategory.count();
  if (existingCount > 0) {
    console.log(`Seed skipped: ${existingCount} categories already exist`);
    return;
  }

  for (const cat of CATEGORIES) {
    const created = await prisma.photoCategory.create({ data: cat });
    const photos = PHOTOS_PER_CATEGORY[cat.name];
    await prisma.photo.createMany({
      data: photos.map((p) => ({ ...p, categoryId: created.id })),
    });
    console.log(`Seeded category: ${cat.displayName} with ${photos.length} photos`);
  }

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
