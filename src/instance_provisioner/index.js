var logger = require('../../logger')
  , Instance = require('../../server/models').Instance
  , io = require('../../server/socketio')
  , promiseCreateVPS = require('./promise_create_vps')
  , simpleStacktrace = require('../../simple_stacktrace')
  , blockUntilListening = require('./block_until_listening')
  , blockUntilResolving = require('./block_until_resolving')
  , bumperFactory = require('../../bumper_factory')

module.exports = function(queue) {
  queue.process(function(job, done){
    var progressBumper = bumperFactory(function(number) {
     job.progress(number)
    })

    logger.info('received instance provisioning job', {
      worker: 'instance_provisioner',
      job: job.data
    });

    Instance
    .findByIdAndPopulateAccount(job.data.instance)
    .then(function(instance) {
      logger.info('provisioning instance', {
        worker: 'instance_provisioner',
        instance: instance._id.toString()
      })
      job.error = null;
      job.failed = null;
      job.instance = instance
      job.provisioner = instance.getProvisioner();
      job.progress(1)
      return instance;
    })
    .then(promiseCreateVPS({
      onDelayed: {
        time: 10000,
        action: function(explanation) {
          updateProvisioningState(job.instance, {
            progress: 1,
            delayReason: explanation
          })
        }
      }
    }))
    .then(function(ip) {
      job.progress(2)
      logger.info('got vps ip', {
        worker: 'instance_provisioner',
        ip: ip
      });
      job.instance.agent.public_ip = ip;
      job.instance.setupDNS(function(err) {
        if (err) logger.error(err.stack);
      });
      return blockUntilListening({
        port: 22,
        ip: ip,
        match: "SSH",
        bumpProgress: progressBumper(3, 25)
      })
    })
    .then(function(ip) {
      job.progress(10)
      logger.info('SSH connection now possible', {
        worker: 'instance_provisioner',
        ip: ip
      })
      return job.provisioner.provision(job.instance, ip, progressBumper(10, 99))
    }).then(function(containerNotes) {
      gracefullyExitProvisioningState(job.instance, done)
      job.instance.account.sendInstanceProvisionedEmail(job.instance)
    }).catch(done).error(done)
  })

  queue.on('progress', function(job, progress){
    if (job.instance) {
      updateProvisioningState(job.instance, {
        delayReason: null,
        progress: progress
      })
    } else {
      logger.error('could not update state of job due to missing instance', {
        worker: 'instance_provisioner',
        job: job.data
      })
    }
  })
  
  queue.on('failed', function(job, err){
    logger.error('provisioner job failed', {
      worker: 'instance_provisioner',
      job: job.data, stack: err.stack
    })
    updateProvisioningState(job.instance, {
      failed: true,
      error: {
        message: err.message,
        stack: (
          process.env.NODE_ENV === 'production' ?
          simpleStacktrace(err.stack) : err.stack
        )
      }
    })
  })
}

function updateProvisioningState(instance, newState) {
  if (!instance.agent.provisioning) return; // noop for discrete updates
  newState.status = 'provisioning'
  instance.updateProvisioningState(newState, function(err) {
    if (err) logger.error('update provisioning state error', {
      worker: 'instance_provisioner',
      instance: instance._id.toString(),
      stack: err.stack
    });
    instance.socketEmit({ state: newState });
  })
}

function gracefullyExitProvisioningState(instance, done) {
  instance.agent.provisioning = null;
  instance.update({ agent: instance.agent }, function (err) {
    if (err) logger.error('update provisioning state error', {
      worker: 'instance_provisioner',
      instance: instance._id.toString(),
      stack: err.stack
    });
    setTimeout(function() {
      // waiting briefly to avoid any socket hangup errors
      instance.socketEmit({ reload: true });
      done();
    }, 2000)
  })
}
