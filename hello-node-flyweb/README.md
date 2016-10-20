# hello-node-flyweb

A simple example of a FlyWeb service in Node.js

### Installing Node.js on a Raspberry Pi

To update Raspbian with the latest version of Node.js from the [NodeSource PPA](https://nodesource.com/), run the following commands:

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get remove nodejs
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs
```

### Apple Bonjour compatibility for Avahi on Linux

In order to be able to install the `mdns` NPM package on Linux (including the Raspberry Pi) for running this example, you'll need to have the `libavahi-compat-libdnssd-dev` package installed. To install these packages, simply run:

```
sudo apt-get install libavahi-compat-libdnssd-dev
sudo npm install -g mdns
```

Note that the `libavahi-compat-libdnssd-dev` package provides Avahi headers for Apple Bonjour compatibility. This is required since the `mdns` package utilizes the Apple Bonjour API directly. Because of that, this Node.js example can also run on macOS/OS X systems by simply installing the `mdns` package from NPM. This example will also run on Windows systems provided that the Apple Bonjour is installed. See the [`mdns` README](https://github.com/agnat/node_mdns) for more information.
