Template.ghostIndex.helpers({
  'allGhosts': function() {
    return Ghosts.find({});
  }
});

Template.ghostIndex.events({
  'click .destroy': function() {
    this.destroyJobs();
    Ghosts.remove({_id: this._id});
  },
  'click .destroyJobs': function() {
    this.destroyJobs();
  },
  'click .resetStatus': function() {
    Ghosts.update({_id: this._id}, {$set: {status: 0}});
  }
});

Template.insertGhostForm.rendered = function() {
  AutoForm.hooks({
    insertGhostForm: {
      onError: function(operation, error, template) {
        console.log(arguments);
      }
    }
  });
}

Template.insertGhostForm.helpers({
  'omitFields': function() {
    return ['ipAddress', 'droplet', 'snapshotId', 'status'];
  }
})

Template.ghost.helpers({
  'statusText': function() {
    return Ghosts.STATUS_TEXT[this.status];
  },
  'hasJobs': function() {
    return this.getJobs().count() > 0;
  },
  'jobs': function() {
    return this.getJobs();
  }
});
