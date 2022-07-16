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

const jobRoleSchema = new mongoose.Schema({
    category_name: String,
    created_at: Date,
    adminId: String,
    Techtag_id: []

})

const Jobrole = mongoose.model("Jobrole", jobRoleSchema);

const technicalTagSchema = new mongoose.Schema({
    technical_tagName: String,
    adminId: String,
    Jobrole_ID: String
})

const TechnicalTags = mongoose.model("TechnicalTags", technicalTagSchema);

const QuestionAnswerSchema = new mongoose.Schema({
    question: String,
    answer: String,
    adminId: String,
    Jobrole_ID: String,
    technicalTag_ID: String
})

const QuestionAnswer = mongoose.model("QuestionAnswer", QuestionAnswerSchema);


const subTagsSchema = new mongoose.Schema({
    sub_tags: [],
    adminId: String,
    Jobrole_ID: String,
    technicalTag_ID: String,
    QuestionAnswer_ID: String
})

const SubTags = mongoose.model("SubTags", subTagsSchema);

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
})

const adminLogin = mongoose.model("adminLogin", adminSchema);

const userSchema = new mongoose.Schema({
    username: String,
    useremail: String,
    created_at: Date,
    subscriptions_id: '',
    plan_id: ''
})

const userLogincredential = mongoose.model("userLogincredential", userSchema);


// ...................

const QASchema = new mongoose.Schema({
    jobrole_id: String,
    techTag_id: String,
    answer: String,
    question: String,
    sub_tag: []
})

const QA = mongoose.model("QA", QASchema);

const Sub_tagSchema = new mongoose.Schema({
    jobrole_id: String,
    technicalTag_id: String,
    SubtagName: String,
    QuestionTag: []
})

const Sub_Tag = mongoose.model("Sub_Tag", Sub_tagSchema);

const TechtagSchema = new mongoose.Schema({
    jobrole_id: String,
    techTagname: String,
    sub_tags: []
})

const Techtag = mongoose.model("Techtag", TechtagSchema);


