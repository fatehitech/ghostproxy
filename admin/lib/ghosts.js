Ghosts = new Mongo.Collection("ghosts");

Ghosts.attachSchema({
  fqdn: {
    type: String,
    label: 'FQDN (myapp.example.com)',
    unique: true,
    min: 1,
    max: 160,
    defaultValue: 'localhost'
  },
  httpPort: {
    label: "HTTP Listen Port",
    type: Number,
    defaultValue: 80
  },
  digitalOceanApiKey: {
    label: "DigitalOcean API Key",
    type: String,
    min: 64, max: 64,
    defaultValue: 'f2dab5dc6a549c32923544074cfadde3d435d6871c8701e659b9d15e29b4e8e2'
  },
  status: {
    type: Number,
    autoValue: function() {
      return 0;
    }
  },
  provisioner: {
    type: String,
    label: 'Provisioner',
    regEx: /^bash$/,
    defaultValue: 'bash'
  },
  provisionerScript: {
    type: String,
    label: "Provisioner Script",
    optional: true,
    autoform: {
      rows: 10
    },
    defaultValue: 'apt-get -yq install nginx'
  },
  ipAddress: {
    type: String,
    optional: true
  },
  droplet: {
    type: Object,
    optional: true
  },
  snapshotId: {
    type: String,
    optional: true
  }
});

Ghosts.helpers({
  'getJobs': function() {
    return Jobs.find({ 'params.ghost._id': this._id })
  },
  'destroyJobs': function() {
    this.getJobs().map(function(job) {
      Jobs.remove({ _id: job._id });
    });
  }
});
