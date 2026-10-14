import { Router } from 'express';
import { placeOrder, myOrders, shopOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, restrictTo('customer'), placeOrder);
router.get('/my', protect, restrictTo('customer'), myOrders);
router.get('/shop', protect, restrictTo('seller'), shopOrders);
router.patch('/:id/status', protect, restrictTo('seller'), updateOrderStatus);

export default router;
