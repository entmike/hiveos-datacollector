require('dotenv').config()

const { Client } = require('pg')

const fetch = require('node-fetch')

const HIVEOS_TOKEN = process.env.HIVEOS_TOKEN
const INTERVAL = process.env.INTERVAL || 600

if (HIVEOS_TOKEN === undefined) {
  console.error(`HIVEOS_TOKEN not set.  Exiting.`)
  process.exit(1)
}

const baseUrl = 'https://api2.hiveos.farm/api/v2'
let accessToken = HIVEOS_TOKEN
let start, end

function getFarms() {
  start = new Date().getTime()
  return fetch(`${baseUrl}/farms`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }).then(r => {
    if (!r.ok) {
      r.json().then(data => {
        console.error(data.message || 'Response error')
      })
      return Promise.reject(r)
    } else {
      return r.json()
    }
  })
}

getFarms()
  .then(f => {
    let promises = []
    for (let farm of f.data) {
      // console.log(farm);
      let promise = new Promise((resolve, reject) => {
        return fetch(`${baseUrl}/farms/${farm.id}/workers`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
          .then(r => {
            if (!r.ok) {
              reject(r)
            } else {
              return r.json()
            }
          })
          .then(d => {
            end = new Date().getTime()
            resolve({ farmId: farm.id, worker: d })
          })
      })
      promises.push(promise)
    }
    return Promise.all(promises)
  })
  .then(farms => {
    // Payload output to console (temporary)
    // console.log(JSON.stringify(farms, null, 2))
    let duration = end - start
    console.log(`HiveOS Stats collected (${duration}ms)`)
    return farms
  })
  .then(farms => {
    const client = new Client()
    client.connect()
    // CREATE TABLE hiveos_stats (
    //     farmid integer NOT NULL,
    //     workerid integer NOT NULL,
    //     timestamp timestamp without time zone NOT NULL DEFAULT now(),
    //     bus_id character varying(32) NOT NULL,
    //     bus_number integer NOT NULL,
    //     temp integer,
    //     power integer,
    //     fan integer,
    //     is_overheated boolean,
    //     hash double precision
    // );
    const c = []
    for (const farm of farms) {
      for (const worker of farm.worker.data) {
        for (const gpuStat of worker.gpu_stats) {
          c.push(
            `(${farm.farmId},${worker.id},'${gpuStat.bus_id}',${gpuStat.bus_number},${gpuStat.temp},${gpuStat.power},${gpuStat.fan},${gpuStat.is_overheated},${gpuStat.hash})`
          )
        }
      }
    }
    console.log(
      `Writing the following values to DB and waiting ${INTERVAL} seconds until next refresh.`
    )
    console.log(c)
    const s = c.join(', ')
    const query = `
    INSERT INTO hiveos_stats (farmid, workerid, bus_id, bus_number, temp, power, fan, is_overheated, hash)
    VALUES ${s}`
    // Execute INSERT command
    client.query(query, (err, results) => {
      if (err) {
        console.error(`An error happened when trying to run:\n${query}`)
        console.error(err)
        client.end()
        setTimeout(getFarms, INTERVAL * 1000)
      } else {
        console.log(`Insert successful.`)
        // console.log(results)
        client.end()
        setTimeout(getFarms, INTERVAL * 1000)
      }
    })
  })
