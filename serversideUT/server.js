const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb+srv://limbuutsabgr:s1304269@cluster0.fpidcqp.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'cart';
const SECRETKEY = 'Magicians Code';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');

var documents = {};

app.set('view engine', 'ejs');


app.use(session({
    userid: "session",
    keys: [SECRETKEY],
}));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



//login
var logininfo = new Array(
    {name: "houdini", password: "abracadabra"},
);

var documents = {};

app.get('/', function(req, res){
    if(!req.session.authenticated){
        console.log("...Not authenticated; directing to login");
        res.redirect("/login");
    }else{
    	res.redirect("/login");
    }
    console.log("...Hello, welcome back");
});

app.get('/login', function(req, res){
    console.log("...Welcome to login page.")
    res.sendFile(__dirname + '/public/login.html');
    return res.status(200).render("login");
});

app.post('/login', function(req, res){
    console.log("...Handling your login request");
    for (var i=0; i<logininfo.length; i++){
        if (logininfo[i].name == req.body.username && logininfo[i].password == req.body.password) {
        req.session.authenticated = true;
        req.session.userid = logininfo[i].name;
        console.log(req.session.userid);
        return res.status(200).redirect("/home");
        }
    }
        console.log("Error username or password.");
        return res.redirect("/");
});

app.get('/logout', function(req, res){
    req.session = null;
    req.authenticated = false;
    res.redirect('/login');
});

const createDocument = function(db, createddocuments, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to the MongoDB database server.");
        const db = client.db(dbName);

        db.collection('cart').insertOne(createddocuments, function(error, results){
            if(error){
            	throw error
            };
            console.log(results);
            return callback();
        });
    });
}
app.get('/home', function(req, res){
    return res.status(200).render("home");
});

app.get('/create', function(req, res){
    return res.status(200).render("create");
});

app.get('/checkout', function(req, res){
    return res.status(200).render("checkout");
});

app.post('/checkout', function(req, res) {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        const userName = req.session.userid; 
        const criteria = {
            "ownerID": userName
        };

        findDocument(db, criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");

            if (docs.length > 0) {
                const ownerID = docs[0].ownerID; 


                const results = Object.keys(docs[0]).map(item => {
                    if (item !== 'ownerID') {
                        return { itemName: item, quantity: docs[0][item] };
                    }
                }).filter(Boolean);

                res.render('checkoutresult', { ownerID: ownerID, results: results });
            } else {
                console.log("Not found");
                res.render('checkoutresult', { ownerID: userName, results: [], itemName: userName, quantity: 'No' });
            }
        });
    });
});

app.post('/create', function(req, res){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
	
	console.log(req.body);
        documents["_id"] = ObjectID;
        documents["ownerID"] = `${req.session.userid}`;
	documents["magicPotion"] = parseInt(req.body.number_mp);
	documents['invisibilityCloak']= parseInt(req.body.number_invisibility);
	documents['spellbookOfEnchantments']= parseInt(req.body.number_spellbook);
	documents['flyingBroomstick']= parseInt(req.body.number_broom);
        documents['crystalBall']= parseInt(req.body.number_crystal);
        console.log("...putting data into documents");

        if((parseInt(req.body.number_mp)!=0) || (parseInt(req.body.number_invisibility)!=0) ||(parseInt(req.body.number_spellbook)!=0) ||(parseInt(req.body.number_broom)!=0) ||(parseInt(req.body.number_crystal)!=0)){
            console.log("...Creating the document");
            createDocument(db, documents, function(docs){
                client.close();
                console.log("Closed DB connection");
                return res.status(200).render('checkout', {message: "Document is created successfully!"});
            });
        } else{
            client.close();
            console.log("Closed DB connection");
            return res.status(200).render('checkout', {message: "Invalid entry - You must have at least one item in your cart!"});
        }
    });
});

app.get('/delete', function(req, res){
    if(req.query.owner == req.session.userid){
        console.log("...Hello !");
        handle_Delete(res, req.query);
    }else{
        return res.status(200).render('info', {message: "Access denied - You don't have the access and deletion right!"}); 
    }
});

const handle_Delete = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        console.log("Connected successfully to server");
        const db = client.db(dbName);

    let deldocument = {};

        deldocument["_id"] = ObjectID(criteria._id);
        deldocument["ownerID"] = criteria.owner;
        console.log(deldocument["_id"]);
        console.log(deldocument["ownerID"]);

        deleteDocument(db, deldocument, function(results){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', {message: "Document is successfully deleted."});
         })
	});
}


const deleteDocument = function(db, criteria, callback){
console.log(criteria);
    db.collection('restaurants').deleteOne(criteria, function(err, results){
    assert.equal(err, null);
    console.log(results);
    return callback();
    });

};

app.get('/search', function(req, res){
    res.render('search');
});

app.get('/searchResult', function(req, res){
    console.log("SearchResult page")
    res.sendFile(__dirname + '/public/searchResult.html');
    return res.status(200).render("searchResult");
});

app.post('/search', function(req, res) {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        const itemName = req.body.itemName;
const user = "admin";
const criteria = {
    [itemName]: {
        $exists: true,
        $gt: 0 // Quantity is greater than 0
    },
    "ownerID": user
};

        findDocument(db, criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");

   if (docs.length > 0) {
    console.log(docs);
    res.render('searchResult', { itemName: itemName, quantity: "yes", results: docs });
} else {
    console.log("Not found");
    res.render('searchResult', { itemName: itemName, quantity: 'No' });
}


        });
    });
});

const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('cart').find(criteria);
    cursor.toArray((err, docs) => {
        assert.equal(null, err);
        callback(docs);
    });
};

app.listen(app.listen(process.env.PORT || 8099));

