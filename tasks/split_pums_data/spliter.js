// import * as fs from 'fs';
// import { fastCsv } from 'fast-csv';
const fs = require('fs');
const fastCsv = require('fast-csv');
const Papa = require('papaparse');


const datas = {};
const options = {headers: true}; 

// const hhByPuma = hhdata.reduce((out,curr) => {
        //     if(!out[curr.puma]) {
        //         out[curr.puma] = []
        //     }
        //     out[curr.puma].push(curr)
        // }, {})

        // Object.key(hhByPuma).forEach(puma => {
        //     fs.write(`./psam_h${puma}.csv`, papa.unparse(hhByPuma[puma]))
        // })

 // var persondata = Papa.parse('../../public/data/psam_p36.csv', {header: true});
//  var persondata =  Papa.parse('../../public/data/psam_p36.csv', {
//     complete: function(results) {
//         console.log("Finished:", results.data);
//     }
// });

// console.log('persondata', persondata )

// const personsByPuma = persondata.reduce((out,curr) => {
//         if(!out[curr.PUMA]) {
//             out[curr.PUMA] = []
//         }
//         out[curr.PUMA].push(curr)
//     }, {})

//     Object.key(personsByPuma).forEach(id => {
//         fs.write(`../../public/data/test1/psam_p36${id}.csv`, Papa.unparse(personsByPuma[id]))
//     })

        

fastCsv
    // .parseFile('../../public/data/psam_h36.csv', options) // for household
    .parseFile('../../public/data/psam_p36.csv', options)   // for person
    .on('data', d => {
        if (!datas[d.PUMA])
            datas[d.PUMA] = [];
        datas[d.PUMA].push(d)
    })
    .on('end', () => {

        // console.log(JSON.stringify(datas))
        // console.log(Object.values(datas))

        Object.keys(datas).forEach(id => {
            // For each ID, write a new CSV file
            fastCsv
                .write(datas[id], options)
            //    .pipe(fs.createWriteStream(`../../public/data/psam_h36${id}.csv`));  //hh
                .pipe(fs.createWriteStream(`../../public/data/psam_p36${id}.csv`));   //person
        })
    })


   