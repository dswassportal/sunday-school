const processRequest = require(`${__dirname}/src/app/node/reqOperations`);
const processUserRequest = require(`${__dirname}/src/app/node/userReqOperations`)
const processMiscRequest = require(`${__dirname}/src/app/node/miscReqOperations`)
const processEventTemp = require(`${__dirname}/src/app/node/reqEventTemp`)
const processEventRequest = require(`./src/app/node/eventReqOperations`)
const processScoreRequest = require(`./src/app/node/reqScoreOperations`)
const processAttendaceRequest = require(`./src/app/node/reqAttendanceOperartions`)
const processSSRequest = require(`./src/app/node/reqSsOperations`)
const processFileUpload = require(`./src/app/node/reqFileUpload`)
const processRegRequests = require(`${__dirname}/src/app/node/reqEveRegOperations`);
const studentSearch =  require(`./src/app/node/search/studentSearch`)

const fileUpload = require('express-fileupload');
express = require('express')
const cors = require('cors')
var app = express();
var compression = require('compression')
const path = require('path');
let port = 8081;

app.listen(process.env.PORT || port, () => {
  console.log(`Express server started at port number : ${port}`)
});

app.use(compression())

var corsOptions = {
  "origin": '*',
  "Access-Control-Allow-Origin": '*',
}

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  // server.close(() => {
  //   console.log('HTTP server closed')
  // })
})

app.use(express.json());
app.use('*', cors())

app.use(express.static(path.join(__dirname + "/dist/church")));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + "/dist/church/index.html"));
  //res.sendFile('./dist/church/index.html');
});

function getUserHome() {

  return process.env[(process.platform == 'win32')
    ? 'USERPROFILE' : 'HOME'];
}

