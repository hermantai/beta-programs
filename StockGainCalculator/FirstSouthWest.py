"""
FirstSouthWest

created by Herman Tai 2013/09/08

Description:
    Gives TransactionGenerator for FirstSouthWest
"""

import csv
from datetime import datetime
from decimal import Decimal

import sys

import transaction
from transaction import Transaction,TransactionGenerator,TransactionGeneratorError

class FirstSouthWestTransactionGenerator(TransactionGenerator):
    def __init__(self, file=None):
        self.file = file

    def get_transactions(self,file=None):
        if not file:
            file = self.file

        transactions = []
        processingTrade = None
        try:
            reader = csv.DictReader(file,delimiter=',')
            for trade in reader:
                processingTrade = trade
                d = trade['Date']
                dt = datetime.strptime(d, "%m/%d/%Y")

                quantity = int(self._fix_quantity_format(trade['Quantity']))
                buy = quantity > 0
                quantity = abs(quantity)

                net_amount = abs(
                    Decimal(self._fix_amount_format(trade['Amount']))
                )

                price = Decimal(self._fix_amount_format(trade['Price']))

                symbol = trade['Symbol or CUSIP']

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
            errMsg = "Illegal FirstSouthWest data file."
            if processingTrade:
                errMsg += " Error row: %s. Error: %s" % (processingTrade, ex)
            raise TransactionGeneratorError(errMsg) from ex
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
