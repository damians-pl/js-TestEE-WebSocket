const path = require('path');
const express = require('express');
const _ = require('underscore');
const app = express();
const nodemailer = require('nodemailer');

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const minilogger = require('mini-logger');

var testEE = [];
var intervalTestEE = [];
var intervalWeb = false;

app.use('/public', express.static('public'))


var log = minilogger({
    dir: path.join(__dirname, 'logs'),
    categories: [ 'socket' ],
    format: '[{category}.]YYYY-MM-DD[.log]',
    timestamp: true
  });

io.on('connection', (socket) => { 

    socket.on('init', (res) => {


        console.log('Connecting Node: '+ res.nodeId +' ...');
        log.socket('Connecting Node: '+ res.nodeId +' ...');
        
        if( _.isEmpty(res) ){
            console.log('No set config. Disconnected.');
            log.socket('No set config. Disconnected.');
            socket.emit('initRes', 'No set config. Disconnected.');
            socket.disconnect(true);
            return;
        }

        if( _.isString(res.nodeId) === false || _.isEmpty(res.nodeId)){
            console.log('No set Node. Disconnected.');
            log.socket('No set Node. Disconnected.');
            socket.emit('initRes', 'No set Node. Disconnected.');
            socket.disconnect(true);
            return;
        }

        if( _.isString(res.email) === false || _.isEmpty(res.email) ){
            console.log('No set Email. Disconnected.');
            log.socket('No set Email. Disconnected.');
            socket.emit('initRes', 'No set Email. Disconnected.');
            socket.disconnect(true);
            return;
        }

        if( _.isObject(testEE[res.nodeId]) && testEE[res.nodeId].intervalStatus === 1 ){
            console.log('Exist Node. Disconnected.');
            log.socket('Exist Node. Disconnected.');
            socket.emit('initRes', 'Exist Node. Disconnected.');
            socket.disconnect(true);
            return;
        }


        testEE[res.nodeId] = {};
        testEE[res.nodeId].socket_id = socket.id || 0;
        testEE[res.nodeId].nodeId = res.nodeId;
        testEE[res.nodeId].email = res.email;
        testEE[res.nodeId].testing = res.testing || [];

        intervalTestEE[res.nodeId] = false;


        console.log('Connected Node: ' + testEE[res.nodeId].nodeId);
        log.socket('Connected Node: ' + testEE[res.nodeId].nodeId);
        socket.emit('initRes', 1);

        if( _.isEmpty(testEE[res.nodeId].testing) === true ){
            console.log('Nothing to do in test: ' + testEE[res.nodeId].nodeId);
            log.socket('Nothing to do in test: ' + testEE[res.nodeId].nodeId);
            testEE[res.nodeId].intervalStatus = 0;
            socket.disconnect(true);
        }else{
            console.log('Start interval test: ' + testEE[res.nodeId].nodeId);
            log.socket('Start interval test: ' + testEE[res.nodeId].nodeId);
            testEE[res.nodeId].intervalStatus = 1;
            intervalTestEE[res.nodeId] = setInterval( () => { intervalTest(socket, res.nodeId); }, 30*1000);
        }

    });

    socket.on('disconnect', function(){
        // if( _.isEmpty(testEE) === true) return;

        let nodeId = getNode(socket.id);
        
        if(nodeId){
            testEE[nodeId].intervalStatus = 0;
            clearInterval(intervalTestEE[nodeId]);
            // delete intervalTestEE[nodeId];
        }
        console.log('Disconnected Node: ' + nodeId);
        log.socket('Disconnected Node: ' + nodeId);
    });

});

function getNode(socket_id){

    let nodeId = _.findKey( testEE, {"socket_id": socket_id});

    if(nodeId === -1){
        return false;
    }else{
        return nodeId;
    }
}

function intervalTest(socket, node_id){
    let i = 0;
    _(testEE[node_id].testing).each( (n) => {
        socket.emit('testQuery', n.nameTest, i, (res, c) => {
            console.log('Service test #'+c+': ' + node_id + ' -> ' + n.nameTest + ' -> Response: ' + res);
            log.socket('Service test #'+c+': ' + node_id + ' -> ' + n.nameTest + ' -> Response: ' + res);
            testEE[node_id].testing[c].currentResult = res;
            testEE[node_id].date = new Date();
            
            if(res === n.expectationResult){
                console.log("PASS");
                log.socket("PASS");
                testEE[node_id].testing[c].status = 1;
            }else if(res === -1){
                testEE[node_id].testing[c].status = 0;
                console.log("NEUTRAL - TEST NULL");
                log.socket("NEUTRAL - TEST NULL");
            }else{
                console.log("FAIL: " + res);
                log.socket("FAIL: " + res);
                testEE[node_id].testing[c].status = 2;

                sendEmail(
                    testEE[node_id].email, 
                    'Alert #'+node_id, 
                    'Service test #'+c+': ' + node_id + ' -> ' + n.nameTest + ' -> Response: ' + res
                );

                socket.emit('testResetService', n.nameTest, c, (resReset) => {
                    if(resReset === true){
                        testEE[node_id].intervalStatus = 2;
                        clearInterval(intervalTestEE[node_id]);
                        intervalTestEE[node_id] = false;

                        console.log("WAITING FOR RESTART APP...");
                        log.socket("WAITING FOR RESTART APP...");
                    }else{
                        console.log("ERROR RESTART SERVICE: "+resReset);
                        log.socket("ERROR RESTART SERVICE: "+resReset);
                    }
                });
            }

        });
        i = i+1;
    } );
    

    
    return;
}

// Mail send
function sendEmail(to, subject, text){

    let transporter = nodemailer.createTransport({
        host: 'mail.sulmowski.eu',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "test@sulmowski.eu", // generated ethereal user
            pass: "KKeLj32Rq" // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: 'test@sulmowski.eu',
        to: to || 'damians106@gmail.com',
        subject: 'TestEE - ' + subject,
        text: text || 'Example mail !'
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
        log.socket('Email sent: ' + info.response);
    }
    });
}

// Klient web
var web = io.of('/web');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/html/index.html');
});

web.on('connection', function(socket){
    console.log("Connect web viewer");
    log.socket("Connect web viewer");
    intervalWeb = setInterval( () => { intervalWebTestEE(socket); }, 1*1000);

    socket.on('disconnect', function(){
        clearInterval(intervalWeb);
        console.log('Disconnected web viewer');
        log.socket('Disconnected web viewer');
    });
});

function intervalWebTestEE(socket){
    web.emit('dataTestEE', Object.values(testEE));
}

server.listen(8877);