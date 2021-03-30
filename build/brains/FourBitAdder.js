"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("../classes");
const times_1 = __importDefault(require("lodash/times"));
const conversions_1 = require("../utils/conversions");
const BITS = 2;
const COMBOS = 2 ** BITS;
/*
Four bit adder, or 2bit+2bit
Two bits can do 0-3 aka 0-3+0-3, or range 0-6
6 needs 3 bits as output...
*/
let TwoDigitAdder = /** @class */ (() => {
    class TwoDigitAdder extends classes_1.Brain {
        static build() {
            return classes_1.Brain.buildFromInAndOut(4, 3);
        }
    }
    TwoDigitAdder.topScore = COMBOS ** 2; // Each bit combination added with each bit combination
    TwoDigitAdder.scoreFn = (brain) => {
        let score = 0;
        // Add up each digit against every other
        times_1.default(COMBOS, (n1) => {
            times_1.default(COMBOS, (n2) => {
                try {
                    brain.reset();
                    const input = [...conversions_1.digitToTwoBits(n1), ...conversions_1.digitToTwoBits(n2)];
                    const output = brain.processInput(input);
                    const outNum = conversions_1.halfByteToDigit([false, ...output]);
                    const answer = n1 + n2;
                    if (outNum === answer) {
                        // console.log(`${n1}+${n2}=${answer}`)
                        score++;
                    }
                }
                catch (e) {
                    console.error('Score attempt failed:', e);
                }
            });
        });
        return score;
    };
    return TwoDigitAdder;
})();
exports.default = TwoDigitAdder;
