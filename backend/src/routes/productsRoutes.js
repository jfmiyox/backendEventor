import express from 'express';
import { getProducts, getProductById, getReviews, createNewProduct , deleteProduct , updateProduct} from '../controllers/productos/productsController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/create', createNewProduct); 
router.get('/:id/reviews', getReviews);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
export default router;