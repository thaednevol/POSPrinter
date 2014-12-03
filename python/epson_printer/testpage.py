from .epsonprinter import EpsonPrinter
from optparse import OptionParser
import sys

if __name__ == '__main__':

    parser = OptionParser()
    parser.add_option("-v", "--idvendor", action="store", type="int", dest="id_vendor", help="The printer vendor id")
    parser.add_option("-p", "--idProduct", action="store", type="int", dest="id_product", help="The printer product id")
    options, args = parser.parse_args()
    if not options.id_vendor or not options.id_product:
        parser.print_help()
    else:
        printer = EpsonPrinter(options.id_vendor, options.id_product)
	printer.especificar()
	printer.mover()
	printer.print_text("Hola EDDY")
	printer.imprimir()
	printer.cut()
        sys.exit(1)
