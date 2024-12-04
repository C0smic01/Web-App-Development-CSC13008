const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const path = require("path");
const expressLayouts = require('express-ejs-layouts');
const { sequelize } = require('./models');
const { User } = require('./models');


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ 
            where: { email },
            attributes: ['user_id', 'user_name', 'email', 'password']
        });

        if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id, {
            attributes: ['user_id', 'user_name', 'email']
        });
        done(null, user);
    } catch (error) {
        done(error);
    }
});

const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'sessions',
    checkExpirationInterval: 5 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-dev-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    }
}));

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
    res.locals.user = req.user || null; 

    next();
});


// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'http://54.196.6.12:3000/' : 'http://localhost:3000',
    credentials: true
}));


sessionStore.sync();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/cart', express.static(path.join(__dirname, 'cart')));
const authMiddleware = (req, res, next) => {
    res.locals.user = req.user || null;
    next();
};

app.use(authMiddleware);

const homeRoutes = require('./home/routes/homeRoutes.js');
app.use('/', homeRoutes);
const shopRoutes = require('./shop/routes/shopRoutes.js');
app.use('/shop', shopRoutes);
const authRoutes = require('./authentication/routes/authRoutes.js');
app.use('/auth', authRoutes);
const cartRoutes = require('./cart/routes/cartRoutes.js');
app.use('/cart', cartRoutes);

const orderRoutes = require('./order/routes/orderRoutes.js')
app.use('/order',orderRoutes)
const productController = require('./shop/controllers/productController.js')
app.get('/products/partial',productController.getProducts)

const productRoutes = require('./shop/routes/productRoutes.js')
app.use('/products',productRoutes)

// Static routes
app.get('/about', (req, res) => {   
    res.render('about/about' );
});

app.get('/contact', (req, res) => {
    res.render('contact/contact' );
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