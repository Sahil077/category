const mongoose = require("mongoose");
mongoose.pluralize(null);
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const Razorpay = require('razorpay');
var crypto = require('crypto');

mongoose.connect("mongodb+srv://intadmin:intramin123@cluster0.2hbsso0.mongodb.net/categories?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const categorySchema = new mongoose.Schema({
    category_name: String,
    question: String,
    answer: String,
    tags: [],
    created_at: Date,
    adminId: String

})

const categories = mongoose.model("categories", categorySchema);

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
})

const adminLogin = mongoose.model("adminLogin", adminSchema);

const userSchema = new mongoose.Schema({
    username: String,
    useremail: String,
    created_at: Date,
    payment: false
})

const userLogincredential = mongoose.model("userLogincredential", userSchema);

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj.id);
});

var userProfile;
var sessions;
var adminUsername;
/*  Google AUTH  */

const GOOGLE_CLIENT_ID = '65610686925-bko50g7l2c7hrkqqcpvadi3hitv6ito3.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "https://interviewhelp.me/auth/google/callback",
        scope: ['profile', 'email'],
    },
    function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        return done(null, userProfile);
    }
));

const razorpayInstance = new Razorpay({

    // Replace with your key_id
    key_id: 'rzp_live_5V9Rr2HtEbDI2n',
    // Replace with your key_secret
    key_secret: 'c9uW8hNPY33pmIWzeoSY0vZP'
});

