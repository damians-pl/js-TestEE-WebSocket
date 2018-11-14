const express = require('express');
const _ = require('underscore');
const request = require('sync-request');
const exec = require('child_process').execSync;

const testFunctions = {
    "test_0": {
        "run": () => {
            try {
                var res = request('GET', 'http://google.com');  
                if( res.statusCode >= 300 ){
                    return res.statusCode;
                }else{
                    return 200;
                }
            } catch (error) {
                // console.log( error );
                return "Fatal error";
            }
        
        },
        "reset": () => {
            
            // Remember about add this line in:
            // sudo nano /etc/sudoers.d/testee
            // pi ALL=/sbin/shutdown
            // pi ALL=NOPASSWD: /sbin/shutdown
            // pi ALL=/sbin/service
            // pi ALL=NOPASSWD: /sbin/service

            let status = exec( 'sudo /sbin/service httpd restart' ).toString();
            console.log("Resetuje usługe httpd:"+status);
            // process.exit();
            return true;
        }
    },
    "test_1": {
        "run": () => {
            let status = exec( 'sudo /sbin/service httpd status' ).toString();

            if( status.search("is running...") === -1) 
                return status;
            else
                return true;
        },

        "reset": () => {
            let status = exec( 'sudo /sbin/shutdown -h now' ).toString();
            console.log("Resetuje maszyne: " + status);
            return true;
        }
    }
}

module.exports = testFunctions;