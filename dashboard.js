const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const PDFDocument = require('pdfkit');

const isAuth = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  next();
};

// Dashboard
router.get('/', isAuth, async (req, res) => {
  const orders = await Order.find({ userId: req.session.userId });
  res.render('dashboard', { orders });
});

// Create order
router.post('/order', isAuth, async (req, res) => {
  const { customerName, gender, dressType, status } = req.body;
  const measurements = req.body.measurements || {};
  const order = new Order({ userId: req.session.userId, customerName, gender, dressType, measurements, status });
  await order.save();
  res.redirect('/dashboard');
});

// Edit order
router.get('/edit/:id', isAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.render('editOrder', { order });
});

router.post('/edit/:id', isAuth, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    customerName: req.body.customerName,
    dressType: req.body.dressType,
    status: req.body.status,
    measurements: req.body.measurements
  });
  res.redirect('/dashboard');
});

// Delete
router.get('/delete/:id', isAuth, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.redirect('/dashboard');
});

// PDF
router.get('/pdf/:id', isAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);

  const doc = new PDFDocument();
  res.setHeader('Content-type', 'application/pdf');
  doc.pipe(res);

  doc.fontSize(20).text('Order Summary', { align: 'center' });
  doc.moveDown();
  doc.text(`Customer: ${order.customerName}`);
  doc.text(`Gender: ${order.gender}`);
  doc.text(`Dress Type: ${order.dressType}`);
  doc.text(`Status: ${order.status}`);
  doc.text('Measurements:');
  for (let key in order.measurements) {
    doc.text(`  - ${key}: ${order.measurements[key]}`);
  }

  doc.end();
});

module.exports = router;