module.exports = function (app) {

    app.get('/auth/google',
        passport.authenticate('google', {
            scope: ['profile', 'email']
        }));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/error'
        }),
        function (req, res) {
            // Successful authentication, redirect success.
            res.redirect('/success');
        });

    // Read all catetories & HOME PAGE for REGULAR
    app.get('/categories', (req, res) => {

        if (sessions) {
            const tech_list = [];
            categories.find({}, (err, data) => {
                if (err) throw err;
                for (i = 0; i < data.length; i++) {
                    tech_list.push(data[i].category_name);
                }
                const tech_name = Array.from(new Set(tech_list));
                res.render('regular', {
                    techList: tech_name
                })
            })
        } else {
            res.render('auth')
        }
    })



    // Get Categories by Name
    app.get('/categoryName/:category_name', (req, res) => {

        categories.find({
            'category_name': req.params.category_name
        }).
        then(updateCategory =>
                res.json(updateCategory)
            )
            .catch(err => {
                res.json(err)
            })
    })

    // Get single Category by ID
    app.get('/categoryID/:id', (req, res) => {
        console.log('categoryID API HIT')
        categories.findOne({
            _id: req.params.id
        }).
        then(updateCategory => res.json(updateCategory))
            .catch(err => {
                console.log(err)
                res.json(err)
            })
    })


    // update category by category name
    app.put('/categoryName/:category_name', (req, res) => {

        categories.update({
                'category_name': req.params.category_name
            }, {
                $set: {
                    'question': req.body.question,
                    answer: req.body.answer,
                    'tags': req.body.tags,
                }
            }).then(updateCategory =>
                res.json(updateCategory)
            )
            .catch(err => {
                res.json(err)
            })
    })

    // update category by category id
    app.put('/categoryID/:id', (req, res) => {
        console.log(req.params.id)
        console.log(req.body)
        var tags = []
        if (req.body.tags) {
            var tags_list = (req.body.tags).split(",")
            for (var tag = 0; tag < tags_list.length; tag++) {
                tags.push((tags_list[tag]).replace(/ /g, ""))
            }
        }
        categories.update({
                _id: req.params.id
            }, {
                $set: {
                    question: req.body.question,
                    answer: req.body.answer,
                    tags: tags
                }
            }).then(updateCategory =>
                res.json(updateCategory)
            )
            .catch(err => {
                res.json(err)
            })
    })


    // // upodate by ID
    app.get('/admin/feature/:id', (req, res) => {

        categories.findOne({
            _id: req.params.id
        }).
        then(updateCategory =>
                res.render('adminfeature', {
                    updateValue: updateCategory
                })
            )
            .catch(err => {
                res.json(err)
            })
    })

    // delete category by category name
    app.delete('/categoryName/:category_name', (req, res) => {

        categories.deleteOne({
                'category_name': req.params.category_name
            }).then(updateCategory =>
                res.json(updateCategory)
            )
            .catch(err => {
                res.json(err)
            })
    })


    // GET DATA BY TAG NAME
    app.get('/tags/:tag', (req, res) => {
        var tagName = req.params.tag

        categories.find({
            tags: tagName
        }, (err, data) => {
            if (err) throw err;
            res.json(data)
        })
    })

    app.get('/', (req, res) => {
        res.render('userLogin')
    })

    app.get('/success', (req, res) => {

        if (req.session && userProfile.emails[0].verified == true) {

            userLogincredential.findOne({
                useremail: userProfile.emails[0].value
            }, function (err, data) {
                if (err) throw err;
                  console.log('PAYEMNT = ' +data)
                if (data) {
                    console.log('PAYEMNT = ' + data[0].payment)
                    if (data[0].payment == true) {
                        sessions = req.session
                        res.redirect('/categories')
                    } else {
                        res.redirect('/subscription')
                    }
                } else {
                    new userLogincredential({
                        username: userProfile.displayName,
                        useremail: userProfile.emails[0].value,
                        created_at: new Date(),
                        payment:false
                    }).save(function (err, data) {
                        if (err) {
                            res.sendStatus(400);
                        } else {
                            res.redirect('/subscription')
                        }
                    });
                }
            })
        } else {
            res.send("error logging in")
        }
    });

    app.get('/error', (req, res) =>
        res.send("error logging in")
    );

    app.get('/logout', (req, res) => {
        sess = req.session;
        var data = {
            "Data": ""
        };
        sess.destroy(function (err) {
            if (err) {
                data["Data"] = 'Error destroying session';
                res.json(data);
            } else {
                // data["Data"] = 'Session destroy successfully';
                sessions = ''
                // res.json(data);
                res.redirect("/");
            }
        });
    });

    // ADMIN PAGES BY NORMAL AUTH .............................................................
    app.get('/loginAdmin', (req, res) =>
        res.render("adminloginPage")
    );

    app.post('/adminLogin', (req, res) => {
        const username = (req.body.username).toLowerCase()
        const pass = req.body.password
        adminLogin.find({
            username: username,
            password: pass
        }, (err, data) => {
            if (err) throw err;
            adminUsername = username
            res.redirect(`/categories/admin/${data[0]._id}`)
        })

    })
    // HOME PAGHE FOR ADMIN
    app.get('/categories/admin/:adminId', (req, res) => {
        const tech_list = [];
        console.log(adminUsername)
        if (adminUsername) {
            categories.find({
                adminId: req.params.adminId
            }, (err, data) => {
                if (err) throw err;
                for (i = 0; i < data.length; i++) {
                    tech_list.push(data[i].category_name);
                }
                const tech_name = Array.from(new Set(tech_list));
                res.render('home', {
                    techList: tech_name,
                    adminId: req.params.adminId
                })
            })
        } else {
            res.render("adminloginPage")
        }
    })

    // Create category
    app.post('/create/category', (req, res) => {
        // console.log((req.body.myTextarea).toString())
        var tags = []
        var tags_list = (req.body.tags).split(",")
        for (var tag = 0; tag < tags_list.length; tag++) {
            tags.push((tags_list[tag]).replace(/ /g, ""))
        }
        const adminId = req.body.adminId
        new categories({
            category_name: req.body.category_name,
            question: req.body.question,
            answer: (req.body.myTextarea).toString(),
            tags: tags,
            created_at: req.body.date,
            adminId: req.body.adminId
        }).save(function (err, data) {
            if (err) {
                res.sendStatus(400);
            } else {
                res.redirect(`/categories/admin/${adminId}`);
            }
        });
    })

    // Get Categories by Name
    app.get('/categoryName/:adminId/:category_name', (req, res) => {
        console.log(adminUsername)
        if (adminUsername) {
            categories.aggregate(
                [{
                    $match: {
                        'category_name': req.params.category_name,
                        'adminId': req.params.adminId
                    }
                }]
            ).
            then(updateCategory =>
                    res.json(updateCategory)
                )
                .catch(err => {
                    res.json(err)
                })
        } else {
            res.render("adminloginPage")
        }
    })

    app.get("/admin/newfeature/:adminId", function (req, res) {
        console.log(adminUsername)
        if (adminUsername) {
            res.render('adminfeature', {
                updateValue: "",
                adminId: req.params.adminId
            });
        } else {
            res.render("adminloginPage")
        }
    });

    app.get("/admin/feature/adminId/:adminId/updateID/:updateID", function (req, res) {
        console.log(adminUsername)
        if (adminUsername) {
            categories.findOne({
                _id: req.params.updateID
            }).
            then(updateCategory =>
                    res.render('adminfeature', {
                        updateValue: updateCategory,
                        adminId: req.params.adminId
                    })
                )
                .catch(err => {
                    res.json(err)
                })
        } else {
            res.render("adminloginPage")
        }
    })

    app.put('/categoryID/:id', (req, res) => {
        console.log((req.body))
        var tags = []
        if (req.body.tags) {
            var tags_list = (req.body.tags).split(",")
            for (var tag = 0; tag < tags_list.length; tag++) {
                tags.push((tags_list[tag]).replace(/ /g, ""))
            }
        }
        categories.update({
                _id: req.params.id
            }, {
                $set: {
                    question: req.body.question,
                    answer: (req.body.answer).toString(),
                    tags: tags
                }
            }).then(updateCategory =>
                res.json(updateCategory)
            )
            .catch(err => {
                res.json(err)
            })
    })

    // GET DATA BY TAG NAME
    app.get('/:adminID/tags/:tag', (req, res) => {
        var tagName = req.params.tag
        var adminID = req.params.adminID
        console.log(adminUsername)
        if (adminUsername) {
            categories.aggregate(
                [{
                    $match: {
                        tags: tagName,
                        adminId: adminID
                    }
                }]
            ).
            then(data =>
                    res.json(data)
                )
                .catch(err => {
                    res.json(err)
                })
        } else {
            res.render("adminloginPage")
        }
    })


    // DELETE CATEGORY BY ID
    app.delete('/categoryID/:id', (req, res) => {
        console.log(adminUsername)
        categories.deleteOne({
                _id: req.params.id
            }).then(updateCategory =>
                res.json(updateCategory)
            )
            .catch(err => {
                res.json(err)
            })
    })

    app.get('/adminLogout', (req, res) => {
        adminUsername = ""
        res.render('adminloginPage')
    })

    // PAYEMENT API'S

    app.get('/privacy_policy', (req, res) => {
        res.render('privacy_policy')
    })
    app.get('/terms_condition', (req, res) => {
        res.render('terms_condition')
    })
    app.get('/return_policy', (req, res) => {
        res.render('return_policy')
    })

    app.get('/aboutUs', (req, res) => {
        res.render('aboutUs')
    })
    app.get('/contactUs', (req, res) => {
        res.render('contactUs')
    })

    app.get('/subscription', (req, res) => {
        res.render('subscription')
    })

    //Inside app.js
    app.post('/createOrder', (req, res) => {

        // STEP 1:
        const {
            amount,
            currency,
            receipt
        } = req.body;

        // STEP 2:	
        razorpayInstance.orders.create({
                amount,
                currency,
                receipt
            },
            (err, order) => {

                //STEP 3 & 4:
                if (!err)
                    res.json(order)
                else
                    res.send(err);
            }
        )
    });

    //Inside app.js
    app.post('/verifyOrder', (req, res) => {

        // STEP 7: Receive Payment Data
        const {
            order_id,
            payment_id,
            signature
        } = req.body;
        const razorpay_signature = signature;

        // Pass yours key_secret here
        const key_secret = 'c9uW8hNPY33pmIWzeoSY0vZP';

        // STEP 8: Verification & Send Response to User

        // Creating hmac object
        let hmac = crypto.createHmac('sha256', key_secret);

        // Passing the data to be hashed
        hmac.update(order_id + "|" + payment_id);

        // Creating the hmac in the required format
        const generated_signature = hmac.digest('hex');


        if (razorpay_signature === generated_signature) {
            sessions = req.session
            // PAYMENT CHANGED FROM FALSE TO TRUE
            userLogincredential.update({
                'useremail': userProfile.emails[0].value
            }, {
                $set: {
                    'payment': true
                }
            })
            res.json({
                success: true,
                message: "Payment has been verified"
            })
        } else
            // PAYMENT CHANGED FROM FALSE TO TRUE
            userLogincredential.update({
                'useremail': userProfile.emails[0].value
            }, {
                $set: {
                    'payment': false
                }
            })
        res.json({
            success: false,
            message: "Payment verification failed"
        })
    });




}
