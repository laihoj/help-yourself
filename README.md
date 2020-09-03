# help-yourself
time management and priorisation

Data structure:

  All data have CRUD API:
    Create    (save)    <- pass appropriate params
    Retrieve  (get)     <- by any property (i.e. ID)
    Destroy   (delete)  <- objects have delete method - can also delete by ID
    Update    (update)  <- objects have update method - can also update by ID
    
  Model:
    User: has password, username - Everything else belongs to a user
  
    Item: data { user, label, priority, }
          computed { totalMinutes, totalRelevancy, cumulativeMinutes }
    Effort: data { user, hours, minutes, timestamp, note }
    Relevancy: data { user, value }
  
    Relations:
      Effort<->Item <- belongs to
      Item<->Item <- child
      Relevancy<->Item <- belongs to
    
db/relations.js abstracts relations, and provides methods to GET all things that relate to some data

db.js abstracts data/app logic, try to use these high level methods in app.js

app.js handles routes, and retrieves, builds, and provides the data needed by each view, responds to requests with renders

utils2.js (and utils.js) computes properties and constructs app data representation for easier API
