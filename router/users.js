const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json([{ "user1": "user" }]);
});

router.post('/', (req, res) => {
    
})

module.exports = router