"""
InventoryCsv

Description:
    Gives TransactionGenerator for exported inventory CSV files
"""
import csv
import datetime
import decimal
import sys

import transaction
from transaction import Transaction,TransactionGenerator,TransactionGeneratorError

class InventoryCsvTransactionGenerator(TransactionGenerator):
    def __init__(self, file=None):
        self.file = file

    def get_transactions(self, file=None):
        if not file:
            file = self.file

        transactions = []
        reader = csv.DictReader(file)

        try:
            for entry in reader:
                dt = datetime.datetime.strptime(entry['time'], "%Y/%m/%d %H:%M:%S")

                transactions.append(
                    Transaction(
                        entry['symbol'],
                        entry['action'].lower() == "buy",
                        int(entry['quantity']),
                        decimal.Decimal(entry['price']),
                        decimal.Decimal(entry['net_amount']),
                        dt,
                        transaction.ACCOUNT_TYPE_LONG,
                    )
                )
        except Exception as ex:
            errMsg = "Illegal inventory csv file(s)."
            if entry:
                errMsg += " Error row: %s. Error: %s" % (entry, ex)
            raise TransactionGeneratorError(errMsg) from ex
        file.close()
        return transactions
