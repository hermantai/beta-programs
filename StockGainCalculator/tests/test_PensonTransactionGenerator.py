import sys
import os

from Penson import PensonTransactionGenerator
from transaction import Transaction, TransactionGenerator, TransactionGeneratorError
from StockGainCalculator import StockGainCalculator

import unittest
from cStringIO import StringIO
from decimal import Decimal
import datetime

class PensonTransactionGeneratorTest(unittest.TestCase):
    def setUp(self):
        self.singleBuySell = PensonTransactionGenerator(StringIO(
"""AccountTypeDescription,TradeDate,SettlementDate,ExecutionTime,TradeNumber,Cusip,Symbol,ShortDescription,BuySellCode,Quantity,Price,PrincipalAmount,CommissionGrossCalculated,OtherCommission,NetAmount,CurrencyCode
General Margin,11/20/2008,11/25/2008,155354,NA4TY,060505682,BAC.L,BANK OF AMERICA,B,3.00000,527.50000,-1582.50,0.00,0.00,-1582.50,USD
General Margin,12/01/2008,12/04/2008,125544,NA7WF,060505682,BAC.L,BANK OF AMERICA,S,-3.00000,580.00000,1740.00,0.00,0.02,1739.98,USD""")).get_transactions()
        self.singleBuySell.sort()
        self.over_year_transactions = PensonTransactionGenerator(StringIO(
"""AccountTypeDescription,TradeDate,SettlementDate,ExecutionTime,TradeNumber,Cusip,Symbol,ShortDescription,BuySellCode,Quantity,Price,PrincipalAmount,CommissionGrossCalculated,OtherCommission,NetAmount,CurrencyCode
Cash,02/26/2008,02/29/2008,131719,NA3MT,060505104,BAC,BK OF AMERICA,B,10.00000,43.00000,-430.00,0.00,0.00,-430.00,USD
Cash,03/11/2008,03/14/2008,141945,NA43G,060505104,BAC,BK OF AMERICA,B,38.00000,36.50000,-1387.00,0.00,0.00,-1387.00,USD
Cash,03/18/2008,03/24/2008,112245,NA1Q2,060505104,BAC,BK OF AMERICA,B,19.00000,37.47000,-711.93,0.00,0.00,-711.93,USD
Cash,04/03/2008,04/08/2008,130057,NA358,060505104,BAC,BK OF AMERICA,B,45.00000,40.48000,-1821.60,0.00,0.00,-1821.60,USD
Cash,07/15/2008,07/18/2008,124506,NA649,060505104,BAC,BK OF AMERICA,B,52.00000,19.75000,-1027.00,0.00,0.00,-1027.00,USD
Cash,09/15/2008,09/18/2008,124300,NA6BH,060505104,BAC,BK OF AMERICA,B,49.00000,28.20000,-1381.80,0.00,0.00,-1381.80,USD
Cash,09/26/2008,10/01/2008,140149,NABOA,060505104,BAC,BK OF AMERICA,S,-283.00000,36.00000,10188.00,0.00,0.08,10187.92,USD
Cash,11/01/2007,11/06/2007,141244,NA78I,US0605051046,BAC,BK OF AMERICA,B,25.000,46.29000,-1157.25,0.00,0.00,-1157.25,USD,B159213154,11/01/2007
Cash,11/07/2007,11/13/2007,131650,NA629,US0605051046,BAC,BK OF AMERICA,B,25.000,44.00000,-1100.00,0.00,0.00,-1100.00,USD,B159524102,11/07/2007
Cash,12/12/2007,12/17/2007,133348,NA3XD,US0605051046,BAC,BK OF AMERICA,B,20.000,43.00000,-860.00,0.00,0.00,-860.00,USD,B161175363,12/12/2007""")).get_transactions()
        self.over_year_transactions.sort()

    def testBuyTransaction(self):
        buyTransaction = self.singleBuySell[0]
        self.assertTrue(buyTransaction.buy)
        self.assertEqual("BAC.L",buyTransaction.symbol)
        self.assertEqual(3, buyTransaction.num_of_shares)
        self.assertEqual(Decimal('527.5'), buyTransaction.price_per_share)
        self.assertEqual(Decimal('1582.5'), buyTransaction.net_amount)
        self.assertEqual(Decimal('0'), buyTransaction.getFees())
        self.assertEqual('2008/11/20 15:53:54',buyTransaction.getTimeStr())

    def testSellTransaction(self):
        sellTransaction = self.singleBuySell[1]
        self.assertFalse(sellTransaction.buy)
        self.assertEqual("BAC.L",sellTransaction.symbol)
        self.assertEqual(Decimal('3'), sellTransaction.num_of_shares)
        self.assertEqual(Decimal('580'), sellTransaction.price_per_share)
        self.assertEqual(Decimal('1739.98'), sellTransaction.net_amount)
        self.assertEqual(Decimal('0.02'), sellTransaction.getFees())
        self.assertEqual('2008/12/01 12:55:44',sellTransaction.getTimeStr())

    def testOverYearTransactions(self):
        sgc = StockGainCalculator(self.over_year_transactions)
        sgc.process_transactions()
        self.assertEqual(Decimal("311.34"),sgc.get_short_term_gain(2008))
        self.assertEqual(Decimal("0"),sgc.get_long_term_gain(2008))

    def test_trans_6digit_time(self):
        sixDigitTimeTrans = PensonTransactionGenerator(StringIO(
"""AccountTypeDescription,TradeDate,SettlementDate,ExecutionTime,TradeNumber,Cusip,Symbol,ShortDescription,BuySellCode,Quantity,Price,PrincipalAmount,CommissionGrossCalculated,OtherCommission,NetAmount,CurrencyCode
General Margin,11/20/2008,11/25/2008,155354,NA4TY,060505682,BAC.L,BANK OF AMERICA,B,3.00000,527.50000,-1582.50,0.00,0.00,-1582.50,USD""")).get_transactions()
        sixDigitTimeTran = sixDigitTimeTrans[0]
        self.assertEqual(15, sixDigitTimeTran.time.hour)
        self.assertEqual(53, sixDigitTimeTran.time.minute)
        self.assertEqual(54, sixDigitTimeTran.time.second)

    def test_trans_5digit_time(self):
        fiveDigitTimeTrans = PensonTransactionGenerator(StringIO(
"""AccountTypeDescription,TradeDate,SettlementDate,ExecutionTime,TradeNumber,Cusip,Symbol,ShortDescription,BuySellCode,Quantity,Price,PrincipalAmount,CommissionGrossCalculated,OtherCommission,NetAmount,CurrencyCode
General Margin,11/20/2008,11/25/2008,55354,NA4TY,060505682,BAC.L,BANK OF AMERICA,B,3.00000,527.50000,-1582.50,0.00,0.00,-1582.50,USD""")).get_transactions()
        fiveDigitTimeTran = fiveDigitTimeTrans[0]
        self.assertEqual(5, fiveDigitTimeTran.time.hour)
        self.assertEqual(53, fiveDigitTimeTran.time.minute)
        self.assertEqual(54, fiveDigitTimeTran.time.second)

    def test_trans_4digit_time(self):
        fourDigitTimeTrans = PensonTransactionGenerator(StringIO(
"""AccountTypeDescription,TradeDate,SettlementDate,ExecutionTime,TradeNumber,Cusip,Symbol,ShortDescription,BuySellCode,Quantity,Price,PrincipalAmount,CommissionGrossCalculated,OtherCommission,NetAmount,CurrencyCode
General Margin,11/20/2008,11/25/2008,1216,NA4TY,060505682,BAC.L,BANK OF AMERICA,B,3.00000,527.50000,-1582.50,0.00,0.00,-1582.50,USD""")).get_transactions()
        fourDigitTimeTran = fourDigitTimeTrans[0]
        self.assertEqual(12, fourDigitTimeTran.time.hour)
        self.assertEqual(16, fourDigitTimeTran.time.minute)
        self.assertEqual(0, fourDigitTimeTran.time.second)

    def test_trans_notime(self):
        noTimeTrans = PensonTransactionGenerator(StringIO(
"""AccountTypeDescription,TradeDate,SettlementDate,ExecutionTime,TradeNumber,Cusip,Symbol,ShortDescription,BuySellCode,Quantity,Price,PrincipalAmount,CommissionGrossCalculated,OtherCommission,NetAmount,CurrencyCode
General Margin,11/20/2008,11/25/2008,,NA4TY,060505682,BAC.L,BANK OF AMERICA,B,3.00000,527.50000,-1582.50,0.00,0.00,-1582.50,USD""")).get_transactions()
        noTimeTran = noTimeTrans[0]
        self.assertEqual(0, noTimeTran.time.hour)
        self.assertEqual(0, noTimeTran.time.minute)
        self.assertEqual(0, noTimeTran.time.second)

if __name__ == '__main__':
    unittest.main()
