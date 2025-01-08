const express = require('express');
const router = express.Router();
const manufacturerController = require('../controllers/manufacturerController');

router.get('/api', manufacturerController.getManufacturers);
router.post('/api', manufacturerController.createManufacturer);
router.put('/api/:manufacturerId', manufacturerController.updateManufacturer);
router.delete('/api/:manufacturerId', manufacturerController.deleteManufacturer);

module.exports = router;