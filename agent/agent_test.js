const express = require('express');
const _ = require('underscore');
const request = require('sync-request');
const exec = require('child_process').exec;

const testFunctions = {
    "test_0": {
        "run": () => {
            try {
                var res = request('GET', 'http://googledsds.com');  
                if( res.statusCode >= 300 ){
                    return res.statusCode;
                }else{
                    return 200;
                }
            } catch (error) {
                console.log( error );
                return error;
            }
            
        },
        "reset": () => {
            // Dowolny kod aby wyłaczyć / restartować usługe
            console.log("Resetuje usługe 1");
            return exec( 'sudo service httpd restart', (error, stdout, stderr) => { return true; } );
            return true;
        }
    },
    "test_1": {
        "run": () => {
            // Dowolny kod aby sprawdzić usługe
            let x;
            x = _.random(0, 50);

            if(!x) return x;
            else   return 200;
        },
        "reset": () => {
            // Dowolny kod aby wyłaczyć / restartować usługe
            console.log("Resetuje usługe 2");
            return true;
        }
    }
}

module.exports = testFunctions;