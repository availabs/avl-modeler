import React, { useState, useEffect } from 'react';
import { useFalcor } from '@availabs/avl-components';

const SyntheticTable = ({ layer }) => {


    const {falcor, falcoCache} = useFalcor()

    const [stateHH, setHH] = useState(0);  // hook!!
    const [statePersons, setPersons] = useState(0); 


    const startProcess = async () => {
      
        let BgData = await generateBgs() // because fetch--promise 

        console.log('getting data----',  BgData)

        setHH(BgData.totalHH)
        setPersons(BgData.totalPop)

    }
   

    // console.log('layer', layer)
    let synHouseholds = layer.households
    let synPersons = layer.persons


    let householdsBgs = synHouseholds.reduce((acc,obj)=>{
        acc[obj.household_id]=obj.BG;
        return acc;
    }, {}
    );
    let householdsIncome = synHouseholds.reduce((acc,obj)=>{
        acc[obj.household_id]=obj.HINCP;
        return acc;
    }, {}
    );

    let Bgs = Object.values(householdsBgs)
    let uniqueBgs = [...new Set(Bgs)];
  
   
    // console.log('householdsBgs---',householdsBgs, householdsIncome,  uniqueBgs, synHouseholds )


    const generateBgs = () => {
        const bg_cenvars = {
            'p_total' : 'B01003_001E', 
            'hh_total' : 'B25001_001E', 
        }

        console.time('call acs')
        return falcor.chunk(['acs',[...Bgs],[2019],[...Object.values(bg_cenvars)]],{chunkSize: 200})
        .then(d => {
             console.timeEnd('call acs')

             return falcor.getCache()
              })
        .then (output=> {
                console.log('ACS---', output)
   

         let BgData = Object.values(output).map(d=>{
                        let keys= Object.keys(d)
                
                            return keys.map((key, i) =>{

                                let values = Object.values(d[key])
                                    let popbaseV = values[0].B01003_001E
                                    let hhbaseV  = values[0].B25001_001E

                                            return{
                                    
                                         
                                                POPBASE:popbaseV > 0 ? popbaseV : 0,
                                                HHBASE:hhbaseV > 0 ? hhbaseV : 0,		

                                                // STATEFP:key.slice(0, 2),	
                                                // COUNTYFP:key.slice(2, 5),	
                                                // TRACT:key.slice(5, 11),
                                                // TRACTGEOID:key.slice(0, 11),
                                                // // PUMA:BgsPuma[key],
                                                // REGION:1,	
                                                // MAZ:i+1,
                                                // xTAZ:key.slice(5, 11)
                                            
                                            }

                            
                            })
                
                })
           console.log("BG_data--", ...BgData)
           
           return BgData[0]
        })
        .then(data => {
            console.log('data', data )
             let popBaseSum = data.reduce((a, c) => +a + +c.POPBASE, 0)
             let hhBaseSum = data.reduce((a, c) => +a + +c.HHBASE, 0)
       
             console.log("Sum-", popBaseSum, hhBaseSum) //Sum-  3135392 1385239
             return { totalPop: popBaseSum, totalHH: hhBaseSum}
           })

        
    }

// const getData = async () => {
//         const response = await generateBgs();
//         console.log("response-", response);
//        return response
// }

// let ACSData = await getData();

//   console.log("getData-", ACSData.totalPop)



    return (
        <div className="w-45 bg-gray-600 text-white">
            <div>
                # of Households: {synHouseholds.length}
            </div>
            <div>
                # of Persons: {synPersons.length}
            </div>
            <div>
                # of BlockGroups: {uniqueBgs.length}
            </div>
            <button 
             onClick={startProcess} 
             className={'hover:bg-gray-700 bg-gray-400 text-white cursor-pointer p-2'}>
                Calculate HH and Pop values from ACS BGs
            </button>
            <div>
               Total Households: {stateHH}
            </div>
            <div>
               Total Population: {statePersons}
            </div>
        </div>
    )
}

export default SyntheticTable