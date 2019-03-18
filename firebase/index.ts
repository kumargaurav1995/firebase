import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const serviceAccount = require('./ServiceAccountKey.json')
//const gcs = require('@google-cloud/storage')();
const os = require('os');
//const spawn = require('child-process-promise').spawn;
const fs = require('fs');
const cors = require('cors')({origin: true});
const Busboy = require('busboy');
const nodemailer = require('nodemailer');
const path = require('path');
const mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure:true,
    auth:{
    user: 'kumar.gaurav@wetech.digital',
    pass: 'KsKg1009@'
    }
})

admin.initializeApp({
    credential : admin.credential.cert(serviceAccount),
    databaseURL: 'https://namaste-translator-01.firebaseio.com/'
   
});

// export const onDelhiWeatherUpdate =
//  functions.firestore.document('cities-weather/delhi-india').onUpdate(change => {
//    const before = change.before
//     const after = change.after.data()
//         const payload = {
//         data: {
//             temp: String(after.temp),
//             conditions: after.conditions
//         }
//     }
// return admin.messaging().sendToTopic('weather_delhi-india',payload)
// })

export const onMessageCreate = functions.database.ref('/messages/')
.onCreate((snapshot, context) =>{
    const messageData = snapshot.val()
    const text = addAttribute(messageData.text)
   return snapshot.ref.update({text: text})
})

function addAttribute (text: string): string {
    return text.replace(/\bDelhi\b/g,'Mumbai')
}

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

export const getIndianCitiesSeason =
functions.https.onRequest((request,response) => {
   // const obj = JSON.parse(request.body)
    const seasonData = {
        city: "Delhi",
        season: "monsoon"
    }
   const promise = admin.firestore().collection('seasons').doc('indian').set(seasonData)
    .then(() =>{
        console.log('new season data has been added');
        response.status(200).send(seasonData);
    })
    promise.catch(error => {
        console.log(error)
        response.status(500).send(error)
    })
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

export const insertIntoDB = functions.https.onRequest((req,res) =>{
    const text = req.query.text;
    admin.database().ref('/test').push({text: text}).then(snapshot =>{
        res.redirect(303,snapshot.ref);
    })
})

export const convertToUppercase = functions.database.ref('/test/{pushId}/text').onWrite( (event,context)=> {
    const text = event.after.val()
  const uppercaseText = text.toUpperCase();
    return text.ref.parent.child('copiedData').set(uppercaseText);
    });
   
export const onDataAdded = functions.database.ref('/message/{id}').onCreate((event,context) => {
const data = event.val()
const newData = {
    msg:  data.msg.toUpperCase()
};
return data.ref.child('copiedData').set(newData);
});

export const weeklyEmail = functions.https.onRequest((request, response) => {
    if(request.method !== 'GET'){
    const currentTime = new Date().getTime()
    const lastweek = currentTime - 604800000
    admin.database().ref('namaste-translator-01').orderByChild('signupDate')
    .startAt(lastweek).once('value').then(snap =>{
     snap.forEach(childSnap =>{
         const email = childSnap.val().email
        return email

     })
    }).then(emails=> {
        console.log('Sending to the given email' + emails )
        const mailOptions = {
            from: '<gauravrockindia@gmail.com>',
            bcc: emails,
            subject:'This is firebase demo email',
            text:'Please ignore'
        }
        return mailTransport.send(mailOptions).then(()=>{
            response.send('Email sent')
        })
    }) .catch(error =>{
        console.log(error)
        response.status(500).send(error)
    })
}
});


export const uploadFile = functions.https.onRequest((request, response) => {

    cors(request, response, () =>{
        if(request.method !== 'POST'){
            
            response.status(500).json({
                message: 'Not allowed'
            });
        }
        
         const busboy = new Busboy({headers: request.headers});
         let uploadData = null;
           busboy.on('file', (fieldName, file, filename, encoding, mimetype) => {
 const filepath = path.join(os.tempdir(), filename);
 uploadData = {file: filepath, type: mimetype};
 file.pipe(fs.createWriteStream(filepath));
          });
         busboy.on('finish',() =>{
             uploadData.file
             
            //  const bucket = gcs.bucket('namaste-translator-01.appspot.com')
            // bucket.upload(uploadData.file, {
            //      uploadType: 'media',
            //      metadata: {
            //          metadata: {
            //              contentType: uploadData.type
            //          }
            //      }
            //  })

         })
         .then(() => {
            response.status(200).json({
                message: 'It worked!'
            });
         })
       .catch(err =>{
        response.status(500).json({
            error: err
        });
    })
     });
    })

export const onFileChange = functions.storage.object().onFinalize((object) =>{
    //const bucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
   //const contentType = object.contentType; // File content type.
  //  const metageneration = object.metageneration; // Number of times metadata
    console.log('File change detected');
  
  // Get the file name.
  const fileName = path.basename(filePath);
  // Exit if the image is already a thumbnail.
  if (fileName.startsWith('thumb_')) {
    console.log('Already a Thumbnail.');
    return null;
  }

  //Check if the file name is changed
  if(path.basename(filePath).startsWith('resized-')){
      console.log('already renamed');
      return;
  }

  // Download file from bucket.
//   const destBucket = gcs.bucket(bucket);
//   const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
//   const metadata = { contentType: contentType };
// return destBucket.file(filePath).download({
//   destination: tempFilePath,
// })
// .then(() => {

//   console.log('Image downloaded locally to', tempFilePath);
// return destBucket.upload(tempFilePath, {
//     destination: 'renamed-' + path.basename(filePath),
//     metadata: metadata
// }) 
// }).then(() => {
//      // Generate a thumbnail using ImageMagick.
//   return spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
// }).then(() => {

//     console.log('Image downloaded locally to', tempFilePath);
//   return destBucket.upload(tempFilePath, {
//       destination: 'resized-' + path.basename(filePath),
//       metadata: metadata
//   }) 
//     // Once the thumbnail has been uploaded delete the local file to free up disk space.
//   .then(() => fs.unlinkSync(tempFilePath));


// })
// })




})

