var expect = require('chai').expect;
var Ghosts = require('../src/ghosts');
var Promise = require('bluebird');
var stub = require('sinon').stub;
var VPS = require('../src/vps');
var netMock = require('./netmock');

var ghost = null;
var vps = null;

beforeEach(function() {
  ghost = {};
  vps = new VPS(ghost);
});

describe("VPS::create", function() {
  beforeEach(function() {
    ghost.snapshotId = null;
    stub(vps, 'createFromSnapshot');
    stub(vps, 'createFromScratch');
  });
  afterEach(function() {
    vps.createFromSnapshot.restore();
    vps.createFromScratch.restore();
  });
  it("calls createFromSnapshot when there is a snapshotId", function() {
    ghost.snapshotId = 1
    vps.create();
    expect(vps.createFromSnapshot.callCount).to.eq(1);
    expect(vps.createFromScratch.callCount).to.eq(0);
  });
  it("calls createFromScratch when there is no snapshotId", function() {
    vps.create();
    expect(vps.createFromSnapshot.callCount).to.eq(0);
    expect(vps.createFromScratch.callCount).to.eq(1);
  });
});


describe("VPS::createFromSnapshot", function() {
  it("sends the correct payload to digitalocean", function(done) {
    done();
  });
});

var backoff = require('../src/backoff');
backoff.defaults.initialDelay = 1;

describe("VPS::createFromScratch", function() {
  var apiCalls = null;
  beforeEach(function() {
    apiCalls = netMock.DigitalOcean.Create();
    stub(Ghosts, 'updateDroplet', function(ghost, droplet) {
      return new Promise(function(resolve, reject) {
        ghost.droplet = droplet
        resolve(ghost);
      });
    });
    stub(Ghosts, 'updateIpAddress', function(ghost, addr) {
      return new Promise(function(resolve, reject) {
        ghost.ipAddress = addr
        resolve(ghost);
      });
    });
  });
  afterEach(function() {
    Ghosts.updateDroplet.restore();
    Ghosts.updateIpAddress.restore();
  });
  it("starts an ubuntu machine in san francisco", function(done) {
    vps.createFromSnapshot().then(function() {
      expect(ghost.droplet).to.be.ok;
      expect(ghost.ipAddress).to.eq('1.2.3.4');
      apiCalls.getKeys.done();
      apiCalls.addKey.done();
      apiCalls.getSizes.done();
      apiCalls.createDroplet.done();
      apiCalls.getDroplet.done();
      done();
    }, done);
  });
});