// ........................

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
// const GOOGLE_CLIENT_ID = '617974857461-1j81j345gfd1ctlthqlvmh4kccjnirfq.apps.googleusercontent.com';
// const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "https://interviewhelp.me/auth/google/callback",
        // callbackURL: "http://localhost:3000/auth/google/callback",
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
                    console.log('----------  ' + JSON.stringify(categorydata))
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
            console.log(req.params.id)
            QuestionAnswer.findOne({
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
            console.log('data ============= ' + JSON.stringify(req.body))
            var tags = []
            if (req.body.tags) {
                var tags_list = (req.body.tags).split(",")
                for (var tag = 0; tag < tags_list.length; tag++) {
                    tags.push((tags_list[tag]).replace(/ /g, ""))
                }
            }
            QuestionAnswer.update({
                _id: req.params.id
            }, {
                $set: {
                    question: req.body.question,
                    answer: (req.body.answer).toString(),
                }
            }, function (err, updatedQuestions) {
                if (err) throw err;
                SubTags.update({
                    QuestionAnswer_ID: req.params.id
                }, {
                    $set: {
                        sub_tags: tags
                    }
                }, function (err, updatedTags) {
                    if (err) throw err;
                    console.log(updatedTags)
                    res.json(updatedQuestions)
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

        app.post('/user/technicalTag', function (req, res) {
            const technical_tagName = req.body.technical_tagName
            const category_name = req.body.category_name
            console.log(technical_tagName)
            console.log(category_name)
            Technical_tags.aggregate(
                [{
                    $match: {
                        technical_tagName: technical_tagName,
                        category_name: category_name
                    }
                }],
                function (err, tagData) {
                    if (err) throw err;
                    // console.log(data)
                    categories.aggregate(
                        [{
                            $match: {
                                technical_tagName: technical_tagName,
                                category_name: category_name
                            }
                        }],
                        function (err, categorydata) {
                            if (err) throw err;
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
             
                userLogincredential.count({
                    useremail: userProfile.emails[0].value
                }, (err, Rolecounter) => {
                    if (err) throw err;
                    if (Rolecounter > 0) {
                        userLogincredential.findOne({
                            useremail: userProfile.emails[0].value
                        }, function (err, data) {
                            if (err) throw err;
                            console.log('OLD USER WITH SUBSCRIPTIOIN')
                            // SUBSCRIPTION RAZORPAY CREDENTIALS
                            var instance = new Razorpay({
                                key_id: 'rzp_live_5V9Rr2HtEbDI2n',
                                key_secret: 'c9uW8hNPY33pmIWzeoSY0vZP'
                            })

                            var subscriptionDATA = instance.subscriptions.fetch(data.subscriptions_id)
                            subscriptionDATA.then(meta => {
                                // console.log('SUB Data = ' + JSON.stringify(meta));
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
                        })
                    }else{
                        console.log('NEW USER')
                        new userLogincredential({
                            username: userProfile.displayName,
                            useremail: userProfile.emails[0].value,
                            created_at: new Date(),
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
        // HOME PAGHE FOR ADMIN OLD
        // app.get('/categories/admin/:adminId', (req, res) => {
        //     const tech_list = [];
        //     console.log(adminUsername  + '466')
        //     if (adminUsername) {
        //         Jobrole.find({
        //             // adminId: req.params.adminId
        //         }, (err, data) => {
        //             if (err) throw err;
        //             for (i = 0; i < data.length; i++) {
        //                 // tech_list.push(data[i].category_name);
        //                 tech_list.push({
        //                     role:data[i].category_name,
        //                     role_id:data[i]._id
        //                 })
        //             }

        //             res.render('home', { 
        //                 techList: tech_list,
        //                 adminId: req.params.adminId
        //             })
        //         })
        //     } else {
        //         res.render("adminloginPage")
        //     }
        // })

        // Create category
        app.post('/create/category', async (req, res) => {
            var tags = []
            console.log(req.body.tags)
            var tags_list = (req.body.tags).split(",")
            for (var tag = 0; tag < tags_list.length; tag++) {
                tags.push((tags_list[tag]).replace(/ /g, ""))
            }
            const adminId = req.body.adminId

            Jobrole.findOne({
                category_name: req.body.category_name,
                // adminId: req.body.adminId
            }, function (err, jobrolePresent) {
                if (err) throw err;
                var jobrolePresent_id = ''
                var TechnicalTagsPresent_id = ''
                var QuestionAnswerPresent_id = ''
                if (jobrolePresent) {
                    console.log('----------- old ' + jobrolePresent)
                    jobrolePresent_id = (jobrolePresent._id).toString()
                }
                if (!jobrolePresent) {
                    console.log(req.body)
                    new Jobrole({
                        category_name: req.body.category_name,
                        created_at: req.body.date,
                        // adminId: req.body.adminId
                    }).save(function (err, Jobroledata) {
                        if (err) throw err;
                        console.log('----------- new ' + (Jobroledata._id).toString())
                        // console.log('----------- new '+ (Jobroledata[0]._id).toString())
                        jobrolePresent_id = (Jobroledata._id).toString()
                    })
                }

                function jobLoadId() {
                    console.log('JOBID =' + jobrolePresent_id)
                    TechnicalTags.findOne({
                        technical_tagName: req.body.technicalTag,
                        // adminId: req.body.adminId,
                        Jobrole_ID: jobrolePresent_id
                    }, function (err, TechnicalTagsPresent) {
                        if (err) throw err;
                        if (TechnicalTagsPresent) {
                            console.log('----------- old ' + TechnicalTagsPresent)
                            TechnicalTagsPresent_id = (TechnicalTagsPresent._id).toString()
                        }
                        if (!TechnicalTagsPresent) {
                            new TechnicalTags({
                                technical_tagName: req.body.technicalTag,
                                // adminId: req.body.adminId,
                                Jobrole_ID: jobrolePresent_id
                            }).save(function (err, TechnicalTagsdata) {
                                if (err) throw err;
                                console.log('----------- new ' + (TechnicalTagsdata))
                                TechnicalTagsPresent_id = (TechnicalTagsdata._id).toString()
                            })
                        }

                        function techtagid() {
                            QuestionAnswer.findOne({
                                    question: req.body.question,
                                    // adminId: req.body.adminId,
                                    Jobrole_ID: jobrolePresent_id,
                                    technicalTag_ID: TechnicalTagsPresent_id
                                },
                                function (err, QuestionAnswerPresent) {
                                    if (err) throw err;
                                    if (QuestionAnswerPresent) {
                                        new SubTags({
                                            sub_tags: tags,
                                            QuestionAnswer_ID: (QuestionAnswerPresent._id).toString(),
                                            Jobrole_ID: jobrolePresent_id,
                                            technicalTag_ID: TechnicalTagsPresent_id,
                                            // adminId: req.body.adminId,
                                        }).save(function (err, SubTags) {
                                            if (err) throw err;
                                            console.log(SubTags)
                                            res.json('done ')
                                            // res.redirect(`/categories/admin/${adminId}`);
                                        });
                                    }
                                    if (!QuestionAnswerPresent) {
                                        console.log('NEW jobrolePresent_id = ' + jobrolePresent_id)
                                        console.log('NEW TechnicalTagsPresent_id = ' + TechnicalTagsPresent_id)
                                        new QuestionAnswer({
                                            question: req.body.question,
                                            answer: (req.body.myTextarea).toString(),
                                            // adminId: req.body.adminId,
                                            Jobrole_ID: jobrolePresent_id,
                                            technicalTag_ID: TechnicalTagsPresent_id,
                                            // adminId: req.body.adminId,
                                        }).save(function (err, QuestionAnswerdata) {
                                            if (err) throw err;
                                            new SubTags({
                                                sub_tags: tags,
                                                QuestionAnswer_ID: (QuestionAnswerdata._id).toString(),
                                                Jobrole_ID: jobrolePresent_id,
                                                technicalTag_ID: TechnicalTagsPresent_id,
                                                // adminId: req.body.adminId,
                                            }).save(function (err, SubTags) {
                                                if (err) throw err;
                                                console.log(SubTags)
                                                // res.json('done ')
                                                res.redirect(`/categories/admin/${adminId}`);
                                            });
                                        })
                                    }

                                })
                        }
                        setTimeout(techtagid, 80);
                    })
                }
                setTimeout(jobLoadId, 50);
            })


        })

        // Get JOB ROLE by ID
        app.get('/jobrole/:adminId/:role_id', (req, res) => {
            console.log('HERE')
            if (adminUsername) {
                const techTag_id = []
                const final_tagsList = []
                TechnicalTags.aggregate([{
                    $match: {
                        // adminId: req.params.adminId , 
                        Jobrole_ID: req.params.role_id
                    }
                }], function (err, TechnicalTagsdata) {
                    if (err) throw err;
                    // console.log(TechnicalTagsdata)
                    for (var i = 0; i < TechnicalTagsdata.length; i++) {
                        techTag_id.push((TechnicalTagsdata[i]._id).toString())
                    }
                    // console.log(techTag_id)
                    SubTags.aggregate([{
                        $match: {
                            //  'adminId': req.params.adminId , 
                            technicalTag_ID: {
                                $in: techTag_id
                            }
                        }
                    }], function (err, subTagsdata) {
                        if (err) throw err;
                        console.log(TechnicalTagsdata.length)
                        for (var j = 0; j < TechnicalTagsdata.length; j++) {
                            for (var i = 0; i < subTagsdata.length; i++) {
                                if ((TechnicalTagsdata[j]._id).toString() == subTagsdata[i].technicalTag_ID) {
                                    // console.log(TechnicalTagsdata[j].technical_tagName+  ' == ' +subTagsdata[i].technicalTag_ID)
                                    const finaldata = {
                                        technicalTagname: TechnicalTagsdata[j].technical_tagName,
                                        technicalTag_id: subTagsdata[i].technicalTag_ID,
                                        subTags: subTagsdata[i].sub_tags,
                                        subTag_id: (subTagsdata[i]._id).toString(),
                                        // adminID:subTagsdata[i].adminId,
                                        QuestionAnswer_ID: subTagsdata[i].QuestionAnswer_ID,
                                        Jobrole_ID: subTagsdata[i].Jobrole_ID
                                    }
                                    // console.log(finaldata)
                                    final_tagsList.push(finaldata)
                                }
                            }
                        }
                        res.json(final_tagsList)
                    })
                })

            } else {
                res.render("adminloginPage")
            }
        })


        app.get("/admin/feature/adminId/:adminId/updateID/:updateID", function (req, res) {
            // console.log(adminUsername)
            console.log(req.params.updateID)
            var id = req.params.updateID
            if (adminUsername) {
                QuestionAnswer.find({
                    _id: new mongoose.Types.ObjectId(id)
                }, function (err, questionData) {
                    if (err) throw err;
                    // console.log('.....------------------------')
                    // console.log(questionData)
                    SubTags.find({
                        QuestionAnswer_ID: id
                    }, function (err, subtagData) {
                        if (err) throw err;
                        // console.log('.....------------------------')
                        // console.log(subtagData)
                        Jobrole.find({
                            _id: new mongoose.Types.ObjectId(questionData[0].Jobrole_ID)
                        }, function (err, roleData) {
                            if (err) throw err;
                            console.log('.....------------------------')
                            // console.log(roleData)
                            TechnicalTags.find({
                                _id: new mongoose.Types.ObjectId(questionData[0].technicalTag_ID)
                            }, function (err, technicaltagData) {
                                if (err) throw err;
                                // console.log('.....------------------------')
                                // console.log(technicaltagData)
                                const updateData = {
                                    question: questionData[0].question,
                                    answer: questionData[0].answer,
                                    tags: subtagData[0].sub_tags,
                                    _id: new mongoose.Types.ObjectId(id)
                                }
                                console.log(updateData)
                                res.render('adminfeature', {
                                    updateValue: updateData,
                                    adminId: req.params.adminId,
                                    // technical_tag_id: finalCategory.technical_tag_id
                                })
                            })
                        })
                    })

                })
            }
        })


        // GET DATA BY TAG NAME
        app.post('/:adminID/subtags', (req, res) => {

            var jobRoleid = req.body.jobRoleid
            var subtagName = req.body.subtagName
            var adminID = req.body.adminID
            // console.log(req.body)
            if (adminUsername) {
                SubTags.aggregate([{
                    $match: {
                        sub_tags: subtagName,
                        // adminId:adminID,
                        Jobrole_ID: jobRoleid,
                    }
                }], function (err, SubtagsData) {
                    if (err) throw err;
                    // console.log(SubtagsData)
                    const questionId = []
                    for (var i = 0; i < SubtagsData.length; i++) {
                        questionId.push((SubtagsData[i].QuestionAnswer_ID))
                    }
                    // console.log(questionId)
                    var obj_ids = questionId.map(function (id) {
                        return new mongoose.Types.ObjectId(id);
                    });
                    QuestionAnswer.aggregate([{
                        $match: {
                            _id: {
                                $in: obj_ids
                            },
                            // ,adminId:adminID,
                            Jobrole_ID: jobRoleid
                        }
                    }], function (err, questionData) {
                        if (err) throw err;
                        res.json(questionData)
                    })
                })
            }
        })


        // DELETE CATEGORY BY ID
        app.delete('/categoryID/:id', (req, res) => {
            // console.log(admin_userId)

            SubTags.deleteMany({
                QuestionAnswer_ID: req.params.id
            }, function (err, result) {
                if (err) throw err;
                console.log(result)
                QuestionAnswer.deleteMany({
                    _id: new mongoose.Types.ObjectId(req.params.id)
                }, function (err, result) {
                    if (err) throw err;
                    res.json(result)

                })
            })
        })

        app.post('/technicalTag', function (req, res) {
            const technical_tagName = req.body.technical_tagName
            const technicalTag_id = req.body.technicalTag_id
            const adminID = req.body.adminID
            console.log(technical_tagName)
            console.log(adminID)
            SubTags.aggregate([{
                $match: {
                    // adminId:adminID,
                    technicalTag_ID: technicalTag_id
                }
            }], function (err, subTagsdata) {
                if (err) throw err;
                console.log(subTagsdata)
                res.json(subTagsdata)
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
            // console.log('G DETAIL SUBPLAN = ' + JSON.stringify(userProfile))
            res.render('subscriptionPlan')
        })

        // CREATE PLAN FOR SUBSCRIPTION
        app.post('/plans', (req, res) => {
            // SUBSCRIPTION PLAN CREDENTIALS
            var instance = new Razorpay({
                key_id: 'rzp_live_5V9Rr2HtEbDI2n',
                key_secret: 'c9uW8hNPY33pmIWzeoSY0vZP'
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
            // SUBSCRIPTION PLAN CREDENTIALS
            var instance = new Razorpay({
                key_id: 'rzp_live_5V9Rr2HtEbDI2n',
                key_secret: 'c9uW8hNPY33pmIWzeoSY0vZP'
            })
            // console.log('PLAN ID =' + req.body.id)
            var plan_id = req.body.id
            // let experiy_date = Math.floor(new Date('2022.09.01').getTime() / 1000)
            instance.subscriptions.create({
                plan_id: req.body.id,
                customer_notify: 1,
                total_count: 6,
                // expire_by: experiy_date,
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
                        responce['email'] = userProfile.emails[0].value
                        console.log(responce)
                        res.json(responce)
                    })
                }
            })
        })

        // TESTING FRONTEND API
        app.get('/test', (req, res) => {
            res.render('subscriptionPlan')
        })

        // new USEER API'S...................

        // Read all catetories & HOME PAGE for REGULAR
        app.get('/categories', (req, res) => {
            userLogincredential.count({
                useremail: userProfile.emails[0].value
            }, (err, Rolecounter) => {
                if (err) throw err;
                if (Rolecounter > 0) {
                    userLogincredential.findOne({
                        useremail: userProfile.emails[0].value
                    }, function (err, Logedindata) {
                        if (err) throw err;
                    var instance = new Razorpay({
                        key_id: 'rzp_live_5V9Rr2HtEbDI2n',
                        key_secret: 'c9uW8hNPY33pmIWzeoSY0vZP'
                    }) 
                    var subscriptionDATA = instance.subscriptions.fetch(Logedindata.subscriptions_id)
                    subscriptionDATA.then(meta => {
                        console.log('SUB Data = ' + JSON.stringify(meta));
                        if (meta.status == 'active') {
                            if (sessions) {
                                Jobrole.find({}, (err, data) => {
                                    if (err) throw err;
                                    const tech_list = []
                                    for (i = 0; i < data.length; i++) {
                                        tech_list.push({
                                            role: data[i].category_name,
                                            role_id: data[i]._id
                                        })
                                    }
                                    res.render('regular', {
                                        techList: tech_list
                                    })
                                })
                            } else {
                                res.render('auth')
                            }
                        } else {
                            console.log('OLD USER WITHOUT SUBSCRIPTIOIN')
                            res.redirect('/subscriptionPlan')
                        }
                    }).catch(err => {
                        console.log(err)
                    })

                })
            }else{
                res.render('auth')
            }
            })            
        })

        app.get('/jobrole/:jobRoleid', (req, res) => {

            const id = req.params.jobRoleid
            if (id !== 'select_Category') {
                Jobrole.find({
                    _id: new mongoose.Types.ObjectId(id)
                }, function (err, roles) {
                    if (err) throw err;
                    const techidlist = []
                    for (var i = 0; i < (roles[0].Techtag_id).length; i++) {
                        techidlist.push(roles[0].Techtag_id[i].techtagId)
                    }

                    var techtag_ids = (techidlist).map(function (id) {
                        return new mongoose.Types.ObjectId(id);
                    });
                    Techtag.aggregate([{
                        $match: {
                            _id: {
                                $in: techtag_ids
                            },
                        }
                    }], function (err, techtagData) {
                        if (err) throw err;
                        res.json(techtagData)
                    })

                })
            } else {
                res.json('')
            }
        })

        app.get('/techtag/:technicalTag', (req, res) => {
            const techtagid = req.params.technicalTag;
            Techtag.find({
                _id: new mongoose.Types.ObjectId(techtagid)
            }, function (err, techtags) {
                if (err) throw err;
                const subtagidlist = []
                for (var i = 0; i < (techtags[0].sub_tags).length; i++) {
                    subtagidlist.push(techtags[0].sub_tags[i].subtagId)
                }
                var subtag_ids = (subtagidlist).map(function (id) {
                    return new mongoose.Types.ObjectId(id);
                });
                Sub_Tag.aggregate([{
                    $match: {
                        _id: {
                            $in: subtag_ids
                        },
                    }
                }], function (err, subtagData) {
                    if (err) throw err;
                    res.json(subtagData)
                })

            })
        })

        app.get('/subtag/:subtagid', (req, res) => {
            const subtagid = req.params.subtagid
            Sub_Tag.find({
                _id: new mongoose.Types.ObjectId(subtagid)
            }, function (err, subtags) {
                if (err) throw err;
                const subtagidlist = []
                for (var i = 0; i < (subtags[0].QuestionTag).length; i++) {
                    subtagidlist.push(subtags[0].QuestionTag[i].QAID)
                }
                var QA_ids = (subtagidlist).map(function (id) {
                    return new mongoose.Types.ObjectId(id);
                });
                QA.aggregate([{
                    $match: {
                        _id: {
                            $in: QA_ids
                        },
                    }
                }], function (err, QAData) {
                    if (err) throw err;
                    res.json(QAData)
                })

            })
        })

        app.get('/QA/:QAid', (req, res) => {
            const qaid = req.params.QAid
            QA.findOne({
                _id: new mongoose.Types.ObjectId(qaid)
            }, function (err, qaData) {
                if (err) throw err;
                res.json(qaData)
            })
        })

        // New Admin API'S ........................................

        app.post('/admin/create/', (req, res) => {
            var tags = []
            const adminId = req.body.adminId
            var tags_list = (req.body.tags).split(",")
            for (var tag = 0; tag < tags_list.length; tag++) {
                tags.push((tags_list[tag]).replace(/ /g, ""))
            }
            Jobrole.count({
                category_name: req.body.category_name
            }, (err, Rolecounter) => {
                if (err) throw err;
                var jobrolePresent_id = ''
                var TechnicalTagsPresent_id = ''
                if (Rolecounter > 0) {
                    // JOB ROLE PRESENT
                    Jobrole.find({
                        category_name: req.body.category_name,
                    }, function (err, jobrolePresent) {
                        if (err) throw err;
                        jobrolePresent_id = (jobrolePresent[0]._id).toString()
                        Techtag.count({
                            techTagname: req.body.technicalTag,
                            jobrole_id: jobrolePresent_id
                        }, (err, Tagcounter) => {
                            if (err) throw err;
                            if (Tagcounter > 0) {
                                // TECHNICAL TAG PRESENT
                                Techtag.find({
                                    techTagname: req.body.technicalTag,
                                    jobrole_id: jobrolePresent_id
                                }, function (err, TechnicalTagsPresent) {
                                    if (err) throw err;
                                    console.log('TECHID = ' + (TechnicalTagsPresent[0]._id).toString())
                                    TechnicalTagsPresent_id = (TechnicalTagsPresent[0]._id).toString()
                                    Sub_Tag.aggregate([{
                                        $match: {
                                            SubtagName: {
                                                $in: tags
                                            },
                                            technicalTag_id: TechnicalTagsPresent_id
                                        }
                                    }], function (err, subTagsdata) {
                                        if (err) throw err;
                                        new QA({
                                            jobrole_id: jobrolePresent_id,
                                            techTag_id: TechnicalTagsPresent_id,
                                            question: req.body.question,
                                            answer: (req.body.myTextarea).toString(),
                                            sub_tag: []
                                        }).save(function (err, QAdata) {
                                            if (err) throw err;
                                            const subTagsnameList = []
                                            var questionID = (QAdata._id).toString()
                                            const QAdetails = {
                                                'question': QAdata.question,
                                                'answer': QAdata.answer,
                                                'QAID': (QAdata._id).toString()
                                            }
                                            for (var i = 0; i < subTagsdata.length; i++) {
                                                subTagsnameList.push(subTagsdata[i].SubtagName)
                                                const subtagdetails = {
                                                    'subtagname': subTagsdata[i].SubtagName,
                                                    'subtagId': (subTagsdata[i]._id).toString()
                                                }
                                                Sub_Tag.update({
                                                        _id: new mongoose.Types.ObjectId(subTagsdata[i]._id)
                                                    }, {
                                                        $push: {
                                                            QuestionTag: QAdetails
                                                        }
                                                    },
                                                    function (err, updatedSubTag) {
                                                        if (err) throw err;
                                                        console.log(updatedSubTag)
                                                    });
                                                QA.update({
                                                        _id: new mongoose.Types.ObjectId(questionID)
                                                    }, {
                                                        $push: {
                                                            sub_tag: subtagdetails
                                                        }
                                                    },
                                                    function (err, updatedQA) {
                                                        if (err) throw err;
                                                        console.log(updatedQA)
                                                    });
                                            }

                                            var newSubtags = tags.filter(function (n) {
                                                return !this.has(n)
                                            }, new Set(subTagsnameList));
                                            for (var i = 0; i < newSubtags.length; i++) {
                                                new Sub_Tag({
                                                    SubtagName: newSubtags[i],
                                                    jobrole_id: jobrolePresent_id,
                                                    technicalTag_id: TechnicalTagsPresent_id,
                                                    QuestionTag: QAdetails
                                                }).save(function (err, Subtag_data) {
                                                    if (err) throw err;
                                                    const subtag_details = {
                                                        'subtagname': Subtag_data.SubtagName,
                                                        'subtagId': (Subtag_data._id).toString()
                                                    }
                                                    QA.update({
                                                            _id: new mongoose.Types.ObjectId(questionID)
                                                        }, {
                                                            $push: {
                                                                sub_tag: subtag_details
                                                            }
                                                        },
                                                        function (err, updatedQuestionlist) {
                                                            if (err) throw err;
                                                            console.log(updatedQuestionlist)
                                                            Techtag.update({
                                                                    _id: new mongoose.Types.ObjectId(TechnicalTagsPresent_id)
                                                                }, {
                                                                    $push: {
                                                                        sub_tags: subtag_details
                                                                    }
                                                                },
                                                                function (err, updatedTechTag) {
                                                                    if (err) throw err;
                                                                    console.log(updatedTechTag)
                                                                });
                                                        });
                                                })
                                            }
                                        })
                                    })
                                    //    res.json('done')
                                    res.redirect(`/categories/admin/${adminId}`);
                                })
                            } else {
                                // NO TECHNICAL TAG PRESENT
                                console.log('EXISTING JOBROLE ID ' + jobrolePresent_id)
                                new Techtag({
                                    techTagname: req.body.technicalTag,
                                    jobrole_id: jobrolePresent_id,
                                    sub_tags: []
                                }).save(function (err, TechnicalTagsdata) {
                                    if (err) throw err;
                                    // console.log('-----------NO TECH TAG PRESENT new '+ (TechnicalTagsdata) )
                                    TechnicalTagsPresent_id = (TechnicalTagsdata._id).toString()
                                    const techtagdetails = {
                                        'technicalTagname': TechnicalTagsdata.techTagname,
                                        'techtagId': (TechnicalTagsdata._id).toString()
                                    }
                                    Jobrole.update({
                                            _id: new mongoose.Types.ObjectId(jobrolePresent_id)
                                        }, {
                                            $push: {
                                                Techtag_id: techtagdetails
                                            }
                                        },
                                        function (err, updatedjobrole) {
                                            if (err) throw err;

                                            const newSubtags = []
                                            const newSubtagdetails = []
                                            for (var subtag = 0; subtag < tags.length; subtag++) {
                                                new Sub_Tag({
                                                    SubtagName: tags[subtag],
                                                    technicalTag_id: TechnicalTagsPresent_id,
                                                    jobrole_id: jobrolePresent_id,
                                                    QuestionTag: []
                                                }).save(function (err, subTagsdata) {
                                                    if (err) throw err;
                                                    // console.log('-----------NO TECH TAG PRESENT new '+ (subTagsdata) )
                                                    console.log('-----------NO TECH TAG PRESENT new ' + ((subTagsdata._id).toString()))
                                                    // TechnicalTagsPresent_id = (subTagsdata._id).toString() 
                                                    newSubtags.push((subTagsdata._id).toString())
                                                    const subtagdetails = {
                                                        'subtagname': subTagsdata.SubtagName,
                                                        'subtagId': (subTagsdata._id).toString()
                                                    }
                                                    newSubtagdetails.push(subtagdetails)
                                                    Techtag.update({
                                                            _id: new mongoose.Types.ObjectId(TechnicalTagsdata._id)
                                                        }, {
                                                            $push: {
                                                                sub_tags: subtagdetails
                                                            }
                                                        },
                                                        function (err, updatedTechTag) {
                                                            if (err) throw err;
                                                            console.log('NO TECH TAG PRESENT techtag push  ' + updatedTechTag)
                                                            // res.json(updatedSubTag)
                                                        });
                                                })
                                            }

                                            function QAloads() {
                                                console.log('NoroleQAupdate = ' + newSubtags)
                                                // console.log(tags.length)
                                                new QA({
                                                    jobrole_id: jobrolePresent_id,
                                                    techTag_id: TechnicalTagsPresent_id,
                                                    question: req.body.question,
                                                    answer: (req.body.myTextarea).toString(),
                                                    sub_tag: newSubtagdetails
                                                }).save(function (err, QAdata) {
                                                    if (err) throw err;
                                                    // console.log('NO TECH TAG PRESENT QA - ' + (QAdata._id).toString()) 
                                                    const QAdetails = {
                                                        'question': QAdata.question,
                                                        'answer': QAdata.answer,
                                                        'QAID': (QAdata._id).toString()
                                                    }
                                                    for (var j = 0; j < newSubtags.length; j++) {
                                                        Sub_Tag.update({
                                                                _id: new mongoose.Types.ObjectId(newSubtags[j])
                                                            }, {
                                                                $push: {
                                                                    QuestionTag: QAdetails
                                                                }
                                                            },
                                                            function (err, updatedSubTag) {
                                                                if (err) throw err;
                                                                // console.log('NO TECH TAG PRESENT subtag push ' + updatedSubTag)
                                                                // res.json(updatedSubTag)
                                                            });
                                                    }
                                                })
                                            }
                                            setTimeout(QAloads, 1000)

                                        });
                                    // res.json('done')
                                    res.redirect(`/categories/admin/${adminId}`);
                                })
                            }
                        })
                    })
                } else {
                    // NO JOB ROLE PRESENT
                    console.log('NO JOB ROLE PRESENT')
                    new Jobrole({
                        category_name: req.body.category_name,
                        created_at: req.body.date,
                    }).save(function (err, Jobroledata) {
                        if (err) throw err;
                        console.log((Jobroledata._id).toString())
                        jobrolePresent_id = (Jobroledata._id).toString()
                        new Techtag({
                            techTagname: req.body.technicalTag,
                            jobrole_id: jobrolePresent_id,
                            sub_tags: []
                        }).save(function (err, TechnicalTagsdata) {
                            if (err) throw err;
                            console.log((TechnicalTagsdata))
                            TechnicalTagsPresent_id = (TechnicalTagsdata._id).toString()
                            const techtagdetails = {
                                'technicalTagname': TechnicalTagsdata.techTagname,
                                'techtagId': (TechnicalTagsdata._id).toString()
                            }
                            Jobrole.update({
                                    _id: new mongoose.Types.ObjectId(jobrolePresent_id)
                                }, {
                                    $push: {
                                        Techtag_id: techtagdetails
                                    }
                                },
                                function (err, updatedjobrole) {
                                    if (err) throw err;
                                    console.log(updatedjobrole)
                                    // res.json(updatedSubTag)
                                    const newSubtags = []
                                    const newSubtagdetails = []
                                    for (var subtag = 0; subtag < tags.length; subtag++) {
                                        new Sub_Tag({
                                            SubtagName: tags[subtag],
                                            technicalTag_id: TechnicalTagsPresent_id,
                                            jobrole_id: jobrolePresent_id,
                                            QuestionTag: []
                                        }).save(function (err, subTagsdata) {
                                            if (err) throw err;
                                            console.log((subTagsdata))
                                            // TechnicalTagsPresent_id = (subTagsdata._id).toString() 
                                            newSubtags.push((subTagsdata._id).toString())
                                            const subtagdetails = {
                                                'subtagname': subTagsdata.SubtagName,
                                                'subtagId': (subTagsdata._id).toString()
                                            }
                                            newSubtagdetails.push(subtagdetails)
                                            Techtag.update({
                                                    _id: new mongoose.Types.ObjectId(TechnicalTagsdata._id)
                                                }, {
                                                    $push: {
                                                        sub_tags: subtagdetails
                                                    }
                                                },
                                                function (err, updatedTechTag) {
                                                    if (err) throw err;
                                                    console.log(updatedTechTag)
                                                    // res.json(updatedSubTag)
                                                });
                                        })
                                    }

                                    function NoroleQAupdate() {
                                        console.log('NoroleQAupdate = ' + newSubtagdetails)
                                        new QA({
                                            jobrole_id: jobrolePresent_id,
                                            techTag_id: TechnicalTagsPresent_id,
                                            question: req.body.question,
                                            answer: (req.body.myTextarea).toString(),
                                            sub_tag: newSubtagdetails
                                        }).save(function (err, QAdata) {
                                            if (err) throw err;
                                            console.log((QAdata._id).toString())
                                            for (var j = 0; j < newSubtags.length; j++) {
                                                const QAdetails = {
                                                    'question': QAdata.question,
                                                    'answer': QAdata.answer,
                                                    'QAID': (QAdata._id).toString()
                                                }
                                                console.log('new QA DATA ............................  ' + newSubtags[j])
                                                Sub_Tag.update({
                                                        _id: new mongoose.Types.ObjectId(newSubtags[j])
                                                    }, {
                                                        $push: {
                                                            QuestionTag: QAdetails
                                                        }
                                                    },
                                                    function (err, updatedSubTag) {
                                                        if (err) throw err;
                                                        console.log(updatedSubTag)
                                                        // res.json(updatedSubTag)
                                                    });
                                            }
                                        })
                                    }
                                    setTimeout(NoroleQAupdate, 70)
                                });
                        })
                        // res.json('Done')
                        res.redirect(`/categories/admin/${adminId}`);
                    })
                }
            })
        })

        // GET ALL JOB ROLES LIST

        app.get('/categories/admin/:adminId', (req, res) => {
            const tech_list = [];
            console.log(adminUsername + 'LOGEDIN USERNAME')
            if (adminUsername) {
                Jobrole.find({
                    // adminId: req.params.adminId
                }, (err, data) => {
                    if (err) throw err;
                    for (i = 0; i < data.length; i++) {
                        // tech_list.push(data[i].category_name);
                        tech_list.push({
                            role: data[i].category_name,
                            role_id: data[i]._id
                        })
                    }

                    res.render('home', {
                        techList: tech_list,
                        adminId: req.params.adminId
                    })
                })
            } else {
                res.render("adminloginPage")
            }
        })

        app.get('/AdminJobrole/:adminid/:jobRoleid', (req, res) => {

            const id = req.params.jobRoleid
            console.log(id)
            if (id !== 'select_Category') {
                Jobrole.find({
                    _id: new mongoose.Types.ObjectId(id)
                }, function (err, roles) {
                    if (err) throw err;
                    const techidlist = []
                    for (var i = 0; i < (roles[0].Techtag_id).length; i++) {
                        techidlist.push(roles[0].Techtag_id[i].techtagId)
                    }

                    var techtag_ids = (techidlist).map(function (id) {
                        return new mongoose.Types.ObjectId(id);
                    });
                    Techtag.aggregate([{
                        $match: {
                            _id: {
                                $in: techtag_ids
                            },
                        }
                    }], function (err, techtagData) {
                        if (err) throw err;
                        res.json(techtagData)
                    })

                })
            } else {
                res.json('')
            }
        })

        app.get('/Admintechtag/:technicalTag', (req, res) => {
            const techtagid = req.params.technicalTag;
            Techtag.find({
                _id: new mongoose.Types.ObjectId(techtagid)
            }, function (err, techtags) {
                if (err) throw err;
                const subtagidlist = []
                for (var i = 0; i < (techtags[0].sub_tags).length; i++) {
                    subtagidlist.push(techtags[0].sub_tags[i].subtagId)
                }
                var subtag_ids = (subtagidlist).map(function (id) {
                    return new mongoose.Types.ObjectId(id);
                });
                Sub_Tag.aggregate([{
                    $match: {
                        _id: {
                            $in: subtag_ids
                        },
                    }
                }], function (err, subtagData) {
                    if (err) throw err;
                    res.json(subtagData)
                })

            })
        })

        app.get('/Adminsubtag/:adminid/:subtagid', (req, res) => {
            const subtagid = req.params.subtagid
            Sub_Tag.find({
                _id: new mongoose.Types.ObjectId(subtagid)
            }, function (err, subtags) {
                if (err) throw err;
                const subtagidlist = []
                for (var i = 0; i < (subtags[0].QuestionTag).length; i++) {
                    subtagidlist.push(subtags[0].QuestionTag[i].QAID)
                }
                var QA_ids = (subtagidlist).map(function (id) {
                    return new mongoose.Types.ObjectId(id);
                });
                QA.aggregate([{
                    $match: {
                        _id: {
                            $in: QA_ids
                        },
                    }
                }], function (err, QAData) {
                    if (err) throw err;
                    res.json(QAData)
                })

            })
        })

        app.get('/AdminQA/:QAid', (req, res) => {
            const qaid = req.params.QAid
            QA.findOne({
                _id: new mongoose.Types.ObjectId(qaid)
            }, function (err, qaData) {
                if (err) throw err;
                res.json(qaData)
            })
        })

        app.get("/Admin/update/feature/:updateId/:adminid", function (req, res) {
            const QAid = req.params.updateId
            QA.findOne({
                _id: new mongoose.Types.ObjectId(QAid)
            }, function (err, qaData) {
                if (err) throw err;
                console.log(qaData)
                var subTagsList = []
                for (var i = 0; i < (qaData.sub_tag).length; i++) {
                    // subTagsList += (qaData.sub_tag[i].subtagname).concat(',')
                    subTagsList.push(qaData.sub_tag[i].subtagname)
                }
                const updatedValue = {
                    'question': qaData.question,
                    'answer': qaData.answer,
                    'tags': subTagsList,
                    'QAid': qaData._id
                }
                console.log(updatedValue)
                res.render('adminfeature', {
                    updateValue: updatedValue,
                    adminId: req.params.adminid,
                    jobRoles: '',
                    tech_tags: ''
                });
            })
        })


        app.get("/admin/newfeature/:adminId", function (req, res) {
            // console.log(adminUsername)
            if (adminUsername) {
                Jobrole.find({}, function (err, roles) {
                    const jobRoles = []
                    if (err) throw err;
                    for (var role = 0; role < roles.length; role++) {
                        jobRoles.push({
                            role: roles[role].category_name,
                            roleid: roles[role]._id
                        })
                    }
                    Techtag.find({}, function (err, techTags) {
                        const tech_tags = []
                        if (err) throw err;
                        for (var tag = 0; tag < techTags.length; tag++) {
                            tech_tags.push({
                                techtag: techTags[tag].techTagname,
                                techtagId: techTags[tag]._id
                            })
                        }
                        res.render('adminfeature', {
                            updateValue: "",
                            adminId: req.params.adminId,
                            jobRoles: jobRoles,
                            tech_tags: tech_tags
                        });
                    })
                })
            } else {
                res.render("adminloginPage")
            }
        });

        app.put('/Admin/feature/update/:QAid', (req, res) => {
            QA.update({
                _id: new mongoose.Types.ObjectId(req.params.QAid)
            }, {
                $set: {
                    question: req.body.question,
                    answer: (req.body.answer).toString(),
                }
            }, function (err, updatedQuestions) {
                if (err) throw err;
                res.json(updatedQuestions)
            })
        })

        app.delete('/Admin/QAdelete/:QAid', (req, res) => {
                QA.find({
                        _id: new mongoose.Types.ObjectId(req.params.QAid)
                    }, function (err, QAdata) {
                        if (err) throw err;
                        const subTagidlist = []
                        for (let i = 0; i < QAdata.length; i++) {
                            for (let j = 0; j < (QAdata[i].sub_tag).length; j++) {
                                subTagidlist.push(QAdata[i].sub_tag[j].subtagId)
                            }
                        }
                        console.log(subTagidlist)
                        for(var i = 0 ; i < subTagidlist.length;i++){
                            console.log(QAdata)
                            Sub_Tag.update({
                                _id: new mongoose.Types.ObjectId(subTagidlist[i])
                            }, {
                                $pull: {
                                    "QuestionTag": {
                                        "question":QAdata[0].question ,
                                        "answer":QAdata[0].answer,
                                        "QAID":(QAdata[0]._id).toString()
                                    }
                                }
                            }, {
                                multi: true
                            },function(err,QAremovedfromSubtaglist){
                                if(err) throw err ;
                                console.log(QAremovedfromSubtaglist)
                            })
                        }
                        function QAdelete(){
                            QA.deleteOne({_id: new mongoose.Types.ObjectId(req.params.QAid)},function(err,result){
                                if(err) throw err;
                                res.json('Deletion Done')
                            })
                        }

                        setTimeout(QAdelete , 1000)
                    })
                })

        }
