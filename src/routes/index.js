import express from "express";
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    success: true,
    message: 'Welcome to RealTime Polling Platform API',
    data: {
      platform: 'RealTime Polling Platform',
      version: '1.0.0',
      status: 'active'
    }
  });
});

export default router;