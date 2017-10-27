var express = require('express'),
    _ = require('lodash'),
    config = require('../config'),
    jwt = require('jsonwebtoken'),
    db = require('../db'),
    app = module.exports = express.Router(),
    secretKey = "Jangan sebarkan kuncinya bro"

function createToken(user){
  return jwt.sign(_.omit(user,'password'), config.secretKey,{expiresIn: 60*60*5})
}
function getUserDB(username, done){
  db.get().query('SELECT * FROM users WHERE username = ? LIMIT 1 ', [username], function(err,rows,fields){
    if(err) throw err
    done(rows[0])
  })
}
app.post('/user/create', function(req,res){
  if(!req.body.username || !req.body.password){
    return res.status(400).send("Username dan password harus di isi! ")
  }
  getUserDB(req.body.username, function(user){
    if(!user){
      user = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      }
      db.get().query('INSERT INTO users SET ?',[user], function(err,result){
        if(err) throw err
        newUser = {
          id: result.insertId,
          username: user.username,
          password: user.password,
          email: user.email
        }
        res.status(201).send({
          id_token: createToken(newUser)
        })
      })
    }
    else res.status(400).send("User sudah ada yang menggunakan")
  })
})
app.post('/user/login', function(req,res){
  if(!req.body.username || !req.body.password){
    return res.status(400).send("Username dan Password Tidak boleh kosong")
  }
  getUserDB(req.body.username, function(user){
    if(!user){
      return res.status(401).send("Username tidak ada")
    }
    if(user.password !== req.body.password){
      return res.status(401).send("Username atau password tidak sama")
    }
    res.status(201).send({
      id_token: createToken(user)
    })
  })
})

app.get('/user/check/:username', function(req,res){
  if(!req.params.username){
    return res.status(400).send("Username Harus diisi")
  }
  getUserDB(req.params.username, function(user){
    if(!user) res.status(201).send({username:"OK"})
    else res.status(400).send("User sudah tersedia")
  })
})