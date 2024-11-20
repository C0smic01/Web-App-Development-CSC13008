const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const path = require("path");
const expressLayouts = require('express-ejs-layouts');
const { sequelize } = require('./models');

const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'sessions',
    checkExpirationInterval: 15 * 60 * 1000, // Clean up expired sessions every 15 minutes
    expiration: 24 * 60 * 60 * 1000  // Session expires after 24 hours
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, 
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'http://localhost:3000',
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-dev-secret-key', 
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict' 
    }
}));

sessionStore.sync();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const authMiddleware = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

app.use(authMiddleware);

const homeRoutes = require('./routes/homeRoutes');
app.use('/', homeRoutes);
const shopRoutes = require('./routes/shopRoutes');
app.use('/shop', shopRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);
const cartRoutes = require('./routes/cartRoutes');
app.use('/cart', cartRoutes);

const productController = require('./controllers/productController.js')
app.get('/products/partial',productController.getProducts)

const productRoutes = require('./routes/productRoutes')
app.use('/products',productRoutes)

// Static routes
app.get('/about', (req, res) => {   
    res.render('../about/about' );
});

app.get('/contact', (req, res) => {
    res.render('../contact/contact' );
});

// app.use((req, res, next) => {
//     res.status(404).render('layouts/layout', { 
//         body: '../errors/404',
//         message: 'Page not found' 
//     });
// });



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('layouts/layout', { 
        body: '../errors/500',
        message: 'Something went wrong!' 
    });
});

const AppErrorHandler = require('./utils/AppErrorHandler.js')
app.use(AppErrorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});