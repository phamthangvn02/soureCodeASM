const express = require('express');
const cons = require('consolidate');
const app = express();
const engines = require('consolidate');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require('path').join(__dirname, '/public');
app.use(express.static(publicDir));

app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://thangpn:02072000t@cluster0.i3pg9.gcp.mongodb.net/test"


app.get('/', async function (req, res) {
    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM")
    let results = await dbo.collection("products").find({}).toArray();
    res.render('allProducts', {
        model: results
    })

})

app.post('/doSearch', async function (req, res) {
    let ipname = req.body.txtName;
    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM")
    let results = await dbo.collection("products").find({
           name: new RegExp(ipname,'i')
     }).toArray();
    res.render('allProducts', {
        model: results
    })
})
app.get('/insert', (req, res) => {
    res.render('insert');
})
app.post('/doInsert', async (req, res) => {
    
    let inpName = req.body.txtName;
    let inpImage = req.body.txtImage;
    let inpPrice = req.body.txtPrice;
    let inpDetal = req.body.txtDetal;
    let newToy = {
        name: inpName,
        image: inpImage,
        price: inpPrice,
        detal: inpDetal
    };
    if(inpName.trim().length ==0 || inpPrice.trim().length == 0){
        let modelError ={nameError:"You forget something"};
        res.render('insert',{model:modelError});
    }
    else{
         if(isNaN(inpPrice))
         {
             let modelError1 ={priceError:" Only enter numbers"};
             res.render('insert',{model:modelError1})
         }else{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM");
    await dbo.collection("products").insertOne(newToy);
    res.redirect('/');
}}
})
app.get('/delete', async (req, res) => {
    let inputID = req.query.id;
    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM");
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(inputID)};
    await dbo.collection("products").deleteOne(condition);
    res.redirect('/');
})
 app.get('/update',async(req,res)=>
 {
     let id = req.query.id;
     let cliet = await MongoClient.connect(url);
     let dbo = cliet.db('ASM');
     var ObjectID = require('mongodb').ObjectID; 
     let result = await dbo.collection("products").findOne({'_id' : ObjectID(id)});
     res.render('update',{products:result});
 })
 app.post('/doUpdate', async(req,res)=>{
     let id = req.body.id;
     let inpName = req.body.txtName;
     let inpImage=req.body.txtImage;
     let inpPrice = req.body.txtPrice;
     let inpDetail = req.body.txtDetail;
     let newValues ={$set : {
         name: inpName,
         image: inpImage,
         price:inpPrice,
         detal:inpDetail}};
         if(inpName.trim().length ==0 || inpPrice.trim().length == 0){
            let modelError ={nameError:"You forget something"};
            res.render('update',{model:modelError});
        }
        else{
             if(isNaN(inpPrice))
             {
                 let modelError1 ={priceError:" Only enter numbers"};
                 res.render('update',{model:modelError1})
             }else{
                var ObjectID = require('mongodb').ObjectID;
                let condition = {"_id" : ObjectID(id)};
                let client= await MongoClient.connect(url);
                let dbo = client.db("ASM");
                await dbo.collection("products").updateOne(condition,newValues);
        res.redirect('/');
    }}
 });
var server = app.listen(process.env.PORT||9000,function(){
    console.log("Server is running.....");
})