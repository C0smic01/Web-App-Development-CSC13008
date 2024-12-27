const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const path = require("path");
const expressLayouts = require('express-ejs-layouts');
const { sequelize, User } = require('./index.js');


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ 
            where: { email },
            attributes: ['user_id', 'user_name', 'email', 'password', 'is_verified', 'token', 'token_expired_at']
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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === "production" 
    ? "https://cara.c0smic.tech/auth/google/callback"
    : "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({
            where: { email: profile.emails[0].value }
        });

        if (existingUser) {
            return done(null, existingUser);
        }

        const newUser = await User.create({
            user_name: profile.name.familyName + ' ' + profile.name.givenName,
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-8),
            is_verified: true
        });

        return done(null, newUser);
    } catch (error) {
        return done(error, null);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id, {
            attributes: ['user_id', 'user_name', 'email', 'avatar']
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
        sameSite: 'lax'
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
    origin: process.env.NODE_ENV === 'production' ? 'http://54.196.6.12:3000' : ['http://localhost:3000', 'http://localhost:5173'],
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
app.use('/order', orderRoutes)

const profileRoutes = require('./profile/routes/profileRoutes.js')
app.use('/profile', profileRoutes)

const productController = require('./shop/controllers/productController.js')
app.get('/products/partial', productController.getProducts)

const productRoutes = require('./shop/routes/productRoutes.js')
app.use('/products', productRoutes)

const reviewRoutes = require('./shop/routes/reviewRoutes.js')
app.use('/reviews', reviewRoutes)

const categoryRoutes = require('./shop/routes/categoryRoutes.js')
app.use('/categories', categoryRoutes)

const manufacturerRoutes = require('./shop/routes/manufacturerRoutes.js')
app.use('/manufacturers', manufacturerRoutes)

// Static routes
app.get('/about', (req, res) => {   
    res.render('about/about' );
});

app.get('/contact', (req, res) => {
    res.render('contact/contact' );
});



const AppErrorHandler = require('./utils/AppErrorHandler.js')
app.use(AppErrorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});