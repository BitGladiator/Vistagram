class DatabasePool {
    constructor(primaryConfig, replicaConfigs) {
      this.primary = new Pool(primaryConfig);
      this.replicas = replicaConfigs.map(config => new Pool(config));
      this.replicaIndex = 0;
    }
    async write(query, params) {
      return this.primary.query(query, params);
    }
  
    async read(query, params) {
      const replica = this.getNextReplica();
      return replica.query(query, params);
    }
  
    getNextReplica() {
      const replica = this.replicas[this.replicaIndex];
      this.replicaIndex = (this.replicaIndex + 1) % this.replicas.length;
      return replica;
    }
  }