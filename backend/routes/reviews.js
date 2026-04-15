const router = require('express').Router();
const { addReview, getEventReviews } = require('../controllers/reviewsController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, addReview);
router.get('/event/:eventId', getEventReviews);

module.exports = router;
