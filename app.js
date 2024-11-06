const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require("path");

// Config template engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


// Import routes
const homeRoutes = require('./routes/homeRoutes');
app.use('/', homeRoutes);

const shopRoutes = require('./routes/shopRoutes');
app.use('/shop', shopRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/cart', cartRoutes);

const productRoutes = require('./routes/productRoutes')
app.use('/products',productRoutes)

// Static routes
app.get('/about', (req, res) => {
  res.render('layouts/layout', { body: '../about/about' });
});

app.get('/contact', (req, res) => {
  res.render('layouts/layout', { body: '../contact/contact' });
});


// Middleware error handler
const AppErrorHandler = require('./utils/AppErrorHandler.js')
app.use(AppErrorHandler)
// db
const sequelize = require('./models/index.js');


// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
