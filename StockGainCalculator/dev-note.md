Development Notes
=================
Build
-----
Only support building a windows executable:

To build a windows app, make sure you have py2exe installed, then

> python setup.py py2exe

Pending features/bug fixed
--------------------------

- unrecognized error when sale of stocks exceed inventory
- separate fees and real share price at cost history screen
- add support to penson xml
- make sure error messages go to the UI instead of the back-end. Unless in debug mode.

Feature enhancement (there are workarounds but we want to do better)
-------------------------------------------------

- add capability to manually add transaction
- add capability to incrementally add transaction files, that means need to add capability to remove transaction files from the transactions base, etc
- Right now if a stock symbol changes, there will be an inventory mismatch
