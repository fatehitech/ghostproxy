Template.ghostIndex.helpers({
  'allGhosts': function() {
    return Ghosts.find({});
  }
});

Template.ghostIndex.events({
  'click .destroy': function() {
    if (confirm("Are you sure?"))
      Ghosts.remove({_id: this._id});
  }
});

Template.ghost.helpers({
  'prettyJSON': function() {
    return JSON.stringify(this, null, 2);
  }
});
