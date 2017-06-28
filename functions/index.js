/* jshint node: true */ // exports
"use strict"; // declarations

var functions = require('firebase-functions');
// CORS Express middleware to enable CORS Requests.
var cors = require('cors')({
  origin: true,
  method: ['PUT', 'POST', 'DELETE']
});

var admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

var _paths = (function(){
  var types = ['partners', 'blogs'];

  return function(type, author, key, action){
    type = types[type];

    return {
      key: key,
      content: '/' + type + '/' + key,
      menu: '/menu/' + type + '/' + key,
      userEntry: '/users/' + author + '/entries/' + key,
      images: '/images/',
      imagesOrder: 'parent',
      imageEqual: key,
      message: 'The ' + type.slice(0, -1) + ': ' + key + ', was ' + action + ' successfully.'
    }
  };
})();

exports.deleteContent = functions.https.onRequest(function(req, res){
  cors(req, res, function(){
    var content = req.body; // Getting the content, expecting object application/json

    if (content) {
      var paths = _paths(content.type, content.author, content.$key, 'removed');

      if (req.method === 'POST') {
        admin.database().ref(paths.content).remove().then(function(){
          admin.database().ref(paths.menu).remove().then(function(){
            admin.database().ref(paths.userEntry).remove().then(function(){
              admin.database().ref(paths.images).orderByChild(paths.imagesOrder).equalTo(paths.imageEqual).once('value', function(snapshot){
                var images = snapshot.val();
                for (var picture in images) {
                  if (images.hasOwnProperty(picture)) {
                    admin.database().ref(paths.images + picture).remove();
                  }
                }
                res.status(200).send({
                  deleteContent: {
                    message: paths.message,
                    "result": true
                  }
                });
                console.log(paths.message);
              });
            });
          });
        });
      } else {
        res.status(400).send({
          deleteContent: {
            message: "Unsupported METHOD",
            data: content,
            result: false
          }
        });
      }
    } else {
      res.status(303).send({
        deleteContent: {
          message: "No content given, DEV! Check your params",
          data: content,
          result: false
        }
      });
    }
  });
});

exports.upsertContent = functions.https.onRequest(function(req, res){
  cors(req, res, function(){
    var content = req.body; // Getting the content, expecting object application/json

    if (content) {
      if (req.method === 'POST' || req.method === 'PUT') {
        var images = [];
        var paths = _paths(content.type, content.author, content.$key, 'saved');
        var userEntriesObject = {
          published: content.published,
          title: content.title,
          type: content.type
        };

        // Update or insert
        content.images.forEach(function(image){
          if (image.$key) {
            var path = paths.images + image.$key;
            images.push(image.$key);
            delete image.$key;
            admin.database().ref(path).set(image);
          }
          else {
            images.push(admin.database().ref(paths.images).push(image).key);
          }
        });

        admin.database().ref(paths.images).orderByChild(paths.imagesOrder).equalTo(paths.imageEqual).once('value', function(snapshot){
          var userImages = snapshot.val();
          for (var image in userImages) {
            if (userImages.hasOwnProperty(image)) {
              if (images.indexOf(image) === -1) {
                admin.database().ref(paths.images + image).remove();
              }
            }
          }
        });

        delete content.$key;
        delete content.images;

        admin.database().ref(paths.content).set(content).then(function(){
          admin.database().ref(paths.userEntry).set(userEntriesObject).then(function(){
            if (content.published) {
              admin.database().ref(paths.menu).set({
                title: content.title
              });
            }
            else {
              admin.database().ref(paths.menu).remove();
            }

            res.status(200).send({
              addContent: {
                message: paths.message,
                result: true
              }
            });
            console.log(paths.message);
          });
        });
      }
    }
    else {
      var response = {};
      response[req.method === 'POST' ? 'addContent' : 'editContent'] = {
        data: content,
        message: "No content given, DEV! Check your params",
        result: false
      };
      res.status(303).send(response);
    }
  });
});