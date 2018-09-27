require('dotenv').config()

//Load libraries
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const hbs = require('express-handlebars');
var cors = require('cors');


// create an instance of express
const app=express();
app.use(cors());

const sqlGroceryList = "SELECT * FROM grocery_list";

const sqlGetBrand = "SELECT brand, name, upc12, id FROM grocery_list WHERE brand LIKE ?"; //"?" is subtituted by args, passed in line 74 through filmId

const sqlGetProdName = "SELECT name, brand, upc12, id FROM grocery_list WHERE name LIKE ?"; 

const sqlGet = "SELECT name, brand, upc12, id FROM grocery_list WHERE name LIKE ? AND brand LIKE ?"; 

const sqlBarcode = "SELECT upc12, name FROM grocery_list WHERE upcs12 LIKE ?"; 

const sqlDefaultList = "SELECT name, brand FROM grocery_list ORDER BY brand, name ASC limit 20 ;";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT
})

/* Config. express to use handlebars as the rendering engine
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir:__dirname + '/views/layouts/'
}));

app.set('views',path.join(__dirname, '/views'));
app.set('view engine','hbs');
*/

//Create a reuseable function to query MySQL, wraps around with Promise
var makeQuery = (sql, pool)=>{
    console.log("SQL statement >>> ",sql);

    return  (args)=>{
        let queryPromise = new Promise((resolve,reject)=>{
            pool.getConnection((err,connection)=>{
                if(err){
                    reject(err);
                    return;
                }
                console.log("args>>> ", args);
                connection.query(sql, args || {}, (err,results)=>{
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(results);
                })
            });

        });
        return queryPromise;

    }
}

var findBrand = makeQuery(sqlGetBrand, pool);
var findProductName = makeQuery(sqlGetProdName, pool);
var findProduct = makeQuery(sqlGet, pool);

var UpdateGroceryList = makeQuery(sqlGetBrand, sqlGetProdName, pool);


//create routes
/*
app.get('/grocery',(req,res,next)=>{
    
        let brand = req.query.brand;
        console.log("brand search>>> ", findBrand);
        findBrand(brand).then((results)=>{
            res.json(results);
        }).catch((error)=>{
            console.log(error);
            res.status(500).json(error);
        });
    });
        */
app.get('/grocery',(req,res)=>{

        let pdname = req.query.pdname;
        let brand = req.query.brand;
        let params = [pdname, brand];

//        let params = ['%natural%','%dirty%'];

        console.log("params search>>> ", params);
        findProduct(params).then((results)=>{
            res.json(results);
        }).catch((error)=>{
            console.log(error);
            res.status(500).json(error);
        });
    });
/*
app.post('/grocer',(req, res)=>{        
    allFilms().then((results)=>{
        res.json(results);
    }).catch((error)=>{
        console.log(error);
        res.status(500).json(error);
    });
*/
/* app.get("/films/:filmId", (req, res)=>{
    console.log("/film params !");
    let filmId = req.params.filmId;
    console.log(filmId);
    findOneFilmById([parseInt(filmId)]).then((results)=>{
        console.log(results);
        res.json(results);
    }).catch((error)=>{
        res.status(500).json(error);
    })
    
})
*/


//Start web server
//start server on port 3000 if undefined on command line
const PORT=parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000

app.listen(PORT, ()=>{
    console.info(`Application started on port ${PORT} at ${new Date()}`);
});