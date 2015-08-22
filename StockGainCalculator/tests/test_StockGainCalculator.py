'''
Created on Oct 9, 2010

@author: htai
'''
import unittest
import StockGainCalculator
from transaction import Transaction
import transaction
from decimal import Decimal
from datetime import datetime
import xml.dom.minidom
import os

class StockGainCalculatorTestCase(unittest.TestCase):
    def setUp(self):
        self.calculator = StockGainCalculator.StockGainCalculator()

    def tearDown(self):
        pass

    def testGetShortTermGain_SaleSameYear_ReturnTheGainForTheYear(self):
        calculator = self.calculator
        calculator.clear()
        t1 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        t2 = Transaction("xom",False,100,Decimal(65), Decimal(6400), datetime(2010,1,1,13,30,1))
        calculator.add_transaction(t1)
        calculator.add_transaction(t2)
        calculator.process_transactions()
        self.assertEqual(Decimal(200), calculator.get_short_term_gain(2010))
        self.assertEqual(Decimal(0), calculator.get_short_term_gain(2009))

    def testGetLongTermGain_SaleSameYear_Return0(self):
        calculator = self.calculator
        calculator.clear()
        t1 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        t2 = Transaction("xom",False,100,Decimal(65), Decimal(6400), datetime(2010,1,1,13,30,1))
        calculator.add_transaction(t1)
        calculator.add_transaction(t2)
        calculator.process_transactions()
        self.assertEqual(Decimal(0),calculator.get_long_term_gain(2010))

    def testGetTransactionsFor_TransactionsWithTheSymbol_ExpectedTrue(self):
        calculator = self.calculator
        calculator.clear()
        t1 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        t2 = Transaction("xom",False,100,Decimal(65), Decimal(6400), datetime(2010,1,1,13,30,1))
        t3 = Transaction("abc",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        calculator.add_transaction(t1)
        calculator.add_transaction(t2)
        calculator.add_transaction(t3)
        self.assertTrue(t1 in calculator.get_transactions_for("xom"))
        self.assertTrue(t2 in calculator.get_transactions_for("xom"))
        self.assertFalse(t3 in calculator.get_transactions_for("xom"))

    def test_process_transactions_oneShortTransaction_oneHistory(self):
        cal = self.calculator
        t1 = Transaction("xom", False, 100, Decimal(61), Decimal(6200), datetime(2010, 1, 1, 12, 30, 1), transaction.ACCOUNT_TYPE_SHORT)
        cal.add_transaction(t1)
        cal.process_transactions()
        sales_history = cal.get_sale_history(2010)
        self.assertEqual(1, len(sales_history))

class XMLTransactionGeneratorTestCase(unittest.TestCase):
    def setUp(self):
        self.maxDiff = 10000

    def test_exportTransactions_OneTransaction_ExactRepresentationOfXML(self):
        t1 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        trans = [t1]
        filename = "oneTrans.xml"
        StockGainCalculator.exportTransactions(trans, filename)
        outputXml = open(filename).read()
        expectedXML = """<?xml version="1.0" encoding="UTF-8"?>
<transactions>
    <transaction>
        <symbol>XOM</symbol>
        <buy>true</buy>
        <quantity>100</quantity>
        <price>61</price>
        <net_amount>6200</net_amount>
        <time>2010/01/01 12:30:01</time>
        <account_type>0</account_type>
    </transaction>
</transactions>
        """
        expectedXML = xml.dom.minidom.parseString(expectedXML).toxml()
        outputXml = xml.dom.minidom.parseString(outputXml).toxml()
        self.assertEqual(expectedXML, outputXml)

    def testExportTransactions_OneTransInMemory_ImportBackTheSame(self):
        t1 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        trans = [t1]
        filename = "oneTransForIE.xml"
        StockGainCalculator.exportTransactions(trans, filename)
        gen = transaction.XMLTransactionGenerator()
        trans = gen.get_transactions(open(filename,"r"))
        self.assertEqual(t1,trans[0])

    def tearDown(self):
        filesToDelete = ("oneTrans.xml","oneTransForIE.xml")
        for fileToDelete in filesToDelete:
            if os.path.exists(fileToDelete):
                os.remove(fileToDelete)

class TransactionTestCase(unittest.TestCase):
    def testEquals_TwoSameTransactons_True(self):
        t1 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        t2 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        self.assertTrue(t1 == t2)

    def testEquals_DifferentDate_False(self):
        t1 = Transaction("xom", True, 100, Decimal(61), Decimal(6200), datetime(2010, 1, 1, 12, 30, 1))
        t2 = Transaction("xom", True, 100, Decimal(61), Decimal(6200), datetime(2010, 1, 2, 12, 30, 1))
        self.assertFalse(t1 == t2)


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()

