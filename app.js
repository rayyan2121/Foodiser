const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');
const app = express();

const connection = mysql.createConnection({
  // host: 'localhost',
  // user: 'root',
  // password: '',
  // database: 'foodiser'
  host: 'mysql-rayyanziq.alwaysdata.net',
  user: 'rayyanziq',
  password: 'Dymask10',
  database: 'rayyanziq_c237'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/create', upload.single('img'), (req, res) => {
  const { recipename, ing, guide, dura, username, password } = req.body;
  let img = req.file ? req.file.filename : null;
  const sql = 'INSERT INTO profile (recipe_name, img, ingredient, guide, duration, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
  connection.query(sql, [recipename, img, ing, guide, dura, username, password], (error, results) => {
    if (error) {
      console.error('Error adding recipe:', error);
      res.status(500).send('Error adding recipe');
    } else {
      res.redirect('/post');
    }
  });
});

app.get('/post', (req, res) => {
  const query = 'SELECT * FROM profile';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.send('An error occurred, please try again.');
      return;
    }
    res.render('com-page', { recipe: results });
  });
});

app.get('/details/:id', (req, res) => {
  const query = 'SELECT * FROM profile WHERE user_id = ?';
  const userId = req.params.id;
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.send('An error occurred, please try again.');
      return;
    }
    if (results.length > 0) {
      res.render('details', { profile: results[0] });
    } else {
      res.send('Recipe not found.');
    }
  });
});

app.get('/edit/:id', (req, res) => {
  const query = 'SELECT * FROM profile WHERE user_id = ?';
  const userId = req.params.id;
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.send('An error occurred, please try again.');
      return;
    }
    if (results.length > 0) {
      res.render('edit', { profile: results[0] });
    } else {
      res.send('Recipe not found.');
    }
  });
});

app.post('/edit/:id', upload.single('img'), (req, res) => {
  const { recipename, ing, guide, dura, username, password } = req.body;
  let img = req.file ? req.file.filename : null;
  const userId = req.params.id;
  const sql = 'UPDATE profile SET recipe_name = ?, img = ?, ingredient = ?, guide = ?, duration = ?, username = ?, password = ? WHERE user_id = ?';
  connection.query(sql, [recipename, img, ing, guide, dura, username, password, userId], (error, results) => {
    if (error) {
      console.error('Error updating recipe:', error);
      res.status(500).send('Error updating recipe');
    } else {
      res.redirect('/post');
    }
  });
});

app.post('/delete/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM profile WHERE user_id = ?';
  connection.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('Error deleting recipe:', error);
      res.status(500).send('Error deleting recipe');
    } else {
      res.redirect('/post');
    }
  });
});

// Login and Registration routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      res.status(500).send('Error logging in');
    } else if (results.length > 0) {
      res.redirect('/');
    } else {
      res.send('Invalid email or password');
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  connection.query(query, [username, email, password], (err, results) => {
    if (err) {
      console.error('Error registering:', err);
      res.status(500).send('Error registering');
    } else {
      res.redirect('/login');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



