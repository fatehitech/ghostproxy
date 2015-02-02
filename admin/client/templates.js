Template.ghostIndex.helpers({
  'allGhosts': function() {
    return Ghosts.find({});
  }
});

Template.ghostIndex.events({
  'click .destroy': function() {
    if (confirm("Are you sure?"))
      Ghosts.remove({_id: this._id});
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

Template.ghost.helpers({
  'prettyJSON': function() {
    return JSON.stringify(this, null, 2);
  }
});
