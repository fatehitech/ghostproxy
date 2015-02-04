var expect = require('chai').expect;
var GhostReaper = require('../src/ghost_reaper');

var ghost = null;

beforeEach(function() {
  ghost = {};
});

describe("GhostReaper::reap", function() {
  it("turns off the machine", function() {

    GhostReaper.reap(ghost)
    
  });
  it("snapshots the machine on digitalocean", function() {
    
  })
  it("deletes the previous snapshot from digitalocean", function() {
    
  });
  it("replaces the previous snapshot id", function() {
    
  });
})
