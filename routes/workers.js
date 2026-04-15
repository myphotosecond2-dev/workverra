const express = require('express')
const router = express.Router()

const {
  getWorkers,
  getWorkerById
} = require('../controllers/workerController')

// Get all workers (search + filter)
router.get('/', getWorkers)

// Get single worker
router.get('/:id', getWorkerById)

module.exports = router