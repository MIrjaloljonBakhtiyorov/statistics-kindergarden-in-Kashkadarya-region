const express = require('express');
const router = express.Router();
const KindergartenController = require('../controllers/kindergartenController');

router.get('/', KindergartenController.getAll);
router.get('/:id', KindergartenController.getById);
router.post('/', KindergartenController.create);
router.put('/:id', KindergartenController.update);
router.delete('/:id', KindergartenController.delete);

module.exports = router;
