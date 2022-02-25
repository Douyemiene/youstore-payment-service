"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepo = void 0;
class PaymentRepo {
    constructor({ paymentModel }) {
        this.payments = paymentModel;
    }
    save(payment) {
        return __awaiter(this, void 0, void 0, function* () {
            //payment.paymentStatus = null;
            const { _id } = yield this.payments.create(payment);
            return _id.toString();
        });
    }
    getPaymentByRef(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.payments.findOne({ reference }).exec();
            return payment;
        });
    }
    // async getPaymentById(id: string): Promise<IPayment | null> {
    //   const payment = await this.payments.findById(id).exec();
    //   return payment;
    // }
    findByRefAndUpdate(reference, status) {
        return __awaiter(this, void 0, void 0, function* () {
            //an array?
            try {
                const payment = yield this.payments.findOneAndUpdate({ reference }, { status }, {
                    new: true,
                });
            }
            catch (err) {
                console.log("err in repo", err);
            }
        });
    }
}
exports.PaymentRepo = PaymentRepo;
exports.default = PaymentRepo;
