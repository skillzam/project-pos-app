const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const pdf = require('html-pdf');
const flash = require('connect-flash');

// Homepage Route
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.render('index', { items });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Inventory Page Route
router.get('/inventory', async (req, res) => {
    try {
        const items = await Item.find(); // Fetch all items from the database
        res.render('inventory', { items }); // Pass items to the inventory view
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Item Page Route
router.get('/inventory/add-item', (req, res) => {
    res.render('add-item'); // Render the "Add Item" form
});

// Add Item POST Route
router.post('/inventory/add-item', async (req, res) => {
    const { name, price, quantity } = req.body;

    try {
        // Validate inputs
        if (!name || !price || !quantity) {
            req.flash('error_msg', 'All fields are required.');
            return res.redirect('/add-item');
        }

        // Create a new item
        const newItem = new Item({ name, price, quantity });
        await newItem.save();

        req.flash('success_msg', 'Item added successfully!');
        res.redirect('/pos/inventory'); // Redirect to the Inventory page
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error adding item.');
        res.redirect('/add-item');
    }
});

// Edit Item Route
router.get('/inventory/edit-item/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        res.render('edit-item', { item });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update Item Route
router.post('/inventory/update-item/:id', async (req, res) => {
    const { name, price, quantity } = req.body;

    try {
        await Item.findByIdAndUpdate(req.params.id, { name, price, quantity });
        req.flash('success_msg', 'Item updated successfully!');
        res.redirect('/pos/inventory');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating item.');
        res.redirect('/edit-item/' + req.params.id);
    }
});

// Delete Item Route
router.get('/inventory/delete-item/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Item deleted successfully!');
        res.redirect('/pos/inventory');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting item.');
        res.redirect('/pos/inventory');
    }
});

// Generate Invoice Route
router.post('/generate-invoice', async (req, res) => {
    const { selectedItem, quantity, price, discount } = req.body;

    // Calculate total amount
    const totalAmount = (quantity * price) - discount;

    // Render EJS template to HTML
    const invoiceHtml = `
        <h1>Invoice</h1>
        <p>Item: ${selectedItem}</p>
        <p>Quantity: ${quantity}</p>
        <p>Price: ₹${price}</p>
        <p>Discount: ₹${discount}</p>
        <p>Total Amount: ₹${totalAmount}</p>
    `;

    // Generate PDF from HTML
    pdf.create(invoiceHtml).toFile('./invoice.pdf', (err, result) => {
        if (err) return res.status(500).send('Error generating PDF');
        res.download(result.filename); // Download the generated PDF
    });
});

module.exports = router;