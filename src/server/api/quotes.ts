import express from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const quoteSchema = z.object({
  clientName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  projectName: z.string(),
  installationAddress: z.string(),
  status: z.string(),
  total: z.number(),
  adjustmentType: z.string().optional(),
  adjustmentPercentage: z.number().optional(),
  adjustedTotal: z.number().optional(),
  spaces: z.array(z.object({
    name: z.string(),
    items: z.array(z.object({
      productId: z.string().optional(),
      material: z.string().optional(),
      width: z.number(),
      height: z.number(),
      depth: z.number(),
      price: z.number(),
    })),
  })),
});

// Get all quotes for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { userId: req.user.id },
      include: {
        spaces: {
          include: {
            items: true,
          },
        },
      },
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get a specific quote
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: {
        spaces: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Create a new quote
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = quoteSchema.parse(req.body);

    const quote = await prisma.quote.create({
      data: {
        ...data,
        userId: req.user.id,
        spaces: {
          create: data.spaces.map(space => ({
            name: space.name,
            items: {
              create: space.items,
            },
          })),
        },
      },
      include: {
        spaces: {
          include: {
            items: true,
          },
        },
      },
    });

    res.status(201).json(quote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// Update a quote
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const data = quoteSchema.parse(req.body);
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete existing spaces and items
    await prisma.cabinetItem.deleteMany({
      where: {
        space: {
          quoteId: req.params.id,
        },
      },
    });
    await prisma.space.deleteMany({
      where: { quoteId: req.params.id },
    });

    // Create new spaces and items
    const updatedQuote = await prisma.quote.update({
      where: { id: req.params.id },
      data: {
        ...data,
        spaces: {
          create: data.spaces.map(space => ({
            name: space.name,
            items: {
              create: space.items,
            },
          })),
        },
      },
      include: {
        spaces: {
          include: {
            items: true,
          },
        },
      },
    });

    res.json(updatedQuote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// Delete a quote
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.cabinetItem.deleteMany({
      where: {
        space: {
          quoteId: req.params.id,
        },
      },
    });
    await prisma.space.deleteMany({
      where: { quoteId: req.params.id },
    });
    await prisma.quote.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

export default router;