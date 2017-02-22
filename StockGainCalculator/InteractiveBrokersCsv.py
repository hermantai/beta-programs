"""
InteractiveBrokersCsv

Description:
    Gives TransactionGenerator for Interactive Brokers CSV files
"""
import csv
import datetime
import decimal
import sys

import transaction
from transaction import Transaction,TransactionGenerator,TransactionGeneratorError

class InteractiveBrokersCsvTransactionGenerator(TransactionGenerator):
    def __init__(self, file=None):
        self.file = file

    def get_transactions(self, file=None):
        if not file:
            file = self.file

        transactions = []
        reader = csv.DictReader(self.filter_trades_lines(file))

        try:
            for entry in reader:
                if not entry['Exchange'] == '-':
                    continue

                dt = datetime.datetime.strptime(entry['Date/Time'], "%Y-%m-%d, %H:%M:%S")
                quantity = int(self._fix_number(entry['Quantity']))
                is_buy = quantity > 0
                quantity = abs(quantity)
                gross_proceeds = abs(
                    decimal.Decimal(
                        self._fix_number(entry['Proceeds'])
                    )
                )
                comm = abs(decimal.Decimal(self._fix_number(entry['Comm/Fee'])))

                if is_buy:
                    net_proceeds = gross_proceeds + comm
                else:
                    net_proceeds = gross_proceeds - comm

                transactions.append(
                    Transaction(
                        entry['Symbol'],
                        is_buy,
                        quantity,
                        decimal.Decimal(entry['T. Price']),
                        net_proceeds,
                        dt,
                        transaction.ACCOUNT_TYPE_LONG,
                    )
                )
        except Exception as ex:
            errMsg = "Illegal Interactive Brokers CSV file(s)."
            if entry:
                errMsg += " Error row: %s. Error: %s" % (entry, ex)
            raise TransactionGeneratorError(errMsg), None, sys.exc_info()[2]
        file.close()
        return transactions

    def filter_trades_lines(self, f):
        for line in f:
            if line.startswith("Trades,"):
                yield line

    def _fix_number(self, s):
        return s.replace(',', '')
