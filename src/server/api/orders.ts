import express from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

const orderSchema = z.object({
  quoteId: z.string(),
  clientName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  projectName: z.string(),
  installationAddress: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  total: z.number(),
  adjustmentType: z.enum(['discount', 'surcharge']).optional(),
  adjustmentPercentage: z.number().optional(),
  adjustedTotal: z.number().optional(),
});

const receiptSchema = z.object({
  paymentPercentage: z.number().min(0).max(100),
  amount: z.number().min(0),
});

// Get all orders
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: {
      receipts: true,
      quote: {
        include: {
          spaces: {
            include: { items: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
}));

// Get single order
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      receipts: true,
      quote: {
        include: {
          spaces: {
            include: { items: true }
          }
        }
      }
    }
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json(order);
}));

// Create order from quote
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const data = orderSchema.parse(req.body);

  const quote = await prisma.quote.findUnique({
    where: { id: data.quoteId }
  });

  if (!quote) {
    return res.status(404).json({ error: 'Quote not found' });
  }

  if (quote.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const order = await prisma.order.create({
    data: {
      ...data,
      userId: req.user.id
    },
    include: {
      receipts: true,
      quote: {
        include: {
          spaces: {
            include: { items: true }
          }
        }
      }
    }
  });

  res.status(201).json(order);
}));

// Update order
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const data = orderSchema.parse(req.body);
  const order = await prisma.order.findUnique({
    where: { id: req.params.id }
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: req.params.id },
    data,
    include: {
      receipts: true,
      quote: {
        include: {
          spaces: {
            include: { items: true }
          }
        }
      }
    }
  });

  res.json(updatedOrder);
}));

// Delete order
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id }
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await prisma.receipt.deleteMany({
    where: { orderId: req.params.id }
  });

  await prisma.order.delete({
    where: { id: req.params.id }
  });

  res.status(204).send();
}));

// Create receipt
router.post('/:id/receipts', authenticateToken, asyncHandler(async (req, res) => {
  const data = receiptSchema.parse(req.body);
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { receipts: true }
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const totalPercentage = order.receipts.reduce(
    (sum, receipt) => sum + receipt.paymentPercentage,
    0
  );

  if (totalPercentage + data.paymentPercentage > 100) {
    return res.status(400).json({ error: 'Total payment percentage cannot exceed 100%' });
  }

  const receipt = await prisma.receipt.create({
    data: {
      ...data,
      status: 'draft',
      orderId: req.params.id
    }
  });

  res.status(201).json(receipt);
}));

export default router;