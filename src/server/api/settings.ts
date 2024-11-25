import express from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

const presetValuesSchema = z.object({
  defaultHeight: z.number(),
  defaultWidth: z.number(),
  defaultDepth: z.number(),
  laborRate: z.number(),
  materialMarkup: z.number(),
  taxRate: z.number(),
  deliveryFee: z.number(),
  installationFee: z.number(),
  storageFee: z.number(),
  minimumOrder: z.number(),
  rushOrderFee: z.number(),
  shippingRate: z.number(),
  importTaxRate: z.number(),
  exchangeRate: z.number()
});

const templateSchema = z.object({
  type: z.string(),
  settings: z.record(z.any())
});

// Preset Values
router.get('/preset-values', authenticateToken, asyncHandler(async (req, res) => {
  const presetValues = await prisma.presetValues.findFirst();
  res.json(presetValues);
}));

router.put('/preset-values', authenticateToken, asyncHandler(async (req, res) => {
  const data = presetValuesSchema.parse(req.body);
  const presetValues = await prisma.presetValues.upsert({
    where: { id: '1' },
    update: data,
    create: { ...data, id: '1' }
  });
  res.json(presetValues);
}));

// Templates
router.get('/templates/:type', authenticateToken, asyncHandler(async (req, res) => {
  const template = await prisma.template.findFirst({
    where: { type: req.params.type }
  });
  res.json(template);
}));

router.put('/templates/:type', authenticateToken, asyncHandler(async (req, res) => {
  const data = templateSchema.parse(req.body);
  const template = await prisma.template.upsert({
    where: { type: req.params.type },
    update: { settings: data.settings },
    create: {
      type: req.params.type,
      settings: data.settings
    }
  });
  res.json(template);
}));

export default router;