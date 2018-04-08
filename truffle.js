module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",// Match any network id
            gas: 4700000,
        },
        production: {
            host: "162.213.250.102",
            port: 8545,
            network_id: "*", // Match any network id
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};