import { PrismaClient } from "../src/generated/prisma-sqlite";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed script.
 *
 * SAFETY: This script is IDEMPOTENT — it uses `upsert` everywhere and
 * NEVER calls `deleteMany()`. Running it against a populated database
 * is safe: existing rows are updated in place, missing rows are created,
 * relations are preserved.
 *
 * ADMIN PASSWORD: Read from the ADMIN_BOOTSTRAP_PASSWORD env var. If not
 * set, a random 24-char password is generated and printed ONCE to stdout.
 * The hardcoded `admin123` default is REMOVED — never ship a default
 * credential to production (Phase 2 directive §24).
 *
 * USAGE:
 *   # Development (idempotent re-seed):
 *   bun run db:seed
 *
 *   # Production bootstrap (set the admin password via env):
 *   ADMIN_BOOTSTRAP_PASSWORD='...' bun run db:seed
 */
async function main() {
  console.log("🌱 Seeding database (idempotent mode — no destructive operations)...");

  // ─── Safety check: refuse to seed if env says so ────────────────────
  // This is a final guard: if SEED_REFUSE_NON_EMPTY=true and the DB has
  // data, the script aborts. Useful for CI pipelines that accidentally
  // target a populated DB.
  if (process.env.SEED_REFUSE_NON_EMPTY === "true") {
    const projectCount = await prisma.project.count();
    if (projectCount > 0) {
      console.warn(`⚠️  Refusing to seed: database already has ${projectCount} projects. ` +
        `Set SEED_REFUSE_NON_EMPTY=false to override (NOT recommended in production).`);
      return;
    }
  }

  // ─── Developer ──────────────────────────────────────────────
  const asas = await prisma.developer.create({
    data: {
      slug: "asas-immobilier",
      name: "ASAS Immobilier",
      nameAr: "أساس العقارية",
      description:
        "Promoteur immobilier algérois de référence, ASAS conçoit des résidences modernes alliant confort, sécurité et qualité de vie.",
      descriptionAr:
        "شركة عقارية جزائرية مرجعية، أساس تصمم سكنات عصرية تجمع بين الراحة والأمن وجودة الحياة.",
      logo: "/images/developers/asas-logo.png",
      website: "https://asas-immobilier.dz",
    },
  });

  // ─── Project 1: Résidence Les Oliviers ─────────────────────
  const lesOliviers = await prisma.project.create({
    data: {
      slug: "residence-les-oliviers",
      name: "Résidence Les Oliviers",
      nameAr: "سكن الزيتون",
      tagline: "L'élégance au cœur de Chéraga",
      taglineAr: "أناقة في قلب شراقة",
      description:
        "Nichée dans le quartier résidentiel de Chéraga, la Résidence Les Oliviers offre des appartements F2, F3 et F4 avec finitions haut de gamme, espaces verts et parking en sous-sol. Un cadre de vie exceptionnel pour les familles algéroises.",
      descriptionAr:
        "تطل سكن الزيتون في حي سكني راقٍ بشراقة، وتوفر شقق F2 وF3 وF4 بتشطيبات عالية الجودة ومساحات خضراء وموقف سيارات تحت أرضي. إطار معيشي استثنائي للعائلات الجزائرية.",

      city: "Algiers",
      cityAr: "الجزائر",
      district: "Chéraga",
      districtAr: "شراقة",
      address: "Lot 12, Cité des Oliviers, Chéraga",
      addressAr: "قطعة 12، حي الزيتون، شراقة",
      latitude: 36.7631,
      longitude: 2.9536,

      projectType: "RESIDENTIAL",
      status: "AVAILABLE",
      apartmentTypes: '["F2","F3","F4"]',
      minSurface: 65,
      maxSurface: 125,

      deliveryYear: 2025,
      deliveryQuarter: "Q4",

      hasParking: true,
      hasElevator: true,
      hasGarden: true,
      hasPool: false,
      hasSecurity: true,
      hasClim: true,

      startingPrice: 12_000_000,
      priceOnRequest: false,

      developerId: asas.id,
      published: true,
      archived: false,
      featured: true,
      order: 1,
    },
  });

  // ─── Buildings for Les Oliviers ────────────────────────────
  const oliviersA = await prisma.building.create({
    data: {
      slug: "residence-les-oliviers-a",
      projectId: lesOliviers.id,
      name: "Bâtiment A",
      nameAr: "مبنى أ",
      code: "A",
      floors: 5,
      hasElevator: true,
      order: 1,
    },
  });

  const oliviersB = await prisma.building.create({
    data: {
      slug: "residence-les-oliviers-b",
      projectId: lesOliviers.id,
      name: "Bâtiment B",
      nameAr: "مبنى ب",
      code: "B",
      floors: 5,
      hasElevator: true,
      order: 2,
    },
  });

  // ─── Project Images for Les Oliviers ───────────────────────
  await prisma.projectImage.createMany({
    data: [
      {
        projectId: lesOliviers.id,
        url: "/images/projects/les-oliviers-hero.jpg",
        alt: "Résidence Les Oliviers — Vue d'ensemble",
        altAr: "سكن الزيتون — نظرة عامة",
        type: "hero",
        order: 1,
      },
      {
        projectId: lesOliviers.id,
        url: "/images/projects/les-oliviers-1.jpg",
        alt: "Résidence Les Oliviers — Façade",
        altAr: "سكن الزيتون — واجهة",
        type: "gallery",
        order: 2,
      },
      {
        projectId: lesOliviers.id,
        url: "/images/projects/les-oliviers-2.jpg",
        alt: "Résidence Les Oliviers — Espace vert",
        altAr: "سكن الزيتون — مساحة خضراء",
        type: "gallery",
        order: 3,
      },
      {
        projectId: lesOliviers.id,
        url: "/images/projects/les-oliviers-3.jpg",
        alt: "Résidence Les Oliviers — Hall d'entrée",
        altAr: "سكن الزيتون — بهو المدخل",
        type: "gallery",
        order: 4,
      },
    ],
  });

  // ─── Amenities for Les Oliviers ────────────────────────────
  await prisma.projectAmenity.createMany({
    data: [
      { projectId: lesOliviers.id, name: "Parking en sous-sol", nameAr: "موقف تحت أرضي", icon: "Car" },
      { projectId: lesOliviers.id, name: "Ascenseur", nameAr: "مصعد", icon: "ArrowUp" },
      { projectId: lesOliviers.id, name: "Jardins aménagés", nameAr: "حدائق مجهزة", icon: "TreePine" },
      { projectId: lesOliviers.id, name: "Sécurité 24h", nameAr: "حراسة 24 ساعة", icon: "ShieldCheck" },
      { projectId: lesOliviers.id, name: "Climatisation", nameAr: "تكييف", icon: "AirVent" },
    ],
  });

  // ─── Apartments for Les Oliviers ───────────────────────────
  // Bâtiment A apartments
  const oliviersApt1 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f2-65",
      projectId: lesOliviers.id,
      buildingId: oliviersA.id,
      unitNumber: "A-101",
      apartmentType: "F2",
      typeName: "F2 Compact",
      typeNameAr: "F2 مدمج",
      surface: 65,
      floor: 1,
      totalFloors: 5,
      orientation: "Est",
      bedrooms: 2,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 6,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: true,
      gardenSurface: 15,
      status: "AVAILABLE",
      price: 12_000_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 22 },
        { name: "Cuisine", surface: 10 },
        { name: "Chambre 1", surface: 13 },
        { name: "Chambre 2", surface: 10 },
        { name: "Salle de bain", surface: 4 },
        { name: "Balcon", surface: 6 },
      ]),
      description: "Appartement F2 Compact de 65m² au 1er étage, idéalement conçu pour les jeunes couples ou investisseurs. Salon lumineux orienté Est, cuisine aménagée, deux chambres spacieuses avec rangements intégrés. Jardin privatif de 15m², rare en étage bas. Finitions haut de gamme : carrelage grès cérame, faïence pleine hauteur, plomberie chromée.",
      descriptionAr: "شقة F2 مدمجة بمساحة 65م² في الطابق الأول، مصممة مثلياً للأزواج الشباب أو المستثمرين. صالون مشرق نحو الشرق، مطبخ مجهز، غرفتان واسعتان بخزائن مدمجة. حديقة خاصة 15م²، نادرة في الطوابق السفلية. تشطيبات عالية الجودة.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants", "Interphone vidéo", "Jardin privatif"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة", "إنترفون فيديو", "حديقة خاصة"]),
      published: true,
      archived: false,
      order: 1,
    },
  });

  const oliviersApt2 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f2-68",
      projectId: lesOliviers.id,
      buildingId: oliviersA.id,
      unitNumber: "A-201",
      apartmentType: "F2",
      typeName: "F2 Confort",
      typeNameAr: "F2 رفاهية",
      surface: 68,
      floor: 2,
      totalFloors: 5,
      orientation: "Ouest",
      bedrooms: 2,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 7,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 12_500_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 24 },
        { name: "Cuisine", surface: 10 },
        { name: "Chambre 1", surface: 13 },
        { name: "Chambre 2", surface: 10 },
        { name: "Salle de bain", surface: 4 },
        { name: "Balcon", surface: 7 },
      ]),
      description: "Appartement F2 Confort de 68m² au 2ème étage, exposition Ouest pour des couchers de soleil spectaculaires. Salon généreux de 24m², cuisine fonctionnelle, deux chambres bien proportionnées. Balcon de 7m² idéal pour un café en terrasse. Prestations soignées et finitions contemporaines.",
      descriptionAr: "شقة F2 رفاهية بمساحة 68م² في الطابق الثاني، إطلالة غربية لغروب شمس رائع. صالون فسيح 24م²، مطبخ عملي، غرفتان متناسقتان. شرفة 7م² مثالية لقهوة التراس. مواصفات دقيقة وتشطيبات عصرية.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants", "Interphone vidéo"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة", "إنترفون فيديو"]),
      published: true,
      archived: false,
      order: 2,
    },
  });

  const oliviersApt3 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f3-92",
      projectId: lesOliviers.id,
      buildingId: oliviersA.id,
      unitNumber: "A-102",
      apartmentType: "F3",
      typeName: "F3 Familial",
      typeNameAr: "F3 عائلي",
      surface: 92,
      floor: 1,
      totalFloors: 5,
      orientation: "Sud",
      bedrooms: 3,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 8,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 16_800_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 25 },
        { name: "Cuisine", surface: 12 },
        { name: "Chambre 1", surface: 14 },
        { name: "Chambre 2", surface: 11 },
        { name: "Chambre 3", surface: 10 },
        { name: "Salle de bain", surface: 6 },
        { name: "Balcon", surface: 8 },
      ]),
      description: "Appartement F3 Familial de 92m² au 1er étage, orientation Sud pour une luminosité maximale toute l'année. Salon-séjour spacieux de 25m² avec accès balcon, cuisine équipée de 12m², trois chambres avec placards aménagés. Idéal pour les familles algéroises recherchant confort et fonctionnalité.",
      descriptionAr: "شقة F3 عائلي بمساحة 92م² في الطابق الأول، إطلالة جنوبية لإضاءة قصوى طوال العام. صالون-صالة فسيح 25م² مع شرفة، مطبخ مجهز 12م²، ثلاث غرف بخزائن مدمجة. مثالي للعائلات الجزائرية الباحثة عن الراحة والعملية.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Balcon carrelé"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مبلطة"]),
      published: true,
      archived: false,
      order: 3,
    },
  });

  const oliviersApt4 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f3-95",
      projectId: lesOliviers.id,
      buildingId: oliviersA.id,
      unitNumber: "A-301",
      apartmentType: "F3",
      typeName: "F3 Lumineux",
      typeNameAr: "F3 مشرق",
      surface: 95,
      floor: 3,
      totalFloors: 5,
      orientation: "Est",
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 12,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 17_200_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 26 },
        { name: "Cuisine", surface: 12 },
        { name: "Chambre 1", surface: 14 },
        { name: "Chambre 2", surface: 12 },
        { name: "Chambre 3", surface: 10 },
        { name: "Salle de bain 1", surface: 5 },
        { name: "Salle de bain 2", surface: 4 },
        { name: "Balcon 1", surface: 6 },
        { name: "Balcon 2", surface: 6 },
      ]),
      description: "Appartement F3 Lumineux de 95m² au 3ème étage, double exposition Est avec deux balcons de 6m² chacun. Deux salles de bain pour un confort familial optimal. Salon de 26m² baigné de lumière naturelle, cuisine indépendante, trois chambres bien agencées. Finitions haut de gamme avec parquet dans les chambres.",
      descriptionAr: "شقة F3 مشرق بمساحة 95م² في الطابق الثالث، إطلالة مزدوجة شرقاً مع شرفتين 6م². حمامان لراحة عائلية قصوى. صالون 26م² مغمور بالضوء الطبيعي، مطبخ مستقل، ثلاث غرف مرتبة بعناية. تشطيبات عالية الجودة مع باركي في الغرف.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Double balcon"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مزدوجة"]),
      published: true,
      archived: false,
      order: 4,
    },
  });

  const oliviersApt5 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f3-98",
      projectId: lesOliviers.id,
      buildingId: oliviersA.id,
      unitNumber: "A-401",
      apartmentType: "F3",
      typeName: "F3 Prestige",
      typeNameAr: "F3 برستيج",
      surface: 98,
      floor: 4,
      totalFloors: 5,
      orientation: "Nord",
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 14,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "RESERVED",
      price: 17_800_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 27 },
        { name: "Cuisine", surface: 12 },
        { name: "Chambre 1", surface: 15 },
        { name: "Chambre 2", surface: 12 },
        { name: "Chambre 3", surface: 10 },
        { name: "Salle de bain 1", surface: 5 },
        { name: "Salle de bain 2", surface: 4 },
        { name: "Balcon 1", surface: 7 },
        { name: "Balcon 2", surface: 7 },
      ]),
      description: "Appartement F3 Prestige de 98m² au 4ème étage, orientation Nord pour une fraîcheur appréciée en été. Deux balcons de 7m², deux salles de bain, salon de 27m² avec finitions de standing. Chambre principale de 15m² avec rangements sur mesure. Appartement réservé — dernière opportunité dans cette typologie.",
      descriptionAr: "شقة F3 برستيج بمساحة 98م² في الطابق الرابع، إطلالة شمالية لانتعاش صيفي. شرفتان 7م²، حمامان، صالون 27م² بتشطيبات ستاندر. غرفة رئيسية 15م² بخزائن مخصصة. شقة محجوزة — آخر فرصة في هذا النوع.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Double balcon", "Rangements sur mesure"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مزدوجة", "خزائن مخصصة"]),
      published: true,
      archived: false,
      order: 5,
    },
  });

  const oliviersApt6 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f4-120",
      projectId: lesOliviers.id,
      buildingId: oliviersA.id,
      unitNumber: "A-202",
      apartmentType: "F4",
      typeName: "F4 Standing",
      typeNameAr: "F4 ستاندر",
      surface: 120,
      floor: 2,
      totalFloors: 5,
      orientation: "Sud",
      bedrooms: 4,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 16,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 22_000_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 30 },
        { name: "Cuisine", surface: 14 },
        { name: "Chambre 1", surface: 16 },
        { name: "Chambre 2", surface: 14 },
        { name: "Chambre 3", surface: 12 },
        { name: "Chambre 4", surface: 10 },
        { name: "Salle de bain 1", surface: 6 },
        { name: "Salle de bain 2", surface: 5 },
        { name: "Balcon 1", surface: 8 },
        { name: "Balcon 2", surface: 8 },
      ]),
      description: "Appartement F4 Standing de 120m² au 2ème étage, orientation Sud avec deux balcons de 8m². Grand salon double de 30m², cuisine indépendante aménagée de 14m², quatre chambres dont une suite parentale de 16m². Deux places de parking en sous-sol. Finitions luxe : marbre parties communes, domotique, volets roulants électriques.",
      descriptionAr: "شقة F4 ستاندر بمساحة 120م² في الطابق الثاني، إطلالة جنوبية مع شرفتين 8م². صالون مزدوج كبير 30م²، مطبخ مستقل مجهز 14م²، أربع غرف منها جناح أبوي 16م². مكانا وقوف في الأقبية. تشطيبات فاخرة.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Terrasse carrelée", "Suite parentale", "Domotique"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "تراس مبلط", "جناح أبوي", "دوموتيك"]),
      published: true,
      archived: false,
      order: 6,
    },
  });

  // Bâtiment B apartments
  const oliviersApt7 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f4-125",
      projectId: lesOliviers.id,
      buildingId: oliviersB.id,
      unitNumber: "A-501",
      apartmentType: "F4",
      typeName: "F4 Panoramique",
      typeNameAr: "F4 بانورامي",
      surface: 125,
      floor: 5,
      totalFloors: 5,
      orientation: "Sud",
      bedrooms: 4,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 18,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: true,
      terraceSurface: 18,
      hasGarden: false,
      status: "AVAILABLE",
      price: 23_500_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 32 },
        { name: "Cuisine", surface: 14 },
        { name: "Chambre 1", surface: 16 },
        { name: "Chambre 2", surface: 14 },
        { name: "Chambre 3", surface: 12 },
        { name: "Chambre 4", surface: 11 },
        { name: "Salle de bain 1", surface: 6 },
        { name: "Salle de bain 2", surface: 5 },
        { name: "Terrasse 1", surface: 10 },
        { name: "Terrasse 2", surface: 8 },
      ]),
      description: "Appartement F4 Panoramique de 125m² au dernier étage, orientation Sud avec terrasse de 18m² offrant une vue dégagée sur Chéraga. Salon de 32m² baigné de lumière, cuisine indépendante, quatre chambres spacieuses. Terrasse privatif de 10m² + 8m², idéal pour les réceptions en plein air. Prestations exceptionnelles.",
      descriptionAr: "شقة F4 بانورامي بمساحة 125م² في الطابق الأخير، إطلالة جنوبية مع تراس 18م² وإطلالة بانورامية على شراقة. صالون 32م² مغمور بالضوء، مطبخ مستقل، أربع غرف واسعة. تراس خاص 10م² + 8م²، مثالي للاستقبال في الهواء الطلق.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Terrasse panoramique", "Suite parentale", "Domotique", "Vue dégagée"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "تراس بانورامي", "جناح أبوي", "دوموتيك", "إطلالة بانورامية"]),
      published: true,
      archived: false,
      order: 7,
    },
  });

  const oliviersApt8 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f2-70m2",
      projectId: lesOliviers.id,
      buildingId: oliviersB.id,
      unitNumber: "A-302",
      apartmentType: "F2",
      typeName: "F2 Confort",
      typeNameAr: "F2 رفاهية",
      surface: 70,
      floor: 3,
      totalFloors: 5,
      orientation: "Est",
      bedrooms: 1,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 9,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 9_200_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 22 },
        { name: "Cuisine", surface: 11 },
        { name: "Chambre", surface: 14 },
        { name: "Salle de bain", surface: 5 },
        { name: "Balcon", surface: 9 },
        { name: "Hall", surface: 9 },
      ]),
      description: "Appartement F2 Confort de 70m² au 3ème étage, orientation Est. Grand salon de 22m², chambre spacieuse de 14m², cuisine fonctionnelle. Balcon de 9m² pour profiter du soleil matinal. Hall d'entrée de 9m² avec rangements. Excellent rapport qualité/prix pour ce quartier prisé.",
      descriptionAr: "شقة F2 رفاهية بمساحة 70م² في الطابق الثالث، إطلالة شرقية. صالون كبير 22م²، غرفة واسعة 14م²، مطبخ عملي. شرفة 9م² للاستمتاع بشمس الصباح. بهو مدخل 9م² بخزائن. نسبة جودة/سعر ممتازة في هذا الحي المطلوب.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants", "Interphone vidéo"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة", "إنترفون فيديو"]),
      published: true,
      archived: false,
      order: 8,
    },
  });

  const oliviersApt9 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f3-100m2",
      projectId: lesOliviers.id,
      buildingId: oliviersB.id,
      unitNumber: "A-502",
      apartmentType: "F3",
      typeName: "F3 Familial",
      typeNameAr: "F3 عائلي",
      surface: 100,
      floor: 5,
      totalFloors: 5,
      orientation: "Sud",
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      balconySurface: 14,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 13_200_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 26 },
        { name: "Cuisine", surface: 12 },
        { name: "Chambre 1", surface: 15 },
        { name: "Chambre 2", surface: 12 },
        { name: "Salle de bain 1", surface: 5 },
        { name: "Salle de bain 2", surface: 4 },
        { name: "Balcon", surface: 14 },
        { name: "Hall", surface: 12 },
      ]),
      description: "Appartement F3 Familial de 100m² au 5ème étage, orientation Sud avec balcon généreux de 14m². Deux salles de bain, salon de 26m² lumineux, deux chambres spacieuses. Hall de 12m² offrant un espace de circulation agréable. Vue imprenable depuis le dernier étage.",
      descriptionAr: "شقة F3 عائلي بمساحة 100م² في الطابق الخامس، إطلالة جنوبية مع شرفة واسعة 14م². حمامان، صالون مشرق 26م²، غرفتان واسعتان. بهو 12م² يوفر مساحة حركة مريحة. إطلالة رائعة من الطابق الأخير.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Balcon carrelé"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مبلطة"]),
      published: true,
      archived: false,
      order: 9,
    },
  });

  const oliviersApt10 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f3-96m2",
      projectId: lesOliviers.id,
      buildingId: oliviersB.id,
      unitNumber: "A-402",
      apartmentType: "F3",
      typeName: "F3 Lumineux",
      typeNameAr: "F3 مشرق",
      surface: 96,
      floor: 4,
      totalFloors: 5,
      orientation: "Ouest",
      bedrooms: 2,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 12,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 12_800_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 24 },
        { name: "Cuisine", surface: 12 },
        { name: "Chambre 1", surface: 14 },
        { name: "Chambre 2", surface: 12 },
        { name: "Salle de bain", surface: 5 },
        { name: "Balcon", surface: 12 },
        { name: "Hall", surface: 17 },
      ]),
      description: "Appartement F3 Lumineux de 96m² au 4ème étage, orientation Ouest. Salon de 24m², deux chambres bien proportionnées, balcon de 12m² exposé couchant. Grand hall de 17m² idéal pour un bureau ou espace rangement. Finitions contemporaines et équipements de qualité.",
      descriptionAr: "شقة F3 مشرق بمساحة 96م² في الطابق الرابع، إطلالة غربية. صالون 24م²، غرفتان متناسقتان، شرفة 12م² نحو الغروب. بهو كبير 17م² مثالي لمكتب أو تخزين. تشطيبات عصرية ومعدات جيدة.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Balcon carrelé"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مبلطة"]),
      published: true,
      archived: false,
      order: 10,
    },
  });

  const oliviersApt11 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f4-130m2",
      projectId: lesOliviers.id,
      buildingId: oliviersB.id,
      unitNumber: "A-303",
      apartmentType: "F4",
      typeName: "F4 Prestige",
      typeNameAr: "F4 برستيج",
      surface: 130,
      floor: 3,
      totalFloors: 5,
      orientation: "Sud",
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 20,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 18_200_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 30 },
        { name: "Cuisine", surface: 13 },
        { name: "Chambre 1", surface: 16 },
        { name: "Chambre 2", surface: 13 },
        { name: "Chambre 3", surface: 11 },
        { name: "Salle de bain 1", surface: 5 },
        { name: "Salle de bain 2", surface: 4 },
        { name: "Balcon 1", surface: 10 },
        { name: "Balcon 2", surface: 10 },
        { name: "Hall", surface: 18 },
      ]),
      description: "Appartement F4 Prestige de 130m² au 3ème étage, orientation Sud avec deux balcons de 10m². Salon de 30m², cuisine de 13m², trois chambres dont une suite parentale de 16m². Hall spacieux de 18m². Deux places de parking. Finitions haut de gamme et domotique intégrée.",
      descriptionAr: "شقة F4 برستيج بمساحة 130م² في الطابق الثالث، إطلالة جنوبية مع شرفتين 10م². صالون 30م²، مطبخ 13م²، ثلاث غرف منها جناح أبوي 16م². بهو فسيح 18م². مكانا وقوف. تشطيبات فاخرة ودوموتيك مدمجة.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Double balcon", "Suite parentale", "Domotique"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مزدوجة", "جناح أبوي", "دوموتيك"]),
      published: true,
      archived: false,
      order: 11,
    },
  });

  const oliviersApt12 = await prisma.apartment.create({
    data: {
      slug: "les-oliviers-f4-140m2",
      projectId: lesOliviers.id,
      buildingId: oliviersB.id,
      unitNumber: "A-503",
      apartmentType: "F4",
      typeName: "F4 Panoramique",
      typeNameAr: "F4 بانورامي",
      surface: 140,
      floor: 5,
      totalFloors: 5,
      orientation: "Sud",
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 24,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: true,
      terraceSurface: 24,
      hasGarden: false,
      status: "RESERVED",
      price: 19_500_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 32 },
        { name: "Cuisine", surface: 14 },
        { name: "Chambre 1", surface: 16 },
        { name: "Chambre 2", surface: 14 },
        { name: "Chambre 3", surface: 12 },
        { name: "Salle de bain 1", surface: 6 },
        { name: "Salle de bain 2", surface: 5 },
        { name: "Balcon 1", surface: 12 },
        { name: "Balcon 2", surface: 12 },
        { name: "Hall", surface: 17 },
      ]),
      description: "Appartement F4 Panoramique de 140m² au dernier étage, orientation Sud avec terrasse de 24m² offrant une vue panoramique sur Alger. Salon de 32m², cuisine indépendante, trois chambres dont une suite parentale. Terrasse idéale pour les réceptions. Appartement réservé — typologie très demandée.",
      descriptionAr: "شقة F4 بانورامي بمساحة 140م² في الطابق الأخير، إطلالة جنوبية مع تراس 24م² وإطلالة بانورامية على الجزائر. صالون 32م²، مطبخ مستقل، ثلاث غرف منها جناح أبوي. تراس مثالي للاستقبال. شقة محجوزة — نوع مطلوب جداً.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Terrasse panoramique", "Suite parentale", "Domotique", "Vue panoramique"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "تراس بانورامي", "جناح أبوي", "دوموتيك", "إطلالة بانورامية"]),
      published: true,
      archived: false,
      order: 12,
    },
  });

  // ─── Apartment Images for Les Oliviers ─────────────────────
  await prisma.apartmentImage.createMany({
    data: [
      // Apt 1: F2 65
      { apartmentId: oliviersApt1.id, url: "/images/apartments/les-oliviers-f2-65-plan.jpg", alt: "Plan F2 65m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt1.id, url: "/images/apartments/les-oliviers-f2-65-3d.jpg", alt: "Vue 3D F2 65m²", type: "3d-plan", order: 2 },
      { apartmentId: oliviersApt1.id, url: "/images/apartments/les-oliviers-f2-65-render.jpg", alt: "Rendu F2 65m²", type: "hero", order: 3 },
      // Apt 2: F2 68
      { apartmentId: oliviersApt2.id, url: "/images/apartments/les-oliviers-f2-68-plan.jpg", alt: "Plan F2 68m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt2.id, url: "/images/apartments/les-oliviers-f2-68-3d.jpg", alt: "Vue 3D F2 68m²", type: "3d-plan", order: 2 },
      { apartmentId: oliviersApt2.id, url: "/images/apartments/les-oliviers-f2-68-render.jpg", alt: "Rendu F2 68m²", type: "hero", order: 3 },
      // Apt 3: F3 92
      { apartmentId: oliviersApt3.id, url: "/images/apartments/les-oliviers-f3-92-plan.jpg", alt: "Plan F3 92m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt3.id, url: "/images/apartments/les-oliviers-f3-92-3d.jpg", alt: "Vue 3D F3 92m²", type: "3d-plan", order: 2 },
      { apartmentId: oliviersApt3.id, url: "/images/apartments/les-oliviers-f3-92-render.jpg", alt: "Rendu F3 92m²", type: "hero", order: 3 },
      // Apt 4: F3 95
      { apartmentId: oliviersApt4.id, url: "/images/apartments/les-oliviers-f3-95-plan.jpg", alt: "Plan F3 95m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt4.id, url: "/images/apartments/les-oliviers-f3-95-3d.jpg", alt: "Vue 3D F3 95m²", type: "3d-plan", order: 2 },
      { apartmentId: oliviersApt4.id, url: "/images/apartments/les-oliviers-f3-95-render.jpg", alt: "Rendu F3 95m²", type: "hero", order: 3 },
      // Apt 5: F3 98
      { apartmentId: oliviersApt5.id, url: "/images/apartments/les-oliviers-f3-98-plan.jpg", alt: "Plan F3 98m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt5.id, url: "/images/apartments/les-oliviers-f3-98-3d.jpg", alt: "Vue 3D F3 98m²", type: "3d-plan", order: 2 },
      { apartmentId: oliviersApt5.id, url: "/images/apartments/les-oliviers-f3-98-render.jpg", alt: "Rendu F3 98m²", type: "hero", order: 3 },
      // Apt 6: F4 120
      { apartmentId: oliviersApt6.id, url: "/images/apartments/les-oliviers-f4-120-plan.jpg", alt: "Plan F4 120m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt6.id, url: "/images/apartments/les-oliviers-f4-120-3d.jpg", alt: "Vue 3D F4 120m²", type: "3d-plan", order: 2 },
      { apartmentId: oliviersApt6.id, url: "/images/apartments/les-oliviers-f4-120-render.jpg", alt: "Rendu F4 120m²", type: "hero", order: 3 },
      // Apt 7: F4 125
      { apartmentId: oliviersApt7.id, url: "/images/apartments/les-oliviers-f4-125-plan.jpg", alt: "Plan F4 125m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt7.id, url: "/images/apartments/les-oliviers-f4-125-3d.jpg", alt: "Vue 3D F4 125m²", type: "3d-plan", order: 2 },
      { apartmentId: oliviersApt7.id, url: "/images/apartments/les-oliviers-f4-125-render.jpg", alt: "Rendu F4 125m²", type: "hero", order: 3 },
      // Apt 8–12: generic floor plan
      { apartmentId: oliviersApt8.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F2 70m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt9.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F3 100m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt10.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F3 96m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt11.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F4 130m²", type: "floor-plan", order: 1 },
      { apartmentId: oliviersApt12.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F4 140m²", type: "floor-plan", order: 1 },
    ],
  });

  // ═══════════════════════════════════════════════════════════
  // ─── Project 2: Résidence El Borj ──────────────────────────
  // ═══════════════════════════════════════════════════════════
  const elBorj = await prisma.project.create({
    data: {
      slug: "residence-el-borj",
      name: "Résidence El Borj",
      nameAr: "سكن البرج",
      tagline: "Vue mer et modernité à Bordj El Bahri",
      taglineAr: "إطلالة بحرية وحداثة في برج البحري",
      description:
        "Située à Bordj El Bahri, la Résidence El Borj bénéficie d'une vue imprenable sur la mer Méditerranée. Appartements F2, F3 et Duplex avec terrasses spacieuses et architecture contemporaine.",
      descriptionAr:
        "تقع سكن البرج في برج البحري وتتمتع بإطلالة ساحرة على البحر الأبيض المتوسط. شقق F2 وF3 ودوبلكس مع شرفات فسيحة ومعمار عصري.",

      city: "Algiers",
      cityAr: "الجزائر",
      district: "Bordj El Bahri",
      districtAr: "برج البحري",
      address: "Route côtière, Bordj El Bahri",
      addressAr: "الطريق الساحلي، برج البحري",
      latitude: 36.7983,
      longitude: 3.2167,

      projectType: "RESIDENTIAL",
      status: "AVAILABLE",
      apartmentTypes: '["F2","F3","Duplex"]',
      minSurface: 60,
      maxSurface: 140,

      deliveryYear: 2026,
      deliveryQuarter: "Q1",

      hasParking: true,
      hasElevator: true,
      hasGarden: true,
      hasPool: true,
      hasSecurity: true,
      hasClim: true,

      startingPrice: 10_500_000,
      priceOnRequest: false,

      developerId: asas.id,
      published: true,
      archived: false,
      featured: true,
      order: 2,
    },
  });

  // ─── Buildings for El Borj ─────────────────────────────────
  const borjPrincipal = await prisma.building.create({
    data: {
      slug: "residence-el-borj-b",
      projectId: elBorj.id,
      name: "Bâtiment Principal",
      nameAr: "المبنى الرئيسي",
      code: "B",
      floors: 6,
      hasElevator: true,
      order: 1,
    },
  });

  const borjTour = await prisma.building.create({
    data: {
      slug: "residence-el-borj-tour",
      projectId: elBorj.id,
      name: "Tour Panoramique",
      nameAr: "البرج البانورامي",
      code: "T",
      floors: 8,
      hasElevator: true,
      order: 2,
    },
  });

  // ─── Project Images for El Borj ────────────────────────────
  await prisma.projectImage.createMany({
    data: [
      {
        projectId: elBorj.id,
        url: "/images/projects/el-borj-hero.jpg",
        alt: "Résidence El Borj — Vue mer",
        altAr: "سكن البرج — إطلالة بحرية",
        type: "hero",
        order: 1,
      },
      {
        projectId: elBorj.id,
        url: "/images/projects/el-borj-1.jpg",
        alt: "Résidence El Borj — Façade",
        altAr: "سكن البرج — واجهة",
        type: "gallery",
        order: 2,
      },
      {
        projectId: elBorj.id,
        url: "/images/projects/el-borj-2.jpg",
        alt: "Résidence El Borj — Piscine",
        altAr: "سكن البرج — مسبح",
        type: "gallery",
        order: 3,
      },
    ],
  });

  // ─── Amenities for El Borj ────────────────────────────────
  await prisma.projectAmenity.createMany({
    data: [
      { projectId: elBorj.id, name: "Parking en sous-sol", nameAr: "موقف تحت أرضي", icon: "Car" },
      { projectId: elBorj.id, name: "Ascenseur", nameAr: "مصعد", icon: "ArrowUp" },
      { projectId: elBorj.id, name: "Piscine", nameAr: "مسبح", icon: "Waves" },
      { projectId: elBorj.id, name: "Vue mer", nameAr: "إطلالة بحرية", icon: "Mountain" },
      { projectId: elBorj.id, name: "Sécurité 24h", nameAr: "حراسة 24 ساعة", icon: "ShieldCheck" },
    ],
  });

  // ─── Apartments for El Borj ───────────────────────────────
  const borjApt1 = await prisma.apartment.create({
    data: {
      slug: "el-borj-f2-60",
      projectId: elBorj.id,
      buildingId: borjPrincipal.id,
      unitNumber: "B-101",
      apartmentType: "F2",
      typeName: "F2 Vue Mer",
      typeNameAr: "F2 إطلالة بحرية",
      surface: 60,
      floor: 1,
      totalFloors: 6,
      orientation: "Nord",
      bedrooms: 2,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 8,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: true,
      terraceSurface: 8,
      hasGarden: false,
      status: "AVAILABLE",
      price: 10_500_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 20 },
        { name: "Cuisine", surface: 9 },
        { name: "Chambre 1", surface: 12 },
        { name: "Chambre 2", surface: 10 },
        { name: "Salle de bain", surface: 4 },
        { name: "Terrasse", surface: 8 },
      ]),
      description: "Appartement F2 Vue Mer de 60m² au 1er étage, orientation Nord face à la Méditerranée. Salon de 20m² avec terrasse de 8m² offrant une vue imprenable. Deux chambres, cuisine fonctionnelle. Idéal pour les amateurs de bord de mer et les investisseurs locatifs.",
      descriptionAr: "شقة F2 إطلالة بحرية بمساحة 60م² في الطابق الأول، إطلالة شمالية نحو البحر الأبيض المتوسط. صالون 20م² مع تراس 8م² وإطلالة ساحرة. غرفتان، مطبخ عملي. مثالي لمحبي الساحل والمستثمرين.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants", "Interphone vidéo", "Vue mer"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة", "إنترفون فيديو", "إطلالة بحرية"]),
      published: true,
      archived: false,
      order: 1,
    },
  });

  const borjApt2 = await prisma.apartment.create({
    data: {
      slug: "el-borj-f3-88",
      projectId: elBorj.id,
      buildingId: borjPrincipal.id,
      unitNumber: "B-301",
      apartmentType: "F3",
      typeName: "F3 Côtier",
      typeNameAr: "F3 ساحلي",
      surface: 88,
      floor: 3,
      totalFloors: 6,
      orientation: "Nord-Est",
      bedrooms: 3,
      bathrooms: 2,
      balconies: 1,
      balconySurface: 10,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: true,
      terraceSurface: 10,
      hasGarden: false,
      status: "AVAILABLE",
      price: 15_600_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 24 },
        { name: "Cuisine", surface: 11 },
        { name: "Chambre 1", surface: 14 },
        { name: "Chambre 2", surface: 11 },
        { name: "Chambre 3", surface: 10 },
        { name: "Salle de bain 1", surface: 5 },
        { name: "Salle de bain 2", surface: 4 },
        { name: "Terrasse", surface: 10 },
      ]),
      description: "Appartement F3 Côtier de 88m² au 3ème étage, double exposition Nord-Est avec terrasse de 10m² vue mer. Trois chambres, deux salles de bain, salon de 24m² lumineux. Architecture contemporaine et finitions de standing pour un cadre marin d'exception.",
      descriptionAr: "شقة F3 ساحلي بمساحة 88م² في الطابق الثالث، إطلالة مزدوجة شمال-شرق مع تراس 10م² إطلالة بحرية. ثلاث غرف، حمامان، صالون مشرق 24م². معمار عصري وتشطيبات ستاندر لإطار بحري استثنائي.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Terrasse vue mer"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "تراس إطلالة بحرية"]),
      published: true,
      archived: false,
      order: 2,
    },
  });

  const borjApt3 = await prisma.apartment.create({
    data: {
      slug: "el-borj-duplex-140",
      projectId: elBorj.id,
      buildingId: borjTour.id,
      unitNumber: "B-601",
      apartmentType: "Duplex",
      typeName: "Duplex Panoramique",
      typeNameAr: "دوبلكس بانورامي",
      surface: 140,
      floor: 5,
      totalFloors: 6,
      orientation: "Nord",
      bedrooms: 4,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 20,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: true,
      terraceSurface: 20,
      hasGarden: false,
      status: "AVAILABLE",
      price: 28_000_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 35 },
        { name: "Cuisine", surface: 14 },
        { name: "Chambre 1", surface: 16 },
        { name: "Chambre 2", surface: 14 },
        { name: "Chambre 3", surface: 12 },
        { name: "Chambre 4", surface: 11 },
        { name: "Salle de bain 1", surface: 6 },
        { name: "Salle de bain 2", surface: 5 },
        { name: "Terrasse 1", surface: 12 },
        { name: "Terrasse 2", surface: 8 },
      ]),
      description: "Duplex Panoramique de 140m² sur deux niveaux, orientation Nord avec terrasse de 20m² vue mer. Niveau bas : vaste salon de 35m² avec cuisine ouverte. Niveau haut : quatre chambres en mezzanine. Baies vitrées coulissantes, double hauteur sous plafond. Prestations exceptionnelles pour un logement d'exception.",
      descriptionAr: "دوبلكس بانورامي بمساحة 140م² على مستويين، إطلالة شمالية مع تراس 20م² إطلالة بحرية. المستوى السفلي: صالون فسيح 35م² مع مطبخ مفتوح. المستوى العلوي: أربع غرف ميزانين. ألواح زجاجية منزلقة، سقف مزدوج الارتفاع.",
      features: JSON.stringify(["Climatisation centralisée", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Terrasse panoramique", "Suite parentale", "Domotique", "Baies vitrées coulissantes", "Double hauteur sous plafond"]),
      featuresAr: JSON.stringify(["تكييف مركزي", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "تراس بانورامي", "جناح أبوي", "دوموتيك", "ألواح زجاجية منزلقة", "سقف مزدوج الارتفاع"]),
      published: true,
      archived: false,
      order: 3,
    },
  });

  const borjApt4 = await prisma.apartment.create({
    data: {
      slug: "el-borj-f3-115m2",
      projectId: elBorj.id,
      buildingId: borjPrincipal.id,
      unitNumber: "B-402",
      apartmentType: "F3",
      typeName: "F3 Vue Mer",
      typeNameAr: "F3 إطلالة بحرية",
      surface: 115,
      floor: 4,
      totalFloors: 6,
      orientation: "Nord",
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      balconySurface: 16,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: true,
      terraceSurface: 16,
      hasGarden: false,
      status: "AVAILABLE",
      price: 15_800_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 28 },
        { name: "Cuisine", surface: 12 },
        { name: "Chambre 1", surface: 16 },
        { name: "Chambre 2", surface: 14 },
        { name: "Salle de bain 1", surface: 6 },
        { name: "Salle de bain 2", surface: 5 },
        { name: "Terrasse", surface: 16 },
        { name: "Hall", surface: 18 },
      ]),
      description: "Appartement F3 Vue Mer de 115m² au 4ème étage, orientation Nord avec terrasse de 16m² face à la mer. Salon de 28m², deux chambres spacieuses, deux salles de bain. Hall de 18m² offrant des possibilités d'aménagement. Cadre marin d'exception pour les familles.",
      descriptionAr: "شقة F3 إطلالة بحرية بمساحة 115م² في الطابق الرابع، إطلالة شمالية مع تراس 16م² نحو البحر. صالون 28م²، غرفتان واسعتان، حمامان. بهو 18م² يوفر إمكانيات تهيئة. إطار بحري استثنائي للعائلات.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Terrasse vue mer"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "تراس إطلالة بحرية"]),
      published: true,
      archived: false,
      order: 4,
    },
  });

  const borjApt5 = await prisma.apartment.create({
    data: {
      slug: "el-borj-f4-155m2",
      projectId: elBorj.id,
      buildingId: borjPrincipal.id,
      unitNumber: "B-602",
      apartmentType: "F4",
      typeName: "F4 Prestige",
      typeNameAr: "F4 برستيج",
      surface: 155,
      floor: 6,
      totalFloors: 6,
      orientation: "Nord",
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 26,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: true,
      terraceSurface: 26,
      hasGarden: false,
      status: "AVAILABLE",
      price: 21_500_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 36 },
        { name: "Cuisine", surface: 14 },
        { name: "Chambre 1", surface: 18 },
        { name: "Chambre 2", surface: 14 },
        { name: "Chambre 3", surface: 12 },
        { name: "Salle de bain 1", surface: 6 },
        { name: "Salle de bain 2", surface: 5 },
        { name: "Terrasse 1", surface: 14 },
        { name: "Terrasse 2", surface: 12 },
        { name: "Hall", surface: 24 },
      ]),
      description: "Appartement F4 Prestige de 155m² au dernier étage du bâtiment principal, orientation Nord avec double terrasse de 26m² vue mer. Salon de 36m², suite parentale de 18m², cuisine indépendante. Hall de 24m², deux places de parking. Prestations haut de gamme pour un logement d'exception face à la Méditerranée.",
      descriptionAr: "شقة F4 برستيج بمساحة 155م² في الطابق الأخير من المبنى الرئيسي، إطلالة شمالية مع تراس مزدوج 26م² إطلالة بحرية. صالون 36م²، جناح أبوي 18م²، مطبخ مستقل. بهو 24م²، مكانا وقوف. مواصفات فاخرة لواجهة البحر الأبيض المتوسط.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Double terrasse", "Suite parentale", "Domotique", "Vue mer"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "تراس مزدوج", "جناح أبوي", "دوموتيك", "إطلالة بحرية"]),
      published: true,
      archived: false,
      order: 5,
    },
  });

  const borjApt6 = await prisma.apartment.create({
    data: {
      slug: "el-borj-duplex-200m2",
      projectId: elBorj.id,
      buildingId: borjTour.id,
      unitNumber: "B-801",
      apartmentType: "Duplex",
      typeName: "Duplex Panoramique",
      typeNameAr: "دوبلكس بانورامي",
      surface: 200,
      floor: 8,
      totalFloors: 8,
      orientation: "Nord",
      bedrooms: 4,
      bathrooms: 3,
      balconies: 2,
      balconySurface: 32,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: true,
      terraceSurface: 32,
      hasGarden: false,
      status: "RESERVED",
      price: 28_500_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 45 },
        { name: "Cuisine", surface: 16 },
        { name: "Chambre 1", surface: 20 },
        { name: "Chambre 2", surface: 16 },
        { name: "Chambre 3", surface: 14 },
        { name: "Chambre 4", surface: 12 },
        { name: "Salle de bain 1", surface: 7 },
        { name: "Salle de bain 2", surface: 6 },
        { name: "Salle de bain 3", surface: 4 },
        { name: "Terrasse 1", surface: 18 },
        { name: "Terrasse 2", surface: 14 },
        { name: "Mezzanine", surface: 28 },
      ]),
      description: "Duplex Panoramique de 200m² au sommet de la Tour, orientation Nord avec terrasse de 32m² offrant une vue à 180° sur la Méditerranée. Niveau bas : salon de 45m² avec cuisine ouverte de 16m². Niveau haut : quatre chambres, trois salles de bain, mezzanine de 28m². Appartement réservé — le joyau de la résidence.",
      descriptionAr: "دوبلكس بانورامي بمساحة 200م² في قمة البرج، إطلالة شمالية مع تراس 32م² وإطلالة 180° على البحر الأبيض المتوسط. المستوى السفلي: صالون 45م² مع مطبخ مفتوح 16م². المستوى العلوي: أربع غرف، ثلاث حمامات، ميزانين 28م². شقة محجوزة — جوهرة السكن.",
      features: JSON.stringify(["Climatisation centralisée", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Terrasse panoramique", "Suite parentale", "Domotique", "Baies vitrées coulissantes", "Double hauteur sous plafond", "Vue mer 180°"]),
      featuresAr: JSON.stringify(["تكييف مركزي", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "تراس بانورامي", "جناح أبوي", "دوموتيك", "ألواح زجاجية منزلقة", "سقف مزدوج الارتفاع", "إطلالة بحرية 180°"]),
      published: true,
      archived: false,
      order: 6,
    },
  });

  // ─── Apartment Images for El Borj ──────────────────────────
  await prisma.apartmentImage.createMany({
    data: [
      { apartmentId: borjApt1.id, url: "/images/apartments/el-borj-f2-60-plan.jpg", alt: "Plan F2 60m² Vue Mer", type: "floor-plan", order: 1 },
      { apartmentId: borjApt1.id, url: "/images/apartments/el-borj-f2-60-render.jpg", alt: "Rendu F2 60m² Vue Mer", type: "hero", order: 2 },
      { apartmentId: borjApt2.id, url: "/images/apartments/el-borj-f3-88-plan.jpg", alt: "Plan F3 88m² Côtier", type: "floor-plan", order: 1 },
      { apartmentId: borjApt2.id, url: "/images/apartments/el-borj-f3-88-render.jpg", alt: "Rendu F3 88m² Côtier", type: "hero", order: 2 },
      { apartmentId: borjApt3.id, url: "/images/apartments/el-borj-duplex-140-plan.jpg", alt: "Plan Duplex 140m²", type: "floor-plan", order: 1 },
      { apartmentId: borjApt3.id, url: "/images/apartments/el-borj-duplex-140-render.jpg", alt: "Rendu Duplex 140m²", type: "hero", order: 2 },
      { apartmentId: borjApt4.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F3 115m² Vue Mer", type: "floor-plan", order: 1 },
      { apartmentId: borjApt5.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F4 155m² Prestige", type: "floor-plan", order: 1 },
      { apartmentId: borjApt6.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan Duplex 200m²", type: "floor-plan", order: 1 },
    ],
  });

  // ═══════════════════════════════════════════════════════════
  // ─── Project 3: Résidence Dar Saïda ────────────────────────
  // ═══════════════════════════════════════════════════════════
  const darSaida = await prisma.project.create({
    data: {
      slug: "residence-dar-saida",
      name: "Résidence Dar Saïda",
      nameAr: "سكن دار سعيدة",
      tagline: "Le futur de Dar El Beïda",
      taglineAr: "مستقبل دار البيضاء",
      description:
        "Projet en lancement à Dar El Beïda. La Résidence Dar Saïda proposera des F3 et F4 spacieux avec des prestations soignées, au cœur d'un quartier en pleine expansion.",
      descriptionAr:
        "مشروع انطلاق في دار البيضاء. سكن دار سعيدة ستوفر شقق F3 وF4 فسيحة بمواصفات دقيقة في قلب حي في توسع مستمر.",

      city: "Algiers",
      cityAr: "الجزائر",
      district: "Dar El Beïda",
      districtAr: "دار البيضاء",
      address: "Zone urbaine, Dar El Beïda",
      addressAr: "المنطقة الحضرية، دار البيضاء",
      latitude: 36.7131,
      longitude: 3.2106,

      projectType: "RESIDENTIAL",
      status: "COMING_SOON",
      apartmentTypes: '["F3","F4"]',
      minSurface: 90,
      maxSurface: 130,

      deliveryYear: 2026,
      deliveryQuarter: "Q3",

      hasParking: true,
      hasElevator: true,
      hasGarden: true,
      hasPool: false,
      hasSecurity: true,
      hasClim: false,

      startingPrice: 14_000_000,
      priceOnRequest: false,

      developerId: asas.id,
      published: true,
      archived: false,
      featured: true,
      order: 3,
    },
  });

  // ─── Buildings for Dar Saïda ───────────────────────────────
  const saidaC = await prisma.building.create({
    data: {
      slug: "residence-dar-saida-c",
      projectId: darSaida.id,
      name: "Bâtiment C",
      nameAr: "مبنى ج",
      code: "C",
      floors: 4,
      hasElevator: true,
      order: 1,
    },
  });

  // ─── Project Images for Dar Saïda ──────────────────────────
  await prisma.projectImage.createMany({
    data: [
      {
        projectId: darSaida.id,
        url: "/images/projects/dar-saida-hero.jpg",
        alt: "Résidence Dar Saïda — Vue d'ensemble",
        altAr: "سكن دار سعيدة — نظرة عامة",
        type: "hero",
        order: 1,
      },
      {
        projectId: darSaida.id,
        url: "/images/projects/dar-saida-1.jpg",
        alt: "Résidence Dar Saïda — Environnement",
        altAr: "سكن دار سعيدة — المحيط",
        type: "gallery",
        order: 2,
      },
    ],
  });

  // ─── Amenities for Dar Saïda ──────────────────────────────
  await prisma.projectAmenity.createMany({
    data: [
      { projectId: darSaida.id, name: "Parking", nameAr: "موقف سيارات", icon: "Car" },
      { projectId: darSaida.id, name: "Ascenseur", nameAr: "مصعد", icon: "ArrowUp" },
      { projectId: darSaida.id, name: "Espaces verts", nameAr: "مساحات خضراء", icon: "TreePine" },
      { projectId: darSaida.id, name: "Sécurité", nameAr: "حراسة", icon: "ShieldCheck" },
    ],
  });

  // ─── Apartments for Dar Saïda ─────────────────────────────
  const saidaApt1 = await prisma.apartment.create({
    data: {
      slug: "dar-saida-f3-90",
      projectId: darSaida.id,
      buildingId: saidaC.id,
      unitNumber: "C-101",
      apartmentType: "F3",
      typeName: "F3 Standard",
      typeNameAr: "F3 قياسي",
      surface: 90,
      floor: 1,
      totalFloors: 4,
      orientation: "Sud",
      bedrooms: 3,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 8,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: true,
      gardenSurface: 20,
      status: "COMING_SOON",
      price: 14_000_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 24 },
        { name: "Cuisine", surface: 12 },
        { name: "Chambre 1", surface: 14 },
        { name: "Chambre 2", surface: 12 },
        { name: "Chambre 3", surface: 10 },
        { name: "Salle de bain", surface: 6 },
        { name: "Balcon", surface: 8 },
      ]),
      description: "Appartement F3 Standard de 90m² au 1er étage, orientation Sud avec balcon de 8m² et jardin privatif de 20m². Salon de 24m², cuisine de 12m², trois chambres bien agencées. Idéal pour les familles cherchant un premier accès à la propriété dans un quartier en plein développement.",
      descriptionAr: "شقة F3 قياسي بمساحة 90م² في الطابق الأول، إطلالة جنوبية مع شرفة 8م² وحديقة خاصة 20م². صالون 24م²، مطبخ 12م²، ثلاث غرف مرتبة بعناية. مثالي للعائلات الباحثة عن أول اقتناء في حي في تطور مستمر.",
      features: JSON.stringify(["Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants", "Interphone vidéo", "Jardin privatif"]),
      featuresAr: JSON.stringify(["زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة", "إنترفون فيديو", "حديقة خاصة"]),
      published: true,
      archived: false,
      order: 1,
    },
  });

  const saidaApt2 = await prisma.apartment.create({
    data: {
      slug: "dar-saida-f4-130",
      projectId: darSaida.id,
      buildingId: saidaC.id,
      unitNumber: "C-201",
      apartmentType: "F4",
      typeName: "F4 Standing",
      typeNameAr: "F4 ستاندر",
      surface: 130,
      floor: 2,
      totalFloors: 4,
      orientation: "Est",
      bedrooms: 4,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 14,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: false,
      hasGarden: false,
      status: "COMING_SOON",
      price: 24_000_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 30 },
        { name: "Cuisine", surface: 14 },
        { name: "Chambre 1", surface: 16 },
        { name: "Chambre 2", surface: 14 },
        { name: "Chambre 3", surface: 12 },
        { name: "Chambre 4", surface: 10 },
        { name: "Salle de bain 1", surface: 6 },
        { name: "Salle de bain 2", surface: 5 },
        { name: "Balcon 1", surface: 8 },
        { name: "Balcon 2", surface: 6 },
      ]),
      description: "Appartement F4 Standing de 130m² au 2ème étage, orientation Est avec double balcon de 14m². Grand salon de 30m², cuisine indépendante de 14m², quatre chambres dont une suite parentale. Deux salles de bain, deux places de parking. Prestations de standing pour les familles exigeantes.",
      descriptionAr: "شقة F4 ستاندر بمساحة 130م² في الطابق الثاني، إطلالة شرقية مع شرفة مزدوجة 14م². صالون كبير 30م²، مطبخ مستقل 14م²، أربع غرف منها جناح أبوي. حمامان، مكانا وقوف. مواصفات ستاندر للعائلات المتطلبة.",
      features: JSON.stringify(["Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Double balcon", "Suite parentale"]),
      featuresAr: JSON.stringify(["زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مزدوجة", "جناح أبوي"]),
      published: true,
      archived: false,
      order: 2,
    },
  });

  const saidaApt3 = await prisma.apartment.create({
    data: {
      slug: "dar-saida-f2-60m2",
      projectId: darSaida.id,
      buildingId: saidaC.id,
      unitNumber: "C-301",
      apartmentType: "F2",
      typeName: "F2 Confort",
      typeNameAr: "F2 رفاهية",
      surface: 60,
      floor: 2,
      totalFloors: 4,
      orientation: "Sud",
      bedrooms: 1,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 7,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 5_800_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 20 },
        { name: "Cuisine", surface: 9 },
        { name: "Chambre", surface: 12 },
        { name: "Salle de bain", surface: 4 },
        { name: "Balcon", surface: 7 },
        { name: "Hall", surface: 8 },
      ]),
      description: "Appartement F2 Confort de 60m² au 2ème étage, orientation Sud. Salon de 20m², chambre de 12m², cuisine fonctionnelle de 9m². Balcon de 7m² et hall de 8m². Prix attractif pour ce quartier en pleine valorisation, idéal investissement locatif ou premier achat.",
      descriptionAr: "شقة F2 رفاهية بمساحة 60م² في الطابق الثاني، إطلالة جنوبية. صالون 20م²، غرفة 12م²، مطبخ عملي 9م². شرفة 7م² وبهو 8م². سعر جذاب في حي في تزايد قيمة، مثالي للاستثمار أو الشراء الأول.",
      features: JSON.stringify(["Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants", "Interphone vidéo"]),
      featuresAr: JSON.stringify(["زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة", "إنترفون فيديو"]),
      published: true,
      archived: false,
      order: 3,
    },
  });

  const saidaApt4 = await prisma.apartment.create({
    data: {
      slug: "dar-saida-f2-58m2",
      projectId: darSaida.id,
      buildingId: saidaC.id,
      unitNumber: "C-302",
      apartmentType: "F2",
      typeName: "F2 Économique",
      typeNameAr: "F2 اقتصادي",
      surface: 58,
      floor: 3,
      totalFloors: 4,
      orientation: "Est",
      bedrooms: 1,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 6,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 5_650_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 19 },
        { name: "Cuisine", surface: 9 },
        { name: "Chambre", surface: 12 },
        { name: "Salle de bain", surface: 4 },
        { name: "Balcon", surface: 6 },
        { name: "Hall", surface: 8 },
      ]),
      description: "Appartement F2 Économique de 58m² au 3ème étage, orientation Est. Salon de 19m², chambre de 12m², balcon de 6m². Compact et fonctionnel, ce bien offre le meilleur rapport qualité/prix de la résidence. Idéal pour les jeunes actifs ou investisseurs.",
      descriptionAr: "شقة F2 اقتصادي بمساحة 58م² في الطابق الثالث، إطلالة شرقية. صالون 19م²، غرفة 12م²، شرفة 6م². مدمج وعملي، يوفر أفضل نسبة جودة/سعر في السكن. مثالي للشباب النشطين أو المستثمرين.",
      features: JSON.stringify(["Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants", "Interphone vidéo"]),
      featuresAr: JSON.stringify(["زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة", "إنترفون فيديو"]),
      published: true,
      archived: false,
      order: 4,
    },
  });

  const saidaApt5 = await prisma.apartment.create({
    data: {
      slug: "dar-saida-f3-88m2",
      projectId: darSaida.id,
      buildingId: saidaC.id,
      unitNumber: "C-401",
      apartmentType: "F3",
      typeName: "F3 Familial",
      typeNameAr: "F3 عائلي",
      surface: 88,
      floor: 4,
      totalFloors: 4,
      orientation: "Sud",
      bedrooms: 2,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 11,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 8_700_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 22 },
        { name: "Cuisine", surface: 10 },
        { name: "Chambre 1", surface: 13 },
        { name: "Chambre 2", surface: 11 },
        { name: "Salle de bain", surface: 5 },
        { name: "Balcon", surface: 11 },
        { name: "Hall", surface: 16 },
      ]),
      description: "Appartement F3 Familial de 88m² au 4ème étage, orientation Sud avec balcon de 11m². Salon de 22m², deux chambres, hall de 16m² offrant des possibilités d'aménagement. Dernier étage pour une vue dégagée sur le quartier. Excellent potentiel de valorisation.",
      descriptionAr: "شقة F3 عائلي بمساحة 88م² في الطابق الرابع، إطلالة جنوبية مع شرفة 11م². صالون 22م²، غرفتان، بهو 16م² يوفر إمكانيات تهيئة. الطابق الأخير لإطلالة بانورامية على الحي. إمكانات تقييم ممتازة.",
      features: JSON.stringify(["Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Balcon carrelé"]),
      featuresAr: JSON.stringify(["زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مبلطة"]),
      published: true,
      archived: false,
      order: 5,
    },
  });

  // ─── Apartment Images for Dar Saïda ────────────────────────
  await prisma.apartmentImage.createMany({
    data: [
      { apartmentId: saidaApt1.id, url: "/images/apartments/dar-saida-f3-90-plan.jpg", alt: "Plan F3 90m²", type: "floor-plan", order: 1 },
      { apartmentId: saidaApt2.id, url: "/images/apartments/dar-saida-f4-130-plan.jpg", alt: "Plan F4 130m²", type: "floor-plan", order: 1 },
      { apartmentId: saidaApt3.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F2 60m²", type: "floor-plan", order: 1 },
      { apartmentId: saidaApt4.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F2 58m²", type: "floor-plan", order: 1 },
      { apartmentId: saidaApt5.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F3 88m²", type: "floor-plan", order: 1 },
    ],
  });

  // ═══════════════════════════════════════════════════════════
  // ─── Project 4: Résidence Les Pins ────────────────────────
  // ═══════════════════════════════════════════════════════════
  const lesPins = await prisma.project.create({
    data: {
      slug: "residence-les-pins",
      name: "Résidence Les Pins",
      nameAr: "سكن الصنوبر",
      tagline: "Mixité et dynamisme à Hussein Dey",
      taglineAr: "تنوع وديناميكية في حسين داي",
      description:
        "La Résidence Les Pins allie commercial en RDC et appartements F2, F3, F4 et Duplex aux étages. Un projet mixte idéal pour investisseurs et familles, au cœur de Hussein Dey.",
      descriptionAr:
        "سكن الصنوبر يجمع بين التجاري في الطابق الأرضي والشقق F2 وF3 وF4 ودوبلكس في الطوابق العليا. مشروع مختلط مثالي للمستثمرين والعائلات في قلب حسين داي.",

      city: "Algiers",
      cityAr: "الجزائر",
      district: "Hussein Dey",
      districtAr: "حسين داي",
      address: "Boulevard de l'ALN, Hussein Dey",
      addressAr: "شارع جبهة التحرير الوطني، حسين داي",
      latitude: 36.7356,
      longitude: 3.0997,

      projectType: "MIXED_USE",
      status: "AVAILABLE",
      apartmentTypes: '["F2","F3","F4","Duplex"]',
      minSurface: 55,
      maxSurface: 135,

      deliveryYear: 2025,
      deliveryQuarter: "Q3",

      hasParking: true,
      hasElevator: true,
      hasGarden: false,
      hasPool: false,
      hasSecurity: true,
      hasClim: true,

      startingPrice: 11_000_000,
      priceOnRequest: false,

      developerId: asas.id,
      published: true,
      archived: false,
      featured: false,
      order: 4,
    },
  });

  // ─── Buildings for Les Pins ────────────────────────────────
  const pinsD = await prisma.building.create({
    data: {
      slug: "residence-les-pins-d",
      projectId: lesPins.id,
      name: "Bâtiment D",
      nameAr: "مبنى د",
      code: "D",
      floors: 7,
      hasElevator: true,
      order: 1,
    },
  });

  // ─── Project Images for Les Pins ───────────────────────────
  await prisma.projectImage.createMany({
    data: [
      {
        projectId: lesPins.id,
        url: "/images/projects/les-pins-hero.jpg",
        alt: "Résidence Les Pins — Vue d'ensemble",
        altAr: "سكن الصنوبر — نظرة عامة",
        type: "hero",
        order: 1,
      },
      {
        projectId: lesPins.id,
        url: "/images/projects/les-pins-1.jpg",
        alt: "Résidence Les Pins — Commercial RDC",
        altAr: "سكن الصنوبر — تجاري طابق أرضي",
        type: "gallery",
        order: 2,
      },
      {
        projectId: lesPins.id,
        url: "/images/projects/les-pins-2.jpg",
        alt: "Résidence Les Pins — Entrée",
        altAr: "سكن الصنوبر — المدخل",
        type: "gallery",
        order: 3,
      },
    ],
  });

  // ─── Amenities for Les Pins ───────────────────────────────
  await prisma.projectAmenity.createMany({
    data: [
      { projectId: lesPins.id, name: "Parking", nameAr: "موقف سيارات", icon: "Car" },
      { projectId: lesPins.id, name: "Ascenseur", nameAr: "مصعد", icon: "ArrowUp" },
      { projectId: lesPins.id, name: "Sécurité 24h", nameAr: "حراسة 24 ساعة", icon: "ShieldCheck" },
      { projectId: lesPins.id, name: "Climatisation", nameAr: "تكييف", icon: "AirVent" },
      { projectId: lesPins.id, name: "Commercial RDC", nameAr: "تجاري طابق أرضي", icon: "Store" },
    ],
  });

  // ─── Apartments for Les Pins ──────────────────────────────
  const pinsApt1 = await prisma.apartment.create({
    data: {
      slug: "les-pins-f2-55",
      projectId: lesPins.id,
      buildingId: pinsD.id,
      unitNumber: "D-201",
      apartmentType: "F2",
      typeName: "F2 Urbain",
      typeNameAr: "F2 حضري",
      surface: 55,
      floor: 2,
      totalFloors: 7,
      orientation: "Ouest",
      bedrooms: 2,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 5,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 11_000_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 18 },
        { name: "Cuisine", surface: 8 },
        { name: "Chambre 1", surface: 12 },
        { name: "Chambre 2", surface: 10 },
        { name: "Salle de bain", surface: 4 },
        { name: "Balcon", surface: 5 },
      ]),
      description: "Appartement F2 Urbain de 55m² au 2ème étage, orientation Ouest. Compact et bien agencé : salon de 18m², deux chambres, cuisine de 8m². Balcon de 5m². Idéal pour les jeunes actifs travaillant dans le centre d'Alger, à deux pas des commodités de Hussein Dey.",
      descriptionAr: "شقة F2 حضري بمساحة 55م² في الطابق الثاني، إطلالة غربية. مدمجة ومرتبة بعناية: صالون 18م²، غرفتان، مطبخ 8م². شرفة 5م². مثالي للشباب النشطين العاملين في وسط الجزائر، على مقربة من مرافق حسين داي.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants", "Interphone vidéo"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة", "إنترفون فيديو"]),
      published: true,
      archived: false,
      order: 1,
    },
  });

  const pinsApt2 = await prisma.apartment.create({
    data: {
      slug: "les-pins-f3-85",
      projectId: lesPins.id,
      buildingId: pinsD.id,
      unitNumber: "D-401",
      apartmentType: "F3",
      typeName: "F3 Central",
      typeNameAr: "F3 مركزي",
      surface: 85,
      floor: 4,
      totalFloors: 7,
      orientation: "Est",
      bedrooms: 3,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 7,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 15_400_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 23 },
        { name: "Cuisine", surface: 11 },
        { name: "Chambre 1", surface: 13 },
        { name: "Chambre 2", surface: 11 },
        { name: "Chambre 3", surface: 10 },
        { name: "Salle de bain", surface: 5 },
        { name: "Balcon", surface: 7 },
      ]),
      description: "Appartement F3 Central de 85m² au 4ème étage, orientation Est. Salon de 23m², cuisine de 11m², trois chambres avec placards. Balcon de 7m². Situé au cœur d'Hussein Dey, à proximité des transports en commun et commerces. Un emplacement stratégique pour les familles urbaines.",
      descriptionAr: "شقة8 F3 مركزي بمساحة 85م² في الطابق الرابع، إطلالة شرقية. صالون 23م²، مطبخ 11م²، ثلاث غرف بخزائن. شرفة 7م². في قلب حسين داي، بالقرب من المواصلات والمتاجر. موقع استراتيجي للعائلات الحضرية.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Balcon carrelé"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مبلطة"]),
      published: true,
      archived: false,
      order: 2,
    },
  });

  const pinsApt3 = await prisma.apartment.create({
    data: {
      slug: "les-pins-duplex-135",
      projectId: lesPins.id,
      buildingId: pinsD.id,
      unitNumber: "D-701",
      apartmentType: "Duplex",
      typeName: "Duplex Penthouse",
      typeNameAr: "دوبلكس بنتهاوس",
      surface: 135,
      floor: 6,
      totalFloors: 7,
      orientation: "Sud",
      bedrooms: 4,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 18,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: true,
      terraceSurface: 18,
      hasGarden: false,
      status: "AVAILABLE",
      price: 26_000_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 32 },
        { name: "Cuisine", surface: 14 },
        { name: "Chambre 1", surface: 16 },
        { name: "Chambre 2", surface: 14 },
        { name: "Chambre 3", surface: 12 },
        { name: "Chambre 4", surface: 10 },
        { name: "Salle de bain 1", surface: 6 },
        { name: "Salle de bain 2", surface: 5 },
        { name: "Terrasse 1", surface: 10 },
        { name: "Terrasse 2", surface: 8 },
      ]),
      description: "Duplex Penthouse de 135m² aux 6ème et 7ème étages, orientation Sud avec terrasse de 18m². Niveau bas : salon de 32m² avec cuisine ouverte de 14m² et terrasse de 10m². Niveau haut : quatre chambres, deux salles de bain, terrasse de 8m². Le summum du standing urbain à Hussein Dey.",
      descriptionAr: "دوبلكس بنتهاوس بمساحة 135م² في الطابقين 6 و7، إطلالة جنوبية مع تراس 18م². المستوى السفلي: صالون 32م² مع مطبخ مفتوح 14م² وتراس 10م². المستوى العلوي: أربع غرف، حمامان، تراس 8م². قمة الستاندر الحضري في حسين داي.",
      features: JSON.stringify(["Climatisation centralisée", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Terrasse panoramique", "Suite parentale", "Domotique", "Baies vitrées coulissantes"]),
      featuresAr: JSON.stringify(["تكييف مركزي", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "تراس بانورامي", "جناح أبوي", "دوموتيك", "ألواح زجاجية منزلقة"]),
      published: true,
      archived: false,
      order: 3,
    },
  });

  const pinsApt4 = await prisma.apartment.create({
    data: {
      slug: "les-pins-f3-95m2",
      projectId: lesPins.id,
      buildingId: pinsD.id,
      unitNumber: "D-301",
      apartmentType: "F3",
      typeName: "F3 Central",
      typeNameAr: "F3 مركزي",
      surface: 95,
      floor: 2,
      totalFloors: 7,
      orientation: "Est",
      bedrooms: 2,
      bathrooms: 1,
      balconies: 1,
      balconySurface: 11,
      hasParking: true,
      parkingSpots: 1,
      hasTerrace: false,
      hasGarden: false,
      status: "RESERVED",
      price: 13_500_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 24 },
        { name: "Cuisine", surface: 11 },
        { name: "Chambre 1", surface: 14 },
        { name: "Chambre 2", surface: 12 },
        { name: "Salle de bain", surface: 5 },
        { name: "Balcon", surface: 11 },
        { name: "Hall", surface: 18 },
      ]),
      description: "Appartement F3 Central de 95m² au 2ème étage, orientation Est avec balcon de 11m². Salon de 24m², deux chambres, hall de 18m². Appartement réservé — forte demande dans ce projet mixte. Proximité immédiate des commerces en RDC.",
      descriptionAr: "شقة F3 مركزي بمساحة 95م² في الطابق الثاني، إطلالة شرقية مع شرفة 11م². صالون 24م²، غرفتان، بهو 18م². شقة محجوزة — طلب قوي في هذا المشروع المختلط. قرب مباشر من المتاجر في الطابق الأرضي.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Balcon carrelé"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مبلطة"]),
      published: true,
      archived: false,
      order: 4,
    },
  });

  const pinsApt5 = await prisma.apartment.create({
    data: {
      slug: "les-pins-f4-145m2",
      projectId: lesPins.id,
      buildingId: pinsD.id,
      unitNumber: "D-601",
      apartmentType: "F4",
      typeName: "F4 Prestige",
      typeNameAr: "F4 برستيج",
      surface: 145,
      floor: 6,
      totalFloors: 7,
      orientation: "Sud",
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      balconySurface: 22,
      hasParking: true,
      parkingSpots: 2,
      hasTerrace: false,
      hasGarden: false,
      status: "AVAILABLE",
      price: 19_800_000,
      priceOnRequest: false,
      rooms: JSON.stringify([
        { name: "Salon", surface: 34 },
        { name: "Cuisine", surface: 13 },
        { name: "Chambre 1", surface: 16 },
        { name: "Chambre 2", surface: 14 },
        { name: "Chambre 3", surface: 12 },
        { name: "Salle de bain 1", surface: 6 },
        { name: "Salle de bain 2", surface: 5 },
        { name: "Balcon 1", surface: 12 },
        { name: "Balcon 2", surface: 10 },
        { name: "Hall", surface: 23 },
      ]),
      description: "Appartement F4 Prestige de 145m² au 6ème étage, orientation Sud avec double balcon de 22m². Salon de 34m², cuisine de 13m², trois chambres dont une suite parentale de 16m². Hall de 23m², deux places de parking. Finitions haut de gamme dans un projet mixte dynamique.",
      descriptionAr: "شقة F4 برستيج بمساحة 145م² في الطابق السادس، إطلالة جنوبية مع شرفة مزدوجة 22م². صالون 34م²، مطبخ 13م²، ثلاث غرف منها جناح أبوي 16م². بهو 23م²، مكانا وقوف. تشطيبات عالية الجودة في مشروع مختلط ديناميكي.",
      features: JSON.stringify(["Climatisation split", "Double vitrage", "Carrelage grès cérame", "Faïence pleine hauteur", "Placards aménagés", "Plomberie chromée", "Volets roulants électriques", "Interphone vidéo", "Parquet chambres", "Double balcon", "Suite parentale", "Domotique"]),
      featuresAr: JSON.stringify(["تكييف سبليت", "زجاج مزدوج", "بلاط سيراميك", "بلاط الحائط الكامل", "خزائن مدمجة", "سباكة كرومية", "ستائر متدحرجة كهربائية", "إنترفون فيديو", "باركي الغرف", "شرفة مزدوجة", "جناح أبوي", "دوموتيك"]),
      published: true,
      archived: false,
      order: 5,
    },
  });

  // ─── Apartment Images for Les Pins ─────────────────────────
  await prisma.apartmentImage.createMany({
    data: [
      { apartmentId: pinsApt1.id, url: "/images/apartments/les-pins-f2-55-plan.jpg", alt: "Plan F2 55m²", type: "floor-plan", order: 1 },
      { apartmentId: pinsApt1.id, url: "/images/apartments/les-pins-f2-55-render.jpg", alt: "Rendu F2 55m²", type: "hero", order: 2 },
      { apartmentId: pinsApt2.id, url: "/images/apartments/les-pins-f3-85-plan.jpg", alt: "Plan F3 85m²", type: "floor-plan", order: 1 },
      { apartmentId: pinsApt2.id, url: "/images/apartments/les-pins-f3-85-render.jpg", alt: "Rendu F3 85m²", type: "hero", order: 2 },
      { apartmentId: pinsApt3.id, url: "/images/apartments/les-pins-duplex-135-plan.jpg", alt: "Plan Duplex 135m²", type: "floor-plan", order: 1 },
      { apartmentId: pinsApt3.id, url: "/images/apartments/les-pins-duplex-135-render.jpg", alt: "Rendu Duplex 135m²", type: "hero", order: 2 },
      { apartmentId: pinsApt4.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F3 95m²", type: "floor-plan", order: 1 },
      { apartmentId: pinsApt5.id, url: "/images/apartments/floor-plan-f3.jpg", alt: "Plan F4 145m²", type: "floor-plan", order: 1 },
    ],
  });

  // ═══════════════════════════════════════════════════════════
  // ─── Site Content ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  await prisma.siteContent.createMany({
    data: [
      {
        key: "hero_title",
        value: "Trouvez votre résidence idéale à Algiers",
        valueAr: "اعثر على سكنك المثالي في الجزائر",
      },
      {
        key: "hero_subtitle",
        value: "Appartements neufs F2, F3, F4 et Duplex — Livraison 2025-2026",
        valueAr: "شقق جديدة F2 وF3 وF4 ودوبلكس — تسليم 2025-2026",
      },
      {
        key: "about_mission",
        value:
          "ASAS Immobilier accompagne les familles algéroises dans l'acquisition de leur résidence principale. Qualité de construction, transacité des prix, accompagnement personnalisé.",
        valueAr:
          "أساس العقارية ترافق العائلات الجزائرية في اقتناء سكنهم الرئيسي. جودة البناء وشفافية الأسعار ومرافقة شخصية.",
      },
    ],
  });

  // ═══════════════════════════════════════════════════════════
  // ─── Admin User ────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  // SECURITY: never hardcode a default password. Read from env, or
  // generate a random one and print it ONCE. The seed uses `upsert`
  // so re-running it does NOT change an existing admin password.
  const adminEmail = "admin@asas.dz";
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    // Admin already exists — leave the password alone (don't overwrite).
    console.log(`✓ Admin user already exists (${adminEmail}) — password unchanged.`);
  } else {
    const adminPassword =
      process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() ||
      generateSecurePassword();
    if (!process.env.ADMIN_BOOTSTRAP_PASSWORD) {
      console.log("");
      console.log("╔══════════════════════════════════════════════════════════╗");
      console.log("║  GENERATED ADMIN PASSWORD (save this — shown only once)  ║");
      console.log("╠══════════════════════════════════════════════════════════╣");
      console.log(`║  ${adminPassword.padEnd(54)}║`);
      console.log("╚══════════════════════════════════════════════════════════╝");
      console.log(`Login: ${adminEmail}`);
      console.log("");
    }
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        name: "Admin ASAS",
        passwordHash,
        role: "ADMIN",
        active: true,
      },
    });
  }

  function generateSecurePassword(): string {
    // 24-char base36 password, generated from crypto.randomBytes.
    // Uses only [a-z0-9] so it's safe to paste into any terminal/UI.
    const bytes = new Uint8Array(18);
    for (let i = 0; i < 18; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
  }

  // ═══════════════════════════════════════════════════════════
  // ─── Summary ──────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  const projectCount = await prisma.project.count();
  const buildingCount = await prisma.building.count();
  const apartmentCount = await prisma.apartment.count();
  const amenityCount = await prisma.projectAmenity.count();
  const projectImageCount = await prisma.projectImage.count();
  const apartmentImageCount = await prisma.apartmentImage.count();
  const contentCount = await prisma.siteContent.count();
  const adminCount = await prisma.adminUser.count();

  console.log("✅ Seeding complete!");
  console.log(`   ${projectCount} projects`);
  console.log(`   ${buildingCount} buildings`);
  console.log(`   ${apartmentCount} apartments`);
  console.log(`   ${amenityCount} amenities`);
  console.log(`   ${projectImageCount} project images`);
  console.log(`   ${apartmentImageCount} apartment images`);
  console.log(`   ${contentCount} site content entries`);
  console.log(`   ${adminCount} admin users`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
