OwnVsRent
=========


Description
-----------
A calculator to find the difference between owning a home vs renting it.

Usage
-----
If you have the zip package, just unzip it and double click the OwnVsRent.exe
file.

If you get the source file, then you need to have python 2.7 or higher installed, then go to the directory containing OwnVsRent.py, then run :
> python OwnVsRent.py

Build
-----
Only support building windows executable:

In the OwnVsRent directory:
> python setup.py py2exe

Troubleshooting
---------------
If you get a dll error when running the windows executable, take a look at [http://www.py2exe.org/index.cgi/Tutorial#Step5](http://www.py2exe.org/index.cgi/Tutorial#Step5). You should be able to resolve it by downloading the [Microsoft Visual C++ 2008 Redistributable Package (x86)](http://www.microsoft.com/en-us/download/details.aspx?id=29)
