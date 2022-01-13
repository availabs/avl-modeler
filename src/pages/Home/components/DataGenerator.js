import React, { useState } from 'react';
import flatten from 'lodash.flatten';
import Papa from 'papaparse';
import { useFalcor } from '@availabs/avl-components';
import JSZip from 'jszip';
import { saveAs } from "file-saver"
import controlConfigJson from './control_config.json'
//let controlConfigJson = require('./control_config.json')  //if public data folder 


const DataGenerator = ({ layer }) => {

    const {falcor, falcoCache} = useFalcor()
    const [process, setProcess] = useState('');  // hook!!
    //const [seedData, setSeedData] = useState({});

    const startProcess = async () => {
        setProcess('working')

        console.time('generate crosswalk')
        let crosswalkData = generateCrosswalk()
        console.timeEnd('generate crosswalk')
        
        console.time('generate seed')
        let seedData = await generateSeedData()  // because fetch--promise
        console.timeEnd('generate seed')
        
        console.time('generate control')
        let controlData = await generateControl(crosswalkData) // because fetch--promise 
        console.timeEnd('generate control')

        console.time('generate controlControl')
        //let controlConfig = generateControlConfig(controlData)
        //expression is hard to generate so decide to manually creat object json and import
        let controlConfig = controlConfigJson  
        console.timeEnd('generate controlControl')

        console.log('getting data----', crosswalkData, seedData, controlData, controlConfig)

        //save each Data(inputs data) as zip file 
        //how to --https://github.com/Stuk/jszip
        var zip = new JSZip();
        zip.file('geo_cross_walk.csv',Papa.unparse(crosswalkData)) //use Papa.unparse to put json back to csv
        zip.file('seed_households.csv',Papa.unparse(seedData.household))
        zip.file('seed_persons.csv',Papa.unparse(seedData.person))
        zip.file('control_totals_bg.csv',Papa.unparse(controlData.control_bgs))
        zip.file('control_totals_tract.csv',Papa.unparse(controlData.control_tracts))
        zip.file('controls.csv',Papa.unparse(controlConfig))

        let zipFile = await zip.generateAsync({type:"blob"})
        saveAs(zipFile, 'pop_synth_input_new.zip')



        //old way --if not using async...await
        // generateSeedData()
        //     .then(seedData => {
        //         generateControl()
        //             .then(controlData => {
        //                 console.log('getting data', crosswalkData, seedData, controlData)
        //             })
        //     })
        
        setProcess('finished')
    }
   
    const generateCrosswalk = () => {      
      // TAZ	BLKGRP	STATEFP	COUNTYFP	TRACTCE	GEOID	NAME	NAMELSAD	PUMA	REGION
    
        console.log('selectedPumasBgs',  layer.state.selectedPumasBgs)
        
    
        let output = Object.keys(layer.state.selectedPumasBgs).map((key) => {
            // console.log("test---", key)
            return layer.state.selectedPumasBgs[key].map(bg =>{
                   // console.log('BLKGRP',bg);
                    return {
                        BG:bg.slice(-7),//last 5 digits of bg
                        BLKGRP:bg,
                        STATEFP:bg.slice(0, 2),//first 2 dgitsd of bg
                        COUNTYFP:parseInt(bg.slice(2, 5)),
                        TRACTCE:parseInt(bg.slice(5, 11)),
                        GEOID:bg.slice(0, 11),
                        NAME:parseInt(bg.slice(5, 11)),
                        NAMELSAD:`Census Tract ${parseInt(bg.slice(5, 11))}`,
                        PUMA:key.slice(3, 7),
                        REGION:1
                    }
                })
                //console.log('output--', data)
                // return data
        })
        console.log('outputCrosswalk---', output)
        return flatten(output)
        
    }

  

 // create Control.csv in config from gettting control variables
    // const generateControlConfig = (controlData) => {

    //     let controlTractKeys = Object.keys(controlData.control_tracts[0])
    //     let controlBgKeys = Object.keys(controlData.control_bgs[0])
    //     //console.log('controlTractKeys', controlTractKeys, controlBgKeys) 
       
    //    let controlConfigTract= controlTractKeys.map(key => {
    //         return {
    //             target:"",  // can't seems to figure out where it get this discriptions
    //             geography:"TRACT",
    //             seed_table: "housedholds",
    //             importance: "", //??
    //             control_field:key,
    //             expression: "", // python expression to output control data from seed?
    //          }
    //     })

    //     let controlConfigBg= controlBgKeys.map(key => {
    //         return {
    //             target:""	,
    //             geography:"BG" ,
    //             seed_table: "households",
    //             importance: "",
    //             control_field:key,
    //             expression: "",
    //          }
    //     })

    // return [...controlConfigTract,...controlConfigBg]
    // }

// if put the data in public folder

//     const generateControlConfig = () => {

//    return fetch('/data/control_config.json')
//       .then(response => 
//         response.json())
//       .then(data => {
//         console.log("control_config.json", data);
//         return data
//       })
//     }

// seed person --RT	SERIALNO	SPORDER	PUMA	ST	ADJINC	PWGTP	AGEP	CIT	COW	ENG	FER	GCL	GCM	GCR	INTP	JWMNP	JWRIP	JWTR	LANX	MAR	MIG	MIL	MLPA	MLPB	MLPC	MLPD	MLPE	MLPF	MLPG	MLPH	MLPI	MLPJ	MLPK	NWAB	NWAV	NWLA	NWLK	NWRE	OIP	PAP	RELP	RETP	SCH	SCHG	SCHL	SEMP	SEX	SSIP	SSP	WAGP	WKHP	WKL	WKW	YOEP	ANC	ANC1P	ANC2P	DECADE	DRIVESP	ESP	ESR	HISP	JWAP	JWDP	LANP	MIGPUMA	MIGSP	MSP	NATIVITY	NOP	OC	PAOC	PERNP	PINCP	POBP	POVPIP	POWPUMA	POWSP	QTRBIR	RAC1P	RAC2P	RAC3P	RACAIAN	RACASN	RACBLK	RACNHPI	RACNUM	RACSOR	RACWHT	RC	SFN	SFR	VPS	WAOB	FAGEP	FANCP	FCITP	FCOWP	FENGP	FESRP	FFERP	FGCLP	FGCMP	FGCRP	FHISP	FINDP	FINTP	FJWDP	FJWMNP	FJWRIP	FJWTRP	FLANP	FLANXP	FMARP	FMIGP	FMIGSP	FMILPP	FMILSP	FOCCP	FOIP	FPAP	FPOBP	FPOWSP	FRACP	FRELP	FRETP	FSCHGP	FSCHLP	FSCHP	FSEMP	FSEXP	FSSIP	FSSP	FWAGP	FWKHP	FWKLP	FWKWP	FYOEP	PWGTP1	PWGTP2	PWGTP3	PWGTP4	PWGTP5	PWGTP6	PWGTP7	PWGTP8	PWGTP9	PWGTP10	PWGTP11	PWGTP12	PWGTP13	PWGTP14	PWGTP15	PWGTP16	PWGTP17	PWGTP18	PWGTP19	PWGTP20	PWGTP21	PWGTP22	PWGTP23	PWGTP24	PWGTP25	PWGTP26	PWGTP27	PWGTP28	PWGTP29	PWGTP30	PWGTP31	PWGTP32	PWGTP33	PWGTP34	PWGTP35	PWGTP36	PWGTP37	PWGTP38	PWGTP39	PWGTP40	PWGTP41	PWGTP42	PWGTP43	PWGTP44	PWGTP45	PWGTP46	PWGTP47	PWGTP48	PWGTP49	PWGTP50	PWGTP51	PWGTP52	PWGTP53	PWGTP54	PWGTP55	PWGTP56	PWGTP57	PWGTP58	PWGTP59	PWGTP60	PWGTP61	PWGTP62	PWGTP63	PWGTP64	PWGTP65	PWGTP66	PWGTP67	PWGTP68	PWGTP69	PWGTP70	PWGTP71	PWGTP72	PWGTP73	PWGTP74	PWGTP75	PWGTP76	PWGTP77	PWGTP78	PWGTP79	PWGTP80	indp02	naicsp02	occp02	socp00	occp10	socp10	indp07	naicsp07	wgtp	employed	soc	OCCP	famTag	dupcount	OSUTAG	n	hhnum

// puma person  --RT	SERIALNO	DIVISION	SPORDER	PUMA	REGION	ST	ADJINC	PWGTP	AGEP	CIT	CITWP	COW	DDRS	DEAR	DEYE	DOUT	DPHY	DRAT	DRATX	DREM	ENG	FER	GCL	GCM	GCR	HIMRKS	HINS1	HINS2	HINS3	HINS4	HINS5	HINS6	HINS7	INTP	JWMNP	JWRIP	JWTRNS	LANX	MAR	MARHD	MARHM	MARHT	MARHW	MARHYP	MIG	MIL	MLPA	MLPB	MLPCD	MLPE	MLPFG	MLPH	MLPI	MLPJ	MLPK	NWAB	NWAV	NWLA	NWLK	NWRE	OIP	PAP	RELSHIPP	RETP	SCH	SCHG	SCHL	SEMP	SEX	SSIP	SSP	WAGP	WKHP	WKL	WKWN	WRK	YOEP	ANC	ANC1P	ANC2P	DECADE	DIS	DRIVESP	ESP	ESR	FOD1P	FOD2P	HICOV	HISP	INDP	JWAP	JWDP	LANP	MIGPUMA	MIGSP	MSP	NAICSP	NATIVITY	NOP	OC	OCCP	PAOC	PERNP	PINCP	POBP	POVPIP	POWPUMA	POWSP	PRIVCOV	PUBCOV	QTRBIR	RAC1P	RAC2P	RAC3P	RACAIAN	RACASN	RACBLK	RACNH	RACNUM	RACPI	RACSOR	RACWHT	RC	SCIENGP	SCIENGRLP	SFN	SFR	SOCP	VPS	WAOB	FAGEP	FANCP	FCITP	FCITWP	FCOWP	FDDRSP	FDEARP	FDEYEP	FDISP	FDOUTP	FDPHYP	FDRATP	FDRATXP	FDREMP	FENGP	FESRP	FFERP	FFODP	FGCLP	FGCMP	FGCRP	FHICOVP	FHIMRKSP	FHINS1P	FHINS2P	FHINS3C	FHINS3P	FHINS4C	FHINS4P	FHINS5C	FHINS5P	FHINS6P	FHINS7P	FHISP	FINDP	FINTP	FJWDP	FJWMNP	FJWRIP	FJWTRNSP	FLANP	FLANXP	FMARP	FMARHDP	FMARHMP	FMARHTP	FMARHWP	FMARHYP	FMIGP	FMIGSP	FMILPP	FMILSP	FOCCP	FOIP	FPAP	FPERNP	FPINCP	FPOBP	FPOWSP	FPRIVCOVP	FPUBCOVP	FRACP	FRELSHIPP	FRETP	FSCHGP	FSCHLP	FSCHP	FSEMP	FSEXP	FSSIP	FSSP	FWAGP	FWKHP	FWKLP	FWKWNP	FWRKP	FYOEP	PWGTP1	PWGTP2	PWGTP3	PWGTP4	PWGTP5	PWGTP6	PWGTP7	PWGTP8	PWGTP9	PWGTP10	PWGTP11	PWGTP12	PWGTP13	PWGTP14	PWGTP15	PWGTP16	PWGTP17	PWGTP18	PWGTP19	PWGTP20	PWGTP21	PWGTP22	PWGTP23	PWGTP24	PWGTP25	PWGTP26	PWGTP27	PWGTP28	PWGTP29	PWGTP30	PWGTP31	PWGTP32	PWGTP33	PWGTP34	PWGTP35	PWGTP36	PWGTP37	PWGTP38	PWGTP39	PWGTP40	PWGTP41	PWGTP42	PWGTP43	PWGTP44	PWGTP45	PWGTP46	PWGTP47	PWGTP48	PWGTP49	PWGTP50	PWGTP51	PWGTP52	PWGTP53	PWGTP54	PWGTP55	PWGTP56	PWGTP57	PWGTP58	PWGTP59	PWGTP60	PWGTP61	PWGTP62	PWGTP63	PWGTP64	PWGTP65	PWGTP66	PWGTP67	PWGTP68	PWGTP69	PWGTP70	PWGTP71	PWGTP72	PWGTP73	PWGTP74	PWGTP75	PWGTP76	PWGTP77	PWGTP78	PWGTP79	PWGTP80


// seed hh --RT	SERIALNO	DIVISION	PUMA	REGION	ST	ADJHSG	ADJINC	WGTP	NP	TYPE	ACR	AGS	BDS	BLD	BUS	CONP	ELEP	FS	FULP	GASP	HFL	INSP	MHP	MRGI	MRGP	MRGT	MRGX	RMS	RNTM	RNTP	SMP	TEL	TEN	VACS	VAL	VEH	WATP	YBL	FES	FINCP	FPARC	GRNTP	GRPIP	HHL	HHT	HINCP	HUGCL	HUPAC	HUPAOC	HUPARC	KIT	LNGI	MV	NOC	NPF	NPP	NR	NRC	OCPIP	PARTNER	PLM	PSF	R18	R60	R65	RESMODE	SMOCP	SMX	SRNT	SVAL	TAXP	WIF	WKEXREL	WORKSTAT	FACRP	FAGSP	FBDSP	FBLDP	FBUSP	FCONP	FELEP	FFSP	FFULP	FGASP	FHFLP	FINSP	FKITP	FMHP	FMRGIP	FMRGP	FMRGTP	FMRGXP	FMVP	FPLMP	FRMSP	FRNTMP	FRNTP	FSMP	FSMXHP	FSMXSP	FTAXP	FTELP	FTENP	FVACSP	FVALP	FVEHP	FWATP	FYBLP	WGTP1	WGTP2	WGTP3	WGTP4	WGTP5	WGTP6	WGTP7	WGTP8	WGTP9	WGTP10	WGTP11	WGTP12	WGTP13	WGTP14	WGTP15	WGTP16	WGTP17	WGTP18	WGTP19	WGTP20	WGTP21	WGTP22	WGTP23	WGTP24	WGTP25	WGTP26	WGTP27	WGTP28	WGTP29	WGTP30	WGTP31	WGTP32	WGTP33	WGTP34	WGTP35	WGTP36	WGTP37	WGTP38	WGTP39	WGTP40	WGTP41	WGTP42	WGTP43	WGTP44	WGTP45	WGTP46	WGTP47	WGTP48	WGTP49	WGTP50	WGTP51	WGTP52	WGTP53	WGTP54	WGTP55	WGTP56	WGTP57	WGTP58	WGTP59	WGTP60	WGTP61	WGTP62	WGTP63	WGTP64	WGTP65	WGTP66	WGTP67	WGTP68	WGTP69	WGTP70	WGTP71	WGTP72	WGTP73	WGTP74	WGTP75	WGTP76	WGTP77	WGTP78	WGTP79	WGTP80	AGEHOH	HTYPE	NWESR	nuniv_schg	HHINCADJ	famTag	dupcount	n	hhnum

// puma hh --RT	SERIALNO	DIVISION	PUMA	REGION	ST	ADJHSG	ADJINC	WGTP	NP	TYPE	ACCESS	ACR	AGS	BATH	BDSP	BLD	BROADBND	COMPOTHX	CONP	DIALUP	ELEFP	ELEP	FS	FULFP	FULP	GASFP	GASP	HFL	HISPEED	HOTWAT	INSP	LAPTOP	MHP	MRGI	MRGP	MRGT	MRGX	OTHSVCEX	REFR	RMSP	RNTM	RNTP	RWAT	RWATPR	SATELLITE	SINK	SMARTPHONE	SMP	STOV	TABLET	TEL	TEN	VACS	VALP	VEH	WATFP	WATP	YBL	CPLT	FES	FINCP	FPARC	GRNTP	GRPIP	HHL	HHLANP	HHT	HHT2	HINCP	HUGCL	HUPAC	HUPAOC	HUPARC	KIT	LNGI	MULTG	MV	NOC	NPF	NPP	NR	NRC	OCPIP	PARTNER	PLM	PLMPRP	PSF	R18	R60	R65	RESMODE	SMOCP	SMX	SRNT	SVAL	TAXAMT	WIF	WKEXREL	WORKSTAT	FACCESSP	FACRP	FAGSP	FBATHP	FBDSP	FBLDP	FBROADBNDP	FCOMPOTHXP	FCONP	FDIALUPP	FELEP	FFINCP	FFSP	FFULP	FGASP	FGRNTP	FHFLP	FHINCP	FHISPEEDP	FHOTWATP	FINSP	FKITP	FLAPTOPP	FMHP	FMRGIP	FMRGP	FMRGTP	FMRGXP	FMVP	FOTHSVCEXP	FPLMP	FPLMPRP	FREFRP	FRMSP	FRNTMP	FRNTP	FRWATP	FRWATPRP	FSATELLITEP	FSINKP	FSMARTPHONP	FSMOCP	FSMP	FSMXHP	FSMXSP	FSTOVP	FTABLETP	FTAXP	FTELP	FTENP	FVACSP	FVALP	FVEHP	FWATP	FYBLP	WGTP1	WGTP2	WGTP3	WGTP4	WGTP5	WGTP6	WGTP7	WGTP8	WGTP9	WGTP10	WGTP11	WGTP12	WGTP13	WGTP14	WGTP15	WGTP16	WGTP17	WGTP18	WGTP19	WGTP20	WGTP21	WGTP22	WGTP23	WGTP24	WGTP25	WGTP26	WGTP27	WGTP28	WGTP29	WGTP30	WGTP31	WGTP32	WGTP33	WGTP34	WGTP35	WGTP36	WGTP37	WGTP38	WGTP39	WGTP40	WGTP41	WGTP42	WGTP43	WGTP44	WGTP45	WGTP46	WGTP47	WGTP48	WGTP49	WGTP50	WGTP51	WGTP52	WGTP53	WGTP54	WGTP55	WGTP56	WGTP57	WGTP58	WGTP59	WGTP60	WGTP61	WGTP62	WGTP63	WGTP64	WGTP65	WGTP66	WGTP67	WGTP68	WGTP69	WGTP70	WGTP71	WGTP72	WGTP73	WGTP74	WGTP75	WGTP76	WGTP77	WGTP78	WGTP79	WGTP80


  //  console.log('output----', process, generateCrosswalk() )
  //selectedPumas--somehow it become 5 digit (maybe csv PUMA column settting?)
  console.log('selectedPumas---', layer.state.selectedPumas )

    const generateSeedData = ()  => {
        console.log('fetching households')

        let selectedPumas = layer.state.selectedPumas  

        // console.log('selectedPumas---', selectedPumas)

        const households = selectedPumas.map(pumaId => {
            return fetch(`/data/psam_h${pumaId}.csv`)
            .then(r => r.text())
            .then(d => {
                return {
                    type: 'h', 
                    data: Papa.parse(d, {header: true})   //Papa.parse CSV parser // with variable name header
                }
            })
        })

        const persons = selectedPumas.map(pumaId => {
            return fetch(`/data/psam_p${pumaId}.csv`)
            .then(r => r.text())
            .then(d => {
                return {
                    type: 'p', 
                    data:Papa.parse(d, {header: true})
                }
            })
        })
       

        console.time('load pums')

       return Promise.all([...households,...persons])
            .then(pumsData => {
                console.timeEnd('load pums')
              
                
                let hhdata = flatten(pumsData
                    .filter(d => d.type === 'h')
                    .map(d=>d.data.data)) 
                
                
                let pdata = flatten(pumsData
                    .filter(d => d.type === 'p')
                    .map(d=>d.data.data))
               
                      // b/c papa parse output = { data: [ ... ], errors: [ ... ], meta: {	... }}
                
               console.log ('seed data simple', hhdata, pdata)

                let hhindex = 1;   
                 
                let hhnumLookup = hhdata.reduce((lookup, hh) => {

                    if(!lookup[hh.SERIALNO]){
                        lookup[hh.SERIALNO] = hhindex;
                        hh.hhnum = hhindex;
                        hhindex+=1;
                    }
                    hh.hhnum = lookup[hh.SERIALNO]
                    return lookup
                },{})

                console.log('after hhnum', hhdata, hhnumLookup)

                pdata.forEach(d=> d.hhnum = hhnumLookup[d.SERIALNO]) // better than .map b/c no need to return
               
                // let test = pdata.map(d => d.hhnum = hhnumLookup[d.SERIALNO] )

                console.log('after p.hhnum', pdata)

                //console.log('seedPdata----', pdata,pdata[0], flatten(pdata), newpdata, test)
              //console.log('seedData_flatten' ,flatten(hhdata), pdata[0], flatten(pdata)),
              
                 return {
                    household: flatten(hhdata), // flatten(hhdata),
                    person:flatten(pdata) //flatten(pdata)
                }
            })
            
               
    }

    //console.log('output----', process, generateCrosswalk(),)

    const generateControl = (crosswalkData) => {
       
        let BgsPuma = crosswalkData.reduce((acc,obj)=>{
            acc[obj.BLKGRP]=obj.PUMA;
            return acc;
        }, {}
        );

        let TractsPuma = crosswalkData.reduce((acc,obj)=>{
            acc[obj.GEOID]=obj.PUMA;
            return acc;
        }, {}
        );
        console.log('BgsPuma---', BgsPuma, TractsPuma)

        // create census api call for bgs with variable using falcor 
        // create census api call for tracts with variables
        // falcor.get(['acs',${geoids},${years},${censusvars}]]) // falcor.get function format 
        // parse returned data into control format

        
        const bg_cenvars = {
            'p_total' : 'B01003_001E', //Total	TOTAL POPULATION
            'hh_total' : 'B25001_001E', //Total	HOUSING UNITS
            'hh_inc1' : 'B19001_002E',  //income Less than $10,000
            'hh_inc2' : 'B19001_003E',  //$10,000 to $14,999
            'hh_inc3' : 'B19001_004E',  //$15,000 to $19,999
            'hh_inc4' : 'B19001_005E',  //$20,000 to $24,999
            'hh_inc5' : 'B19001_006E',  //$25,000 to $29,999
            'hh_inc6' : 'B19001_007E',  //$30,000 to $34,999
            'hh_inc7' : 'B19001_008E',  //$35,000 to $39,999
            'hh_inc8' : 'B19001_009E',  //$40,000 to $44,999
            'hh_inc9' : 'B19001_010E',  //$45,000 to $49,999
            'hh_inc10' : 'B19001_011E', //$50,000 to $59,999
            'hh_inc11' : 'B19001_012E',  //$60,000 to $74,999
            'hh_inc12' : 'B19001_013E',  //$75,000 to $99,999
            'hh_inc13' : 'B19001_014E',  //$100,000 to $124,999
            'hh_inc14' : 'B19001_015E',  //$125,000 to $149,999
            'hh_inc15' : 'B19001_016E',  //$150,000 to $199,999
            'hh_inc16' : 'B19001_017E', //$200,000 or more
        }

        const tract_cenvars = {
            'hh_total': 'S2501_C01_001E',   //Occupied housing units
            'hh_size1' : 'S2501_C01_002E',  //1-person household
            'hh_size2' : 'S2501_C01_003E',  //2-person household
            'hh_size3' : 'S2501_C01_004E',   //3-person household
            'hh_size4' : 'S2501_C01_005E',   //4-or-more-person household 

            'hh_work0': 'B08202_002E',  //No workers
            'hh_work1': 'B08202_003E',  //1 worker
            'hh_work2': 'B08202_004E',  //2 workers
            'hh_work3': 'B08202_005E',  //3 or more workers

            'p_total':'S0101_C01_001E',   //Total population
            'p_age1': 'S0101_C01_002E',  //Under 5 years
            'p_age2': 'S0101_C01_003E',  //5 to 9 years
            'p_age3': 'S0101_C01_004E', //10 to 14 years
            'p_age4': 'S0101_C01_005E', //15 to 19 years
            'p_age5': 'S0101_C01_006E', //20 to 24 years
            'p_age6': 'S0101_C01_007E', //25 to 29 years
            'p_age7': 'S0101_C01_008E', //30 to 34 years
            'p_age8': 'S0101_C01_009E', //35 to 39 years
            'p_age9': 'S0101_C01_010E', //40 to 44 years
            'p_age10': 'S0101_C01_011E', //45 to 49 years
            'p_age11': 'S0101_C01_012E', //50 to 54 years
            'p_age12': 'S0101_C01_013E', //55 to 59 years
            'p_age13': 'S0101_C01_014E', //60 to 64 years
            'p_age14': 'S0101_C01_015E', //65 to 69 years
            'p_age15': 'S0101_C01_016E', //70 to 74 years
            'p_age16': 'S0101_C01_017E', //75 to 79 years
            'p_age17': 'S0101_C01_018E', //80 to 84 years
            'p_age18':'S0101_C01_019E',//85 years and over

           'p_occp1': 'C24060_002E', // Management, Business, Science, and Arts Occupations
           'p_occp2': 'C24060_003E', // Service Occupations
           'p_occp3': 'C24060_004E',// Sales and Office Occupations
           'p_occp4': 'C24060_005E', // Natural Resources, Construction, and Maintenance Occupations
           'p_occp5': 'C24060_006E',  // Production, Transportation, and Material Moving Occupations

        }
      

        let bgs = Object.values(layer.state.selectedPumasBgs)
        let flattenBgs =flatten(bgs)   //.filter((r, i) => i < 30)
      
        let tracts = flattenBgs.map(d =>d.slice(0, -1))
        let uniqueTracts = [...new Set(tracts)];
        
        //console.log("bgs-----", bgs,flattenBgs, flattenBgs.length, uniqueTracts, uniqueTracts.length)

        console.time('call acs')

        return falcor.chunk( //instead of falcor.get, use falcor.chunk & return falcor.getCache b/c long http call length 
        [
            'acs', //
            [...uniqueTracts], 
            [2019],
            [...Object.values(tract_cenvars)]
        ],
        [
            'acs',
            [...flattenBgs],
            [2019],
            [...Object.values(bg_cenvars)]
        ]
        ,{chunkSize: 200}
       )
        .then(d => {
            console.timeEnd('call acs')
            let acsFalcorData = falcor.getCache()
            // console.log('acsFalcorData',acsFalcorData)
            return acsFalcorData
             })

        // do final formating to get the final output
        .then (output=> {
                console.log('ACS---', output)
        //Tract--STATEFIPS	COUNTY	TRACT	HHWORK0	HHWORK1	HHWORK2	HHWORK3	SF	DUP	MF	MH	TRACTGEOID	HHBASE	POPBASE	PUMA	REGION	TAZ
        //TAZ--TAZ	POPBASE	HHBASE	HHSIZE1	HHSIZE2	HHSIZE3	HHSIZE4	HHAGE1	HHAGE2	HHAGE3	HHAGE4	HHINC1	HHINC2	HHINC3	HHINC4	OSUFAM	OSUNFAM	STATEFP	COUNTYFP	TRACTCE	TRACTGEOID	PUMA	REGION	MAZ	xTAZ


            let tractData = Object.values(output).map(d=>{
                
                let keys= Object.keys(d)
               
                return keys.filter(key=>key.length===11).map(key =>{

                   
                   let values = Object.values(d[key])
                   //console.log('values---', values)
                   let hhsize1V= values[0].S2501_C01_002E 
                   let hhsize2V =values[0].S2501_C01_003E
                   let hhsize3V= values[0].S2501_C01_004E 
                   let hhsize4V= values[0].S2501_C01_005E 

                   let hhage1V= values[0].S0101_C01_005E+values[0].S0101_C01_006E
                   let hhage2V =values[0].S0101_C01_007E+values[0].S0101_C01_008E+values[0].S0101_C01_009E+values[0].S0101_C01_010E+values[0].S0101_C01_011E+values[0].S0101_C01_012E
                   let hhage3V = values[0].S0101_C01_013E+values[0].S0101_C01_014E
                   let hhage4V = values[0].S0101_C01_015E+values[0].S0101_C01_016E+values[0].S0101_C01_017E+values[0].S0101_C01_018E+values[0].S0101_C01_019E
                    
                   let hhwork0V = values[0].B08202_002E
                   let hhwork1V = values[0].B08202_003E
                   let hhwork2V = values[0].B08202_004E
                   let hhwork3V = values[0].B08202_005E

                   let poccp1V = values[0].C24060_002E
                   let poccp2V = values[0].C24060_003E
                   let poccp3V = values[0].C24060_004E
                   let poccp4V = values[0].C24060_005E
                   let poccp5V = values[0].C24060_006E

                   let hhbaseV = values[0].S2501_C01_001E
                   let popbaseV= values[0].S0101_C01_001E

                                return{
                                  
                                //     STATEFIPS:key.slice(0, 2),	
                                //     COUNTY:key.slice(2, 5),	
                                //     TRACT:key.slice(5, 11),
                                
                                //     HHSIZE1:hhsize1V > 0 ? hhsize1V : 255,	
                                //     HHSIZE2:hhsize2V > 0 ? hhsize2V : 271,
                                //     HHSIZE3:hhsize3V > 0 ? hhsize3V : 119,
                                //     HHSIZE4:hhsize4V> 0 ? hhsize4V : 155,

                                //     //HHAGE0:values[0].S0101_C01_002E,
                                //     HHAGE1:hhage1V > 0 ? hhage1V : 378,
                                //     HHAGE2:hhage2V > 0 ? hhage2V : 730,	
                                //     HHAGE3:hhage3V > 0 ? hhage3V : 306,
                                //     HHAGE4:hhage4V > 0 ? hhage4V : 247,
                                 
                                //     HHWORK0:hhwork0V > 0 ? hhwork0V : 277,
                                //     HHWORK1:hhwork1V > 0 ? hhwork1V : 280,
                                //     HHWORK2:hhwork2V > 0 ? hhwork2V : 231,	
                                //     HHWORK3:hhwork3V > 0 ? hhwork3V : 12,	
                                //     // SF:,	
                                //     // DUP:,	
                                //     // MF:,	
                                //     // MH:,	
                                //     TRACTGEOID:key,	
                                //     HHBASE:hhbaseV > 0 ? hhbaseV : 800,	
                                //     POPBASE:popbaseV > 0 ? popbaseV : 2035,
                                //     PUMA:TractsPuma[key],
                                //     REGION:1,	
                                //    // TAZ:""   //need bg?   BG:bg.slice(-7),//last 5 digits of bg

                                STATEFIPS:key.slice(0, 2),	
                                COUNTY:key.slice(2, 5),	
                                TRACT:key.slice(5, 11),
                            
                                HHSIZE1:hhsize1V > 0 ? hhsize1V : 0,	
                                HHSIZE2:hhsize2V > 0 ? hhsize2V : 0,
                                HHSIZE3:hhsize3V > 0 ? hhsize3V : 0,
                                HHSIZE4:hhsize4V> 0 ? hhsize4V : 0,

                                //HHAGE0:values[0].S0101_C01_002E,
                                HHAGE1:hhage1V > 0 ? hhage1V : 0,
                                HHAGE2:hhage2V > 0 ? hhage2V : 0,	
                                HHAGE3:hhage3V > 0 ? hhage3V : 0,
                                HHAGE4:hhage4V > 0 ? hhage4V : 0,
                             
                                HHWORK0:hhwork0V > 0 ? hhwork0V : 0,
                                HHWORK1:hhwork1V > 0 ? hhwork1V : 0,
                                HHWORK2:hhwork2V > 0 ? hhwork2V : 0,	
                                HHWORK3:hhwork3V > 0 ? hhwork3V : 0,	
                                // SF:,	
                                // DUP:,	
                                // MF:,	
                                // MH:,	
                                POCCP1:poccp1V > 0 ? poccp1V : 0,
                                POCCP2:poccp2V > 0 ? poccp2V : 0,
                                POCCP3:poccp3V > 0 ? poccp3V : 0,
                                POCCP4:poccp4V > 0 ? poccp4V : 0,
                                POCCP5:poccp5V > 0 ? poccp5V : 0,

                                TRACTGEOID:key,	
                                HHBASE:hhbaseV > 0 ? hhbaseV : 0,	
                                POPBASE:popbaseV > 0 ? popbaseV : 0,
                                PUMA:TractsPuma[key],
                                REGION:1,	
                               // TAZ:""   //need bg?   BG:bg.slice(-7),//last 5 digits of bg
                                


                            //    STATEFIPS:key.slice(0, 2),	
                            //    COUNTY:key.slice(2, 5),	
                            //    TRACT:key.slice(5, 11),
                           
                            //    HHSIZE1:hhsize1V ,	
                            //    HHSIZE2:hhsize2V ,
                            //    HHSIZE3:hhsize3V ,
                            //    HHSIZE4:hhsize4V,

                            //    //HHAGE0:values[0].S0101_C01_002E,
                            //    HHAGE1:hhage1V,
                            //    HHAGE2:hhage2V,	
                            //    HHAGE3:hhage3V ,
                            //    HHAGE4:hhage4V,
                            
                            //    HHWORK0:hhwork0V ,
                            //    HHWORK1:hhwork1V ,
                            //    HHWORK2:hhwork2V ,	
                            //    HHWORK3:hhwork3V ,	
                            //    // SF:,	
                            //    // DUP:,	
                            //    // MF:,	
                            //    // MH:,	
                            //    POCCP1:poccp1V,
                            //    POCCP2:poccp2V,
                            //    POCCP3:poccp3V ,
                            //    POCCP4:poccp4V ,
                            //    POCCP5:poccp5V,

                            //    TRACTGEOID:key,	
                            //    HHBASE:hhbaseV ,	
                            //    POPBASE:popbaseV ,
                            //    PUMA:TractsPuma[key],
                            //    REGION:1,	
                            //   // TAZ:""   //need bg?   BG:bg.slice(-7),//last 5 digits of bg

                                }

                 })
           
                   
            })
                
            
            let BgData = Object.values(output).map(d=>{
                    let keys= Object.keys(d)
               
                return keys.filter(key=>key.length===12).map((key, i) =>{

                    // let matchingPuma = Object.entries(BgsPuma)
                    //                          .filter(d=> d[0]===key)
                    //                          .map(d=>d[1])
                    //                          .toString()

                    //  console.log('PumaIdForBG', matchingPuma)
                  
                     let values = Object.values(d[key])

                     let hhinc1V = values[0].B19001_002E + values[0].B19001_003E+values[0].B19001_004E+values[0].B19001_005E
                     let hhinc2V = values[0].B19001_006E + values[0].B19001_007E+values[0].B19001_008E+values[0].B19001_009E+values[0].B19001_010E
                     let hhinc3V = values[0].B19001_011E+values[0].B19001_012E+values[0].B19001_013E
                     let hhinc4V = values[0].B19001_014E+values[0].B19001_015E
                     let hhinc5V = values[0].B19001_016E
                     let hhinc6V = values[0].B19001_017E
                     let hhbaseV = values[0].B25001_001E
                     let popbaseV = values[0].B01003_001E

                     //  console.log ('BG keys and values', key, values )
                                return{
                               
                   
                                    // BG:key.slice(-7),   //.slice(5, 12)
                                    // BGGEOID:key,

                                    // HHINC1:hhinc1V > 0 ? hhinc1V : 0,
                                    // HHINC2:hhinc2V > 0 ? hhinc2V : 41,
                                    // HHINC3:hhinc3V > 0 ? hhinc3V : 125,
                                    // HHINC4:hhinc4V > 0 ? hhinc4V : 86,
                                    // HHINC5:hhinc5V > 0 ? hhinc5V : 54,
                                    // HHINC6:hhinc6V > 0 ? hhinc6V : 11,

                                    // HHBASE:hhbaseV > 0 ? hhbaseV : 719,	
                                    // POPBASE:popbaseV > 0 ? popbaseV : 336,	

                                    // STATEFP:key.slice(0, 2),	
                                    // COUNTYFP:key.slice(2, 5),	
                                    // TRACT:key.slice(5, 11),
                                    // TRACTGEOID:key.slice(0, 11),
                                    // PUMA:BgsPuma[key],
                                    // REGION:1,	
                                    // MAZ:i+1,
                                    // xTAZ:key.slice(5, 11)


                                    BG:key.slice(-7),   //.slice(5, 12)
                                    BGGEOID:key,

                                    HHINC1:hhinc1V > 0 ? hhinc1V : 0,
                                    HHINC2:hhinc2V > 0 ? hhinc2V : 0,
                                    HHINC3:hhinc3V > 0 ? hhinc3V : 0,
                                    HHINC4:hhinc4V > 0 ? hhinc4V : 0,
                                    HHINC5:hhinc5V > 0 ? hhinc5V : 0,
                                    HHINC6:hhinc6V > 0 ? hhinc6V : 0,

                                    HHBASE:hhbaseV > 0 ? hhbaseV : 0,	
                                    POPBASE:popbaseV > 0 ? popbaseV : 0,	

                                    STATEFP:key.slice(0, 2),	
                                    COUNTYFP:key.slice(2, 5),	
                                    TRACT:key.slice(5, 11),
                                    TRACTGEOID:key.slice(0, 11),
                                    PUMA:BgsPuma[key],
                                    REGION:1,	
                                    MAZ:i+1,
                                    xTAZ:key.slice(5, 11)


                                    // BG:key.slice(-7),   //.slice(5, 12)
                                    // BGGEOID:key,

                                    // HHINC1:hhinc1V,
                                    // HHINC2:hhinc2V,
                                    // HHINC3:hhinc3V,
                                    // HHINC4:hhinc4V,
                                    // HHINC5:hhinc5V,
                                    // HHINC6:hhinc6V,

                                    // HHBASE:hhbaseV,	
                                    // POPBASE:popbaseV,	

                                    // STATEFP:key.slice(0, 2),	
                                    // COUNTYFP:key.slice(2, 5),	
                                    // TRACT:key.slice(5, 11),
                                    // TRACTGEOID:key.slice(0, 11),
                                    // PUMA:BgsPuma[key],
                                    // REGION:1,	
                                    // MAZ:i+1,
                                    // xTAZ:key.slice(5, 11)
                                  
                                }

                  
                })
            
            })
            
            console.log("Control_data--", BgData,tractData )

            return { control_tracts:tractData[0], control_bgs:BgData[0]}
        })
       
    }


       

    return (
        <div className="w-48 bg-gray-600 text-white">
        <div>
            numPuma: {layer.state.selectedPumas ? layer.state.selectedPumas.length : 0}
        </div>
        <div>
            numBG: {layer.state.selectedBlockGroups ? layer.state.selectedBlockGroups.length: 0}
        </div>
        <h4>{process}</h4>
        <button 
             onClick={startProcess} 
            className={'hover:bg-gray-700 bg-gray-400 text-white cursor-pointer p-2'}>
                Generate Data
        </button>
        </div>
    )
}

export default DataGenerator