# MOZORK ETHEREUM 

Node RESTful API for ETHEREUM

Uses Ethereum GO client.

geth --datadir /path/to/where/you/want/chaindata/ --rpc --rpccorsdomain "localhost" --rpcapi "personal"

To Connect to geth node:

geth attach http://localhost:8545

Setup a docker container and run Mozork with port 8765 exposed.

dependencies 

node.js 6
Mongo

Ideally, you should auth handshake all connections to this container and only allow internal connections from the local IP address of the app that is using Mozork. (Which also runs in a VM container)

Contact me is you need help setting up the VM handshaking and security. 

http://172.xx.xx.xx:8765/api/v1/endpoints

(see api.js for endpoints)





