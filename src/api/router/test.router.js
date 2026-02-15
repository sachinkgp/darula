const router = require('express').Router();
const testController = require('../controller/test.controller');

router.get('/test1',(req,res)=>{
    console.log("Testing route is working fine"),
    testController.testing(req,res)

});

router.get('/test2',(req,res)=>{
    console.log("Testing2 route is working fine"),
    testController.testing2(req,res)
})

module.exports = router;