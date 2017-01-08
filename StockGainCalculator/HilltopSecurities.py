"""
HilltopSecurities

created by Herman Tai 2017/01/07

Description:
    Gives TransactionGenerator for HilltopSecurities
"""

import csv
from datetime import datetime
from decimal import Decimal

import sys

import transaction
from transaction import Transaction,TransactionGenerator,TransactionGeneratorError

class HilltopSecuritiesTransactionGenerator(TransactionGenerator):
    def __init__(self, file=None):
        self.file = file

    def get_transactions(self,file=None):
        if not file:
            file = self.file

        transactions = []
        processing_entry = None
        try:
            reader = csv.DictReader(file,delimiter=',')
            for entry in reader:
                processing_entry = entry
                if entry['Activity'] != 'Trade':
                    continue

                d = entry['TradeDate']
                dt = datetime.strptime(d, "%Y-%m-%d")

                quantity = int(self._fix_quantity_format(entry['Quantity']))
                buy = quantity > 0
                quantity = abs(quantity)

                net_amount = abs(
                    Decimal(self._fix_amount_format(entry['Amount']))
                )

                price = Decimal(self._fix_amount_format(entry['Price']))

                symbol = entry['Symbol']

                transactions.append(
                    Transaction(
                        symbol,
                        buy,
                        quantity,
                        price,
                        net_amount,
                        dt,
                        transaction.ACCOUNT_TYPE_LONG,
                    )
                )

        except Exception as ex:
            errMsg = "Illegal Hilltop Securities data file."
            if processing_entry:
                errMsg += " Error row: %s. Error: %s" % (processing_entry, ex)
            raise TransactionGeneratorError(errMsg), None, sys.exc_info()[2]
        file.close()
        return transactions

    @classmethod
    def _fix_amount_format(cls, s):
        s = s.replace('$', "").replace(',', "")
        return s

    @classmethod
    def _fix_quantity_format(cls, s):
        s = s.replace(',', "")
        return s
