from FirstSouthWest import FirstSouthWestTransactionGenerator

from decimal import Decimal
from cStringIO import StringIO
import unittest

class FirstSouthWestGeneratorTestCase(unittest.TestCase):
    def setUp(self):
        self.singleBuySell = FirstSouthWestTransactionGenerator(StringIO(
""""Date","Activity","Quantity","Description","Symbol or CUSIP","Price","Amount","Type",
"03/25/2013","Trade","500","INTEL CORP","INTC","$21.20","-$10,606.95","Margin",
"04/25/2013","Trade","-500","INTEL CORP","INTC","$23.21","$11,598.05","Margin",""")).get_transactions()

        self.singleBuySell.sort()

    def test_BuyTransaction(self):
        buy_transaction = self.singleBuySell[0]
        self.assertTrue(buy_transaction.buy)
        self.assertEqual("INTC",buy_transaction.symbol)
        self.assertEqual(500, buy_transaction.num_of_shares)
        self.assertEqual(Decimal('21.20'), buy_transaction.price_per_share)
        self.assertEqual(Decimal('10606.95'), buy_transaction.net_amount)
        self.assertEqual(Decimal('6.95'), buy_transaction.getFees())
        self.assertEqual('2013/03/25 00:00:00',buy_transaction.getTimeStr())

    def test_SellTransaction(self):
        sell_transaction = self.singleBuySell[1]
        self.assertFalse(sell_transaction.buy)
        self.assertEqual("INTC",sell_transaction.symbol)
        self.assertEqual(500, sell_transaction.num_of_shares)
        self.assertEqual(Decimal('23.21'), sell_transaction.price_per_share)
        self.assertEqual(Decimal('11598.05'), sell_transaction.net_amount)
        self.assertEqual(Decimal('6.95'), sell_transaction.getFees())
        self.assertEqual('2013/04/25 00:00:00',sell_transaction.getTimeStr())

if __name__ == '__main__':
    unittest.main()
