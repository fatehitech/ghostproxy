Saasbox-Provisioner
===

This worker consists of an extremely high level cloud provisioner

## Customer VMs (Agents)

The worker listens on Redis for a [bull job](https://github.com/OptimalBits/bull) like this:

```js
{
  cloudProvider: 'DigitalOcean',
  serverSpecs: {
    memory: 512,
    cpus: 1,
    storage: 20,
    cents: 3000
  },
  name: 'ag01',
  fqdn: 'ag01.example.com'
}
```

Upon receipt the worker will:

* ensure configured public/private key are set on the cloud provider

* provision a new ubuntu server at the given cloud provider with public key authorized on root

* configure dns to map the server's ip address to a domain name (e.g. ag01.deadsimplecloud.com)

* run ansible like so `NAME=ag01 SECRET=your-secret-token IMAGE=niallo/strider:latest ./mkagent`