const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require("path");
const sequelize = require('./config/database');
const User = require('./models/User');

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

// Static routes
app.get('/about', (req, res) => {
  res.render('layouts/layout', { body: '../about/about' });
});

app.get('/contact', (req, res) => {
  res.render('layouts/layout', { body: '../contact/contact' });
});


// Sync db
(async () => {
  try {

    await sequelize.sync({ force: false });
    console.log("Database & tables sync!");

    if(await User.count() == 0)
    {
      await User.create({
        user_name: 'John Doe',
        phone: '1234567890',
        email: 'john@example.com',
      });
      console.log("Sample user created!");
    }
  } catch (error) {
    console.error("Unable to sync database:", error);
  }
})();


// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
