const quilt = require('@quilt/quilt'); //imports quilt
const Mean = require('./mean.js'); //imports mean application
const utils = require('./utils.js');
const WorkloadGen = require('./workload.js');

//this file tells quilt what machines to boot and which services to run

// Replication to use for the node application
// and Mongo.
const count = 2;
const infrastructure = quilt.createDeployment(  //creates a Quilt deployment object named infrastructure
	//this object is a reference to the specific cluster/deployment you'll be working with
    {namespace: "racheluwuwu"}
);

const machine0 = new quilt.Machine({ //describes which AWS instances to use in the cluster
    provider: 'Amazon',
    size: "c4.large",
});

const machine1 = new quilt.Machine({ //describes which AWS instances to use in the cluster
    provider: 'Amazon',
    size: "c4.large",
});

const workloadMachine = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
    // region: "us-west-2",
    //preemptible: true,
    diskSize: 16,
});

utils.addSshKey(machine0) //ssh keys to put in the machines/AWS instances
utils.addSshKey(machine1)
utils.addSshKey(workloadMachine);

//adds machines to the infrastructure object
infrastructure.deploy(machine0.asMaster());
infrastructure.deploy(machine1.asWorker());
infrastructure.deploy(workloadMachine.asWorker());

//instantiates and deploys our application, mean, to run todo-app
const nodeRepository = 'https://github.com/TsaiAnson/node-todo.git';
const mean = new Mean(count, nodeRepository);
const workload_count = 1;
const workload = new WorkloadGen(workload_count);

workload.cluster[0].placeOn({diskSize: 16});
workload.cluster[1].placeOn({diskSize: 16});

mean.proxy.allowFrom(workload.cluster, 80);

var mongo_placements = [machine1];
var node_placements = [machine1];
var haproxy_placements = [machine1];

mean.notexclusive_mongo(mongo_placements);
mean.notexclusive_node(node_placements);
mean.notexclusive_haproxy(haproxy_placements);


infrastructure.deploy(mean);
infrastructure.deploy(workload);

//so, meanExample.js tells Quilt which machines to boot and which services to run by generating a Quilt deployment 
//object named infrastructure that is a reference to the specific cluster/deployment you'll be working with
