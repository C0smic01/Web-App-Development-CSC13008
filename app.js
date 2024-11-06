const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const path = require("path");

// Import database connection
const { sequelize } = require('./models');

// Session store configuration
const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'sessions',
    checkExpirationInterval: 15 * 60 * 1000, // Clean up expired sessions every 15 minutes
    expiration: 24 * 60 * 60 * 1000  // Session expires after 24 hours
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development, enable in production
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'http://localhost:3000',
    credentials: true
}));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-dev-secret-key', // Use environment variable in production
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Change default cookie name for better security
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only send cookies over HTTPS in production
        httpOnly: true, // Prevent client-side access to cookies
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict' // Protect against CSRF
    }
}));

// Create session table
sessionStore.sync();

// Config template engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Authentication middleware
const authMiddleware = (req, res, next) => {
    // Add user data to locals for use in templates
    res.locals.user = req.session.user || null;
    next();
};

app.use(authMiddleware);

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

// Error handling middleware
app.use((req, res, next) => {
    res.status(404).render('layouts/layout', { 
        body: '../errors/404',
        message: 'Page not found' 
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('layouts/layout', { 
        body: '../errors/500',
        message: 'Something went wrong!' 
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});