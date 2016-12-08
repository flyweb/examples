# node-flyweb-aio-printer

A FlyWeb user interface for controlling an all-in-one printer/scanner

Screenshots: [http://imgur.com/a/5vhN6](http://imgur.com/a/5vhN6)

### Setting up on a Raspberry Pi

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get remove nodejs
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install nodejs libavahi-compat-libdnssd-dev
sudo apt-get install hplip ink sane
```

##### Set up CUPS

```
sudo apt-get install cups
sudo usermod -a -G lpadmin pi
sudo cupsctl --remote-any
sudo /etc/init.d/cups restart
```

Open CUPS web interface in your browser via `https://{ip-address}:631/admin` and go to the "Administration" tab. Click "Add Printer" and, if prompted, log in as user `pi` (default password `raspberry`). Select your local printer from the list and click "Continue" and accept the defaults on the next page and click "Continue" again. Ensure the proper make/model are selected from the next page and click "Add Printer". Lastly, click "Set Default Options" on the next page to complete the setup of the CUPS queue and finally select "Set As Server Default" from the drop-down box on the printer queue status page.

##### Edit USB permissions permanently in `/etc/rc.local`

```
chmod -R 777 /dev/usb
exit 0
```

Be sure to restart after saving changes to `/etc/rc.local` with `sudo reboot`.

Also, this is absolutely NOT recommended, but a *really* hacky way to auto-start the FlyWeb service when the Raspberry Pi boots is to add the following lines before `exit 0` in `/etc/rc.local`:

```
cd {path_to_node-flyweb-aio-printer}
npm run start &
```

### Notes

We should be able to auto-retrieve printer-specific features using `lpoptions -l` which returns an output that looks like:

```
PageSize/Media Size: Card3x5 PhotoL PhotoL.FB L L.FB Hagaki Hagaki.FB Card4x6 Photo4x6 Photo4x6.FB A6 A6.FB HV HV.FB Photo5x7 Photo5x7.FB Photo2L Photo2L.FB Card5x8 Oufuku Cabinet Cabinet.FB A5 A5.FB B5.SM B5 JB5.SM JB5.FB JB5 Executive.SM Executive 8x10 Letter.SM Letter.FB Letter A4.SM A4.FB *A4 Legal EnvA2 EnvC6 EnvChou4 Env6 EnvCard EnvMonarch EnvDL Env10 EnvChou3 EnvC5 Custom.WIDTHxHEIGHT
Duplex/Double-Sided Printing: DuplexNoTumble DuplexTumble *None
ColorModel/Output Mode: CMYGray KGray *RGB
MediaType/Media Type: *Automatic Plain Glossy TransparencyFilm
InputSlot/Media Source: *Main
OutputMode/Print Quality: Auto FastDraft *Normal Best Photo
OptionDuplex/Duplexer Installed: *False True
```
