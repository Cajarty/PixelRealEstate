cd ./PixelRealEstate-Server
git checkout -- .
git checkout master
git pull origin master
cd ..
cp -a ./PixelRealEstate-Server/* ./public_html/canvas/server/
cd ./public_html/canvas/server/