require('dotenv').config()

const { Client } = require('pg')
const axios = require('axios')
const fetch = require('node-fetch');

const HIVEOS_TOKEN = process.env.HIVEOS_TOKEN

if(HIVEOS_TOKEN === undefined) {
    console.error(`HIVEOS_TOKEN not set.  Exiting.`)
    process.exit(1)
}

const baseUrl = 'https://api2.hiveos.farm/api/v2';
let accessToken = HIVEOS_TOKEN;

function getFarms() {
    return fetch(`${baseUrl}/farms`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    }).then(r => {
        if (!r.ok) {
            r.json().then(data => {
                console.error(data.message || 'Response error');
            });
            return Promise.reject(r);
        }
        else {
            return r.json();
        }
    });
}

getFarms()
    .then(farms => {
        let promises = [];
        for(farm of farms.data){
            // console.log(farm);
            let promise = new Promise((resolve,reject)=>{
                return fetch(`${baseUrl}/farms/${farm.id}/workers`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                })
                .then(r=>{
                    if(!r.ok){
                        reject(r)
                    }else{
                        return r.json()
                    }
                })
                .then(d=>{resolve({ farmId : farm.id, worker: d})})
            })
            promises.push(promise)
        }
        return Promise.all(promises)
    })
    .then(d=>{
        // Payload output to console (temporary)
        console.log(JSON.stringify(d,null,2))
    });
