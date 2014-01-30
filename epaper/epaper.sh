#!/bin/bash

gpio load spi
gpio load i2c
./epaper.js "$1"
