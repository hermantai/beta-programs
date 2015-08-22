"""
setup.py

Has to be run in the same directory that containing this script
"""
import os
import re
import shutil
import zipfile

from distutils.core import setup
import py2exe

version = "0.10"
setup(
    name="StockGainCalculator",
    windows=['StockGainCalculatorApp.py'],
    version=version,
    author="Herman Tai",
    author_email="htaihm@gmail.com",
    data_files=["README.md", "RELEASE.txt", "LICENSE"],
)

file_name = "StockGainCalculator-%s" % version

print("Zip it up...")
with zipfile.ZipFile(file_name + ".zip", "w") as myzip:
    for root, dirs, files in os.walk("dist"):
        for f in files:
            filepath = os.path.join(root, f)
            myzip.write(
                filepath,
                arcname=re.sub("^dist", file_name, filepath),
            )
