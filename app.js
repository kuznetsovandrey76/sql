const mysql      = require('mysql');
const express = require("express");
const bodyParser = require("body-parser");
 
const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});

function reconnect_db(){
  let db = mysql.createPool({
    connectionLimit : 10,
    host     : 'akuznetsov.beget.tech',
    user     : 'akuznetsov_sql',
    database : 'akuznetsov_sql',
    password : '***' // ИЗМЕНИТЬ
  });
  db.on('error', function(err){
      console.log(err.code);
  if(err.code == 'PROTOCOL_CONNECTION_LOST') db = reconnect_db();
  else throw err;
});
return db;
}

let db = reconnect_db();


// const connection = mysql.createConnection({
//   host     : 'akuznetsov.beget.tech',
//   user     : 'akuznetsov_sql',
//   database : 'akuznetsov_sql',
//   password : '***' // ИЗМЕНИТЬ
// });

// ПОДКЛЮЧЕНИЕ
// connection.connect(function(err) {
//     if (err) {
//         return console.error('error connecting: ' + err.message);
//     }

//     console.log('Подключение к серверу MySQL, id - ' + connection.threadId);
// });

// СОЗДАЕМ ТАБЛИЦУ
// const sql1 = `
//   create table if not exists Users(
//   login int auto_increment,
//   name varchar(100) not null,
//   surname varchar(100) not null,
//   patronymic varchar(100) null, 
//   primary key (login)
//   )`;

// const sql2 = `
//   create table if not exists Subjects(
//   subjectId int auto_increment,
//   name varchar(100) not null,
//   primary key (subjectId)  
// )`;

// const sql3 = `
//   create table if not exists User_subject(
//   id int primary key auto_increment,
//   login int not null,
//   subject int not null,
//   foreign key (subject) references Subjects (subjectId)
//   )`;


// const sql = `create table if not exists users(
// id int primary key auto_increment,
// name varchar(255) not null,
// age int not null
// )`;

// const sql = `CREATE TABLE if not exists teachers(
//   id INT(11) NOT NULL AUTO_INCREMENT,
//   name VARCHAR(25) NOT NULL,
//   zarplata INT(11),
//   premia INT(11),
//   PRIMARY KEY (id)
// )`;

// const sql = `CREATE TABLE if not exists Shippers(
//   ShipperID INT(11) NOT NULL AUTO_INCREMENT,
//   ShipperName VARCHAR(51) NOT NULL,
//   Phone INT(11),
//   PRIMARY KEY (ShipperID)
// )`;

// const sql = `CREATE TABLE if not exists Orders(
//   OrderID INT(11) NOT NULL AUTO_INCREMENT,
//   OrderDate DATE NOT NULL,
//   ShipperID INT(11),
//   PRIMARY KEY (OrderID)
// )`;

// connection.query(sql3, function(err, results) {
//     if(err) console.log(err);
//     else console.log("Таблица создана");
// });

app.set("view engine", "hbs");


// ВЫБОРКА
// db.query(`
// select u.name as first_name, u.surname as last_name, s.name as title from Users u 
// join User_subject us 
// on u.login = us.login 
// join Subjects s 
// on s.id = us.subject
// `, 
//   function(error, result, fields){
//     // console.log(error);
//     console.log(result); // собственно данные
//     // console.log(fields); // мета-данные полей 
// });


// ОТКЛЮЧАЕМСЯ
// connection.end(function(err) {
//     if (err) {
//         return console.log("Ошибка: " + err.message);
//     }
//     console.log("Подключение закрыто");
// });

// получение списка пользователей
app.get("/", function(req, res){
    db.query(`
    select u.name as first_name, u.surname as last_name, s.name as title from Users u 
    join User_subject us 
    on u.login = us.login 
    join Subjects s 
    on s.id = us.subject
    `, function(err, data) {
        if(err) return console.log(err);
        console.log(`id: ${Math.floor(Math.random()*100)} `);
        // console.log(data);
        res.render("index.hbs", {
            users: data
        });
      });
});
// возвращаем форму для добавления данных
app.get("/create", function(req, res){
    res.render("create.hbs");
});
// получаем отправленные данные и добавляем их в БД 
app.post("/create", urlencodedParser, function (req, res) {
         
    if(!req.body) return res.sendStatus(400);
    const name = req.body.name;
    const age = req.body.age;
    connection.query("INSERT INTO users (name, age) VALUES (?,?)", [name, age], function(err, data) {
      if(err) return console.log(err);
      res.redirect("/");
    });
});
 
// получем id редактируемого пользователя, получаем его из бд и отправлям с формой редактирования
app.get("/edit/:id", function(req, res){
  const id = req.params.id;
  connection.query("SELECT * FROM users WHERE id=?", [id], function(err, data) {
    if(err) return console.log(err);
     res.render("edit.hbs", {
        user: data[0]
    });
  });
});
// получаем отредактированные данные и отправляем их в БД
app.post("/edit", urlencodedParser, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);
  const name = req.body.name;
  const age = req.body.age;
  const id = req.body.id;
   
  connection.query("UPDATE users SET name=?, age=? WHERE id=?", [name, age, id], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/");
  });
});
 
// получаем id удаляемого пользователя и удаляем его из бд
app.post("/delete/:id", function(req, res){
          
  const id = req.params.id;
  connection.query("DELETE FROM users WHERE id=?", [id], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.listen(3000, function(){
//   console.log("Сервер ожидает подключения...");
// });