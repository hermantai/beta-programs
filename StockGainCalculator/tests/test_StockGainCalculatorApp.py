import sys
import os
TEST_DIR = sys.path[0]
sys.path.insert(0,os.getcwd())

import unittest
from StockGainCalculatorApp import StockGainCalculatorGui
from transaction import Transaction
import Tkinter
from Tkinter import Tk
from decimal import Decimal
from datetime import datetime

class StockGainCalculatorAppTest(unittest.TestCase):
    def setUp(self):
        win = Tk()
        win.title('StockGainCalculator Testing')
        self.app = StockGainCalculatorGui(win)
        self.app.pack(padx=2,pady=2,expand=Tkinter.YES,fill=Tkinter.BOTH)

    def testAddTransaction(self):
        app = self.app
        app.clear_transactions()
        t1 = Transaction("xom",True,100,Decimal(61), Decimal(6200), datetime(2010,1,1,12,30,1))
        t2 = Transaction("xom",False,100,Decimal(65), Decimal(6400), datetime(2010,1,1,13,30,1))
        app.add_transaction(t1)
        app.add_transaction(t2)
        app.process_transactions()
        self.assertEqual(Decimal(200), app.get_short_term_gain(2010))
        self.assertEqual(Decimal(0),app.get_long_term_gain(2010))
        self.assertEqual(Decimal(0), app.get_short_term_gain(2009))

if __name__ == '__main__':
    unittest.main()
