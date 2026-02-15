const router = require('express').Router();
const testRouter = require('./test.router');
const authRouter = require('./auth.router');
const whiskeyRouter = require('./whiskey.router');
const testRunnerRouter = require('./testRunner.router');
const cartRouter = require('./cart.router');
const orderRouter = require('./order.router');

router.use('/test', testRouter);
router.use('/auth', authRouter);
router.use('/whiskey', whiskeyRouter);
router.use('/test-runner', testRunnerRouter);
router.use('/cart', cartRouter);
router.use('/order', orderRouter);

module.exports = router;