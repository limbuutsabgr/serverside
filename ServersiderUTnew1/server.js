const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('cookie-session');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express();
const mongourl = 'mongodb+srv://singhsukhjit866:13051850@cluster0.euey2m6.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'ShoppingCart';
const SECRETKEY = 'abracadabra';

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  userid: 'session',
  keys: [SECRETKEY],
}));

const client = new MongoClient(mongourl);

// Function to find documents in a collection based on criteria
const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('cart').find(criteria);
    cursor.toArray((err, docs) => {
        assert.equal(null, err);
        callback(docs);
    });
};

const findLoginUser = (db, criteria, callback) => {
  let cursor = db.collection('user').find(criteria);

  cursor.toArray((err, docs) => {
    if (err) {
      console.error('Error converting cursor to array:', err);
      callback(null); // Pass null to the callback to indicate an error
      return;
    }

    if (docs.length === 0) {
      callback(null); // No document found, pass null to the callback
    } else {
      callback(docs[0]); // Return the first document in the array
    }
  });
};


const findexistinguser = (db, criteria, callback) => {
    let cursor = db.collection('cart').find(criteria);
    cursor.toArray((err, docs) => {
        assert.equal(null, err);
        callback(docs);
    });
};

const findincart = (db, criteria, callback) => {
    let cursor = db.collection('cart').find(criteria);
    cursor.toArray((err, docs) => {
        assert.equal(null, err);
        callback(docs);
    });
};

// Function to check user existence based on session ID
const checkUserExistence = (req, res) => {
  client.connect((err) => {
    assert.equal(null, err);
    const db = client.db(dbName);
    const user = `${req.session.userid}`;
    const criteria = { "ownerID": user };
	console.log(user);
    findexistinguser(db, criteria, (docs) => {
      client.close();
            if (docs.length > 0) {
                console.log("User Found");
                // Redirect to welcome page if the user is found
                return res.status(200).redirect('/Home');
            } else {
                console.log("User Not Found");
                // Redirect to create page if the user is not found
                return res.status(200).redirect('/create');
      }
    });
  });
};




app.get('/', function(req, res){
    if(!req.session.authenticated){
        console.log("...Not authenticated; directing to login");
        res.redirect("/login");
    }else{
    	res.redirect("/login");
    }
    console.log("...Hello, welcome back");
});




// Login route
app.get('/login', (req, res) => {
  console.log("Welcome to the login page.");
  res.sendFile(__dirname + '/public/login.html');
  return res.status(200).render('login');
});

app.post('/login', (req, res) => {
req.session.authenticated = false;
  const inputName = req.body.username;
  const inputPassword = req.body.password;
  const criteria = { "name": inputName, "password": inputPassword };

  client.connect((err) => {
    assert.equal(null, err);
    const db = client.db(dbName);

    findLoginUser(db, criteria, (doc) => {
      client.close();
      if (doc) {
        console.log("User found:");
        req.session.authenticated = true;
        req.session.userid = inputName;
        console.log(req.session.userid);
        checkUserExistence(req, res);
      } else {
        console.log("User not found");
        console.log("Error username or password.");
        return res.redirect("/");
      }
    });
  });
});

// Home route
app.get('/home', (req, res) => {
  console.log("Welcome to the Home page.");
  res.sendFile(__dirname + '/public/home.html');
  return res.status(200).render('home');
});

// Create route
const createDocument = (db, createddocuments, callback) => {
  db.collection('cart').insertOne(createddocuments, (error, results) => {
    if (error) {
      throw error;
    }
    console.log(results);
    callback();
  });
};

app.get('/create', (req, res) => {
  return res.status(200).render('create');
});
app.get('/ordercomplete', (req, res) => {
  return res.status(200).render('ordercomplete');
});

app.post('/create', (req, res) => {
  client.connect((err) => {
    assert.equal(null, err);
    const db = client.db(dbName);

    const documents = {
      "_id": new ObjectID(),
      "ownerID": `${req.session.userid}`,
      "magicPotion": parseInt(req.body.number_mp),
      "invisibilityCloak": parseInt(req.body.number_invisibility),
      "spellbookOfEnchantments": parseInt(req.body.number_spellbook),
      "flyingBroomstick": parseInt(req.body.number_broom),
      "crystalBall": parseInt(req.body.number_crystal),
    };

    console.log("Putting data into documents");

    if (parseInt(req.body.number_mp) !== 0 || parseInt(req.body.number_invisibility) !== 0 || parseInt(req.body.number_spellbook) !== 0 || parseInt(req.body.number_broom) !== 0 || parseInt(req.body.number_crystal) !== 0) {
      console.log("Creating the document");
      createDocument(db, documents, () => {
        client.close();
        console.log("Closed DB connection");
        return res.status(200).render('home', { message: "Document is created successfully!" });
      });
    } else {
      client.close();
      console.log("Closed DB connection");
      return res.status(200).render('home', { message: "Invalid entry - You must have at least one item in your cart!" });
    }
  });
});




