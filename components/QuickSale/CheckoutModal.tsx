import React from "react";
import { X, User, Calendar, Calculator, Loader2, Search, ChevronDown } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { MarkupCalculatorModal } from "./MarkupCalculatorModal";
import { DiscountCalculatorModal } from "./DiscountCalculatorModal";
import type { CreditPersona } from "../../services/Credit/fetchCreditPersonas";

interface CheckoutModalProps {
  show: boolean;
  onClose: () => void;
  paymentType: "paid" | "credit";
  onPaymentTypeChange: (v: "paid" | "credit") => void;
  createdAt: string;
  onCreatedAtChange: (v: string) => void;
  creditPersonas: CreditPersona[];
  selectedCreditPersonId: string;
  onCreditPersonChange: (v: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (v: any) => void;
  useMarkup: boolean;
  onUseMarkupChange: (v: boolean) => void;
  discount: number;
  onDiscountChange: (v: number) => void;
  markupAmount: number;
  onMarkupAmountChange: (v: number) => void;
  paidAmount: number;
  onPaidAmountChange: (v: number) => void;
  note: string;
  onNoteChange: (v: string) => void;
  subtotal: number;
  total: number;
  combinedDiscountAmount: number;
  cartItemCount: number;
  isProcessing: boolean;
  devices: { isMobile: boolean };
  onCheckout: () => void;
  showDiscountCalculator: boolean;
  showMarkupCalculator: boolean;
  onOpenDiscountCalc: () => void;
  onOpenMarkupCalc: () => void;
  onCloseDiscountCalc: () => void;
  onCloseMarkupCalc: () => void;
  discountAmount: string;
  onDiscountAmountChange: (v: string) => void;
}

const PAYMENT_METHODS = {
  paid: ["Cash", "KBZPay", "WavePay", "AYA Pay", "UAB Pay", "MMQR", "Bank Transfer", "FOC"],
  credit: ["Cash", "KBZPay", "WavePay", "AYA Pay", "UAB Pay", "MMQR", "Bank Transfer", "FOC"],
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  show, onClose,
  paymentType, onPaymentTypeChange,
  createdAt, onCreatedAtChange,
  creditPersonas, selectedCreditPersonId, onCreditPersonChange,
  paymentMethod, onPaymentMethodChange,
  useMarkup, onUseMarkupChange,
  discount, onDiscountChange,
  markupAmount, onMarkupAmountChange,
  paidAmount, onPaidAmountChange,
  note, onNoteChange,
  subtotal, total, combinedDiscountAmount, cartItemCount,
  isProcessing, devices,
  onCheckout,
  showDiscountCalculator, showMarkupCalculator,
  onOpenDiscountCalc, onOpenMarkupCalc,
  onCloseDiscountCalc, onCloseMarkupCalc,
  discountAmount, onDiscountAmountChange,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTownship, setSelectedTownship] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedPersona = creditPersonas.find((p) => p._id === selectedCreditPersonId);

