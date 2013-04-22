var assert = require('assert');
var mongoose = require('mongoose');
var when = require('../');
var Promise = mongoose.Promise;

describe('mongoose-when', function(){
  it('is a function', function(done){
    assert.equal('function', typeof Promise.when);
    done();
  });

  it('has a version', function(done){
    assert.equal('string', typeof Promise.when.version);
    assert.equal('string', typeof when.version);
    done();
  });
});

describe('Promise.when', function(){
  var result_a = 'abc123';
  var result_b = 'xyz456';
  it('returns from a single promise', function(done){
    var p = new Promise();
    var whenPromise = Promise.when(p).addBack(function(err, result){
      assert.ifError(err);
      assert.equal(result_a, result);
      done();
    });
    assert.equal(p, whenPromise);
    p.fulfill(result_a);
  });

  it('returns from a two promises', function(done){
    var p = new Promise();
    var p2 = new Promise();

    var whenPromise = Promise.when(p, p2).addBack(function(err, result, result2){
      assert.ifError(err);
      assert.equal(result_a, result);
      assert.equal(result_b, result2);
      done();
    });
    assert.notEqual(p, whenPromise);
    assert.notEqual(p2, whenPromise);

    p.fulfill(result_a);
    p2.fulfill(result_b);

  });

  it('rejects when one of the promises rejects', function(done){
    var p = new Promise();
    var p2 = new Promise();

    Promise.when(p, p2).addBack(function(err, result, result2){
      assert.equal(result_b, err);
      assert.equal(null, result);
      assert.equal(null, result2);
      done();
    });

    p.fulfill(result_a);
    p2.reject(result_b);
  });

  it('puts multiple argument resolves into an array', function(done){
    var p = new Promise();
    var p2 = new Promise();

    Promise.when(p, p2).addBack(function(err, result, result2){
      assert.ifError(err);
      assert.equal(result_a, result);
      assert.ok(Array.isArray(result2));
      assert.equal(result_a, result2[0]);
      assert.equal(result_b, result2[1]);
      done();
    });

    p.fulfill(result_a);
    p2.fulfill(result_a, result_b);
  });
});

describe('Promise.when database tests', function(){
  var conn;
  before(function(){
    conn = mongoose.connect('localhost', 'mongoose_when_unit_tests');
  });

  after(function(){
    conn.connection.db.dropDatabase();
    conn.connection.close();
  });

  it('works when pulling items from a db', function(done){

    var Schema = mongoose.Schema;
    var CarSchema = Schema({
      model: String,
      wheels: Number
    });

    var BoatSchema = Schema({
      model: String,
      hulls: Number
    });


    var CarModel = mongoose.model('car', CarSchema);
    var BoatModel = mongoose.model('boat', BoatSchema);

    var c1 = new CarModel({model:'focus', wheels: 4});
    c1.save(function(err, c){
      if(err){
        return done(err);
      }
      var b1 = new BoatModel({model:'bayliner', hulls: 1});
      b1.save(function(err, b){
        if(err){
          return done(err);
        }
        var p1 = CarModel.find().exec();
        var p2 = BoatModel.find().exec();
        Promise.when(p1, p2).addBack(function(err, cars, boats){
          assert.ifError(err);
          assert.ok(Array.isArray(cars));
          assert.ok(Array.isArray(boats));
          assert.equal(c1._id.toString(), cars[0]._id.toString());
          assert.equal(b1._id.toString(), boats[0]._id.toString());
          done();
        });
      });
    });
  });
});