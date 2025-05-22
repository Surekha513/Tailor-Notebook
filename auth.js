const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Show signup page
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

// Handle signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.send('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();

  req.session.userId = user._id; // login the user automatically
  res.redirect('/dashboard'); // go to dashboard after signup
});

// Show login page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Handle login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send('Invalid credentials');

  req.session.userId = user._id;
  res.redirect('/dashboard');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Redirect root to signup page
router.get('/', (req, res) => {
  res.redirect('/signup');
});

module.exports = router;
