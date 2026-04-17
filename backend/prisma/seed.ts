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
    { title: 'Portrait 1', filePath: '/photos/photography/portrait/DSC_4769-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/DSC_4769-full.webp' },
    { title: 'Portrait 2', filePath: '/photos/photography/portrait/DSC_4770-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/DSC_4770-full.webp' },
    { title: 'Portrait 3', filePath: '/photos/photography/portrait/DSC_4771-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/DSC_4771-full.webp' },
    { title: 'Portrait 4', filePath: '/photos/photography/portrait/DSC_4772-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/DSC_4772-full.webp' },
    { title: 'Portrait 5', filePath: '/photos/photography/portrait/DSC_4773-full.webp', thumbnailPath: '/photos/photography/portrait/thumbnails/DSC_4773-full.webp' },
  ],
  landscape: [
    { title: 'Landscape 1', filePath: '/photos/photography/landscape/DSC_5001-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_5001-full.webp' },
    { title: 'Landscape 2', filePath: '/photos/photography/landscape/DSC_5002-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_5002-full.webp' },
    { title: 'Landscape 3', filePath: '/photos/photography/landscape/DSC_5003-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_5003-full.webp' },
    { title: 'Landscape 4', filePath: '/photos/photography/landscape/DSC_5004-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_5004-full.webp' },
    { title: 'Landscape 5', filePath: '/photos/photography/landscape/DSC_5005-full.webp', thumbnailPath: '/photos/photography/landscape/thumbnails/DSC_5005-full.webp' },
  ],
  humanist: [
    { title: 'Humanist 1', filePath: '/photos/photography/humanist/DSC_6001-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_6001-full.webp' },
    { title: 'Humanist 2', filePath: '/photos/photography/humanist/DSC_6002-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_6002-full.webp' },
    { title: 'Humanist 3', filePath: '/photos/photography/humanist/DSC_6003-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_6003-full.webp' },
    { title: 'Humanist 4', filePath: '/photos/photography/humanist/DSC_6004-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_6004-full.webp' },
    { title: 'Humanist 5', filePath: '/photos/photography/humanist/DSC_6005-full.webp', thumbnailPath: '/photos/photography/humanist/thumbnails/DSC_6005-full.webp' },
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
