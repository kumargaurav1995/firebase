import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const onDelhiWeatherUpdate =
//  functions.firestore.document('cities-weather/delhi-india').onUpdate(change => {
//     const after = change.after.data()
//         const payload = {
//         data: {
//             temp: String(after.temp),
//             conditions: after.conditions
//         }
//     }
// return admin.messaging().sendToTopic('weather_delhi-india',payload)
// })

// export const getIndianCitiesWeather =
// functions.https.onRequest((request,response) => {
//     admin.firestore().doc('areas/india').get()
//     .then(areaSnapshot => {
//         const cities = areaSnapshot.data()
//         const promises = []
//         for (const city in cities){
//           const p = admin.firestore().doc(`cities-weather/${city}`).get()
//           promises.push(p)
//         }
//         return Promise.all(promises)

//     })
//     .then(citySnapshots => {
//         const results = []
//         citySnapshots.forEach(citySnap =>{
//             const data = citySnap.data()
//             results.push(data)
//         })
    
//         response.send("hello")
//     })
//     .catch(error =>{
//         console.log(error)
//         response.status(500).send(error)
//     })
// }) 

export const helloWorld = functions.https.onRequest((request, response) =>{
    response.send("Hello from Firebase!")
});

export const getDelhiWeather = functions.https.onRequest((request, response) => {
 admin.firestore().doc('cities-weather/delhi-india').get()
 .then(snapshot => {
     const data = snapshot.data();
     response.send(data)
 }).catch( error => {
     console.log(error)
     response.status(500).send(error)
 })
    
});


export const getIndianCitiesWeather =
functions.https.onRequest((request,response) => {
    admin.firestore().doc('areas/india').get()
    .then(areaSnapshot => {
    
        const promises = []
        
          const p = admin.firestore().doc('cities-weather/mumbai-india').get()
          promises.push(p)
        
        return Promise.all(promises)

    })
    .then(citySnapshots => {
        const results = []
        citySnapshots.forEach(citySnap =>{
            const data = citySnap.data()
            results.push(data)
        })
    
        response.send("hello")
    })
    .catch(error =>{
        console.log(error)
        response.status(500).send(error)
    })
}) 
