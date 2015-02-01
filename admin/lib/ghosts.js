Ghosts = new Mongo.Collection("ghosts");

Ghosts.attachSchema({
  fqdn: {
    type: String,
    label: 'FQDN (myapp.example.com)',
    unique: true,
    min: 1,
    max: 160
  },
  proxyPath: {
    type: String,
    optional: true,
    label: 'Proxy Path (http://1.2.3.4:3000)',
    min: 1,
    max: 160
  },
  digitalOceanApiKey: {
    label: "DigitalOcean API Key",
    type: String,
    min: 64, max: 64
  }
});

