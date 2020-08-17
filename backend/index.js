const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const mongoose = require('mongoose')
const passport = require('passport')

// Intitialize the app
const app = express();

// Middleware
// Form Data Middlware
app.use(bodyParser.urlencoded({
    extended: false
}));
// Json Body Middleware
app.use(bodyParser.json())
// Cors Middleware
app.use(cors());
// Setting up the static directory
app.use(express.static(path.join(__dirname, '/client/public')));
// Use the passport Middleware
app.use(passport.initialize());
// Bring in the passport Strategy
require('./config/passport')(passport)
// Bring in the Database Config
const db = require('./config/keys').mongoURI
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).then(db => {
    console.log('Database connected successfully')
}).catch(err => {
    console.log(`Unable to connect with this database ${err}`)
})

// Bring in the Users route
const users = require('./routes/api/users')
app.use('/api/users', users)
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port http://localhost:${port}`))