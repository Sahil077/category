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
    technical_tagName: String,
    created_at: Date,
    adminId: String

})

const categories = mongoose.model("categories", categorySchema);

const tagsSchema = new mongoose.Schema({
    technical_tagName: String,
    tags: [],
    adminId: String,
    category_name:String
})

const Technical_tags = mongoose.model("tags", tagsSchema);

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
})

const adminLogin = mongoose.model("adminLogin", adminSchema);

const userSchema = new mongoose.Schema({
    username: String,
    useremail: String,
    created_at: Date,
    payment: false,
    subscriptions_id: '',
    plan_id: ''
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
var admin_userId;
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

        const tag_data = []
        categories.aggregate(
            [{
                $match: {
                    'category_name': req.params.category_name,
                }
            }],
            function (err, categorydata) {
                if (err) throw err;
            console.log('----------  '+ JSON.stringify(categorydata))
                for (var i = 0; i < categorydata.length; i++) {
                    tag_data.push(categorydata[i].technical_tagName)
                }
                Technical_tags.aggregate([{
                        $match: {
                            technical_tagName: {
                                $in: tag_data
                            },
                            'category_name': req.params.category_name
                        }
                    }],
                    function (err, tagData) {
                        if (err) throw err;
                        console.log('TAG = ' + tagData)
                        const finalValue = []
                        // console.log('cat = ' + JSON.stringify(categorydata))
                        for (var j = 0; j < categorydata.length; j++) {
                            for (var tagvalue = 0; tagvalue < tagData.length; tagvalue++) {
                                if (categorydata[j].technical_tagName == tagData[tagvalue].technical_tagName) {
                                    // tagDatavalue.push(tagData[tagvalue].tags)
                                    const finalCategory = {
                                        _id: categorydata[j]._id,
                                        category_name: categorydata[j].category_name,
                                        question: categorydata[j].question,
                                        answer: categorydata[j].answer,
                                        technical_tagName: categorydata[j].technical_tagName,
                                        tags: tagData[tagvalue].tags,
                                        adminId: req.params.adminId,
                                        __v: 0
                                    }
                                    finalValue.push(finalCategory)
                                }
                            }
                        }
                        res.json(finalValue)
                    })

            })
    })

    // Get single Category by ID
    app.get('/categoryID/:id', (req, res) => {
        // console.log('categoryID API HIT')
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
                // tags: tags
            }
        }, function (err, updatedCategory) {
            if (err) throw err;
            Technical_tags.update({
                _id: req.body.technical_tag_id
            }, {
                $set: {
                    technical_tagName: req.body.technical_tagName,
                    tags: tags
                }
            }, function (err, updatedTags) {
                if (err) throw err;
                res.json(updatedCategory)
            })
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
        Technical_tags.aggregate(
            [{
                $match: {
                    tags: tagName,
                }
            }],
            function (err, data) {
                if (err) throw err;
                console.log(data)
                categories.aggregate(
                    [{
                        $match: {
                            technical_tagName: data[0].technical_tagName,
                        }
                    }],
                    function (err, cat_data) {
                        if (err) throw err;
                        // console.log(cat_data)
                        res.json(cat_data)
                    })

            })
    })

    app.post('/user/technicalTag',function(req,res){
        const technical_tagName = req.body.technical_tagName
        const category_name = req.body.category_name
        console.log(technical_tagName)
        console.log(category_name)
        Technical_tags.aggregate(
            [{
                $match: {
                    technical_tagName: technical_tagName,
                    category_name:category_name
                }
            }],
            function (err, tagData) {
                if(err) throw err;
                // console.log(data)
                categories.aggregate(
                    [{
                        $match: {
                            technical_tagName: technical_tagName,
                            category_name:category_name
                        }
                    }],
                    function (err, categorydata) {
                        if(err) throw err;
                        // console.log(category_data)
                        const finalCategory = {
                            _id: categorydata[0]._id,
                            category_name: categorydata[0].category_name,
                            question: categorydata[0].question,
                            answer: categorydata[0].answer,
                            technical_tagName: categorydata[0].technical_tagName,
                            tags: tagData[0].tags,
                            __v: 0
                        }
                        console.log(finalCategory)
                        res.json(finalCategory)
                    })
            })

    })


    app.get('/', (req, res) => {
        res.render('userLogin')
    })

    app.get('/success', (req, res) => {

        if (req.session && userProfile.emails[0].verified == true) {
            console.log('G DETAIL = ' + userProfile)
            userLogincredential.findOne({
                useremail: userProfile.emails[0].value
            }, function (err, data) {
                if (err) throw err;
                if (data) {
                    console.log('OLD USER WITH SUBSCRIPTIOIN')
                    var instance = new Razorpay({
                        key_id: 'rzp_test_umWrzSCH1vLjLL',
                        key_secret: 'e9jv1rohg1D2bWB0DAio3amJ'
                    })
                    var subscriptionDATA = instance.subscriptions.fetch(data.subscriptions_id)
                    subscriptionDATA.then(meta => {
                        console.log('SUB Data = ' + JSON.stringify(meta));
                        if (meta.status == 'active') {
                            sessions = req.session
                            res.redirect('/categories')
                        } else {
                            console.log('OLD USER WITHOUT SUBSCRIPTIOIN')
                            res.redirect('/subscriptionPlan')
                        }
                    }).catch(err => {
                        console.log(err)
                    })
                } else {
                    console.log('NEW USER')
                    new userLogincredential({
                        username: userProfile.displayName,
                        useremail: userProfile.emails[0].value,
                        created_at: new Date(),
                        payment: false,
                        subscriptions_id: '',
                        plan_id: ''
                    }).save(function (err, data) {
                        if (err) {
                            res.sendStatus(400);
                        } else {
                            res.redirect('/subscriptionPlan')
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
            admin_userId = data[0]._id
            // console.log(data)
            res.redirect(`/categories/admin/${data[0]._id}`)
        })

    })
    // HOME PAGHE FOR ADMIN
    app.get('/categories/admin/:adminId', (req, res) => {
        const tech_list = [];
        // console.log(adminUsername)
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
    app.post('/create/category', async (req, res) => {
        var tags = []
        var tags_list = (req.body.tags).split(",")
        for (var tag = 0; tag < tags_list.length; tag++) {
            tags.push((tags_list[tag]).replace(/ /g, ""))
        }
        const adminId = req.body.adminId
        await new categories({
            category_name: req.body.category_name,
            question: req.body.question,
            answer: (req.body.myTextarea).toString(),
            technical_tagName: req.body.technicalTag,
            created_at: req.body.date,
            adminId: req.body.adminId
        }).save(function (err, data) {
            if (err) {
                res.sendStatus(400);
            } else {
                new Technical_tags({
                    technical_tagName: req.body.technicalTag,
                    tags: tags,
                    adminId: req.body.adminId,
                    category_name: req.body.category_name
                }).save(function (err, data) {
                    if (err) {
                        res.sendStatus(400);
                    } else {
                        res.redirect(`/categories/admin/${adminId}`);
                    }
                });
            }
        });
    })

    // Get Categories by Name
    app.get('/categoryName/:adminId/:category_name', (req, res) => {
        // console.log('HERE')
        if (adminUsername) {
            // console.log(req.params.category_name)
            // console.log(req.params.adminId)
            const tag_data = []
            categories.aggregate(
                [{
                    $match: {
                        'category_name': req.params.category_name,
                        'adminId': req.params.adminId
                    }
                }],
                function (err, categorydata) {
                    if (err) throw err;
                console.log('----------  '+ JSON.stringify(categorydata))
                    for (var i = 0; i < categorydata.length; i++) {
                        tag_data.push(categorydata[i].technical_tagName)
                    }
                    Technical_tags.aggregate([{
                            $match: {
                                technical_tagName: {
                                    $in: tag_data
                                },
                                'adminId': req.params.adminId,
                                'category_name': req.params.category_name
                            }
                        }]
                        // Technical_tags.find({ technical_tagName: { $in: tag_data } }
                        ,
                        function (err, tagData) {
                            if (err) throw err;
                            console.log('TAG = ' + tagData)
                            const finalValue = []
                            // console.log('cat = ' + JSON.stringify(categorydata))
                            for (var j = 0; j < categorydata.length; j++) {
                                for (var tagvalue = 0; tagvalue < tagData.length; tagvalue++) {
                                    if (categorydata[j].technical_tagName == tagData[tagvalue].technical_tagName) {
                                        // tagDatavalue.push(tagData[tagvalue].tags)
                                        const finalCategory = {
                                            _id: categorydata[j]._id,
                                            category_name: categorydata[j].category_name,
                                            question: categorydata[j].question,
                                            answer: categorydata[j].answer,
                                            technical_tagName: categorydata[j].technical_tagName,
                                            tags: tagData[tagvalue].tags,
                                            adminId: req.params.adminId,
                                            __v: 0
                                        }
                                        finalValue.push(finalCategory)
                                    }
                                }
                            }
                            res.json(finalValue)
                        })

                })
        } else {
            res.render("adminloginPage")
        }
    })

    app.get("/admin/newfeature/:adminId", function (req, res) {
        // console.log(adminUsername)
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
        // console.log(adminUsername)
        if (adminUsername) {
            categories.findOne({
                _id: req.params.updateID
            }, function (err, updateCategory) {
                if (err) throw err;
                // console.log(updateCategory)
                const update_technical_tag = updateCategory.technical_tagName
                Technical_tags.aggregate([{
                    $match: {
                        technical_tagName: update_technical_tag,
                        adminId: req.params.adminId
                    }
                }]
                // Technical_tags.findOne({
                //     technical_tagName: update_technical_tag
                // }
                , function (err, techData) {
                    if (err) throw err;
                    // console.log(techData)
                    const finalCategory = {
                        _id: updateCategory._id,
                        category_name: updateCategory.category_name,
                        question: updateCategory.question,
                        answer: updateCategory.answer,
                        technical_tagName: update_technical_tag,
                        tags: techData[0].tags,
                        technical_tag_id: techData[0]._id,
                        adminId: req.params.adminId,
                        __v: 0
                    }
                    console.log(finalCategory)
                    res.render('adminfeature', {
                        updateValue: finalCategory,
                        adminId: req.params.adminId,
                        technical_tag_id: finalCategory.technical_tag_id
                    })
                })
            })
        } else {
            res.render("adminloginPage")
        }
    })


    // GET DATA BY TAG NAME
    app.get('/:adminID/tags/:tag', (req, res) => {
        var tagName = req.params.tag
        var adminID = req.params.adminID
        // console.log(adminUsername)
        if (adminUsername) {
            Technical_tags.aggregate(
                [{
                    $match: {
                        tags: tagName,
                        adminId: adminID
                    }
                }],
                function (err, data) {
                    if (err) throw err;
                    console.log('......................................')
                    console.log(data)
                    categories.aggregate(
                        [{
                            $match: {
                                technical_tagName: data[0].technical_tagName,
                                adminId: adminID
                            }
                        }],
                        function (err, cat_data) {
                            if (err) throw err;
                            console.log(cat_data)
                            res.json(cat_data)
                        })

                })

        } else {
            res.render("adminloginPage")
        }
    })


    // DELETE CATEGORY BY ID
    app.delete('/categoryID/:id', (req, res) => {
        console.log(admin_userId)
        categories.findOne({_id: req.params.id},function(err,result){
            if(err) throw err;
            const techname = result.technical_tagName
            Technical_tags.findOne({adminID:admin_userId,technical_tagName:techname,category_name:result.category_name},function(err,tagval){
                if(err) throw err;
                console.log(tagval._id)
                categories.deleteOne({
                    _id: req.params.id
                },function(err,data){
                    if(err) throw err;
                    Technical_tags.deleteOne({
                        _id: tagval._id
                    },function(err,tagdata){
                        if(err) throw err;
                        res.json(tagdata)
                    })
                })
            })
        })
    })

    app.post('/technicalTag',function(req,res){
        const technical_tagName = req.body.technical_tagName
        const category_name = req.body.category_name
        const adminID = req.body.adminID
        console.log(technical_tagName)
        console.log(category_name)
        console.log(adminID)
        Technical_tags.aggregate(
            [{
                $match: {
                    technical_tagName: technical_tagName,
                    adminId: adminID,
                    category_name:category_name
                }
            }],
            function (err, tagData) {
                if(err) throw err;
                // console.log(data)
                categories.aggregate(
                    [{
                        $match: {
                            technical_tagName: technical_tagName,
                            adminId: adminID,
                            category_name:category_name
                        }
                    }],
                    function (err, categorydata) {
                        if(err) throw err;
                        // console.log(category_data)
                        const finalCategory = {
                            _id: categorydata[0]._id,
                            category_name: categorydata[0].category_name,
                            question: categorydata[0].question,
                            answer: categorydata[0].answer,
                            technical_tagName: categorydata[0].technical_tagName,
                            tags: tagData[0].tags,
                            adminId: adminID,
                            __v: 0
                        }
                        console.log(finalCategory)
                        res.json(finalCategory)
                    })
            })

    })

    app.get('/adminLogout', (req, res) => {
        adminUsername = "";
        admin_userId = ""
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
        console.log(req.body)
        const {
            order_id,
            payment_id,
            signature
        } = req.body;

        const razorpay_signature = signature;

        // Pass yours key_secret here
        // const key_secret = 'c9uW8hNPY33pmIWzeoSY0vZP'; //original
        const key_secret = 'e9jv1rohg1D2bWB0DAio3amJ'; // testing

        // STEP 8: Verification & Send Response to User

        // Creating hmac object
        let hmac = crypto.createHmac('sha256', key_secret);

        // Passing the data to be hashed
        hmac.update(order_id + "|" + payment_id);

        // Creating the hmac in the required format
        const generated_signature = hmac.digest('hex');

        console.log(razorpay_signature)
        console.log(generated_signature)
        if (razorpay_signature === generated_signature) {
            sessions = req.session
            // PAYMENT CHANGED FROM FALSE TO TRUE
            // userLogincredential.update({
            //     'useremail': userProfile.emails[0].value
            // }, {
            //     $set: {
            //         'payment': true
            //     }
            // }, function (err, data) {
            //     if (err) throw err;
            //     console.log('UPDATE QUERY =' + data)
            //     res.json({
            //         success: true,
            //         message: "Payment has been verified"
            //     })
            // })
            res.json({
                success: true,
                message: "Payment has been verified"
            })
        } else {
            // PAYMENT DID'NT CHANGED
            // userLogincredential.update({
            //     'useremail': userProfile.emails[0].value
            // }, {
            //     $set: {
            //         'payment': false
            //     }
            // }, function (err, data) {
            //     if (err) throw err;
            //     console.log('UPDATE QUERY for PAYMENT DIDNT CHANGED =' + data)
            //     res.json({
            //         success: true,
            //         message: "Payment has been verified"
            //     })
            // })
            res.json({
                success: false,
                message: "Payment not verified"
            })
        }
    });

    // SUBSCRIPTION PLAN....................

    app.get('/subscriptionPlan', (req, res) => {
        console.log('G DETAIL SUBPLAN = ' + userProfile)
        res.render('subscriptionPlan')
    })

    // CREATE PLAN FOR SUBSCRIPTION
    app.post('/plans', (req, res) => {
        var instance = new Razorpay({
            key_id: 'rzp_test_umWrzSCH1vLjLL',
            key_secret: 'e9jv1rohg1D2bWB0DAio3amJ'
        })

        instance.plans.create({
            period: "daily",
            interval: 7,
            item: {
                name: "Test plan - daily",
                amount: 100,
                currency: "INR"
            }
        }, (err, responce) => {
            if (err) {
                console.log(err)
            } else {
                res.json(responce)
            }
        })
    })

    // CREATE SUBSCRIPTION
    app.post('/subscriptions', (req, res) => {
        var instance = new Razorpay({
            key_id: 'rzp_test_umWrzSCH1vLjLL',
            key_secret: 'e9jv1rohg1D2bWB0DAio3amJ'
        })
        console.log('PLAN ID =' + req.body.id)
        var plan_id = req.body.id
        let experiy_date = Math.floor(new Date('2022.06.30').getTime() / 1000)
        instance.subscriptions.create({
            plan_id: req.body.id,
            customer_notify: 1,
            total_count: 6,
            expire_by: experiy_date,
            addons: [{
                item: {
                    name: "Delivery charges",
                    amount: 100,
                    currency: "INR"
                }
            }]
        }, (err, responce) => {
            if (err) {
                console.log(err)
            } else {
                userLogincredential.update({
                    'useremail': userProfile.emails[0].value
                }, {
                    $set: {
                        'plan_id': plan_id,
                        'subscriptions_id': responce.id
                    }
                }, function (err, data) {
                    if (err) throw err;
                    sessions = req.session
                    res.json(responce)
                })

                // console.log('SUB = ' + responce)
                // res.json(responce)
            }
        })
    })

    app.post('/verifypayment', (req, res) => {
        const razorpay_payment_id = req.body.payment_id
        const razorpay_signature = req.body.signature

        userLogincredential.findOne({
            useremail: userProfile.emails[0].value
        }, function (err, data) {
            if (err) throw err;
            console.log('PAYEMNT = ' + data.subscriptions_id)
            const subscription_id = data.subscriptions_id
            var secret = "e9jv1rohg1D2bWB0DAio3amJ"
            // generated_signature = hmac_sha256(razorpay_payment_id + "|" + subscription_id, secret);
            let hmac = crypto.createHmac('sha256', secret);
            hmac.update(subscription_id + "|" + razorpay_payment_id);
            const generated_signature = hmac.digest('hex');
            console.log(generated_signature)
            console.log(razorpay_signature)
            if (generated_signature == razorpay_signature) {
                res.json({
                    success: true
                })
            } else {
                res.json({
                    success: false
                })
            }
        })
    })



}