  // Extract unique townships
  const townships = React.useMemo(() => {
    const list = creditPersonas.map((p) => p.township).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [creditPersonas]);

  // Filter credit personas based on search and township
  const filteredPersonas = React.useMemo(() => {
    return creditPersonas.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.phone && p.phone.includes(searchTerm));
      const matchesTownship = !selectedTownship || p.township === selectedTownship;
      return matchesSearch && matchesTownship;
    });
  }, [creditPersonas, searchTerm, selectedTownship]);

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-primary/10">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {devices.isMobile ? "Mobile" : "Desktop"}
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {cartItemCount} {t("pos.itemsLower")} • {subtotal.toLocaleString()} MMK
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("pos.paymentType")}</label>
              <select
                className="payment-type-select w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                value={paymentType}
                onChange={(e) => onPaymentTypeChange(e.target.value as "paid" | "credit")}
              >
                <option value="paid">{t("pos.paid")}</option>
                <option value="credit">{t("pos.credit")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("pos.orderDate") || "Order Date"}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input type="date"
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={createdAt} onChange={(e) => onCreatedAtChange(e.target.value)}
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("pos.customer")}</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-left"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <User className={`absolute left-3 top-2.5 h-4 w-4 ${selectedPersona ? "text-primary" : "text-gray-400"}`} />
                  <span className="truncate">
                    {selectedPersona
                      ? `${selectedPersona.name}${selectedPersona.phone ? ` - ${selectedPersona.phone}` : ""}${selectedPersona.township ? ` (${selectedPersona.township})` : ""}`
                      : `-- ${t("pos.selectCustomerOptional")} --`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {selectedPersona && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreditPersonChange("");
                          setSearchTerm("");
                        }}
                        className="p-0.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </button>

                {isOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2.5 space-y-2 max-h-64 flex flex-col">
                    <div className="flex gap-2 flex-shrink-0">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                        <input
                          type="text"
                          className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          placeholder="Search name or phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        className="w-1/3 border border-gray-200 rounded-md text-xs py-1.5 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        value={selectedTownship}
                        onChange={(e) => setSelectedTownship(e.target.value)}
                      >
                        <option value="">All Townships</option>
                        {townships.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="overflow-y-auto flex-1 divide-y divide-gray-100 text-xs">
                      {filteredPersonas.length === 0 ? (
                        <div className="p-2 text-center text-gray-500">{t("pos.noCustomers")}</div>
                      ) : (
                        filteredPersonas.map((p) => (
                          <button
                            key={p._id}
                            type="button"
                            className={`w-full text-left p-2 hover:bg-primary/10 hover:text-primary-900 rounded transition-colors flex items-center justify-between ${
                              selectedCreditPersonId === p._id ? "bg-primary/10 text-primary-900 font-semibold" : "text-gray-700"
                            }`}
                            onClick={() => {
                              onCreditPersonChange(p._id);
                              setIsOpen(false);
                            }}
                          >
                            <div className="truncate">
                              <div>{p.name}</div>
                              {p.phone && <div className="text-[10px] text-gray-500">{p.phone}</div>}
                            </div>
                            {p.township && (
                              <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-normal">
                                {p.township}
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("pos.paymentMethod")}</label>
              <select
                className="payment-method-select w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
              >
                {(paymentType === "credit" ? PAYMENT_METHODS.credit : PAYMENT_METHODS.paid).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Option</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="pricingOption" checked={!useMarkup}
                    onChange={() => onUseMarkupChange(false)} className="mr-2" />
                  <span className="text-sm">Discount</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="pricingOption" checked={useMarkup}
                    onChange={() => onUseMarkupChange(true)} className="mr-2" />
                  <span className="text-sm">Markup</span>
                </label>
              </div>
            </div>

            {!useMarkup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("pos.discount")} (%)
                  <button onClick={onOpenDiscountCalc} className="ml-2 text-primary hover:text-primary-700 transition-colors" title="Calculate discount percentage">
                    <Calculator className="w-4 h-4 inline" />
                  </button>
                </label>
                <input type="number" min="0" max="100"
                  className="discount-input w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={discount} onChange={(e) => onDiscountChange(Number(e.target.value))}
                />
              </div>
            )}

            {useMarkup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Markup Amount (MMK)
                  <button onClick={onOpenMarkupCalc} className="ml-2 text-primary hover:text-primary-700 transition-colors" title="Add fixed markup amount">
                    <Calculator className="w-4 h-4 inline" />
                  </button>
                </label>
                <input type="number" min="0"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={markupAmount} onChange={(e) => onMarkupAmountChange(Number(e.target.value))}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("pos.paidAmount")} (MMK)
                {paymentType === "paid" && paymentMethod !== "FOC" && <span className="text-red-500">*</span>}
              </label>
              <input type="number" min="0" disabled={paymentMethod === "FOC"}
                className={`w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none ${paymentMethod === "FOC" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                value={paymentMethod === "FOC" ? 0 : paidAmount}
                onChange={(e) => onPaidAmountChange(Math.ceil(e.target.value === "" ? 0 : Number(e.target.value)))}
                placeholder={paymentMethod === "FOC" ? "0" : t("pos.enterPaidAmount")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("pos.note")} ({t("common.optional")})
              </label>
              <input type="text"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                value={note} onChange={(e) => onNoteChange(e.target.value)}
                placeholder={t("pos.notePlaceholder")}
              />
            </div>

            <div className="bg-[#F8F9FA] p-4 rounded-lg border border-[#E9ECEF] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("common.subtotal")}</span>
                <span>{subtotal.toLocaleString()} MMK</span>
              </div>
              {!useMarkup && discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t("common.discount")} ({discount}%)</span>
                  <span>-{combinedDiscountAmount.toLocaleString()} MMK</span>
                </div>
              )}
              {useMarkup && markupAmount > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span>Markup Amount</span>
                  <span>+{markupAmount.toLocaleString()} MMK</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>{t("common.total")}</span>
                <span>{total.toLocaleString()} MMK</span>
              </div>
              {paidAmount > 0 && paidAmount >= total && paymentType === "paid" && (
                <div className="flex justify-between text-sm text-[#4CAF50] font-medium">
                  <span>{t("common.change")}</span>
                  <span>{(paidAmount - total).toLocaleString()} MMK</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t bg-[#F8F9FA] space-y-2">
            <button onClick={onCheckout}
              disabled={cartItemCount === 0 || isProcessing || (paymentType === "paid" && paidAmount < total) || (paymentType === "credit" && paidAmount > total)}
              className="complete-sale-btn w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t("pos.processing")}</>
              ) : (
                <>{t("pos.completeSale")} • {total.toLocaleString()} MMK</>
              )}
            </button>
            <button onClick={onClose} className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              {t("common.cancel")}
            </button>
          </div>
        </div>
      </div>

      <MarkupCalculatorModal
        show={showMarkupCalculator}
        onClose={onCloseMarkupCalc}
        subtotal={subtotal}
        markupAmount={markupAmount}
        onApply={(amount) => { onMarkupAmountChange(amount); onCloseMarkupCalc(); }}
      />

      <DiscountCalculatorModal
        show={showDiscountCalculator}
        onClose={onCloseDiscountCalc}
        subtotal={subtotal}
        discountAmount={discountAmount}
        onDiscountAmountChange={onDiscountAmountChange}
        onApply={() => {
          if (discountAmount && Number(discountAmount) > 0) {
            const pct = ((Number(discountAmount) / subtotal) * 100).toFixed(2);
            onDiscountChange(Number(pct));
            onCloseDiscountCalc();
            onDiscountAmountChange("");
          }
        }}
      />
    </>
  );
};
