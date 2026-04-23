import { db } from "./index"
import { users, suppliers, categories, products, priceHistory, updateLogs } from "./schema"

async function seed() {
  console.log("Sembrando datos de demo...")

  const [user] = await db.insert(users).values({
    id: crypto.randomUUID(),
    name: "Materiales Rodríguez",
    email: "admin@materialesrodriguez.com.ar",
    role: "proveedor",
    emailVerified: true,
  }).returning()

  const [supplier] = await db.insert(suppliers).values({
    userId: user.id,
    name: "Materiales Rodríguez",
    slug: "materiales-rodriguez",
    description: "Distribuidora de materiales de construcción en Argentina. Cemento, hierro, cerámicos y más.",
    phone: "+54 11 4567-8901",
    address: "Av. San Martín 1234, Buenos Aires",
  }).returning()

  const catData = [
    { name: "Cemento y Mezclas", slug: "cemento-mezclas" },
    { name: "Hierros y Aceros", slug: "hierros-aceros" },
    { name: "Cerámicos y Pisos", slug: "ceramicos-pisos" },
    { name: "Pintura", slug: "pintura" },
    { name: "Sanitarios y Griferías", slug: "sanitarios-griferia" },
    { name: "Electricidad", slug: "electricidad" },
  ]

  const cats = await db.insert(categories).values(
    catData.map((c) => ({ ...c, supplierId: supplier.id }))
  ).returning()

  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]))

  const productData = [
    // Cemento
    { sku: "CEM-001", name: "Cemento Portland 50kg", unit: "bolsa", price: "18500", catSlug: "cemento-mezclas" },
    { sku: "CEM-002", name: "Cemento de albañilería 30kg", unit: "bolsa", price: "9200", catSlug: "cemento-mezclas" },
    { sku: "MEZ-001", name: "Mezcla lista para revocar 30kg", unit: "bolsa", price: "7800", catSlug: "cemento-mezclas" },
    { sku: "MEZ-002", name: "Contrapiso seco 40kg", unit: "bolsa", price: "8100", catSlug: "cemento-mezclas" },
    { sku: "ARE-001", name: "Arena fina x m³", unit: "m³", price: "45000", catSlug: "cemento-mezclas" },
    // Hierros
    { sku: "HIE-001", name: "Hierro redondo ø 6mm x 12m", unit: "barra", price: "4200", catSlug: "hierros-aceros" },
    { sku: "HIE-002", name: "Hierro redondo ø 8mm x 12m", unit: "barra", price: "7500", catSlug: "hierros-aceros" },
    { sku: "HIE-003", name: "Hierro redondo ø 10mm x 12m", unit: "barra", price: "11800", catSlug: "hierros-aceros" },
    { sku: "HIE-004", name: "Hierro redondo ø 12mm x 12m", unit: "barra", price: "16900", catSlug: "hierros-aceros" },
    { sku: "CAB-001", name: "Caño estructural 50x50x2mm x 6m", unit: "barra", price: "22000", catSlug: "hierros-aceros" },
    // Cerámicos
    { sku: "CER-001", name: "Porcelanato 60x60 blanco brillante (caja)", unit: "caja", price: "28000", catSlug: "ceramicos-pisos" },
    { sku: "CER-002", name: "Porcelanato 60x60 gris mate (caja)", unit: "caja", price: "31000", catSlug: "ceramicos-pisos" },
    { sku: "CER-003", name: "Cerámico pared 30x60 blanco (caja)", unit: "caja", price: "14500", catSlug: "ceramicos-pisos" },
    { sku: "CER-004", name: "Porcelanato madera roble 20x120 (caja)", unit: "caja", price: "42000", catSlug: "ceramicos-pisos" },
    { sku: "PEG-001", name: "Pegamento flexible gris 30kg", unit: "bolsa", price: "9800", catSlug: "ceramicos-pisos" },
    // Pintura
    { sku: "PIN-001", name: "Látex interior blanco 20L", unit: "balde", price: "38000", catSlug: "pintura" },
    { sku: "PIN-002", name: "Látex exterior blanco 20L", unit: "balde", price: "46000", catSlug: "pintura" },
    { sku: "PIN-003", name: "Esmalte sintético blanco 4L", unit: "lata", price: "21000", catSlug: "pintura" },
    { sku: "PIN-004", name: "Impermeabilizante membrana líquida 20kg", unit: "balde", price: "68000", catSlug: "pintura" },
    { sku: "PIN-005", name: "Fijador al agua 10L", unit: "balde", price: "18500", catSlug: "pintura" },
    // Sanitarios
    { sku: "SAN-001", name: "Inodoro de piso blanco", unit: "unidad", price: "95000", catSlug: "sanitarios-griferia" },
    { sku: "SAN-002", name: "Lavatorio de colgar 60cm blanco", unit: "unidad", price: "52000", catSlug: "sanitarios-griferia" },
    { sku: "SAN-003", name: "Grifería monocomando baño cromada", unit: "unidad", price: "38000", catSlug: "sanitarios-griferia" },
    { sku: "SAN-004", name: "Ducha teléfono con flexible", unit: "unidad", price: "22000", catSlug: "sanitarios-griferia" },
    // Electricidad
    { sku: "ELE-001", name: "Cable unipolar 2,5mm² rollo 100m", unit: "rollo", price: "76000", catSlug: "electricidad" },
    { sku: "ELE-002", name: "Cable unipolar 4mm² rollo 100m", unit: "rollo", price: "118000", catSlug: "electricidad" },
    { sku: "ELE-003", name: "Caja embutir 3 módulos", unit: "unidad", price: "1800", catSlug: "electricidad" },
    { sku: "ELE-004", name: "Disyuntor termomagnético 2x20A", unit: "unidad", price: "28000", catSlug: "electricidad" },
    { sku: "ELE-005", name: "Tablero metálico 12 módulos", unit: "unidad", price: "45000", catSlug: "electricidad" },
  ]

  const prods = await db.insert(products).values(
    productData.map((p) => ({
      supplierId: supplier.id,
      categoryId: catMap[p.catSlug],
      sku: p.sku,
      name: p.name,
      unit: p.unit,
      currentPrice: p.price,
      stock: Math.floor(Math.random() * 200) + 10,
    }))
  ).returning()

  await db.insert(priceHistory).values(
    prods.map((p) => ({
      productId: p.id,
      supplierId: supplier.id,
      previousPrice: null,
      newPrice: p.currentPrice,
      method: "manual" as const,
      updatedBy: user.id,
    }))
  )

  await db.insert(updateLogs).values({
    supplierId: supplier.id,
    method: "manual",
    productsCreated: prods.length,
    productsUpdated: 0,
    productsSkipped: 0,
    status: "completed",
    updatedBy: user.id,
    completedAt: new Date(),
  })

  console.log(`✓ Proveedor creado: ${supplier.name} (slug: ${supplier.slug})`)
  console.log(`✓ ${cats.length} categorías, ${prods.length} productos`)
  console.log(`\nCatálogo público: /catalogo/${supplier.slug}`)
}

seed().catch(console.error).finally(() => process.exit())
