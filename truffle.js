module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        production: {
            host: "162.213.250.102",
            port: 8545,
            network_id: "*" // Match any network id
        },
    }
};