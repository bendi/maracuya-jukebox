#
# this script must be run as root
#
#hopefully I got it correct from my history :)
#
 
apt-get install libi2c-dev
#  not sure if this relevant at all - it was late and I was trying a lot of different things 
# i2cdetect -y 1
apt-get install i2c-tools
git clone git://git.drogon.net/wiringPi
cd wiringPi/
./build
pip install epyper
