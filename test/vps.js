var expect = require('chai').expect;
var stub = require('sinon').stub;
var VPS = require('../src/vps');

var ghost = null;
var vps = null;

var nock = require('nock');

/*
var createDroplet = nock('https://api.digitalocean.com')
.post('/v2/droplets')
.reply(201, {});

var getKeys = nock('https://api.digitalocean.com')
.get('/v2/account/keys')
.reply(200, {});
*/
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
  it("sends the correct payload to digitalocean", function() {
    
  });
});

describe("VPS::createFromScratch", function() {
  it("sends the correct payload to digitalocean", function() {
    
  });
});
