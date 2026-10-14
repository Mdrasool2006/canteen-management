import { Router } from 'express';
import { listShops, getShop, getMyShop, upsertMyShop } from '../controllers/shopController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

router.get('/', listShops);
// "/mine" must be declared before "/:id" so it is not treated as an id
router.get('/mine', protect, restrictTo('seller'), getMyShop);
router.put('/mine', protect, restrictTo('seller'), uploadSingleImage, upsertMyShop);
router.get('/:id', getShop);

export default router;
