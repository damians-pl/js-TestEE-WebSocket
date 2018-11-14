var socket = require('socket.io-client')('http://testee.aws.sulmowski.eu:8877');
const _ = require('underscore');

var configFile = process.argv[2] || "agent_conf.json";
var config = require("./"+configFile);

var testFile = process.argv[3] || "agent_test.js";
var testFunctions = require("./"+testFile);

console.log('Start TestEE: '+config.nodeId);

socket.on('connect', function(){
    console.log('Connected with server TestEE');
    socket.emit('init', config);
});


socket.on('initRes', (res) => {
    console.log('init_res: ' + res);
});

socket.on('testQuery', (res, i, fn) => {
    if( _.isObject(testFunctions["test_"+i]) === false){
        console.log('Error, undefined test #'+i+': ' + res );
        fn(-1, i);
    }else{
        let returnTest = testFunctions["test_"+i]["run"]();

        console.log('Run test #'+i+': ' + res + ' -> Return: ' + returnTest);
        fn(returnTest, i);
    }
    
});

socket.on('testResetService', (res, i, fn) => {
    console.log('Service reset #'+i+': ' + res);
    
    let returnReset = testFunctions["test_"+i]["reset"]();

    fn(returnReset);
    //if(returnReset == true) process.exit(0);
});


socket.on('disconnect', function(res){
    console.log('Disconnected #'+res);
});

process.once('SIGINT', function (code) {
    console.log('SIGINT received...');
    // socket.emit('forceDisconnect');
    socket.disconnect(true);
    process.exit();
});