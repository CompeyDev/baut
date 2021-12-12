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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["REPLY"] = 0] = "REPLY";
    MessageType[MessageType["SEND"] = 1] = "SEND";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var MiscHelper = /** @class */ (function () {
    function MiscHelper() {
    }
    MiscHelper.sleep = function (milliseconds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, milliseconds); })];
            });
        });
    };
    MiscHelper.sendAndDelete = function (message, options) {
        return __awaiter(this, void 0, void 0, function () {
            var content, _a, secondsToWait, _b, messageType, reply;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        content = options.content, _a = options.secondsToWait, secondsToWait = _a === void 0 ? 5 : _a, _b = options.messageType, messageType = _b === void 0 ? MessageType.REPLY : _b;
                        if (!(messageType === MessageType.REPLY)) return [3 /*break*/, 2];
                        return [4 /*yield*/, message.reply(content)];
                    case 1:
                        reply = _c.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(messageType === MessageType.SEND)) return [3 /*break*/, 4];
                        return [4 /*yield*/, message.channel.send(content)];
                    case 3:
                        reply = _c.sent();
                        _c.label = 4;
                    case 4: return [4 /*yield*/, this.animateSecondsAndDelete(reply, secondsToWait)];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MiscHelper.animateSecondsAndDelete = function (message, secondsToWait) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.animateSeconds(message, secondsToWait)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, message["delete"]()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MiscHelper.animateSeconds = function (message, secondsToWait) {
        return __awaiter(this, void 0, void 0, function () {
            var emojis;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (secondsToWait < this.MINIMUM_SECONDS_TO_WAIT ||
                            secondsToWait > this.MAXIMUM_SECONDS_TO_WAIT) {
                            throw new Error("secondsToWait must be between \n            " + this.MINIMUM_SECONDS_TO_WAIT + " and " + this.MAXIMUM_SECONDS_TO_WAIT);
                        }
                        emojis = [
                            "1️⃣",
                            "2️⃣",
                            "3️⃣",
                            "4️⃣",
                            "5️⃣",
                            "6️⃣",
                            "7️⃣",
                            "8️⃣",
                            "9️⃣",
                            "🔟",
                        ];
                        _a.label = 1;
                    case 1:
                        if (!(secondsToWait > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, message.react(emojis[secondsToWait - 1])];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, MiscHelper.sleep(1000)];
                    case 3:
                        _a.sent();
                        secondsToWait--;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MiscHelper.MINIMUM_SECONDS_TO_WAIT = 1;
    MiscHelper.MAXIMUM_SECONDS_TO_WAIT = 10;
    return MiscHelper;
}());
exports["default"] = MiscHelper;
