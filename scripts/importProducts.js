/**
 * scripts/importProducts.js
 *
 * Usage:
 *   node scripts/importProducts.js         # actually inserts into DB
 *   node scripts/importProducts.js --dry   # show what would be inserted (no DB write)
 *
 * Notes:
 * - Run from project root.
 * - .env must contain MONGODB_URI.
 * - This uses your existing models (Category, Product).
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const Category = require('../models/Category');
const Product = require('../models/Product');

const dryRun = process.argv.includes('--dry');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env — set it and rerun.');
    process.exit(1);
  }

  // Connect (no deprecated options)
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Load static JSON
  const jsonPath = path.join(__dirname, '..', 'Frontend (Candelco.)', 'assets', 'data', 'products.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('products.json not found at', jsonPath);
    await mongoose.disconnect();
    process.exit(1);
  }
  const raw = fs.readFileSync(jsonPath, 'utf8');
  let data;
  try { data = JSON.parse(raw); } catch (err) {
    console.error('Failed to parse products.json:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }

  const items = Array.isArray(data.products) ? data.products : [];
  console.log(`Found ${items.length} items in static JSON.`);

  // Map to prepared docs
  const prepared = [];

  // Cache for category name -> _id
  const catCache = {};

  for (const p of items) {
    const name = (p.name || '').trim();
    const displayName = p.displayName || p.name || name;
    const categoryKey = (p.category || '').toString().trim().toLowerCase();
    const theme = p.theme || 'Classic';

    // Price cleanup
    let price = 0;
    if (p.price !== undefined && p.price !== null) {
      const num = String(p.price).replace(/[, ]+/g, '').replace(/[^\d.-]/g, '');
      price = Number(num) || 0;
    }

    const image = p.image || '';
    const description = p.description || '';
    const stock = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : 10;
    const sizes = p.sizes || ['Small', 'Medium', 'Large'];

    // Find or create category doc (ensure required fields like description exist)
    let categoryId = catCache[categoryKey];
    if (!categoryId) {
      // Try to find by name or slug
      let catDoc = await Category.findOne({
        $or: [
          { name: new RegExp('^' + categoryKey + '$', 'i') },
          { slug: categoryKey }
        ]
      });

      if (!catDoc) {
        // Build default values for required fields (description, etc.)
        const capitalized = categoryKey ? (categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)) : 'Uncategorized';
        const defaultCategory = {
          name: capitalized,
          slug: categoryKey || 'uncategorized',
          description: `${capitalized} collection of products` // <-- provide required description
        };

        try {
          catDoc = await Category.create(defaultCategory);
          console.log('Created category:', catDoc.name, catDoc._id);
        } catch (err) {
          console.warn('Failed to create category with slug:', categoryKey, 'error:', err.message);
          // try to recover by attempting to find again (in case of race or unique constraint)
          catDoc = await Category.findOne({ slug: categoryKey });
          if (!catDoc) {
            // give up for this product (use null so import will likely fail validation for product)
            console.error('Unable to create/find category for', categoryKey);
            continue;
          }
        }
      }
      categoryId = catDoc._id;
      catCache[categoryKey] = categoryId;
    }

    const doc = {
      name,
      displayName,
      category: categoryId,
      theme,
      price,
      image,
      description,
      stock,
      sizes
    };

    prepared.push(doc);
  }

  console.log(`Prepared ${prepared.length} product documents for insertion.`);

  if (dryRun) {
    console.log('Dry run enabled — showing first 5 prepared documents:');
    console.log(JSON.stringify(prepared.slice(0, 5), null, 2));
    await mongoose.disconnect();
    console.log('Disconnected (dry run).');
    process.exit(0);
  }

  // Insert into DB
  try {
    const result = await Product.insertMany(prepared, { ordered: false });
    console.log(`Inserted ${result.length} products into DB.`);
  } catch (err) {
    console.error('Error inserting products:', err.message || err);
    if (err.writeErrors) {
      console.error('Write errors count:', err.writeErrors.length);
      err.writeErrors.forEach((we, i) => {
        console.error(i + 1, we.err && we.err.message ? we.err.message : we.err);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});