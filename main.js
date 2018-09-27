require('dotenv').config()

//Load libraries
const express = require('express');
const path = require('path');
const mysql = require('mysql');
var cors = require('cors');


//create an instance of express
const app=express();
app.use(cors());

const sqlAllFilms = "SELECT * FROM film";

const sqlFindOneFilm = "SELECT film_id, title FROM film WHERE film_id=?"; //"?" is subtituted by args, passed in line 74 through filmId

const sqlFindFilms = "SELECT film_id, title FROM film WHERE title LIKE ?"; 


//Takes value from .env file
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT
})


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

var allFilms = makeQuery(sqlAllFilms, pool);
var findOneFilmById = makeQuery(sqlFindOneFilm, pool);
var findFilms = makeQuery(sqlFindFilms, pool);


//create routes
app.get('/films',(req,res)=>{

        let filmTitle = req.query.title;
        console.log("filmtitle search>>> ", filmTitle);
        findFilms(filmTitle).then((results)=>{
            res.json(results);
        }).catch((error)=>{
            console.log(error);
            res.status(500).json(error);
        });
    
/*
    allFilms().then((results)=>{
        res.json(results);
    }).catch((error)=>{
        console.log(error);
        res.status(500).json(error);
    });
*/
});


app.get("/films/:filmId", (req, res)=>{
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


//Start web server
//start server on port 3000 if undefined on command line
const PORT=parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000

app.listen(PORT, ()=>{
    console.info(`Application started on port ${PORT} at ${new Date()}`);
});
