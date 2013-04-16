mongoosewhen
============

Add jquery style .when support to mongoose promise object.

Use exactly like jquery.when on which this code is based. http://api.jquery.com/jQuery.when/

Promise.when() returns a Mongoose promise object.

```javascript
var mongoose = require('mongoose');
var Promise = mongoose.Promise;

var p1 = Users.find();
var p2 = Animals.find();
Promise.when(p1, p2).addBack(function(err, users, animals) {
  //etc
});
```