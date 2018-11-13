const express = require('express');
const _ = require('underscore');


const testFunctions = {
    "test_0": {
        "run": () => {
            // Dowolny kod aby sprawdzić usługe
            let x;
            x = _.random(0, 10);

            if(!x) return x;
            else   return 200;
        },
        "reset": () => {
            // Dowolny kod aby wyłaczyć / restartować usługe
            console.log("Resetuje usługe 1");
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