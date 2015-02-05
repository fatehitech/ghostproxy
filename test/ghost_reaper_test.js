var expect = require('chai').expect;
var GhostReaper = require('../src/ghost_reaper');

var ghost = null;
var reaper = null;

beforeEach(function() {
  ghost = {};
  reaper = new GhostReaper(ghost);
});

describe("GhostReaper::reap", function() {
  beforeEach(function() {
    reaper.reap();
  });
  it("locks the machine", function() {
    
  });
  it("turns off the machine", function() {

  });
  it("snapshots the machine on digitalocean", function() {
    
  })
  it("deletes the previous snapshot from digitalocean", function() {
    
  });
  it("replaces the previous snapshot id", function() {
    
  });
  it("unlocks the machine", function() {
    
  });
})
