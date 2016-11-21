# node-flyweb-aio-printer

A FlyWeb user interface for controlling an all-in-one printer/scanner

### Setting up on a Raspberry Pi

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get remove nodejs
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs libavahi-compat-libdnssd-dev
sudo apt-get install hplip ink sane
```

Edit USB permissions permanently in `/etc/rc.local`:

```
chmod -R 777 /dev/usb
exit 0
```
