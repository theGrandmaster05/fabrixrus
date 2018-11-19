const express = require('express')
    , router = express.Router()
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, user) => {
        done(err, user);
    });
});
passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, username, password, done) => {
    User.getUserByEmail(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            console.log('Unknown User');
            return done(null, false, { message: 'Unknown User' });
        };
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                console.log('Successful');
                return done(null, user);
            } else {
                console.log('Invalid Password');
                return done(null, false, { message: 'Invalid Password' });
            }
        });

    });
}));


router.get('/login', (req, res) => {
    res.render('admin/login', {
        title: 'Admin Login'
    });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/products', failureFlash: "Invalid Username and/or password"
}), (req, res) => {
    console.log('Admin Authentication Successful');
    req.flash('Success', 'You are successfully logged in');
    if (req.user.isAdmin === 'admin') {
        res.redirect(302, '/contact');
    } else {
        res.redirect(302, 'products');
    }
});

// router.get('/admin/register', (req, res) => {
//     res.render('admin/register', {
//         title: 'Admin Register'
//     });
// });

// router.post('/admin/register',(req,res) => {
//     let email = req.body.email;
//     let password = req.body.password;
//     let password2 = req.body.password;

//     //form validation
//     req.checkBody('email', 'Email field is required').notEmpty();
//     req.checkBody('email', 'Please enter a valid email').isEmail();
//     req.checkBody('password', 'Password is required').notEmpty();
//     req.checkBody('password2', 'Passwords don\'t match').equals(password2);

//     //checking for errors
//     let errors = req.validationErrors();
//     if (errors) {
//         res.render('admin/register', {
//             errors: errors,
//             title: 'Admin Register',
//             email: email,
//             password: password,
//             password2: password2
//         });
//     } else {
//         User.getUserByEmail(email, (err, itExists) => {
//             if (err) throw err;
//             if (itExists) {
//                 console.log('Email already exists');
//                 let emailExistsError = "Email already exists";
//                 res.render('admin/register', {
//                     emailExists: emailExistsError,
//                     title: 'Admin Register',
//                     email: email,
//                     password: password,
//                     password2: password2
//                 });
//             } else {
//                 let newUser = new User({
//                     email: email,
//                     isAdmin: 'admin',
//                     password: password
//                 });

//                 //create user
//                 User.createUser(newUser, (err, user) => {
//                     if (err) throw err;
//                     console.log(user);
//                 });
//                 req.flash('success', 'You are registered');
//                 res.location('/');
//                 res.redirect(302, '/contact');
//             }
//         });
//     }    
// });


module.exports = router;