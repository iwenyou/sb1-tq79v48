import { Router } from 'express';
import authRoutes from './auth.routes';
import quotesRoutes from '../api/quotes';
import ordersRoutes from '../api/orders';
import catalogRoutes from '../api/catalog';
import settingsRoutes from '../api/settings';

const router = Router();

router.use('/auth', authRoutes);
router.use('/quotes', quotesRoutes);
router.use('/orders', ordersRoutes);
router.use('/catalog', catalogRoutes);
router.use('/settings', settingsRoutes);

export default router;