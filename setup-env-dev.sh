chmod 777 ./destroy-env-dev.sh
./destroy-env-dev.sh
ganache-cli >| ./logs/ganache.txt &
echo "kill -9" $! >| destroy-env-dev.sh
truffle migrate > ./logs/ctr.txt
cp ./build/contracts/VirtualRealEstate.json ../PixelRealEstate-Server/build/contracts/
cd ../PixelRealEstate-Server/
node . dev cache >| ../PixelRealEstate/logs/server.txt &
cd ../PixelRealEstate/
echo "kill -9" $! >> destroy-env-dev.sh
npm run start