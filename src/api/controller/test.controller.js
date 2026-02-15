const express = require('express');

const testController = {
    testing : (req,res)=>{
        return res.send("Testing route is working fine");
    },
    testing2 : (req,res)=>{
        return res.send("Testing2 route is working fine");
    }   
}

module.exports = testController;