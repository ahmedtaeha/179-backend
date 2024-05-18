const express = require('express');
const { getInvoice, addInvoices, deleteInvoices, updateInvoicesStatus } = require('../controllers/invoice');

const router = express.Router();

router.get('/get-invoices/:userId', getInvoice);
router.post('/add-invoice/:userId', addInvoices);
router.delete('/delete-invoice/:id', deleteInvoices);
router.put('/update-payment-status/:id', updateInvoicesStatus);


module.exports = router;
