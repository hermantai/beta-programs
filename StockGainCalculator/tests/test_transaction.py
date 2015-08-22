'''
Created on Jan 22, 2012

@author: htai
'''

import unittest
import transaction
from transaction import Transaction
from decimal import Decimal
from datetime import datetime

class TransactionTestCase(unittest.TestCase):
    def testLessThan_ShortAccount_lt_LongAccount(self):
        t1 = Transaction("xom", True, 100, Decimal(61), Decimal(6200), datetime(2009, 1, 1, 12, 30, 1), transaction.ACCOUNT_TYPE_SHORT)
        t2 = Transaction("xom", True, 100, Decimal(61), Decimal(6200), datetime(2010, 1, 1, 12, 30, 1), transaction.ACCOUNT_TYPE_LONG)
        self.assertLess(t2, t1)

class XMLTransactionGeneratorTestCase(unittest.TestCase):
    def testGetTransactions_NoTransaction_ReturnZeroLength(self):
        transactionsXML = """<?xml version="1.0" encoding="UTF-8"?>
        <transactions>        
        </transactions>
        """
        xmlTG = transaction.XMLTransactionGenerator(xml=transactionsXML)
        trans = xmlTG.get_transactions()
        self.assertEqual(0,len(trans))   
        
    def testGetTransactions_OneTransactionNoAccountType_EqualsToOneCreatedInMemory(self):        
        transactionsXML="""<?xml version="1.0" encoding="UTF-8"?>        
        <transactions>
            <transaction>
                <symbol>xom</symbol>
                <buy>true</buy>
                <quantity>100</quantity>
                <price>61.00</price>
                <net_amount>6200</net_amount>
                <time>2010/1/1 12:30:01</time>
            </transaction>
        </transactions>
        """
        xmlTG = transaction.XMLTransactionGenerator(xml=transactionsXML)
        trans = xmlTG.get_transactions()
        t1 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        self.assertTrue(t1 in trans) 
        
    def testGetTransactions_OneCompleteTransaction_EqualsToOneCreatedInMemory(self):        
        transactionsXML="""<?xml version="1.0" encoding="UTF-8"?>        
        <transactions>
            <transaction>
                <symbol>xom</symbol>
                <buy>true</buy>
                <quantity>100</quantity>
                <price>61.00</price>
                <net_amount>6200</net_amount>
                <time>2010/1/1 12:30:01</time>
                <account_type>1</account_type>
            </transaction>
        </transactions>
        """
        xmlTG = transaction.XMLTransactionGenerator(xml=transactionsXML)
        trans = xmlTG.get_transactions()
        t1 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1), transaction.ACCOUNT_TYPE_SHORT)
        self.assertTrue(t1 in trans)
