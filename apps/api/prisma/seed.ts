import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.propertyImage.deleteMany();
  await prisma.propertyFeature.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@propertyhub.com',
      password: hashedPassword,
      name: 'Admin PropertyHub',
      role: 'ADMIN',
      phone: '081234567890',
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: 'agent1@propertyhub.com',
      password: hashedPassword,
      name: 'Budi Santoso',
      role: 'USER',
      phone: '081234567891',
      company: 'Santoso Property',
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'agent2@propertyhub.com',
      password: hashedPassword,
      name: 'Siti Nurhaliza',
      role: 'USER',
      phone: '081234567892',
      company: 'Nurhaliza Realty',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@propertyhub.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'USER',
      phone: '081234567893',
    },
  });

  console.log('✅ Users created');

  // Property data templates
  const cities = ['Jakarta', 'Surabaya', 'Bandung', 'Bali', 'Yogyakarta', 'Semarang', 'Medan', 'Makassar'];
  const districts = {
    Jakarta: ['Menteng', 'Kebayoran Baru', 'Pondok Indah', 'Kelapa Gading', 'Kemang', 'Senayan'],
    Surabaya: ['Gubeng', 'Rungkut', 'Darmo', 'Citraland', 'Pakuwon', 'Wiyung'],
    Bandung: ['Dago', 'Cihampelas', 'Pasteur', 'Setiabudi', 'Buah Batu', 'Antapani'],
    Bali: ['Seminyak', 'Canggu', 'Ubud', 'Sanur', 'Kuta', 'Nusa Dua'],
    Yogyakarta: ['Sleman', 'Condongcatur', 'Seturan', 'Mlati', 'Depok', 'Gamping'],
    Semarang: ['Tembalang', 'Banyumanik', 'Semarang Tengah', 'Gajahmungkur', 'Pedurungan', 'Ngaliyan'],
    Medan: ['Medan Baru', 'Medan Selayang', 'Medan Sunggal', 'Medan Helvetia', 'Medan Johor', 'Medan Amplas'],
    Makassar: ['Panakkukang', 'Rappocini', 'Tamalanrea', 'Biringkanaya', 'Manggala', 'Tallo'],
  };

  const propertyTypes = ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL', 'VILLA', 'WAREHOUSE'];
  const listingTypes = ['SALE', 'RENT'];
  const furnishings = ['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'];
  const certificates = ['SHM', 'SHGB', 'HGB', 'GIRIK', 'STRATA_TITLE'];

  const features = [
    'AC', 'Balkon', 'Taman', 'Garasi', 'Kolam Renang', 'Gym',
    'Security 24/7', 'CCTV', 'Playground', 'Jogging Track',
    'Carport', 'Dapur', 'Ruang Makan', 'Ruang Keluarga',
    'Water Heater', 'Internet/WiFi', 'Lift', 'Rooftop',
    'Gudang', 'Mushola', 'Laundry', 'Cluster',
  ];

  const imageUrls = [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
    'https://images.unsplash.com/photo-1600210492493-0946911123ea',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
  ];

  const agents = [agent1, agent2];
  let propertyCount = 0;

  // Generate 100 properties
  for (let i = 0; i < 100; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const district = districts[city][Math.floor(Math.random() * districts[city].length)];
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const listingType = listingTypes[Math.floor(Math.random() * listingTypes.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];

    const bedrooms = propertyType === 'LAND' ? null : Math.floor(Math.random() * 5) + 1;
    const bathrooms = propertyType === 'LAND' ? null : Math.floor(Math.random() * 4) + 1;
    const landArea = Math.floor(Math.random() * 400) + 100;
    const buildingArea = propertyType === 'LAND' ? null : Math.floor(Math.random() * 300) + 50;
    const floors = propertyType === 'APARTMENT' ? null : Math.floor(Math.random() * 3) + 1;

    const basePrice = propertyType === 'LAND' ? 500000000 :
                     propertyType === 'APARTMENT' ? 600000000 :
                     propertyType === 'COMMERCIAL' ? 2000000000 :
                     propertyType === 'VILLA' ? 3000000000 :
                     propertyType === 'WAREHOUSE' ? 1500000000 : 1200000000;
    const rentMultiplier = listingType === 'RENT' ? 0.005 : 1; // ~0.5% per bulan
    const price = Math.round((basePrice + (Math.floor(Math.random() * 15) * 100000000)) * rentMultiplier);

    const titles = {
      HOUSE: [
        `Rumah Mewah ${bedrooms} Kamar di ${district}`,
        `Rumah Modern Minimalis ${district} ${city}`,
        `Rumah Siap Huni ${bedrooms}KT ${district}`,
        `Rumah Strategis dekat Pusat Kota ${city}`,
        `Rumah Cluster Premium ${district}`,
        `Rumah 2 Lantai ${bedrooms} Kamar ${district}`,
      ],
      APARTMENT: [
        `Apartemen ${bedrooms} Kamar di ${district}`,
        `Apartment Modern ${district} ${city}`,
        `Unit Apartemen Siap Huni ${district}`,
        `Apartemen View Kota ${city}`,
        `Studio Apartemen ${district} Strategis`,
        `Apartemen Furnished ${bedrooms}BR ${district}`,
      ],
      LAND: [
        `Tanah Kavling ${landArea}m² di ${district}`,
        `Tanah Strategis ${district} ${city}`,
        `Kavling Siap Bangun ${district}`,
        `Tanah Investasi ${city}`,
        `Tanah Hook ${landArea}m² ${district}`,
        `Kavling Premium ${district} ${city}`,
      ],
      COMMERCIAL: [
        `Ruko ${floors} Lantai di ${district}`,
        `Gedung Komersial ${district} ${city}`,
        `Ruko Strategis ${district}`,
        `Bangunan Komersial ${city}`,
        `Ruko Baru ${floors}Lt ${district}`,
        `Kios Strategis ${district} ${city}`,
      ],
      VILLA: [
        `Villa Mewah ${bedrooms} Kamar di ${district}`,
        `Villa Private Pool ${district} ${city}`,
        `Villa Modern ${district} View Alam`,
        `Villa Eksklusif ${bedrooms}KT ${district}`,
        `Villa Tropis ${district} ${city}`,
      ],
      WAREHOUSE: [
        `Gudang ${landArea}m² di ${district}`,
        `Gudang Strategis ${district} ${city}`,
        `Warehouse ${buildingArea}m² ${district}`,
        `Gudang Industri ${district} ${city}`,
        `Gudang Siap Pakai ${district}`,
      ],
    };

    const title = titles[propertyType][Math.floor(Math.random() * titles[propertyType].length)];

    const descriptions = [
      `Properti premium dengan lokasi strategis di ${district}, ${city}. Akses mudah ke berbagai fasilitas umum seperti mall, sekolah, dan rumah sakit. Lingkungan aman dan nyaman dengan keamanan 24 jam.`,
      `Hunian modern dengan desain minimalis yang elegan. Dilengkapi dengan berbagai fasilitas lengkap untuk kenyamanan keluarga. Lokasi strategis dengan akses mudah ke pusat kota.`,
      `Investasi properti terbaik di ${city}. Lokasi prime dengan potensi nilai investasi tinggi. Cocok untuk hunian maupun investasi jangka panjang.`,
      `Properti eksklusif dengan kualitas bangunan terbaik. Lingkungan asri dan tenang, cocok untuk keluarga. Dekat dengan berbagai fasilitas pendukung.`,
    ];

    const property = await prisma.property.create({
      data: {
        title,
        slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${i}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        propertyType,
        listingType,
        price: price.toString(),
        address: `Jl. ${district} No. ${Math.floor(Math.random() * 100) + 1}`,
        city,
        district,
        province: city === 'Jakarta' ? 'DKI Jakarta' :
                 city === 'Surabaya' ? 'Jawa Timur' :
                 city === 'Bandung' ? 'Jawa Barat' :
                 city === 'Bali' ? 'Bali' :
                 city === 'Yogyakarta' ? 'DI Yogyakarta' :
                 city === 'Medan' ? 'Sumatera Utara' :
                 city === 'Makassar' ? 'Sulawesi Selatan' : 'Jawa Tengah',
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        latitude: city === 'Jakarta' ? -6.2 + (Math.random() * 0.3 - 0.15) :
                 city === 'Surabaya' ? -7.25 + (Math.random() * 0.2 - 0.1) :
                 city === 'Bandung' ? -6.9 + (Math.random() * 0.2 - 0.1) :
                 city === 'Bali' ? -8.65 + (Math.random() * 0.3 - 0.15) :
                 city === 'Yogyakarta' ? -7.8 + (Math.random() * 0.2 - 0.1) :
                 city === 'Medan' ? 3.58 + (Math.random() * 0.2 - 0.1) :
                 city === 'Makassar' ? -5.14 + (Math.random() * 0.2 - 0.1) :
                 -7.0 + (Math.random() * 0.2 - 0.1),
        longitude: city === 'Jakarta' ? 106.82 + (Math.random() * 0.3 - 0.15) :
                  city === 'Surabaya' ? 112.75 + (Math.random() * 0.2 - 0.1) :
                  city === 'Bandung' ? 107.61 + (Math.random() * 0.2 - 0.1) :
                  city === 'Bali' ? 115.2 + (Math.random() * 0.3 - 0.15) :
                  city === 'Yogyakarta' ? 110.37 + (Math.random() * 0.2 - 0.1) :
                  city === 'Medan' ? 98.67 + (Math.random() * 0.2 - 0.1) :
                  city === 'Makassar' ? 119.43 + (Math.random() * 0.2 - 0.1) :
                  110.41 + (Math.random() * 0.2 - 0.1),
        bedrooms,
        bathrooms,
        landArea,
        buildingArea,
        floors,
        yearBuilt: propertyType === 'LAND' ? null : 2015 + Math.floor(Math.random() * 9),
        certificateType: certificates[Math.floor(Math.random() * certificates.length)],
        furnishing: propertyType === 'LAND' ? null : furnishings[Math.floor(Math.random() * furnishings.length)],
        userId: agent.id,
        status: i < 80 ? 'ACTIVE' : i < 88 ? 'DRAFT' : i < 95 ? 'SOLD' : 'INACTIVE',
        moderationStatus: 'APPROVED',
      },
    });

    // Add images
    const numImages = Math.floor(Math.random() * 4) + 3;
    for (let j = 0; j < numImages; j++) {
      await prisma.propertyImage.create({
        data: {
          url: `${imageUrls[j % imageUrls.length]}?w=800&h=600&fit=crop&q=80&sig=${i}-${j}`,
          isPrimary: j === 0,
          propertyId: property.id,
        },
      });
    }

    // Add features
    const numFeatures = Math.floor(Math.random() * 6) + 4;
    const selectedFeatures = features.sort(() => 0.5 - Math.random()).slice(0, numFeatures);
    for (const feature of selectedFeatures) {
      await prisma.propertyFeature.create({
        data: {
          feature,
          propertyId: property.id,
        },
      });
    }

    propertyCount++;
    if (propertyCount % 10 === 0) {
      console.log(`✅ Created ${propertyCount} properties...`);
    }
  }

  console.log(`✅ Created ${propertyCount} properties with images and features`);

  // Create some favorites and leads for testing
  const activeProperties = await prisma.property.findMany({
    where: { status: 'ACTIVE' },
    take: 10,
  });

  for (const property of activeProperties.slice(0, 5)) {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        propertyId: property.id,
      },
    });
  }

  for (const property of activeProperties.slice(0, 8)) {
    await prisma.lead.create({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        message: 'Saya tertarik dengan properti ini. Mohon info lebih lanjut.',
        propertyId: property.id,
        userId: user.id,
      },
    });
  }

  console.log('✅ Created favorites and leads');

  // Stats
  const stats = {
    users: await prisma.user.count(),
    properties: await prisma.property.count(),
    active: await prisma.property.count({ where: { status: 'ACTIVE' } }),
    draft: await prisma.property.count({ where: { status: 'DRAFT' } }),
    sold: await prisma.property.count({ where: { status: 'SOLD' } }),
    favorites: await prisma.favorite.count(),
    leads: await prisma.lead.count(),
  };

  console.log('\n📊 Seed Summary:');
  console.log(`   Users: ${stats.users}`);
  console.log(`   Properties: ${stats.properties}`);
  console.log(`   - Active: ${stats.active}`);
  console.log(`   - Draft: ${stats.draft}`);
  console.log(`   - Sold: ${stats.sold}`);
  console.log(`   Favorites: ${stats.favorites}`);
  console.log(`   Leads: ${stats.leads}`);
  console.log('\n🎉 Seed completed!\n');

  console.log('📝 Test Accounts:');
  console.log('   Admin:  admin@propertyhub.com / admin123');
  console.log('   Agent1: agent1@propertyhub.com / admin123');
  console.log('   Agent2: agent2@propertyhub.com / admin123');
  console.log('   User:   user@propertyhub.com / admin123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
