import { Router } from 'express';
import {
  listMyMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

// Every menu route is seller-only
router.use(protect, restrictTo('seller'));

router.get('/mine', listMyMenu);
router.post('/', uploadSingleImage, createMenuItem);
router.put('/:id', uploadSingleImage, updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
