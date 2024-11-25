import express from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

const categorySchema = z.object({
  name: z.string(),
  description: z.string().optional()
});

const productSchema = z.object({
  name: z.string(),
  categoryId: z.string(),
  type: z.string(),
  materials: z.array(z.string()),
  unitCost: z.number(),
  description: z.string().optional()
});

// Categories
router.get('/categories', authenticateToken, asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { products: true }
  });
  res.json(categories);
}));

router.post('/categories', authenticateToken, asyncHandler(async (req, res) => {
  const data = categorySchema.parse(req.body);
  const category = await prisma.category.create({ data });
  res.status(201).json(category);
}));

router.put('/categories/:id', authenticateToken, asyncHandler(async (req, res) => {
  const data = categorySchema.parse(req.body);
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data
  });
  res.json(category);
}));

router.delete('/categories/:id', authenticateToken, asyncHandler(async (req, res) => {
  await prisma.category.delete({
    where: { id: req.params.id }
  });
  res.status(204).send();
}));

// Products
router.get('/products', authenticateToken, asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true }
  });
  res.json(products);
}));

router.post('/products', authenticateToken, asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body);
  const product = await prisma.product.create({ data });
  res.status(201).json(product);
}));

router.put('/products/:id', authenticateToken, asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body);
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data
  });
  res.json(product);
}));

router.delete('/products/:id', authenticateToken, asyncHandler(async (req, res) => {
  await prisma.product.delete({
    where: { id: req.params.id }
  });
  res.status(204).send();
}));

export default router;