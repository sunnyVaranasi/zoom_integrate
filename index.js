require('dotenv').config()
const express = require('express')
const path = require('path');
var cluster = require('cluster')
var bodyParser = require('body-parser');
// const router = express.Router();

const {authorize, redirect, createMeeting, newRegistration, refresh, listMeeting, getMeeting, deleteMeeting, listRegistrant, myLocation} = require('./zoomhelper');  

// const { r } = require('tar');
const { pid } = require('process');
const { default: axios } = require('axios');

var port = process.env.PORT || 3030;;
process.env.NODE_NO_WARNINGS = 1;

var cCPUs = 1;
var now = (function(){
    var year = new Date(new Date().getFullYear().toString()).getTime();
    return function(){
        return Date.now()
    }
})();

if(cluster.isMaster){
    for(var i = 0; i < cCPUs; i++){
        cluster.fork();
    }

    cluster.on('online', function(worker){
        console.log('Worker ' + worker.process.pid + ' is online');
    });
    cluster.on('exit', function(worker, code, signal){
        console.log('Worker ' + worker.process.pid + ' died');
    });
}else{

// ###################################################################

    var app = express();

    app.use(bodyParser.urlencoded({
        extended:true
    }));

    app.use(bodyParser.json());
    app.listen(port);

//     router.get('/',function(req,res){
//         res.sendFile(path.join(__dirname+'/verifyzoom.html'));
//         //__dirname : It will resolve to your project folder.
//     });
    
    app.use('/', (req, res, next) => {
        res.send("3e41c3afc84848e095bdb63213c5c57f");
    });
    app.get('/zoom', async function(req, res){
        // console.log(authorize());
        return res.redirect(authorize())
    });

    app.get('/redirect', async function(req, res){
        // console.log("Inside redirect page");
        return res.json(redirect(req.query.code))
        // console.log(res.json());
    });

    app.get('/refresh', async function(req,res){
        return res.json(refresh())

    })

    // LIST MEETING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    app.get('/list-meetings', async function(req,res){
        let result = await listMeeting();
        return res.json(result);
    })

    // CREATE MEETING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    app.post('/create-meeting', async (req, res) => {
        console.log(req.body);
        let result = await createMeeting(req.body);

        return res.json(result); 
    });

    // GET MEETING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    app.get('/getmeeting', async function(req, res){
        let result = await getMeeting(req.body);

        return res.json(result);
    });


// http://localhost:4000/getmeeting
// {
// "meetingId": 83464833825
// }

    // DELETE MEETING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    app.delete('/delete-meeting', async function(req, res){
        let result = await deleteMeeting(req.body);

        return res.json(result);
    });


    //MEETING REGISTRATION $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    app.post('/meetingreg', async (req, res)=>{
        let result = await newRegistration(req.body);

        return res.json(result);

    });

    // LIST REGISTRANT
    app.post('/list-registrant', async (req, res)=>{
        let result = await listRegistrant();

        return res.json(result);
    })

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


    // LIST REGISTRANT
    app.get('/mylocation', async (req, res)=>{
        let result = await myLocation();

        return res.json(result);
    })

}


// CREATE MEETING REQ BODY 
// http://localhost:4000/create-meeting
// {
//     "agenda":"new year celebration",
//     "default_password":true,
//     "duration": 90,
//     "password":123456,
//     "pre_schedule":false,
//     "schedule_for":"vivek@cosmofeed.com",
//     "start_time":"2023-01-12T19:02:00Z",
//     "timezone":"Asia/Calcutta",
//     "approval_type":0,
//     "registration_type":1,
//     "registrants_email_notification":true,
//     "allow_multiple_devices": false,
//     "topic":"Meeting 3"
// }


// MEETING  REGISTRATION REQ BODY
// http://localhost:4000/meetingreg
// {
//     "first_name": "Jill",
//     "last_name": "Chill",
//     "email": "jchill@example.com",
//     "address": "1800 Amphibious Blvd.",
//     "city": "Mountain View",
//     "state": "CA",
//     "zip": "94045",
//     "country": "US",
//     "phone": "5550100",
//     "comments": "Looking forward to the discussion.",
//     "custom_questions": [
//         {
//         "title": "What do you hope to learn from this?",
//         "value": "Look forward to learning how you come up with new recipes and what other services you offer."
//         }
//     ],
//     "industry": "Food",
//     "job_title": "Chef",
//     "no_of_employees": "1-20",
//     "org": "Cooking Org",
//     "purchasing_time_frame": "1-3 months",
//     "role_in_purchase_process": "Influencer",
//     "language": "en-US",
//     "auto_approve": true
// }
