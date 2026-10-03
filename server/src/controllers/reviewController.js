import Review from '../models/Review.js';

export async function getClaimReviews(req, res, next) {
  try {
    const reviews = await Review.find({ claim: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
}
