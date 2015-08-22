StockGainCalculator
===================

Calculator the short-term and long-term gains for your stocks

## How to use StockGainCalculator

1. If you get the zip package, just unzip it, then double click StockGainCalculatorApp.exe. If you get the source file, then you need to have python 2.7 or higher installed, then go to the directory containing StockGainCalculatorApp.py, then run 
> python StockGainCalculatorApp.py
2. Choose a data file by File->Open
3. Select data file format, default is the first one.
4. Enter the desired year of the long term and short term gain/loss result.
5. Press Calculate


## The Sell History

Each entry is displayed as: <Date of the Sale> <Time of the sale> <Symbol of the stock> <Price>x<Quantity>, <Short-term gain/loss for this sale>, <Long-term gain/loss for this sale>


You can double click any entries to see the cost history of the stock. Each entry in the cost history is displayed as: <Date of the purchase> <Time of the purchase> <Quantity>x<Price>

## How to get the Zecco csv delimited file:

1. Login to Zecco, then login to your trading account.
2. Choose Account Records->Trade Activity
3. Choose the period you want to get the transactions. (Usually you should include every transaction)
4. Press go.
5. You see it lists your transactions. Press the download file button on the top right next to the printer icon.
6. Choose delimited text file, comma delimited, then download.