app.use(fileUpload({
  useTempFiles: false,
  tempFileDir: getUserHome(),
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/dist/church/index.html'));
});

app.post('/api/uploadfile', (req, res) => {
console.log('/api/uploadfile called... for event : ' + req.query.eventId )
  try {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    processFileUpload.eventDocUpload(req.files, req.query.eventId).then((data) => {
      res.send(data)
      res.end();
    })
 
  } catch (error) {
    res.send(error)
    res.end();
  }

});






app.post('/api/signUp', function (req, res) {
  console.log("signUp called with : " + JSON.stringify(req.body));

  //console.log(`Header info : ${JSON.stringify(req.header('user-agent'))}`)
  try {
    processRequest.processSignInRequest(req.body)
      .then((data) => {
        // console.log(`Returning with resonse : ${data}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in signUp as : ' + error)
  }
});

app.get('/api/getuserRecords', function (req, res) {
  console.log("getuserRecords called with : " + req.query.type +
    ' loggedInUser : ' + req.query.loggedInUser +
    ' EventId : ' + req.query.eventId);

  try {
    let loggedInUser = decodeUser(req);
    processRequest.getuserRecords(req.query.type, loggedInUser, req.query.eventId)
      .then((data) => {
        // console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //  console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in signUp as : ' + error)
  }
});

app.get('/api/getRoleMetadata', function (req, res) {
  console.log("Role Metadata with : " + JSON.stringify(req.body));

  //console.log(`Header info : ${JSON.stringify(req.header('user-agent'))}`)
  try {
    processRequest.getRoleMetadata()
      .then((data) => {
        // console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in Role Metadata as : ' + error)
  }
});

app.get('/api/getUserMetaData', function (req, res) {
  console.log("getUserMetaData called with : " + JSON.stringify(req.query.uid));

  let reqContextData = {
    actType: 'LOG_IN',
    sessionId: req.header('Authorization'),
    ipAddr: req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.query.uid
  }
  processMiscRequest.handleLogIn_LogOut(reqContextData)
  try {
    processRequest.processGetUserMetaDataRequest(req.query.uid)
      .then((data) => {
        //  console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in signUp as : ' + error)
  }
});

app.get('/api/getEventCategory', function (req, res) {
  console.log("getEventCategory called with : " + JSON.stringify(req.query.fbuid));
  try {
    processRequest.getEventCategory()
      .then((data) => {
        //  console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getEventCategory as : ' + error)
  }
});


app.get('/api/getEventData', function (req, res) {
  console.log("getEventData called with : " + req.query.user);
  let loggedInUser = decodeUser(req)
  try { 
    processRequest.getEventData(loggedInUser, req.query.eventType)
      .then((data) => {
        //     console.log(`Returning with response : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //   console.log(`Returning with response : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.log(`Error in getEventData as : ` + error)
  }
});

app.get('/api/getParishData', function (req, res) {
  console.log("getParishData called with : " + JSON.stringify(req.query.fbuid));
  try {
    processRequest.getParishData()
      .then((data) => {
        // console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //  console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getParishData as : ' + error)
  }
});



app.post('/api/insertEvents', function (req, res) {
  console.log("insertevents called with : " + JSON.stringify(req.body));
  try {
    let loggedInUser = decodeUser(req)
    processEventRequest.insertEvents(req.body.data, loggedInUser)
      .then((data) => {
        // console.log(`Returning with resonse : ${data}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in insertevents as : ' + error)
  }
});



app.post('/api/updateUserRoles', function (req, res) {
  console.log("updateUserRoles called with : " + JSON.stringify(req.body));
  try {
    let loggedInUser = decodeUser(req);
    processRequest.processUpdateUserRoles(req.body.data, loggedInUser)
      .then((data) => {
        if (req.body.data.respondWith) {
          if (req.body.data.respondWith === `user_meta_data`) {
            processRequest.processGetUserMetaDataRequest(loggedInUser).then((metaData) => {
              data.data.metaData = metaData.data.metaData;
              res.send(data);
              res.end();
            })
          }
        } else {
          res.send(data);
          res.end();
        }
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in updateUserRoles as : ' + error)
  }
});

app.get('/api/getParishData', function (req, res) {
  console.log("getParishData called with : " + JSON.stringify(req.query.fbuid));
  try {
    processRequest.getParishData()
      .then((data) => {
        //  console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getParishData as : ' + error)
  }
});


//Endpoint to delete users
app.post('/api/deleteUsers', function (req, res) {
  console.log("deleteUsers called with : " + JSON.stringify(req.body));
  try {
    processRequest.deleteUsers(req.body.data)
      .then((data) => {
        // console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getParishData as : ' + error)
  }
});

//Endpoint to set user is_approved status 
app.post('/api/setUserApprovalState', function (req, res) {
  console.debug("setUserApprovalState called with : " + JSON.stringify(req.body));
  try {
    let loggedInUser = decodeUser(req);
    processUserRequest.setUserApprovalState(req.body.data, loggedInUser)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in setUserApprovalState as : ' + error)
  }
});

//Endpoint to set user is_approved status 
app.get('/api/getCountryStates', function (req, res) {
  console.log("getCountryStates called with : ");
  try {
    processMiscRequest.getCountryStates()
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getCountryStates as : ' + error)
  }
});

// firebaseAdminUtils.varifyUserToken(req.header('Authorization')).then(idToken => {});


app.post('/api/updateEvent', function (req, res) {
  console.log("updateEvent called with : " + JSON.stringify(req.body));
  try {
    processEventRequest.updateEvent(req.body.data)
      .then((data) => {
        // console.log(`Returning with resonse : ${data}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in updateEvent as : ' + error)
  }
});


app.post('/api/getProctorData', function (req, res) {
  console.log("getProctorData called with : " + JSON.stringify(req.query.fbuid));
  try {
    processEventRequest.getProctorData(req.body.data)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getProctorData as : ' + error)
  }
});

app.post('/api/getVenues', function (req, res) {
  console.log("getVenues called with : " + JSON.stringify(req.body.data));
  try {
    processEventRequest.getVenues(req.body.data)
      .then((data) => {
        // console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getVenues as : ' + error)
  }
});

app.get('/api/getRegionAndParish', function (req, res) {
  console.log("getRegionAndParish called with : " + JSON.stringify(req.query.fbuid));
  try {
    processEventRequest.getRegionAndParish()
      .then((data) => {
        // console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getRegionAndParish as : ' + error)
  }
});

app.get('/api/getEventType', function (req, res) {
  console.log("getEventType called with : " + JSON.stringify(req.query.fbuid));
  try {
    processEventRequest.getEventType()
      .then((data) => {
        // console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getEventType as : ' + error)
  }
});


app.get('/api/getMembers', function (req, res) {
  console.log("getMembers called with : " + JSON.stringify(req.query.fbuid));
  try {
    processMiscRequest.getMembers(req.query.fbuid)
      .then((data) => {
        // console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getMembers as : ' + error)
  }
});



app.get('/api/getEventQuestionnaireData', function (req, res) {
  console.log("getEventQuestionnaireData called with : ");
  try {
    processEventRequest.getEventQuestionnaireData()
      .then((data) => {
        //  console.log(`Returning with response : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with response : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.log(`Error in getEventQuestionnaireData as : ` + error)
  }
});


app.get('/api/getEventForRegistration', function (req, res) {
  console.log("getEventForRegistration called with ");
  let loggedInUser = decodeUser(req)
  try {
    processEventRequest.getEventForRegistration(loggedInUser)
      .then((data) => {
        // console.log(`Returning with response : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with response : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.log(`Error in getEventForRegistration as : ` + error)
  }
});


app.get('/api/getUserApprovalStatus', function (req, res) {
  console.log("getUserApprovalStatus called with : " + JSON.stringify(req.query.fbuid));
  try {
    processMiscRequest.getUserApprovalStatus(req.query.fbuid)
      .then((data) => {
        //   console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getMembers as : ' + error)
  }
});

app.post('/api/updateBasicProfile', function (req, res) {
  console.log("updateBasicProfile called...");
  try {
    processUserRequest.updateUnApprovedUser(req.body.data)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in updateBasicProfile as : ' + error)
  }
});


app.get('/api/logout', function (req, res) {
  console.log("logout called...");
  try {

    let reqContextData = {
      actType: 'LOG_OUT',
      sessionId: req.header('Authorization'),
      ipAddr: req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.query.user
    }
    processMiscRequest.handleLogIn_LogOut(reqContextData)
      .then((data) => {
        res.send(data);
        res.end();
      }).catch((error) => {
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in logout as : ' + error)
  }
});




app.get('/api/getEvent', function (req, res) {
  console.log("getEvent called...");
  let loggedInUser = decodeUser(req)
  try {
    processEventRequest.getEventById(req.query.id, req.query.isParticipant, loggedInUser)
      .then((data) => {
        res.send(data);
        res.end();
      }).catch((error) => {
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getEvent as : ' + error)
  }
});

app.post('/api/registerEvent', function (req, res) {
  console.log("registerEvent called...");
  let loggedInUser = decodeUser(req)
  try {
    processRegRequests.eventRegistration(req.body.data, loggedInUser)
      .then((data) => {
        res.send(data);
        res.end();
      }).catch((error) => {

        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in registerEvent as : ' + error)
  }
});

app.get('/api/getParticipants', function (req, res) {
  console.log("getParticipants called...");
  let loggedInUser = decodeUser(req)
  try {
    processEventTemp.getParticipant(req.query.event,
      loggedInUser,
      req.query.to,
      req.query.judge,
      req.query.category
    )
      .then((data) => {
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Error with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getParticipants as : ' + error)
  }
});

app.post('/api/postScore', function (req, res) {
  console.log("postScore called...");
  let loggedInUser = decodeUser(req)
  try {
    processScoreRequest.persistParticipantScore(req.body.data, loggedInUser)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in updateBasicProfile as : ' + error)
  }
});



app.get('/api/getEventCatsAndStaffById', function (req, res) {
  console.log("getEventCatsAndStaffById called... with  event ID:" + req.query.id);
  // let loggedInUser =  decodeUser(req)
  try {
    processEventTemp.getEventCatsAndStaffById(req.query.id)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getEventCatsAndStaffById as : ' + error)
  }
});

app.post('/api/deleteEvents', function (req, res) {
  console.log("deleteEvents called with : " + JSON.stringify(req.body));
  try {
    processEventRequest.deleteEvents(req.body.data)
      .then((data) => {
        //console.log(`Returning with resonse : ${data}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        // console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in deleteEvents as : ' + error)
  }
});


app.post('/api/postAttendance', function (req, res) {
  console.log("postAttendance called...");
  let loggedInUser = decodeUser(req)
  try {
    processAttendaceRequest.persistParticipantAttendance(req.body.data, loggedInUser)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in postAttendance as : ' + error)
  }
});

app.get('/api/getScoreByCategory', function (req, res) {
  console.log("getScoreByCategory called...");
  // let loggedInUser =  decodeUser(req)
  try {
    processScoreRequest.getScoreByCategory(req.query.eventId, req.query.catId)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getScoreByCategory as : ' + error)
  }
});

app.get('/api/getSSchools', function (req, res) {
  console.log("getSSchools called...");
  let loggedInUser = decodeUser(req)
  try {
    processSSRequest.getSSchoolData(loggedInUser, req.query.role)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getSSchools as : ' + error)
  }
});

app.get('/api/getLookupMasterData', function (req, res) {
  console.log("getLookupMasterData called... to fetch " + req.query.types);
  // let loggedInUser = decodeUser(req)
  try {
    processMiscRequest.getLookupMasterData(req.query.types)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getLookupMasterData as : ' + error)
  }
});

app.get('/api/getRolesByUserId', function (req, res) {
  console.log("getRolesByUserId called... to fetch " + req.query.userId);
  // let loggedInUser = decodeUser(req)
  try {
    processMiscRequest.getRolesByUserId(req.query.userId)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getRolesByUserId as : ' + error)
  }
});

app.post('/api/setStaffAssignment', function (req, res) {
  console.log("setStaffAssignment called...");
  let loggedInUser = decodeUser(req)
  try {
    processUserRequest.setStaffAssignment(req.body.data, loggedInUser)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in setStaffAssignment as : ' + error)
  }
});

app.get('/api/getRegionWiseJudges', function (req, res) {
  console.log("getRegionWiseJudges called... to fetch " + req.query.regionId);
  // let loggedInUser = decodeUser(req)
  try {
    processEventRequest.getRegionWiseJudges('', req.query.regionId)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getRegionWiseJudges as : ' + error)
  }
});

app.get('/api/getStaffAssmtBySchool', function (req, res) {
  console.log("getStaffAssmtBySchool called... to fetch " + req.query.schoolId);
  //let loggedInUser = decodeUser(req)
  try {
    processSSRequest.getStaffAssmtBySchool(req.query.schoolId,req.query.term, '')
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getStaffAssmtBySchool as : ' + error)
  }
});

app.get('/api/getEventDef', function (req, res) {
  console.log("getEventDef called... ");
  let loggedInUser = decodeUser(req)
  try {
    processRegRequests.getEventDef(req.query.eventId, loggedInUser, req.query.participantId, req.query.regMethod)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getEventDef as : ' + error)
  }
});

app.get('/api/getAssignedGrades', function (req, res) {
  console.log("getAssignedGrades called... ");
  let loggedInUser = decodeUser(req)
  try {
    processSSRequest.getAssignedGrades(loggedInUser)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getAssignedGrades as : ' + error)
  }
});


app.get('/api/getGradeAttendance', function (req, res) {
  console.log("getGradeAttendance called... ");
  let loggedInUser = decodeUser(req)
  try {
    processSSRequest.getGradeAttendance(loggedInUser, req.query.schoolId, req.query.grade, req.query.date)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getGradeAttendance as : ' + error)
  }
});


app.post('/api/postSSAttendance', function (req, res) {
  console.log("postAttendance called... ");
  let loggedInUser = decodeUser(req)
  try {
    processSSRequest.postSSAttendance(req.body.data, loggedInUser)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in postSSAttendance as : ' + error)
  }
});

app.post('/api/searchStudents', function (req, res) {
  console.log("searchStudents called... ");
  let loggedInUser = decodeUser(req)
  try {
    studentSearch.searchStudents(req.body.data, loggedInUser)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in searchStudents as : ' + error)
  }
});


app.get('/api/getSearchables', function (req, res) {
  console.log("getSearchables called... ");
  let loggedInUser = decodeUser(req)
  try {
    studentSearch.getSearchables(loggedInUser)
      .then((data) => {
        //console.log(`Returning with resonse : ${JSON.stringify(data)}`)
        res.send(data);
        res.end();
      }).catch((error) => {
        //console.log(`Returning with resonse : ${error}`)
        res.send(error);
        res.end();
      })
  } catch (error) {
    console.error('Error in getSearchables as : ' + error)
  }
});

//to decode loggedin user Id from the request context.
function decodeUser(reqContext) {
  let userId = reqContext.header('User').toString();
  let bufferObj = Buffer.from(userId, "base64");
  return bufferObj.toString("utf8");
}
