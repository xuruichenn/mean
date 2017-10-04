const quilt = require('@quilt/quilt');
const Mean = require('./mean');
const utils = require('./utils');

// Replication to use for the node application
// and Mongo.
const count = 2;
const infrastructure = quilt.createDeployment(
    {namespace: "machang"}
);

const machine = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
    preemptible: false,
});

utils.addSshKey(machine);

infrastructure.deploy(machine.asMaster());
for (i = 0; i < count; i++) {
    infrastructure.deploy(machine.asWorker());
}

const nodeRepository = 'https://github.com/TsaiAnson/node-todo.git';
const mean = new Mean(count, nodeRepository);
infrastructure.deploy(mean);
