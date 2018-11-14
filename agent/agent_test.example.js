const express = require('express');
const _ = require('underscore');
const request = require('sync-request');
const exec = require('child_process').execSync;

// Remember about add this line in:
// sudo nano /etc/sudoers.d/testee
// pi ALL=/sbin/shutdown
// pi ALL=NOPASSWD: /sbin/shutdown
// pi ALL=/sbin/service
// pi ALL=NOPASSWD: /sbin/service


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
            let status = exec( 'sudo /sbin/service httpd restart' ).toString();
            console.log("Resetuje usługe httpd:"+status);
            // process.exit();
            return true;
        }
    },
    "test_1": {
        "run": () => {
            try{
                let status = exec( 'sudo /sbin/service mysqld status' ).toString();

                if( status.toString().search("is running...") === -1) 
                    return status.toString();
                else
                    return true;

            }catch(e){
                return e.stdout.toString('utf8');
            }
        },

        "reset": () => {
            console.log("Resetuje maszyne: " + status);
            let status = exec( 'sudo /sbin/shutdown --reboot now' ).toString();
            return true;
        }
    }
}

module.exports = testFunctions;