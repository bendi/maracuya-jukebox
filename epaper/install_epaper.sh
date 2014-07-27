#
# this script must be run as root
#
# hopefully I got it correct from my history :)
#
 
apt-get install -y libi2c-dev
#  not sure if this relevant at all - it was late and I was trying a lot of different things 
# i2cdetect -y 1
apt-get install -y i2c-tools
git clone git://git.drogon.net/wiringPi
cd wiringPi/
./build

# python package manager
pushd /tmp
wget https://raw.github.com/pypa/pip/master/contrib/get-pip.py
python get-pip.py
popd

apt-get install -y python-dev

# and now python bindings
pip install epyper