//search(read)
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
const user = `${req.session.userid}`;
const criteria = {
    [itemName]: {
        $exists: true,
        $gt: 0 // Quantity is greater than 0
    },
    "ownerID": user
};

        findincart(db, criteria, (docs) => {
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



//update
app.get('/update', (req, res) => {
  return res.status(200).render('update');
});

app.post('/update', (req, res) => {
  const itemName = req.body.itemName;
  const amount = parseInt(req.body.amount);

  if (isNaN(amount)) {
    console.log("Invalid amount");
    return res.status(400).send("Invalid amount");
  }

  const user = `${req.session.userid}`;
  const criteria = {
    [itemName]: {
      $exists: true
    },
    "ownerID": user
  };

  const changes = { [itemName]: amount };

  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
	console.log("here it is");
console.log(user);
console.log(itemName);
console.log(amount);
    const db = client.db(dbName);

    updateDocument(db, criteria, changes, () => {
      client.close();
      console.log("Closed DB connection");
      return res.status(200).render('home', { message: "Update successful!" });
	 res.redirect('/home');
    });
  });
});

const updateDocument = (db, criteria, changes, callback) => {
  db.collection('cart').updateMany(criteria, { $set: changes }, (err, results) => {
    assert.equal(err, null);
    console.log("Update operation results:", results);

    if (results && results.result && results.result.nModified !== undefined) {
      console.log(`Updated document(s): ${results.result.nModified}`);
    } else {
      console.log("Update operation did not return expected results.");
    }
    callback();
  });
};


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

const deleteDocument = function(db, criteria, callback){
console.log(criteria);
	db.collection('cart').deleteOne(criteria, function(err, results){
	assert.equal(err, null);
	console.log(results);
	return callback();
	});

};

const handle_Delete = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        console.log("Connected successfully to server");
        const db = client.db(dbName);

	let deldocument = {};

        deldocument["ownerID"] = criteria;
        console.log(deldocument["ownerID"]);

        deleteDocument(db, deldocument, function(results){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('delete', {message: "Document is successfully deleted."});
        })
    });
}

app.get('/delete', function(req, res){
	handle_Delete(res, req.session.userid);
        return res.status(200).render('delete', {message: "Deleted successfully"});
    
});
app.get('/logout', function(req, res){
    req.session = null;
    req.authenticated = false;
    res.redirect('/login');
});

//api
//Create(POST)
app.post('/api/cart', function(req, res) {
    const user = `${req.session.userid}`;
    const documents = {
        "_id": new ObjectID(),
        "ownerID": user,
        "magicPotion": parseInt(req.body.magicPotion),
        "invisibilityCloak": parseInt(req.body.invisibilityCloak),
        "spellbookOfEnchantments": parseInt(req.body.spellbookOfEnchantments),
        "flyingBroomstick": parseInt(req.body.flyingBroomstick),
        "crystalBall": parseInt(req.body.crystalBall),
    };

    client.connect((err) => {
        assert.equal(null, err);
        const db = client.db(dbName);

        createDocument(db, documents, () => {
            client.close();
            console.log("Closed DB connection");
            res.status(201).json({ message: "Document is created successfully!" });
        });
    });
});

//Read(GET)
app.get('/api/cart/:ownerID', function(req, res) {
    const user = req.params.ownerID;
    const criteria = { "ownerID": user };

    client.connect((err) => {
        assert.equal(null, err);
        const db = client.db(dbName);

        findDocument(db, criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");

            if (docs.length > 0) {
                res.status(200).json(docs[0]);
            } else {
                res.status(404).json({ message: "Cart not found for the specified user" });
            }
        });
    });
});

//Update(PUT)
app.put('/api/cart/:ownerID', function(req, res) {
    const user = req.params.ownerID;
    const criteria = { "ownerID": user };
    const changes = {
        "magicPotion": parseInt(req.body.magicPotion),
        "invisibilityCloak": parseInt(req.body.invisibilityCloak),
        "spellbookOfEnchantments": parseInt(req.body.spellbookOfEnchantments),
        "flyingBroomstick": parseInt(req.body.flyingBroomstick),
        "crystalBall": parseInt(req.body.crystalBall),
    };

    client.connect((err) => {
        assert.equal(null, err);
        const db = client.db(dbName);

        updateDocument(db, criteria, changes, () => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).json({ message: "Update successful!" });
        });
    });
});

//Delete(DELETE)
app.delete('/api/cart/:ownerID', function(req, res) {
    const user = req.params.ownerID;
    const criteria = { "ownerID": user };

    client.connect((err) => {
        assert.equal(null, err);
        const db = client.db(dbName);

        deleteDocument(db, criteria, () => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).json({ message: "Document is successfully deleted." });
        });
    });
});





app.listen(process.env.PORT || 8099, () => {
  console.log("Server is running on port 8099");
});


