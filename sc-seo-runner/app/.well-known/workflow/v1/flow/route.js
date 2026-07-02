// biome-ignore-all lint: generated file
/* eslint-disable */
import { workflowEntrypoint } from 'workflow/runtime';

const workflowCode = `globalThis.__private_workflows = new Map();
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/postgres-array@2.0.0/node_modules/postgres-array/index.js
var require_postgres_array = __commonJS({
  "node_modules/.pnpm/postgres-array@2.0.0/node_modules/postgres-array/index.js"(exports) {
    "use strict";
    exports.parse = function(source, transform) {
      return new ArrayParser(source, transform).parse();
    };
    var ArrayParser = class _ArrayParser {
      static {
        __name(this, "ArrayParser");
      }
      constructor(source, transform) {
        this.source = source;
        this.transform = transform || identity;
        this.position = 0;
        this.entries = [];
        this.recorded = [];
        this.dimension = 0;
      }
      isEof() {
        return this.position >= this.source.length;
      }
      nextCharacter() {
        var character = this.source[this.position++];
        if (character === "\\\\") {
          return {
            value: this.source[this.position++],
            escaped: true
          };
        }
        return {
          value: character,
          escaped: false
        };
      }
      record(character) {
        this.recorded.push(character);
      }
      newEntry(includeEmpty) {
        var entry;
        if (this.recorded.length > 0 || includeEmpty) {
          entry = this.recorded.join("");
          if (entry === "NULL" && !includeEmpty) {
            entry = null;
          }
          if (entry !== null) entry = this.transform(entry);
          this.entries.push(entry);
          this.recorded = [];
        }
      }
      consumeDimensions() {
        if (this.source[0] === "[") {
          while (!this.isEof()) {
            var char = this.nextCharacter();
            if (char.value === "=") break;
          }
        }
      }
      parse(nested) {
        var character, parser, quote;
        this.consumeDimensions();
        while (!this.isEof()) {
          character = this.nextCharacter();
          if (character.value === "{" && !quote) {
            this.dimension++;
            if (this.dimension > 1) {
              parser = new _ArrayParser(this.source.substr(this.position - 1), this.transform);
              this.entries.push(parser.parse(true));
              this.position += parser.position - 2;
            }
          } else if (character.value === "}" && !quote) {
            this.dimension--;
            if (!this.dimension) {
              this.newEntry();
              if (nested) return this.entries;
            }
          } else if (character.value === '"' && !character.escaped) {
            if (quote) this.newEntry(true);
            quote = !quote;
          } else if (character.value === "," && !quote) {
            this.newEntry();
          } else {
            this.record(character.value);
          }
        }
        if (this.dimension !== 0) {
          throw new Error("array dimension not balanced");
        }
        return this.entries;
      }
    };
    function identity(value) {
      return value;
    }
    __name(identity, "identity");
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/arrayParser.js
var require_arrayParser = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/arrayParser.js"(exports, module2) {
    "use strict";
    var array = require_postgres_array();
    module2.exports = {
      create: /* @__PURE__ */ __name(function(source, transform) {
        return {
          parse: /* @__PURE__ */ __name(function() {
            return array.parse(source, transform);
          }, "parse")
        };
      }, "create")
    };
  }
});

// node_modules/.pnpm/postgres-date@1.0.7/node_modules/postgres-date/index.js
var require_postgres_date = __commonJS({
  "node_modules/.pnpm/postgres-date@1.0.7/node_modules/postgres-date/index.js"(exports, module2) {
    "use strict";
    var DATE_TIME = /(\\d{1,})-(\\d{2})-(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2})(\\.\\d{1,})?.*?( BC)?\$/;
    var DATE = /^(\\d{1,})-(\\d{2})-(\\d{2})( BC)?\$/;
    var TIME_ZONE = /([Z+-])(\\d{2})?:?(\\d{2})?:?(\\d{2})?/;
    var INFINITY = /^-?infinity\$/;
    module2.exports = /* @__PURE__ */ __name(function parseDate(isoDate) {
      if (INFINITY.test(isoDate)) {
        return Number(isoDate.replace("i", "I"));
      }
      var matches = DATE_TIME.exec(isoDate);
      if (!matches) {
        return getDate(isoDate) || null;
      }
      var isBC = !!matches[8];
      var year = parseInt(matches[1], 10);
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var hour = parseInt(matches[4], 10);
      var minute = parseInt(matches[5], 10);
      var second = parseInt(matches[6], 10);
      var ms = matches[7];
      ms = ms ? 1e3 * parseFloat(ms) : 0;
      var date;
      var offset = timeZoneOffset(isoDate);
      if (offset != null) {
        date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
        if (is0To99(year)) {
          date.setUTCFullYear(year);
        }
        if (offset !== 0) {
          date.setTime(date.getTime() - offset);
        }
      } else {
        date = new Date(year, month, day, hour, minute, second, ms);
        if (is0To99(year)) {
          date.setFullYear(year);
        }
      }
      return date;
    }, "parseDate");
    function getDate(isoDate) {
      var matches = DATE.exec(isoDate);
      if (!matches) {
        return;
      }
      var year = parseInt(matches[1], 10);
      var isBC = !!matches[4];
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var date = new Date(year, month, day);
      if (is0To99(year)) {
        date.setFullYear(year);
      }
      return date;
    }
    __name(getDate, "getDate");
    function timeZoneOffset(isoDate) {
      if (isoDate.endsWith("+00")) {
        return 0;
      }
      var zone = TIME_ZONE.exec(isoDate.split(" ")[1]);
      if (!zone) return;
      var type = zone[1];
      if (type === "Z") {
        return 0;
      }
      var sign = type === "-" ? -1 : 1;
      var offset = parseInt(zone[2], 10) * 3600 + parseInt(zone[3] || 0, 10) * 60 + parseInt(zone[4] || 0, 10);
      return offset * sign * 1e3;
    }
    __name(timeZoneOffset, "timeZoneOffset");
    function bcYearToNegativeYear(year) {
      return -(year - 1);
    }
    __name(bcYearToNegativeYear, "bcYearToNegativeYear");
    function is0To99(num) {
      return num >= 0 && num < 100;
    }
    __name(is0To99, "is0To99");
  }
});

// node_modules/.pnpm/xtend@4.0.2/node_modules/xtend/mutable.js
var require_mutable = __commonJS({
  "node_modules/.pnpm/xtend@4.0.2/node_modules/xtend/mutable.js"(exports, module2) {
    "use strict";
    module2.exports = extend;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function extend(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }
    __name(extend, "extend");
  }
});

// node_modules/.pnpm/postgres-interval@1.2.0/node_modules/postgres-interval/index.js
var require_postgres_interval = __commonJS({
  "node_modules/.pnpm/postgres-interval@1.2.0/node_modules/postgres-interval/index.js"(exports, module2) {
    "use strict";
    var extend = require_mutable();
    module2.exports = PostgresInterval;
    function PostgresInterval(raw) {
      if (!(this instanceof PostgresInterval)) {
        return new PostgresInterval(raw);
      }
      extend(this, parse(raw));
    }
    __name(PostgresInterval, "PostgresInterval");
    var properties = [
      "seconds",
      "minutes",
      "hours",
      "days",
      "months",
      "years"
    ];
    PostgresInterval.prototype.toPostgres = function() {
      var filtered = properties.filter(this.hasOwnProperty, this);
      if (this.milliseconds && filtered.indexOf("seconds") < 0) {
        filtered.push("seconds");
      }
      if (filtered.length === 0) return "0";
      return filtered.map(function(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/\\.?0+\$/, "");
        }
        return value + " " + property;
      }, this).join(" ");
    };
    var propertiesISOEquivalent = {
      years: "Y",
      months: "M",
      days: "D",
      hours: "H",
      minutes: "M",
      seconds: "S"
    };
    var dateProperties = [
      "years",
      "months",
      "days"
    ];
    var timeProperties = [
      "hours",
      "minutes",
      "seconds"
    ];
    PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function() {
      var datePart = dateProperties.map(buildProperty, this).join("");
      var timePart = timeProperties.map(buildProperty, this).join("");
      return "P" + datePart + "T" + timePart;
      function buildProperty(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/0+\$/, "");
        }
        return value + propertiesISOEquivalent[property];
      }
      __name(buildProperty, "buildProperty");
    };
    var NUMBER = "([+-]?\\\\d+)";
    var YEAR = NUMBER + "\\\\s+years?";
    var MONTH = NUMBER + "\\\\s+mons?";
    var DAY = NUMBER + "\\\\s+days?";
    var TIME = "([+-])?([\\\\d]*):(\\\\d\\\\d):(\\\\d\\\\d)\\\\.?(\\\\d{1,6})?";
    var INTERVAL = new RegExp([
      YEAR,
      MONTH,
      DAY,
      TIME
    ].map(function(regexString) {
      return "(" + regexString + ")?";
    }).join("\\\\s*"));
    var positions = {
      years: 2,
      months: 4,
      days: 6,
      hours: 9,
      minutes: 10,
      seconds: 11,
      milliseconds: 12
    };
    var negatives = [
      "hours",
      "minutes",
      "seconds",
      "milliseconds"
    ];
    function parseMilliseconds(fraction) {
      var microseconds = fraction + "000000".slice(fraction.length);
      return parseInt(microseconds, 10) / 1e3;
    }
    __name(parseMilliseconds, "parseMilliseconds");
    function parse(interval) {
      if (!interval) return {};
      var matches = INTERVAL.exec(interval);
      var isNegative = matches[8] === "-";
      return Object.keys(positions).reduce(function(parsed, property) {
        var position = positions[property];
        var value = matches[position];
        if (!value) return parsed;
        value = property === "milliseconds" ? parseMilliseconds(value) : parseInt(value, 10);
        if (!value) return parsed;
        if (isNegative && ~negatives.indexOf(property)) {
          value *= -1;
        }
        parsed[property] = value;
        return parsed;
      }, {});
    }
    __name(parse, "parse");
  }
});

// node_modules/.pnpm/postgres-bytea@1.0.1/node_modules/postgres-bytea/index.js
var require_postgres_bytea = __commonJS({
  "node_modules/.pnpm/postgres-bytea@1.0.1/node_modules/postgres-bytea/index.js"(exports, module2) {
    "use strict";
    var bufferFrom = Buffer.from || Buffer;
    module2.exports = /* @__PURE__ */ __name(function parseBytea(input) {
      if (/^\\\\x/.test(input)) {
        return bufferFrom(input.substr(2), "hex");
      }
      var output = "";
      var i = 0;
      while (i < input.length) {
        if (input[i] !== "\\\\") {
          output += input[i];
          ++i;
        } else {
          if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
            output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
            i += 4;
          } else {
            var backslashes = 1;
            while (i + backslashes < input.length && input[i + backslashes] === "\\\\") {
              backslashes++;
            }
            for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
              output += "\\\\";
            }
            i += Math.floor(backslashes / 2) * 2;
          }
        }
      }
      return bufferFrom(output, "binary");
    }, "parseBytea");
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/textParsers.js
var require_textParsers = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/textParsers.js"(exports, module2) {
    "use strict";
    var array = require_postgres_array();
    var arrayParser = require_arrayParser();
    var parseDate = require_postgres_date();
    var parseInterval = require_postgres_interval();
    var parseByteA = require_postgres_bytea();
    function allowNull(fn) {
      return /* @__PURE__ */ __name(function nullAllowed(value) {
        if (value === null) return value;
        return fn(value);
      }, "nullAllowed");
    }
    __name(allowNull, "allowNull");
    function parseBool(value) {
      if (value === null) return value;
      return value === "TRUE" || value === "t" || value === "true" || value === "y" || value === "yes" || value === "on" || value === "1";
    }
    __name(parseBool, "parseBool");
    function parseBoolArray(value) {
      if (!value) return null;
      return array.parse(value, parseBool);
    }
    __name(parseBoolArray, "parseBoolArray");
    function parseBaseTenInt(string) {
      return parseInt(string, 10);
    }
    __name(parseBaseTenInt, "parseBaseTenInt");
    function parseIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(parseBaseTenInt));
    }
    __name(parseIntegerArray, "parseIntegerArray");
    function parseBigIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(function(entry) {
        return parseBigInteger(entry).trim();
      }));
    }
    __name(parseBigIntegerArray, "parseBigIntegerArray");
    var parsePointArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parsePoint(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parsePointArray");
    var parseFloatArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseFloat(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parseFloatArray");
    var parseStringArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value);
      return p.parse();
    }, "parseStringArray");
    var parseDateArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseDate(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parseDateArray");
    var parseIntervalArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseInterval(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parseIntervalArray");
    var parseByteAArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(parseByteA));
    }, "parseByteAArray");
    var parseInteger = /* @__PURE__ */ __name(function(value) {
      return parseInt(value, 10);
    }, "parseInteger");
    var parseBigInteger = /* @__PURE__ */ __name(function(value) {
      var valStr = String(value);
      if (/^\\d+\$/.test(valStr)) {
        return valStr;
      }
      return value;
    }, "parseBigInteger");
    var parseJsonArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(JSON.parse));
    }, "parseJsonArray");
    var parsePoint = /* @__PURE__ */ __name(function(value) {
      if (value[0] !== "(") {
        return null;
      }
      value = value.substring(1, value.length - 1).split(",");
      return {
        x: parseFloat(value[0]),
        y: parseFloat(value[1])
      };
    }, "parsePoint");
    var parseCircle = /* @__PURE__ */ __name(function(value) {
      if (value[0] !== "<" && value[1] !== "(") {
        return null;
      }
      var point = "(";
      var radius = "";
      var pointParsed = false;
      for (var i = 2; i < value.length - 1; i++) {
        if (!pointParsed) {
          point += value[i];
        }
        if (value[i] === ")") {
          pointParsed = true;
          continue;
        } else if (!pointParsed) {
          continue;
        }
        if (value[i] === ",") {
          continue;
        }
        radius += value[i];
      }
      var result = parsePoint(point);
      result.radius = parseFloat(radius);
      return result;
    }, "parseCircle");
    var init = /* @__PURE__ */ __name(function(register) {
      register(20, parseBigInteger);
      register(21, parseInteger);
      register(23, parseInteger);
      register(26, parseInteger);
      register(700, parseFloat);
      register(701, parseFloat);
      register(16, parseBool);
      register(1082, parseDate);
      register(1114, parseDate);
      register(1184, parseDate);
      register(600, parsePoint);
      register(651, parseStringArray);
      register(718, parseCircle);
      register(1e3, parseBoolArray);
      register(1001, parseByteAArray);
      register(1005, parseIntegerArray);
      register(1007, parseIntegerArray);
      register(1028, parseIntegerArray);
      register(1016, parseBigIntegerArray);
      register(1017, parsePointArray);
      register(1021, parseFloatArray);
      register(1022, parseFloatArray);
      register(1231, parseFloatArray);
      register(1014, parseStringArray);
      register(1015, parseStringArray);
      register(1008, parseStringArray);
      register(1009, parseStringArray);
      register(1040, parseStringArray);
      register(1041, parseStringArray);
      register(1115, parseDateArray);
      register(1182, parseDateArray);
      register(1185, parseDateArray);
      register(1186, parseInterval);
      register(1187, parseIntervalArray);
      register(17, parseByteA);
      register(114, JSON.parse.bind(JSON));
      register(3802, JSON.parse.bind(JSON));
      register(199, parseJsonArray);
      register(3807, parseJsonArray);
      register(3907, parseStringArray);
      register(2951, parseStringArray);
      register(791, parseStringArray);
      register(1183, parseStringArray);
      register(1270, parseStringArray);
    }, "init");
    module2.exports = {
      init
    };
  }
});

// node_modules/.pnpm/pg-int8@1.0.1/node_modules/pg-int8/index.js
var require_pg_int8 = __commonJS({
  "node_modules/.pnpm/pg-int8@1.0.1/node_modules/pg-int8/index.js"(exports, module2) {
    "use strict";
    var BASE = 1e6;
    function readInt8(buffer) {
      var high = buffer.readInt32BE(0);
      var low = buffer.readUInt32BE(4);
      var sign = "";
      if (high < 0) {
        high = ~high + (low === 0);
        low = ~low + 1 >>> 0;
        sign = "-";
      }
      var result = "";
      var carry;
      var t;
      var digits;
      var pad;
      var l;
      var i;
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        t = 4294967296 * carry + low;
        digits = "" + t % BASE;
        return sign + digits + result;
      }
    }
    __name(readInt8, "readInt8");
    module2.exports = readInt8;
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/binaryParsers.js
var require_binaryParsers = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/binaryParsers.js"(exports, module2) {
    "use strict";
    var parseInt64 = require_pg_int8();
    var parseBits = /* @__PURE__ */ __name(function(data, bits, offset, invert, callback) {
      offset = offset || 0;
      invert = invert || false;
      callback = callback || function(lastValue, newValue, bits2) {
        return lastValue * Math.pow(2, bits2) + newValue;
      };
      var offsetBytes = offset >> 3;
      var inv = /* @__PURE__ */ __name(function(value) {
        if (invert) {
          return ~value & 255;
        }
        return value;
      }, "inv");
      var mask = 255;
      var firstBits = 8 - offset % 8;
      if (bits < firstBits) {
        mask = 255 << 8 - bits & 255;
        firstBits = bits;
      }
      if (offset) {
        mask = mask >> offset % 8;
      }
      var result = 0;
      if (offset % 8 + bits >= 8) {
        result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
      }
      var bytes = bits + offset >> 3;
      for (var i = offsetBytes + 1; i < bytes; i++) {
        result = callback(result, inv(data[i]), 8);
      }
      var lastBits = (bits + offset) % 8;
      if (lastBits > 0) {
        result = callback(result, inv(data[bytes]) >> 8 - lastBits, lastBits);
      }
      return result;
    }, "parseBits");
    var parseFloatFromBits = /* @__PURE__ */ __name(function(data, precisionBits, exponentBits) {
      var bias = Math.pow(2, exponentBits - 1) - 1;
      var sign = parseBits(data, 1);
      var exponent = parseBits(data, exponentBits, 1);
      if (exponent === 0) {
        return 0;
      }
      var precisionBitsCounter = 1;
      var parsePrecisionBits = /* @__PURE__ */ __name(function(lastValue, newValue, bits) {
        if (lastValue === 0) {
          lastValue = 1;
        }
        for (var i = 1; i <= bits; i++) {
          precisionBitsCounter /= 2;
          if ((newValue & 1 << bits - i) > 0) {
            lastValue += precisionBitsCounter;
          }
        }
        return lastValue;
      }, "parsePrecisionBits");
      var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);
      if (exponent == Math.pow(2, exponentBits + 1) - 1) {
        if (mantissa === 0) {
          return sign === 0 ? Infinity : -Infinity;
        }
        return NaN;
      }
      return (sign === 0 ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
    }, "parseFloatFromBits");
    var parseInt16 = /* @__PURE__ */ __name(function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 15, 1, true) + 1);
      }
      return parseBits(value, 15, 1);
    }, "parseInt16");
    var parseInt32 = /* @__PURE__ */ __name(function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 31, 1, true) + 1);
      }
      return parseBits(value, 31, 1);
    }, "parseInt32");
    var parseFloat32 = /* @__PURE__ */ __name(function(value) {
      return parseFloatFromBits(value, 23, 8);
    }, "parseFloat32");
    var parseFloat64 = /* @__PURE__ */ __name(function(value) {
      return parseFloatFromBits(value, 52, 11);
    }, "parseFloat64");
    var parseNumeric = /* @__PURE__ */ __name(function(value) {
      var sign = parseBits(value, 16, 32);
      if (sign == 49152) {
        return NaN;
      }
      var weight = Math.pow(1e4, parseBits(value, 16, 16));
      var result = 0;
      var digits = [];
      var ndigits = parseBits(value, 16);
      for (var i = 0; i < ndigits; i++) {
        result += parseBits(value, 16, 64 + 16 * i) * weight;
        weight /= 1e4;
      }
      var scale = Math.pow(10, parseBits(value, 16, 48));
      return (sign === 0 ? 1 : -1) * Math.round(result * scale) / scale;
    }, "parseNumeric");
    var parseDate = /* @__PURE__ */ __name(function(isUTC, value) {
      var sign = parseBits(value, 1);
      var rawValue = parseBits(value, 63, 1);
      var result = new Date((sign === 0 ? 1 : -1) * rawValue / 1e3 + 9466848e5);
      if (!isUTC) {
        result.setTime(result.getTime() + result.getTimezoneOffset() * 6e4);
      }
      result.usec = rawValue % 1e3;
      result.getMicroSeconds = function() {
        return this.usec;
      };
      result.setMicroSeconds = function(value2) {
        this.usec = value2;
      };
      result.getUTCMicroSeconds = function() {
        return this.usec;
      };
      return result;
    }, "parseDate");
    var parseArray = /* @__PURE__ */ __name(function(value) {
      var dim = parseBits(value, 32);
      var flags = parseBits(value, 32, 32);
      var elementType = parseBits(value, 32, 64);
      var offset = 96;
      var dims = [];
      for (var i = 0; i < dim; i++) {
        dims[i] = parseBits(value, 32, offset);
        offset += 32;
        offset += 32;
      }
      var parseElement = /* @__PURE__ */ __name(function(elementType2) {
        var length = parseBits(value, 32, offset);
        offset += 32;
        if (length == 4294967295) {
          return null;
        }
        var result;
        if (elementType2 == 23 || elementType2 == 20) {
          result = parseBits(value, length * 8, offset);
          offset += length * 8;
          return result;
        } else if (elementType2 == 25) {
          result = value.toString(this.encoding, offset >> 3, (offset += length << 3) >> 3);
          return result;
        } else {
          console.log("ERROR: ElementType not implemented: " + elementType2);
        }
      }, "parseElement");
      var parse = /* @__PURE__ */ __name(function(dimension, elementType2) {
        var array = [];
        var i2;
        if (dimension.length > 1) {
          var count = dimension.shift();
          for (i2 = 0; i2 < count; i2++) {
            array[i2] = parse(dimension, elementType2);
          }
          dimension.unshift(count);
        } else {
          for (i2 = 0; i2 < dimension[0]; i2++) {
            array[i2] = parseElement(elementType2);
          }
        }
        return array;
      }, "parse");
      return parse(dims, elementType);
    }, "parseArray");
    var parseText = /* @__PURE__ */ __name(function(value) {
      return value.toString("utf8");
    }, "parseText");
    var parseBool = /* @__PURE__ */ __name(function(value) {
      if (value === null) return null;
      return parseBits(value, 8) > 0;
    }, "parseBool");
    var init = /* @__PURE__ */ __name(function(register) {
      register(20, parseInt64);
      register(21, parseInt16);
      register(23, parseInt32);
      register(26, parseInt32);
      register(1700, parseNumeric);
      register(700, parseFloat32);
      register(701, parseFloat64);
      register(16, parseBool);
      register(1114, parseDate.bind(null, false));
      register(1184, parseDate.bind(null, true));
      register(1e3, parseArray);
      register(1007, parseArray);
      register(1016, parseArray);
      register(1008, parseArray);
      register(1009, parseArray);
      register(25, parseText);
    }, "init");
    module2.exports = {
      init
    };
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/builtins.js
var require_builtins = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/builtins.js"(exports, module2) {
    "use strict";
    module2.exports = {
      BOOL: 16,
      BYTEA: 17,
      CHAR: 18,
      INT8: 20,
      INT2: 21,
      INT4: 23,
      REGPROC: 24,
      TEXT: 25,
      OID: 26,
      TID: 27,
      XID: 28,
      CID: 29,
      JSON: 114,
      XML: 142,
      PG_NODE_TREE: 194,
      SMGR: 210,
      PATH: 602,
      POLYGON: 604,
      CIDR: 650,
      FLOAT4: 700,
      FLOAT8: 701,
      ABSTIME: 702,
      RELTIME: 703,
      TINTERVAL: 704,
      CIRCLE: 718,
      MACADDR8: 774,
      MONEY: 790,
      MACADDR: 829,
      INET: 869,
      ACLITEM: 1033,
      BPCHAR: 1042,
      VARCHAR: 1043,
      DATE: 1082,
      TIME: 1083,
      TIMESTAMP: 1114,
      TIMESTAMPTZ: 1184,
      INTERVAL: 1186,
      TIMETZ: 1266,
      BIT: 1560,
      VARBIT: 1562,
      NUMERIC: 1700,
      REFCURSOR: 1790,
      REGPROCEDURE: 2202,
      REGOPER: 2203,
      REGOPERATOR: 2204,
      REGCLASS: 2205,
      REGTYPE: 2206,
      UUID: 2950,
      TXID_SNAPSHOT: 2970,
      PG_LSN: 3220,
      PG_NDISTINCT: 3361,
      PG_DEPENDENCIES: 3402,
      TSVECTOR: 3614,
      TSQUERY: 3615,
      GTSVECTOR: 3642,
      REGCONFIG: 3734,
      REGDICTIONARY: 3769,
      JSONB: 3802,
      REGNAMESPACE: 4089,
      REGROLE: 4096
    };
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/index.js
var require_pg_types = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/index.js"(exports) {
    "use strict";
    var textParsers = require_textParsers();
    var binaryParsers = require_binaryParsers();
    var arrayParser = require_arrayParser();
    var builtinTypes = require_builtins();
    exports.getTypeParser = getTypeParser;
    exports.setTypeParser = setTypeParser;
    exports.arrayParser = arrayParser;
    exports.builtins = builtinTypes;
    var typeParsers = {
      text: {},
      binary: {}
    };
    function noParse(val) {
      return String(val);
    }
    __name(noParse, "noParse");
    function getTypeParser(oid, format) {
      format = format || "text";
      if (!typeParsers[format]) {
        return noParse;
      }
      return typeParsers[format][oid] || noParse;
    }
    __name(getTypeParser, "getTypeParser");
    function setTypeParser(oid, format, parseFn) {
      if (typeof format == "function") {
        parseFn = format;
        format = "text";
      }
      typeParsers[format][oid] = parseFn;
    }
    __name(setTypeParser, "setTypeParser");
    textParsers.init(function(oid, converter) {
      typeParsers.text[oid] = converter;
    });
    binaryParsers.init(function(oid, converter) {
      typeParsers.binary[oid] = converter;
    });
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/defaults.js
var require_defaults = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/defaults.js"(exports, module2) {
    "use strict";
    var user;
    try {
      user = process.platform === "win32" ? process.env.USERNAME : process.env.USER;
    } catch {
    }
    module2.exports = {
      // database host. defaults to localhost
      host: "localhost",
      // database user's name
      user,
      // name of database to connect
      database: void 0,
      // database user's password
      password: null,
      // a Postgres connection string to be used instead of setting individual connection items
      // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
      // in the defaults object.
      connectionString: void 0,
      // database port
      port: 5432,
      // number of rows to return at a time from a prepared statement's
      // portal. 0 will return all rows at once
      rows: 0,
      // binary result mode
      binary: false,
      // Connection pool options - see https://github.com/brianc/node-pg-pool
      // number of connections to use in connection pool
      // 0 will disable connection pooling
      max: 10,
      // max milliseconds a client can go unused before it is removed
      // from the pool and destroyed
      idleTimeoutMillis: 3e4,
      client_encoding: "",
      ssl: false,
      // SSL negotiation style: 'postgres' (traditional SSLRequest) or 'direct'
      sslnegotiation: void 0,
      application_name: void 0,
      fallback_application_name: void 0,
      options: void 0,
      parseInputDatesAsUTC: false,
      // max milliseconds any query using this connection will execute for before timing out in error.
      // false=unlimited
      statement_timeout: false,
      // Abort any statement that waits longer than the specified duration in milliseconds while attempting to acquire a lock.
      // false=unlimited
      lock_timeout: false,
      // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
      // false=unlimited
      idle_in_transaction_session_timeout: false,
      // max milliseconds to wait for query to complete (client side)
      query_timeout: false,
      connect_timeout: 0,
      keepalives: 1,
      keepalives_idle: 0
    };
    var pgTypes = require_pg_types();
    var parseBigInteger = pgTypes.getTypeParser(20, "text");
    var parseBigIntegerArray = pgTypes.getTypeParser(1016, "text");
    module2.exports.__defineSetter__("parseInt8", function(val) {
      pgTypes.setTypeParser(20, "text", val ? pgTypes.getTypeParser(23, "text") : parseBigInteger);
      pgTypes.setTypeParser(1016, "text", val ? pgTypes.getTypeParser(1007, "text") : parseBigIntegerArray);
    });
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/utils.js
var require_utils = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/utils.js"(exports, module2) {
    "use strict";
    var defaults2 = require_defaults();
    var { isDate } = require("util/types");
    function escapeElement(elementRepresentation) {
      const escaped = elementRepresentation.replace(/\\\\/g, "\\\\\\\\").replace(/"/g, '\\\\"');
      return '"' + escaped + '"';
    }
    __name(escapeElement, "escapeElement");
    function arrayString(val) {
      let result = "{";
      for (let i = 0; i < val.length; i++) {
        if (i > 0) {
          result += ",";
        }
        let item = val[i];
        if (item == null) {
          result += "NULL";
        } else if (Array.isArray(item)) {
          result += arrayString(item);
        } else if (ArrayBuffer.isView(item)) {
          if (!(item instanceof Buffer)) {
            item = Buffer.from(item.buffer, item.byteOffset, item.byteLength);
          }
          result += "\\\\\\\\x" + item.toString("hex");
        } else {
          result += escapeElement(prepareValue(item));
        }
      }
      result += "}";
      return result;
    }
    __name(arrayString, "arrayString");
    var prepareValue = /* @__PURE__ */ __name(function(val, seen) {
      if (val == null) {
        return null;
      }
      if (typeof val === "object") {
        if (val instanceof Buffer) {
          return val;
        }
        if (ArrayBuffer.isView(val)) {
          return Buffer.from(val.buffer, val.byteOffset, val.byteLength);
        }
        if (isDate(val)) {
          if (defaults2.parseInputDatesAsUTC) {
            return dateToStringUTC(val);
          } else {
            return dateToString(val);
          }
        }
        if (Array.isArray(val)) {
          return arrayString(val);
        }
        return prepareObject(val, seen);
      }
      return val.toString();
    }, "prepareValue");
    function prepareObject(val, seen) {
      if (val && typeof val.toPostgres === "function") {
        seen = seen || [];
        if (seen.indexOf(val) !== -1) {
          throw new Error('circular reference detected while preparing "' + val + '" for query');
        }
        seen.push(val);
        return prepareValue(val.toPostgres(prepareValue), seen);
      }
      return JSON.stringify(val);
    }
    __name(prepareObject, "prepareObject");
    function dateToString(date) {
      let offset = -date.getTimezoneOffset();
      let year = date.getFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + String(date.getMilliseconds()).padStart(3, "0");
      if (offset < 0) {
        ret += "-";
        offset *= -1;
      } else {
        ret += "+";
      }
      ret += String(Math.floor(offset / 60)).padStart(2, "0") + ":" + String(offset % 60).padStart(2, "0");
      if (isBCYear) ret += " BC";
      return ret;
    }
    __name(dateToString, "dateToString");
    function dateToStringUTC(date) {
      let year = date.getUTCFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0") + "T" + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0") + ":" + String(date.getUTCSeconds()).padStart(2, "0") + "." + String(date.getUTCMilliseconds()).padStart(3, "0");
      ret += "+00:00";
      if (isBCYear) ret += " BC";
      return ret;
    }
    __name(dateToStringUTC, "dateToStringUTC");
    function normalizeQueryConfig(config, values, callback) {
      config = typeof config === "string" ? {
        text: config
      } : config;
      if (values) {
        if (typeof values === "function") {
          config.callback = values;
        } else {
          config.values = values;
        }
      }
      if (callback) {
        config.callback = callback;
      }
      return config;
    }
    __name(normalizeQueryConfig, "normalizeQueryConfig");
    var escapeIdentifier2 = /* @__PURE__ */ __name(function(str) {
      return '"' + str.replace(/"/g, '""') + '"';
    }, "escapeIdentifier");
    var escapeLiteral2 = /* @__PURE__ */ __name(function(str) {
      let hasBackslash = false;
      let escaped = "'";
      if (str == null) {
        return "''";
      }
      if (typeof str !== "string") {
        return "''";
      }
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "'") {
          escaped += c + c;
        } else if (c === "\\\\") {
          escaped += c + c;
          hasBackslash = true;
        } else {
          escaped += c;
        }
      }
      escaped += "'";
      if (hasBackslash === true) {
        escaped = " E" + escaped;
      }
      return escaped;
    }, "escapeLiteral");
    module2.exports = {
      prepareValue: /* @__PURE__ */ __name(function prepareValueWrapper(value) {
        return prepareValue(value);
      }, "prepareValueWrapper"),
      normalizeQueryConfig,
      escapeIdentifier: escapeIdentifier2,
      escapeLiteral: escapeLiteral2
    };
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/crypto/utils.js
var require_utils2 = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/crypto/utils.js"(exports, module2) {
    "use strict";
    var nodeCrypto = require("crypto");
    module2.exports = {
      postgresMd5PasswordHash,
      randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
    var webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
    var subtleCrypto = webCrypto.subtle;
    var textEncoder = new TextEncoder();
    function randomBytes(length) {
      return webCrypto.getRandomValues(Buffer.alloc(length));
    }
    __name(randomBytes, "randomBytes");
    async function md5(string) {
      try {
        return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
      } catch (e) {
        const data = typeof string === "string" ? textEncoder.encode(string) : string;
        const hash = await subtleCrypto.digest("MD5", data);
        return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    }
    __name(md5, "md5");
    async function postgresMd5PasswordHash(user, password, salt) {
      const inner = await md5(password + user);
      const outer = await md5(Buffer.concat([
        Buffer.from(inner),
        salt
      ]));
      return "md5" + outer;
    }
    __name(postgresMd5PasswordHash, "postgresMd5PasswordHash");
    async function sha256(text) {
      return await subtleCrypto.digest("SHA-256", text);
    }
    __name(sha256, "sha256");
    async function hashByName(hashName, text) {
      return await subtleCrypto.digest(hashName, text);
    }
    __name(hashByName, "hashByName");
    async function hmacSha256(keyBuffer, msg) {
      const key = await subtleCrypto.importKey("raw", keyBuffer, {
        name: "HMAC",
        hash: "SHA-256"
      }, false, [
        "sign"
      ]);
      return await subtleCrypto.sign("HMAC", key, textEncoder.encode(msg));
    }
    __name(hmacSha256, "hmacSha256");
    async function deriveKey(password, salt, iterations) {
      const key = await subtleCrypto.importKey("raw", textEncoder.encode(password), "PBKDF2", false, [
        "deriveBits"
      ]);
      const params = {
        name: "PBKDF2",
        hash: "SHA-256",
        salt,
        iterations
      };
      return await subtleCrypto.deriveBits(params, key, 32 * 8, [
        "deriveBits"
      ]);
    }
    __name(deriveKey, "deriveKey");
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/crypto/cert-signatures.js
var require_cert_signatures = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/crypto/cert-signatures.js"(exports, module2) {
    "use strict";
    function x509Error(msg, cert) {
      return new Error("SASL channel binding: " + msg + " when parsing public certificate " + cert.toString("base64"));
    }
    __name(x509Error, "x509Error");
    function readASN1Length(data, index) {
      let length = data[index++];
      if (length < 128) return {
        length,
        index
      };
      const lengthBytes = length & 127;
      if (lengthBytes > 4) throw x509Error("bad length", data);
      length = 0;
      for (let i = 0; i < lengthBytes; i++) {
        length = length << 8 | data[index++];
      }
      return {
        length,
        index
      };
    }
    __name(readASN1Length, "readASN1Length");
    function readASN1OID(data, index) {
      if (data[index++] !== 6) throw x509Error("non-OID data", data);
      const { length: OIDLength, index: indexAfterOIDLength } = readASN1Length(data, index);
      index = indexAfterOIDLength;
      const lastIndex = index + OIDLength;
      const byte1 = data[index++];
      let oid = (byte1 / 40 >> 0) + "." + byte1 % 40;
      while (index < lastIndex) {
        let value = 0;
        while (index < lastIndex) {
          const nextByte = data[index++];
          value = value << 7 | nextByte & 127;
          if (nextByte < 128) break;
        }
        oid += "." + value;
      }
      return {
        oid,
        index
      };
    }
    __name(readASN1OID, "readASN1OID");
    function expectASN1Seq(data, index) {
      if (data[index++] !== 48) throw x509Error("non-sequence data", data);
      return readASN1Length(data, index);
    }
    __name(expectASN1Seq, "expectASN1Seq");
    function signatureAlgorithmHashFromCertificate(data, index) {
      if (index === void 0) index = 0;
      index = expectASN1Seq(data, index).index;
      const { length: certInfoLength, index: indexAfterCertInfoLength } = expectASN1Seq(data, index);
      index = indexAfterCertInfoLength + certInfoLength;
      index = expectASN1Seq(data, index).index;
      const { oid, index: indexAfterOID } = readASN1OID(data, index);
      switch (oid) {
        // RSA
        case "1.2.840.113549.1.1.4":
          return "MD5";
        case "1.2.840.113549.1.1.5":
          return "SHA-1";
        case "1.2.840.113549.1.1.11":
          return "SHA-256";
        case "1.2.840.113549.1.1.12":
          return "SHA-384";
        case "1.2.840.113549.1.1.13":
          return "SHA-512";
        case "1.2.840.113549.1.1.14":
          return "SHA-224";
        case "1.2.840.113549.1.1.15":
          return "SHA512-224";
        case "1.2.840.113549.1.1.16":
          return "SHA512-256";
        // ECDSA
        case "1.2.840.10045.4.1":
          return "SHA-1";
        case "1.2.840.10045.4.3.1":
          return "SHA-224";
        case "1.2.840.10045.4.3.2":
          return "SHA-256";
        case "1.2.840.10045.4.3.3":
          return "SHA-384";
        case "1.2.840.10045.4.3.4":
          return "SHA-512";
        // RSASSA-PSS: hash is indicated separately
        case "1.2.840.113549.1.1.10": {
          index = indexAfterOID;
          index = expectASN1Seq(data, index).index;
          if (data[index++] !== 160) throw x509Error("non-tag data", data);
          index = readASN1Length(data, index).index;
          index = expectASN1Seq(data, index).index;
          const { oid: hashOID } = readASN1OID(data, index);
          switch (hashOID) {
            // standalone hash OIDs
            case "1.2.840.113549.2.5":
              return "MD5";
            case "1.3.14.3.2.26":
              return "SHA-1";
            case "2.16.840.1.101.3.4.2.1":
              return "SHA-256";
            case "2.16.840.1.101.3.4.2.2":
              return "SHA-384";
            case "2.16.840.1.101.3.4.2.3":
              return "SHA-512";
          }
          throw x509Error("unknown hash OID " + hashOID, data);
        }
        // Ed25519 -- see https: return//github.com/openssl/openssl/issues/15477
        case "1.3.101.110":
        case "1.3.101.112":
          return "SHA-512";
        // Ed448 -- still not in pg 17.2 (if supported, digest would be SHAKE256 x 64 bytes)
        case "1.3.101.111":
        case "1.3.101.113":
          throw x509Error("Ed448 certificate channel binding is not currently supported by Postgres");
      }
      throw x509Error("unknown OID " + oid, data);
    }
    __name(signatureAlgorithmHashFromCertificate, "signatureAlgorithmHashFromCertificate");
    module2.exports = {
      signatureAlgorithmHashFromCertificate
    };
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/crypto/sasl.js
var require_sasl = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/crypto/sasl.js"(exports, module2) {
    "use strict";
    var crypto = require_utils2();
    var { signatureAlgorithmHashFromCertificate } = require_cert_signatures();
    function saslprep(password) {
      const nonAsciiSpace = /[\\u00A0\\u1680\\u2000-\\u200B\\u202F\\u205F\\u3000]/g;
      const mappedToNothing = /[\\u00AD\\u034F\\u1806\\u180B\\u180C\\u180D\\u200C\\u200D\\u2060\\uFE00-\\uFE0F\\uFEFF]/g;
      return password.replace(nonAsciiSpace, " ").replace(mappedToNothing, "").normalize("NFKC");
    }
    __name(saslprep, "saslprep");
    var DEFAULT_MAX_SCRAM_ITERATIONS = 1e5;
    function startSession(mechanisms, stream, scramMaxIterations = DEFAULT_MAX_SCRAM_ITERATIONS) {
      const candidates = [
        "SCRAM-SHA-256"
      ];
      if (stream) candidates.unshift("SCRAM-SHA-256-PLUS");
      const mechanism = candidates.find((candidate) => mechanisms.includes(candidate));
      if (!mechanism) {
        throw new Error("SASL: Only mechanism(s) " + candidates.join(" and ") + " are supported");
      }
      if (mechanism === "SCRAM-SHA-256-PLUS" && typeof stream.getPeerCertificate !== "function") {
        throw new Error("SASL: Mechanism SCRAM-SHA-256-PLUS requires a certificate");
      }
      const clientNonce = crypto.randomBytes(18).toString("base64");
      const gs2Header = mechanism === "SCRAM-SHA-256-PLUS" ? "p=tls-server-end-point" : stream ? "y" : "n";
      return {
        mechanism,
        clientNonce,
        response: gs2Header + ",,n=*,r=" + clientNonce,
        message: "SASLInitialResponse",
        scramMaxIterations
      };
    }
    __name(startSession, "startSession");
    async function continueSession(session, password, serverData, stream) {
      if (session.message !== "SASLInitialResponse") {
        throw new Error("SASL: Last message was not SASLInitialResponse");
      }
      if (typeof password !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
      }
      if (password === "") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
      }
      const sv = parseServerFirstMessage(serverData);
      if (!sv.nonce.startsWith(session.clientNonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
      } else if (sv.nonce.length === session.clientNonce.length) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
      }
      const scramMaxIterations = typeof session.scramMaxIterations === "number" ? session.scramMaxIterations : DEFAULT_MAX_SCRAM_ITERATIONS;
      if (scramMaxIterations !== 0 && sv.iteration > scramMaxIterations) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration count " + sv.iteration + " exceeds scramMaxIterations of " + scramMaxIterations);
      }
      const clientFirstMessageBare = "n=*,r=" + session.clientNonce;
      const serverFirstMessage = "r=" + sv.nonce + ",s=" + sv.salt + ",i=" + sv.iteration;
      let channelBinding = stream ? "eSws" : "biws";
      if (session.mechanism === "SCRAM-SHA-256-PLUS") {
        const peerCert = stream.getPeerCertificate().raw;
        let hashName = signatureAlgorithmHashFromCertificate(peerCert);
        if (hashName === "MD5" || hashName === "SHA-1") hashName = "SHA-256";
        const certHash = await crypto.hashByName(hashName, peerCert);
        const bindingData = Buffer.concat([
          Buffer.from("p=tls-server-end-point,,"),
          Buffer.from(certHash)
        ]);
        channelBinding = bindingData.toString("base64");
      }
      const clientFinalMessageWithoutProof = "c=" + channelBinding + ",r=" + sv.nonce;
      const authMessage = clientFirstMessageBare + "," + serverFirstMessage + "," + clientFinalMessageWithoutProof;
      const saltBytes = Buffer.from(sv.salt, "base64");
      const saltedPassword = await crypto.deriveKey(saslprep(password), saltBytes, sv.iteration);
      const clientKey = await crypto.hmacSha256(saltedPassword, "Client Key");
      const storedKey = await crypto.sha256(clientKey);
      const clientSignature = await crypto.hmacSha256(storedKey, authMessage);
      const clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString("base64");
      const serverKey = await crypto.hmacSha256(saltedPassword, "Server Key");
      const serverSignatureBytes = await crypto.hmacSha256(serverKey, authMessage);
      session.message = "SASLResponse";
      session.serverSignature = Buffer.from(serverSignatureBytes).toString("base64");
      session.response = clientFinalMessageWithoutProof + ",p=" + clientProof;
    }
    __name(continueSession, "continueSession");
    function finalizeSession(session, serverData) {
      if (session.message !== "SASLResponse") {
        throw new Error("SASL: Last message was not SASLResponse");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
      }
      const { serverSignature } = parseServerFinalMessage(serverData);
      if (serverSignature !== session.serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
      }
    }
    __name(finalizeSession, "finalizeSession");
    function isPrintableChars(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: text must be a string");
      }
      return text.split("").map((_, i) => text.charCodeAt(i)).every((c) => c >= 33 && c <= 43 || c >= 45 && c <= 126);
    }
    __name(isPrintableChars, "isPrintableChars");
    function isBase64(text) {
      return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?\$/.test(text);
    }
    __name(isBase64, "isBase64");
    function parseAttributePairs(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: attribute pairs text must be a string");
      }
      return new Map(text.split(",").map((attrValue) => {
        if (!/^.=/.test(attrValue)) {
          throw new Error("SASL: Invalid attribute pair entry");
        }
        const name = attrValue[0];
        const value = attrValue.substring(2);
        return [
          name,
          value
        ];
      }));
    }
    __name(parseAttributePairs, "parseAttributePairs");
    function parseServerFirstMessage(data) {
      const attrPairs = parseAttributePairs(data);
      const nonce = attrPairs.get("r");
      if (!nonce) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
      } else if (!isPrintableChars(nonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
      }
      const salt = attrPairs.get("s");
      if (!salt) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
      } else if (!isBase64(salt)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
      }
      const iterationText = attrPairs.get("i");
      if (!iterationText) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
      } else if (!/^[1-9][0-9]*\$/.test(iterationText)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
      }
      const iteration = parseInt(iterationText, 10);
      return {
        nonce,
        salt,
        iteration
      };
    }
    __name(parseServerFirstMessage, "parseServerFirstMessage");
    function parseServerFinalMessage(serverData) {
      const attrPairs = parseAttributePairs(serverData);
      const error = attrPairs.get("e");
      const serverSignature = attrPairs.get("v");
      if (error) {
        throw new Error(\`SASL: SCRAM-SERVER-FINAL-MESSAGE: server returned error: "\${error}"\`);
      }
      if (!serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
      } else if (!isBase64(serverSignature)) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
      }
      return {
        serverSignature
      };
    }
    __name(parseServerFinalMessage, "parseServerFinalMessage");
    function xorBuffers(a, b) {
      if (!Buffer.isBuffer(a)) {
        throw new TypeError("first argument must be a Buffer");
      }
      if (!Buffer.isBuffer(b)) {
        throw new TypeError("second argument must be a Buffer");
      }
      if (a.length !== b.length) {
        throw new Error("Buffer lengths must match");
      }
      if (a.length === 0) {
        throw new Error("Buffers cannot be empty");
      }
      return Buffer.from(a.map((_, i) => a[i] ^ b[i]));
    }
    __name(xorBuffers, "xorBuffers");
    module2.exports = {
      startSession,
      continueSession,
      finalizeSession,
      DEFAULT_MAX_SCRAM_ITERATIONS
    };
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/type-overrides.js
var require_type_overrides = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/type-overrides.js"(exports, module2) {
    "use strict";
    var types2 = require_pg_types();
    function TypeOverrides2(userTypes) {
      this._types = userTypes || types2;
      this.text = {};
      this.binary = {};
    }
    __name(TypeOverrides2, "TypeOverrides");
    TypeOverrides2.prototype.getOverrides = function(format) {
      switch (format) {
        case "text":
          return this.text;
        case "binary":
          return this.binary;
        default:
          return {};
      }
    };
    TypeOverrides2.prototype.setTypeParser = function(oid, format, parseFn) {
      if (typeof format === "function") {
        parseFn = format;
        format = "text";
      }
      this.getOverrides(format)[oid] = parseFn;
    };
    TypeOverrides2.prototype.getTypeParser = function(oid, format) {
      format = format || "text";
      return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format);
    };
    module2.exports = TypeOverrides2;
  }
});

// node_modules/.pnpm/pg-connection-string@2.14.0/node_modules/pg-connection-string/index.js
var require_pg_connection_string = __commonJS({
  "node_modules/.pnpm/pg-connection-string@2.14.0/node_modules/pg-connection-string/index.js"(exports, module2) {
    "use strict";
    function parse(str, options = {}) {
      if (str.charAt(0) === "/") {
        const config2 = str.split(" ");
        return {
          host: config2[0],
          database: config2[1]
        };
      }
      const config = /* @__PURE__ */ Object.create(null);
      let result;
      let dummyHost = false;
      if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
        str = encodeURI(str).replace(/%25(\\d\\d)/g, "%\$1");
      }
      try {
        try {
          result = new URL(str, "postgres://base");
        } catch (e) {
          result = new URL(str.replace("@/", "@___DUMMY___/"), "postgres://base");
          dummyHost = true;
        }
      } catch (err) {
        err.input && (err.input = "*****REDACTED*****");
        throw err;
      }
      for (const entry of result.searchParams.entries()) {
        config[entry[0]] = entry[1];
      }
      config.user = config.user || decodeURIComponent(result.username);
      config.password = config.password || decodeURIComponent(result.password);
      if (result.protocol == "socket:") {
        config.host = decodeURI(result.pathname);
        config.database = result.searchParams.get("db");
        config.client_encoding = result.searchParams.get("encoding");
        return config;
      }
      const hostname = dummyHost ? "" : result.hostname;
      if (!config.host) {
        config.host = decodeURIComponent(hostname);
      } else if (hostname && /^%2f/i.test(hostname)) {
        result.pathname = hostname + result.pathname;
      }
      if (!config.port) {
        config.port = result.port;
      }
      const pathname = result.pathname.slice(1) || null;
      config.database = pathname ? decodeURI(pathname) : null;
      if (config.ssl === "true" || config.ssl === "1") {
        config.ssl = true;
      }
      if (config.ssl === "0") {
        config.ssl = false;
      }
      if (config.sslcert || config.sslkey || config.sslrootcert || config.sslmode) {
        config.ssl = {};
      }
      if (config.sslnegotiation === "direct" && config.ssl === void 0) {
        config.ssl = true;
      }
      const fs = config.sslcert || config.sslkey || config.sslrootcert ? require("fs") : null;
      if (config.sslcert) {
        config.ssl.cert = fs.readFileSync(config.sslcert).toString();
      }
      if (config.sslkey) {
        config.ssl.key = fs.readFileSync(config.sslkey).toString();
      }
      if (config.sslrootcert) {
        config.ssl.ca = fs.readFileSync(config.sslrootcert).toString();
      }
      if (options.useLibpqCompat && config.uselibpqcompat) {
        throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");
      }
      if (config.uselibpqcompat === "true" || options.useLibpqCompat) {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
          case "require": {
            if (config.sslrootcert) {
              config.ssl.checkServerIdentity = function() {
              };
            } else {
              config.ssl.rejectUnauthorized = false;
            }
            break;
          }
          case "verify-ca": {
            if (!config.ssl.ca) {
              throw new Error("SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security.");
            }
            config.ssl.checkServerIdentity = function() {
            };
            break;
          }
          case "verify-full": {
            break;
          }
        }
      } else {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer":
          case "require":
          case "verify-ca":
          case "verify-full": {
            if (config.sslmode !== "verify-full") {
              deprecatedSslModeWarning(config.sslmode);
            }
            break;
          }
          case "no-verify": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
        }
      }
      return config;
    }
    __name(parse, "parse");
    function toConnectionOptions(sslConfig) {
      const connectionOptions = Object.entries(sslConfig).reduce((c, [key, value]) => {
        if (value !== void 0 && value !== null) {
          c[key] = value;
        }
        return c;
      }, /* @__PURE__ */ Object.create(null));
      return connectionOptions;
    }
    __name(toConnectionOptions, "toConnectionOptions");
    function toClientConfig(config) {
      const poolConfig = Object.entries(config).reduce((c, [key, value]) => {
        if (key === "ssl") {
          const sslConfig = value;
          if (typeof sslConfig === "boolean") {
            c[key] = sslConfig;
          }
          if (typeof sslConfig === "object") {
            c[key] = toConnectionOptions(sslConfig);
          }
        } else if (value !== void 0 && value !== null) {
          if (key === "port") {
            if (value !== "") {
              const v = parseInt(value, 10);
              if (isNaN(v)) {
                throw new Error(\`Invalid \${key}: \${value}\`);
              }
              c[key] = v;
            }
          } else {
            c[key] = value;
          }
        }
        return c;
      }, /* @__PURE__ */ Object.create(null));
      return poolConfig;
    }
    __name(toClientConfig, "toClientConfig");
    function parseIntoClientConfig(str) {
      return toClientConfig(parse(str));
    }
    __name(parseIntoClientConfig, "parseIntoClientConfig");
    function deprecatedSslModeWarning(sslmode) {
      if (!deprecatedSslModeWarning.warned && typeof process !== "undefined" && process.emitWarning) {
        deprecatedSslModeWarning.warned = true;
        process.emitWarning(\`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=\${sslmode}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.\`);
      }
    }
    __name(deprecatedSslModeWarning, "deprecatedSslModeWarning");
    module2.exports = parse;
    parse.parse = parse;
    parse.toClientConfig = toClientConfig;
    parse.parseIntoClientConfig = parseIntoClientConfig;
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/connection-parameters.js
var require_connection_parameters = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/connection-parameters.js"(exports, module2) {
    "use strict";
    var dns = require("dns");
    var defaults2 = require_defaults();
    var parse = require_pg_connection_string().parse;
    var val = /* @__PURE__ */ __name(function(key, config, envVar) {
      if (config[key]) {
        return config[key];
      }
      if (envVar === void 0) {
        envVar = process.env["PG" + key.toUpperCase()];
      } else if (envVar === false) {
      } else {
        envVar = process.env[envVar];
      }
      return envVar || defaults2[key];
    }, "val");
    var readSSLConfigFromEnvironment = /* @__PURE__ */ __name(function() {
      switch (process.env.PGSSLMODE) {
        case "disable":
          return false;
        case "prefer":
        case "require":
        case "verify-ca":
        case "verify-full":
          return true;
        case "no-verify":
          return {
            rejectUnauthorized: false
          };
      }
      return defaults2.ssl;
    }, "readSSLConfigFromEnvironment");
    var quoteParamValue = /* @__PURE__ */ __name(function(value) {
      return "'" + ("" + value).replace(/\\\\/g, "\\\\\\\\").replace(/'/g, "\\\\'") + "'";
    }, "quoteParamValue");
    var add = /* @__PURE__ */ __name(function(params, config, paramName) {
      const value = config[paramName];
      if (value !== void 0 && value !== null) {
        params.push(paramName + "=" + quoteParamValue(value));
      }
    }, "add");
    var ConnectionParameters = class {
      static {
        __name(this, "ConnectionParameters");
      }
      constructor(config) {
        config = typeof config === "string" ? parse(config) : config || {};
        if (config.connectionString) {
          config = Object.assign({}, config, parse(config.connectionString));
        }
        this.user = val("user", config);
        this.database = val("database", config);
        if (this.database === void 0) {
          this.database = this.user;
        }
        this.port = parseInt(val("port", config), 10);
        this.host = val("host", config);
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: val("password", config)
        });
        this.binary = val("binary", config);
        this.options = val("options", config);
        this.ssl = typeof config.ssl === "undefined" ? readSSLConfigFromEnvironment() : config.ssl;
        if (typeof this.ssl === "string") {
          if (this.ssl === "true") {
            this.ssl = true;
          }
        }
        if (this.ssl === "no-verify") {
          this.ssl = {
            rejectUnauthorized: false
          };
        }
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this.sslnegotiation = val("sslnegotiation", config, "PGSSLNEGOTIATION");
        if (this.sslnegotiation !== void 0 && this.sslnegotiation !== "postgres" && this.sslnegotiation !== "direct") {
          throw new Error(\`Invalid sslnegotiation value: "\${this.sslnegotiation}". Valid values are "postgres" and "direct".\`);
        }
        if (this.sslnegotiation === "direct" && !this.ssl) {
          throw new Error("sslnegotiation=direct requires SSL to be enabled");
        }
        this.client_encoding = val("client_encoding", config);
        this.replication = val("replication", config);
        this.isDomainSocket = !(this.host || "").indexOf("/");
        this.application_name = val("application_name", config, "PGAPPNAME");
        this.fallback_application_name = val("fallback_application_name", config, false);
        this.statement_timeout = val("statement_timeout", config, false);
        this.lock_timeout = val("lock_timeout", config, false);
        this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config, false);
        this.query_timeout = val("query_timeout", config, false);
        if (config.connectionTimeoutMillis === void 0) {
          this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
        } else {
          this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1e3);
        }
        if (config.keepAlive === false) {
          this.keepalives = 0;
        } else if (config.keepAlive === true) {
          this.keepalives = 1;
        }
        if (typeof config.keepAliveInitialDelayMillis === "number") {
          this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1e3);
        }
      }
      getLibpqConnectionString(cb) {
        const params = [];
        add(params, this, "user");
        add(params, this, "password");
        add(params, this, "port");
        add(params, this, "application_name");
        add(params, this, "fallback_application_name");
        add(params, this, "connect_timeout");
        add(params, this, "options");
        const ssl = typeof this.ssl === "object" ? this.ssl : this.ssl ? {
          sslmode: this.ssl
        } : {};
        add(params, ssl, "sslmode");
        add(params, ssl, "sslca");
        add(params, ssl, "sslkey");
        add(params, ssl, "sslcert");
        add(params, ssl, "sslrootcert");
        add(params, this, "sslnegotiation");
        if (this.database) {
          params.push("dbname=" + quoteParamValue(this.database));
        }
        if (this.replication) {
          params.push("replication=" + quoteParamValue(this.replication));
        }
        if (this.host) {
          params.push("host=" + quoteParamValue(this.host));
        }
        if (this.isDomainSocket) {
          return cb(null, params.join(" "));
        }
        if (this.client_encoding) {
          params.push("client_encoding=" + quoteParamValue(this.client_encoding));
        }
        dns.lookup(this.host, function(err, address) {
          if (err) return cb(err, null);
          params.push("hostaddr=" + quoteParamValue(address));
          return cb(null, params.join(" "));
        });
      }
    };
    module2.exports = ConnectionParameters;
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/result.js
var require_result = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/result.js"(exports, module2) {
    "use strict";
    var types2 = require_pg_types();
    var matchRegexp = /^([A-Za-z]+)(?: (\\d+))?(?: (\\d+))?/;
    var Result2 = class {
      static {
        __name(this, "Result");
      }
      constructor(rowMode, types3) {
        this.command = null;
        this.rowCount = null;
        this.oid = null;
        this.rows = [];
        this.fields = [];
        this._parsers = void 0;
        this._types = types3;
        this.RowCtor = null;
        this.rowAsArray = rowMode === "array";
        if (this.rowAsArray) {
          this.parseRow = this._parseRowAsArray;
        }
        this._prebuiltEmptyResultObject = null;
      }
      // adds a command complete message
      addCommandComplete(msg) {
        let match;
        if (msg.text) {
          match = matchRegexp.exec(msg.text);
        } else {
          match = matchRegexp.exec(msg.command);
        }
        if (match) {
          this.command = match[1];
          if (match[3]) {
            this.oid = parseInt(match[2], 10);
            this.rowCount = parseInt(match[3], 10);
          } else if (match[2]) {
            this.rowCount = parseInt(match[2], 10);
          }
        }
      }
      _parseRowAsArray(rowData) {
        const row = new Array(rowData.length);
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          if (rawValue !== null) {
            row[i] = this._parsers[i](rawValue);
          } else {
            row[i] = null;
          }
        }
        return row;
      }
      parseRow(rowData) {
        const row = {
          ...this._prebuiltEmptyResultObject
        };
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          const field = this.fields[i].name;
          if (rawValue !== null) {
            const v = this.fields[i].format === "binary" ? Buffer.from(rawValue) : rawValue;
            row[field] = this._parsers[i](v);
          } else {
            row[field] = null;
          }
        }
        return row;
      }
      addRow(row) {
        this.rows.push(row);
      }
      addFields(fieldDescriptions) {
        this.fields = fieldDescriptions;
        if (this.fields.length) {
          this._parsers = new Array(fieldDescriptions.length);
        }
        const row = /* @__PURE__ */ Object.create(null);
        for (let i = 0; i < fieldDescriptions.length; i++) {
          const desc = fieldDescriptions[i];
          row[desc.name] = null;
          if (this._types) {
            this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || "text");
          } else {
            this._parsers[i] = types2.getTypeParser(desc.dataTypeID, desc.format || "text");
          }
        }
        this._prebuiltEmptyResultObject = {
          ...row
        };
      }
    };
    module2.exports = Result2;
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/query.js
var require_query = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/query.js"(exports, module2) {
    "use strict";
    var { EventEmitter } = require("events");
    var Result2 = require_result();
    var utils = require_utils();
    var Query2 = class extends EventEmitter {
      static {
        __name(this, "Query");
      }
      constructor(config, values, callback) {
        super();
        config = utils.normalizeQueryConfig(config, values, callback);
        this.text = config.text;
        this.values = config.values;
        this.rows = config.rows;
        this.types = config.types;
        this.name = config.name;
        this.queryMode = config.queryMode;
        this.binary = config.binary;
        this.portal = config.portal || "";
        this.callback = config.callback;
        this._rowMode = config.rowMode;
        if (process.domain && config.callback) {
          this.callback = process.domain.bind(config.callback);
        }
        this._result = new Result2(this._rowMode, this.types);
        this._results = this._result;
        this._canceledDueToError = false;
      }
      requiresPreparation() {
        if (this.queryMode === "extended") {
          return true;
        }
        if (this.name) {
          return true;
        }
        if (this.rows) {
          return true;
        }
        if (!this.text) {
          return false;
        }
        if (!this.values) {
          return false;
        }
        return this.values.length > 0;
      }
      _checkForMultirow() {
        if (this._result.command) {
          if (!Array.isArray(this._results)) {
            this._results = [
              this._result
            ];
          }
          this._result = new Result2(this._rowMode, this._result._types);
          this._results.push(this._result);
        }
      }
      // associates row metadata from the supplied
      // message with this query object
      // metadata used when parsing row results
      handleRowDescription(msg) {
        this._checkForMultirow();
        this._result.addFields(msg.fields);
        this._accumulateRows = this.callback || !this.listeners("row").length;
      }
      handleDataRow(msg) {
        let row;
        if (this._canceledDueToError) {
          return;
        }
        try {
          row = this._result.parseRow(msg.fields);
        } catch (err) {
          this._canceledDueToError = err;
          return;
        }
        this.emit("row", row, this._result);
        if (this._accumulateRows) {
          this._result.addRow(row);
        }
      }
      handleCommandComplete(msg, connection) {
        this._checkForMultirow();
        this._result.addCommandComplete(msg);
        if (this.rows) {
          connection.sync();
        }
      }
      // if a named prepared statement is created with empty query text
      // the backend will send an emptyQuery message but *not* a command complete message
      // since we pipeline sync immediately after execute we don't need to do anything here
      // unless we have rows specified, in which case we did not pipeline the initial sync call
      handleEmptyQuery(connection) {
        if (this.rows) {
          connection.sync();
        }
      }
      handleError(err, connection) {
        if (this._canceledDueToError) {
          err = this._canceledDueToError;
          this._canceledDueToError = false;
        }
        if (this.callback) {
          return this.callback(err);
        }
        this.emit("error", err);
      }
      handleReadyForQuery(con) {
        if (this._canceledDueToError) {
          return this.handleError(this._canceledDueToError, con);
        }
        if (this.callback) {
          try {
            this.callback(null, this._results);
          } catch (err) {
            process.nextTick(() => {
              throw err;
            });
          }
        }
        this.emit("end", this._results);
      }
      submit(connection) {
        if (typeof this.text !== "string" && typeof this.name !== "string") {
          return new Error("A query must have either text or a name. Supplying neither is unsupported.");
        }
        const previous = connection.parsedStatements[this.name];
        if (this.text && previous && this.text !== previous) {
          return new Error(\`Prepared statements must be unique - '\${this.name}' was used for a different statement\`);
        }
        if (this.values && !Array.isArray(this.values)) {
          return new Error("Query values must be an array");
        }
        if (this.requiresPreparation()) {
          connection.stream.cork && connection.stream.cork();
          try {
            this.prepare(connection);
          } finally {
            connection.stream.uncork && connection.stream.uncork();
          }
        } else {
          connection.query(this.text);
        }
        return null;
      }
      hasBeenParsed(connection) {
        return this.name && connection.parsedStatements[this.name];
      }
      handlePortalSuspended(connection) {
        this._getRows(connection, this.rows);
      }
      _getRows(connection, rows) {
        connection.execute({
          portal: this.portal,
          rows
        });
        if (!rows) {
          connection.sync();
        } else {
          connection.flush();
        }
      }
      // http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
      prepare(connection) {
        if (!this.hasBeenParsed(connection)) {
          connection.parse({
            text: this.text,
            name: this.name,
            types: this.types
          });
        }
        try {
          connection.bind({
            portal: this.portal,
            statement: this.name,
            values: this.values,
            binary: this.binary,
            valueMapper: utils.prepareValue
          });
        } catch (err) {
          connection.close({
            type: "S",
            name: this.name
          });
          connection.sync();
          this.handleError(err, connection);
          return;
        }
        connection.describe({
          type: "P",
          name: this.portal || ""
        });
        this._getRows(connection, this.rows);
      }
      handleCopyInResponse(connection) {
        connection.sendCopyFail("No source stream defined");
      }
      handleCopyData(msg, connection) {
      }
    };
    module2.exports = Query2;
  }
});

// node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/messages.js
var require_messages = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/messages.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.NoticeMessage = exports.DataRowMessage = exports.CommandCompleteMessage = exports.ReadyForQueryMessage = exports.NotificationResponseMessage = exports.BackendKeyDataMessage = exports.AuthenticationMD5Password = exports.ParameterStatusMessage = exports.ParameterDescriptionMessage = exports.RowDescriptionMessage = exports.Field = exports.CopyResponse = exports.CopyDataMessage = exports.DatabaseError = exports.copyDone = exports.emptyQuery = exports.replicationStart = exports.portalSuspended = exports.noData = exports.closeComplete = exports.bindComplete = exports.parseComplete = void 0;
    exports.parseComplete = {
      name: "parseComplete",
      length: 5
    };
    exports.bindComplete = {
      name: "bindComplete",
      length: 5
    };
    exports.closeComplete = {
      name: "closeComplete",
      length: 5
    };
    exports.noData = {
      name: "noData",
      length: 5
    };
    exports.portalSuspended = {
      name: "portalSuspended",
      length: 5
    };
    exports.replicationStart = {
      name: "replicationStart",
      length: 4
    };
    exports.emptyQuery = {
      name: "emptyQuery",
      length: 4
    };
    exports.copyDone = {
      name: "copyDone",
      length: 4
    };
    var DatabaseError2 = class extends Error {
      static {
        __name(this, "DatabaseError");
      }
      constructor(message, length, name) {
        super(message);
        this.length = length;
        this.name = name;
      }
    };
    exports.DatabaseError = DatabaseError2;
    var CopyDataMessage = class {
      static {
        __name(this, "CopyDataMessage");
      }
      constructor(length, chunk) {
        this.length = length;
        this.chunk = chunk;
        this.name = "copyData";
      }
    };
    exports.CopyDataMessage = CopyDataMessage;
    var CopyResponse = class {
      static {
        __name(this, "CopyResponse");
      }
      constructor(length, name, binary, columnCount) {
        this.length = length;
        this.name = name;
        this.binary = binary;
        this.columnTypes = new Array(columnCount);
      }
    };
    exports.CopyResponse = CopyResponse;
    var Field = class {
      static {
        __name(this, "Field");
      }
      constructor(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
        this.name = name;
        this.tableID = tableID;
        this.columnID = columnID;
        this.dataTypeID = dataTypeID;
        this.dataTypeSize = dataTypeSize;
        this.dataTypeModifier = dataTypeModifier;
        this.format = format;
      }
    };
    exports.Field = Field;
    var RowDescriptionMessage = class {
      static {
        __name(this, "RowDescriptionMessage");
      }
      constructor(length, fieldCount) {
        this.length = length;
        this.fieldCount = fieldCount;
        this.name = "rowDescription";
        this.fields = new Array(this.fieldCount);
      }
    };
    exports.RowDescriptionMessage = RowDescriptionMessage;
    var ParameterDescriptionMessage = class {
      static {
        __name(this, "ParameterDescriptionMessage");
      }
      constructor(length, parameterCount) {
        this.length = length;
        this.parameterCount = parameterCount;
        this.name = "parameterDescription";
        this.dataTypeIDs = new Array(this.parameterCount);
      }
    };
    exports.ParameterDescriptionMessage = ParameterDescriptionMessage;
    var ParameterStatusMessage = class {
      static {
        __name(this, "ParameterStatusMessage");
      }
      constructor(length, parameterName, parameterValue) {
        this.length = length;
        this.parameterName = parameterName;
        this.parameterValue = parameterValue;
        this.name = "parameterStatus";
      }
    };
    exports.ParameterStatusMessage = ParameterStatusMessage;
    var AuthenticationMD5Password = class {
      static {
        __name(this, "AuthenticationMD5Password");
      }
      constructor(length, salt) {
        this.length = length;
        this.salt = salt;
        this.name = "authenticationMD5Password";
      }
    };
    exports.AuthenticationMD5Password = AuthenticationMD5Password;
    var BackendKeyDataMessage = class {
      static {
        __name(this, "BackendKeyDataMessage");
      }
      constructor(length, processID, secretKey) {
        this.length = length;
        this.processID = processID;
        this.secretKey = secretKey;
        this.name = "backendKeyData";
      }
    };
    exports.BackendKeyDataMessage = BackendKeyDataMessage;
    var NotificationResponseMessage = class {
      static {
        __name(this, "NotificationResponseMessage");
      }
      constructor(length, processId, channel, payload) {
        this.length = length;
        this.processId = processId;
        this.channel = channel;
        this.payload = payload;
        this.name = "notification";
      }
    };
    exports.NotificationResponseMessage = NotificationResponseMessage;
    var ReadyForQueryMessage = class {
      static {
        __name(this, "ReadyForQueryMessage");
      }
      constructor(length, status) {
        this.length = length;
        this.status = status;
        this.name = "readyForQuery";
      }
    };
    exports.ReadyForQueryMessage = ReadyForQueryMessage;
    var CommandCompleteMessage = class {
      static {
        __name(this, "CommandCompleteMessage");
      }
      constructor(length, text) {
        this.length = length;
        this.text = text;
        this.name = "commandComplete";
      }
    };
    exports.CommandCompleteMessage = CommandCompleteMessage;
    var DataRowMessage = class {
      static {
        __name(this, "DataRowMessage");
      }
      constructor(length, fields) {
        this.length = length;
        this.fields = fields;
        this.name = "dataRow";
        this.fieldCount = fields.length;
      }
    };
    exports.DataRowMessage = DataRowMessage;
    var NoticeMessage = class {
      static {
        __name(this, "NoticeMessage");
      }
      constructor(length, message) {
        this.length = length;
        this.message = message;
        this.name = "notice";
      }
    };
    exports.NoticeMessage = NoticeMessage;
  }
});

// node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/buffer-writer.js
var require_buffer_writer = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/buffer-writer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Writer = void 0;
    var Writer = class {
      static {
        __name(this, "Writer");
      }
      constructor(size = 256) {
        this.size = size;
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(size);
      }
      ensure(size) {
        const remaining = this.buffer.length - this.offset;
        if (remaining < size) {
          const oldBuffer = this.buffer;
          const newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
          this.buffer = Buffer.allocUnsafe(newSize);
          oldBuffer.copy(this.buffer);
        }
      }
      addInt32(num) {
        this.ensure(4);
        this.buffer[this.offset++] = num >>> 24 & 255;
        this.buffer[this.offset++] = num >>> 16 & 255;
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addInt16(num) {
        this.ensure(2);
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addCString(string) {
        if (!string) {
          this.ensure(1);
        } else {
          const len = Buffer.byteLength(string);
          this.ensure(len + 1);
          this.buffer.write(string, this.offset, "utf-8");
          this.offset += len;
        }
        this.buffer[this.offset++] = 0;
        return this;
      }
      addString(string = "") {
        const len = Buffer.byteLength(string);
        this.ensure(len);
        this.buffer.write(string, this.offset);
        this.offset += len;
        return this;
      }
      // Write an Int32 byte-length prefix immediately followed by the string's UTF-8
      // bytes. Postgres' Bind wire format prefixes every parameter with its length,
      // and doing it in one method computes Buffer.byteLength ONCE — the previous
      // \`addInt32(Buffer.byteLength(s)).addString(s)\` pairing scanned the string
      // three times (byteLength for the prefix, byteLength again inside addString,
      // then the encode), which is costly for large text parameters.
      addInt32PrefixedString(string) {
        const len = Buffer.byteLength(string);
        this.ensure(4 + len);
        const buffer = this.buffer;
        let offset = this.offset;
        buffer[offset++] = len >>> 24 & 255;
        buffer[offset++] = len >>> 16 & 255;
        buffer[offset++] = len >>> 8 & 255;
        buffer[offset++] = len >>> 0 & 255;
        buffer.write(string, offset, "utf-8");
        this.offset = offset + len;
        return this;
      }
      add(otherBuffer) {
        this.ensure(otherBuffer.length);
        otherBuffer.copy(this.buffer, this.offset);
        this.offset += otherBuffer.length;
        return this;
      }
      join(code) {
        if (code) {
          this.buffer[this.headerPosition] = code;
          const length = this.offset - (this.headerPosition + 1);
          this.buffer.writeInt32BE(length, this.headerPosition + 1);
        }
        return this.buffer.slice(code ? 0 : 5, this.offset);
      }
      flush(code) {
        const result = this.join(code);
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(this.size);
        return result;
      }
      clear() {
        this.offset = 5;
        this.headerPosition = 0;
      }
    };
    exports.Writer = Writer;
  }
});

// node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/serializer.js
var require_serializer = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/serializer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.serialize = void 0;
    var buffer_writer_1 = require_buffer_writer();
    var writer = new buffer_writer_1.Writer();
    var startup = /* @__PURE__ */ __name((opts) => {
      writer.addInt16(3).addInt16(0);
      for (const key of Object.keys(opts)) {
        writer.addCString(key).addCString(opts[key]);
      }
      writer.addCString("client_encoding").addCString("UTF8");
      const bodyBuffer = writer.addCString("").flush();
      const length = bodyBuffer.length + 4;
      return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
    }, "startup");
    var requestSsl = /* @__PURE__ */ __name(() => {
      const response = Buffer.allocUnsafe(8);
      response.writeInt32BE(8, 0);
      response.writeInt32BE(80877103, 4);
      return response;
    }, "requestSsl");
    var password = /* @__PURE__ */ __name((password2) => {
      return writer.addCString(password2).flush(
        112
        /* code.startup */
      );
    }, "password");
    var sendSASLInitialResponseMessage = /* @__PURE__ */ __name(function(mechanism, initialResponse) {
      writer.addCString(mechanism).addInt32PrefixedString(initialResponse);
      return writer.flush(
        112
        /* code.startup */
      );
    }, "sendSASLInitialResponseMessage");
    var sendSCRAMClientFinalMessage = /* @__PURE__ */ __name(function(additionalData) {
      return writer.addString(additionalData).flush(
        112
        /* code.startup */
      );
    }, "sendSCRAMClientFinalMessage");
    var query2 = /* @__PURE__ */ __name((text) => {
      return writer.addCString(text).flush(
        81
        /* code.query */
      );
    }, "query");
    var emptyArray = [];
    var parse = /* @__PURE__ */ __name((query3) => {
      const name = query3.name || "";
      if (name.length > 63) {
        console.error("Warning! Postgres only supports 63 characters for query names.");
        console.error("You supplied %s (%s)", name, name.length);
        console.error("This can cause conflicts and silent errors executing queries");
      }
      const types2 = query3.types || emptyArray;
      const len = types2.length;
      const buffer = writer.addCString(name).addCString(query3.text).addInt16(len);
      for (let i = 0; i < len; i++) {
        buffer.addInt32(types2[i]);
      }
      return writer.flush(
        80
        /* code.parse */
      );
    }, "parse");
    var paramWriter = new buffer_writer_1.Writer();
    var writeValues = /* @__PURE__ */ __name(function(values, valueMapper) {
      for (let i = 0; i < values.length; i++) {
        const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
        if (mappedVal == null) {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(-1);
        } else if (mappedVal instanceof Buffer) {
          writer.addInt16(
            1
            /* ParamType.BINARY */
          );
          paramWriter.addInt32(mappedVal.length);
          paramWriter.add(mappedVal);
        } else {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32PrefixedString(mappedVal);
        }
      }
    }, "writeValues");
    var bind = /* @__PURE__ */ __name((config = {}) => {
      const portal = config.portal || "";
      const statement = config.statement || "";
      const binary = config.binary || false;
      const values = config.values || emptyArray;
      const len = values.length;
      writer.addCString(portal).addCString(statement);
      writer.addInt16(len);
      try {
        writeValues(values, config.valueMapper);
      } catch (err) {
        writer.clear();
        paramWriter.clear();
        throw err;
      }
      writer.addInt16(len);
      writer.add(paramWriter.flush());
      writer.addInt16(1);
      writer.addInt16(
        binary ? 1 : 0
        /* ParamType.STRING */
      );
      return writer.flush(
        66
        /* code.bind */
      );
    }, "bind");
    var emptyExecute = Buffer.from([
      69,
      0,
      0,
      0,
      9,
      0,
      0,
      0,
      0,
      0
    ]);
    var execute = /* @__PURE__ */ __name((config) => {
      if (!config || !config.portal && !config.rows) {
        return emptyExecute;
      }
      const portal = config.portal || "";
      const rows = config.rows || 0;
      const portalLength = Buffer.byteLength(portal);
      const len = 4 + portalLength + 1 + 4;
      const buff = Buffer.allocUnsafe(1 + len);
      buff[0] = 69;
      buff.writeInt32BE(len, 1);
      buff.write(portal, 5, "utf-8");
      buff[portalLength + 5] = 0;
      buff.writeUInt32BE(rows, buff.length - 4);
      return buff;
    }, "execute");
    var cancel = /* @__PURE__ */ __name((processID, secretKey) => {
      const buffer = Buffer.allocUnsafe(16);
      buffer.writeInt32BE(16, 0);
      buffer.writeInt16BE(1234, 4);
      buffer.writeInt16BE(5678, 6);
      buffer.writeInt32BE(processID, 8);
      buffer.writeInt32BE(secretKey, 12);
      return buffer;
    }, "cancel");
    var cstringMessage = /* @__PURE__ */ __name((code, string) => {
      const stringLen = Buffer.byteLength(string);
      const len = 4 + stringLen + 1;
      const buffer = Buffer.allocUnsafe(1 + len);
      buffer[0] = code;
      buffer.writeInt32BE(len, 1);
      buffer.write(string, 5, "utf-8");
      buffer[len] = 0;
      return buffer;
    }, "cstringMessage");
    var emptyDescribePortal = writer.addCString("P").flush(
      68
      /* code.describe */
    );
    var emptyDescribeStatement = writer.addCString("S").flush(
      68
      /* code.describe */
    );
    var describe = /* @__PURE__ */ __name((msg) => {
      return msg.name ? cstringMessage(68, \`\${msg.type}\${msg.name || ""}\`) : msg.type === "P" ? emptyDescribePortal : emptyDescribeStatement;
    }, "describe");
    var close = /* @__PURE__ */ __name((msg) => {
      const text = \`\${msg.type}\${msg.name || ""}\`;
      return cstringMessage(67, text);
    }, "close");
    var copyData = /* @__PURE__ */ __name((chunk) => {
      return writer.add(chunk).flush(
        100
        /* code.copyFromChunk */
      );
    }, "copyData");
    var copyFail = /* @__PURE__ */ __name((message) => {
      return cstringMessage(102, message);
    }, "copyFail");
    var codeOnlyBuffer = /* @__PURE__ */ __name((code) => Buffer.from([
      code,
      0,
      0,
      0,
      4
    ]), "codeOnlyBuffer");
    var flushBuffer = codeOnlyBuffer(
      72
      /* code.flush */
    );
    var syncBuffer = codeOnlyBuffer(
      83
      /* code.sync */
    );
    var endBuffer = codeOnlyBuffer(
      88
      /* code.end */
    );
    var copyDoneBuffer = codeOnlyBuffer(
      99
      /* code.copyDone */
    );
    var serialize = {
      startup,
      password,
      requestSsl,
      sendSASLInitialResponseMessage,
      sendSCRAMClientFinalMessage,
      query: query2,
      parse,
      bind,
      execute,
      describe,
      close,
      flush: /* @__PURE__ */ __name(() => flushBuffer, "flush"),
      sync: /* @__PURE__ */ __name(() => syncBuffer, "sync"),
      end: /* @__PURE__ */ __name(() => endBuffer, "end"),
      copyData,
      copyDone: /* @__PURE__ */ __name(() => copyDoneBuffer, "copyDone"),
      copyFail,
      cancel
    };
    exports.serialize = serialize;
  }
});

// node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/buffer-reader.js
var require_buffer_reader = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/buffer-reader.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.BufferReader = void 0;
    var BufferReader = class {
      static {
        __name(this, "BufferReader");
      }
      constructor(offset = 0) {
        this.offset = offset;
        this.buffer = Buffer.allocUnsafe(0);
        this.encoding = "utf-8";
      }
      setBuffer(offset, buffer) {
        this.offset = offset;
        this.buffer = buffer;
      }
      int16() {
        const result = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return result;
      }
      byte() {
        const result = this.buffer[this.offset];
        this.offset++;
        return result;
      }
      int32() {
        const result = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      uint32() {
        const result = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      string(length) {
        const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
      cstring() {
        const start = this.offset;
        let end = start;
        while (this.buffer[end++]) {
        }
        this.offset = end;
        return this.buffer.toString(this.encoding, start, end - 1);
      }
      bytes(length) {
        const result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
    };
    exports.BufferReader = BufferReader;
  }
});

// node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/parser.js
var require_parser = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/parser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Parser = void 0;
    var messages_1 = require_messages();
    var buffer_reader_1 = require_buffer_reader();
    var CODE_LENGTH = 1;
    var LEN_LENGTH = 4;
    var HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
    var LATEINIT_LENGTH = -1;
    var emptyBuffer = Buffer.allocUnsafe(0);
    var Parser = class {
      static {
        __name(this, "Parser");
      }
      constructor(opts) {
        this.buffer = emptyBuffer;
        this.bufferLength = 0;
        this.bufferOffset = 0;
        this.reader = new buffer_reader_1.BufferReader();
        if ((opts === null || opts === void 0 ? void 0 : opts.mode) === "binary") {
          throw new Error("Binary mode not supported yet");
        }
        this.mode = (opts === null || opts === void 0 ? void 0 : opts.mode) || "text";
      }
      parse(buffer, callback) {
        this.mergeBuffer(buffer);
        const bufferFullLength = this.bufferOffset + this.bufferLength;
        let offset = this.bufferOffset;
        while (offset + HEADER_LENGTH <= bufferFullLength) {
          const code = this.buffer[offset];
          const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
          const fullMessageLength = CODE_LENGTH + length;
          if (fullMessageLength + offset <= bufferFullLength) {
            const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
            callback(message);
            offset += fullMessageLength;
          } else {
            break;
          }
        }
        if (offset === bufferFullLength) {
          this.buffer = emptyBuffer;
          this.bufferLength = 0;
          this.bufferOffset = 0;
        } else {
          this.bufferLength = bufferFullLength - offset;
          this.bufferOffset = offset;
        }
      }
      mergeBuffer(buffer) {
        if (this.bufferLength > 0) {
          const newLength = this.bufferLength + buffer.byteLength;
          const newFullLength = newLength + this.bufferOffset;
          if (newFullLength > this.buffer.byteLength) {
            let newBuffer;
            if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
              newBuffer = this.buffer;
            } else {
              let newBufferLength = this.buffer.byteLength * 2;
              while (newLength >= newBufferLength) {
                newBufferLength *= 2;
              }
              newBuffer = Buffer.allocUnsafe(newBufferLength);
            }
            this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
            this.buffer = newBuffer;
            this.bufferOffset = 0;
          }
          buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
          this.bufferLength = newLength;
        } else {
          this.buffer = buffer;
          this.bufferOffset = 0;
          this.bufferLength = buffer.byteLength;
        }
      }
      handlePacket(offset, code, length, bytes) {
        const { reader } = this;
        reader.setBuffer(offset, bytes);
        let message;
        switch (code) {
          case 50:
            message = messages_1.bindComplete;
            break;
          case 49:
            message = messages_1.parseComplete;
            break;
          case 51:
            message = messages_1.closeComplete;
            break;
          case 110:
            message = messages_1.noData;
            break;
          case 115:
            message = messages_1.portalSuspended;
            break;
          case 99:
            message = messages_1.copyDone;
            break;
          case 87:
            message = messages_1.replicationStart;
            break;
          case 73:
            message = messages_1.emptyQuery;
            break;
          case 68:
            message = parseDataRowMessage(reader);
            break;
          case 67:
            message = parseCommandCompleteMessage(reader);
            break;
          case 90:
            message = parseReadyForQueryMessage(reader);
            break;
          case 65:
            message = parseNotificationMessage(reader);
            break;
          case 82:
            message = parseAuthenticationResponse(reader, length);
            break;
          case 83:
            message = parseParameterStatusMessage(reader);
            break;
          case 75:
            message = parseBackendKeyData(reader);
            break;
          case 69:
            message = parseErrorMessage(reader, "error");
            break;
          case 78:
            message = parseErrorMessage(reader, "notice");
            break;
          case 84:
            message = parseRowDescriptionMessage(reader);
            break;
          case 116:
            message = parseParameterDescriptionMessage(reader);
            break;
          case 71:
            message = parseCopyInMessage(reader);
            break;
          case 72:
            message = parseCopyOutMessage(reader);
            break;
          case 100:
            message = parseCopyData(reader, length);
            break;
          default:
            return new messages_1.DatabaseError("received invalid response: " + code.toString(16), length, "error");
        }
        reader.setBuffer(0, emptyBuffer);
        message.length = length;
        return message;
      }
    };
    exports.Parser = Parser;
    var parseReadyForQueryMessage = /* @__PURE__ */ __name((reader) => {
      const status = reader.string(1);
      return new messages_1.ReadyForQueryMessage(LATEINIT_LENGTH, status);
    }, "parseReadyForQueryMessage");
    var parseCommandCompleteMessage = /* @__PURE__ */ __name((reader) => {
      const text = reader.cstring();
      return new messages_1.CommandCompleteMessage(LATEINIT_LENGTH, text);
    }, "parseCommandCompleteMessage");
    var parseCopyData = /* @__PURE__ */ __name((reader, length) => {
      const chunk = reader.bytes(length - 4);
      return new messages_1.CopyDataMessage(LATEINIT_LENGTH, chunk);
    }, "parseCopyData");
    var parseCopyInMessage = /* @__PURE__ */ __name((reader) => parseCopyMessage(reader, "copyInResponse"), "parseCopyInMessage");
    var parseCopyOutMessage = /* @__PURE__ */ __name((reader) => parseCopyMessage(reader, "copyOutResponse"), "parseCopyOutMessage");
    var parseCopyMessage = /* @__PURE__ */ __name((reader, messageName) => {
      const isBinary = reader.byte() !== 0;
      const columnCount = reader.int16();
      const message = new messages_1.CopyResponse(LATEINIT_LENGTH, messageName, isBinary, columnCount);
      for (let i = 0; i < columnCount; i++) {
        message.columnTypes[i] = reader.int16();
      }
      return message;
    }, "parseCopyMessage");
    var parseNotificationMessage = /* @__PURE__ */ __name((reader) => {
      const processId = reader.int32();
      const channel = reader.cstring();
      const payload = reader.cstring();
      return new messages_1.NotificationResponseMessage(LATEINIT_LENGTH, processId, channel, payload);
    }, "parseNotificationMessage");
    var parseRowDescriptionMessage = /* @__PURE__ */ __name((reader) => {
      const fieldCount = reader.int16();
      const message = new messages_1.RowDescriptionMessage(LATEINIT_LENGTH, fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        message.fields[i] = parseField(reader);
      }
      return message;
    }, "parseRowDescriptionMessage");
    var parseField = /* @__PURE__ */ __name((reader) => {
      const name = reader.cstring();
      const tableID = reader.uint32();
      const columnID = reader.int16();
      const dataTypeID = reader.uint32();
      const dataTypeSize = reader.int16();
      const dataTypeModifier = reader.int32();
      const mode = reader.int16() === 0 ? "text" : "binary";
      return new messages_1.Field(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
    }, "parseField");
    var parseParameterDescriptionMessage = /* @__PURE__ */ __name((reader) => {
      const parameterCount = reader.int16();
      const message = new messages_1.ParameterDescriptionMessage(LATEINIT_LENGTH, parameterCount);
      for (let i = 0; i < parameterCount; i++) {
        message.dataTypeIDs[i] = reader.int32();
      }
      return message;
    }, "parseParameterDescriptionMessage");
    var parseDataRowMessage = /* @__PURE__ */ __name((reader) => {
      const fieldCount = reader.int16();
      const fields = new Array(fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        const len = reader.int32();
        fields[i] = len === -1 ? null : reader.string(len);
      }
      return new messages_1.DataRowMessage(LATEINIT_LENGTH, fields);
    }, "parseDataRowMessage");
    var parseParameterStatusMessage = /* @__PURE__ */ __name((reader) => {
      const name = reader.cstring();
      const value = reader.cstring();
      return new messages_1.ParameterStatusMessage(LATEINIT_LENGTH, name, value);
    }, "parseParameterStatusMessage");
    var parseBackendKeyData = /* @__PURE__ */ __name((reader) => {
      const processID = reader.int32();
      const secretKey = reader.int32();
      return new messages_1.BackendKeyDataMessage(LATEINIT_LENGTH, processID, secretKey);
    }, "parseBackendKeyData");
    var parseAuthenticationResponse = /* @__PURE__ */ __name((reader, length) => {
      const code = reader.int32();
      const message = {
        name: "authenticationOk",
        length
      };
      switch (code) {
        case 0:
          break;
        case 3:
          if (message.length === 8) {
            message.name = "authenticationCleartextPassword";
          }
          break;
        case 5:
          if (message.length === 12) {
            message.name = "authenticationMD5Password";
            const salt = reader.bytes(4);
            return new messages_1.AuthenticationMD5Password(LATEINIT_LENGTH, salt);
          }
          break;
        case 10:
          {
            message.name = "authenticationSASL";
            message.mechanisms = [];
            let mechanism;
            do {
              mechanism = reader.cstring();
              if (mechanism) {
                message.mechanisms.push(mechanism);
              }
            } while (mechanism);
          }
          break;
        case 11:
          message.name = "authenticationSASLContinue";
          message.data = reader.string(length - 8);
          break;
        case 12:
          message.name = "authenticationSASLFinal";
          message.data = reader.string(length - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + code);
      }
      return message;
    }, "parseAuthenticationResponse");
    var parseErrorMessage = /* @__PURE__ */ __name((reader, name) => {
      const fields = {};
      let fieldType = reader.string(1);
      while (fieldType !== "\\0") {
        fields[fieldType] = reader.cstring();
        fieldType = reader.string(1);
      }
      const messageValue = fields.M;
      const message = name === "notice" ? new messages_1.NoticeMessage(LATEINIT_LENGTH, messageValue) : new messages_1.DatabaseError(messageValue, LATEINIT_LENGTH, name);
      message.severity = fields.S;
      message.code = fields.C;
      message.detail = fields.D;
      message.hint = fields.H;
      message.position = fields.P;
      message.internalPosition = fields.p;
      message.internalQuery = fields.q;
      message.where = fields.W;
      message.schema = fields.s;
      message.table = fields.t;
      message.column = fields.c;
      message.dataType = fields.d;
      message.constraint = fields.n;
      message.file = fields.F;
      message.line = fields.L;
      message.routine = fields.R;
      return message;
    }, "parseErrorMessage");
  }
});

// node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.15.0/node_modules/pg-protocol/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.DatabaseError = exports.serialize = void 0;
    exports.parse = parse;
    var messages_1 = require_messages();
    Object.defineProperty(exports, "DatabaseError", {
      enumerable: true,
      get: /* @__PURE__ */ __name(function() {
        return messages_1.DatabaseError;
      }, "get")
    });
    var serializer_1 = require_serializer();
    Object.defineProperty(exports, "serialize", {
      enumerable: true,
      get: /* @__PURE__ */ __name(function() {
        return serializer_1.serialize;
      }, "get")
    });
    var parser_1 = require_parser();
    function parse(stream, callback) {
      const parser = new parser_1.Parser();
      stream.on("data", (buffer) => parser.parse(buffer, callback));
      return new Promise((resolve) => stream.on("end", () => resolve()));
    }
    __name(parse, "parse");
  }
});

// node_modules/.pnpm/pg-cloudflare@1.4.0/node_modules/pg-cloudflare/dist/empty.js
var require_empty = __commonJS({
  "node_modules/.pnpm/pg-cloudflare@1.4.0/node_modules/pg-cloudflare/dist/empty.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = {};
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/stream.js
var require_stream = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/stream.js"(exports, module2) {
    "use strict";
    var { getStream, getSecureStream } = getStreamFuncs();
    module2.exports = {
      /**
      * Get a socket stream compatible with the current runtime environment.
      * @returns {Duplex}
      */
      getStream,
      /**
      * Get a TLS secured socket, compatible with the current environment,
      * using the socket and other settings given in \`options\`.
      * @returns {Duplex}
      */
      getSecureStream
    };
    function getNodejsStreamFuncs() {
      function getStream2(ssl) {
        const net = require("net");
        return new net.Socket();
      }
      __name(getStream2, "getStream");
      function getSecureStream2(options) {
        const tls = require("tls");
        return tls.connect(options);
      }
      __name(getSecureStream2, "getSecureStream");
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    __name(getNodejsStreamFuncs, "getNodejsStreamFuncs");
    function getCloudflareStreamFuncs() {
      function getStream2(ssl) {
        const { CloudflareSocket } = require_empty();
        return new CloudflareSocket(ssl);
      }
      __name(getStream2, "getStream");
      function getSecureStream2(options) {
        options.socket.startTls(options);
        return options.socket;
      }
      __name(getSecureStream2, "getSecureStream");
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    __name(getCloudflareStreamFuncs, "getCloudflareStreamFuncs");
    function isCloudflareRuntime() {
      if (typeof navigator === "object" && navigator !== null && typeof navigator.userAgent === "string") {
        return navigator.userAgent === "Cloudflare-Workers";
      }
      if (typeof Response === "function") {
        const resp = new Response(null, {
          cf: {
            thing: true
          }
        });
        if (typeof resp.cf === "object" && resp.cf !== null && resp.cf.thing) {
          return true;
        }
      }
      return false;
    }
    __name(isCloudflareRuntime, "isCloudflareRuntime");
    function getStreamFuncs() {
      if (isCloudflareRuntime()) {
        return getCloudflareStreamFuncs();
      }
      return getNodejsStreamFuncs();
    }
    __name(getStreamFuncs, "getStreamFuncs");
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/connection.js
var require_connection = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/connection.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var { parse, serialize } = require_dist();
    var stream = require_stream();
    var { getStream } = stream;
    var flushBuffer = serialize.flush();
    var syncBuffer = serialize.sync();
    var endBuffer = serialize.end();
    var Connection2 = class extends EventEmitter {
      static {
        __name(this, "Connection");
      }
      constructor(config) {
        super();
        config = config || {};
        this.stream = config.stream || getStream(config.ssl);
        if (typeof this.stream === "function") {
          this.stream = this.stream(config);
        }
        this._keepAlive = config.keepAlive;
        this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
        this.parsedStatements = {};
        this.ssl = config.ssl || false;
        this.sslNegotiation = config.sslNegotiation || "postgres";
        this._ending = false;
        this._emitMessage = false;
        const self = this;
        this.on("newListener", function(eventName) {
          if (eventName === "message") {
            self._emitMessage = true;
          }
        });
      }
      connect(port, host) {
        const self = this;
        this._connecting = true;
        this.stream.setNoDelay(true);
        this.stream.connect(port, host);
        this.stream.once("connect", function() {
          if (self._keepAlive) {
            self.stream.setKeepAlive(true, self._keepAliveInitialDelayMillis);
          }
          self.emit("connect");
        });
        const reportStreamError = /* @__PURE__ */ __name(function(error) {
          if (self._ending && (error.code === "ECONNRESET" || error.code === "EPIPE")) {
            return;
          }
          self.emit("error", error);
        }, "reportStreamError");
        this.stream.on("error", reportStreamError);
        this.stream.on("close", function() {
          self.emit("end");
        });
        if (!this.ssl) {
          return this.attachListeners(this.stream);
        }
        if (this.sslNegotiation === "direct") {
          return this.stream.once("connect", function() {
            self.upgradeToSSL(host, reportStreamError);
          });
        }
        this.stream.once("data", function(buffer) {
          const responseCode = buffer.toString("utf8");
          switch (responseCode) {
            case "S":
              break;
            case "N":
              self.stream.end();
              return self.emit("error", new Error("The server does not support SSL connections"));
            default:
              self.stream.end();
              return self.emit("error", new Error("There was an error establishing an SSL connection"));
          }
          self.upgradeToSSL(host, reportStreamError);
        });
      }
      upgradeToSSL(host, reportStreamError) {
        const self = this;
        const options = {
          socket: self.stream
        };
        if (self.ssl !== true) {
          Object.assign(options, self.ssl);
          if ("key" in self.ssl) {
            options.key = self.ssl.key;
          }
        }
        if (self.sslNegotiation === "direct") {
          options.ALPNProtocols = [
            "postgresql"
          ];
        }
        const net = require("net");
        if (net.isIP && net.isIP(host) === 0) {
          options.servername = host;
        }
        try {
          self.stream = stream.getSecureStream(options);
        } catch (err) {
          return self.emit("error", err);
        }
        self.attachListeners(self.stream);
        self.stream.on("error", reportStreamError);
        self.emit("sslconnect");
      }
      attachListeners(stream2) {
        parse(stream2, (msg) => {
          const eventName = msg.name === "error" ? "errorMessage" : msg.name;
          if (this._emitMessage) {
            this.emit("message", msg);
          }
          this.emit(eventName, msg);
        });
      }
      requestSsl() {
        this.stream.write(serialize.requestSsl());
      }
      startup(config) {
        this.stream.write(serialize.startup(config));
      }
      cancel(processID, secretKey) {
        this._send(serialize.cancel(processID, secretKey));
      }
      password(password) {
        this._send(serialize.password(password));
      }
      sendSASLInitialResponseMessage(mechanism, initialResponse) {
        this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
      }
      sendSCRAMClientFinalMessage(additionalData) {
        this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
      }
      _send(buffer) {
        if (!this.stream.writable) {
          return false;
        }
        return this.stream.write(buffer);
      }
      query(text) {
        this._send(serialize.query(text));
      }
      // send parse message
      parse(query2) {
        this._send(serialize.parse(query2));
      }
      // send bind message
      bind(config) {
        this._send(serialize.bind(config));
      }
      // send execute message
      execute(config) {
        this._send(serialize.execute(config));
      }
      flush() {
        if (this.stream.writable) {
          this.stream.write(flushBuffer);
        }
      }
      sync() {
        this._ending = true;
        this._send(syncBuffer);
      }
      ref() {
        this.stream.ref();
      }
      unref() {
        this.stream.unref();
      }
      end() {
        this._ending = true;
        if (!this._connecting || !this.stream.writable) {
          this.stream.end();
          return;
        }
        return this.stream.write(endBuffer, () => {
          this.stream.end();
        });
      }
      close(msg) {
        this._send(serialize.close(msg));
      }
      describe(msg) {
        this._send(serialize.describe(msg));
      }
      sendCopyFromChunk(chunk) {
        this._send(serialize.copyData(chunk));
      }
      endCopyFrom() {
        this._send(serialize.copyDone());
      }
      sendCopyFail(msg) {
        this._send(serialize.copyFail(msg));
      }
    };
    module2.exports = Connection2;
  }
});

// node_modules/.pnpm/split2@4.2.0/node_modules/split2/index.js
var require_split2 = __commonJS({
  "node_modules/.pnpm/split2@4.2.0/node_modules/split2/index.js"(exports, module2) {
    "use strict";
    var { Transform } = require("stream");
    var { StringDecoder } = require("string_decoder");
    var kLast = /* @__PURE__ */ Symbol("last");
    var kDecoder = /* @__PURE__ */ Symbol("decoder");
    function transform(chunk, enc, cb) {
      let list;
      if (this.overflow) {
        const buf = this[kDecoder].write(chunk);
        list = buf.split(this.matcher);
        if (list.length === 1) return cb();
        list.shift();
        this.overflow = false;
      } else {
        this[kLast] += this[kDecoder].write(chunk);
        list = this[kLast].split(this.matcher);
      }
      this[kLast] = list.pop();
      for (let i = 0; i < list.length; i++) {
        try {
          push(this, this.mapper(list[i]));
        } catch (error) {
          return cb(error);
        }
      }
      this.overflow = this[kLast].length > this.maxLength;
      if (this.overflow && !this.skipOverflow) {
        cb(new Error("maximum buffer reached"));
        return;
      }
      cb();
    }
    __name(transform, "transform");
    function flush(cb) {
      this[kLast] += this[kDecoder].end();
      if (this[kLast]) {
        try {
          push(this, this.mapper(this[kLast]));
        } catch (error) {
          return cb(error);
        }
      }
      cb();
    }
    __name(flush, "flush");
    function push(self, val) {
      if (val !== void 0) {
        self.push(val);
      }
    }
    __name(push, "push");
    function noop(incoming) {
      return incoming;
    }
    __name(noop, "noop");
    function split(matcher, mapper, options) {
      matcher = matcher || /\\r?\\n/;
      mapper = mapper || noop;
      options = options || {};
      switch (arguments.length) {
        case 1:
          if (typeof matcher === "function") {
            mapper = matcher;
            matcher = /\\r?\\n/;
          } else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
            options = matcher;
            matcher = /\\r?\\n/;
          }
          break;
        case 2:
          if (typeof matcher === "function") {
            options = mapper;
            mapper = matcher;
            matcher = /\\r?\\n/;
          } else if (typeof mapper === "object") {
            options = mapper;
            mapper = noop;
          }
      }
      options = Object.assign({}, options);
      options.autoDestroy = true;
      options.transform = transform;
      options.flush = flush;
      options.readableObjectMode = true;
      const stream = new Transform(options);
      stream[kLast] = "";
      stream[kDecoder] = new StringDecoder("utf8");
      stream.matcher = matcher;
      stream.mapper = mapper;
      stream.maxLength = options.maxLength;
      stream.skipOverflow = options.skipOverflow || false;
      stream.overflow = false;
      stream._destroy = function(err, cb) {
        this._writableState.errorEmitted = false;
        cb(err);
      };
      return stream;
    }
    __name(split, "split");
    module2.exports = split;
  }
});

// node_modules/.pnpm/pgpass@1.0.5/node_modules/pgpass/lib/helper.js
var require_helper = __commonJS({
  "node_modules/.pnpm/pgpass@1.0.5/node_modules/pgpass/lib/helper.js"(exports, module2) {
    "use strict";
    var path = require("path");
    var Stream = require("stream").Stream;
    var split = require_split2();
    var util = require("util");
    var defaultPort = 5432;
    var isWin = process.platform === "win32";
    var warnStream = process.stderr;
    var S_IRWXG = 56;
    var S_IRWXO = 7;
    var S_IFMT = 61440;
    var S_IFREG = 32768;
    function isRegFile(mode) {
      return (mode & S_IFMT) == S_IFREG;
    }
    __name(isRegFile, "isRegFile");
    var fieldNames = [
      "host",
      "port",
      "database",
      "user",
      "password"
    ];
    var nrOfFields = fieldNames.length;
    var passKey = fieldNames[nrOfFields - 1];
    function warn() {
      var isWritable = warnStream instanceof Stream && true === warnStream.writable;
      if (isWritable) {
        var args = Array.prototype.slice.call(arguments).concat("\\n");
        warnStream.write(util.format.apply(util, args));
      }
    }
    __name(warn, "warn");
    Object.defineProperty(module2.exports, "isWin", {
      get: /* @__PURE__ */ __name(function() {
        return isWin;
      }, "get"),
      set: /* @__PURE__ */ __name(function(val) {
        isWin = val;
      }, "set")
    });
    module2.exports.warnTo = function(stream) {
      var old = warnStream;
      warnStream = stream;
      return old;
    };
    module2.exports.getFileName = function(rawEnv) {
      var env = rawEnv || process.env;
      var file = env.PGPASSFILE || (isWin ? path.join(env.APPDATA || "./", "postgresql", "pgpass.conf") : path.join(env.HOME || "./", ".pgpass"));
      return file;
    };
    module2.exports.usePgPass = function(stats, fname) {
      if (Object.prototype.hasOwnProperty.call(process.env, "PGPASSWORD")) {
        return false;
      }
      if (isWin) {
        return true;
      }
      fname = fname || "<unkn>";
      if (!isRegFile(stats.mode)) {
        warn('WARNING: password file "%s" is not a plain file', fname);
        return false;
      }
      if (stats.mode & (S_IRWXG | S_IRWXO)) {
        warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
        return false;
      }
      return true;
    };
    var matcher = module2.exports.match = function(connInfo, entry) {
      return fieldNames.slice(0, -1).reduce(function(prev, field, idx) {
        if (idx == 1) {
          if (Number(connInfo[field] || defaultPort) === Number(entry[field])) {
            return prev && true;
          }
        }
        return prev && (entry[field] === "*" || entry[field] === connInfo[field]);
      }, true);
    };
    module2.exports.getPassword = function(connInfo, stream, cb) {
      var pass;
      var lineStream = stream.pipe(split());
      function onLine(line) {
        var entry = parseLine(line);
        if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
          pass = entry[passKey];
          lineStream.end();
        }
      }
      __name(onLine, "onLine");
      var onEnd = /* @__PURE__ */ __name(function() {
        stream.destroy();
        cb(pass);
      }, "onEnd");
      var onErr = /* @__PURE__ */ __name(function(err) {
        stream.destroy();
        warn("WARNING: error on reading file: %s", err);
        cb(void 0);
      }, "onErr");
      stream.on("error", onErr);
      lineStream.on("data", onLine).on("end", onEnd).on("error", onErr);
    };
    var parseLine = module2.exports.parseLine = function(line) {
      if (line.length < 11 || line.match(/^\\s+#/)) {
        return null;
      }
      var curChar = "";
      var prevChar = "";
      var fieldIdx = 0;
      var startIdx = 0;
      var endIdx = 0;
      var obj = {};
      var isLastField = false;
      var addToObj = /* @__PURE__ */ __name(function(idx, i0, i1) {
        var field = line.substring(i0, i1);
        if (!Object.hasOwnProperty.call(process.env, "PGPASS_NO_DEESCAPE")) {
          field = field.replace(/\\\\([:\\\\])/g, "\$1");
        }
        obj[fieldNames[idx]] = field;
      }, "addToObj");
      for (var i = 0; i < line.length - 1; i += 1) {
        curChar = line.charAt(i + 1);
        prevChar = line.charAt(i);
        isLastField = fieldIdx == nrOfFields - 1;
        if (isLastField) {
          addToObj(fieldIdx, startIdx);
          break;
        }
        if (i >= 0 && curChar == ":" && prevChar !== "\\\\") {
          addToObj(fieldIdx, startIdx, i + 1);
          startIdx = i + 2;
          fieldIdx += 1;
        }
      }
      obj = Object.keys(obj).length === nrOfFields ? obj : null;
      return obj;
    };
    var isValidEntry = module2.exports.isValidEntry = function(entry) {
      var rules = {
        // host
        0: function(x) {
          return x.length > 0;
        },
        // port
        1: function(x) {
          if (x === "*") {
            return true;
          }
          x = Number(x);
          return isFinite(x) && x > 0 && x < 9007199254740992 && Math.floor(x) === x;
        },
        // database
        2: function(x) {
          return x.length > 0;
        },
        // username
        3: function(x) {
          return x.length > 0;
        },
        // password
        4: function(x) {
          return x.length > 0;
        }
      };
      for (var idx = 0; idx < fieldNames.length; idx += 1) {
        var rule = rules[idx];
        var value = entry[fieldNames[idx]] || "";
        var res = rule(value);
        if (!res) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/.pnpm/pgpass@1.0.5/node_modules/pgpass/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/pgpass@1.0.5/node_modules/pgpass/lib/index.js"(exports, module2) {
    "use strict";
    var path = require("path");
    var fs = require("fs");
    var helper = require_helper();
    module2.exports = function(connInfo, cb) {
      var file = helper.getFileName();
      fs.stat(file, function(err, stat) {
        if (err || !helper.usePgPass(stat, file)) {
          return cb(void 0);
        }
        var st = fs.createReadStream(file);
        helper.getPassword(connInfo, st, cb);
      });
    };
    module2.exports.warnTo = helper.warnTo;
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/client.js
var require_client = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/client.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var utils = require_utils();
    var nodeUtils = require("util");
    var sasl = require_sasl();
    var TypeOverrides2 = require_type_overrides();
    var ConnectionParameters = require_connection_parameters();
    var Query2 = require_query();
    var defaults2 = require_defaults();
    var Connection2 = require_connection();
    var crypto = require_utils2();
    var activeQueryDeprecationNotice = nodeUtils.deprecate(() => {
    }, "Client.activeQuery is deprecated and will be removed in pg@9.0");
    var queryQueueDeprecationNotice = nodeUtils.deprecate(() => {
    }, "Client.queryQueue is deprecated and will be removed in pg@9.0.");
    var pgPassDeprecationNotice = nodeUtils.deprecate(() => {
    }, "pgpass support is deprecated and will be removed in pg@9.0. You can provide an async function as the password property to the Client/Pool constructor that returns a password instead. Within this function you can call the pgpass module in your own code.");
    var byoPromiseDeprecationNotice = nodeUtils.deprecate(() => {
    }, "Passing a custom Promise implementation to the Client/Pool constructor is deprecated and will be removed in pg@9.0.");
    var queryQueueLengthDeprecationNotice = nodeUtils.deprecate(() => {
    }, "Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use async/await or an external async flow control mechanism instead.");
    function coerceNumberOrDefault(value, defaultValue) {
      if (typeof value === "number") {
        return Number.isFinite(value) ? value : defaultValue;
      }
      if (typeof value === "string" && value.trim() !== "") {
        const n = Number(value);
        return Number.isFinite(n) ? n : defaultValue;
      }
      return defaultValue;
    }
    __name(coerceNumberOrDefault, "coerceNumberOrDefault");
    var Client2 = class extends EventEmitter {
      static {
        __name(this, "Client");
      }
      constructor(config) {
        super();
        this.connectionParameters = new ConnectionParameters(config);
        this.user = this.connectionParameters.user;
        this.database = this.connectionParameters.database;
        this.port = this.connectionParameters.port;
        this.host = this.connectionParameters.host;
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: this.connectionParameters.password
        });
        this.replication = this.connectionParameters.replication;
        const c = config || {};
        if (c.Promise) {
          byoPromiseDeprecationNotice();
        }
        this._Promise = c.Promise || global.Promise;
        this._types = new TypeOverrides2(c.types);
        this._ending = false;
        this._ended = false;
        this._connecting = false;
        this._connected = false;
        this._connectionError = false;
        this._queryable = true;
        this._activeQuery = null;
        this._txStatus = null;
        this.enableChannelBinding = Boolean(c.enableChannelBinding);
        this.scramMaxIterations = coerceNumberOrDefault(c.scramMaxIterations, sasl.DEFAULT_MAX_SCRAM_ITERATIONS);
        this.connection = c.connection || new Connection2({
          stream: c.stream,
          ssl: this.connectionParameters.ssl,
          sslNegotiation: this.connectionParameters.sslnegotiation,
          keepAlive: c.keepAlive || false,
          keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
          encoding: this.connectionParameters.client_encoding || "utf8"
        });
        this._queryQueue = [];
        this.binary = c.binary || defaults2.binary;
        this.processID = null;
        this.secretKey = null;
        this.ssl = this.connectionParameters.ssl || false;
        this.sslNegotiation = this.connectionParameters.sslnegotiation || "postgres";
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
      }
      get activeQuery() {
        activeQueryDeprecationNotice();
        return this._activeQuery;
      }
      set activeQuery(val) {
        activeQueryDeprecationNotice();
        this._activeQuery = val;
      }
      _getActiveQuery() {
        return this._activeQuery;
      }
      _errorAllQueries(err) {
        const enqueueError = /* @__PURE__ */ __name((query2) => {
          process.nextTick(() => {
            query2.handleError(err, this.connection);
          });
        }, "enqueueError");
        const activeQuery = this._getActiveQuery();
        if (activeQuery) {
          enqueueError(activeQuery);
          this._activeQuery = null;
        }
        this._queryQueue.forEach(enqueueError);
        this._queryQueue.length = 0;
      }
      _connect(callback) {
        const self = this;
        const con = this.connection;
        this._connectionCallback = callback;
        if (this._connecting || this._connected) {
          const err = new Error("Client has already been connected. You cannot reuse a client.");
          process.nextTick(() => {
            callback(err);
          });
          return;
        }
        this._connecting = true;
        if (this._connectionTimeoutMillis > 0) {
          this.connectionTimeoutHandle = setTimeout(() => {
            con._ending = true;
            con.stream.destroy(new Error("timeout expired"));
          }, this._connectionTimeoutMillis);
          if (this.connectionTimeoutHandle.unref) {
            this.connectionTimeoutHandle.unref();
          }
        }
        if (this.host && this.host.indexOf("/") === 0) {
          con.connect(this.host + "/.s.PGSQL." + this.port);
        } else {
          con.connect(this.port, this.host);
        }
        con.on("connect", function() {
          if (self.ssl) {
            if (self.sslNegotiation !== "direct") {
              con.requestSsl();
            }
          } else {
            con.startup(self.getStartupConf());
          }
        });
        con.on("sslconnect", function() {
          con.startup(self.getStartupConf());
        });
        this._attachListeners(con);
        con.once("end", () => {
          const error = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
          clearTimeout(this.connectionTimeoutHandle);
          this._errorAllQueries(error);
          this._ended = true;
          if (!this._ending) {
            if (this._connecting && !this._connectionError) {
              if (this._connectionCallback) {
                this._connectionCallback(error);
              } else {
                this._handleErrorEvent(error);
              }
            } else if (!this._connectionError) {
              this._handleErrorEvent(error);
            }
          }
          process.nextTick(() => {
            this.emit("end");
          });
        });
      }
      connect(callback) {
        if (callback) {
          this._connect(callback);
          return;
        }
        return new this._Promise((resolve, reject) => {
          this._connect((error) => {
            if (error) {
              reject(error);
            } else {
              resolve(this);
            }
          });
        });
      }
      _attachListeners(con) {
        con.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this));
        con.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this));
        con.on("authenticationSASL", this._handleAuthSASL.bind(this));
        con.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this));
        con.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this));
        con.on("backendKeyData", this._handleBackendKeyData.bind(this));
        con.on("error", this._handleErrorEvent.bind(this));
        con.on("errorMessage", this._handleErrorMessage.bind(this));
        con.on("readyForQuery", this._handleReadyForQuery.bind(this));
        con.on("notice", this._handleNotice.bind(this));
        con.on("rowDescription", this._handleRowDescription.bind(this));
        con.on("dataRow", this._handleDataRow.bind(this));
        con.on("portalSuspended", this._handlePortalSuspended.bind(this));
        con.on("emptyQuery", this._handleEmptyQuery.bind(this));
        con.on("commandComplete", this._handleCommandComplete.bind(this));
        con.on("parseComplete", this._handleParseComplete.bind(this));
        con.on("copyInResponse", this._handleCopyInResponse.bind(this));
        con.on("copyData", this._handleCopyData.bind(this));
        con.on("notification", this._handleNotification.bind(this));
      }
      _getPassword(cb) {
        const con = this.connection;
        if (typeof this.password === "function") {
          this._Promise.resolve().then(() => this.password(this.connectionParameters)).then((pass) => {
            if (pass !== void 0) {
              if (typeof pass !== "string") {
                con.emit("error", new TypeError("Password must be a string"));
                return;
              }
              this.connectionParameters.password = this.password = pass;
            } else {
              this.connectionParameters.password = this.password = null;
            }
            cb();
          }).catch((err) => {
            con.emit("error", err);
          });
        } else if (this.password !== null) {
          cb();
        } else {
          try {
            const pgPass = require_lib();
            pgPass(this.connectionParameters, (pass) => {
              if (void 0 !== pass) {
                pgPassDeprecationNotice();
                this.connectionParameters.password = this.password = pass;
              }
              cb();
            });
          } catch (e) {
            this.emit("error", e);
          }
        }
      }
      _handleAuthCleartextPassword(msg) {
        this._getPassword(() => {
          this.connection.password(this.password);
        });
      }
      _handleAuthMD5Password(msg) {
        this._getPassword(async () => {
          try {
            const hashedPassword = await crypto.postgresMd5PasswordHash(this.user, this.password, msg.salt);
            this.connection.password(hashedPassword);
          } catch (e) {
            this.emit("error", e);
          }
        });
      }
      _handleAuthSASL(msg) {
        this._getPassword(() => {
          try {
            this.saslSession = sasl.startSession(msg.mechanisms, this.enableChannelBinding && this.connection.stream, this.scramMaxIterations);
            this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
          } catch (err) {
            this.connection.emit("error", err);
          }
        });
      }
      async _handleAuthSASLContinue(msg) {
        try {
          await sasl.continueSession(this.saslSession, this.password, msg.data, this.enableChannelBinding && this.connection.stream);
          this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleAuthSASLFinal(msg) {
        try {
          sasl.finalizeSession(this.saslSession, msg.data);
          this.saslSession = null;
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleBackendKeyData(msg) {
        this.processID = msg.processID;
        this.secretKey = msg.secretKey;
      }
      _handleReadyForQuery(msg) {
        if (this._connecting) {
          this._connecting = false;
          this._connected = true;
          clearTimeout(this.connectionTimeoutHandle);
          if (this._connectionCallback) {
            this._connectionCallback(null, this);
            this._connectionCallback = null;
          }
          this.emit("connect");
        }
        const activeQuery = this._getActiveQuery();
        this._activeQuery = null;
        this._txStatus = msg?.status ?? null;
        this.readyForQuery = true;
        if (activeQuery) {
          activeQuery.handleReadyForQuery(this.connection);
        }
        this._pulseQueryQueue();
      }
      // if we receive an error event or error message
      // during the connection process we handle it here
      _handleErrorWhileConnecting(err) {
        if (this._connectionError) {
          return;
        }
        this._connectionError = true;
        clearTimeout(this.connectionTimeoutHandle);
        if (this._connectionCallback) {
          return this._connectionCallback(err);
        }
        this.emit("error", err);
      }
      // if we're connected and we receive an error event from the connection
      // this means the socket is dead - do a hard abort of all queries and emit
      // the socket error on the client as well
      _handleErrorEvent(err) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(err);
        }
        this._queryable = false;
        this._errorAllQueries(err);
        this.emit("error", err);
      }
      // handle error messages from the postgres backend
      _handleErrorMessage(msg) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(msg);
        }
        const activeQuery = this._getActiveQuery();
        if (!activeQuery) {
          this._handleErrorEvent(msg);
          return;
        }
        this._activeQuery = null;
        activeQuery.handleError(msg, this.connection);
      }
      _handleRowDescription(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected rowDescription message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleRowDescription(msg);
      }
      _handleDataRow(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected dataRow message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleDataRow(msg);
      }
      _handlePortalSuspended(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected portalSuspended message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handlePortalSuspended(this.connection);
      }
      _handleEmptyQuery(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected emptyQuery message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleEmptyQuery(this.connection);
      }
      _handleCommandComplete(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected commandComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCommandComplete(msg, this.connection);
      }
      _handleParseComplete() {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected parseComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        if (activeQuery.name) {
          this.connection.parsedStatements[activeQuery.name] = activeQuery.text;
        }
      }
      _handleCopyInResponse(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyInResponse message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyInResponse(this.connection);
      }
      _handleCopyData(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyData message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyData(msg, this.connection);
      }
      _handleNotification(msg) {
        this.emit("notification", msg);
      }
      _handleNotice(msg) {
        this.emit("notice", msg);
      }
      getStartupConf() {
        const params = this.connectionParameters;
        const data = {
          user: params.user,
          database: params.database
        };
        const appName = params.application_name || params.fallback_application_name;
        if (appName) {
          data.application_name = appName;
        }
        if (params.replication) {
          data.replication = "" + params.replication;
        }
        if (params.statement_timeout) {
          data.statement_timeout = String(parseInt(params.statement_timeout, 10));
        }
        if (params.lock_timeout) {
          data.lock_timeout = String(parseInt(params.lock_timeout, 10));
        }
        if (params.idle_in_transaction_session_timeout) {
          data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
        }
        if (params.options) {
          data.options = params.options;
        }
        return data;
      }
      cancel(client, query2) {
        if (client.activeQuery === query2) {
          const con = this.connection;
          if (this.host && this.host.indexOf("/") === 0) {
            con.connect(this.host + "/.s.PGSQL." + this.port);
          } else {
            con.connect(this.port, this.host);
          }
          con.on("connect", function() {
            con.cancel(client.processID, client.secretKey);
          });
        } else if (client._queryQueue.indexOf(query2) !== -1) {
          client._queryQueue.splice(client._queryQueue.indexOf(query2), 1);
        }
      }
      setTypeParser(oid, format, parseFn) {
        return this._types.setTypeParser(oid, format, parseFn);
      }
      getTypeParser(oid, format) {
        return this._types.getTypeParser(oid, format);
      }
      // escapeIdentifier and escapeLiteral moved to utility functions & exported
      // on PG
      // re-exported here for backwards compatibility
      escapeIdentifier(str) {
        return utils.escapeIdentifier(str);
      }
      escapeLiteral(str) {
        return utils.escapeLiteral(str);
      }
      _pulseQueryQueue() {
        if (this.readyForQuery === true) {
          this._activeQuery = this._queryQueue.shift();
          const activeQuery = this._getActiveQuery();
          if (activeQuery) {
            this.readyForQuery = false;
            this.hasExecuted = true;
            const queryError = activeQuery.submit(this.connection);
            if (queryError) {
              process.nextTick(() => {
                activeQuery.handleError(queryError, this.connection);
                this.readyForQuery = true;
                this._pulseQueryQueue();
              });
            }
          } else if (this.hasExecuted) {
            this._activeQuery = null;
            this.emit("drain");
          }
        }
      }
      query(config, values, callback) {
        let query2;
        let result;
        if (config == null) {
          throw new TypeError("Client was passed a null or undefined query");
        }
        if (typeof config.submit === "function") {
          result = query2 = config;
          if (!query2.callback) {
            if (typeof values === "function") {
              query2.callback = values;
            } else if (callback) {
              query2.callback = callback;
            }
          }
        } else {
          query2 = new Query2(config, values, callback);
          if (!query2.callback) {
            result = new this._Promise((resolve, reject) => {
              query2.callback = (err, res) => err ? reject(err) : resolve(res);
            }).catch((err) => {
              Error.captureStackTrace(err);
              throw err;
            });
          } else if (typeof query2.callback !== "function") {
            throw new TypeError("callback is not a function");
          }
        }
        const readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        if (readTimeout) {
          const queryCallback = query2.callback || (() => {
          });
          const readTimeoutTimer = setTimeout(() => {
            const error = new Error("Query read timeout");
            process.nextTick(() => {
              query2.handleError(error, this.connection);
            });
            queryCallback(error);
            query2.callback = () => {
            };
            const index = this._queryQueue.indexOf(query2);
            if (index > -1) {
              this._queryQueue.splice(index, 1);
            }
            this._pulseQueryQueue();
          }, readTimeout);
          query2.callback = (err, res) => {
            clearTimeout(readTimeoutTimer);
            queryCallback(err, res);
          };
        }
        if (this.binary && !query2.binary) {
          query2.binary = true;
        }
        if (query2._result && !query2._result._types) {
          query2._result._types = this._types;
        }
        if (!this._queryable) {
          process.nextTick(() => {
            query2.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._ending) {
          process.nextTick(() => {
            query2.handleError(new Error("Client was closed and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._queryQueue.length > 0) {
          queryQueueLengthDeprecationNotice();
        }
        this._queryQueue.push(query2);
        this._pulseQueryQueue();
        return result;
      }
      ref() {
        this.connection.ref();
      }
      unref() {
        this.connection.unref();
      }
      getTransactionStatus() {
        return this._txStatus;
      }
      end(cb) {
        this._ending = true;
        if (!this.connection._connecting || this._ended) {
          if (cb) {
            cb();
            return;
          } else {
            return this._Promise.resolve();
          }
        }
        if (this._getActiveQuery() || !this._queryable) {
          this.connection.stream.destroy();
        } else {
          this.connection.end();
        }
        if (cb) {
          this.connection.once("end", cb);
        } else {
          return new this._Promise((resolve) => {
            this.connection.once("end", resolve);
          });
        }
      }
      get queryQueue() {
        queryQueueDeprecationNotice();
        return this._queryQueue;
      }
    };
    Client2.Query = Query2;
    module2.exports = Client2;
  }
});

// node_modules/.pnpm/pg-pool@3.14.0_pg@8.22.0/node_modules/pg-pool/index.js
var require_pg_pool = __commonJS({
  "node_modules/.pnpm/pg-pool@3.14.0_pg@8.22.0/node_modules/pg-pool/index.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var NOOP = /* @__PURE__ */ __name(function() {
    }, "NOOP");
    var removeWhere = /* @__PURE__ */ __name((list, predicate) => {
      const i = list.findIndex(predicate);
      return i === -1 ? void 0 : list.splice(i, 1)[0];
    }, "removeWhere");
    var IdleItem = class {
      static {
        __name(this, "IdleItem");
      }
      constructor(client, idleListener, timeoutId) {
        this.client = client;
        this.idleListener = idleListener;
        this.timeoutId = timeoutId;
      }
    };
    var PendingItem = class {
      static {
        __name(this, "PendingItem");
      }
      constructor(callback) {
        this.callback = callback;
      }
    };
    function throwOnDoubleRelease() {
      throw new Error("Release called on client which has already been released to the pool.");
    }
    __name(throwOnDoubleRelease, "throwOnDoubleRelease");
    function promisify(Promise2, callback) {
      if (callback) {
        return {
          callback,
          result: void 0
        };
      }
      let rej;
      let res;
      const cb = /* @__PURE__ */ __name(function(err, client) {
        err ? rej(err) : res(client);
      }, "cb");
      const result = new Promise2(function(resolve, reject) {
        res = resolve;
        rej = reject;
      }).catch((err) => {
        Error.captureStackTrace(err);
        throw err;
      });
      return {
        callback: cb,
        result
      };
    }
    __name(promisify, "promisify");
    function makeIdleListener(pool2, client) {
      return /* @__PURE__ */ __name(function idleListener(err) {
        err.client = client;
        client.removeListener("error", idleListener);
        client.on("error", () => {
          pool2.log("additional client error after disconnection due to error", err);
        });
        pool2._remove(client);
        pool2.emit("error", err, client);
      }, "idleListener");
    }
    __name(makeIdleListener, "makeIdleListener");
    var Pool2 = class extends EventEmitter {
      static {
        __name(this, "Pool");
      }
      constructor(options, Client2) {
        super();
        this.options = Object.assign({}, options);
        if (options != null && "password" in options) {
          Object.defineProperty(this.options, "password", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: options.password
          });
        }
        if (options != null && options.ssl && options.ssl.key) {
          Object.defineProperty(this.options.ssl, "key", {
            enumerable: false
          });
        }
        this.options.max = this.options.max || this.options.poolSize || 10;
        this.options.min = this.options.min || 0;
        this.options.maxUses = this.options.maxUses || Infinity;
        this.options.allowExitOnIdle = this.options.allowExitOnIdle || false;
        this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0;
        this.log = this.options.log || function() {
        };
        this.Client = this.options.Client || Client2 || require_lib2().Client;
        this.Promise = this.options.Promise || global.Promise;
        if (typeof this.options.idleTimeoutMillis === "undefined") {
          this.options.idleTimeoutMillis = 1e4;
        }
        this._clients = [];
        this._idle = [];
        this._expired = /* @__PURE__ */ new WeakSet();
        this._pendingQueue = [];
        this._endCallback = void 0;
        this.ending = false;
        this.ended = false;
      }
      _promiseTry(f) {
        const Promise2 = this.Promise;
        if (typeof Promise2.try === "function") {
          return Promise2.try(f);
        }
        return new Promise2((resolve) => resolve(f()));
      }
      _isFull() {
        return this._clients.length >= this.options.max;
      }
      _isAboveMin() {
        return this._clients.length > this.options.min;
      }
      _pulseQueue() {
        this.log("pulse queue");
        if (this.ended) {
          this.log("pulse queue ended");
          return;
        }
        if (this.ending) {
          this.log("pulse queue on ending");
          if (this._idle.length) {
            this._idle.slice().map((item) => {
              this._remove(item.client);
            });
          }
          if (!this._clients.length) {
            this.ended = true;
            this._endCallback();
          }
          return;
        }
        if (!this._pendingQueue.length) {
          this.log("no queued requests");
          return;
        }
        if (!this._idle.length && this._isFull()) {
          return;
        }
        const pendingItem = this._pendingQueue.shift();
        if (this._idle.length) {
          const idleItem = this._idle.pop();
          clearTimeout(idleItem.timeoutId);
          const client = idleItem.client;
          client.ref && client.ref();
          const idleListener = idleItem.idleListener;
          return this._acquireClient(client, pendingItem, idleListener, false);
        }
        if (!this._isFull()) {
          return this.newClient(pendingItem);
        }
        throw new Error("unexpected condition");
      }
      _remove(client, callback) {
        const removed = removeWhere(this._idle, (item) => item.client === client);
        if (removed !== void 0) {
          clearTimeout(removed.timeoutId);
        }
        this._clients = this._clients.filter((c) => c !== client);
        const context = this;
        client.end(() => {
          context.emit("remove", client);
          if (typeof callback === "function") {
            callback();
          }
        });
      }
      connect(cb) {
        if (this.ending) {
          const err = new Error("Cannot use a pool after calling end on the pool");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        const response = promisify(this.Promise, cb);
        const result = response.result;
        if (this._isFull() || this._idle.length) {
          if (this._idle.length) {
            process.nextTick(() => this._pulseQueue());
          }
          if (!this.options.connectionTimeoutMillis) {
            this._pendingQueue.push(new PendingItem(response.callback));
            return result;
          }
          const queueCallback = /* @__PURE__ */ __name((err, res, done) => {
            clearTimeout(tid);
            response.callback(err, res, done);
          }, "queueCallback");
          const pendingItem = new PendingItem(queueCallback);
          const tid = setTimeout(() => {
            removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
            pendingItem.timedOut = true;
            response.callback(new Error("timeout exceeded when trying to connect"));
          }, this.options.connectionTimeoutMillis);
          if (tid.unref) {
            tid.unref();
          }
          this._pendingQueue.push(pendingItem);
          return result;
        }
        this.newClient(new PendingItem(response.callback));
        return result;
      }
      newClient(pendingItem) {
        const client = new this.Client(this.options);
        this._clients.push(client);
        const idleListener = makeIdleListener(this, client);
        this.log("checking client timeout");
        let tid;
        let timeoutHit = false;
        if (this.options.connectionTimeoutMillis) {
          tid = setTimeout(() => {
            if (client.connection) {
              this.log("ending client due to timeout");
              timeoutHit = true;
              client.connection.stream.destroy();
            } else if (!client.isConnected()) {
              this.log("ending client due to timeout");
              timeoutHit = true;
              client.end();
            }
          }, this.options.connectionTimeoutMillis);
        }
        this.log("connecting new client");
        client.connect((err) => {
          if (tid) {
            clearTimeout(tid);
          }
          client.on("error", idleListener);
          if (err) {
            this.log("client failed to connect", err);
            this._clients = this._clients.filter((c) => c !== client);
            if (timeoutHit) {
              err = new Error("Connection terminated due to connection timeout", {
                cause: err
              });
            }
            this._pulseQueue();
            if (!pendingItem.timedOut) {
              pendingItem.callback(err, void 0, NOOP);
            }
          } else {
            this.log("new client connected");
            if (this.options.onConnect) {
              this._promiseTry(() => this.options.onConnect(client)).then(() => {
                this._afterConnect(client, pendingItem, idleListener);
              }, (hookErr) => {
                this._clients = this._clients.filter((c) => c !== client);
                client.end(() => {
                  this._pulseQueue();
                  if (!pendingItem.timedOut) {
                    pendingItem.callback(hookErr, void 0, NOOP);
                  }
                });
              });
              return;
            }
            return this._afterConnect(client, pendingItem, idleListener);
          }
        });
      }
      _afterConnect(client, pendingItem, idleListener) {
        if (this.options.maxLifetimeSeconds !== 0) {
          const maxLifetimeTimeout = setTimeout(() => {
            this.log("ending client due to expired lifetime");
            this._expired.add(client);
            const idleIndex = this._idle.findIndex((idleItem) => idleItem.client === client);
            if (idleIndex !== -1) {
              this._acquireClient(client, new PendingItem((err, client2, clientRelease) => clientRelease()), idleListener, false);
            }
          }, this.options.maxLifetimeSeconds * 1e3);
          maxLifetimeTimeout.unref();
          client.once("end", () => clearTimeout(maxLifetimeTimeout));
        }
        return this._acquireClient(client, pendingItem, idleListener, true);
      }
      // acquire a client for a pending work item
      _acquireClient(client, pendingItem, idleListener, isNew) {
        if (isNew) {
          this.emit("connect", client);
        }
        this.emit("acquire", client);
        client.release = this._releaseOnce(client, idleListener);
        client.removeListener("error", idleListener);
        if (!pendingItem.timedOut) {
          if (isNew && this.options.verify) {
            this.options.verify(client, (err) => {
              if (err) {
                client.release(err);
                return pendingItem.callback(err, void 0, NOOP);
              }
              pendingItem.callback(void 0, client, client.release);
            });
          } else {
            pendingItem.callback(void 0, client, client.release);
          }
        } else {
          if (isNew && this.options.verify) {
            this.options.verify(client, client.release);
          } else {
            client.release();
          }
        }
      }
      // returns a function that wraps _release and throws if called more than once
      _releaseOnce(client, idleListener) {
        let released = false;
        return (err) => {
          if (released) {
            throwOnDoubleRelease();
          }
          released = true;
          this._release(client, idleListener, err);
        };
      }
      // release a client back to the poll, include an error
      // to remove it from the pool
      _release(client, idleListener, err) {
        client.on("error", idleListener);
        client._poolUseCount = (client._poolUseCount || 0) + 1;
        this.emit("release", err, client);
        if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
          if (client._poolUseCount >= this.options.maxUses) {
            this.log("remove expended client");
          }
          return this._remove(client, this._pulseQueue.bind(this));
        }
        const isExpired = this._expired.has(client);
        if (isExpired) {
          this.log("remove expired client");
          this._expired.delete(client);
          return this._remove(client, this._pulseQueue.bind(this));
        }
        let tid;
        if (this.options.idleTimeoutMillis && this._isAboveMin()) {
          tid = setTimeout(() => {
            if (this._isAboveMin()) {
              this.log("remove idle client");
              this._remove(client, this._pulseQueue.bind(this));
            }
          }, this.options.idleTimeoutMillis);
          if (this.options.allowExitOnIdle) {
            tid.unref();
          }
        }
        if (this.options.allowExitOnIdle) {
          client.unref();
        }
        this._idle.push(new IdleItem(client, idleListener, tid));
        this._pulseQueue();
      }
      query(text, values, cb) {
        if (typeof text === "function") {
          const response2 = promisify(this.Promise, text);
          setImmediate(function() {
            return response2.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
          });
          return response2.result;
        }
        if (typeof values === "function") {
          cb = values;
          values = void 0;
        }
        const response = promisify(this.Promise, cb);
        cb = response.callback;
        this.connect((err, client) => {
          if (err) {
            return cb(err);
          }
          let clientReleased = false;
          const onError = /* @__PURE__ */ __name((err2) => {
            if (clientReleased) {
              return;
            }
            clientReleased = true;
            client.release(err2);
            cb(err2);
          }, "onError");
          client.once("error", onError);
          this.log("dispatching query");
          try {
            client.query(text, values, (err2, res) => {
              this.log("query dispatched");
              client.removeListener("error", onError);
              if (clientReleased) {
                return;
              }
              clientReleased = true;
              client.release(err2);
              if (err2) {
                return cb(err2);
              }
              return cb(void 0, res);
            });
          } catch (err2) {
            client.release(err2);
            return cb(err2);
          }
        });
        return response.result;
      }
      end(cb) {
        this.log("ending");
        if (this.ending) {
          const err = new Error("Called end on pool more than once");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        this.ending = true;
        const promised = promisify(this.Promise, cb);
        this._endCallback = promised.callback;
        this._pulseQueue();
        return promised.result;
      }
      get waitingCount() {
        return this._pendingQueue.length;
      }
      get idleCount() {
        return this._idle.length;
      }
      get expiredCount() {
        return this._clients.reduce((acc, client) => acc + (this._expired.has(client) ? 1 : 0), 0);
      }
      get totalCount() {
        return this._clients.length;
      }
    };
    module2.exports = Pool2;
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/native/query.js
var require_query2 = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/native/query.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var util = require("util");
    var utils = require_utils();
    var NativeQuery = module2.exports = function(config, values, callback) {
      EventEmitter.call(this);
      config = utils.normalizeQueryConfig(config, values, callback);
      this.text = config.text;
      this.values = config.values;
      this.name = config.name;
      this.queryMode = config.queryMode;
      this.callback = config.callback;
      this.state = "new";
      this._arrayMode = config.rowMode === "array";
      this._emitRowEvents = false;
      this.on("newListener", (function(event) {
        if (event === "row") this._emitRowEvents = true;
      }).bind(this));
    };
    util.inherits(NativeQuery, EventEmitter);
    var errorFieldMap = {
      sqlState: "code",
      statementPosition: "position",
      messagePrimary: "message",
      context: "where",
      schemaName: "schema",
      tableName: "table",
      columnName: "column",
      dataTypeName: "dataType",
      constraintName: "constraint",
      sourceFile: "file",
      sourceLine: "line",
      sourceFunction: "routine"
    };
    NativeQuery.prototype.handleError = function(err) {
      const fields = this.native.pq.resultErrorFields();
      if (fields) {
        for (const key in fields) {
          const normalizedFieldName = errorFieldMap[key] || key;
          err[normalizedFieldName] = fields[key];
        }
      }
      if (this.callback) {
        this.callback(err);
      } else {
        this.emit("error", err);
      }
      this.state = "error";
    };
    NativeQuery.prototype.then = function(onSuccess, onFailure) {
      return this._getPromise().then(onSuccess, onFailure);
    };
    NativeQuery.prototype.catch = function(callback) {
      return this._getPromise().catch(callback);
    };
    NativeQuery.prototype._getPromise = function() {
      if (this._promise) return this._promise;
      this._promise = new Promise((function(resolve, reject) {
        this._once("end", resolve);
        this._once("error", reject);
      }).bind(this));
      return this._promise;
    };
    NativeQuery.prototype.submit = function(client) {
      this.state = "running";
      const self = this;
      this.native = client.native;
      client.native.arrayMode = this._arrayMode;
      let after = /* @__PURE__ */ __name(function(err, rows, results) {
        client.native.arrayMode = false;
        setImmediate(function() {
          self.emit("_done");
        });
        if (err) {
          return self.handleError(err);
        }
        if (self._emitRowEvents) {
          if (results.length > 1) {
            rows.forEach((rowOfRows, i) => {
              rowOfRows.forEach((row) => {
                self.emit("row", row, results[i]);
              });
            });
          } else {
            rows.forEach(function(row) {
              self.emit("row", row, results);
            });
          }
        }
        self.state = "end";
        self.emit("end", results);
        if (self.callback) {
          self.callback(null, results);
        }
      }, "after");
      if (process.domain) {
        after = process.domain.bind(after);
      }
      if (this.name) {
        if (this.name.length > 63) {
          console.error("Warning! Postgres only supports 63 characters for query names.");
          console.error("You supplied %s (%s)", this.name, this.name.length);
          console.error("This can cause conflicts and silent errors executing queries");
        }
        const values = (this.values || []).map(utils.prepareValue);
        if (client.namedQueries[this.name]) {
          if (this.text && client.namedQueries[this.name] !== this.text) {
            const err = new Error(\`Prepared statements must be unique - '\${this.name}' was used for a different statement\`);
            return after(err);
          }
          return client.native.execute(this.name, values, after);
        }
        return client.native.prepare(this.name, this.text, values.length, function(err) {
          if (err) return after(err);
          client.namedQueries[self.name] = self.text;
          return self.native.execute(self.name, values, after);
        });
      } else if (this.values) {
        if (!Array.isArray(this.values)) {
          const err = new Error("Query values must be an array");
          return after(err);
        }
        const vals = this.values.map(utils.prepareValue);
        client.native.query(this.text, vals, after);
      } else if (this.queryMode === "extended") {
        client.native.query(this.text, [], after);
      } else {
        client.native.query(this.text, after);
      }
    };
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/native/client.js
var require_client2 = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/native/client.js"(exports, module2) {
    "use strict";
    var nodeUtils = require("util");
    var Native;
    try {
      Native = require("pg-native");
    } catch (e) {
      throw e;
    }
    var TypeOverrides2 = require_type_overrides();
    var EventEmitter = require("events").EventEmitter;
    var util = require("util");
    var ConnectionParameters = require_connection_parameters();
    var NativeQuery = require_query2();
    var queryQueueLengthDeprecationNotice = nodeUtils.deprecate(() => {
    }, "Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use async/await or an external async flow control mechanism instead.");
    var Client2 = module2.exports = function(config) {
      EventEmitter.call(this);
      config = config || {};
      this._Promise = config.Promise || global.Promise;
      this._types = new TypeOverrides2(config.types);
      this.native = new Native({
        types: this._types
      });
      this._queryQueue = [];
      this._ending = false;
      this._connecting = false;
      this._connected = false;
      this._queryable = true;
      const cp = this.connectionParameters = new ConnectionParameters(config);
      if (config.nativeConnectionString) cp.nativeConnectionString = config.nativeConnectionString;
      this.user = cp.user;
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: cp.password
      });
      this.database = cp.database;
      this.host = cp.host;
      this.port = cp.port;
      this.namedQueries = {};
    };
    Client2.Query = NativeQuery;
    util.inherits(Client2, EventEmitter);
    Client2.prototype._errorAllQueries = function(err) {
      const enqueueError = /* @__PURE__ */ __name((query2) => {
        process.nextTick(() => {
          query2.native = this.native;
          query2.handleError(err);
        });
      }, "enqueueError");
      if (this._hasActiveQuery()) {
        enqueueError(this._activeQuery);
        this._activeQuery = null;
      }
      this._queryQueue.forEach(enqueueError);
      this._queryQueue.length = 0;
    };
    Client2.prototype._connect = function(cb) {
      const self = this;
      if (this._connecting) {
        process.nextTick(() => cb(new Error("Client has already been connected. You cannot reuse a client.")));
        return;
      }
      this._connecting = true;
      this.connectionParameters.getLibpqConnectionString(function(err, conString) {
        if (self.connectionParameters.nativeConnectionString) conString = self.connectionParameters.nativeConnectionString;
        if (err) return cb(err);
        self.native.connect(conString, function(err2) {
          if (err2) {
            self.native.end();
            return cb(err2);
          }
          self._connected = true;
          self.native.on("error", function(err3) {
            self._queryable = false;
            self._errorAllQueries(err3);
            self.emit("error", err3);
          });
          self.native.on("notification", function(msg) {
            self.emit("notification", {
              channel: msg.relname,
              payload: msg.extra
            });
          });
          self.emit("connect");
          self._pulseQueryQueue(true);
          cb(null, this);
        });
      });
    };
    Client2.prototype.connect = function(callback) {
      if (callback) {
        this._connect(callback);
        return;
      }
      return new this._Promise((resolve, reject) => {
        this._connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve(this);
          }
        });
      });
    };
    Client2.prototype.query = function(config, values, callback) {
      let query2;
      let result;
      let readTimeout;
      let readTimeoutTimer;
      let queryCallback;
      if (config === null || config === void 0) {
        throw new TypeError("Client was passed a null or undefined query");
      } else if (typeof config.submit === "function") {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        result = query2 = config;
        if (typeof values === "function") {
          config.callback = values;
        }
      } else {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        query2 = new NativeQuery(config, values, callback);
        if (!query2.callback) {
          let resolveOut, rejectOut;
          result = new this._Promise((resolve, reject) => {
            resolveOut = resolve;
            rejectOut = reject;
          }).catch((err) => {
            Error.captureStackTrace(err);
            throw err;
          });
          query2.callback = (err, res) => err ? rejectOut(err) : resolveOut(res);
        }
      }
      if (readTimeout) {
        queryCallback = query2.callback || (() => {
        });
        readTimeoutTimer = setTimeout(() => {
          const error = new Error("Query read timeout");
          process.nextTick(() => {
            query2.handleError(error, this.connection);
          });
          queryCallback(error);
          query2.callback = () => {
          };
          const index = this._queryQueue.indexOf(query2);
          if (index > -1) {
            this._queryQueue.splice(index, 1);
          }
          this._pulseQueryQueue();
        }, readTimeout);
        query2.callback = (err, res) => {
          clearTimeout(readTimeoutTimer);
          queryCallback(err, res);
        };
      }
      if (!this._queryable) {
        query2.native = this.native;
        process.nextTick(() => {
          query2.handleError(new Error("Client has encountered a connection error and is not queryable"));
        });
        return result;
      }
      if (this._ending) {
        query2.native = this.native;
        process.nextTick(() => {
          query2.handleError(new Error("Client was closed and is not queryable"));
        });
        return result;
      }
      if (this._queryQueue.length > 0) {
        queryQueueLengthDeprecationNotice();
      }
      this._queryQueue.push(query2);
      this._pulseQueryQueue();
      return result;
    };
    Client2.prototype.end = function(cb) {
      const self = this;
      this._ending = true;
      if (this._connecting && !this._connected) {
        this.once("connect", () => {
          this.end(() => {
          });
        });
      }
      let result;
      if (!cb) {
        result = new this._Promise(function(resolve, reject) {
          cb = /* @__PURE__ */ __name((err) => err ? reject(err) : resolve(), "cb");
        });
      }
      this.native.end(function() {
        self._connected = false;
        self._errorAllQueries(new Error("Connection terminated"));
        process.nextTick(() => {
          self.emit("end");
          if (cb) cb();
        });
      });
      return result;
    };
    Client2.prototype._hasActiveQuery = function() {
      return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
    };
    Client2.prototype._pulseQueryQueue = function(initialConnection) {
      if (!this._connected) {
        return;
      }
      if (this._hasActiveQuery()) {
        return;
      }
      const query2 = this._queryQueue.shift();
      if (!query2) {
        if (!initialConnection) {
          this.emit("drain");
        }
        return;
      }
      this._activeQuery = query2;
      query2.submit(this);
      const self = this;
      query2.once("_done", function() {
        self._pulseQueryQueue();
      });
    };
    Client2.prototype.cancel = function(query2) {
      if (this._activeQuery === query2) {
        this.native.cancel(function() {
        });
      } else if (this._queryQueue.indexOf(query2) !== -1) {
        this._queryQueue.splice(this._queryQueue.indexOf(query2), 1);
      }
    };
    Client2.prototype.ref = function() {
    };
    Client2.prototype.unref = function() {
    };
    Client2.prototype.setTypeParser = function(oid, format, parseFn) {
      return this._types.setTypeParser(oid, format, parseFn);
    };
    Client2.prototype.getTypeParser = function(oid, format) {
      return this._types.getTypeParser(oid, format);
    };
    Client2.prototype.isConnected = function() {
      return this._connected;
    };
    Client2.prototype.getTransactionStatus = function() {
      return this.native.getTransactionStatus();
    };
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/native/index.js
var require_native = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/native/index.js"(exports, module2) {
    "use strict";
    module2.exports = require_client2();
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/index.js"(exports, module2) {
    "use strict";
    var Client2 = require_client();
    var defaults2 = require_defaults();
    var Connection2 = require_connection();
    var Result2 = require_result();
    var utils = require_utils();
    var Pool2 = require_pg_pool();
    var TypeOverrides2 = require_type_overrides();
    var { DatabaseError: DatabaseError2 } = require_dist();
    var { escapeIdentifier: escapeIdentifier2, escapeLiteral: escapeLiteral2 } = require_utils();
    var poolFactory = /* @__PURE__ */ __name((Client3) => {
      return class BoundPool extends Pool2 {
        static {
          __name(this, "BoundPool");
        }
        constructor(options) {
          super(options, Client3);
        }
      };
    }, "poolFactory");
    var PG = /* @__PURE__ */ __name(function(clientConstructor2) {
      this.defaults = defaults2;
      this.Client = clientConstructor2;
      this.Query = this.Client.Query;
      this.Pool = poolFactory(this.Client);
      this._pools = [];
      this.Connection = Connection2;
      this.types = require_pg_types();
      this.DatabaseError = DatabaseError2;
      this.TypeOverrides = TypeOverrides2;
      this.escapeIdentifier = escapeIdentifier2;
      this.escapeLiteral = escapeLiteral2;
      this.Result = Result2;
      this.utils = utils;
    }, "PG");
    var clientConstructor = Client2;
    var forceNative = false;
    try {
      forceNative = !!process.env.NODE_PG_FORCE_NATIVE;
    } catch {
    }
    if (forceNative) {
      clientConstructor = require_native();
    }
    module2.exports = new PG(clientConstructor);
    Object.defineProperty(module2.exports, "native", {
      configurable: true,
      enumerable: false,
      get() {
        let native = null;
        try {
          native = new PG(require_native());
        } catch (err) {
          if (err.code !== "MODULE_NOT_FOUND") {
            throw err;
          }
        }
        Object.defineProperty(module2.exports, "native", {
          value: native
        });
        return native;
      }
    });
  }
});

// node_modules/.pnpm/pg@8.22.0/node_modules/pg/esm/index.mjs
var import_lib = __toESM(require_lib2(), 1);
var Client = import_lib.default.Client;
var Pool = import_lib.default.Pool;
var Connection = import_lib.default.Connection;
var types = import_lib.default.types;
var Query = import_lib.default.Query;
var DatabaseError = import_lib.default.DatabaseError;
var escapeIdentifier = import_lib.default.escapeIdentifier;
var escapeLiteral = import_lib.default.escapeLiteral;
var Result = import_lib.default.Result;
var TypeOverrides = import_lib.default.TypeOverrides;
var defaults = import_lib.default.defaults;

// lib/seo-blog-engine/storage/db.ts
var pool = null;
function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 2e3
    });
    pool.on("error", (err) => {
      console.error("[v0] Unexpected error on idle client", err);
    });
  }
  return pool;
}
__name(getPool, "getPool");
async function query(text, params) {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
__name(query, "query");

// lib/seo-blog-engine/storage/runs.ts
async function getRun(runId) {
  const result = await query("SELECT * FROM seo_blog_runs WHERE id = \$1", [
    runId
  ]);
  if (result.rows.length === 0) {
    return null;
  }
  return parseRunRow(result.rows[0]);
}
__name(getRun, "getRun");
async function updateRevisionAndDraft(runId, revisedMarkdown, internalReviewMetadata) {
  const run = await getRun(runId);
  if (!run) {
    throw new Error(\`Run not found: \${runId}\`);
  }
  if (!run.final_output_json) {
    throw new Error(\`Run has no final_output_json. Cannot update revision. Run ID: \${runId}\`);
  }
  const updatedFinalOutput = {
    ...run.final_output_json,
    edited_draft_markdown: revisedMarkdown,
    internal_review: {
      ...run.final_output_json.internal_review || {},
      ...internalReviewMetadata
    }
  };
  const result = await query(\`UPDATE seo_blog_runs 
    SET final_output_json = \$2, revised_markdown = \$3, updated_at = NOW()
    WHERE id = \$1
    RETURNING *\`, [
    runId,
    JSON.stringify(updatedFinalOutput),
    revisedMarkdown
  ]);
  if (result.rows.length === 0) {
    throw new Error(\`Failed to update run: \${runId}\`);
  }
  return parseRunRow(result.rows[0]);
}
__name(updateRevisionAndDraft, "updateRevisionAndDraft");
function parseRunRow(row) {
  return {
    id: row.id,
    status: row.status,
    input_json: row.input_json,
    research_json: row.research_json,
    outline_json: row.outline_json,
    draft_markdown: row.draft_markdown,
    optimized_json: row.optimized_json,
    final_output_json: row.final_output_json,
    revised_markdown: row.revised_markdown ?? null,
    smc_content_batch_id: row.smc_content_batch_id,
    error_message: row.error_message,
    callback_url: row.callback_url,
    callback_attempted_at: row.callback_attempted_at ? new Date(row.callback_attempted_at) : void 0,
    callback_status: row.callback_status,
    callback_response_status: row.callback_response_status,
    callback_error: row.callback_error,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    completed_at: row.completed_at ? new Date(row.completed_at) : void 0
  };
}
__name(parseRunRow, "parseRunRow");

// lib/seo-blog-engine/workflow/steps/callback-step.ts
var sendCallbackStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/callback-step//sendCallbackStep");

// lib/seo-blog-engine/workflow/steps/revision-step.ts
var runRevisionStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/revision-step//runRevisionStep");

// lib/seo-blog-engine/workflow/revision-workflow.ts
async function revisionWorkflow(request) {
  console.log(\`[v0] Revision Workflow started for run \${request.run_id}, mode: \${request.revision_mode}\`);
  try {
    if (!request.run_id) {
      throw new Error("run_id is required");
    }
    if (!request.revision_mode) {
      throw new Error("revision_mode is required");
    }
    if (!request.reviewer_email) {
      throw new Error("reviewer_email is required");
    }
    if (!request.reviewer_feedback) {
      throw new Error("reviewer_feedback is required");
    }
    console.log(\`[v0] Revision Workflow: Fetching run \${request.run_id}\`);
    const run = await getRun(request.run_id);
    if (!run) {
      throw new Error(\`Run not found: \${request.run_id}\`);
    }
    if (run.status !== "completed") {
      throw new Error(\`Run status is "\${run.status}", not "completed". Cannot revise incomplete runs.\`);
    }
    if (!run.final_output_json) {
      throw new Error(\`Run has no final_output_json. Run status: \${run.status}\`);
    }
    const finalOutput = run.final_output_json;
    let currentDraft = request.current_draft_markdown || finalOutput.edited_draft_markdown || finalOutput.draft_markdown || run.draft_markdown;
    if (!currentDraft || typeof currentDraft !== "string") {
      throw new Error("No draft markdown found in run or request. Cannot proceed with revision.");
    }
    currentDraft = currentDraft.trim();
    if (!currentDraft || currentDraft.length === 0) {
      throw new Error("Draft markdown is empty after trimming.");
    }
    console.log(\`[v0] Revision Workflow: Current draft length: \${currentDraft.length} chars\`);
    const knownFieldsOrder = [
      {
        key: "requested_changes",
        label: "Requested Changes"
      },
      {
        key: "top_priority_fix",
        label: "Top Priority Fix"
      },
      {
        key: "second_priority_fix",
        label: "Second Priority Fix"
      },
      {
        key: "preserve_notes",
        label: "Preserve Notes"
      },
      {
        key: "risk_notes",
        label: "Risk Notes"
      },
      {
        key: "rewrite_reason",
        label: "Rewrite Reason"
      },
      {
        key: "new_direction",
        label: "New Direction"
      },
      {
        key: "must_keep",
        label: "Must Keep"
      },
      {
        key: "must_remove",
        label: "Must Remove"
      },
      {
        key: "tone_notes",
        label: "Tone Notes"
      }
    ];
    const feedbackParts = [];
    const processedKeys = /* @__PURE__ */ new Set();
    for (const { key, label } of knownFieldsOrder) {
      const value = request.reviewer_feedback[key];
      if (value && typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue) {
          feedbackParts.push(\`\${label}:
\${trimmedValue}\`);
          processedKeys.add(key);
        }
      }
    }
    for (const [key, value] of Object.entries(request.reviewer_feedback)) {
      if (!processedKeys.has(key) && value && typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue) {
          const label = key.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
          feedbackParts.push(\`\${label}:
\${trimmedValue}\`);
        }
      }
    }
    let reviewerFeedback = feedbackParts.join("\\n\\n").trim();
    if (!reviewerFeedback || reviewerFeedback.length === 0) {
      throw new Error("Reviewer feedback is empty after trimming. At least one feedback field is required.");
    }
    console.log(\`[v0] Revision Workflow: Reviewer feedback length: \${reviewerFeedback.length} chars\`);
    const input = run.input_json && typeof run.input_json === "object" ? run.input_json : void 0;
    const research = finalOutput.research_json || void 0;
    const outline = finalOutput.outline_json || void 0;
    const seoQa = finalOutput.seo_qa_json || void 0;
    const meta = finalOutput.meta_json || void 0;
    console.log(\`[v0] Revision Workflow: Calling revision step\`);
    const revisionOutput = await runRevisionStep(currentDraft, reviewerFeedback, request.revision_mode, input, research, outline, seoQa, meta);
    console.log(\`[v0] Revision Workflow: Revision complete. Revised markdown length: \${revisionOutput.revised_markdown.length} chars\`);
    const previousReviewRound = finalOutput.internal_review?.review_round || request.review_round || 1;
    const newReviewRound = previousReviewRound + 1;
    const internalReviewMetadata = {
      review_status: "revised_review_pending",
      review_round: newReviewRound,
      previous_review_round: previousReviewRound,
      revision_mode: request.revision_mode,
      reviewer_email: request.reviewer_email,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log(\`[v0] Revision Workflow: Saving revision to database. Review round: \${newReviewRound}\`);
    await updateRevisionAndDraft(request.run_id, revisionOutput.revised_markdown, internalReviewMetadata);
    console.log(\`[v0] Revision Workflow: Revision saved. Status remains "completed"\`);
    const batchId = run.smc_content_batch_id || request.smc_content_batch_id;
    if (batchId) {
      try {
        console.log(\`[v0] Revision Workflow: Updating smc_content_batches status for batch \${batchId}\`);
        await query(\`UPDATE smc_content_batches SET status = \$1, updated_at = NOW() WHERE id = \$2\`, [
          "blog_revised_review_pending",
          batchId
        ]);
        console.log(\`[v0] Revision Workflow: smc_content_batches status updated\`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(\`[v0] Revision Workflow: Failed to update smc_content_batches: \${errorMessage}. Revision is preserved - proceeding with callback.\`);
      }
    }
    console.log(\`[v0] Revision Workflow: Sending callback with draft_event\`);
    await sendCallbackStep(request.run_id, {
      draftEvent: "revised_draft_ready",
      compactPayload: true
    });
    console.log(\`[v0] Revision Workflow: Complete for run \${request.run_id}\`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(\`[v0] Revision Workflow error: \${errorMessage}\`);
    throw error;
  }
}
__name(revisionWorkflow, "revisionWorkflow");
revisionWorkflow.workflowId = "workflow//./lib/seo-blog-engine/workflow/revision-workflow//revisionWorkflow";
globalThis.__private_workflows.set("workflow//./lib/seo-blog-engine/workflow/revision-workflow//revisionWorkflow", revisionWorkflow);

// lib/seo-blog-engine/workflow/steps/research-step.ts
var runResearchStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/research-step//runResearchStep");

// lib/seo-blog-engine/workflow/steps/outline-step.ts
var runOutlineStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/outline-step//runOutlineStep");

// lib/seo-blog-engine/workflow/steps/writer-step.ts
var runWriterStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/writer-step//runWriterStep");

// lib/seo-blog-engine/workflow/steps/seo-qa-step.ts
var runSeoQaStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/seo-qa-step//runSeoQaStep");

// lib/seo-blog-engine/workflow/steps/editor-step.ts
var runEditorStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/editor-step//runEditorStep");

// lib/seo-blog-engine/workflow/steps/meta-step.ts
var runMetaStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/meta-step//runMetaStep");

// lib/seo-blog-engine/workflow/steps/helpers.ts
var markRunRunningStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/helpers//markRunRunningStep");
var markRunFailedStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/helpers//markRunFailedStep");
var completeRunStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/helpers//completeRunStep");

// lib/seo-blog-engine/workflow/seo-blog-workflow.ts
async function seoBlogWorkflow(runId, input) {
  console.log(\`[v0] SEO Blog Workflow started for run \${runId}\`);
  try {
    console.log(\`[v0] Workflow: Marking run as running\`);
    await markRunRunningStep(runId);
    console.log(\`[v0] Stage 1: Running research step\`);
    const researchOutput = await runResearchStep(runId, input);
    console.log(\`[v0] Stage 1: Research completed and persisted\`);
    console.log(\`[v0] Stage 2: Running outline step\`);
    const outlineOutput = await runOutlineStep(runId, input, researchOutput);
    console.log(\`[v0] Stage 2: Outline completed and persisted\`);
    console.log(\`[v0] Stage 3: Running writer step\`);
    const writerOutput = await runWriterStep(runId, input, researchOutput, outlineOutput);
    console.log(\`[v0] Stage 3: Writer completed and persisted\`);
    console.log(\`[v0] Stage 4: Running SEO QA step\`);
    const seoQaOutput = await runSeoQaStep(runId, input, researchOutput, outlineOutput, writerOutput.draft_markdown);
    console.log(\`[v0] Stage 4: SEO QA completed and persisted\`);
    console.log(\`[v0] Stage 5: Running editor step\`);
    const editorOutput = await runEditorStep(runId, input, researchOutput, outlineOutput, writerOutput.draft_markdown, seoQaOutput);
    console.log(\`[v0] Stage 5: Editor completed\`);
    console.log(\`[v0] Stage 6: Running meta step\`);
    const metaOutput = await runMetaStep(runId, input, researchOutput, outlineOutput, writerOutput.draft_markdown, seoQaOutput, editorOutput.edited_draft_markdown);
    console.log(\`[v0] Stage 6: Meta completed\`);
    console.log(\`[v0] Workflow: Completing run\`);
    const finalOutput = {
      research_json: researchOutput,
      outline_json: outlineOutput,
      draft_markdown: writerOutput.draft_markdown,
      seo_qa_json: seoQaOutput,
      edited_draft_markdown: editorOutput.edited_draft_markdown,
      editor_notes: editorOutput.editor_notes,
      changes_made: editorOutput.changes_made,
      meta_json: metaOutput,
      human_review_required: true,
      workflow_status: "meta_complete_awaiting_review",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await completeRunStep(runId, finalOutput);
    console.log(\`[v0] Workflow: Sending completion callback\`);
    try {
      await sendCallbackStep(runId);
    } catch (callbackErr) {
      console.error(\`[v0] Workflow: Callback delivery failed:\`, callbackErr instanceof Error ? callbackErr.message : String(callbackErr));
    }
    console.log(\`[v0] SEO Blog Workflow completed successfully for run \${runId}\`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(\`[v0] Workflow error for run \${runId}: \${errorMessage}\`);
    try {
      await markRunFailedStep(runId, errorMessage);
    } catch (failureErr) {
      console.error(\`[v0] Failed to mark run as failed:\`, failureErr instanceof Error ? failureErr.message : String(failureErr));
    }
    console.log(\`[v0] Workflow: Sending failure callback\`);
    try {
      await sendCallbackStep(runId);
    } catch (callbackErr) {
      console.error(\`[v0] Workflow: Callback delivery failed:\`, callbackErr instanceof Error ? callbackErr.message : String(callbackErr));
    }
    throw error;
  }
}
__name(seoBlogWorkflow, "seoBlogWorkflow");
seoBlogWorkflow.workflowId = "workflow//./lib/seo-blog-engine/workflow/seo-blog-workflow//seoBlogWorkflow";
globalThis.__private_workflows.set("workflow//./lib/seo-blog-engine/workflow/seo-blog-workflow//seoBlogWorkflow", seoBlogWorkflow);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzLy5wbnBtL3Bvc3RncmVzLWFycmF5QDIuMC4wL25vZGVfbW9kdWxlcy9wb3N0Z3Jlcy1hcnJheS9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcGctdHlwZXNAMi4yLjAvbm9kZV9tb2R1bGVzL3BnLXR5cGVzL2xpYi9hcnJheVBhcnNlci5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcG9zdGdyZXMtZGF0ZUAxLjAuNy9ub2RlX21vZHVsZXMvcG9zdGdyZXMtZGF0ZS9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvLnBucG0veHRlbmRANC4wLjIvbm9kZV9tb2R1bGVzL3h0ZW5kL211dGFibGUuanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3Bvc3RncmVzLWludGVydmFsQDEuMi4wL25vZGVfbW9kdWxlcy9wb3N0Z3Jlcy1pbnRlcnZhbC9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcG9zdGdyZXMtYnl0ZWFAMS4wLjEvbm9kZV9tb2R1bGVzL3Bvc3RncmVzLWJ5dGVhL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZy10eXBlc0AyLjIuMC9ub2RlX21vZHVsZXMvcGctdHlwZXMvbGliL3RleHRQYXJzZXJzLmpzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZy1pbnQ4QDEuMC4xL25vZGVfbW9kdWxlcy9wZy1pbnQ4L2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZy10eXBlc0AyLjIuMC9ub2RlX21vZHVsZXMvcGctdHlwZXMvbGliL2JpbmFyeVBhcnNlcnMuanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BnLXR5cGVzQDIuMi4wL25vZGVfbW9kdWxlcy9wZy10eXBlcy9saWIvYnVpbHRpbnMuanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BnLXR5cGVzQDIuMi4wL25vZGVfbW9kdWxlcy9wZy10eXBlcy9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcGdAOC4yMi4wL25vZGVfbW9kdWxlcy9wZy9saWIvZGVmYXVsdHMuanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BnQDguMjIuMC9ub2RlX21vZHVsZXMvcGcvbGliL3V0aWxzLmpzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZ0A4LjIyLjAvbm9kZV9tb2R1bGVzL3BnL2xpYi9jcnlwdG8vdXRpbHMuanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BnQDguMjIuMC9ub2RlX21vZHVsZXMvcGcvbGliL2NyeXB0by9jZXJ0LXNpZ25hdHVyZXMuanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BnQDguMjIuMC9ub2RlX21vZHVsZXMvcGcvbGliL2NyeXB0by9zYXNsLmpzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZ0A4LjIyLjAvbm9kZV9tb2R1bGVzL3BnL2xpYi90eXBlLW92ZXJyaWRlcy5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcGctY29ubmVjdGlvbi1zdHJpbmdAMi4xNC4wL25vZGVfbW9kdWxlcy9wZy1jb25uZWN0aW9uLXN0cmluZy9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcGdAOC4yMi4wL25vZGVfbW9kdWxlcy9wZy9saWIvY29ubmVjdGlvbi1wYXJhbWV0ZXJzLmpzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZ0A4LjIyLjAvbm9kZV9tb2R1bGVzL3BnL2xpYi9yZXN1bHQuanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BnQDguMjIuMC9ub2RlX21vZHVsZXMvcGcvbGliL3F1ZXJ5LmpzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZy1wcm90b2NvbEAxLjE1LjAvbm9kZV9tb2R1bGVzL3BnLXByb3RvY29sL3NyYy9tZXNzYWdlcy50cyIsICJub2RlX21vZHVsZXMvLnBucG0vcGctcHJvdG9jb2xAMS4xNS4wL25vZGVfbW9kdWxlcy9wZy1wcm90b2NvbC9zcmMvYnVmZmVyLXdyaXRlci50cyIsICJub2RlX21vZHVsZXMvLnBucG0vcGctcHJvdG9jb2xAMS4xNS4wL25vZGVfbW9kdWxlcy9wZy1wcm90b2NvbC9zcmMvc2VyaWFsaXplci50cyIsICJub2RlX21vZHVsZXMvLnBucG0vcGctcHJvdG9jb2xAMS4xNS4wL25vZGVfbW9kdWxlcy9wZy1wcm90b2NvbC9zcmMvYnVmZmVyLXJlYWRlci50cyIsICJub2RlX21vZHVsZXMvLnBucG0vcGctcHJvdG9jb2xAMS4xNS4wL25vZGVfbW9kdWxlcy9wZy1wcm90b2NvbC9zcmMvcGFyc2VyLnRzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZy1wcm90b2NvbEAxLjE1LjAvbm9kZV9tb2R1bGVzL3BnLXByb3RvY29sL3NyYy9pbmRleC50cyIsICJub2RlX21vZHVsZXMvLnBucG0vcGctY2xvdWRmbGFyZUAxLjQuMC9ub2RlX21vZHVsZXMvcGctY2xvdWRmbGFyZS9zcmMvZW1wdHkudHMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BnQDguMjIuMC9ub2RlX21vZHVsZXMvcGcvbGliL3N0cmVhbS5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcGdAOC4yMi4wL25vZGVfbW9kdWxlcy9wZy9saWIvY29ubmVjdGlvbi5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vc3BsaXQyQDQuMi4wL25vZGVfbW9kdWxlcy9zcGxpdDIvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BncGFzc0AxLjAuNS9ub2RlX21vZHVsZXMvcGdwYXNzL2xpYi9oZWxwZXIuanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BncGFzc0AxLjAuNS9ub2RlX21vZHVsZXMvcGdwYXNzL2xpYi9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcGdAOC4yMi4wL25vZGVfbW9kdWxlcy9wZy9saWIvY2xpZW50LmpzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZy1wb29sQDMuMTQuMF9wZ0A4LjIyLjAvbm9kZV9tb2R1bGVzL3BnLXBvb2wvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzLy5wbnBtL3BnQDguMjIuMC9ub2RlX21vZHVsZXMvcGcvbGliL25hdGl2ZS9xdWVyeS5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcGdAOC4yMi4wL25vZGVfbW9kdWxlcy9wZy9saWIvbmF0aXZlL2NsaWVudC5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcGdAOC4yMi4wL25vZGVfbW9kdWxlcy9wZy9saWIvbmF0aXZlL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9wZ0A4LjIyLjAvbm9kZV9tb2R1bGVzL3BnL2xpYi9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvLnBucG0vcGdAOC4yMi4wL25vZGVfbW9kdWxlcy9wZy9lc20vaW5kZXgubWpzIiwgImxpYi9zZW8tYmxvZy1lbmdpbmUvc3RvcmFnZS9kYi50cyIsICJsaWIvc2VvLWJsb2ctZW5naW5lL3N0b3JhZ2UvcnVucy50cyIsICJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAudHMiLCAibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1zdGVwLnRzIiwgImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvcmV2aXNpb24td29ya2Zsb3cudHMiLCAibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLnRzIiwgImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLnRzIiwgImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAudHMiLCAibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyIsICJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzIiwgImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLnRzIiwgImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyIsICJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3Nlby1ibG9nLXdvcmtmbG93LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIndXNlIHN0cmljdCc7XG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oc291cmNlLCB0cmFuc2Zvcm0pIHtcbiAgICByZXR1cm4gbmV3IEFycmF5UGFyc2VyKHNvdXJjZSwgdHJhbnNmb3JtKS5wYXJzZSgpO1xufTtcbmNsYXNzIEFycmF5UGFyc2VyIHtcbiAgICBjb25zdHJ1Y3Rvcihzb3VyY2UsIHRyYW5zZm9ybSl7XG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSB8fCBpZGVudGl0eTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuZW50cmllcyA9IFtdO1xuICAgICAgICB0aGlzLnJlY29yZGVkID0gW107XG4gICAgICAgIHRoaXMuZGltZW5zaW9uID0gMDtcbiAgICB9XG4gICAgaXNFb2YoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uID49IHRoaXMuc291cmNlLmxlbmd0aDtcbiAgICB9XG4gICAgbmV4dENoYXJhY3RlcigpIHtcbiAgICAgICAgdmFyIGNoYXJhY3RlciA9IHRoaXMuc291cmNlW3RoaXMucG9zaXRpb24rK107XG4gICAgICAgIGlmIChjaGFyYWN0ZXIgPT09ICdcXFxcJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zb3VyY2VbdGhpcy5wb3NpdGlvbisrXSxcbiAgICAgICAgICAgICAgICBlc2NhcGVkOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogY2hhcmFjdGVyLFxuICAgICAgICAgICAgZXNjYXBlZDogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmVjb3JkKGNoYXJhY3Rlcikge1xuICAgICAgICB0aGlzLnJlY29yZGVkLnB1c2goY2hhcmFjdGVyKTtcbiAgICB9XG4gICAgbmV3RW50cnkoaW5jbHVkZUVtcHR5KSB7XG4gICAgICAgIHZhciBlbnRyeTtcbiAgICAgICAgaWYgKHRoaXMucmVjb3JkZWQubGVuZ3RoID4gMCB8fCBpbmNsdWRlRW1wdHkpIHtcbiAgICAgICAgICAgIGVudHJ5ID0gdGhpcy5yZWNvcmRlZC5qb2luKCcnKTtcbiAgICAgICAgICAgIGlmIChlbnRyeSA9PT0gJ05VTEwnICYmICFpbmNsdWRlRW1wdHkpIHtcbiAgICAgICAgICAgICAgICBlbnRyeSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZW50cnkgIT09IG51bGwpIGVudHJ5ID0gdGhpcy50cmFuc2Zvcm0oZW50cnkpO1xuICAgICAgICAgICAgdGhpcy5lbnRyaWVzLnB1c2goZW50cnkpO1xuICAgICAgICAgICAgdGhpcy5yZWNvcmRlZCA9IFtdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN1bWVEaW1lbnNpb25zKCkge1xuICAgICAgICBpZiAodGhpcy5zb3VyY2VbMF0gPT09ICdbJykge1xuICAgICAgICAgICAgd2hpbGUoIXRoaXMuaXNFb2YoKSl7XG4gICAgICAgICAgICAgICAgdmFyIGNoYXIgPSB0aGlzLm5leHRDaGFyYWN0ZXIoKTtcbiAgICAgICAgICAgICAgICBpZiAoY2hhci52YWx1ZSA9PT0gJz0nKSBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXJzZShuZXN0ZWQpIHtcbiAgICAgICAgdmFyIGNoYXJhY3RlciwgcGFyc2VyLCBxdW90ZTtcbiAgICAgICAgdGhpcy5jb25zdW1lRGltZW5zaW9ucygpO1xuICAgICAgICB3aGlsZSghdGhpcy5pc0VvZigpKXtcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IHRoaXMubmV4dENoYXJhY3RlcigpO1xuICAgICAgICAgICAgaWYgKGNoYXJhY3Rlci52YWx1ZSA9PT0gJ3snICYmICFxdW90ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGltZW5zaW9uKys7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGltZW5zaW9uID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJzZXIgPSBuZXcgQXJyYXlQYXJzZXIodGhpcy5zb3VyY2Uuc3Vic3RyKHRoaXMucG9zaXRpb24gLSAxKSwgdGhpcy50cmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudHJpZXMucHVzaChwYXJzZXIucGFyc2UodHJ1ZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uICs9IHBhcnNlci5wb3NpdGlvbiAtIDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIudmFsdWUgPT09ICd9JyAmJiAhcXVvdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpbWVuc2lvbi0tO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5kaW1lbnNpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdFbnRyeSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmVzdGVkKSByZXR1cm4gdGhpcy5lbnRyaWVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyLnZhbHVlID09PSAnXCInICYmICFjaGFyYWN0ZXIuZXNjYXBlZCkge1xuICAgICAgICAgICAgICAgIGlmIChxdW90ZSkgdGhpcy5uZXdFbnRyeSh0cnVlKTtcbiAgICAgICAgICAgICAgICBxdW90ZSA9ICFxdW90ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyLnZhbHVlID09PSAnLCcgJiYgIXF1b3RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXdFbnRyeSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY29yZChjaGFyYWN0ZXIudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmRpbWVuc2lvbiAhPT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhcnJheSBkaW1lbnNpb24gbm90IGJhbGFuY2VkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZW50cmllcztcbiAgICB9XG59XG5mdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbiIsICJ2YXIgYXJyYXkgPSByZXF1aXJlKCdwb3N0Z3Jlcy1hcnJheScpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiBmdW5jdGlvbihzb3VyY2UsIHRyYW5zZm9ybSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGFyc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcnJheS5wYXJzZShzb3VyY2UsIHRyYW5zZm9ybSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxufTtcbiIsICIndXNlIHN0cmljdCc7XG52YXIgREFURV9USU1FID0gLyhcXGR7MSx9KS0oXFxkezJ9KS0oXFxkezJ9KSAoXFxkezJ9KTooXFxkezJ9KTooXFxkezJ9KShcXC5cXGR7MSx9KT8uKj8oIEJDKT8kLztcbnZhciBEQVRFID0gL14oXFxkezEsfSktKFxcZHsyfSktKFxcZHsyfSkoIEJDKT8kLztcbnZhciBUSU1FX1pPTkUgPSAvKFtaKy1dKShcXGR7Mn0pPzo/KFxcZHsyfSk/Oj8oXFxkezJ9KT8vO1xudmFyIElORklOSVRZID0gL14tP2luZmluaXR5JC87XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlRGF0ZShpc29EYXRlKSB7XG4gICAgaWYgKElORklOSVRZLnRlc3QoaXNvRGF0ZSkpIHtcbiAgICAgICAgLy8gQ2FwaXRhbGl6ZSB0byBJbmZpbml0eSBiZWZvcmUgcGFzc2luZyB0byBOdW1iZXJcbiAgICAgICAgcmV0dXJuIE51bWJlcihpc29EYXRlLnJlcGxhY2UoJ2knLCAnSScpKTtcbiAgICB9XG4gICAgdmFyIG1hdGNoZXMgPSBEQVRFX1RJTUUuZXhlYyhpc29EYXRlKTtcbiAgICBpZiAoIW1hdGNoZXMpIHtcbiAgICAgICAgLy8gRm9yY2UgWVlZWS1NTS1ERCBkYXRlcyB0byBiZSBwYXJzZWQgYXMgbG9jYWwgdGltZVxuICAgICAgICByZXR1cm4gZ2V0RGF0ZShpc29EYXRlKSB8fCBudWxsO1xuICAgIH1cbiAgICB2YXIgaXNCQyA9ICEhbWF0Y2hlc1s4XTtcbiAgICB2YXIgeWVhciA9IHBhcnNlSW50KG1hdGNoZXNbMV0sIDEwKTtcbiAgICBpZiAoaXNCQykge1xuICAgICAgICB5ZWFyID0gYmNZZWFyVG9OZWdhdGl2ZVllYXIoeWVhcik7XG4gICAgfVxuICAgIHZhciBtb250aCA9IHBhcnNlSW50KG1hdGNoZXNbMl0sIDEwKSAtIDE7XG4gICAgdmFyIGRheSA9IG1hdGNoZXNbM107XG4gICAgdmFyIGhvdXIgPSBwYXJzZUludChtYXRjaGVzWzRdLCAxMCk7XG4gICAgdmFyIG1pbnV0ZSA9IHBhcnNlSW50KG1hdGNoZXNbNV0sIDEwKTtcbiAgICB2YXIgc2Vjb25kID0gcGFyc2VJbnQobWF0Y2hlc1s2XSwgMTApO1xuICAgIHZhciBtcyA9IG1hdGNoZXNbN107XG4gICAgbXMgPSBtcyA/IDEwMDAgKiBwYXJzZUZsb2F0KG1zKSA6IDA7XG4gICAgdmFyIGRhdGU7XG4gICAgdmFyIG9mZnNldCA9IHRpbWVab25lT2Zmc2V0KGlzb0RhdGUpO1xuICAgIGlmIChvZmZzZXQgIT0gbnVsbCkge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1zKSk7XG4gICAgICAgIC8vIEFjY291bnQgZm9yIHllYXJzIGZyb20gMCB0byA5OSBiZWluZyBpbnRlcnByZXRlZCBhcyAxOTAwLTE5OTlcbiAgICAgICAgLy8gYnkgRGF0ZS5VVEMgLyB0aGUgbXVsdGktYXJndW1lbnQgZm9ybSBvZiB0aGUgRGF0ZSBjb25zdHJ1Y3RvclxuICAgICAgICBpZiAoaXMwVG85OSh5ZWFyKSkge1xuICAgICAgICAgICAgZGF0ZS5zZXRVVENGdWxsWWVhcih5ZWFyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2Zmc2V0ICE9PSAwKSB7XG4gICAgICAgICAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgLSBvZmZzZXQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtcyk7XG4gICAgICAgIGlmIChpczBUbzk5KHllYXIpKSB7XG4gICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRlO1xufTtcbmZ1bmN0aW9uIGdldERhdGUoaXNvRGF0ZSkge1xuICAgIHZhciBtYXRjaGVzID0gREFURS5leGVjKGlzb0RhdGUpO1xuICAgIGlmICghbWF0Y2hlcykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB5ZWFyID0gcGFyc2VJbnQobWF0Y2hlc1sxXSwgMTApO1xuICAgIHZhciBpc0JDID0gISFtYXRjaGVzWzRdO1xuICAgIGlmIChpc0JDKSB7XG4gICAgICAgIHllYXIgPSBiY1llYXJUb05lZ2F0aXZlWWVhcih5ZWFyKTtcbiAgICB9XG4gICAgdmFyIG1vbnRoID0gcGFyc2VJbnQobWF0Y2hlc1syXSwgMTApIC0gMTtcbiAgICB2YXIgZGF5ID0gbWF0Y2hlc1szXTtcbiAgICAvLyBZWVlZLU1NLUREIHdpbGwgYmUgcGFyc2VkIGFzIGxvY2FsIHRpbWVcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXkpO1xuICAgIGlmIChpczBUbzk5KHllYXIpKSB7XG4gICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XG4gICAgfVxuICAgIHJldHVybiBkYXRlO1xufVxuLy8gbWF0Y2ggdGltZXpvbmVzOlxuLy8gWiAoVVRDKVxuLy8gLTA1XG4vLyArMDY6MzBcbmZ1bmN0aW9uIHRpbWVab25lT2Zmc2V0KGlzb0RhdGUpIHtcbiAgICBpZiAoaXNvRGF0ZS5lbmRzV2l0aCgnKzAwJykpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHZhciB6b25lID0gVElNRV9aT05FLmV4ZWMoaXNvRGF0ZS5zcGxpdCgnICcpWzFdKTtcbiAgICBpZiAoIXpvbmUpIHJldHVybjtcbiAgICB2YXIgdHlwZSA9IHpvbmVbMV07XG4gICAgaWYgKHR5cGUgPT09ICdaJykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgdmFyIHNpZ24gPSB0eXBlID09PSAnLScgPyAtMSA6IDE7XG4gICAgdmFyIG9mZnNldCA9IHBhcnNlSW50KHpvbmVbMl0sIDEwKSAqIDM2MDAgKyBwYXJzZUludCh6b25lWzNdIHx8IDAsIDEwKSAqIDYwICsgcGFyc2VJbnQoem9uZVs0XSB8fCAwLCAxMCk7XG4gICAgcmV0dXJuIG9mZnNldCAqIHNpZ24gKiAxMDAwO1xufVxuZnVuY3Rpb24gYmNZZWFyVG9OZWdhdGl2ZVllYXIoeWVhcikge1xuICAgIC8vIEFjY291bnQgZm9yIG51bWVyaWNhbCBkaWZmZXJlbmNlIGJldHdlZW4gcmVwcmVzZW50YXRpb25zIG9mIEJDIHllYXJzXG4gICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYmVuZHJ1Y2tlci9wb3N0Z3Jlcy1kYXRlL2lzc3Vlcy81XG4gICAgcmV0dXJuIC0oeWVhciAtIDEpO1xufVxuZnVuY3Rpb24gaXMwVG85OShudW0pIHtcbiAgICByZXR1cm4gbnVtID49IDAgJiYgbnVtIDwgMTAwO1xufVxuIiwgIm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbmZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQpIHtcbiAgICBmb3IodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gc291cmNlKXtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cbiIsICIndXNlIHN0cmljdCc7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQvbXV0YWJsZScpO1xubW9kdWxlLmV4cG9ydHMgPSBQb3N0Z3Jlc0ludGVydmFsO1xuZnVuY3Rpb24gUG9zdGdyZXNJbnRlcnZhbChyYXcpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUG9zdGdyZXNJbnRlcnZhbCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQb3N0Z3Jlc0ludGVydmFsKHJhdyk7XG4gICAgfVxuICAgIGV4dGVuZCh0aGlzLCBwYXJzZShyYXcpKTtcbn1cbnZhciBwcm9wZXJ0aWVzID0gW1xuICAgICdzZWNvbmRzJyxcbiAgICAnbWludXRlcycsXG4gICAgJ2hvdXJzJyxcbiAgICAnZGF5cycsXG4gICAgJ21vbnRocycsXG4gICAgJ3llYXJzJ1xuXTtcblBvc3RncmVzSW50ZXJ2YWwucHJvdG90eXBlLnRvUG9zdGdyZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmlsdGVyZWQgPSBwcm9wZXJ0aWVzLmZpbHRlcih0aGlzLmhhc093blByb3BlcnR5LCB0aGlzKTtcbiAgICAvLyBJbiBhZGRpdGlvbiB0byBgcHJvcGVydGllc2AsIHdlIG5lZWQgdG8gYWNjb3VudCBmb3IgZnJhY3Rpb25zIG9mIHNlY29uZHMuXG4gICAgaWYgKHRoaXMubWlsbGlzZWNvbmRzICYmIGZpbHRlcmVkLmluZGV4T2YoJ3NlY29uZHMnKSA8IDApIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaCgnc2Vjb25kcycpO1xuICAgIH1cbiAgICBpZiAoZmlsdGVyZWQubGVuZ3RoID09PSAwKSByZXR1cm4gJzAnO1xuICAgIHJldHVybiBmaWx0ZXJlZC5tYXAoZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpc1twcm9wZXJ0eV0gfHwgMDtcbiAgICAgICAgLy8gQWNjb3VudCBmb3IgZnJhY3Rpb25hbCBwYXJ0IG9mIHNlY29uZHMsXG4gICAgICAgIC8vIHJlbW92ZSB0cmFpbGluZyB6ZXJvZXMuXG4gICAgICAgIGlmIChwcm9wZXJ0eSA9PT0gJ3NlY29uZHMnICYmIHRoaXMubWlsbGlzZWNvbmRzKSB7XG4gICAgICAgICAgICB2YWx1ZSA9ICh2YWx1ZSArIHRoaXMubWlsbGlzZWNvbmRzIC8gMTAwMCkudG9GaXhlZCg2KS5yZXBsYWNlKC9cXC4/MCskLywgJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZSArICcgJyArIHByb3BlcnR5O1xuICAgIH0sIHRoaXMpLmpvaW4oJyAnKTtcbn07XG52YXIgcHJvcGVydGllc0lTT0VxdWl2YWxlbnQgPSB7XG4gICAgeWVhcnM6ICdZJyxcbiAgICBtb250aHM6ICdNJyxcbiAgICBkYXlzOiAnRCcsXG4gICAgaG91cnM6ICdIJyxcbiAgICBtaW51dGVzOiAnTScsXG4gICAgc2Vjb25kczogJ1MnXG59O1xudmFyIGRhdGVQcm9wZXJ0aWVzID0gW1xuICAgICd5ZWFycycsXG4gICAgJ21vbnRocycsXG4gICAgJ2RheXMnXG5dO1xudmFyIHRpbWVQcm9wZXJ0aWVzID0gW1xuICAgICdob3VycycsXG4gICAgJ21pbnV0ZXMnLFxuICAgICdzZWNvbmRzJ1xuXTtcbi8vIGFjY29yZGluZyB0byBJU08gODYwMVxuUG9zdGdyZXNJbnRlcnZhbC5wcm90b3R5cGUudG9JU09TdHJpbmcgPSBQb3N0Z3Jlc0ludGVydmFsLnByb3RvdHlwZS50b0lTTyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkYXRlUGFydCA9IGRhdGVQcm9wZXJ0aWVzLm1hcChidWlsZFByb3BlcnR5LCB0aGlzKS5qb2luKCcnKTtcbiAgICB2YXIgdGltZVBhcnQgPSB0aW1lUHJvcGVydGllcy5tYXAoYnVpbGRQcm9wZXJ0eSwgdGhpcykuam9pbignJyk7XG4gICAgcmV0dXJuICdQJyArIGRhdGVQYXJ0ICsgJ1QnICsgdGltZVBhcnQ7XG4gICAgZnVuY3Rpb24gYnVpbGRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzW3Byb3BlcnR5XSB8fCAwO1xuICAgICAgICAvLyBBY2NvdW50IGZvciBmcmFjdGlvbmFsIHBhcnQgb2Ygc2Vjb25kcyxcbiAgICAgICAgLy8gcmVtb3ZlIHRyYWlsaW5nIHplcm9lcy5cbiAgICAgICAgaWYgKHByb3BlcnR5ID09PSAnc2Vjb25kcycgJiYgdGhpcy5taWxsaXNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhbHVlID0gKHZhbHVlICsgdGhpcy5taWxsaXNlY29uZHMgLyAxMDAwKS50b0ZpeGVkKDYpLnJlcGxhY2UoLzArJC8sICcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWUgKyBwcm9wZXJ0aWVzSVNPRXF1aXZhbGVudFtwcm9wZXJ0eV07XG4gICAgfVxufTtcbnZhciBOVU1CRVIgPSAnKFsrLV0/XFxcXGQrKSc7XG52YXIgWUVBUiA9IE5VTUJFUiArICdcXFxccyt5ZWFycz8nO1xudmFyIE1PTlRIID0gTlVNQkVSICsgJ1xcXFxzK21vbnM/JztcbnZhciBEQVkgPSBOVU1CRVIgKyAnXFxcXHMrZGF5cz8nO1xudmFyIFRJTUUgPSAnKFsrLV0pPyhbXFxcXGRdKik6KFxcXFxkXFxcXGQpOihcXFxcZFxcXFxkKVxcXFwuPyhcXFxcZHsxLDZ9KT8nO1xudmFyIElOVEVSVkFMID0gbmV3IFJlZ0V4cChbXG4gICAgWUVBUixcbiAgICBNT05USCxcbiAgICBEQVksXG4gICAgVElNRVxuXS5tYXAoZnVuY3Rpb24ocmVnZXhTdHJpbmcpIHtcbiAgICByZXR1cm4gJygnICsgcmVnZXhTdHJpbmcgKyAnKT8nO1xufSkuam9pbignXFxcXHMqJykpO1xuLy8gUG9zaXRpb25zIG9mIHZhbHVlcyBpbiByZWdleCBtYXRjaFxudmFyIHBvc2l0aW9ucyA9IHtcbiAgICB5ZWFyczogMixcbiAgICBtb250aHM6IDQsXG4gICAgZGF5czogNixcbiAgICBob3VyczogOSxcbiAgICBtaW51dGVzOiAxMCxcbiAgICBzZWNvbmRzOiAxMSxcbiAgICBtaWxsaXNlY29uZHM6IDEyXG59O1xuLy8gV2UgY2FuIHVzZSBuZWdhdGl2ZSB0aW1lXG52YXIgbmVnYXRpdmVzID0gW1xuICAgICdob3VycycsXG4gICAgJ21pbnV0ZXMnLFxuICAgICdzZWNvbmRzJyxcbiAgICAnbWlsbGlzZWNvbmRzJ1xuXTtcbmZ1bmN0aW9uIHBhcnNlTWlsbGlzZWNvbmRzKGZyYWN0aW9uKSB7XG4gICAgLy8gYWRkIG9taXR0ZWQgemVyb2VzXG4gICAgdmFyIG1pY3Jvc2Vjb25kcyA9IGZyYWN0aW9uICsgJzAwMDAwMCcuc2xpY2UoZnJhY3Rpb24ubGVuZ3RoKTtcbiAgICByZXR1cm4gcGFyc2VJbnQobWljcm9zZWNvbmRzLCAxMCkgLyAxMDAwO1xufVxuZnVuY3Rpb24gcGFyc2UoaW50ZXJ2YWwpIHtcbiAgICBpZiAoIWludGVydmFsKSByZXR1cm4ge307XG4gICAgdmFyIG1hdGNoZXMgPSBJTlRFUlZBTC5leGVjKGludGVydmFsKTtcbiAgICB2YXIgaXNOZWdhdGl2ZSA9IG1hdGNoZXNbOF0gPT09ICctJztcbiAgICByZXR1cm4gT2JqZWN0LmtleXMocG9zaXRpb25zKS5yZWR1Y2UoZnVuY3Rpb24ocGFyc2VkLCBwcm9wZXJ0eSkge1xuICAgICAgICB2YXIgcG9zaXRpb24gPSBwb3NpdGlvbnNbcHJvcGVydHldO1xuICAgICAgICB2YXIgdmFsdWUgPSBtYXRjaGVzW3Bvc2l0aW9uXTtcbiAgICAgICAgLy8gbm8gZW1wdHkgc3RyaW5nXG4gICAgICAgIGlmICghdmFsdWUpIHJldHVybiBwYXJzZWQ7XG4gICAgICAgIC8vIG1pbGxpc2Vjb25kcyBhcmUgYWN0dWFsbHkgbWljcm9zZWNvbmRzICh1cCB0byA2IGRpZ2l0cylcbiAgICAgICAgLy8gd2l0aCBvbWl0dGVkIHRyYWlsaW5nIHplcm9lcy5cbiAgICAgICAgdmFsdWUgPSBwcm9wZXJ0eSA9PT0gJ21pbGxpc2Vjb25kcycgPyBwYXJzZU1pbGxpc2Vjb25kcyh2YWx1ZSkgOiBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgICAgICAvLyBubyB6ZXJvc1xuICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gcGFyc2VkO1xuICAgICAgICBpZiAoaXNOZWdhdGl2ZSAmJiB+bmVnYXRpdmVzLmluZGV4T2YocHJvcGVydHkpKSB7XG4gICAgICAgICAgICB2YWx1ZSAqPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBwYXJzZWRbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgfSwge30pO1xufVxuIiwgIid1c2Ugc3RyaWN0JztcbnZhciBidWZmZXJGcm9tID0gQnVmZmVyLmZyb20gfHwgQnVmZmVyO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUJ5dGVhKGlucHV0KSB7XG4gICAgaWYgKC9eXFxcXHgvLnRlc3QoaW5wdXQpKSB7XG4gICAgICAgIC8vIG5ldyAnaGV4JyBzdHlsZSByZXNwb25zZSAocGcgPjkuMClcbiAgICAgICAgcmV0dXJuIGJ1ZmZlckZyb20oaW5wdXQuc3Vic3RyKDIpLCAnaGV4Jyk7XG4gICAgfVxuICAgIHZhciBvdXRwdXQgPSAnJztcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUoaSA8IGlucHV0Lmxlbmd0aCl7XG4gICAgICAgIGlmIChpbnB1dFtpXSAhPT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBvdXRwdXQgKz0gaW5wdXRbaV07XG4gICAgICAgICAgICArK2k7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoL1swLTddezN9Ly50ZXN0KGlucHV0LnN1YnN0cihpICsgMSwgMykpKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQoaW5wdXQuc3Vic3RyKGkgKyAxLCAzKSwgOCkpO1xuICAgICAgICAgICAgICAgIGkgKz0gNDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGJhY2tzbGFzaGVzID0gMTtcbiAgICAgICAgICAgICAgICB3aGlsZShpICsgYmFja3NsYXNoZXMgPCBpbnB1dC5sZW5ndGggJiYgaW5wdXRbaSArIGJhY2tzbGFzaGVzXSA9PT0gJ1xcXFwnKXtcbiAgICAgICAgICAgICAgICAgICAgYmFja3NsYXNoZXMrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IE1hdGguZmxvb3IoYmFja3NsYXNoZXMgLyAyKTsgKytrKXtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICdcXFxcJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaSArPSBNYXRoLmZsb29yKGJhY2tzbGFzaGVzIC8gMikgKiAyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBidWZmZXJGcm9tKG91dHB1dCwgJ2JpbmFyeScpO1xufTtcbiIsICJ2YXIgYXJyYXkgPSByZXF1aXJlKCdwb3N0Z3Jlcy1hcnJheScpO1xudmFyIGFycmF5UGFyc2VyID0gcmVxdWlyZSgnLi9hcnJheVBhcnNlcicpO1xudmFyIHBhcnNlRGF0ZSA9IHJlcXVpcmUoJ3Bvc3RncmVzLWRhdGUnKTtcbnZhciBwYXJzZUludGVydmFsID0gcmVxdWlyZSgncG9zdGdyZXMtaW50ZXJ2YWwnKTtcbnZhciBwYXJzZUJ5dGVBID0gcmVxdWlyZSgncG9zdGdyZXMtYnl0ZWEnKTtcbmZ1bmN0aW9uIGFsbG93TnVsbChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiBudWxsQWxsb3dlZCh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHJldHVybiB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIGZuKHZhbHVlKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gcGFyc2VCb29sKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSBudWxsKSByZXR1cm4gdmFsdWU7XG4gICAgcmV0dXJuIHZhbHVlID09PSAnVFJVRScgfHwgdmFsdWUgPT09ICd0JyB8fCB2YWx1ZSA9PT0gJ3RydWUnIHx8IHZhbHVlID09PSAneScgfHwgdmFsdWUgPT09ICd5ZXMnIHx8IHZhbHVlID09PSAnb24nIHx8IHZhbHVlID09PSAnMSc7XG59XG5mdW5jdGlvbiBwYXJzZUJvb2xBcnJheSh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBhcnJheS5wYXJzZSh2YWx1ZSwgcGFyc2VCb29sKTtcbn1cbmZ1bmN0aW9uIHBhcnNlQmFzZVRlbkludChzdHJpbmcpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoc3RyaW5nLCAxMCk7XG59XG5mdW5jdGlvbiBwYXJzZUludGVnZXJBcnJheSh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBhcnJheS5wYXJzZSh2YWx1ZSwgYWxsb3dOdWxsKHBhcnNlQmFzZVRlbkludCkpO1xufVxuZnVuY3Rpb24gcGFyc2VCaWdJbnRlZ2VyQXJyYXkodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gYXJyYXkucGFyc2UodmFsdWUsIGFsbG93TnVsbChmdW5jdGlvbihlbnRyeSkge1xuICAgICAgICByZXR1cm4gcGFyc2VCaWdJbnRlZ2VyKGVudHJ5KS50cmltKCk7XG4gICAgfSkpO1xufVxudmFyIHBhcnNlUG9pbnRBcnJheSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHAgPSBhcnJheVBhcnNlci5jcmVhdGUodmFsdWUsIGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgIGlmIChlbnRyeSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZW50cnkgPSBwYXJzZVBvaW50KGVudHJ5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHAucGFyc2UoKTtcbn07XG52YXIgcGFyc2VGbG9hdEFycmF5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgcCA9IGFycmF5UGFyc2VyLmNyZWF0ZSh2YWx1ZSwgZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgICAgaWYgKGVudHJ5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBlbnRyeSA9IHBhcnNlRmxvYXQoZW50cnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnRyeTtcbiAgICB9KTtcbiAgICByZXR1cm4gcC5wYXJzZSgpO1xufTtcbnZhciBwYXJzZVN0cmluZ0FycmF5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgcCA9IGFycmF5UGFyc2VyLmNyZWF0ZSh2YWx1ZSk7XG4gICAgcmV0dXJuIHAucGFyc2UoKTtcbn07XG52YXIgcGFyc2VEYXRlQXJyYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciBwID0gYXJyYXlQYXJzZXIuY3JlYXRlKHZhbHVlLCBmdW5jdGlvbihlbnRyeSkge1xuICAgICAgICBpZiAoZW50cnkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGVudHJ5ID0gcGFyc2VEYXRlKGVudHJ5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHAucGFyc2UoKTtcbn07XG52YXIgcGFyc2VJbnRlcnZhbEFycmF5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgcCA9IGFycmF5UGFyc2VyLmNyZWF0ZSh2YWx1ZSwgZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgICAgaWYgKGVudHJ5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBlbnRyeSA9IHBhcnNlSW50ZXJ2YWwoZW50cnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnRyeTtcbiAgICB9KTtcbiAgICByZXR1cm4gcC5wYXJzZSgpO1xufTtcbnZhciBwYXJzZUJ5dGVBQXJyYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBhcnJheS5wYXJzZSh2YWx1ZSwgYWxsb3dOdWxsKHBhcnNlQnl0ZUEpKTtcbn07XG52YXIgcGFyc2VJbnRlZ2VyID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUsIDEwKTtcbn07XG52YXIgcGFyc2VCaWdJbnRlZ2VyID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgdmFsU3RyID0gU3RyaW5nKHZhbHVlKTtcbiAgICBpZiAoL15cXGQrJC8udGVzdCh2YWxTdHIpKSB7XG4gICAgICAgIHJldHVybiB2YWxTdHI7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn07XG52YXIgcGFyc2VKc29uQXJyYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBhcnJheS5wYXJzZSh2YWx1ZSwgYWxsb3dOdWxsKEpTT04ucGFyc2UpKTtcbn07XG52YXIgcGFyc2VQb2ludCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlWzBdICE9PSAnKCcpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKDEsIHZhbHVlLmxlbmd0aCAtIDEpLnNwbGl0KCcsJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogcGFyc2VGbG9hdCh2YWx1ZVswXSksXG4gICAgICAgIHk6IHBhcnNlRmxvYXQodmFsdWVbMV0pXG4gICAgfTtcbn07XG52YXIgcGFyc2VDaXJjbGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh2YWx1ZVswXSAhPT0gJzwnICYmIHZhbHVlWzFdICE9PSAnKCcpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciBwb2ludCA9ICcoJztcbiAgICB2YXIgcmFkaXVzID0gJyc7XG4gICAgdmFyIHBvaW50UGFyc2VkID0gZmFsc2U7XG4gICAgZm9yKHZhciBpID0gMjsgaSA8IHZhbHVlLmxlbmd0aCAtIDE7IGkrKyl7XG4gICAgICAgIGlmICghcG9pbnRQYXJzZWQpIHtcbiAgICAgICAgICAgIHBvaW50ICs9IHZhbHVlW2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZVtpXSA9PT0gJyknKSB7XG4gICAgICAgICAgICBwb2ludFBhcnNlZCA9IHRydWU7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmICghcG9pbnRQYXJzZWQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZVtpXSA9PT0gJywnKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICByYWRpdXMgKz0gdmFsdWVbaV07XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBwYXJzZVBvaW50KHBvaW50KTtcbiAgICByZXN1bHQucmFkaXVzID0gcGFyc2VGbG9hdChyYWRpdXMpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIGluaXQgPSBmdW5jdGlvbihyZWdpc3Rlcikge1xuICAgIHJlZ2lzdGVyKDIwLCBwYXJzZUJpZ0ludGVnZXIpOyAvLyBpbnQ4XG4gICAgcmVnaXN0ZXIoMjEsIHBhcnNlSW50ZWdlcik7IC8vIGludDJcbiAgICByZWdpc3RlcigyMywgcGFyc2VJbnRlZ2VyKTsgLy8gaW50NFxuICAgIHJlZ2lzdGVyKDI2LCBwYXJzZUludGVnZXIpOyAvLyBvaWRcbiAgICByZWdpc3Rlcig3MDAsIHBhcnNlRmxvYXQpOyAvLyBmbG9hdDQvcmVhbFxuICAgIHJlZ2lzdGVyKDcwMSwgcGFyc2VGbG9hdCk7IC8vIGZsb2F0OC9kb3VibGVcbiAgICByZWdpc3RlcigxNiwgcGFyc2VCb29sKTtcbiAgICByZWdpc3RlcigxMDgyLCBwYXJzZURhdGUpOyAvLyBkYXRlXG4gICAgcmVnaXN0ZXIoMTExNCwgcGFyc2VEYXRlKTsgLy8gdGltZXN0YW1wIHdpdGhvdXQgdGltZXpvbmVcbiAgICByZWdpc3RlcigxMTg0LCBwYXJzZURhdGUpOyAvLyB0aW1lc3RhbXBcbiAgICByZWdpc3Rlcig2MDAsIHBhcnNlUG9pbnQpOyAvLyBwb2ludFxuICAgIHJlZ2lzdGVyKDY1MSwgcGFyc2VTdHJpbmdBcnJheSk7IC8vIGNpZHJbXVxuICAgIHJlZ2lzdGVyKDcxOCwgcGFyc2VDaXJjbGUpOyAvLyBjaXJjbGVcbiAgICByZWdpc3RlcigxMDAwLCBwYXJzZUJvb2xBcnJheSk7XG4gICAgcmVnaXN0ZXIoMTAwMSwgcGFyc2VCeXRlQUFycmF5KTtcbiAgICByZWdpc3RlcigxMDA1LCBwYXJzZUludGVnZXJBcnJheSk7IC8vIF9pbnQyXG4gICAgcmVnaXN0ZXIoMTAwNywgcGFyc2VJbnRlZ2VyQXJyYXkpOyAvLyBfaW50NFxuICAgIHJlZ2lzdGVyKDEwMjgsIHBhcnNlSW50ZWdlckFycmF5KTsgLy8gb2lkW11cbiAgICByZWdpc3RlcigxMDE2LCBwYXJzZUJpZ0ludGVnZXJBcnJheSk7IC8vIF9pbnQ4XG4gICAgcmVnaXN0ZXIoMTAxNywgcGFyc2VQb2ludEFycmF5KTsgLy8gcG9pbnRbXVxuICAgIHJlZ2lzdGVyKDEwMjEsIHBhcnNlRmxvYXRBcnJheSk7IC8vIF9mbG9hdDRcbiAgICByZWdpc3RlcigxMDIyLCBwYXJzZUZsb2F0QXJyYXkpOyAvLyBfZmxvYXQ4XG4gICAgcmVnaXN0ZXIoMTIzMSwgcGFyc2VGbG9hdEFycmF5KTsgLy8gX251bWVyaWNcbiAgICByZWdpc3RlcigxMDE0LCBwYXJzZVN0cmluZ0FycmF5KTsgLy9jaGFyXG4gICAgcmVnaXN0ZXIoMTAxNSwgcGFyc2VTdHJpbmdBcnJheSk7IC8vdmFyY2hhclxuICAgIHJlZ2lzdGVyKDEwMDgsIHBhcnNlU3RyaW5nQXJyYXkpO1xuICAgIHJlZ2lzdGVyKDEwMDksIHBhcnNlU3RyaW5nQXJyYXkpO1xuICAgIHJlZ2lzdGVyKDEwNDAsIHBhcnNlU3RyaW5nQXJyYXkpOyAvLyBtYWNhZGRyW11cbiAgICByZWdpc3RlcigxMDQxLCBwYXJzZVN0cmluZ0FycmF5KTsgLy8gaW5ldFtdXG4gICAgcmVnaXN0ZXIoMTExNSwgcGFyc2VEYXRlQXJyYXkpOyAvLyB0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmVbXVxuICAgIHJlZ2lzdGVyKDExODIsIHBhcnNlRGF0ZUFycmF5KTsgLy8gX2RhdGVcbiAgICByZWdpc3RlcigxMTg1LCBwYXJzZURhdGVBcnJheSk7IC8vIHRpbWVzdGFtcCB3aXRoIHRpbWUgem9uZVtdXG4gICAgcmVnaXN0ZXIoMTE4NiwgcGFyc2VJbnRlcnZhbCk7XG4gICAgcmVnaXN0ZXIoMTE4NywgcGFyc2VJbnRlcnZhbEFycmF5KTtcbiAgICByZWdpc3RlcigxNywgcGFyc2VCeXRlQSk7XG4gICAgcmVnaXN0ZXIoMTE0LCBKU09OLnBhcnNlLmJpbmQoSlNPTikpOyAvLyBqc29uXG4gICAgcmVnaXN0ZXIoMzgwMiwgSlNPTi5wYXJzZS5iaW5kKEpTT04pKTsgLy8ganNvbmJcbiAgICByZWdpc3RlcigxOTksIHBhcnNlSnNvbkFycmF5KTsgLy8ganNvbltdXG4gICAgcmVnaXN0ZXIoMzgwNywgcGFyc2VKc29uQXJyYXkpOyAvLyBqc29uYltdXG4gICAgcmVnaXN0ZXIoMzkwNywgcGFyc2VTdHJpbmdBcnJheSk7IC8vIG51bXJhbmdlW11cbiAgICByZWdpc3RlcigyOTUxLCBwYXJzZVN0cmluZ0FycmF5KTsgLy8gdXVpZFtdXG4gICAgcmVnaXN0ZXIoNzkxLCBwYXJzZVN0cmluZ0FycmF5KTsgLy8gbW9uZXlbXVxuICAgIHJlZ2lzdGVyKDExODMsIHBhcnNlU3RyaW5nQXJyYXkpOyAvLyB0aW1lW11cbiAgICByZWdpc3RlcigxMjcwLCBwYXJzZVN0cmluZ0FycmF5KTsgLy8gdGltZXR6W11cbn07XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0XG59O1xuIiwgIid1c2Ugc3RyaWN0Jztcbi8vIHNlbGVjdGVkIHNvIChCQVNFIC0gMSkgKiAweDEwMDAwMDAwMCArIDB4ZmZmZmZmZmYgaXMgYSBzYWZlIGludGVnZXJcbnZhciBCQVNFID0gMTAwMDAwMDtcbmZ1bmN0aW9uIHJlYWRJbnQ4KGJ1ZmZlcikge1xuICAgIHZhciBoaWdoID0gYnVmZmVyLnJlYWRJbnQzMkJFKDApO1xuICAgIHZhciBsb3cgPSBidWZmZXIucmVhZFVJbnQzMkJFKDQpO1xuICAgIHZhciBzaWduID0gJyc7XG4gICAgaWYgKGhpZ2ggPCAwKSB7XG4gICAgICAgIGhpZ2ggPSB+aGlnaCArIChsb3cgPT09IDApO1xuICAgICAgICBsb3cgPSB+bG93ICsgMSA+Pj4gMDtcbiAgICAgICAgc2lnbiA9ICctJztcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIHZhciBjYXJyeTtcbiAgICB2YXIgdDtcbiAgICB2YXIgZGlnaXRzO1xuICAgIHZhciBwYWQ7XG4gICAgdmFyIGw7XG4gICAgdmFyIGk7XG4gICAge1xuICAgICAgICBjYXJyeSA9IGhpZ2ggJSBCQVNFO1xuICAgICAgICBoaWdoID0gaGlnaCAvIEJBU0UgPj4+IDA7XG4gICAgICAgIHQgPSAweDEwMDAwMDAwMCAqIGNhcnJ5ICsgbG93O1xuICAgICAgICBsb3cgPSB0IC8gQkFTRSA+Pj4gMDtcbiAgICAgICAgZGlnaXRzID0gJycgKyAodCAtIEJBU0UgKiBsb3cpO1xuICAgICAgICBpZiAobG93ID09PSAwICYmIGhpZ2ggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzaWduICsgZGlnaXRzICsgcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHBhZCA9ICcnO1xuICAgICAgICBsID0gNiAtIGRpZ2l0cy5sZW5ndGg7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IGw7IGkrKyl7XG4gICAgICAgICAgICBwYWQgKz0gJzAnO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IHBhZCArIGRpZ2l0cyArIHJlc3VsdDtcbiAgICB9XG4gICAge1xuICAgICAgICBjYXJyeSA9IGhpZ2ggJSBCQVNFO1xuICAgICAgICBoaWdoID0gaGlnaCAvIEJBU0UgPj4+IDA7XG4gICAgICAgIHQgPSAweDEwMDAwMDAwMCAqIGNhcnJ5ICsgbG93O1xuICAgICAgICBsb3cgPSB0IC8gQkFTRSA+Pj4gMDtcbiAgICAgICAgZGlnaXRzID0gJycgKyAodCAtIEJBU0UgKiBsb3cpO1xuICAgICAgICBpZiAobG93ID09PSAwICYmIGhpZ2ggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzaWduICsgZGlnaXRzICsgcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHBhZCA9ICcnO1xuICAgICAgICBsID0gNiAtIGRpZ2l0cy5sZW5ndGg7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IGw7IGkrKyl7XG4gICAgICAgICAgICBwYWQgKz0gJzAnO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IHBhZCArIGRpZ2l0cyArIHJlc3VsdDtcbiAgICB9XG4gICAge1xuICAgICAgICBjYXJyeSA9IGhpZ2ggJSBCQVNFO1xuICAgICAgICBoaWdoID0gaGlnaCAvIEJBU0UgPj4+IDA7XG4gICAgICAgIHQgPSAweDEwMDAwMDAwMCAqIGNhcnJ5ICsgbG93O1xuICAgICAgICBsb3cgPSB0IC8gQkFTRSA+Pj4gMDtcbiAgICAgICAgZGlnaXRzID0gJycgKyAodCAtIEJBU0UgKiBsb3cpO1xuICAgICAgICBpZiAobG93ID09PSAwICYmIGhpZ2ggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzaWduICsgZGlnaXRzICsgcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHBhZCA9ICcnO1xuICAgICAgICBsID0gNiAtIGRpZ2l0cy5sZW5ndGg7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IGw7IGkrKyl7XG4gICAgICAgICAgICBwYWQgKz0gJzAnO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IHBhZCArIGRpZ2l0cyArIHJlc3VsdDtcbiAgICB9XG4gICAge1xuICAgICAgICBjYXJyeSA9IGhpZ2ggJSBCQVNFO1xuICAgICAgICB0ID0gMHgxMDAwMDAwMDAgKiBjYXJyeSArIGxvdztcbiAgICAgICAgZGlnaXRzID0gJycgKyB0ICUgQkFTRTtcbiAgICAgICAgcmV0dXJuIHNpZ24gKyBkaWdpdHMgKyByZXN1bHQ7XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSByZWFkSW50ODtcbiIsICJ2YXIgcGFyc2VJbnQ2NCA9IHJlcXVpcmUoJ3BnLWludDgnKTtcbnZhciBwYXJzZUJpdHMgPSBmdW5jdGlvbihkYXRhLCBiaXRzLCBvZmZzZXQsIGludmVydCwgY2FsbGJhY2spIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcbiAgICBpbnZlcnQgPSBpbnZlcnQgfHwgZmFsc2U7XG4gICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbihsYXN0VmFsdWUsIG5ld1ZhbHVlLCBiaXRzKSB7XG4gICAgICAgIHJldHVybiBsYXN0VmFsdWUgKiBNYXRoLnBvdygyLCBiaXRzKSArIG5ld1ZhbHVlO1xuICAgIH07XG4gICAgdmFyIG9mZnNldEJ5dGVzID0gb2Zmc2V0ID4+IDM7XG4gICAgdmFyIGludiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmIChpbnZlcnQpIHtcbiAgICAgICAgICAgIHJldHVybiB+dmFsdWUgJiAweGZmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIC8vIHJlYWQgZmlyc3QgKG1heWJlIHBhcnRpYWwpIGJ5dGVcbiAgICB2YXIgbWFzayA9IDB4ZmY7XG4gICAgdmFyIGZpcnN0Qml0cyA9IDggLSBvZmZzZXQgJSA4O1xuICAgIGlmIChiaXRzIDwgZmlyc3RCaXRzKSB7XG4gICAgICAgIG1hc2sgPSAweGZmIDw8IDggLSBiaXRzICYgMHhmZjtcbiAgICAgICAgZmlyc3RCaXRzID0gYml0cztcbiAgICB9XG4gICAgaWYgKG9mZnNldCkge1xuICAgICAgICBtYXNrID0gbWFzayA+PiBvZmZzZXQgJSA4O1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICBpZiAob2Zmc2V0ICUgOCArIGJpdHMgPj0gOCkge1xuICAgICAgICByZXN1bHQgPSBjYWxsYmFjaygwLCBpbnYoZGF0YVtvZmZzZXRCeXRlc10pICYgbWFzaywgZmlyc3RCaXRzKTtcbiAgICB9XG4gICAgLy8gcmVhZCBieXRlc1xuICAgIHZhciBieXRlcyA9IGJpdHMgKyBvZmZzZXQgPj4gMztcbiAgICBmb3IodmFyIGkgPSBvZmZzZXRCeXRlcyArIDE7IGkgPCBieXRlczsgaSsrKXtcbiAgICAgICAgcmVzdWx0ID0gY2FsbGJhY2socmVzdWx0LCBpbnYoZGF0YVtpXSksIDgpO1xuICAgIH1cbiAgICAvLyBiaXRzIHRvIHJlYWQsIHRoYXQgYXJlIG5vdCBhIGNvbXBsZXRlIGJ5dGVcbiAgICB2YXIgbGFzdEJpdHMgPSAoYml0cyArIG9mZnNldCkgJSA4O1xuICAgIGlmIChsYXN0Qml0cyA+IDApIHtcbiAgICAgICAgcmVzdWx0ID0gY2FsbGJhY2socmVzdWx0LCBpbnYoZGF0YVtieXRlc10pID4+IDggLSBsYXN0Qml0cywgbGFzdEJpdHMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbnZhciBwYXJzZUZsb2F0RnJvbUJpdHMgPSBmdW5jdGlvbihkYXRhLCBwcmVjaXNpb25CaXRzLCBleHBvbmVudEJpdHMpIHtcbiAgICB2YXIgYmlhcyA9IE1hdGgucG93KDIsIGV4cG9uZW50Qml0cyAtIDEpIC0gMTtcbiAgICB2YXIgc2lnbiA9IHBhcnNlQml0cyhkYXRhLCAxKTtcbiAgICB2YXIgZXhwb25lbnQgPSBwYXJzZUJpdHMoZGF0YSwgZXhwb25lbnRCaXRzLCAxKTtcbiAgICBpZiAoZXhwb25lbnQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIC8vIHBhcnNlIG1hbnRpc3NhXG4gICAgdmFyIHByZWNpc2lvbkJpdHNDb3VudGVyID0gMTtcbiAgICB2YXIgcGFyc2VQcmVjaXNpb25CaXRzID0gZnVuY3Rpb24obGFzdFZhbHVlLCBuZXdWYWx1ZSwgYml0cykge1xuICAgICAgICBpZiAobGFzdFZhbHVlID09PSAwKSB7XG4gICAgICAgICAgICBsYXN0VmFsdWUgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGZvcih2YXIgaSA9IDE7IGkgPD0gYml0czsgaSsrKXtcbiAgICAgICAgICAgIHByZWNpc2lvbkJpdHNDb3VudGVyIC89IDI7XG4gICAgICAgICAgICBpZiAoKG5ld1ZhbHVlICYgMHgxIDw8IGJpdHMgLSBpKSA+IDApIHtcbiAgICAgICAgICAgICAgICBsYXN0VmFsdWUgKz0gcHJlY2lzaW9uQml0c0NvdW50ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxhc3RWYWx1ZTtcbiAgICB9O1xuICAgIHZhciBtYW50aXNzYSA9IHBhcnNlQml0cyhkYXRhLCBwcmVjaXNpb25CaXRzLCBleHBvbmVudEJpdHMgKyAxLCBmYWxzZSwgcGFyc2VQcmVjaXNpb25CaXRzKTtcbiAgICAvLyBzcGVjaWFsIGNhc2VzXG4gICAgaWYgKGV4cG9uZW50ID09IE1hdGgucG93KDIsIGV4cG9uZW50Qml0cyArIDEpIC0gMSkge1xuICAgICAgICBpZiAobWFudGlzc2EgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzaWduID09PSAwID8gSW5maW5pdHkgOiAtSW5maW5pdHk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG4gICAgLy8gbm9ybWFsZSBudW1iZXJcbiAgICByZXR1cm4gKHNpZ24gPT09IDAgPyAxIDogLTEpICogTWF0aC5wb3coMiwgZXhwb25lbnQgLSBiaWFzKSAqIG1hbnRpc3NhO1xufTtcbnZhciBwYXJzZUludDE2ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAocGFyc2VCaXRzKHZhbHVlLCAxKSA9PSAxKSB7XG4gICAgICAgIHJldHVybiAtMSAqIChwYXJzZUJpdHModmFsdWUsIDE1LCAxLCB0cnVlKSArIDEpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VCaXRzKHZhbHVlLCAxNSwgMSk7XG59O1xudmFyIHBhcnNlSW50MzIgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmIChwYXJzZUJpdHModmFsdWUsIDEpID09IDEpIHtcbiAgICAgICAgcmV0dXJuIC0xICogKHBhcnNlQml0cyh2YWx1ZSwgMzEsIDEsIHRydWUpICsgMSk7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZUJpdHModmFsdWUsIDMxLCAxKTtcbn07XG52YXIgcGFyc2VGbG9hdDMyID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdEZyb21CaXRzKHZhbHVlLCAyMywgOCk7XG59O1xudmFyIHBhcnNlRmxvYXQ2NCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXRGcm9tQml0cyh2YWx1ZSwgNTIsIDExKTtcbn07XG52YXIgcGFyc2VOdW1lcmljID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgc2lnbiA9IHBhcnNlQml0cyh2YWx1ZSwgMTYsIDMyKTtcbiAgICBpZiAoc2lnbiA9PSAweGMwMDApIHtcbiAgICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG4gICAgdmFyIHdlaWdodCA9IE1hdGgucG93KDEwMDAwLCBwYXJzZUJpdHModmFsdWUsIDE2LCAxNikpO1xuICAgIHZhciByZXN1bHQgPSAwO1xuICAgIHZhciBkaWdpdHMgPSBbXTtcbiAgICB2YXIgbmRpZ2l0cyA9IHBhcnNlQml0cyh2YWx1ZSwgMTYpO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBuZGlnaXRzOyBpKyspe1xuICAgICAgICByZXN1bHQgKz0gcGFyc2VCaXRzKHZhbHVlLCAxNiwgNjQgKyAxNiAqIGkpICogd2VpZ2h0O1xuICAgICAgICB3ZWlnaHQgLz0gMTAwMDA7XG4gICAgfVxuICAgIHZhciBzY2FsZSA9IE1hdGgucG93KDEwLCBwYXJzZUJpdHModmFsdWUsIDE2LCA0OCkpO1xuICAgIHJldHVybiAoc2lnbiA9PT0gMCA/IDEgOiAtMSkgKiBNYXRoLnJvdW5kKHJlc3VsdCAqIHNjYWxlKSAvIHNjYWxlO1xufTtcbnZhciBwYXJzZURhdGUgPSBmdW5jdGlvbihpc1VUQywgdmFsdWUpIHtcbiAgICB2YXIgc2lnbiA9IHBhcnNlQml0cyh2YWx1ZSwgMSk7XG4gICAgdmFyIHJhd1ZhbHVlID0gcGFyc2VCaXRzKHZhbHVlLCA2MywgMSk7XG4gICAgLy8gZGlzY2FyZCB1c2VjcyBhbmQgc2hpZnQgZnJvbSAyMDAwIHRvIDE5NzBcbiAgICB2YXIgcmVzdWx0ID0gbmV3IERhdGUoKHNpZ24gPT09IDAgPyAxIDogLTEpICogcmF3VmFsdWUgLyAxMDAwICsgOTQ2Njg0ODAwMDAwKTtcbiAgICBpZiAoIWlzVVRDKSB7XG4gICAgICAgIHJlc3VsdC5zZXRUaW1lKHJlc3VsdC5nZXRUaW1lKCkgKyByZXN1bHQuZ2V0VGltZXpvbmVPZmZzZXQoKSAqIDYwMDAwKTtcbiAgICB9XG4gICAgLy8gYWRkIG1pY3Jvc2Vjb25kcyB0byB0aGUgZGF0ZVxuICAgIHJlc3VsdC51c2VjID0gcmF3VmFsdWUgJSAxMDAwO1xuICAgIHJlc3VsdC5nZXRNaWNyb1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlYztcbiAgICB9O1xuICAgIHJlc3VsdC5zZXRNaWNyb1NlY29uZHMgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB0aGlzLnVzZWMgPSB2YWx1ZTtcbiAgICB9O1xuICAgIHJlc3VsdC5nZXRVVENNaWNyb1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlYztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIHBhcnNlQXJyYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBkaW0gPSBwYXJzZUJpdHModmFsdWUsIDMyKTtcbiAgICB2YXIgZmxhZ3MgPSBwYXJzZUJpdHModmFsdWUsIDMyLCAzMik7XG4gICAgdmFyIGVsZW1lbnRUeXBlID0gcGFyc2VCaXRzKHZhbHVlLCAzMiwgNjQpO1xuICAgIHZhciBvZmZzZXQgPSA5NjtcbiAgICB2YXIgZGltcyA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBkaW07IGkrKyl7XG4gICAgICAgIC8vIHBhcnNlIGRpbWVuc2lvblxuICAgICAgICBkaW1zW2ldID0gcGFyc2VCaXRzKHZhbHVlLCAzMiwgb2Zmc2V0KTtcbiAgICAgICAgb2Zmc2V0ICs9IDMyO1xuICAgICAgICAvLyBpZ25vcmUgbG93ZXIgYm91bmRzXG4gICAgICAgIG9mZnNldCArPSAzMjtcbiAgICB9XG4gICAgdmFyIHBhcnNlRWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnRUeXBlKSB7XG4gICAgICAgIC8vIHBhcnNlIGNvbnRlbnQgbGVuZ3RoXG4gICAgICAgIHZhciBsZW5ndGggPSBwYXJzZUJpdHModmFsdWUsIDMyLCBvZmZzZXQpO1xuICAgICAgICBvZmZzZXQgKz0gMzI7XG4gICAgICAgIC8vIHBhcnNlIG51bGwgdmFsdWVzXG4gICAgICAgIGlmIChsZW5ndGggPT0gMHhmZmZmZmZmZikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKGVsZW1lbnRUeXBlID09IDB4MTcgfHwgZWxlbWVudFR5cGUgPT0gMHgxNCkge1xuICAgICAgICAgICAgLy8gaW50L2JpZ2ludFxuICAgICAgICAgICAgcmVzdWx0ID0gcGFyc2VCaXRzKHZhbHVlLCBsZW5ndGggKiA4LCBvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IGxlbmd0aCAqIDg7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnRUeXBlID09IDB4MTkpIHtcbiAgICAgICAgICAgIC8vIHN0cmluZ1xuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWUudG9TdHJpbmcodGhpcy5lbmNvZGluZywgb2Zmc2V0ID4+IDMsIChvZmZzZXQgKz0gbGVuZ3RoIDw8IDMpID4+IDMpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1I6IEVsZW1lbnRUeXBlIG5vdCBpbXBsZW1lbnRlZDogXCIgKyBlbGVtZW50VHlwZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciBwYXJzZSA9IGZ1bmN0aW9uKGRpbWVuc2lvbiwgZWxlbWVudFR5cGUpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgIHZhciBpO1xuICAgICAgICBpZiAoZGltZW5zaW9uLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHZhciBjb3VudCA9IGRpbWVuc2lvbi5zaGlmdCgpO1xuICAgICAgICAgICAgZm9yKGkgPSAwOyBpIDwgY291bnQ7IGkrKyl7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSBwYXJzZShkaW1lbnNpb24sIGVsZW1lbnRUeXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpbWVuc2lvbi51bnNoaWZ0KGNvdW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcihpID0gMDsgaSA8IGRpbWVuc2lvblswXTsgaSsrKXtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IHBhcnNlRWxlbWVudChlbGVtZW50VHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlKGRpbXMsIGVsZW1lbnRUeXBlKTtcbn07XG52YXIgcGFyc2VUZXh0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoJ3V0ZjgnKTtcbn07XG52YXIgcGFyc2VCb29sID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBwYXJzZUJpdHModmFsdWUsIDgpID4gMDtcbn07XG52YXIgaW5pdCA9IGZ1bmN0aW9uKHJlZ2lzdGVyKSB7XG4gICAgcmVnaXN0ZXIoMjAsIHBhcnNlSW50NjQpO1xuICAgIHJlZ2lzdGVyKDIxLCBwYXJzZUludDE2KTtcbiAgICByZWdpc3RlcigyMywgcGFyc2VJbnQzMik7XG4gICAgcmVnaXN0ZXIoMjYsIHBhcnNlSW50MzIpO1xuICAgIHJlZ2lzdGVyKDE3MDAsIHBhcnNlTnVtZXJpYyk7XG4gICAgcmVnaXN0ZXIoNzAwLCBwYXJzZUZsb2F0MzIpO1xuICAgIHJlZ2lzdGVyKDcwMSwgcGFyc2VGbG9hdDY0KTtcbiAgICByZWdpc3RlcigxNiwgcGFyc2VCb29sKTtcbiAgICByZWdpc3RlcigxMTE0LCBwYXJzZURhdGUuYmluZChudWxsLCBmYWxzZSkpO1xuICAgIHJlZ2lzdGVyKDExODQsIHBhcnNlRGF0ZS5iaW5kKG51bGwsIHRydWUpKTtcbiAgICByZWdpc3RlcigxMDAwLCBwYXJzZUFycmF5KTtcbiAgICByZWdpc3RlcigxMDA3LCBwYXJzZUFycmF5KTtcbiAgICByZWdpc3RlcigxMDE2LCBwYXJzZUFycmF5KTtcbiAgICByZWdpc3RlcigxMDA4LCBwYXJzZUFycmF5KTtcbiAgICByZWdpc3RlcigxMDA5LCBwYXJzZUFycmF5KTtcbiAgICByZWdpc3RlcigyNSwgcGFyc2VUZXh0KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0XG59O1xuIiwgIi8qKlxuICogRm9sbG93aW5nIHF1ZXJ5IHdhcyB1c2VkIHRvIGdlbmVyYXRlIHRoaXMgZmlsZTpcblxuIFNFTEVDVCBqc29uX29iamVjdF9hZ2coVVBQRVIoUFQudHlwbmFtZSksIFBULm9pZDo6aW50NCBPUkRFUiBCWSBwdC5vaWQpXG4gRlJPTSBwZ190eXBlIFBUXG4gV0hFUkUgdHlwbmFtZXNwYWNlID0gKFNFTEVDVCBwZ24ub2lkIEZST00gcGdfbmFtZXNwYWNlIHBnbiBXSEVSRSBuc3BuYW1lID0gJ3BnX2NhdGFsb2cnKSAtLSBUYWtlIG9ubHkgYnVpbHRpbmcgUG9zdGdyZXMgdHlwZXMgd2l0aCBzdGFibGUgT0lEIChleHRlbnNpb24gdHlwZXMgYXJlIG5vdCBndWFyYW50ZWQgdG8gYmUgc3RhYmxlKVxuIEFORCB0eXB0eXBlID0gJ2InIC0tIE9ubHkgYmFzaWMgdHlwZXNcbiBBTkQgdHlwZWxlbSA9IDAgLS0gSWdub3JlIGFsaWFzZXNcbiBBTkQgdHlwaXNkZWZpbmVkIC0tIElnbm9yZSB1bmRlZmluZWQgdHlwZXNcbiAqLyBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBCT09MOiAxNixcbiAgICBCWVRFQTogMTcsXG4gICAgQ0hBUjogMTgsXG4gICAgSU5UODogMjAsXG4gICAgSU5UMjogMjEsXG4gICAgSU5UNDogMjMsXG4gICAgUkVHUFJPQzogMjQsXG4gICAgVEVYVDogMjUsXG4gICAgT0lEOiAyNixcbiAgICBUSUQ6IDI3LFxuICAgIFhJRDogMjgsXG4gICAgQ0lEOiAyOSxcbiAgICBKU09OOiAxMTQsXG4gICAgWE1MOiAxNDIsXG4gICAgUEdfTk9ERV9UUkVFOiAxOTQsXG4gICAgU01HUjogMjEwLFxuICAgIFBBVEg6IDYwMixcbiAgICBQT0xZR09OOiA2MDQsXG4gICAgQ0lEUjogNjUwLFxuICAgIEZMT0FUNDogNzAwLFxuICAgIEZMT0FUODogNzAxLFxuICAgIEFCU1RJTUU6IDcwMixcbiAgICBSRUxUSU1FOiA3MDMsXG4gICAgVElOVEVSVkFMOiA3MDQsXG4gICAgQ0lSQ0xFOiA3MTgsXG4gICAgTUFDQUREUjg6IDc3NCxcbiAgICBNT05FWTogNzkwLFxuICAgIE1BQ0FERFI6IDgyOSxcbiAgICBJTkVUOiA4NjksXG4gICAgQUNMSVRFTTogMTAzMyxcbiAgICBCUENIQVI6IDEwNDIsXG4gICAgVkFSQ0hBUjogMTA0MyxcbiAgICBEQVRFOiAxMDgyLFxuICAgIFRJTUU6IDEwODMsXG4gICAgVElNRVNUQU1QOiAxMTE0LFxuICAgIFRJTUVTVEFNUFRaOiAxMTg0LFxuICAgIElOVEVSVkFMOiAxMTg2LFxuICAgIFRJTUVUWjogMTI2NixcbiAgICBCSVQ6IDE1NjAsXG4gICAgVkFSQklUOiAxNTYyLFxuICAgIE5VTUVSSUM6IDE3MDAsXG4gICAgUkVGQ1VSU09SOiAxNzkwLFxuICAgIFJFR1BST0NFRFVSRTogMjIwMixcbiAgICBSRUdPUEVSOiAyMjAzLFxuICAgIFJFR09QRVJBVE9SOiAyMjA0LFxuICAgIFJFR0NMQVNTOiAyMjA1LFxuICAgIFJFR1RZUEU6IDIyMDYsXG4gICAgVVVJRDogMjk1MCxcbiAgICBUWElEX1NOQVBTSE9UOiAyOTcwLFxuICAgIFBHX0xTTjogMzIyMCxcbiAgICBQR19ORElTVElOQ1Q6IDMzNjEsXG4gICAgUEdfREVQRU5ERU5DSUVTOiAzNDAyLFxuICAgIFRTVkVDVE9SOiAzNjE0LFxuICAgIFRTUVVFUlk6IDM2MTUsXG4gICAgR1RTVkVDVE9SOiAzNjQyLFxuICAgIFJFR0NPTkZJRzogMzczNCxcbiAgICBSRUdESUNUSU9OQVJZOiAzNzY5LFxuICAgIEpTT05COiAzODAyLFxuICAgIFJFR05BTUVTUEFDRTogNDA4OSxcbiAgICBSRUdST0xFOiA0MDk2XG59O1xuIiwgInZhciB0ZXh0UGFyc2VycyA9IHJlcXVpcmUoJy4vbGliL3RleHRQYXJzZXJzJyk7XG52YXIgYmluYXJ5UGFyc2VycyA9IHJlcXVpcmUoJy4vbGliL2JpbmFyeVBhcnNlcnMnKTtcbnZhciBhcnJheVBhcnNlciA9IHJlcXVpcmUoJy4vbGliL2FycmF5UGFyc2VyJyk7XG52YXIgYnVpbHRpblR5cGVzID0gcmVxdWlyZSgnLi9saWIvYnVpbHRpbnMnKTtcbmV4cG9ydHMuZ2V0VHlwZVBhcnNlciA9IGdldFR5cGVQYXJzZXI7XG5leHBvcnRzLnNldFR5cGVQYXJzZXIgPSBzZXRUeXBlUGFyc2VyO1xuZXhwb3J0cy5hcnJheVBhcnNlciA9IGFycmF5UGFyc2VyO1xuZXhwb3J0cy5idWlsdGlucyA9IGJ1aWx0aW5UeXBlcztcbnZhciB0eXBlUGFyc2VycyA9IHtcbiAgICB0ZXh0OiB7fSxcbiAgICBiaW5hcnk6IHt9XG59O1xuLy90aGUgZW1wdHkgcGFyc2UgZnVuY3Rpb25cbmZ1bmN0aW9uIG5vUGFyc2UodmFsKSB7XG4gICAgcmV0dXJuIFN0cmluZyh2YWwpO1xufVxuLy9yZXR1cm5zIGEgZnVuY3Rpb24gdXNlZCB0byBjb252ZXJ0IGEgc3BlY2lmaWMgdHlwZSAoc3BlY2lmaWVkIGJ5XG4vL29pZCkgaW50byBhIHJlc3VsdCBqYXZhc2NyaXB0IHR5cGVcbi8vbm90ZTogdGhlIG9pZCBjYW4gYmUgb2J0YWluZWQgdmlhIHRoZSBmb2xsb3dpbmcgc3FsIHF1ZXJ5OlxuLy9TRUxFQ1Qgb2lkIEZST00gcGdfdHlwZSBXSEVSRSB0eXBuYW1lID0gJ1RZUEVfTkFNRV9IRVJFJztcbmZ1bmN0aW9uIGdldFR5cGVQYXJzZXIob2lkLCBmb3JtYXQpIHtcbiAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJ3RleHQnO1xuICAgIGlmICghdHlwZVBhcnNlcnNbZm9ybWF0XSkge1xuICAgICAgICByZXR1cm4gbm9QYXJzZTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVQYXJzZXJzW2Zvcm1hdF1bb2lkXSB8fCBub1BhcnNlO1xufVxuZnVuY3Rpb24gc2V0VHlwZVBhcnNlcihvaWQsIGZvcm1hdCwgcGFyc2VGbikge1xuICAgIGlmICh0eXBlb2YgZm9ybWF0ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcGFyc2VGbiA9IGZvcm1hdDtcbiAgICAgICAgZm9ybWF0ID0gJ3RleHQnO1xuICAgIH1cbiAgICB0eXBlUGFyc2Vyc1tmb3JtYXRdW29pZF0gPSBwYXJzZUZuO1xufVxudGV4dFBhcnNlcnMuaW5pdChmdW5jdGlvbihvaWQsIGNvbnZlcnRlcikge1xuICAgIHR5cGVQYXJzZXJzLnRleHRbb2lkXSA9IGNvbnZlcnRlcjtcbn0pO1xuYmluYXJ5UGFyc2Vycy5pbml0KGZ1bmN0aW9uKG9pZCwgY29udmVydGVyKSB7XG4gICAgdHlwZVBhcnNlcnMuYmluYXJ5W29pZF0gPSBjb252ZXJ0ZXI7XG59KTtcbiIsICIndXNlIHN0cmljdCc7XG5sZXQgdXNlcjtcbnRyeSB7XG4gICAgdXNlciA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyBwcm9jZXNzLmVudi5VU0VSTkFNRSA6IHByb2Nlc3MuZW52LlVTRVI7XG59IGNhdGNoICB7XG4vLyBpZ25vcmUsIGUuZy4sIERlbm8gd2l0aG91dCAtLWFsbG93LWVudlxufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gZGF0YWJhc2UgaG9zdC4gZGVmYXVsdHMgdG8gbG9jYWxob3N0XG4gICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgLy8gZGF0YWJhc2UgdXNlcidzIG5hbWVcbiAgICB1c2VyLFxuICAgIC8vIG5hbWUgb2YgZGF0YWJhc2UgdG8gY29ubmVjdFxuICAgIGRhdGFiYXNlOiB1bmRlZmluZWQsXG4gICAgLy8gZGF0YWJhc2UgdXNlcidzIHBhc3N3b3JkXG4gICAgcGFzc3dvcmQ6IG51bGwsXG4gICAgLy8gYSBQb3N0Z3JlcyBjb25uZWN0aW9uIHN0cmluZyB0byBiZSB1c2VkIGluc3RlYWQgb2Ygc2V0dGluZyBpbmRpdmlkdWFsIGNvbm5lY3Rpb24gaXRlbXNcbiAgICAvLyBOT1RFOiAgU2V0dGluZyB0aGlzIHZhbHVlIHdpbGwgY2F1c2UgaXQgdG8gb3ZlcnJpZGUgYW55IG90aGVyIHZhbHVlIChzdWNoIGFzIGRhdGFiYXNlIG9yIHVzZXIpIGRlZmluZWRcbiAgICAvLyBpbiB0aGUgZGVmYXVsdHMgb2JqZWN0LlxuICAgIGNvbm5lY3Rpb25TdHJpbmc6IHVuZGVmaW5lZCxcbiAgICAvLyBkYXRhYmFzZSBwb3J0XG4gICAgcG9ydDogNTQzMixcbiAgICAvLyBudW1iZXIgb2Ygcm93cyB0byByZXR1cm4gYXQgYSB0aW1lIGZyb20gYSBwcmVwYXJlZCBzdGF0ZW1lbnQnc1xuICAgIC8vIHBvcnRhbC4gMCB3aWxsIHJldHVybiBhbGwgcm93cyBhdCBvbmNlXG4gICAgcm93czogMCxcbiAgICAvLyBiaW5hcnkgcmVzdWx0IG1vZGVcbiAgICBiaW5hcnk6IGZhbHNlLFxuICAgIC8vIENvbm5lY3Rpb24gcG9vbCBvcHRpb25zIC0gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icmlhbmMvbm9kZS1wZy1wb29sXG4gICAgLy8gbnVtYmVyIG9mIGNvbm5lY3Rpb25zIHRvIHVzZSBpbiBjb25uZWN0aW9uIHBvb2xcbiAgICAvLyAwIHdpbGwgZGlzYWJsZSBjb25uZWN0aW9uIHBvb2xpbmdcbiAgICBtYXg6IDEwLFxuICAgIC8vIG1heCBtaWxsaXNlY29uZHMgYSBjbGllbnQgY2FuIGdvIHVudXNlZCBiZWZvcmUgaXQgaXMgcmVtb3ZlZFxuICAgIC8vIGZyb20gdGhlIHBvb2wgYW5kIGRlc3Ryb3llZFxuICAgIGlkbGVUaW1lb3V0TWlsbGlzOiAzMDAwMCxcbiAgICBjbGllbnRfZW5jb2Rpbmc6ICcnLFxuICAgIHNzbDogZmFsc2UsXG4gICAgLy8gU1NMIG5lZ290aWF0aW9uIHN0eWxlOiAncG9zdGdyZXMnICh0cmFkaXRpb25hbCBTU0xSZXF1ZXN0KSBvciAnZGlyZWN0J1xuICAgIHNzbG5lZ290aWF0aW9uOiB1bmRlZmluZWQsXG4gICAgYXBwbGljYXRpb25fbmFtZTogdW5kZWZpbmVkLFxuICAgIGZhbGxiYWNrX2FwcGxpY2F0aW9uX25hbWU6IHVuZGVmaW5lZCxcbiAgICBvcHRpb25zOiB1bmRlZmluZWQsXG4gICAgcGFyc2VJbnB1dERhdGVzQXNVVEM6IGZhbHNlLFxuICAgIC8vIG1heCBtaWxsaXNlY29uZHMgYW55IHF1ZXJ5IHVzaW5nIHRoaXMgY29ubmVjdGlvbiB3aWxsIGV4ZWN1dGUgZm9yIGJlZm9yZSB0aW1pbmcgb3V0IGluIGVycm9yLlxuICAgIC8vIGZhbHNlPXVubGltaXRlZFxuICAgIHN0YXRlbWVudF90aW1lb3V0OiBmYWxzZSxcbiAgICAvLyBBYm9ydCBhbnkgc3RhdGVtZW50IHRoYXQgd2FpdHMgbG9uZ2VyIHRoYW4gdGhlIHNwZWNpZmllZCBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgd2hpbGUgYXR0ZW1wdGluZyB0byBhY3F1aXJlIGEgbG9jay5cbiAgICAvLyBmYWxzZT11bmxpbWl0ZWRcbiAgICBsb2NrX3RpbWVvdXQ6IGZhbHNlLFxuICAgIC8vIFRlcm1pbmF0ZSBhbnkgc2Vzc2lvbiB3aXRoIGFuIG9wZW4gdHJhbnNhY3Rpb24gdGhhdCBoYXMgYmVlbiBpZGxlIGZvciBsb25nZXIgdGhhbiB0aGUgc3BlY2lmaWVkIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kc1xuICAgIC8vIGZhbHNlPXVubGltaXRlZFxuICAgIGlkbGVfaW5fdHJhbnNhY3Rpb25fc2Vzc2lvbl90aW1lb3V0OiBmYWxzZSxcbiAgICAvLyBtYXggbWlsbGlzZWNvbmRzIHRvIHdhaXQgZm9yIHF1ZXJ5IHRvIGNvbXBsZXRlIChjbGllbnQgc2lkZSlcbiAgICBxdWVyeV90aW1lb3V0OiBmYWxzZSxcbiAgICBjb25uZWN0X3RpbWVvdXQ6IDAsXG4gICAga2VlcGFsaXZlczogMSxcbiAgICBrZWVwYWxpdmVzX2lkbGU6IDBcbn07XG5jb25zdCBwZ1R5cGVzID0gcmVxdWlyZSgncGctdHlwZXMnKTtcbi8vIHNhdmUgZGVmYXVsdCBwYXJzZXJzXG5jb25zdCBwYXJzZUJpZ0ludGVnZXIgPSBwZ1R5cGVzLmdldFR5cGVQYXJzZXIoMjAsICd0ZXh0Jyk7XG5jb25zdCBwYXJzZUJpZ0ludGVnZXJBcnJheSA9IHBnVHlwZXMuZ2V0VHlwZVBhcnNlcigxMDE2LCAndGV4dCcpO1xuLy8gcGFyc2UgaW50OCBzbyB5b3UgY2FuIGdldCB5b3VyIGNvdW50IHZhbHVlcyBhcyBhY3R1YWwgbnVtYmVyc1xubW9kdWxlLmV4cG9ydHMuX19kZWZpbmVTZXR0ZXJfXygncGFyc2VJbnQ4JywgZnVuY3Rpb24odmFsKSB7XG4gICAgcGdUeXBlcy5zZXRUeXBlUGFyc2VyKDIwLCAndGV4dCcsIHZhbCA/IHBnVHlwZXMuZ2V0VHlwZVBhcnNlcigyMywgJ3RleHQnKSA6IHBhcnNlQmlnSW50ZWdlcik7XG4gICAgcGdUeXBlcy5zZXRUeXBlUGFyc2VyKDEwMTYsICd0ZXh0JywgdmFsID8gcGdUeXBlcy5nZXRUeXBlUGFyc2VyKDEwMDcsICd0ZXh0JykgOiBwYXJzZUJpZ0ludGVnZXJBcnJheSk7XG59KTtcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcbmNvbnN0IHsgaXNEYXRlIH0gPSByZXF1aXJlKCd1dGlsL3R5cGVzJyk7XG5mdW5jdGlvbiBlc2NhcGVFbGVtZW50KGVsZW1lbnRSZXByZXNlbnRhdGlvbikge1xuICAgIGNvbnN0IGVzY2FwZWQgPSBlbGVtZW50UmVwcmVzZW50YXRpb24ucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyk7XG4gICAgcmV0dXJuICdcIicgKyBlc2NhcGVkICsgJ1wiJztcbn1cbi8vIGNvbnZlcnQgYSBKUyBhcnJheSB0byBhIHBvc3RncmVzIGFycmF5IGxpdGVyYWxcbi8vIHVzZXMgY29tbWEgc2VwYXJhdG9yIHNvIHdvbid0IHdvcmsgZm9yIHR5cGVzIGxpa2UgYm94IHRoYXQgdXNlXG4vLyBhIGRpZmZlcmVudCBhcnJheSBzZXBhcmF0b3IuXG5mdW5jdGlvbiBhcnJheVN0cmluZyh2YWwpIHtcbiAgICBsZXQgcmVzdWx0ID0gJ3snO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspe1xuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSAnLCc7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGl0ZW0gPSB2YWxbaV07XG4gICAgICAgIGlmIChpdGVtID09IG51bGwpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSAnTlVMTCc7XG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGFycmF5U3RyaW5nKGl0ZW0pO1xuICAgICAgICB9IGVsc2UgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhpdGVtKSkge1xuICAgICAgICAgICAgaWYgKCEoaXRlbSBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAgICAgICAgICAgICBpdGVtID0gQnVmZmVyLmZyb20oaXRlbS5idWZmZXIsIGl0ZW0uYnl0ZU9mZnNldCwgaXRlbS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdCArPSAnXFxcXFxcXFx4JyArIGl0ZW0udG9TdHJpbmcoJ2hleCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGVzY2FwZUVsZW1lbnQocHJlcGFyZVZhbHVlKGl0ZW0pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQgKz0gJ30nO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4vLyBjb252ZXJ0cyB2YWx1ZXMgZnJvbSBqYXZhc2NyaXB0IHR5cGVzXG4vLyB0byB0aGVpciAncmF3JyBjb3VudGVycGFydHMgZm9yIHVzZSBhcyBhIHBvc3RncmVzIHBhcmFtZXRlclxuLy8gbm90ZTogeW91IGNhbiBvdmVycmlkZSB0aGlzIGZ1bmN0aW9uIHRvIHByb3ZpZGUgeW91ciBvd24gY29udmVyc2lvbiBtZWNoYW5pc21cbi8vIGZvciBjb21wbGV4IHR5cGVzLCBldGMuLi5cbmNvbnN0IHByZXBhcmVWYWx1ZSA9IGZ1bmN0aW9uKHZhbCwgc2Vlbikge1xuICAgIC8vIG51bGwgYW5kIHVuZGVmaW5lZCBhcmUgYm90aCBudWxsIGZvciBwb3N0Z3Jlc1xuICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmICh2YWwgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyh2YWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsLmJ1ZmZlciwgdmFsLmJ5dGVPZmZzZXQsIHZhbC5ieXRlTGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNEYXRlKHZhbCkpIHtcbiAgICAgICAgICAgIGlmIChkZWZhdWx0cy5wYXJzZUlucHV0RGF0ZXNBc1VUQykge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlVG9TdHJpbmdVVEModmFsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGVUb1N0cmluZyh2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBhcnJheVN0cmluZyh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcmVwYXJlT2JqZWN0KHZhbCwgc2Vlbik7XG4gICAgfVxuICAgIHJldHVybiB2YWwudG9TdHJpbmcoKTtcbn07XG5mdW5jdGlvbiBwcmVwYXJlT2JqZWN0KHZhbCwgc2Vlbikge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b1Bvc3RncmVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNlZW4gPSBzZWVuIHx8IFtdO1xuICAgICAgICBpZiAoc2Vlbi5pbmRleE9mKHZhbCkgIT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NpcmN1bGFyIHJlZmVyZW5jZSBkZXRlY3RlZCB3aGlsZSBwcmVwYXJpbmcgXCInICsgdmFsICsgJ1wiIGZvciBxdWVyeScpO1xuICAgICAgICB9XG4gICAgICAgIHNlZW4ucHVzaCh2YWwpO1xuICAgICAgICByZXR1cm4gcHJlcGFyZVZhbHVlKHZhbC50b1Bvc3RncmVzKHByZXBhcmVWYWx1ZSksIHNlZW4pO1xuICAgIH1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsKTtcbn1cbmZ1bmN0aW9uIGRhdGVUb1N0cmluZyhkYXRlKSB7XG4gICAgbGV0IG9mZnNldCA9IC1kYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgbGV0IHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgY29uc3QgaXNCQ1llYXIgPSB5ZWFyIDwgMTtcbiAgICBpZiAoaXNCQ1llYXIpIHllYXIgPSBNYXRoLmFicyh5ZWFyKSArIDE7IC8vIG5lZ2F0aXZlIHllYXJzIGFyZSAxIG9mZiB0aGVpciBCQyByZXByZXNlbnRhdGlvblxuICAgIGxldCByZXQgPSBTdHJpbmcoeWVhcikucGFkU3RhcnQoNCwgJzAnKSArICctJyArIFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpICsgJy0nICsgU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpICsgJ1QnICsgU3RyaW5nKGRhdGUuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgJzAnKSArICc6JyArIFN0cmluZyhkYXRlLmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgJzAnKSArICc6JyArIFN0cmluZyhkYXRlLmdldFNlY29uZHMoKSkucGFkU3RhcnQoMiwgJzAnKSArICcuJyArIFN0cmluZyhkYXRlLmdldE1pbGxpc2Vjb25kcygpKS5wYWRTdGFydCgzLCAnMCcpO1xuICAgIGlmIChvZmZzZXQgPCAwKSB7XG4gICAgICAgIHJldCArPSAnLSc7XG4gICAgICAgIG9mZnNldCAqPSAtMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXQgKz0gJysnO1xuICAgIH1cbiAgICByZXQgKz0gU3RyaW5nKE1hdGguZmxvb3Iob2Zmc2V0IC8gNjApKS5wYWRTdGFydCgyLCAnMCcpICsgJzonICsgU3RyaW5nKG9mZnNldCAlIDYwKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgIGlmIChpc0JDWWVhcikgcmV0ICs9ICcgQkMnO1xuICAgIHJldHVybiByZXQ7XG59XG5mdW5jdGlvbiBkYXRlVG9TdHJpbmdVVEMoZGF0ZSkge1xuICAgIGxldCB5ZWFyID0gZGF0ZS5nZXRVVENGdWxsWWVhcigpO1xuICAgIGNvbnN0IGlzQkNZZWFyID0geWVhciA8IDE7XG4gICAgaWYgKGlzQkNZZWFyKSB5ZWFyID0gTWF0aC5hYnMoeWVhcikgKyAxOyAvLyBuZWdhdGl2ZSB5ZWFycyBhcmUgMSBvZmYgdGhlaXIgQkMgcmVwcmVzZW50YXRpb25cbiAgICBsZXQgcmV0ID0gU3RyaW5nKHllYXIpLnBhZFN0YXJ0KDQsICcwJykgKyAnLScgKyBTdHJpbmcoZGF0ZS5nZXRVVENNb250aCgpICsgMSkucGFkU3RhcnQoMiwgJzAnKSArICctJyArIFN0cmluZyhkYXRlLmdldFVUQ0RhdGUoKSkucGFkU3RhcnQoMiwgJzAnKSArICdUJyArIFN0cmluZyhkYXRlLmdldFVUQ0hvdXJzKCkpLnBhZFN0YXJ0KDIsICcwJykgKyAnOicgKyBTdHJpbmcoZGF0ZS5nZXRVVENNaW51dGVzKCkpLnBhZFN0YXJ0KDIsICcwJykgKyAnOicgKyBTdHJpbmcoZGF0ZS5nZXRVVENTZWNvbmRzKCkpLnBhZFN0YXJ0KDIsICcwJykgKyAnLicgKyBTdHJpbmcoZGF0ZS5nZXRVVENNaWxsaXNlY29uZHMoKSkucGFkU3RhcnQoMywgJzAnKTtcbiAgICByZXQgKz0gJyswMDowMCc7XG4gICAgaWYgKGlzQkNZZWFyKSByZXQgKz0gJyBCQyc7XG4gICAgcmV0dXJuIHJldDtcbn1cbmZ1bmN0aW9uIG5vcm1hbGl6ZVF1ZXJ5Q29uZmlnKGNvbmZpZywgdmFsdWVzLCBjYWxsYmFjaykge1xuICAgIC8vIGNhbiB0YWtlIGluIHN0cmluZ3Mgb3IgY29uZmlnIG9iamVjdHNcbiAgICBjb25maWcgPSB0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJyA/IHtcbiAgICAgICAgdGV4dDogY29uZmlnXG4gICAgfSA6IGNvbmZpZztcbiAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb25maWcuY2FsbGJhY2sgPSB2YWx1ZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maWcudmFsdWVzID0gdmFsdWVzO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjb25maWcuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZztcbn1cbi8vIFBvcnRlZCBmcm9tIFBvc3RncmVTUUwgOS4yLjQgc291cmNlIGNvZGUgaW4gc3JjL2ludGVyZmFjZXMvbGlicHEvZmUtZXhlYy5jXG5jb25zdCBlc2NhcGVJZGVudGlmaWVyID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuICdcIicgKyBzdHIucmVwbGFjZSgvXCIvZywgJ1wiXCInKSArICdcIic7XG59O1xuY29uc3QgZXNjYXBlTGl0ZXJhbCA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGxldCBoYXNCYWNrc2xhc2ggPSBmYWxzZTtcbiAgICBsZXQgZXNjYXBlZCA9IFwiJ1wiO1xuICAgIGlmIChzdHIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gXCInJ1wiO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIFwiJydcIjtcbiAgICB9XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGNvbnN0IGMgPSBzdHJbaV07XG4gICAgICAgIGlmIChjID09PSBcIidcIikge1xuICAgICAgICAgICAgZXNjYXBlZCArPSBjICsgYztcbiAgICAgICAgfSBlbHNlIGlmIChjID09PSAnXFxcXCcpIHtcbiAgICAgICAgICAgIGVzY2FwZWQgKz0gYyArIGM7XG4gICAgICAgICAgICBoYXNCYWNrc2xhc2ggPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXNjYXBlZCArPSBjO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVzY2FwZWQgKz0gXCInXCI7XG4gICAgaWYgKGhhc0JhY2tzbGFzaCA9PT0gdHJ1ZSkge1xuICAgICAgICBlc2NhcGVkID0gJyBFJyArIGVzY2FwZWQ7XG4gICAgfVxuICAgIHJldHVybiBlc2NhcGVkO1xufTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHByZXBhcmVWYWx1ZTogZnVuY3Rpb24gcHJlcGFyZVZhbHVlV3JhcHBlcih2YWx1ZSkge1xuICAgICAgICAvLyB0aGlzIGVuc3VyZXMgdGhhdCBleHRyYSBhcmd1bWVudHMgZG8gbm90IGdldCBwYXNzZWQgaW50byBwcmVwYXJlVmFsdWVcbiAgICAgICAgLy8gYnkgYWNjaWRlbnQsIGVnOiBmcm9tIGNhbGxpbmcgdmFsdWVzLm1hcCh1dGlscy5wcmVwYXJlVmFsdWUpXG4gICAgICAgIHJldHVybiBwcmVwYXJlVmFsdWUodmFsdWUpO1xuICAgIH0sXG4gICAgbm9ybWFsaXplUXVlcnlDb25maWcsXG4gICAgZXNjYXBlSWRlbnRpZmllcixcbiAgICBlc2NhcGVMaXRlcmFsXG59O1xuIiwgImNvbnN0IG5vZGVDcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBvc3RncmVzTWQ1UGFzc3dvcmRIYXNoLFxuICAgIHJhbmRvbUJ5dGVzLFxuICAgIGRlcml2ZUtleSxcbiAgICBzaGEyNTYsXG4gICAgaGFzaEJ5TmFtZSxcbiAgICBobWFjU2hhMjU2LFxuICAgIG1kNVxufTtcbi8qKlxuICogVGhlIFdlYiBDcnlwdG8gQVBJIC0gZ3JhYmJlZCBmcm9tIHRoZSBOb2RlLmpzIGxpYnJhcnkgb3IgdGhlIGdsb2JhbFxuICogQHR5cGUgQ3J5cHRvXG4gKi8gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5jb25zdCB3ZWJDcnlwdG8gPSBub2RlQ3J5cHRvLndlYmNyeXB0byB8fCBnbG9iYWxUaGlzLmNyeXB0bztcbi8qKlxuICogVGhlIFN1YnRsZUNyeXB0byBBUEkgZm9yIGxvdyBsZXZlbCBjcnlwdG8gb3BlcmF0aW9ucy5cbiAqIEB0eXBlIFN1YnRsZUNyeXB0b1xuICovIGNvbnN0IHN1YnRsZUNyeXB0byA9IHdlYkNyeXB0by5zdWJ0bGU7XG5jb25zdCB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuLyoqXG4gKlxuICogQHBhcmFtIHsqfSBsZW5ndGhcbiAqIEByZXR1cm5zXG4gKi8gZnVuY3Rpb24gcmFuZG9tQnl0ZXMobGVuZ3RoKSB7XG4gICAgcmV0dXJuIHdlYkNyeXB0by5nZXRSYW5kb21WYWx1ZXMoQnVmZmVyLmFsbG9jKGxlbmd0aCkpO1xufVxuYXN5bmMgZnVuY3Rpb24gbWQ1KHN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBub2RlQ3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShzdHJpbmcsICd1dGYtOCcpLmRpZ2VzdCgnaGV4Jyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBgY3JlYXRlSGFzaCgpYCBmYWlsZWQgc28gd2UgYXJlIHByb2JhYmx5IG5vdCBpbiBOb2RlLmpzLCB1c2UgdGhlIFdlYkNyeXB0byBBUEkgaW5zdGVhZC5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoZSBNRDUgYWxnb3JpdGhtIG9uIFdlYkNyeXB0byBpcyBub3QgYXZhaWxhYmxlIGluIE5vZGUuanMuXG4gICAgICAgIC8vIFRoaXMgaXMgd2h5IHdlIGNhbm5vdCBqdXN0IHVzZSBXZWJDcnlwdG8gaW4gYWxsIGVudmlyb25tZW50cy5cbiAgICAgICAgY29uc3QgZGF0YSA9IHR5cGVvZiBzdHJpbmcgPT09ICdzdHJpbmcnID8gdGV4dEVuY29kZXIuZW5jb2RlKHN0cmluZykgOiBzdHJpbmc7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBzdWJ0bGVDcnlwdG8uZGlnZXN0KCdNRDUnLCBkYXRhKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFVpbnQ4QXJyYXkoaGFzaCkpLm1hcCgoYik9PmIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xuICAgIH1cbn1cbi8vIFNlZSBBdXRoZW50aWNhdGlvbk1ENVBhc3N3b3JkIGF0IGh0dHBzOi8vd3d3LnBvc3RncmVzcWwub3JnL2RvY3MvY3VycmVudC9zdGF0aWMvcHJvdG9jb2wtZmxvdy5odG1sXG5hc3luYyBmdW5jdGlvbiBwb3N0Z3Jlc01kNVBhc3N3b3JkSGFzaCh1c2VyLCBwYXNzd29yZCwgc2FsdCkge1xuICAgIGNvbnN0IGlubmVyID0gYXdhaXQgbWQ1KHBhc3N3b3JkICsgdXNlcik7XG4gICAgY29uc3Qgb3V0ZXIgPSBhd2FpdCBtZDUoQnVmZmVyLmNvbmNhdChbXG4gICAgICAgIEJ1ZmZlci5mcm9tKGlubmVyKSxcbiAgICAgICAgc2FsdFxuICAgIF0pKTtcbiAgICByZXR1cm4gJ21kNScgKyBvdXRlcjtcbn1cbi8qKlxuICogQ3JlYXRlIGEgU0hBLTI1NiBkaWdlc3Qgb2YgdGhlIGdpdmVuIGRhdGFcbiAqIEBwYXJhbSB7QnVmZmVyfSBkYXRhXG4gKi8gYXN5bmMgZnVuY3Rpb24gc2hhMjU2KHRleHQpIHtcbiAgICByZXR1cm4gYXdhaXQgc3VidGxlQ3J5cHRvLmRpZ2VzdCgnU0hBLTI1NicsIHRleHQpO1xufVxuYXN5bmMgZnVuY3Rpb24gaGFzaEJ5TmFtZShoYXNoTmFtZSwgdGV4dCkge1xuICAgIHJldHVybiBhd2FpdCBzdWJ0bGVDcnlwdG8uZGlnZXN0KGhhc2hOYW1lLCB0ZXh0KTtcbn1cbi8qKlxuICogU2lnbiB0aGUgbWVzc2FnZSB3aXRoIHRoZSBnaXZlbiBrZXlcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGtleUJ1ZmZlclxuICogQHBhcmFtIHtzdHJpbmd9IG1zZ1xuICovIGFzeW5jIGZ1bmN0aW9uIGhtYWNTaGEyNTYoa2V5QnVmZmVyLCBtc2cpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBzdWJ0bGVDcnlwdG8uaW1wb3J0S2V5KCdyYXcnLCBrZXlCdWZmZXIsIHtcbiAgICAgICAgbmFtZTogJ0hNQUMnLFxuICAgICAgICBoYXNoOiAnU0hBLTI1NidcbiAgICB9LCBmYWxzZSwgW1xuICAgICAgICAnc2lnbidcbiAgICBdKTtcbiAgICByZXR1cm4gYXdhaXQgc3VidGxlQ3J5cHRvLnNpZ24oJ0hNQUMnLCBrZXksIHRleHRFbmNvZGVyLmVuY29kZShtc2cpKTtcbn1cbi8qKlxuICogRGVyaXZlIGEga2V5IGZyb20gdGhlIHBhc3N3b3JkIGFuZCBzYWx0XG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmRcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gc2FsdFxuICogQHBhcmFtIHtudW1iZXJ9IGl0ZXJhdGlvbnNcbiAqLyBhc3luYyBmdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQsIGl0ZXJhdGlvbnMpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBzdWJ0bGVDcnlwdG8uaW1wb3J0S2V5KCdyYXcnLCB0ZXh0RW5jb2Rlci5lbmNvZGUocGFzc3dvcmQpLCAnUEJLREYyJywgZmFsc2UsIFtcbiAgICAgICAgJ2Rlcml2ZUJpdHMnXG4gICAgXSk7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICBzYWx0OiBzYWx0LFxuICAgICAgICBpdGVyYXRpb25zOiBpdGVyYXRpb25zXG4gICAgfTtcbiAgICByZXR1cm4gYXdhaXQgc3VidGxlQ3J5cHRvLmRlcml2ZUJpdHMocGFyYW1zLCBrZXksIDMyICogOCwgW1xuICAgICAgICAnZGVyaXZlQml0cydcbiAgICBdKTtcbn1cbiIsICJmdW5jdGlvbiB4NTA5RXJyb3IobXNnLCBjZXJ0KSB7XG4gICAgcmV0dXJuIG5ldyBFcnJvcignU0FTTCBjaGFubmVsIGJpbmRpbmc6ICcgKyBtc2cgKyAnIHdoZW4gcGFyc2luZyBwdWJsaWMgY2VydGlmaWNhdGUgJyArIGNlcnQudG9TdHJpbmcoJ2Jhc2U2NCcpKTtcbn1cbmZ1bmN0aW9uIHJlYWRBU04xTGVuZ3RoKGRhdGEsIGluZGV4KSB7XG4gICAgbGV0IGxlbmd0aCA9IGRhdGFbaW5kZXgrK107XG4gICAgaWYgKGxlbmd0aCA8IDB4ODApIHJldHVybiB7XG4gICAgICAgIGxlbmd0aCxcbiAgICAgICAgaW5kZXhcbiAgICB9O1xuICAgIGNvbnN0IGxlbmd0aEJ5dGVzID0gbGVuZ3RoICYgMHg3ZjtcbiAgICBpZiAobGVuZ3RoQnl0ZXMgPiA0KSB0aHJvdyB4NTA5RXJyb3IoJ2JhZCBsZW5ndGgnLCBkYXRhKTtcbiAgICBsZW5ndGggPSAwO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGhCeXRlczsgaSsrKXtcbiAgICAgICAgbGVuZ3RoID0gbGVuZ3RoIDw8IDggfCBkYXRhW2luZGV4KytdO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBsZW5ndGgsXG4gICAgICAgIGluZGV4XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJlYWRBU04xT0lEKGRhdGEsIGluZGV4KSB7XG4gICAgaWYgKGRhdGFbaW5kZXgrK10gIT09IDB4NikgdGhyb3cgeDUwOUVycm9yKCdub24tT0lEIGRhdGEnLCBkYXRhKSAvLyA2ID0gT0lEXG4gICAgO1xuICAgIGNvbnN0IHsgbGVuZ3RoOiBPSURMZW5ndGgsIGluZGV4OiBpbmRleEFmdGVyT0lETGVuZ3RoIH0gPSByZWFkQVNOMUxlbmd0aChkYXRhLCBpbmRleCk7XG4gICAgaW5kZXggPSBpbmRleEFmdGVyT0lETGVuZ3RoO1xuICAgIGNvbnN0IGxhc3RJbmRleCA9IGluZGV4ICsgT0lETGVuZ3RoO1xuICAgIGNvbnN0IGJ5dGUxID0gZGF0YVtpbmRleCsrXTtcbiAgICBsZXQgb2lkID0gKGJ5dGUxIC8gNDAgPj4gMCkgKyAnLicgKyBieXRlMSAlIDQwO1xuICAgIHdoaWxlKGluZGV4IDwgbGFzdEluZGV4KXtcbiAgICAgICAgLy8gbG9vcCBvdmVyIG51bWJlcnMgaW4gT0lEXG4gICAgICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgICAgIHdoaWxlKGluZGV4IDwgbGFzdEluZGV4KXtcbiAgICAgICAgICAgIC8vIGxvb3Agb3ZlciBieXRlcyBpbiBudW1iZXJcbiAgICAgICAgICAgIGNvbnN0IG5leHRCeXRlID0gZGF0YVtpbmRleCsrXTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPDwgNyB8IG5leHRCeXRlICYgMHg3ZjtcbiAgICAgICAgICAgIGlmIChuZXh0Qnl0ZSA8IDB4ODApIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG9pZCArPSAnLicgKyB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb2lkLFxuICAgICAgICBpbmRleFxuICAgIH07XG59XG5mdW5jdGlvbiBleHBlY3RBU04xU2VxKGRhdGEsIGluZGV4KSB7XG4gICAgaWYgKGRhdGFbaW5kZXgrK10gIT09IDB4MzApIHRocm93IHg1MDlFcnJvcignbm9uLXNlcXVlbmNlIGRhdGEnLCBkYXRhKSAvLyAzMCA9IFNlcXVlbmNlXG4gICAgO1xuICAgIHJldHVybiByZWFkQVNOMUxlbmd0aChkYXRhLCBpbmRleCk7XG59XG5mdW5jdGlvbiBzaWduYXR1cmVBbGdvcml0aG1IYXNoRnJvbUNlcnRpZmljYXRlKGRhdGEsIGluZGV4KSB7XG4gICAgLy8gcmVhZCB0aGlzIHRocmVhZDogaHR0cHM6Ly93d3cucG9zdGdyZXNxbC5vcmcvbWVzc2FnZS1pZC8xNzc2MC1iNmM2MWU3NTJlYzA3MDYwJTQwcG9zdGdyZXNxbC5vcmdcbiAgICBpZiAoaW5kZXggPT09IHVuZGVmaW5lZCkgaW5kZXggPSAwO1xuICAgIGluZGV4ID0gZXhwZWN0QVNOMVNlcShkYXRhLCBpbmRleCkuaW5kZXg7XG4gICAgY29uc3QgeyBsZW5ndGg6IGNlcnRJbmZvTGVuZ3RoLCBpbmRleDogaW5kZXhBZnRlckNlcnRJbmZvTGVuZ3RoIH0gPSBleHBlY3RBU04xU2VxKGRhdGEsIGluZGV4KTtcbiAgICBpbmRleCA9IGluZGV4QWZ0ZXJDZXJ0SW5mb0xlbmd0aCArIGNlcnRJbmZvTGVuZ3RoOyAvLyBza2lwIG92ZXIgY2VydGlmaWNhdGUgaW5mb1xuICAgIGluZGV4ID0gZXhwZWN0QVNOMVNlcShkYXRhLCBpbmRleCkuaW5kZXg7IC8vIHNraXAgb3ZlciBzaWduYXR1cmUgbGVuZ3RoIGZpZWxkXG4gICAgY29uc3QgeyBvaWQsIGluZGV4OiBpbmRleEFmdGVyT0lEIH0gPSByZWFkQVNOMU9JRChkYXRhLCBpbmRleCk7XG4gICAgc3dpdGNoKG9pZCl7XG4gICAgICAgIC8vIFJTQVxuICAgICAgICBjYXNlICcxLjIuODQwLjExMzU0OS4xLjEuNCc6XG4gICAgICAgICAgICByZXR1cm4gJ01ENSc7XG4gICAgICAgIGNhc2UgJzEuMi44NDAuMTEzNTQ5LjEuMS41JzpcbiAgICAgICAgICAgIHJldHVybiAnU0hBLTEnO1xuICAgICAgICBjYXNlICcxLjIuODQwLjExMzU0OS4xLjEuMTEnOlxuICAgICAgICAgICAgcmV0dXJuICdTSEEtMjU2JztcbiAgICAgICAgY2FzZSAnMS4yLjg0MC4xMTM1NDkuMS4xLjEyJzpcbiAgICAgICAgICAgIHJldHVybiAnU0hBLTM4NCc7XG4gICAgICAgIGNhc2UgJzEuMi44NDAuMTEzNTQ5LjEuMS4xMyc6XG4gICAgICAgICAgICByZXR1cm4gJ1NIQS01MTInO1xuICAgICAgICBjYXNlICcxLjIuODQwLjExMzU0OS4xLjEuMTQnOlxuICAgICAgICAgICAgcmV0dXJuICdTSEEtMjI0JztcbiAgICAgICAgY2FzZSAnMS4yLjg0MC4xMTM1NDkuMS4xLjE1JzpcbiAgICAgICAgICAgIHJldHVybiAnU0hBNTEyLTIyNCc7XG4gICAgICAgIGNhc2UgJzEuMi44NDAuMTEzNTQ5LjEuMS4xNic6XG4gICAgICAgICAgICByZXR1cm4gJ1NIQTUxMi0yNTYnO1xuICAgICAgICAvLyBFQ0RTQVxuICAgICAgICBjYXNlICcxLjIuODQwLjEwMDQ1LjQuMSc6XG4gICAgICAgICAgICByZXR1cm4gJ1NIQS0xJztcbiAgICAgICAgY2FzZSAnMS4yLjg0MC4xMDA0NS40LjMuMSc6XG4gICAgICAgICAgICByZXR1cm4gJ1NIQS0yMjQnO1xuICAgICAgICBjYXNlICcxLjIuODQwLjEwMDQ1LjQuMy4yJzpcbiAgICAgICAgICAgIHJldHVybiAnU0hBLTI1Nic7XG4gICAgICAgIGNhc2UgJzEuMi44NDAuMTAwNDUuNC4zLjMnOlxuICAgICAgICAgICAgcmV0dXJuICdTSEEtMzg0JztcbiAgICAgICAgY2FzZSAnMS4yLjg0MC4xMDA0NS40LjMuNCc6XG4gICAgICAgICAgICByZXR1cm4gJ1NIQS01MTInO1xuICAgICAgICAvLyBSU0FTU0EtUFNTOiBoYXNoIGlzIGluZGljYXRlZCBzZXBhcmF0ZWx5XG4gICAgICAgIGNhc2UgJzEuMi44NDAuMTEzNTQ5LjEuMS4xMCc6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBpbmRleEFmdGVyT0lEO1xuICAgICAgICAgICAgICAgIGluZGV4ID0gZXhwZWN0QVNOMVNlcShkYXRhLCBpbmRleCkuaW5kZXg7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbaW5kZXgrK10gIT09IDB4YTApIHRocm93IHg1MDlFcnJvcignbm9uLXRhZyBkYXRhJywgZGF0YSkgLy8gYTAgPSBjb25zdHJ1Y3RlZCB0YWcgMFxuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICBpbmRleCA9IHJlYWRBU04xTGVuZ3RoKGRhdGEsIGluZGV4KS5pbmRleDsgLy8gc2tpcCBvdmVyIHRhZyBsZW5ndGggZmllbGRcbiAgICAgICAgICAgICAgICBpbmRleCA9IGV4cGVjdEFTTjFTZXEoZGF0YSwgaW5kZXgpLmluZGV4OyAvLyBza2lwIG92ZXIgc2VxdWVuY2UgbGVuZ3RoIGZpZWxkXG4gICAgICAgICAgICAgICAgY29uc3QgeyBvaWQ6IGhhc2hPSUQgfSA9IHJlYWRBU04xT0lEKGRhdGEsIGluZGV4KTtcbiAgICAgICAgICAgICAgICBzd2l0Y2goaGFzaE9JRCl7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0YW5kYWxvbmUgaGFzaCBPSURzXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzEuMi44NDAuMTEzNTQ5LjIuNSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ01ENSc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzEuMy4xNC4zLjIuMjYnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdTSEEtMSc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzIuMTYuODQwLjEuMTAxLjMuNC4yLjEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdTSEEtMjU2JztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnMi4xNi44NDAuMS4xMDEuMy40LjIuMic6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1NIQS0zODQnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICcyLjE2Ljg0MC4xLjEwMS4zLjQuMi4zJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnU0hBLTUxMic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IHg1MDlFcnJvcigndW5rbm93biBoYXNoIE9JRCAnICsgaGFzaE9JRCwgZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIC8vIEVkMjU1MTkgLS0gc2VlIGh0dHBzOiByZXR1cm4vL2dpdGh1Yi5jb20vb3BlbnNzbC9vcGVuc3NsL2lzc3Vlcy8xNTQ3N1xuICAgICAgICBjYXNlICcxLjMuMTAxLjExMCc6XG4gICAgICAgIGNhc2UgJzEuMy4xMDEuMTEyJzpcbiAgICAgICAgICAgIHJldHVybiAnU0hBLTUxMic7XG4gICAgICAgIC8vIEVkNDQ4IC0tIHN0aWxsIG5vdCBpbiBwZyAxNy4yIChpZiBzdXBwb3J0ZWQsIGRpZ2VzdCB3b3VsZCBiZSBTSEFLRTI1NiB4IDY0IGJ5dGVzKVxuICAgICAgICBjYXNlICcxLjMuMTAxLjExMSc6XG4gICAgICAgIGNhc2UgJzEuMy4xMDEuMTEzJzpcbiAgICAgICAgICAgIHRocm93IHg1MDlFcnJvcignRWQ0NDggY2VydGlmaWNhdGUgY2hhbm5lbCBiaW5kaW5nIGlzIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkIGJ5IFBvc3RncmVzJyk7XG4gICAgfVxuICAgIHRocm93IHg1MDlFcnJvcigndW5rbm93biBPSUQgJyArIG9pZCwgZGF0YSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzaWduYXR1cmVBbGdvcml0aG1IYXNoRnJvbUNlcnRpZmljYXRlXG59O1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IGNyeXB0byA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbmNvbnN0IHsgc2lnbmF0dXJlQWxnb3JpdGhtSGFzaEZyb21DZXJ0aWZpY2F0ZSB9ID0gcmVxdWlyZSgnLi9jZXJ0LXNpZ25hdHVyZXMnKTtcbi8vIFNBU0xwcmVwIChSRkMgNDAxMykgXHUyMDE0IG1pbmltYWwgaW4tdHJlZSBpbXBsZW1lbnRhdGlvbi5cbi8vXG4vLyBQZXIgUkZDIDU4MDIgXHUwMEE3Mi4yLCB0aGUgU0NSQU0tU0hBLTI1NiBjbGllbnQgbXVzdCBub3JtYWxpemUgdGhlIHBhc3N3b3JkIHZpYVxuLy8gU0FTTHByZXAgYmVmb3JlIGZlZWRpbmcgaXQgaW50byBQQktERjIuIFBvc3RncmVTUUwncyBzZXJ2ZXIgYXBwbGllcyB0aGUgc2FtZVxuLy8gU0FTTHByZXAgd2hlbiBjb21wdXRpbmcgdGhlIHN0b3JlZCB2ZXJpZmllciwgYW5kIGxpYnBxIGRvZXMgdGhlIHNhbWUgY2xpZW50XG4vLyBzaWRlLCBzbyBwYXNzd29yZHMgd2hvc2UgTkZLQyBmb3JtIGRpZmZlcnMgZnJvbSB0aGUgcmF3IGZvcm1cbi8vIHdvdWxkIG90aGVyd2lzZSBhdXRoZW50aWNhdGUgYWdhaW5zdCBwc3FsL2xpYnBxIGJ1dCBmYWlsIGFnYWluc3QgcGcgd2l0aCBgMjhQMDFgLlxuLy9cbi8vIFdlIGRlbGliZXJhdGVseSBpbXBsZW1lbnQgb25seSB0aGUgdGhyZWUgc3RlcHMgdGhhdCBjaGFuZ2UgdGhlIGJ5dGUgY29udGVudDpcbi8vICAgMS4gUkZDIDM0NTQgVGFibGUgQy4xLjIgKG5vbi1BU0NJSSBzcGFjZSkgXHUyMTkyIFUrMDAyMCBTUEFDRS5cbi8vICAgMi4gUkZDIDM0NTQgVGFibGUgQi4xIChjb21tb25seSBtYXBwZWQgdG8gbm90aGluZykgXHUyMTkyIGVtcHR5LlxuLy8gICAzLiBORktDIG5vcm1hbGl6YXRpb24uXG4vLyBXZSBza2lwIHRoZSBwcm9oaWJpdGlvbiAoUkZDIDQwMTMgXHUwMEE3Mi4zKSBhbmQgYmlkaSAoUkZDIDM0NTQgXHUwMEE3NikgY2hlY2tzLlxuLy8gbGlicHEgaXMgZm9yZ2l2aW5nIG9uIHRob3NlIHBhdGhzIGFuZCBQb3N0Z3JlcydzIG93biBTQVNMcHJlcCBtYXRjaGVzIHRoYXRcbi8vIGxlbmllbmN5IGZvciBsZWdhY3kgcm9sZXMsIHNvIG9taXR0aW5nIHRoZSByZWplY3Rpb24gbG9naWMga2VlcHMgZXhpc3Rpbmdcbi8vIHJvbGVzIHdvcmtpbmcgd2l0aG91dCBhZGRpbmcgY29tcGxleGl0eS5cbmZ1bmN0aW9uIHNhc2xwcmVwKHBhc3N3b3JkKSB7XG4gICAgLy8gUkZDIDM0NTQgVGFibGUgQy4xLjIgXHUyMDE0IG5vbi1BU0NJSSBzcGFjZSBjaGFyYWN0ZXJzLCBtYXBwZWQgdG8gVSswMDIwLlxuICAgIGNvbnN0IG5vbkFzY2lpU3BhY2UgPSAvW1xcdTAwQTBcXHUxNjgwXFx1MjAwMC1cXHUyMDBCXFx1MjAyRlxcdTIwNUZcXHUzMDAwXS9nO1xuICAgIC8vIFJGQyAzNDU0IFRhYmxlIEIuMSBcdTIwMTQgXCJjb21tb25seSBtYXBwZWQgdG8gbm90aGluZ1wiLiBUaGUgc2V0IGludGVudGlvbmFsbHlcbiAgICAvLyBjb250YWlucyB6ZXJvLXdpZHRoIGpvaW5lcnMgYW5kIHZhcmlhdGlvbiBzZWxlY3RvcnMgXHUyMDE0IHRoZSB2ZXJ5IGNoYXJhY3RlcnNcbiAgICAvLyBFU0xpbnQncyBuby1taXNsZWFkaW5nLWNoYXJhY3Rlci1jbGFzcyB3YXJucyBhYm91dCBcdTIwMTQgYmVjYXVzZSB0aGV5IGNvbWJpbmVcbiAgICAvLyB3aXRoIHRoZWlyIG5laWdoYm9ycyBhbmQgdGhlIFJGQyBzdHJpcHMgdGhlbSBmb3IgdGhhdCByZWFzb24uXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW1pc2xlYWRpbmctY2hhcmFjdGVyLWNsYXNzXG4gICAgY29uc3QgbWFwcGVkVG9Ob3RoaW5nID0gL1tcXHUwMEFEXFx1MDM0RlxcdTE4MDZcXHUxODBCXFx1MTgwQ1xcdTE4MERcXHUyMDBDXFx1MjAwRFxcdTIwNjBcXHVGRTAwLVxcdUZFMEZcXHVGRUZGXS9nO1xuICAgIHJldHVybiBwYXNzd29yZC5yZXBsYWNlKG5vbkFzY2lpU3BhY2UsICcgJykucmVwbGFjZShtYXBwZWRUb05vdGhpbmcsICcnKS5ub3JtYWxpemUoJ05GS0MnKTtcbn1cbmNvbnN0IERFRkFVTFRfTUFYX1NDUkFNX0lURVJBVElPTlMgPSAxMDAwMDA7XG5mdW5jdGlvbiBzdGFydFNlc3Npb24obWVjaGFuaXNtcywgc3RyZWFtLCBzY3JhbU1heEl0ZXJhdGlvbnMgPSBERUZBVUxUX01BWF9TQ1JBTV9JVEVSQVRJT05TKSB7XG4gICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgJ1NDUkFNLVNIQS0yNTYnXG4gICAgXTtcbiAgICBpZiAoc3RyZWFtKSBjYW5kaWRhdGVzLnVuc2hpZnQoJ1NDUkFNLVNIQS0yNTYtUExVUycpOyAvLyBoaWdoZXItcHJpb3JpdHksIHNvIHBsYWNlZCBmaXJzdFxuICAgIGNvbnN0IG1lY2hhbmlzbSA9IGNhbmRpZGF0ZXMuZmluZCgoY2FuZGlkYXRlKT0+bWVjaGFuaXNtcy5pbmNsdWRlcyhjYW5kaWRhdGUpKTtcbiAgICBpZiAoIW1lY2hhbmlzbSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NBU0w6IE9ubHkgbWVjaGFuaXNtKHMpICcgKyBjYW5kaWRhdGVzLmpvaW4oJyBhbmQgJykgKyAnIGFyZSBzdXBwb3J0ZWQnKTtcbiAgICB9XG4gICAgaWYgKG1lY2hhbmlzbSA9PT0gJ1NDUkFNLVNIQS0yNTYtUExVUycgJiYgdHlwZW9mIHN0cmVhbS5nZXRQZWVyQ2VydGlmaWNhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gdGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIGlmIHdlIGFyZSByZWFsbHkgdGFsa2luZyB0byBhIFBvc3RncmVzIHNlcnZlclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NBU0w6IE1lY2hhbmlzbSBTQ1JBTS1TSEEtMjU2LVBMVVMgcmVxdWlyZXMgYSBjZXJ0aWZpY2F0ZScpO1xuICAgIH1cbiAgICBjb25zdCBjbGllbnROb25jZSA9IGNyeXB0by5yYW5kb21CeXRlcygxOCkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgIGNvbnN0IGdzMkhlYWRlciA9IG1lY2hhbmlzbSA9PT0gJ1NDUkFNLVNIQS0yNTYtUExVUycgPyAncD10bHMtc2VydmVyLWVuZC1wb2ludCcgOiBzdHJlYW0gPyAneScgOiAnbic7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbWVjaGFuaXNtLFxuICAgICAgICBjbGllbnROb25jZSxcbiAgICAgICAgcmVzcG9uc2U6IGdzMkhlYWRlciArICcsLG49KixyPScgKyBjbGllbnROb25jZSxcbiAgICAgICAgbWVzc2FnZTogJ1NBU0xJbml0aWFsUmVzcG9uc2UnLFxuICAgICAgICBzY3JhbU1heEl0ZXJhdGlvbnNcbiAgICB9O1xufVxuYXN5bmMgZnVuY3Rpb24gY29udGludWVTZXNzaW9uKHNlc3Npb24sIHBhc3N3b3JkLCBzZXJ2ZXJEYXRhLCBzdHJlYW0pIHtcbiAgICBpZiAoc2Vzc2lvbi5tZXNzYWdlICE9PSAnU0FTTEluaXRpYWxSZXNwb25zZScpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTQVNMOiBMYXN0IG1lc3NhZ2Ugd2FzIG5vdCBTQVNMSW5pdGlhbFJlc3BvbnNlJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcGFzc3dvcmQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0FTTDogU0NSQU0tU0VSVkVSLUZJUlNULU1FU1NBR0U6IGNsaWVudCBwYXNzd29yZCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuICAgIGlmIChwYXNzd29yZCA9PT0gJycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTQVNMOiBTQ1JBTS1TRVJWRVItRklSU1QtTUVTU0FHRTogY2xpZW50IHBhc3N3b3JkIG11c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc2VydmVyRGF0YSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTQVNMOiBTQ1JBTS1TRVJWRVItRklSU1QtTUVTU0FHRTogc2VydmVyRGF0YSBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuICAgIGNvbnN0IHN2ID0gcGFyc2VTZXJ2ZXJGaXJzdE1lc3NhZ2Uoc2VydmVyRGF0YSk7XG4gICAgaWYgKCFzdi5ub25jZS5zdGFydHNXaXRoKHNlc3Npb24uY2xpZW50Tm9uY2UpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0FTTDogU0NSQU0tU0VSVkVSLUZJUlNULU1FU1NBR0U6IHNlcnZlciBub25jZSBkb2VzIG5vdCBzdGFydCB3aXRoIGNsaWVudCBub25jZScpO1xuICAgIH0gZWxzZSBpZiAoc3Yubm9uY2UubGVuZ3RoID09PSBzZXNzaW9uLmNsaWVudE5vbmNlLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NBU0w6IFNDUkFNLVNFUlZFUi1GSVJTVC1NRVNTQUdFOiBzZXJ2ZXIgbm9uY2UgaXMgdG9vIHNob3J0Jyk7XG4gICAgfVxuICAgIGNvbnN0IHNjcmFtTWF4SXRlcmF0aW9ucyA9IHR5cGVvZiBzZXNzaW9uLnNjcmFtTWF4SXRlcmF0aW9ucyA9PT0gJ251bWJlcicgPyBzZXNzaW9uLnNjcmFtTWF4SXRlcmF0aW9ucyA6IERFRkFVTFRfTUFYX1NDUkFNX0lURVJBVElPTlM7XG4gICAgLy8gYSB2YWx1ZSBvZiAwIGRpc2FibGVzIHRoZSBpdGVyYXRpb24gY291bnQgY2hlY2tcbiAgICBpZiAoc2NyYW1NYXhJdGVyYXRpb25zICE9PSAwICYmIHN2Lml0ZXJhdGlvbiA+IHNjcmFtTWF4SXRlcmF0aW9ucykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NBU0w6IFNDUkFNLVNFUlZFUi1GSVJTVC1NRVNTQUdFOiBpdGVyYXRpb24gY291bnQgJyArIHN2Lml0ZXJhdGlvbiArICcgZXhjZWVkcyBzY3JhbU1heEl0ZXJhdGlvbnMgb2YgJyArIHNjcmFtTWF4SXRlcmF0aW9ucyk7XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudEZpcnN0TWVzc2FnZUJhcmUgPSAnbj0qLHI9JyArIHNlc3Npb24uY2xpZW50Tm9uY2U7XG4gICAgY29uc3Qgc2VydmVyRmlyc3RNZXNzYWdlID0gJ3I9JyArIHN2Lm5vbmNlICsgJyxzPScgKyBzdi5zYWx0ICsgJyxpPScgKyBzdi5pdGVyYXRpb247XG4gICAgLy8gd2l0aG91dCBjaGFubmVsIGJpbmRpbmc6XG4gICAgbGV0IGNoYW5uZWxCaW5kaW5nID0gc3RyZWFtID8gJ2VTd3MnIDogJ2Jpd3MnIC8vICd5LCwnIG9yICduLCwnLCBiYXNlNjQtZW5jb2RlZFxuICAgIDtcbiAgICAvLyBvdmVycmlkZSBpZiBjaGFubmVsIGJpbmRpbmcgaXMgaW4gdXNlOlxuICAgIGlmIChzZXNzaW9uLm1lY2hhbmlzbSA9PT0gJ1NDUkFNLVNIQS0yNTYtUExVUycpIHtcbiAgICAgICAgY29uc3QgcGVlckNlcnQgPSBzdHJlYW0uZ2V0UGVlckNlcnRpZmljYXRlKCkucmF3O1xuICAgICAgICBsZXQgaGFzaE5hbWUgPSBzaWduYXR1cmVBbGdvcml0aG1IYXNoRnJvbUNlcnRpZmljYXRlKHBlZXJDZXJ0KTtcbiAgICAgICAgaWYgKGhhc2hOYW1lID09PSAnTUQ1JyB8fCBoYXNoTmFtZSA9PT0gJ1NIQS0xJykgaGFzaE5hbWUgPSAnU0hBLTI1Nic7XG4gICAgICAgIGNvbnN0IGNlcnRIYXNoID0gYXdhaXQgY3J5cHRvLmhhc2hCeU5hbWUoaGFzaE5hbWUsIHBlZXJDZXJ0KTtcbiAgICAgICAgY29uc3QgYmluZGluZ0RhdGEgPSBCdWZmZXIuY29uY2F0KFtcbiAgICAgICAgICAgIEJ1ZmZlci5mcm9tKCdwPXRscy1zZXJ2ZXItZW5kLXBvaW50LCwnKSxcbiAgICAgICAgICAgIEJ1ZmZlci5mcm9tKGNlcnRIYXNoKVxuICAgICAgICBdKTtcbiAgICAgICAgY2hhbm5lbEJpbmRpbmcgPSBiaW5kaW5nRGF0YS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudEZpbmFsTWVzc2FnZVdpdGhvdXRQcm9vZiA9ICdjPScgKyBjaGFubmVsQmluZGluZyArICcscj0nICsgc3Yubm9uY2U7XG4gICAgY29uc3QgYXV0aE1lc3NhZ2UgPSBjbGllbnRGaXJzdE1lc3NhZ2VCYXJlICsgJywnICsgc2VydmVyRmlyc3RNZXNzYWdlICsgJywnICsgY2xpZW50RmluYWxNZXNzYWdlV2l0aG91dFByb29mO1xuICAgIGNvbnN0IHNhbHRCeXRlcyA9IEJ1ZmZlci5mcm9tKHN2LnNhbHQsICdiYXNlNjQnKTtcbiAgICBjb25zdCBzYWx0ZWRQYXNzd29yZCA9IGF3YWl0IGNyeXB0by5kZXJpdmVLZXkoc2FzbHByZXAocGFzc3dvcmQpLCBzYWx0Qnl0ZXMsIHN2Lml0ZXJhdGlvbik7XG4gICAgY29uc3QgY2xpZW50S2V5ID0gYXdhaXQgY3J5cHRvLmhtYWNTaGEyNTYoc2FsdGVkUGFzc3dvcmQsICdDbGllbnQgS2V5Jyk7XG4gICAgY29uc3Qgc3RvcmVkS2V5ID0gYXdhaXQgY3J5cHRvLnNoYTI1NihjbGllbnRLZXkpO1xuICAgIGNvbnN0IGNsaWVudFNpZ25hdHVyZSA9IGF3YWl0IGNyeXB0by5obWFjU2hhMjU2KHN0b3JlZEtleSwgYXV0aE1lc3NhZ2UpO1xuICAgIGNvbnN0IGNsaWVudFByb29mID0geG9yQnVmZmVycyhCdWZmZXIuZnJvbShjbGllbnRLZXkpLCBCdWZmZXIuZnJvbShjbGllbnRTaWduYXR1cmUpKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgY29uc3Qgc2VydmVyS2V5ID0gYXdhaXQgY3J5cHRvLmhtYWNTaGEyNTYoc2FsdGVkUGFzc3dvcmQsICdTZXJ2ZXIgS2V5Jyk7XG4gICAgY29uc3Qgc2VydmVyU2lnbmF0dXJlQnl0ZXMgPSBhd2FpdCBjcnlwdG8uaG1hY1NoYTI1NihzZXJ2ZXJLZXksIGF1dGhNZXNzYWdlKTtcbiAgICBzZXNzaW9uLm1lc3NhZ2UgPSAnU0FTTFJlc3BvbnNlJztcbiAgICBzZXNzaW9uLnNlcnZlclNpZ25hdHVyZSA9IEJ1ZmZlci5mcm9tKHNlcnZlclNpZ25hdHVyZUJ5dGVzKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgc2Vzc2lvbi5yZXNwb25zZSA9IGNsaWVudEZpbmFsTWVzc2FnZVdpdGhvdXRQcm9vZiArICcscD0nICsgY2xpZW50UHJvb2Y7XG59XG5mdW5jdGlvbiBmaW5hbGl6ZVNlc3Npb24oc2Vzc2lvbiwgc2VydmVyRGF0YSkge1xuICAgIGlmIChzZXNzaW9uLm1lc3NhZ2UgIT09ICdTQVNMUmVzcG9uc2UnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0FTTDogTGFzdCBtZXNzYWdlIHdhcyBub3QgU0FTTFJlc3BvbnNlJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc2VydmVyRGF0YSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTQVNMOiBTQ1JBTS1TRVJWRVItRklOQUwtTUVTU0FHRTogc2VydmVyRGF0YSBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuICAgIGNvbnN0IHsgc2VydmVyU2lnbmF0dXJlIH0gPSBwYXJzZVNlcnZlckZpbmFsTWVzc2FnZShzZXJ2ZXJEYXRhKTtcbiAgICBpZiAoc2VydmVyU2lnbmF0dXJlICE9PSBzZXNzaW9uLnNlcnZlclNpZ25hdHVyZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NBU0w6IFNDUkFNLVNFUlZFUi1GSU5BTC1NRVNTQUdFOiBzZXJ2ZXIgc2lnbmF0dXJlIGRvZXMgbm90IG1hdGNoJyk7XG4gICAgfVxufVxuLyoqXG4gKiBwcmludGFibGUgICAgICAgPSAleDIxLTJCIC8gJXgyRC03RVxuICogICAgICAgICAgICAgICAgICAgOzsgUHJpbnRhYmxlIEFTQ0lJIGV4Y2VwdCBcIixcIi5cbiAqICAgICAgICAgICAgICAgICAgIDs7IE5vdGUgdGhhdCBhbnkgXCJwcmludGFibGVcIiBpcyBhbHNvXG4gKiAgICAgICAgICAgICAgICAgICA7OyBhIHZhbGlkIFwidmFsdWVcIi5cbiAqLyBmdW5jdGlvbiBpc1ByaW50YWJsZUNoYXJzKHRleHQpIHtcbiAgICBpZiAodHlwZW9mIHRleHQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NBU0w6IHRleHQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIH1cbiAgICByZXR1cm4gdGV4dC5zcGxpdCgnJykubWFwKChfLCBpKT0+dGV4dC5jaGFyQ29kZUF0KGkpKS5ldmVyeSgoYyk9PmMgPj0gMHgyMSAmJiBjIDw9IDB4MmIgfHwgYyA+PSAweDJkICYmIGMgPD0gMHg3ZSk7XG59XG4vKipcbiAqIGJhc2U2NC1jaGFyICAgICA9IEFMUEhBIC8gRElHSVQgLyBcIi9cIiAvIFwiK1wiXG4gKlxuICogYmFzZTY0LTQgICAgICAgID0gNGJhc2U2NC1jaGFyXG4gKlxuICogYmFzZTY0LTMgICAgICAgID0gM2Jhc2U2NC1jaGFyIFwiPVwiXG4gKlxuICogYmFzZTY0LTIgICAgICAgID0gMmJhc2U2NC1jaGFyIFwiPT1cIlxuICpcbiAqIGJhc2U2NCAgICAgICAgICA9ICpiYXNlNjQtNCBbYmFzZTY0LTMgLyBiYXNlNjQtMl1cbiAqLyBmdW5jdGlvbiBpc0Jhc2U2NCh0ZXh0KSB7XG4gICAgcmV0dXJuIC9eKD86W2EtekEtWjAtOSsvXXs0fSkqKD86W2EtekEtWjAtOSsvXXsyfT09fFthLXpBLVowLTkrL117M309KT8kLy50ZXN0KHRleHQpO1xufVxuZnVuY3Rpb24gcGFyc2VBdHRyaWJ1dGVQYWlycyh0ZXh0KSB7XG4gICAgaWYgKHR5cGVvZiB0ZXh0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTQVNMOiBhdHRyaWJ1dGUgcGFpcnMgdGV4dCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWFwKHRleHQuc3BsaXQoJywnKS5tYXAoKGF0dHJWYWx1ZSk9PntcbiAgICAgICAgaWYgKCEvXi49Ly50ZXN0KGF0dHJWYWx1ZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU0FTTDogSW52YWxpZCBhdHRyaWJ1dGUgcGFpciBlbnRyeScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWUgPSBhdHRyVmFsdWVbMF07XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0clZhbHVlLnN1YnN0cmluZygyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB2YWx1ZVxuICAgICAgICBdO1xuICAgIH0pKTtcbn1cbmZ1bmN0aW9uIHBhcnNlU2VydmVyRmlyc3RNZXNzYWdlKGRhdGEpIHtcbiAgICBjb25zdCBhdHRyUGFpcnMgPSBwYXJzZUF0dHJpYnV0ZVBhaXJzKGRhdGEpO1xuICAgIGNvbnN0IG5vbmNlID0gYXR0clBhaXJzLmdldCgncicpO1xuICAgIGlmICghbm9uY2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTQVNMOiBTQ1JBTS1TRVJWRVItRklSU1QtTUVTU0FHRTogbm9uY2UgbWlzc2luZycpO1xuICAgIH0gZWxzZSBpZiAoIWlzUHJpbnRhYmxlQ2hhcnMobm9uY2UpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0FTTDogU0NSQU0tU0VSVkVSLUZJUlNULU1FU1NBR0U6IG5vbmNlIG11c3Qgb25seSBjb250YWluIHByaW50YWJsZSBjaGFyYWN0ZXJzJyk7XG4gICAgfVxuICAgIGNvbnN0IHNhbHQgPSBhdHRyUGFpcnMuZ2V0KCdzJyk7XG4gICAgaWYgKCFzYWx0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0FTTDogU0NSQU0tU0VSVkVSLUZJUlNULU1FU1NBR0U6IHNhbHQgbWlzc2luZycpO1xuICAgIH0gZWxzZSBpZiAoIWlzQmFzZTY0KHNhbHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0FTTDogU0NSQU0tU0VSVkVSLUZJUlNULU1FU1NBR0U6IHNhbHQgbXVzdCBiZSBiYXNlNjQnKTtcbiAgICB9XG4gICAgY29uc3QgaXRlcmF0aW9uVGV4dCA9IGF0dHJQYWlycy5nZXQoJ2knKTtcbiAgICBpZiAoIWl0ZXJhdGlvblRleHQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTQVNMOiBTQ1JBTS1TRVJWRVItRklSU1QtTUVTU0FHRTogaXRlcmF0aW9uIG1pc3NpbmcnKTtcbiAgICB9IGVsc2UgaWYgKCEvXlsxLTldWzAtOV0qJC8udGVzdChpdGVyYXRpb25UZXh0KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NBU0w6IFNDUkFNLVNFUlZFUi1GSVJTVC1NRVNTQUdFOiBpbnZhbGlkIGl0ZXJhdGlvbiBjb3VudCcpO1xuICAgIH1cbiAgICBjb25zdCBpdGVyYXRpb24gPSBwYXJzZUludChpdGVyYXRpb25UZXh0LCAxMCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbm9uY2UsXG4gICAgICAgIHNhbHQsXG4gICAgICAgIGl0ZXJhdGlvblxuICAgIH07XG59XG5mdW5jdGlvbiBwYXJzZVNlcnZlckZpbmFsTWVzc2FnZShzZXJ2ZXJEYXRhKSB7XG4gICAgY29uc3QgYXR0clBhaXJzID0gcGFyc2VBdHRyaWJ1dGVQYWlycyhzZXJ2ZXJEYXRhKTtcbiAgICBjb25zdCBlcnJvciA9IGF0dHJQYWlycy5nZXQoJ2UnKTtcbiAgICBjb25zdCBzZXJ2ZXJTaWduYXR1cmUgPSBhdHRyUGFpcnMuZ2V0KCd2Jyk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0FTTDogU0NSQU0tU0VSVkVSLUZJTkFMLU1FU1NBR0U6IHNlcnZlciByZXR1cm5lZCBlcnJvcjogXCIke2Vycm9yfVwiYCk7XG4gICAgfVxuICAgIGlmICghc2VydmVyU2lnbmF0dXJlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0FTTDogU0NSQU0tU0VSVkVSLUZJTkFMLU1FU1NBR0U6IHNlcnZlciBzaWduYXR1cmUgaXMgbWlzc2luZycpO1xuICAgIH0gZWxzZSBpZiAoIWlzQmFzZTY0KHNlcnZlclNpZ25hdHVyZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTQVNMOiBTQ1JBTS1TRVJWRVItRklOQUwtTUVTU0FHRTogc2VydmVyIHNpZ25hdHVyZSBtdXN0IGJlIGJhc2U2NCcpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzZXJ2ZXJTaWduYXR1cmVcbiAgICB9O1xufVxuZnVuY3Rpb24geG9yQnVmZmVycyhhLCBiKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpO1xuICAgIH1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyIGxlbmd0aHMgbXVzdCBtYXRjaCcpO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXJzIGNhbm5vdCBiZSBlbXB0eScpO1xuICAgIH1cbiAgICByZXR1cm4gQnVmZmVyLmZyb20oYS5tYXAoKF8sIGkpPT5hW2ldIF4gYltpXSkpO1xufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3RhcnRTZXNzaW9uLFxuICAgIGNvbnRpbnVlU2Vzc2lvbixcbiAgICBmaW5hbGl6ZVNlc3Npb24sXG4gICAgREVGQVVMVF9NQVhfU0NSQU1fSVRFUkFUSU9OU1xufTtcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCB0eXBlcyA9IHJlcXVpcmUoJ3BnLXR5cGVzJyk7XG5mdW5jdGlvbiBUeXBlT3ZlcnJpZGVzKHVzZXJUeXBlcykge1xuICAgIHRoaXMuX3R5cGVzID0gdXNlclR5cGVzIHx8IHR5cGVzO1xuICAgIHRoaXMudGV4dCA9IHt9O1xuICAgIHRoaXMuYmluYXJ5ID0ge307XG59XG5UeXBlT3ZlcnJpZGVzLnByb3RvdHlwZS5nZXRPdmVycmlkZXMgPSBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICBzd2l0Y2goZm9ybWF0KXtcbiAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50ZXh0O1xuICAgICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluYXJ5O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbn07XG5UeXBlT3ZlcnJpZGVzLnByb3RvdHlwZS5zZXRUeXBlUGFyc2VyID0gZnVuY3Rpb24ob2lkLCBmb3JtYXQsIHBhcnNlRm4pIHtcbiAgICBpZiAodHlwZW9mIGZvcm1hdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwYXJzZUZuID0gZm9ybWF0O1xuICAgICAgICBmb3JtYXQgPSAndGV4dCc7XG4gICAgfVxuICAgIHRoaXMuZ2V0T3ZlcnJpZGVzKGZvcm1hdClbb2lkXSA9IHBhcnNlRm47XG59O1xuVHlwZU92ZXJyaWRlcy5wcm90b3R5cGUuZ2V0VHlwZVBhcnNlciA9IGZ1bmN0aW9uKG9pZCwgZm9ybWF0KSB7XG4gICAgZm9ybWF0ID0gZm9ybWF0IHx8ICd0ZXh0JztcbiAgICByZXR1cm4gdGhpcy5nZXRPdmVycmlkZXMoZm9ybWF0KVtvaWRdIHx8IHRoaXMuX3R5cGVzLmdldFR5cGVQYXJzZXIob2lkLCBmb3JtYXQpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gVHlwZU92ZXJyaWRlcztcbiIsICIndXNlIHN0cmljdCc7XG4vL1BhcnNlIG1ldGhvZCBjb3BpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYnJpYW5jL25vZGUtcG9zdGdyZXNcbi8vQ29weXJpZ2h0IChjKSAyMDEwLTIwMTQgQnJpYW4gQ2FybHNvbiAoYnJpYW4ubS5jYXJsc29uQGdtYWlsLmNvbSlcbi8vTUlUIExpY2Vuc2Vcbi8vcGFyc2VzIGEgY29ubmVjdGlvbiBzdHJpbmdcbmZ1bmN0aW9uIHBhcnNlKHN0ciwgb3B0aW9ucyA9IHt9KSB7XG4gICAgLy91bml4IHNvY2tldFxuICAgIGlmIChzdHIuY2hhckF0KDApID09PSAnLycpIHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gc3RyLnNwbGl0KCcgJyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBob3N0OiBjb25maWdbMF0sXG4gICAgICAgICAgICBkYXRhYmFzZTogY29uZmlnWzFdXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIENoZWNrIGZvciBlbXB0eSBob3N0IGluIFVSTFxuICAgIGNvbnN0IGNvbmZpZyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBsZXQgZHVtbXlIb3N0ID0gZmFsc2U7XG4gICAgaWYgKC8gfCVbXmEtZjAtOV18JVthLWYwLTldW15hLWYwLTldL2kudGVzdChzdHIpKSB7XG4gICAgICAgIC8vIEVuc3VyZSBzcGFjZXMgYXJlIGVuY29kZWQgYXMgJTIwXG4gICAgICAgIHN0ciA9IGVuY29kZVVSSShzdHIpLnJlcGxhY2UoLyUyNShcXGRcXGQpL2csICclJDEnKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBVUkwoc3RyLCAncG9zdGdyZXM6Ly9iYXNlJyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIFRoZSBVUkwgaXMgaW52YWxpZCBzbyB0cnkgYWdhaW4gd2l0aCBhIGR1bW15IGhvc3RcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBVUkwoc3RyLnJlcGxhY2UoJ0AvJywgJ0BfX19EVU1NWV9fXy8nKSwgJ3Bvc3RncmVzOi8vYmFzZScpO1xuICAgICAgICAgICAgZHVtbXlIb3N0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBSZW1vdmUgdGhlIGlucHV0IGZyb20gdGhlIGVycm9yIG1lc3NhZ2UgdG8gYXZvaWQgbGVha2luZyBzZW5zaXRpdmUgaW5mb3JtYXRpb25cbiAgICAgICAgZXJyLmlucHV0ICYmIChlcnIuaW5wdXQgPSAnKioqKipSRURBQ1RFRCoqKioqJyk7XG4gICAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgLy8gV2UnZCBsaWtlIHRvIHVzZSBPYmplY3QuZnJvbUVudHJpZXMoKSBoZXJlIGJ1dCBOb2RlLmpzIDEwIGRvZXMgbm90IHN1cHBvcnQgaXRcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHJlc3VsdC5zZWFyY2hQYXJhbXMuZW50cmllcygpKXtcbiAgICAgICAgY29uZmlnW2VudHJ5WzBdXSA9IGVudHJ5WzFdO1xuICAgIH1cbiAgICBjb25maWcudXNlciA9IGNvbmZpZy51c2VyIHx8IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHQudXNlcm5hbWUpO1xuICAgIGNvbmZpZy5wYXNzd29yZCA9IGNvbmZpZy5wYXNzd29yZCB8fCBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0LnBhc3N3b3JkKTtcbiAgICBpZiAocmVzdWx0LnByb3RvY29sID09ICdzb2NrZXQ6Jykge1xuICAgICAgICBjb25maWcuaG9zdCA9IGRlY29kZVVSSShyZXN1bHQucGF0aG5hbWUpO1xuICAgICAgICBjb25maWcuZGF0YWJhc2UgPSByZXN1bHQuc2VhcmNoUGFyYW1zLmdldCgnZGInKTtcbiAgICAgICAgY29uZmlnLmNsaWVudF9lbmNvZGluZyA9IHJlc3VsdC5zZWFyY2hQYXJhbXMuZ2V0KCdlbmNvZGluZycpO1xuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgIH1cbiAgICBjb25zdCBob3N0bmFtZSA9IGR1bW15SG9zdCA/ICcnIDogcmVzdWx0Lmhvc3RuYW1lO1xuICAgIGlmICghY29uZmlnLmhvc3QpIHtcbiAgICAgICAgLy8gT25seSBzZXQgdGhlIGhvc3QgaWYgdGhlcmUgaXMgbm8gZXF1aXZhbGVudCBxdWVyeSBwYXJhbS5cbiAgICAgICAgY29uZmlnLmhvc3QgPSBkZWNvZGVVUklDb21wb25lbnQoaG9zdG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoaG9zdG5hbWUgJiYgL14lMmYvaS50ZXN0KGhvc3RuYW1lKSkge1xuICAgICAgICAvLyBPbmx5IHByZXBlbmQgdGhlIGhvc3RuYW1lIHRvIHRoZSBwYXRobmFtZSBpZiBpdCBpcyBub3QgYSBVUkwgZW5jb2RlZCBVbml4IHNvY2tldCBob3N0LlxuICAgICAgICByZXN1bHQucGF0aG5hbWUgPSBob3N0bmFtZSArIHJlc3VsdC5wYXRobmFtZTtcbiAgICB9XG4gICAgaWYgKCFjb25maWcucG9ydCkge1xuICAgICAgICAvLyBPbmx5IHNldCB0aGUgcG9ydCBpZiB0aGVyZSBpcyBubyBlcXVpdmFsZW50IHF1ZXJ5IHBhcmFtLlxuICAgICAgICBjb25maWcucG9ydCA9IHJlc3VsdC5wb3J0O1xuICAgIH1cbiAgICBjb25zdCBwYXRobmFtZSA9IHJlc3VsdC5wYXRobmFtZS5zbGljZSgxKSB8fCBudWxsO1xuICAgIGNvbmZpZy5kYXRhYmFzZSA9IHBhdGhuYW1lID8gZGVjb2RlVVJJKHBhdGhuYW1lKSA6IG51bGw7XG4gICAgaWYgKGNvbmZpZy5zc2wgPT09ICd0cnVlJyB8fCBjb25maWcuc3NsID09PSAnMScpIHtcbiAgICAgICAgY29uZmlnLnNzbCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjb25maWcuc3NsID09PSAnMCcpIHtcbiAgICAgICAgY29uZmlnLnNzbCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnNzbGNlcnQgfHwgY29uZmlnLnNzbGtleSB8fCBjb25maWcuc3Nscm9vdGNlcnQgfHwgY29uZmlnLnNzbG1vZGUpIHtcbiAgICAgICAgY29uZmlnLnNzbCA9IHt9O1xuICAgIH1cbiAgICAvLyBzc2xuZWdvdGlhdGlvbj1kaXJlY3QgaW1wbGllcyBTU0wgaXMgaW4gdXNlIChsaWJwcSByZXF1aXJlcyBzc2xtb2RlPj1yZXF1aXJlKSxcbiAgICAvLyBzbyBlbmFibGUgU1NMIGlmIHRoZSBjb25uZWN0aW9uIHN0cmluZyBkaWQgbm90IG90aGVyd2lzZSBjb25maWd1cmUgaXQuXG4gICAgaWYgKGNvbmZpZy5zc2xuZWdvdGlhdGlvbiA9PT0gJ2RpcmVjdCcgJiYgY29uZmlnLnNzbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbmZpZy5zc2wgPSB0cnVlO1xuICAgIH1cbiAgICAvLyBPbmx5IHRyeSB0byBsb2FkIGZzIGlmIHdlIGV4cGVjdCB0byByZWFkIGZyb20gdGhlIGRpc2tcbiAgICBjb25zdCBmcyA9IGNvbmZpZy5zc2xjZXJ0IHx8IGNvbmZpZy5zc2xrZXkgfHwgY29uZmlnLnNzbHJvb3RjZXJ0ID8gcmVxdWlyZSgnZnMnKSA6IG51bGw7XG4gICAgaWYgKGNvbmZpZy5zc2xjZXJ0KSB7XG4gICAgICAgIGNvbmZpZy5zc2wuY2VydCA9IGZzLnJlYWRGaWxlU3luYyhjb25maWcuc3NsY2VydCkudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5zc2xrZXkpIHtcbiAgICAgICAgY29uZmlnLnNzbC5rZXkgPSBmcy5yZWFkRmlsZVN5bmMoY29uZmlnLnNzbGtleSkudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5zc2xyb290Y2VydCkge1xuICAgICAgICBjb25maWcuc3NsLmNhID0gZnMucmVhZEZpbGVTeW5jKGNvbmZpZy5zc2xyb290Y2VydCkudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudXNlTGlicHFDb21wYXQgJiYgY29uZmlnLnVzZWxpYnBxY29tcGF0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQm90aCB1c2VMaWJwcUNvbXBhdCBhbmQgdXNlbGlicHFjb21wYXQgYXJlIHNldC4gUGxlYXNlIHVzZSBvbmx5IG9uZSBvZiB0aGVtLicpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnVzZWxpYnBxY29tcGF0ID09PSAndHJ1ZScgfHwgb3B0aW9ucy51c2VMaWJwcUNvbXBhdCkge1xuICAgICAgICBzd2l0Y2goY29uZmlnLnNzbG1vZGUpe1xuICAgICAgICAgICAgY2FzZSAnZGlzYWJsZSc6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuc3NsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ3ByZWZlcic6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuc3NsLnJlamVjdFVuYXV0aG9yaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdyZXF1aXJlJzpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcuc3Nscm9vdGNlcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGEgcm9vdCBDQSBpcyBzcGVjaWZpZWQsIGJlaGF2aW9yIG9mIGBzc2xtb2RlPXJlcXVpcmVgIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhhdCBvZiBgdmVyaWZ5LWNhYFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLnNzbC5jaGVja1NlcnZlcklkZW50aXR5ID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5zc2wucmVqZWN0VW5hdXRob3JpemVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAndmVyaWZ5LWNhJzpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29uZmlnLnNzbC5jYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTRUNVUklUWSBXQVJOSU5HOiBVc2luZyBzc2xtb2RlPXZlcmlmeS1jYSByZXF1aXJlcyBzcGVjaWZ5aW5nIGEgQ0Egd2l0aCBzc2xyb290Y2VydC4gSWYgYSBwdWJsaWMgQ0EgaXMgdXNlZCwgdmVyaWZ5LWNhIGFsbG93cyBjb25uZWN0aW9ucyB0byBhIHNlcnZlciB0aGF0IHNvbWVib2R5IGVsc2UgbWF5IGhhdmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBDQSwgbWFraW5nIHlvdSB2dWxuZXJhYmxlIHRvIE1hbi1pbi10aGUtTWlkZGxlIGF0dGFja3MuIEVpdGhlciBzcGVjaWZ5IGEgY3VzdG9tIENBIGNlcnRpZmljYXRlIHdpdGggc3Nscm9vdGNlcnQgcGFyYW1ldGVyIG9yIHVzZSBzc2xtb2RlPXZlcmlmeS1mdWxsIGZvciBwcm9wZXIgc2VjdXJpdHkuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnNzbC5jaGVja1NlcnZlcklkZW50aXR5ID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAndmVyaWZ5LWZ1bGwnOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3dpdGNoKGNvbmZpZy5zc2xtb2RlKXtcbiAgICAgICAgICAgIGNhc2UgJ2Rpc2FibGUnOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnNzbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdwcmVmZXInOlxuICAgICAgICAgICAgY2FzZSAncmVxdWlyZSc6XG4gICAgICAgICAgICBjYXNlICd2ZXJpZnktY2EnOlxuICAgICAgICAgICAgY2FzZSAndmVyaWZ5LWZ1bGwnOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5zc2xtb2RlICE9PSAndmVyaWZ5LWZ1bGwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXByZWNhdGVkU3NsTW9kZVdhcm5pbmcoY29uZmlnLnNzbG1vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ25vLXZlcmlmeSc6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuc3NsLnJlamVjdFVuYXV0aG9yaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZztcbn1cbi8vIGNvbnZlcnQgcGctY29ubmVjdGlvbi1zdHJpbmcgc3NsIGNvbmZpZyB0byBhIENsaWVudENvbmZpZy5Db25uZWN0aW9uT3B0aW9uc1xuZnVuY3Rpb24gdG9Db25uZWN0aW9uT3B0aW9ucyhzc2xDb25maWcpIHtcbiAgICBjb25zdCBjb25uZWN0aW9uT3B0aW9ucyA9IE9iamVjdC5lbnRyaWVzKHNzbENvbmZpZykucmVkdWNlKChjLCBba2V5LCB2YWx1ZV0pPT57XG4gICAgICAgIC8vIHdlIGV4cGxpY2l0bHkgY2hlY2sgZm9yIHVuZGVmaW5lZCBhbmQgbnVsbCBpbnN0ZWFkIG9mIGBpZiAodmFsdWUpYCBiZWNhdXNlIHNvbWVcbiAgICAgICAgLy8gb3B0aW9ucyBhY2NlcHQgZmFsc3kgdmFsdWVzLiBFeGFtcGxlOiBgc3NsLnJlamVjdFVuYXV0aG9yaXplZCA9IGZhbHNlYFxuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY1trZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gICAgcmV0dXJuIGNvbm5lY3Rpb25PcHRpb25zO1xufVxuLy8gY29udmVydCBwZy1jb25uZWN0aW9uLXN0cmluZyBjb25maWcgdG8gYSBDbGllbnRDb25maWdcbmZ1bmN0aW9uIHRvQ2xpZW50Q29uZmlnKGNvbmZpZykge1xuICAgIGNvbnN0IHBvb2xDb25maWcgPSBPYmplY3QuZW50cmllcyhjb25maWcpLnJlZHVjZSgoYywgW2tleSwgdmFsdWVdKT0+e1xuICAgICAgICBpZiAoa2V5ID09PSAnc3NsJykge1xuICAgICAgICAgICAgY29uc3Qgc3NsQ29uZmlnID0gdmFsdWU7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNzbENvbmZpZyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgICAgY1trZXldID0gc3NsQ29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzc2xDb25maWcgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgY1trZXldID0gdG9Db25uZWN0aW9uT3B0aW9ucyhzc2xDb25maWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdwb3J0Jykge1xuICAgICAgICAgICAgICAgIC8vIHdoZW4gcG9ydCBpcyBub3Qgc3BlY2lmaWVkLCBpdCBpcyBjb252ZXJ0ZWQgaW50byBhbiBlbXB0eSBzdHJpbmdcbiAgICAgICAgICAgICAgICAvLyB3ZSB3YW50IHRvIGF2b2lkIE5hTiBvciBlbXB0eSBzdHJpbmcgYXMgYSB2YWx1ZXMgaW4gQ2xpZW50Q29uZmlnXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2ID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgJHtrZXl9OiAke3ZhbHVlfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNba2V5XSA9IHY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICB9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAgICByZXR1cm4gcG9vbENvbmZpZztcbn1cbi8vIHBhcnNlcyBhIGNvbm5lY3Rpb24gc3RyaW5nIGludG8gQ2xpZW50Q29uZmlnXG5mdW5jdGlvbiBwYXJzZUludG9DbGllbnRDb25maWcoc3RyKSB7XG4gICAgcmV0dXJuIHRvQ2xpZW50Q29uZmlnKHBhcnNlKHN0cikpO1xufVxuZnVuY3Rpb24gZGVwcmVjYXRlZFNzbE1vZGVXYXJuaW5nKHNzbG1vZGUpIHtcbiAgICBpZiAoIWRlcHJlY2F0ZWRTc2xNb2RlV2FybmluZy53YXJuZWQgJiYgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW1pdFdhcm5pbmcpIHtcbiAgICAgICAgZGVwcmVjYXRlZFNzbE1vZGVXYXJuaW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAgIHByb2Nlc3MuZW1pdFdhcm5pbmcoYFNFQ1VSSVRZIFdBUk5JTkc6IFRoZSBTU0wgbW9kZXMgJ3ByZWZlcicsICdyZXF1aXJlJywgYW5kICd2ZXJpZnktY2EnIGFyZSB0cmVhdGVkIGFzIGFsaWFzZXMgZm9yICd2ZXJpZnktZnVsbCcuXG5JbiB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uIChwZy1jb25uZWN0aW9uLXN0cmluZyB2My4wLjAgYW5kIHBnIHY5LjAuMCksIHRoZXNlIG1vZGVzIHdpbGwgYWRvcHQgc3RhbmRhcmQgbGlicHEgc2VtYW50aWNzLCB3aGljaCBoYXZlIHdlYWtlciBzZWN1cml0eSBndWFyYW50ZWVzLlxuXG5UbyBwcmVwYXJlIGZvciB0aGlzIGNoYW5nZTpcbi0gSWYgeW91IHdhbnQgdGhlIGN1cnJlbnQgYmVoYXZpb3IsIGV4cGxpY2l0bHkgdXNlICdzc2xtb2RlPXZlcmlmeS1mdWxsJ1xuLSBJZiB5b3Ugd2FudCBsaWJwcSBjb21wYXRpYmlsaXR5IG5vdywgdXNlICd1c2VsaWJwcWNvbXBhdD10cnVlJnNzbG1vZGU9JHtzc2xtb2RlfSdcblxuU2VlIGh0dHBzOi8vd3d3LnBvc3RncmVzcWwub3JnL2RvY3MvY3VycmVudC9saWJwcS1zc2wuaHRtbCBmb3IgbGlicHEgU1NMIG1vZGUgZGVmaW5pdGlvbnMuYCk7XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcbnBhcnNlLnBhcnNlID0gcGFyc2U7XG5wYXJzZS50b0NsaWVudENvbmZpZyA9IHRvQ2xpZW50Q29uZmlnO1xucGFyc2UucGFyc2VJbnRvQ2xpZW50Q29uZmlnID0gcGFyc2VJbnRvQ2xpZW50Q29uZmlnO1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IGRucyA9IHJlcXVpcmUoJ2RucycpO1xuY29uc3QgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5jb25zdCBwYXJzZSA9IHJlcXVpcmUoJ3BnLWNvbm5lY3Rpb24tc3RyaW5nJykucGFyc2UgLy8gcGFyc2VzIGEgY29ubmVjdGlvbiBzdHJpbmdcbjtcbmNvbnN0IHZhbCA9IGZ1bmN0aW9uKGtleSwgY29uZmlnLCBlbnZWYXIpIHtcbiAgICBpZiAoY29uZmlnW2tleV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1trZXldO1xuICAgIH1cbiAgICBpZiAoZW52VmFyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZW52VmFyID0gcHJvY2Vzcy5lbnZbJ1BHJyArIGtleS50b1VwcGVyQ2FzZSgpXTtcbiAgICB9IGVsc2UgaWYgKGVudlZhciA9PT0gZmFsc2UpIHtcbiAgICAvLyBkbyBub3RoaW5nIC4uLiB1c2UgZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbnZWYXIgPSBwcm9jZXNzLmVudltlbnZWYXJdO1xuICAgIH1cbiAgICByZXR1cm4gZW52VmFyIHx8IGRlZmF1bHRzW2tleV07XG59O1xuY29uc3QgcmVhZFNTTENvbmZpZ0Zyb21FbnZpcm9ubWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaChwcm9jZXNzLmVudi5QR1NTTE1PREUpe1xuICAgICAgICBjYXNlICdkaXNhYmxlJzpcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY2FzZSAncHJlZmVyJzpcbiAgICAgICAgY2FzZSAncmVxdWlyZSc6XG4gICAgICAgIGNhc2UgJ3ZlcmlmeS1jYSc6XG4gICAgICAgIGNhc2UgJ3ZlcmlmeS1mdWxsJzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjYXNlICduby12ZXJpZnknOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZWplY3RVbmF1dGhvcml6ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdHMuc3NsO1xufTtcbi8vIENvbnZlcnQgYXJnIHRvIGEgc3RyaW5nLCBzdXJyb3VuZCBpbiBzaW5nbGUgcXVvdGVzLCBhbmQgZXNjYXBlIHNpbmdsZSBxdW90ZXMgYW5kIGJhY2tzbGFzaGVzXG5jb25zdCBxdW90ZVBhcmFtVmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBcIidcIiArICgnJyArIHZhbHVlKS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKSArIFwiJ1wiO1xufTtcbmNvbnN0IGFkZCA9IGZ1bmN0aW9uKHBhcmFtcywgY29uZmlnLCBwYXJhbU5hbWUpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGNvbmZpZ1twYXJhbU5hbWVdO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgIHBhcmFtcy5wdXNoKHBhcmFtTmFtZSArICc9JyArIHF1b3RlUGFyYW1WYWx1ZSh2YWx1ZSkpO1xuICAgIH1cbn07XG5jbGFzcyBDb25uZWN0aW9uUGFyYW1ldGVycyB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKXtcbiAgICAgICAgLy8gaWYgYSBzdHJpbmcgaXMgcGFzc2VkLCBpdCBpcyBhIHJhdyBjb25uZWN0aW9uIHN0cmluZyBzbyB3ZSBwYXJzZSBpdCBpbnRvIGEgY29uZmlnXG4gICAgICAgIGNvbmZpZyA9IHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnID8gcGFyc2UoY29uZmlnKSA6IGNvbmZpZyB8fCB7fTtcbiAgICAgICAgLy8gaWYgdGhlIGNvbmZpZyBoYXMgYSBjb25uZWN0aW9uU3RyaW5nIGRlZmluZWQsIHBhcnNlIElUIGludG8gdGhlIGNvbmZpZyB3ZSB1c2VcbiAgICAgICAgLy8gdGhpcyB3aWxsIG92ZXJyaWRlIG90aGVyIGRlZmF1bHQgdmFsdWVzIHdpdGggd2hhdCBpcyBzdG9yZWQgaW4gY29ubmVjdGlvblN0cmluZ1xuICAgICAgICBpZiAoY29uZmlnLmNvbm5lY3Rpb25TdHJpbmcpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZywgcGFyc2UoY29uZmlnLmNvbm5lY3Rpb25TdHJpbmcpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVzZXIgPSB2YWwoJ3VzZXInLCBjb25maWcpO1xuICAgICAgICB0aGlzLmRhdGFiYXNlID0gdmFsKCdkYXRhYmFzZScsIGNvbmZpZyk7XG4gICAgICAgIGlmICh0aGlzLmRhdGFiYXNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YWJhc2UgPSB0aGlzLnVzZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3J0ID0gcGFyc2VJbnQodmFsKCdwb3J0JywgY29uZmlnKSwgMTApO1xuICAgICAgICB0aGlzLmhvc3QgPSB2YWwoJ2hvc3QnLCBjb25maWcpO1xuICAgICAgICAvLyBcImhpZGluZ1wiIHRoZSBwYXNzd29yZCBzbyBpdCBkb2Vzbid0IHNob3cgdXAgaW4gc3RhY2sgdHJhY2VzXG4gICAgICAgIC8vIG9yIGlmIHRoZSBjbGllbnQgaXMgY29uc29sZS5sb2dnZWRcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdwYXNzd29yZCcsIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogdmFsKCdwYXNzd29yZCcsIGNvbmZpZylcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYmluYXJ5ID0gdmFsKCdiaW5hcnknLCBjb25maWcpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB2YWwoJ29wdGlvbnMnLCBjb25maWcpO1xuICAgICAgICB0aGlzLnNzbCA9IHR5cGVvZiBjb25maWcuc3NsID09PSAndW5kZWZpbmVkJyA/IHJlYWRTU0xDb25maWdGcm9tRW52aXJvbm1lbnQoKSA6IGNvbmZpZy5zc2w7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5zc2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zc2wgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3NsID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBzdXBwb3J0IHBhc3NpbmcgaW4gc3NsPW5vLXZlcmlmeSB2aWEgY29ubmVjdGlvbiBzdHJpbmdcbiAgICAgICAgaWYgKHRoaXMuc3NsID09PSAnbm8tdmVyaWZ5Jykge1xuICAgICAgICAgICAgdGhpcy5zc2wgPSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0VW5hdXRob3JpemVkOiBmYWxzZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zc2wgJiYgdGhpcy5zc2wua2V5KSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcy5zc2wsICdrZXknLCB7XG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIEhvdyB0byBuZWdvdGlhdGUgU1NMOiAncG9zdGdyZXMnIChkZWZhdWx0LCB0aGUgdHJhZGl0aW9uYWwgU1NMUmVxdWVzdFxuICAgICAgICAvLyBoYW5kc2hha2UpIG9yICdkaXJlY3QnIChzdGFydCB0aGUgVExTIGhhbmRzaGFrZSBpbW1lZGlhdGVseSBvbiBjb25uZWN0KS5cbiAgICAgICAgdGhpcy5zc2xuZWdvdGlhdGlvbiA9IHZhbCgnc3NsbmVnb3RpYXRpb24nLCBjb25maWcsICdQR1NTTE5FR09USUFUSU9OJyk7XG4gICAgICAgIGlmICh0aGlzLnNzbG5lZ290aWF0aW9uICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zc2xuZWdvdGlhdGlvbiAhPT0gJ3Bvc3RncmVzJyAmJiB0aGlzLnNzbG5lZ290aWF0aW9uICE9PSAnZGlyZWN0Jykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHNzbG5lZ290aWF0aW9uIHZhbHVlOiBcIiR7dGhpcy5zc2xuZWdvdGlhdGlvbn1cIi4gVmFsaWQgdmFsdWVzIGFyZSBcInBvc3RncmVzXCIgYW5kIFwiZGlyZWN0XCIuYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3NsbmVnb3RpYXRpb24gPT09ICdkaXJlY3QnICYmICF0aGlzLnNzbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzc2xuZWdvdGlhdGlvbj1kaXJlY3QgcmVxdWlyZXMgU1NMIHRvIGJlIGVuYWJsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsaWVudF9lbmNvZGluZyA9IHZhbCgnY2xpZW50X2VuY29kaW5nJywgY29uZmlnKTtcbiAgICAgICAgdGhpcy5yZXBsaWNhdGlvbiA9IHZhbCgncmVwbGljYXRpb24nLCBjb25maWcpO1xuICAgICAgICAvLyBhIGRvbWFpbiBzb2NrZXQgYmVnaW5zIHdpdGggJy8nXG4gICAgICAgIHRoaXMuaXNEb21haW5Tb2NrZXQgPSAhKHRoaXMuaG9zdCB8fCAnJykuaW5kZXhPZignLycpO1xuICAgICAgICB0aGlzLmFwcGxpY2F0aW9uX25hbWUgPSB2YWwoJ2FwcGxpY2F0aW9uX25hbWUnLCBjb25maWcsICdQR0FQUE5BTUUnKTtcbiAgICAgICAgdGhpcy5mYWxsYmFja19hcHBsaWNhdGlvbl9uYW1lID0gdmFsKCdmYWxsYmFja19hcHBsaWNhdGlvbl9uYW1lJywgY29uZmlnLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50X3RpbWVvdXQgPSB2YWwoJ3N0YXRlbWVudF90aW1lb3V0JywgY29uZmlnLCBmYWxzZSk7XG4gICAgICAgIHRoaXMubG9ja190aW1lb3V0ID0gdmFsKCdsb2NrX3RpbWVvdXQnLCBjb25maWcsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5pZGxlX2luX3RyYW5zYWN0aW9uX3Nlc3Npb25fdGltZW91dCA9IHZhbCgnaWRsZV9pbl90cmFuc2FjdGlvbl9zZXNzaW9uX3RpbWVvdXQnLCBjb25maWcsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5xdWVyeV90aW1lb3V0ID0gdmFsKCdxdWVyeV90aW1lb3V0JywgY29uZmlnLCBmYWxzZSk7XG4gICAgICAgIGlmIChjb25maWcuY29ubmVjdGlvblRpbWVvdXRNaWxsaXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0X3RpbWVvdXQgPSBwcm9jZXNzLmVudi5QR0NPTk5FQ1RfVElNRU9VVCB8fCAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0X3RpbWVvdXQgPSBNYXRoLmZsb29yKGNvbmZpZy5jb25uZWN0aW9uVGltZW91dE1pbGxpcyAvIDEwMDApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcua2VlcEFsaXZlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5rZWVwYWxpdmVzID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChjb25maWcua2VlcEFsaXZlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmtlZXBhbGl2ZXMgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnLmtlZXBBbGl2ZUluaXRpYWxEZWxheU1pbGxpcyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMua2VlcGFsaXZlc19pZGxlID0gTWF0aC5mbG9vcihjb25maWcua2VlcEFsaXZlSW5pdGlhbERlbGF5TWlsbGlzIC8gMTAwMCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0TGlicHFDb25uZWN0aW9uU3RyaW5nKGNiKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IFtdO1xuICAgICAgICBhZGQocGFyYW1zLCB0aGlzLCAndXNlcicpO1xuICAgICAgICBhZGQocGFyYW1zLCB0aGlzLCAncGFzc3dvcmQnKTtcbiAgICAgICAgYWRkKHBhcmFtcywgdGhpcywgJ3BvcnQnKTtcbiAgICAgICAgYWRkKHBhcmFtcywgdGhpcywgJ2FwcGxpY2F0aW9uX25hbWUnKTtcbiAgICAgICAgYWRkKHBhcmFtcywgdGhpcywgJ2ZhbGxiYWNrX2FwcGxpY2F0aW9uX25hbWUnKTtcbiAgICAgICAgYWRkKHBhcmFtcywgdGhpcywgJ2Nvbm5lY3RfdGltZW91dCcpO1xuICAgICAgICBhZGQocGFyYW1zLCB0aGlzLCAnb3B0aW9ucycpO1xuICAgICAgICBjb25zdCBzc2wgPSB0eXBlb2YgdGhpcy5zc2wgPT09ICdvYmplY3QnID8gdGhpcy5zc2wgOiB0aGlzLnNzbCA/IHtcbiAgICAgICAgICAgIHNzbG1vZGU6IHRoaXMuc3NsXG4gICAgICAgIH0gOiB7fTtcbiAgICAgICAgYWRkKHBhcmFtcywgc3NsLCAnc3NsbW9kZScpO1xuICAgICAgICBhZGQocGFyYW1zLCBzc2wsICdzc2xjYScpO1xuICAgICAgICBhZGQocGFyYW1zLCBzc2wsICdzc2xrZXknKTtcbiAgICAgICAgYWRkKHBhcmFtcywgc3NsLCAnc3NsY2VydCcpO1xuICAgICAgICBhZGQocGFyYW1zLCBzc2wsICdzc2xyb290Y2VydCcpO1xuICAgICAgICBhZGQocGFyYW1zLCB0aGlzLCAnc3NsbmVnb3RpYXRpb24nKTtcbiAgICAgICAgaWYgKHRoaXMuZGF0YWJhc2UpIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKCdkYm5hbWU9JyArIHF1b3RlUGFyYW1WYWx1ZSh0aGlzLmRhdGFiYXNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVwbGljYXRpb24pIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKCdyZXBsaWNhdGlvbj0nICsgcXVvdGVQYXJhbVZhbHVlKHRoaXMucmVwbGljYXRpb24pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ob3N0KSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaCgnaG9zdD0nICsgcXVvdGVQYXJhbVZhbHVlKHRoaXMuaG9zdCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzRG9tYWluU29ja2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gY2IobnVsbCwgcGFyYW1zLmpvaW4oJyAnKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2xpZW50X2VuY29kaW5nKSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaCgnY2xpZW50X2VuY29kaW5nPScgKyBxdW90ZVBhcmFtVmFsdWUodGhpcy5jbGllbnRfZW5jb2RpbmcpKTtcbiAgICAgICAgfVxuICAgICAgICBkbnMubG9va3VwKHRoaXMuaG9zdCwgZnVuY3Rpb24oZXJyLCBhZGRyZXNzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyLCBudWxsKTtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKCdob3N0YWRkcj0nICsgcXVvdGVQYXJhbVZhbHVlKGFkZHJlc3MpKTtcbiAgICAgICAgICAgIHJldHVybiBjYihudWxsLCBwYXJhbXMuam9pbignICcpKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0aW9uUGFyYW1ldGVycztcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCB0eXBlcyA9IHJlcXVpcmUoJ3BnLXR5cGVzJyk7XG5jb25zdCBtYXRjaFJlZ2V4cCA9IC9eKFtBLVphLXpdKykoPzogKFxcZCspKT8oPzogKFxcZCspKT8vO1xuLy8gcmVzdWx0IG9iamVjdCByZXR1cm5lZCBmcm9tIHF1ZXJ5XG4vLyBpbiB0aGUgJ2VuZCcgZXZlbnQgYW5kIGFsc29cbi8vIHBhc3NlZCBhcyBzZWNvbmQgYXJndW1lbnQgdG8gcHJvdmlkZWQgY2FsbGJhY2tcbmNsYXNzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Iocm93TW9kZSwgdHlwZXMpe1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBudWxsO1xuICAgICAgICB0aGlzLnJvd0NvdW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5vaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnJvd3MgPSBbXTtcbiAgICAgICAgdGhpcy5maWVsZHMgPSBbXTtcbiAgICAgICAgdGhpcy5fcGFyc2VycyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fdHlwZXMgPSB0eXBlcztcbiAgICAgICAgdGhpcy5Sb3dDdG9yID0gbnVsbDtcbiAgICAgICAgdGhpcy5yb3dBc0FycmF5ID0gcm93TW9kZSA9PT0gJ2FycmF5JztcbiAgICAgICAgaWYgKHRoaXMucm93QXNBcnJheSkge1xuICAgICAgICAgICAgdGhpcy5wYXJzZVJvdyA9IHRoaXMuX3BhcnNlUm93QXNBcnJheTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wcmVidWlsdEVtcHR5UmVzdWx0T2JqZWN0ID0gbnVsbDtcbiAgICB9XG4gICAgLy8gYWRkcyBhIGNvbW1hbmQgY29tcGxldGUgbWVzc2FnZVxuICAgIGFkZENvbW1hbmRDb21wbGV0ZShtc2cpIHtcbiAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICBpZiAobXNnLnRleHQpIHtcbiAgICAgICAgICAgIC8vIHB1cmUgamF2YXNjcmlwdFxuICAgICAgICAgICAgbWF0Y2ggPSBtYXRjaFJlZ2V4cC5leGVjKG1zZy50ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5hdGl2ZSBiaW5kaW5nc1xuICAgICAgICAgICAgbWF0Y2ggPSBtYXRjaFJlZ2V4cC5leGVjKG1zZy5jb21tYW5kKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMuY29tbWFuZCA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgaWYgKG1hdGNoWzNdKSB7XG4gICAgICAgICAgICAgICAgLy8gQ09NTUFORCBPSUQgUk9XU1xuICAgICAgICAgICAgICAgIHRoaXMub2lkID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvd0NvdW50ID0gcGFyc2VJbnQobWF0Y2hbM10sIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbMl0pIHtcbiAgICAgICAgICAgICAgICAvLyBDT01NQU5EIFJPV1NcbiAgICAgICAgICAgICAgICB0aGlzLnJvd0NvdW50ID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfcGFyc2VSb3dBc0FycmF5KHJvd0RhdGEpIHtcbiAgICAgICAgY29uc3Qgcm93ID0gbmV3IEFycmF5KHJvd0RhdGEubGVuZ3RoKTtcbiAgICAgICAgZm9yKGxldCBpID0gMCwgbGVuID0gcm93RGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgICAgICBjb25zdCByYXdWYWx1ZSA9IHJvd0RhdGFbaV07XG4gICAgICAgICAgICBpZiAocmF3VmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByb3dbaV0gPSB0aGlzLl9wYXJzZXJzW2ldKHJhd1ZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcm93W2ldID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93O1xuICAgIH1cbiAgICBwYXJzZVJvdyhyb3dEYXRhKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHtcbiAgICAgICAgICAgIC4uLnRoaXMuX3ByZWJ1aWx0RW1wdHlSZXN1bHRPYmplY3RcbiAgICAgICAgfTtcbiAgICAgICAgZm9yKGxldCBpID0gMCwgbGVuID0gcm93RGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgICAgICBjb25zdCByYXdWYWx1ZSA9IHJvd0RhdGFbaV07XG4gICAgICAgICAgICBjb25zdCBmaWVsZCA9IHRoaXMuZmllbGRzW2ldLm5hbWU7XG4gICAgICAgICAgICBpZiAocmF3VmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5maWVsZHNbaV0uZm9ybWF0ID09PSAnYmluYXJ5JyA/IEJ1ZmZlci5mcm9tKHJhd1ZhbHVlKSA6IHJhd1ZhbHVlO1xuICAgICAgICAgICAgICAgIHJvd1tmaWVsZF0gPSB0aGlzLl9wYXJzZXJzW2ldKHYpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3dbZmllbGRdID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93O1xuICAgIH1cbiAgICBhZGRSb3cocm93KSB7XG4gICAgICAgIHRoaXMucm93cy5wdXNoKHJvdyk7XG4gICAgfVxuICAgIGFkZEZpZWxkcyhmaWVsZERlc2NyaXB0aW9ucykge1xuICAgICAgICAvLyBjbGVhcnMgZmllbGQgZGVmaW5pdGlvbnNcbiAgICAgICAgLy8gbXVsdGlwbGUgcXVlcnkgc3RhdGVtZW50cyBpbiAxIGFjdGlvbiBjYW4gcmVzdWx0IGluIG11bHRpcGxlIHNldHNcbiAgICAgICAgLy8gb2Ygcm93RGVzY3JpcHRpb25zLi4uZWc6ICdzZWxlY3QgTk9XKCk7IHNlbGVjdCAxOjppbnQ7J1xuICAgICAgICAvLyB5b3UgbmVlZCB0byByZXNldCB0aGUgZmllbGRzXG4gICAgICAgIHRoaXMuZmllbGRzID0gZmllbGREZXNjcmlwdGlvbnM7XG4gICAgICAgIGlmICh0aGlzLmZpZWxkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX3BhcnNlcnMgPSBuZXcgQXJyYXkoZmllbGREZXNjcmlwdGlvbnMubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb3cgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgZmllbGREZXNjcmlwdGlvbnMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgY29uc3QgZGVzYyA9IGZpZWxkRGVzY3JpcHRpb25zW2ldO1xuICAgICAgICAgICAgcm93W2Rlc2MubmFtZV0gPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3R5cGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyc2Vyc1tpXSA9IHRoaXMuX3R5cGVzLmdldFR5cGVQYXJzZXIoZGVzYy5kYXRhVHlwZUlELCBkZXNjLmZvcm1hdCB8fCAndGV4dCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJzZXJzW2ldID0gdHlwZXMuZ2V0VHlwZVBhcnNlcihkZXNjLmRhdGFUeXBlSUQsIGRlc2MuZm9ybWF0IHx8ICd0ZXh0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcHJlYnVpbHRFbXB0eVJlc3VsdE9iamVjdCA9IHtcbiAgICAgICAgICAgIC4uLnJvd1xuICAgICAgICB9O1xuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gUmVzdWx0O1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHsgRXZlbnRFbWl0dGVyIH0gPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IFJlc3VsdCA9IHJlcXVpcmUoJy4vcmVzdWx0Jyk7XG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbmNsYXNzIFF1ZXJ5IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIHZhbHVlcywgY2FsbGJhY2spe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBjb25maWcgPSB1dGlscy5ub3JtYWxpemVRdWVyeUNvbmZpZyhjb25maWcsIHZhbHVlcywgY2FsbGJhY2spO1xuICAgICAgICB0aGlzLnRleHQgPSBjb25maWcudGV4dDtcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBjb25maWcudmFsdWVzO1xuICAgICAgICB0aGlzLnJvd3MgPSBjb25maWcucm93cztcbiAgICAgICAgdGhpcy50eXBlcyA9IGNvbmZpZy50eXBlcztcbiAgICAgICAgdGhpcy5uYW1lID0gY29uZmlnLm5hbWU7XG4gICAgICAgIHRoaXMucXVlcnlNb2RlID0gY29uZmlnLnF1ZXJ5TW9kZTtcbiAgICAgICAgdGhpcy5iaW5hcnkgPSBjb25maWcuYmluYXJ5O1xuICAgICAgICAvLyB1c2UgdW5pcXVlIHBvcnRhbCBuYW1lIGVhY2ggdGltZVxuICAgICAgICB0aGlzLnBvcnRhbCA9IGNvbmZpZy5wb3J0YWwgfHwgJyc7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjb25maWcuY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuX3Jvd01vZGUgPSBjb25maWcucm93TW9kZTtcbiAgICAgICAgaWYgKHByb2Nlc3MuZG9tYWluICYmIGNvbmZpZy5jYWxsYmFjaykge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayA9IHByb2Nlc3MuZG9tYWluLmJpbmQoY29uZmlnLmNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgUmVzdWx0KHRoaXMuX3Jvd01vZGUsIHRoaXMudHlwZXMpO1xuICAgICAgICAvLyBwb3RlbnRpYWwgZm9yIG11bHRpcGxlIHJlc3VsdHNcbiAgICAgICAgdGhpcy5fcmVzdWx0cyA9IHRoaXMuX3Jlc3VsdDtcbiAgICAgICAgdGhpcy5fY2FuY2VsZWREdWVUb0Vycm9yID0gZmFsc2U7XG4gICAgfVxuICAgIHJlcXVpcmVzUHJlcGFyYXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnF1ZXJ5TW9kZSA9PT0gJ2V4dGVuZGVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbmFtZWQgcXVlcmllcyBtdXN0IGFsd2F5cyBiZSBwcmVwYXJlZFxuICAgICAgICBpZiAodGhpcy5uYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhbHdheXMgcHJlcGFyZSBpZiB0aGVyZSBhcmUgbWF4IG51bWJlciBvZiByb3dzIGV4cGVjdGVkIHBlclxuICAgICAgICAvLyBwb3J0YWwgZXhlY3V0aW9uXG4gICAgICAgIGlmICh0aGlzLnJvd3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRvbid0IHByZXBhcmUgZW1wdHkgdGV4dCBxdWVyaWVzXG4gICAgICAgIGlmICghdGhpcy50ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcHJlcGFyZSBpZiB0aGVyZSBhcmUgdmFsdWVzXG4gICAgICAgIGlmICghdGhpcy52YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXMubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgX2NoZWNrRm9yTXVsdGlyb3coKSB7XG4gICAgICAgIC8vIGlmIHdlIGFscmVhZHkgaGF2ZSBhIHJlc3VsdCB3aXRoIGEgY29tbWFuZCBwcm9wZXJ0eVxuICAgICAgICAvLyB0aGVuIHdlJ3ZlIGFscmVhZHkgZXhlY3V0ZWQgb25lIHF1ZXJ5IGluIGEgbXVsdGktc3RhdGVtZW50IHNpbXBsZSBxdWVyeVxuICAgICAgICAvLyB0dXJuIG91ciByZXN1bHRzIGludG8gYW4gYXJyYXkgb2YgcmVzdWx0c1xuICAgICAgICBpZiAodGhpcy5fcmVzdWx0LmNvbW1hbmQpIHtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLl9yZXN1bHRzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc3VsdHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc3VsdFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgUmVzdWx0KHRoaXMuX3Jvd01vZGUsIHRoaXMuX3Jlc3VsdC5fdHlwZXMpO1xuICAgICAgICAgICAgdGhpcy5fcmVzdWx0cy5wdXNoKHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gYXNzb2NpYXRlcyByb3cgbWV0YWRhdGEgZnJvbSB0aGUgc3VwcGxpZWRcbiAgICAvLyBtZXNzYWdlIHdpdGggdGhpcyBxdWVyeSBvYmplY3RcbiAgICAvLyBtZXRhZGF0YSB1c2VkIHdoZW4gcGFyc2luZyByb3cgcmVzdWx0c1xuICAgIGhhbmRsZVJvd0Rlc2NyaXB0aW9uKG1zZykge1xuICAgICAgICB0aGlzLl9jaGVja0Zvck11bHRpcm93KCk7XG4gICAgICAgIHRoaXMuX3Jlc3VsdC5hZGRGaWVsZHMobXNnLmZpZWxkcyk7XG4gICAgICAgIHRoaXMuX2FjY3VtdWxhdGVSb3dzID0gdGhpcy5jYWxsYmFjayB8fCAhdGhpcy5saXN0ZW5lcnMoJ3JvdycpLmxlbmd0aDtcbiAgICB9XG4gICAgaGFuZGxlRGF0YVJvdyhtc2cpIHtcbiAgICAgICAgbGV0IHJvdztcbiAgICAgICAgaWYgKHRoaXMuX2NhbmNlbGVkRHVlVG9FcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByb3cgPSB0aGlzLl9yZXN1bHQucGFyc2VSb3cobXNnLmZpZWxkcyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5fY2FuY2VsZWREdWVUb0Vycm9yID0gZXJyO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1pdCgncm93Jywgcm93LCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICBpZiAodGhpcy5fYWNjdW11bGF0ZVJvd3MpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc3VsdC5hZGRSb3cocm93KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBoYW5kbGVDb21tYW5kQ29tcGxldGUobXNnLCBjb25uZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX2NoZWNrRm9yTXVsdGlyb3coKTtcbiAgICAgICAgdGhpcy5fcmVzdWx0LmFkZENvbW1hbmRDb21wbGV0ZShtc2cpO1xuICAgICAgICAvLyBuZWVkIHRvIHN5bmMgYWZ0ZXIgZWFjaCBjb21tYW5kIGNvbXBsZXRlIG9mIGEgcHJlcGFyZWQgc3RhdGVtZW50XG4gICAgICAgIC8vIGlmIHdlIHdlcmUgdXNpbmcgYSByb3cgY291bnQgd2hpY2ggcmVzdWx0cyBpbiBtdWx0aXBsZSBjYWxscyB0byBfZ2V0Um93c1xuICAgICAgICBpZiAodGhpcy5yb3dzKSB7XG4gICAgICAgICAgICBjb25uZWN0aW9uLnN5bmMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBpZiBhIG5hbWVkIHByZXBhcmVkIHN0YXRlbWVudCBpcyBjcmVhdGVkIHdpdGggZW1wdHkgcXVlcnkgdGV4dFxuICAgIC8vIHRoZSBiYWNrZW5kIHdpbGwgc2VuZCBhbiBlbXB0eVF1ZXJ5IG1lc3NhZ2UgYnV0ICpub3QqIGEgY29tbWFuZCBjb21wbGV0ZSBtZXNzYWdlXG4gICAgLy8gc2luY2Ugd2UgcGlwZWxpbmUgc3luYyBpbW1lZGlhdGVseSBhZnRlciBleGVjdXRlIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgaGVyZVxuICAgIC8vIHVubGVzcyB3ZSBoYXZlIHJvd3Mgc3BlY2lmaWVkLCBpbiB3aGljaCBjYXNlIHdlIGRpZCBub3QgcGlwZWxpbmUgdGhlIGluaXRpYWwgc3luYyBjYWxsXG4gICAgaGFuZGxlRW1wdHlRdWVyeShjb25uZWN0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLnJvd3MpIHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uc3luYygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGhhbmRsZUVycm9yKGVyciwgY29ubmVjdGlvbikge1xuICAgICAgICAvLyBuZWVkIHRvIHN5bmMgYWZ0ZXIgZXJyb3IgZHVyaW5nIGEgcHJlcGFyZWQgc3RhdGVtZW50XG4gICAgICAgIGlmICh0aGlzLl9jYW5jZWxlZER1ZVRvRXJyb3IpIHtcbiAgICAgICAgICAgIGVyciA9IHRoaXMuX2NhbmNlbGVkRHVlVG9FcnJvcjtcbiAgICAgICAgICAgIHRoaXMuX2NhbmNlbGVkRHVlVG9FcnJvciA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIGNhbGxiYWNrIHN1cHBsaWVkIGRvIG5vdCBlbWl0IGVycm9yIGV2ZW50IGFzIHVuY2F1Z2h0IGVycm9yXG4gICAgICAgIC8vIGV2ZW50cyB3aWxsIGJ1YmJsZSB1cCB0byBub2RlIHByb2Nlc3NcbiAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgfVxuICAgIGhhbmRsZVJlYWR5Rm9yUXVlcnkoY29uKSB7XG4gICAgICAgIGlmICh0aGlzLl9jYW5jZWxlZER1ZVRvRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUVycm9yKHRoaXMuX2NhbmNlbGVkRHVlVG9FcnJvciwgY29uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrKG51bGwsIHRoaXMuX3Jlc3VsdHMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljaygoKT0+e1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbWl0KCdlbmQnLCB0aGlzLl9yZXN1bHRzKTtcbiAgICB9XG4gICAgc3VibWl0KGNvbm5lY3Rpb24pIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnRleHQgIT09ICdzdHJpbmcnICYmIHR5cGVvZiB0aGlzLm5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKCdBIHF1ZXJ5IG11c3QgaGF2ZSBlaXRoZXIgdGV4dCBvciBhIG5hbWUuIFN1cHBseWluZyBuZWl0aGVyIGlzIHVuc3VwcG9ydGVkLicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gY29ubmVjdGlvbi5wYXJzZWRTdGF0ZW1lbnRzW3RoaXMubmFtZV07XG4gICAgICAgIGlmICh0aGlzLnRleHQgJiYgcHJldmlvdXMgJiYgdGhpcy50ZXh0ICE9PSBwcmV2aW91cykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihgUHJlcGFyZWQgc3RhdGVtZW50cyBtdXN0IGJlIHVuaXF1ZSAtICcke3RoaXMubmFtZX0nIHdhcyB1c2VkIGZvciBhIGRpZmZlcmVudCBzdGF0ZW1lbnRgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52YWx1ZXMgJiYgIUFycmF5LmlzQXJyYXkodGhpcy52YWx1ZXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKCdRdWVyeSB2YWx1ZXMgbXVzdCBiZSBhbiBhcnJheScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJlcXVpcmVzUHJlcGFyYXRpb24oKSkge1xuICAgICAgICAgICAgLy8gSWYgd2UncmUgdXNpbmcgdGhlIGV4dGVuZGVkIHF1ZXJ5IHByb3RvY29sIHdlIGZpcmUgb2ZmIHNldmVyYWwgc2VwYXJhdGUgY29tbWFuZHNcbiAgICAgICAgICAgIC8vIHRvIHRoZSBiYWNrZW5kLiBPbiBzb21lIHZlcnNpb25zIG9mIG5vZGUgJiBzb21lIG9wZXJhdGluZyBzeXN0ZW0gdmVyc2lvbnNcbiAgICAgICAgICAgIC8vIHRoZSBuZXR3b3JrIHN0YWNrIHdyaXRlcyBlYWNoIG1lc3NhZ2Ugc2VwYXJhdGVseSBpbnN0ZWFkIG9mIGJ1ZmZlcmluZyB0aGVtIHRvZ2V0aGVyXG4gICAgICAgICAgICAvLyBjYXVzaW5nIHRoZSBjbGllbnQgJiBuZXR3b3JrIHRvIHNlbmQgbW9yZSBzbG93bHkuIENvcmtpbmcgJiB1bmNvcmtpbmcgdGhlIHN0cmVhbVxuICAgICAgICAgICAgLy8gYWxsb3dzIG5vZGUgdG8gYnVmZmVyIHVwIHRoZSBtZXNzYWdlcyBpbnRlcm5hbGx5IGJlZm9yZSBzZW5kaW5nIHRoZW0gYWxsIG9mZiBhdCBvbmNlLlxuICAgICAgICAgICAgLy8gbm90ZTogd2UncmUgY2hlY2tpbmcgZm9yIGV4aXN0ZW5jZSBvZiBjb3JrL3VuY29yayBiZWNhdXNlIHNvbWUgdmVyc2lvbnMgb2Ygc3RyZWFtc1xuICAgICAgICAgICAgLy8gbWlnaHQgbm90IGhhdmUgdGhpcyAoY2xvdWRmbGFyZT8pXG4gICAgICAgICAgICBjb25uZWN0aW9uLnN0cmVhbS5jb3JrICYmIGNvbm5lY3Rpb24uc3RyZWFtLmNvcmsoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlKGNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgfSBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIC8vIHdoaWxlIHVubGlrZWx5IGZvciB0aGlzLnByZXBhcmUgdG8gdGhyb3csIGlmIGl0IGRvZXMgJiB3ZSBkb24ndCB1bmNvcmsgdGhpcyBzdHJlYW1cbiAgICAgICAgICAgICAgICAvLyB0aGlzIGNsaWVudCBiZWNvbWVzIHVucmVzcG9uc2l2ZSwgc28gcHV0IGluIGZpbmFsbHkgYmxvY2sgXCJqdXN0IGluIGNhc2VcIlxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24uc3RyZWFtLnVuY29yayAmJiBjb25uZWN0aW9uLnN0cmVhbS51bmNvcmsoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24ucXVlcnkodGhpcy50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaGFzQmVlblBhcnNlZChjb25uZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUgJiYgY29ubmVjdGlvbi5wYXJzZWRTdGF0ZW1lbnRzW3RoaXMubmFtZV07XG4gICAgfVxuICAgIGhhbmRsZVBvcnRhbFN1c3BlbmRlZChjb25uZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX2dldFJvd3MoY29ubmVjdGlvbiwgdGhpcy5yb3dzKTtcbiAgICB9XG4gICAgX2dldFJvd3MoY29ubmVjdGlvbiwgcm93cykge1xuICAgICAgICBjb25uZWN0aW9uLmV4ZWN1dGUoe1xuICAgICAgICAgICAgcG9ydGFsOiB0aGlzLnBvcnRhbCxcbiAgICAgICAgICAgIHJvd3M6IHJvd3NcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGlmIHdlJ3JlIG5vdCByZWFkaW5nIHBhZ2VzIG9mIHJvd3Mgc2VuZCB0aGUgc3luYyBjb21tYW5kXG4gICAgICAgIC8vIHRvIGluZGljYXRlIHRoZSBwaXBlbGluZSBpcyBmaW5pc2hlZFxuICAgICAgICBpZiAoIXJvd3MpIHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uc3luYygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGZsdXNoIHRoZSBjYWxsIG91dCB0byByZWFkIG1vcmUgcm93c1xuICAgICAgICAgICAgY29ubmVjdGlvbi5mbHVzaCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGh0dHA6Ly9kZXZlbG9wZXIucG9zdGdyZXNxbC5vcmcvcGdkb2NzL3Bvc3RncmVzL3Byb3RvY29sLWZsb3cuaHRtbCNQUk9UT0NPTC1GTE9XLUVYVC1RVUVSWVxuICAgIHByZXBhcmUoY29ubmVjdGlvbikge1xuICAgICAgICAvLyBUT0RPIHJlZmFjdG9yIHRoaXMgcG9vciBlbmNhcHN1bGF0aW9uXG4gICAgICAgIGlmICghdGhpcy5oYXNCZWVuUGFyc2VkKGNvbm5lY3Rpb24pKSB7XG4gICAgICAgICAgICBjb25uZWN0aW9uLnBhcnNlKHtcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLnRleHQsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgICAgICAgIHR5cGVzOiB0aGlzLnR5cGVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBiZWNhdXNlIHdlJ3JlIG1hcHBpbmcgdXNlciBzdXBwbGllZCB2YWx1ZXMgdG9cbiAgICAgICAgLy8gcG9zdGdyZXMgd2lyZSBwcm90b2NvbCBjb21wYXRpYmxlIHZhbHVlcyBpdCBjb3VsZFxuICAgICAgICAvLyB0aHJvdyBhbiBleGNlcHRpb24sIHNvIHRyeS9jYXRjaCB0aGlzIHNlY3Rpb25cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uYmluZCh7XG4gICAgICAgICAgICAgICAgcG9ydGFsOiB0aGlzLnBvcnRhbCxcbiAgICAgICAgICAgICAgICBzdGF0ZW1lbnQ6IHRoaXMubmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMudmFsdWVzLFxuICAgICAgICAgICAgICAgIGJpbmFyeTogdGhpcy5iaW5hcnksXG4gICAgICAgICAgICAgICAgdmFsdWVNYXBwZXI6IHV0aWxzLnByZXBhcmVWYWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gd2Ugc2hvdWxkIGNsb3NlIHBhcnNlIHRvIGF2b2lkIGxlYWtpbmcgY29ubmVjdGlvbnNcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uY2xvc2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdTJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29ubmVjdGlvbi5zeW5jKCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUVycm9yKGVyciwgY29ubmVjdGlvbik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29ubmVjdGlvbi5kZXNjcmliZSh7XG4gICAgICAgICAgICB0eXBlOiAnUCcsXG4gICAgICAgICAgICBuYW1lOiB0aGlzLnBvcnRhbCB8fCAnJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fZ2V0Um93cyhjb25uZWN0aW9uLCB0aGlzLnJvd3MpO1xuICAgIH1cbiAgICBoYW5kbGVDb3B5SW5SZXNwb25zZShjb25uZWN0aW9uKSB7XG4gICAgICAgIGNvbm5lY3Rpb24uc2VuZENvcHlGYWlsKCdObyBzb3VyY2Ugc3RyZWFtIGRlZmluZWQnKTtcbiAgICB9XG4gICAgaGFuZGxlQ29weURhdGEobXNnLCBjb25uZWN0aW9uKSB7XG4gICAgLy8gbm9vcFxuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gUXVlcnk7XG4iLCAiZXhwb3J0IHR5cGUgTW9kZSA9ICd0ZXh0JyB8ICdiaW5hcnknXG5cbmV4cG9ydCB0eXBlIE1lc3NhZ2VOYW1lID1cbiAgfCAncGFyc2VDb21wbGV0ZSdcbiAgfCAnYmluZENvbXBsZXRlJ1xuICB8ICdjbG9zZUNvbXBsZXRlJ1xuICB8ICdub0RhdGEnXG4gIHwgJ3BvcnRhbFN1c3BlbmRlZCdcbiAgfCAncmVwbGljYXRpb25TdGFydCdcbiAgfCAnZW1wdHlRdWVyeSdcbiAgfCAnY29weURvbmUnXG4gIHwgJ2NvcHlEYXRhJ1xuICB8ICdyb3dEZXNjcmlwdGlvbidcbiAgfCAncGFyYW1ldGVyRGVzY3JpcHRpb24nXG4gIHwgJ3BhcmFtZXRlclN0YXR1cydcbiAgfCAnYmFja2VuZEtleURhdGEnXG4gIHwgJ25vdGlmaWNhdGlvbidcbiAgfCAncmVhZHlGb3JRdWVyeSdcbiAgfCAnY29tbWFuZENvbXBsZXRlJ1xuICB8ICdkYXRhUm93J1xuICB8ICdjb3B5SW5SZXNwb25zZSdcbiAgfCAnY29weU91dFJlc3BvbnNlJ1xuICB8ICdhdXRoZW50aWNhdGlvbk9rJ1xuICB8ICdhdXRoZW50aWNhdGlvbk1ENVBhc3N3b3JkJ1xuICB8ICdhdXRoZW50aWNhdGlvbkNsZWFydGV4dFBhc3N3b3JkJ1xuICB8ICdhdXRoZW50aWNhdGlvblNBU0wnXG4gIHwgJ2F1dGhlbnRpY2F0aW9uU0FTTENvbnRpbnVlJ1xuICB8ICdhdXRoZW50aWNhdGlvblNBU0xGaW5hbCdcbiAgfCAnZXJyb3InXG4gIHwgJ25vdGljZSdcblxuZXhwb3J0IGludGVyZmFjZSBCYWNrZW5kTWVzc2FnZSB7XG4gIG5hbWU6IE1lc3NhZ2VOYW1lXG4gIGxlbmd0aDogbnVtYmVyXG59XG5cbmV4cG9ydCBjb25zdCBwYXJzZUNvbXBsZXRlOiBCYWNrZW5kTWVzc2FnZSA9IHtcbiAgbmFtZTogJ3BhcnNlQ29tcGxldGUnLFxuICBsZW5ndGg6IDUsXG59XG5cbmV4cG9ydCBjb25zdCBiaW5kQ29tcGxldGU6IEJhY2tlbmRNZXNzYWdlID0ge1xuICBuYW1lOiAnYmluZENvbXBsZXRlJyxcbiAgbGVuZ3RoOiA1LFxufVxuXG5leHBvcnQgY29uc3QgY2xvc2VDb21wbGV0ZTogQmFja2VuZE1lc3NhZ2UgPSB7XG4gIG5hbWU6ICdjbG9zZUNvbXBsZXRlJyxcbiAgbGVuZ3RoOiA1LFxufVxuXG5leHBvcnQgY29uc3Qgbm9EYXRhOiBCYWNrZW5kTWVzc2FnZSA9IHtcbiAgbmFtZTogJ25vRGF0YScsXG4gIGxlbmd0aDogNSxcbn1cblxuZXhwb3J0IGNvbnN0IHBvcnRhbFN1c3BlbmRlZDogQmFja2VuZE1lc3NhZ2UgPSB7XG4gIG5hbWU6ICdwb3J0YWxTdXNwZW5kZWQnLFxuICBsZW5ndGg6IDUsXG59XG5cbmV4cG9ydCBjb25zdCByZXBsaWNhdGlvblN0YXJ0OiBCYWNrZW5kTWVzc2FnZSA9IHtcbiAgbmFtZTogJ3JlcGxpY2F0aW9uU3RhcnQnLFxuICBsZW5ndGg6IDQsXG59XG5cbmV4cG9ydCBjb25zdCBlbXB0eVF1ZXJ5OiBCYWNrZW5kTWVzc2FnZSA9IHtcbiAgbmFtZTogJ2VtcHR5UXVlcnknLFxuICBsZW5ndGg6IDQsXG59XG5cbmV4cG9ydCBjb25zdCBjb3B5RG9uZTogQmFja2VuZE1lc3NhZ2UgPSB7XG4gIG5hbWU6ICdjb3B5RG9uZScsXG4gIGxlbmd0aDogNCxcbn1cblxuaW50ZXJmYWNlIE5vdGljZU9yRXJyb3Ige1xuICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgc2V2ZXJpdHk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBjb2RlOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgZGV0YWlsOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgaGludDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHBvc2l0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgaW50ZXJuYWxQb3NpdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIGludGVybmFsUXVlcnk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICB3aGVyZTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHNjaGVtYTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHRhYmxlOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgY29sdW1uOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgZGF0YVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBjb25zdHJhaW50OiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgZmlsZTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIGxpbmU6IHN0cmluZyB8IHVuZGVmaW5lZFxuICByb3V0aW5lOiBzdHJpbmcgfCB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGNsYXNzIERhdGFiYXNlRXJyb3IgZXh0ZW5kcyBFcnJvciBpbXBsZW1lbnRzIE5vdGljZU9yRXJyb3Ige1xuICBwdWJsaWMgc2V2ZXJpdHk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBwdWJsaWMgY29kZTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyBkZXRhaWw6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBwdWJsaWMgaGludDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyBwb3NpdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyBpbnRlcm5hbFBvc2l0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIGludGVybmFsUXVlcnk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBwdWJsaWMgd2hlcmU6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBwdWJsaWMgc2NoZW1hOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIHRhYmxlOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIGNvbHVtbjogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyBkYXRhVHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyBjb25zdHJhaW50OiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIGZpbGU6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBwdWJsaWMgbGluZTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyByb3V0aW5lOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBsZW5ndGg6IG51bWJlcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogTWVzc2FnZU5hbWVcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSlcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29weURhdGFNZXNzYWdlIHtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnY29weURhdGEnXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBsZW5ndGg6IG51bWJlcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgY2h1bms6IEJ1ZmZlclxuICApIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBDb3B5UmVzcG9uc2Uge1xuICBwdWJsaWMgcmVhZG9ubHkgY29sdW1uVHlwZXM6IG51bWJlcltdXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBsZW5ndGg6IG51bWJlcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogTWVzc2FnZU5hbWUsXG4gICAgcHVibGljIHJlYWRvbmx5IGJpbmFyeTogYm9vbGVhbixcbiAgICBjb2x1bW5Db3VudDogbnVtYmVyXG4gICkge1xuICAgIHRoaXMuY29sdW1uVHlwZXMgPSBuZXcgQXJyYXkoY29sdW1uQ291bnQpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZpZWxkIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgdGFibGVJRDogbnVtYmVyLFxuICAgIHB1YmxpYyByZWFkb25seSBjb2x1bW5JRDogbnVtYmVyLFxuICAgIHB1YmxpYyByZWFkb25seSBkYXRhVHlwZUlEOiBudW1iZXIsXG4gICAgcHVibGljIHJlYWRvbmx5IGRhdGFUeXBlU2l6ZTogbnVtYmVyLFxuICAgIHB1YmxpYyByZWFkb25seSBkYXRhVHlwZU1vZGlmaWVyOiBudW1iZXIsXG4gICAgcHVibGljIHJlYWRvbmx5IGZvcm1hdDogTW9kZVxuICApIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBSb3dEZXNjcmlwdGlvbk1lc3NhZ2Uge1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogTWVzc2FnZU5hbWUgPSAncm93RGVzY3JpcHRpb24nXG4gIHB1YmxpYyByZWFkb25seSBmaWVsZHM6IEZpZWxkW11cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyLFxuICAgIHB1YmxpYyByZWFkb25seSBmaWVsZENvdW50OiBudW1iZXJcbiAgKSB7XG4gICAgdGhpcy5maWVsZHMgPSBuZXcgQXJyYXkodGhpcy5maWVsZENvdW50KVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJhbWV0ZXJEZXNjcmlwdGlvbk1lc3NhZ2Uge1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogTWVzc2FnZU5hbWUgPSAncGFyYW1ldGVyRGVzY3JpcHRpb24nXG4gIHB1YmxpYyByZWFkb25seSBkYXRhVHlwZUlEczogbnVtYmVyW11cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyLFxuICAgIHB1YmxpYyByZWFkb25seSBwYXJhbWV0ZXJDb3VudDogbnVtYmVyXG4gICkge1xuICAgIHRoaXMuZGF0YVR5cGVJRHMgPSBuZXcgQXJyYXkodGhpcy5wYXJhbWV0ZXJDb3VudClcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGFyYW1ldGVyU3RhdHVzTWVzc2FnZSB7XG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBNZXNzYWdlTmFtZSA9ICdwYXJhbWV0ZXJTdGF0dXMnXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBsZW5ndGg6IG51bWJlcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgcGFyYW1ldGVyTmFtZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBwYXJhbWV0ZXJWYWx1ZTogc3RyaW5nXG4gICkge31cbn1cblxuZXhwb3J0IGNsYXNzIEF1dGhlbnRpY2F0aW9uTUQ1UGFzc3dvcmQgaW1wbGVtZW50cyBCYWNrZW5kTWVzc2FnZSB7XG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBNZXNzYWdlTmFtZSA9ICdhdXRoZW50aWNhdGlvbk1ENVBhc3N3b3JkJ1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgbGVuZ3RoOiBudW1iZXIsXG4gICAgcHVibGljIHJlYWRvbmx5IHNhbHQ6IEJ1ZmZlclxuICApIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBCYWNrZW5kS2V5RGF0YU1lc3NhZ2Uge1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogTWVzc2FnZU5hbWUgPSAnYmFja2VuZEtleURhdGEnXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBsZW5ndGg6IG51bWJlcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvY2Vzc0lEOiBudW1iZXIsXG4gICAgcHVibGljIHJlYWRvbmx5IHNlY3JldEtleTogbnVtYmVyXG4gICkge31cbn1cblxuZXhwb3J0IGNsYXNzIE5vdGlmaWNhdGlvblJlc3BvbnNlTWVzc2FnZSB7XG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBNZXNzYWdlTmFtZSA9ICdub3RpZmljYXRpb24nXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBsZW5ndGg6IG51bWJlcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvY2Vzc0lkOiBudW1iZXIsXG4gICAgcHVibGljIHJlYWRvbmx5IGNoYW5uZWw6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcGF5bG9hZDogc3RyaW5nXG4gICkge31cbn1cblxuZXhwb3J0IGNsYXNzIFJlYWR5Rm9yUXVlcnlNZXNzYWdlIHtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IE1lc3NhZ2VOYW1lID0gJ3JlYWR5Rm9yUXVlcnknXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBsZW5ndGg6IG51bWJlcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgc3RhdHVzOiBzdHJpbmdcbiAgKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgQ29tbWFuZENvbXBsZXRlTWVzc2FnZSB7XG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBNZXNzYWdlTmFtZSA9ICdjb21tYW5kQ29tcGxldGUnXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBsZW5ndGg6IG51bWJlcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgdGV4dDogc3RyaW5nXG4gICkge31cbn1cblxuZXhwb3J0IGNsYXNzIERhdGFSb3dNZXNzYWdlIHtcbiAgcHVibGljIHJlYWRvbmx5IGZpZWxkQ291bnQ6IG51bWJlclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogTWVzc2FnZU5hbWUgPSAnZGF0YVJvdydcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGxlbmd0aDogbnVtYmVyLFxuICAgIHB1YmxpYyBmaWVsZHM6IGFueVtdXG4gICkge1xuICAgIHRoaXMuZmllbGRDb3VudCA9IGZpZWxkcy5sZW5ndGhcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTm90aWNlTWVzc2FnZSBpbXBsZW1lbnRzIEJhY2tlbmRNZXNzYWdlLCBOb3RpY2VPckVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyLFxuICAgIHB1YmxpYyByZWFkb25seSBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgKSB7fVxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdub3RpY2UnXG4gIHB1YmxpYyBzZXZlcml0eTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyBjb2RlOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIGRldGFpbDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyBoaW50OiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIHBvc2l0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIGludGVybmFsUG9zaXRpb246IHN0cmluZyB8IHVuZGVmaW5lZFxuICBwdWJsaWMgaW50ZXJuYWxRdWVyeTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyB3aGVyZTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyBzY2hlbWE6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBwdWJsaWMgdGFibGU6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBwdWJsaWMgY29sdW1uOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIGRhdGFUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIGNvbnN0cmFpbnQ6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBwdWJsaWMgZmlsZTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHB1YmxpYyBsaW5lOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgcHVibGljIHJvdXRpbmU6IHN0cmluZyB8IHVuZGVmaW5lZFxufVxuIiwgIi8vYmluYXJ5IGRhdGEgd3JpdGVyIHR1bmVkIGZvciBlbmNvZGluZyBiaW5hcnkgc3BlY2lmaWMgdG8gdGhlIHBvc3RncmVzIGJpbmFyeSBwcm90b2NvbFxuXG5leHBvcnQgY2xhc3MgV3JpdGVyIHtcbiAgcHJpdmF0ZSBidWZmZXI6IEJ1ZmZlclxuICBwcml2YXRlIG9mZnNldDogbnVtYmVyID0gNVxuICBwcml2YXRlIGhlYWRlclBvc2l0aW9uOiBudW1iZXIgPSAwXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc2l6ZSA9IDI1Nikge1xuICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKHNpemUpXG4gIH1cblxuICBwcml2YXRlIGVuc3VyZShzaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCByZW1haW5pbmcgPSB0aGlzLmJ1ZmZlci5sZW5ndGggLSB0aGlzLm9mZnNldFxuICAgIGlmIChyZW1haW5pbmcgPCBzaXplKSB7XG4gICAgICBjb25zdCBvbGRCdWZmZXIgPSB0aGlzLmJ1ZmZlclxuICAgICAgLy8gZXhwb25lbnRpYWwgZ3Jvd3RoIGZhY3RvciBvZiBhcm91bmQgfiAxLjVcbiAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIyNjkwNjMvYnVmZmVyLWdyb3d0aC1zdHJhdGVneVxuICAgICAgY29uc3QgbmV3U2l6ZSA9IG9sZEJ1ZmZlci5sZW5ndGggKyAob2xkQnVmZmVyLmxlbmd0aCA+PiAxKSArIHNpemVcbiAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKG5ld1NpemUpXG4gICAgICBvbGRCdWZmZXIuY29weSh0aGlzLmJ1ZmZlcilcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYWRkSW50MzIobnVtOiBudW1iZXIpOiBXcml0ZXIge1xuICAgIHRoaXMuZW5zdXJlKDQpXG4gICAgdGhpcy5idWZmZXJbdGhpcy5vZmZzZXQrK10gPSAobnVtID4+PiAyNCkgJiAweGZmXG4gICAgdGhpcy5idWZmZXJbdGhpcy5vZmZzZXQrK10gPSAobnVtID4+PiAxNikgJiAweGZmXG4gICAgdGhpcy5idWZmZXJbdGhpcy5vZmZzZXQrK10gPSAobnVtID4+PiA4KSAmIDB4ZmZcbiAgICB0aGlzLmJ1ZmZlclt0aGlzLm9mZnNldCsrXSA9IChudW0gPj4+IDApICYgMHhmZlxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgYWRkSW50MTYobnVtOiBudW1iZXIpOiBXcml0ZXIge1xuICAgIHRoaXMuZW5zdXJlKDIpXG4gICAgdGhpcy5idWZmZXJbdGhpcy5vZmZzZXQrK10gPSAobnVtID4+PiA4KSAmIDB4ZmZcbiAgICB0aGlzLmJ1ZmZlclt0aGlzLm9mZnNldCsrXSA9IChudW0gPj4+IDApICYgMHhmZlxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgYWRkQ1N0cmluZyhzdHJpbmc6IHN0cmluZyk6IFdyaXRlciB7XG4gICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHRoaXMuZW5zdXJlKDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxlbiA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN0cmluZylcbiAgICAgIHRoaXMuZW5zdXJlKGxlbiArIDEpIC8vICsxIGZvciBudWxsIHRlcm1pbmF0b3JcbiAgICAgIHRoaXMuYnVmZmVyLndyaXRlKHN0cmluZywgdGhpcy5vZmZzZXQsICd1dGYtOCcpXG4gICAgICB0aGlzLm9mZnNldCArPSBsZW5cbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlclt0aGlzLm9mZnNldCsrXSA9IDAgLy8gbnVsbCB0ZXJtaW5hdG9yXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHB1YmxpYyBhZGRTdHJpbmcoc3RyaW5nOiBzdHJpbmcgPSAnJyk6IFdyaXRlciB7XG4gICAgY29uc3QgbGVuID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3RyaW5nKVxuICAgIHRoaXMuZW5zdXJlKGxlbilcbiAgICB0aGlzLmJ1ZmZlci53cml0ZShzdHJpbmcsIHRoaXMub2Zmc2V0KVxuICAgIHRoaXMub2Zmc2V0ICs9IGxlblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBXcml0ZSBhbiBJbnQzMiBieXRlLWxlbmd0aCBwcmVmaXggaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgdGhlIHN0cmluZydzIFVURi04XG4gIC8vIGJ5dGVzLiBQb3N0Z3JlcycgQmluZCB3aXJlIGZvcm1hdCBwcmVmaXhlcyBldmVyeSBwYXJhbWV0ZXIgd2l0aCBpdHMgbGVuZ3RoLFxuICAvLyBhbmQgZG9pbmcgaXQgaW4gb25lIG1ldGhvZCBjb21wdXRlcyBCdWZmZXIuYnl0ZUxlbmd0aCBPTkNFIFx1MjAxNCB0aGUgcHJldmlvdXNcbiAgLy8gYGFkZEludDMyKEJ1ZmZlci5ieXRlTGVuZ3RoKHMpKS5hZGRTdHJpbmcocylgIHBhaXJpbmcgc2Nhbm5lZCB0aGUgc3RyaW5nXG4gIC8vIHRocmVlIHRpbWVzIChieXRlTGVuZ3RoIGZvciB0aGUgcHJlZml4LCBieXRlTGVuZ3RoIGFnYWluIGluc2lkZSBhZGRTdHJpbmcsXG4gIC8vIHRoZW4gdGhlIGVuY29kZSksIHdoaWNoIGlzIGNvc3RseSBmb3IgbGFyZ2UgdGV4dCBwYXJhbWV0ZXJzLlxuICBwdWJsaWMgYWRkSW50MzJQcmVmaXhlZFN0cmluZyhzdHJpbmc6IHN0cmluZyk6IFdyaXRlciB7XG4gICAgY29uc3QgbGVuID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3RyaW5nKVxuICAgIHRoaXMuZW5zdXJlKDQgKyBsZW4pXG4gICAgY29uc3QgYnVmZmVyID0gdGhpcy5idWZmZXJcbiAgICBsZXQgb2Zmc2V0ID0gdGhpcy5vZmZzZXRcbiAgICBidWZmZXJbb2Zmc2V0KytdID0gKGxlbiA+Pj4gMjQpICYgMHhmZlxuICAgIGJ1ZmZlcltvZmZzZXQrK10gPSAobGVuID4+PiAxNikgJiAweGZmXG4gICAgYnVmZmVyW29mZnNldCsrXSA9IChsZW4gPj4+IDgpICYgMHhmZlxuICAgIGJ1ZmZlcltvZmZzZXQrK10gPSAobGVuID4+PiAwKSAmIDB4ZmZcbiAgICBidWZmZXIud3JpdGUoc3RyaW5nLCBvZmZzZXQsICd1dGYtOCcpXG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQgKyBsZW5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHVibGljIGFkZChvdGhlckJ1ZmZlcjogQnVmZmVyKTogV3JpdGVyIHtcbiAgICB0aGlzLmVuc3VyZShvdGhlckJ1ZmZlci5sZW5ndGgpXG4gICAgb3RoZXJCdWZmZXIuY29weSh0aGlzLmJ1ZmZlciwgdGhpcy5vZmZzZXQpXG4gICAgdGhpcy5vZmZzZXQgKz0gb3RoZXJCdWZmZXIubGVuZ3RoXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHByaXZhdGUgam9pbihjb2RlPzogbnVtYmVyKTogQnVmZmVyIHtcbiAgICBpZiAoY29kZSkge1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5oZWFkZXJQb3NpdGlvbl0gPSBjb2RlXG4gICAgICAvL2xlbmd0aCBpcyBldmVyeXRoaW5nIGluIHRoaXMgcGFja2V0IG1pbnVzIHRoZSBjb2RlXG4gICAgICBjb25zdCBsZW5ndGggPSB0aGlzLm9mZnNldCAtICh0aGlzLmhlYWRlclBvc2l0aW9uICsgMSlcbiAgICAgIHRoaXMuYnVmZmVyLndyaXRlSW50MzJCRShsZW5ndGgsIHRoaXMuaGVhZGVyUG9zaXRpb24gKyAxKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5idWZmZXIuc2xpY2UoY29kZSA/IDAgOiA1LCB0aGlzLm9mZnNldClcbiAgfVxuXG4gIHB1YmxpYyBmbHVzaChjb2RlPzogbnVtYmVyKTogQnVmZmVyIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmpvaW4oY29kZSlcbiAgICB0aGlzLm9mZnNldCA9IDVcbiAgICB0aGlzLmhlYWRlclBvc2l0aW9uID0gMFxuICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKHRoaXMuc2l6ZSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5vZmZzZXQgPSA1XG4gICAgdGhpcy5oZWFkZXJQb3NpdGlvbiA9IDBcbiAgfVxufVxuIiwgImltcG9ydCB7IFdyaXRlciB9IGZyb20gJy4vYnVmZmVyLXdyaXRlcidcblxuY29uc3QgZW51bSBjb2RlIHtcbiAgc3RhcnR1cCA9IDB4NzAsXG4gIHF1ZXJ5ID0gMHg1MSxcbiAgcGFyc2UgPSAweDUwLFxuICBiaW5kID0gMHg0MixcbiAgZXhlY3V0ZSA9IDB4NDUsXG4gIGZsdXNoID0gMHg0OCxcbiAgc3luYyA9IDB4NTMsXG4gIGVuZCA9IDB4NTgsXG4gIGNsb3NlID0gMHg0MyxcbiAgZGVzY3JpYmUgPSAweDQ0LFxuICBjb3B5RnJvbUNodW5rID0gMHg2NCxcbiAgY29weURvbmUgPSAweDYzLFxuICBjb3B5RmFpbCA9IDB4NjYsXG59XG5cbmNvbnN0IHdyaXRlciA9IG5ldyBXcml0ZXIoKVxuXG5jb25zdCBzdGFydHVwID0gKG9wdHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBCdWZmZXIgPT4ge1xuICAvLyBwcm90b2NvbCB2ZXJzaW9uXG4gIHdyaXRlci5hZGRJbnQxNigzKS5hZGRJbnQxNigwKVxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvcHRzKSkge1xuICAgIHdyaXRlci5hZGRDU3RyaW5nKGtleSkuYWRkQ1N0cmluZyhvcHRzW2tleV0pXG4gIH1cblxuICB3cml0ZXIuYWRkQ1N0cmluZygnY2xpZW50X2VuY29kaW5nJykuYWRkQ1N0cmluZygnVVRGOCcpXG5cbiAgY29uc3QgYm9keUJ1ZmZlciA9IHdyaXRlci5hZGRDU3RyaW5nKCcnKS5mbHVzaCgpXG4gIC8vIHRoaXMgbWVzc2FnZSBpcyBzZW50IHdpdGhvdXQgYSBjb2RlXG5cbiAgY29uc3QgbGVuZ3RoID0gYm9keUJ1ZmZlci5sZW5ndGggKyA0XG5cbiAgcmV0dXJuIG5ldyBXcml0ZXIoKS5hZGRJbnQzMihsZW5ndGgpLmFkZChib2R5QnVmZmVyKS5mbHVzaCgpXG59XG5cbmNvbnN0IHJlcXVlc3RTc2wgPSAoKTogQnVmZmVyID0+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBCdWZmZXIuYWxsb2NVbnNhZmUoOClcbiAgcmVzcG9uc2Uud3JpdGVJbnQzMkJFKDgsIDApXG4gIHJlc3BvbnNlLndyaXRlSW50MzJCRSg4MDg3NzEwMywgNClcbiAgcmV0dXJuIHJlc3BvbnNlXG59XG5cbmNvbnN0IHBhc3N3b3JkID0gKHBhc3N3b3JkOiBzdHJpbmcpOiBCdWZmZXIgPT4ge1xuICByZXR1cm4gd3JpdGVyLmFkZENTdHJpbmcocGFzc3dvcmQpLmZsdXNoKGNvZGUuc3RhcnR1cClcbn1cblxuY29uc3Qgc2VuZFNBU0xJbml0aWFsUmVzcG9uc2VNZXNzYWdlID0gZnVuY3Rpb24gKG1lY2hhbmlzbTogc3RyaW5nLCBpbml0aWFsUmVzcG9uc2U6IHN0cmluZyk6IEJ1ZmZlciB7XG4gIC8vIDB4NzAgPSAncCdcbiAgd3JpdGVyLmFkZENTdHJpbmcobWVjaGFuaXNtKS5hZGRJbnQzMlByZWZpeGVkU3RyaW5nKGluaXRpYWxSZXNwb25zZSlcblxuICByZXR1cm4gd3JpdGVyLmZsdXNoKGNvZGUuc3RhcnR1cClcbn1cblxuY29uc3Qgc2VuZFNDUkFNQ2xpZW50RmluYWxNZXNzYWdlID0gZnVuY3Rpb24gKGFkZGl0aW9uYWxEYXRhOiBzdHJpbmcpOiBCdWZmZXIge1xuICByZXR1cm4gd3JpdGVyLmFkZFN0cmluZyhhZGRpdGlvbmFsRGF0YSkuZmx1c2goY29kZS5zdGFydHVwKVxufVxuXG5jb25zdCBxdWVyeSA9ICh0ZXh0OiBzdHJpbmcpOiBCdWZmZXIgPT4ge1xuICByZXR1cm4gd3JpdGVyLmFkZENTdHJpbmcodGV4dCkuZmx1c2goY29kZS5xdWVyeSlcbn1cblxudHlwZSBQYXJzZU9wdHMgPSB7XG4gIG5hbWU/OiBzdHJpbmdcbiAgdHlwZXM/OiBudW1iZXJbXVxuICB0ZXh0OiBzdHJpbmdcbn1cblxuY29uc3QgZW1wdHlBcnJheTogYW55W10gPSBbXVxuXG5jb25zdCBwYXJzZSA9IChxdWVyeTogUGFyc2VPcHRzKTogQnVmZmVyID0+IHtcbiAgLy8gZXhwZWN0IHNvbWV0aGluZyBsaWtlIHRoaXM6XG4gIC8vIHsgbmFtZTogJ3F1ZXJ5TmFtZScsXG4gIC8vICAgdGV4dDogJ3NlbGVjdCAqIGZyb20gYmxhaCcsXG4gIC8vICAgdHlwZXM6IFsnaW50OCcsICdib29sJ10gfVxuXG4gIC8vIG5vcm1hbGl6ZSBtaXNzaW5nIHF1ZXJ5IG5hbWVzIHRvIGFsbG93IGZvciBudWxsXG4gIGNvbnN0IG5hbWUgPSBxdWVyeS5uYW1lIHx8ICcnXG4gIGlmIChuYW1lLmxlbmd0aCA+IDYzKSB7XG4gICAgY29uc29sZS5lcnJvcignV2FybmluZyEgUG9zdGdyZXMgb25seSBzdXBwb3J0cyA2MyBjaGFyYWN0ZXJzIGZvciBxdWVyeSBuYW1lcy4nKVxuICAgIGNvbnNvbGUuZXJyb3IoJ1lvdSBzdXBwbGllZCAlcyAoJXMpJywgbmFtZSwgbmFtZS5sZW5ndGgpXG4gICAgY29uc29sZS5lcnJvcignVGhpcyBjYW4gY2F1c2UgY29uZmxpY3RzIGFuZCBzaWxlbnQgZXJyb3JzIGV4ZWN1dGluZyBxdWVyaWVzJylcbiAgfVxuXG4gIGNvbnN0IHR5cGVzID0gcXVlcnkudHlwZXMgfHwgZW1wdHlBcnJheVxuXG4gIGNvbnN0IGxlbiA9IHR5cGVzLmxlbmd0aFxuXG4gIGNvbnN0IGJ1ZmZlciA9IHdyaXRlclxuICAgIC5hZGRDU3RyaW5nKG5hbWUpIC8vIG5hbWUgb2YgcXVlcnlcbiAgICAuYWRkQ1N0cmluZyhxdWVyeS50ZXh0KSAvLyBhY3R1YWwgcXVlcnkgdGV4dFxuICAgIC5hZGRJbnQxNihsZW4pXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGJ1ZmZlci5hZGRJbnQzMih0eXBlc1tpXSlcbiAgfVxuXG4gIHJldHVybiB3cml0ZXIuZmx1c2goY29kZS5wYXJzZSlcbn1cblxudHlwZSBWYWx1ZU1hcHBlciA9IChwYXJhbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiBhbnlcblxudHlwZSBCaW5kT3B0cyA9IHtcbiAgcG9ydGFsPzogc3RyaW5nXG4gIGJpbmFyeT86IGJvb2xlYW5cbiAgc3RhdGVtZW50Pzogc3RyaW5nXG4gIHZhbHVlcz86IGFueVtdXG4gIC8vIG9wdGlvbmFsIG1hcCBmcm9tIEpTIHZhbHVlIHRvIHBvc3RncmVzIHZhbHVlIHBlciBwYXJhbWV0ZXJcbiAgdmFsdWVNYXBwZXI/OiBWYWx1ZU1hcHBlclxufVxuXG5jb25zdCBwYXJhbVdyaXRlciA9IG5ldyBXcml0ZXIoKVxuXG4vLyBtYWtlIHRoaXMgYSBjb25zdCBlbnVtIHNvIHR5cGVzY3JpcHQgd2lsbCBpbmxpbmUgdGhlIHZhbHVlXG5jb25zdCBlbnVtIFBhcmFtVHlwZSB7XG4gIFNUUklORyA9IDAsXG4gIEJJTkFSWSA9IDEsXG59XG5cbmNvbnN0IHdyaXRlVmFsdWVzID0gZnVuY3Rpb24gKHZhbHVlczogYW55W10sIHZhbHVlTWFwcGVyPzogVmFsdWVNYXBwZXIpOiB2b2lkIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBtYXBwZWRWYWwgPSB2YWx1ZU1hcHBlciA/IHZhbHVlTWFwcGVyKHZhbHVlc1tpXSwgaSkgOiB2YWx1ZXNbaV1cbiAgICBpZiAobWFwcGVkVmFsID09IG51bGwpIHtcbiAgICAgIC8vIGFkZCB0aGUgcGFyYW0gdHlwZSAoc3RyaW5nKSB0byB0aGUgd3JpdGVyXG4gICAgICB3cml0ZXIuYWRkSW50MTYoUGFyYW1UeXBlLlNUUklORylcbiAgICAgIC8vIHdyaXRlIC0xIHRvIHRoZSBwYXJhbSB3cml0ZXIgdG8gaW5kaWNhdGUgbnVsbFxuICAgICAgcGFyYW1Xcml0ZXIuYWRkSW50MzIoLTEpXG4gICAgfSBlbHNlIGlmIChtYXBwZWRWYWwgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIC8vIGFkZCB0aGUgcGFyYW0gdHlwZSAoYmluYXJ5KSB0byB0aGUgd3JpdGVyXG4gICAgICB3cml0ZXIuYWRkSW50MTYoUGFyYW1UeXBlLkJJTkFSWSlcbiAgICAgIC8vIGFkZCB0aGUgYnVmZmVyIHRvIHRoZSBwYXJhbSB3cml0ZXJcbiAgICAgIHBhcmFtV3JpdGVyLmFkZEludDMyKG1hcHBlZFZhbC5sZW5ndGgpXG4gICAgICBwYXJhbVdyaXRlci5hZGQobWFwcGVkVmFsKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhZGQgdGhlIHBhcmFtIHR5cGUgKHN0cmluZykgdG8gdGhlIHdyaXRlclxuICAgICAgd3JpdGVyLmFkZEludDE2KFBhcmFtVHlwZS5TVFJJTkcpXG4gICAgICAvLyBsZW5ndGggcHJlZml4ICsgVVRGLTggYnl0ZXMgaW4gb25lIHBhc3MgKEJ1ZmZlci5ieXRlTGVuZ3RoIGNvbXB1dGVkIG9uY2UpXG4gICAgICBwYXJhbVdyaXRlci5hZGRJbnQzMlByZWZpeGVkU3RyaW5nKG1hcHBlZFZhbClcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgYmluZCA9IChjb25maWc6IEJpbmRPcHRzID0ge30pOiBCdWZmZXIgPT4ge1xuICAvLyBub3JtYWxpemUgY29uZmlnXG4gIGNvbnN0IHBvcnRhbCA9IGNvbmZpZy5wb3J0YWwgfHwgJydcbiAgY29uc3Qgc3RhdGVtZW50ID0gY29uZmlnLnN0YXRlbWVudCB8fCAnJ1xuICBjb25zdCBiaW5hcnkgPSBjb25maWcuYmluYXJ5IHx8IGZhbHNlXG4gIGNvbnN0IHZhbHVlcyA9IGNvbmZpZy52YWx1ZXMgfHwgZW1wdHlBcnJheVxuICBjb25zdCBsZW4gPSB2YWx1ZXMubGVuZ3RoXG5cbiAgd3JpdGVyLmFkZENTdHJpbmcocG9ydGFsKS5hZGRDU3RyaW5nKHN0YXRlbWVudClcbiAgd3JpdGVyLmFkZEludDE2KGxlbilcblxuICB0cnkge1xuICAgIHdyaXRlVmFsdWVzKHZhbHVlcywgY29uZmlnLnZhbHVlTWFwcGVyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICB3cml0ZXIuY2xlYXIoKVxuICAgIHBhcmFtV3JpdGVyLmNsZWFyKClcbiAgICB0aHJvdyBlcnJcbiAgfVxuXG4gIHdyaXRlci5hZGRJbnQxNihsZW4pXG4gIHdyaXRlci5hZGQocGFyYW1Xcml0ZXIuZmx1c2goKSlcblxuICAvLyBhbGwgcmVzdWx0cyB1c2UgdGhlIHNhbWUgZm9ybWF0IGNvZGVcbiAgd3JpdGVyLmFkZEludDE2KDEpXG4gIC8vIGZvcm1hdCBjb2RlXG4gIHdyaXRlci5hZGRJbnQxNihiaW5hcnkgPyBQYXJhbVR5cGUuQklOQVJZIDogUGFyYW1UeXBlLlNUUklORylcbiAgcmV0dXJuIHdyaXRlci5mbHVzaChjb2RlLmJpbmQpXG59XG5cbnR5cGUgRXhlY09wdHMgPSB7XG4gIHBvcnRhbD86IHN0cmluZ1xuICByb3dzPzogbnVtYmVyXG59XG5cbmNvbnN0IGVtcHR5RXhlY3V0ZSA9IEJ1ZmZlci5mcm9tKFtjb2RlLmV4ZWN1dGUsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDksIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDBdKVxuXG5jb25zdCBleGVjdXRlID0gKGNvbmZpZz86IEV4ZWNPcHRzKTogQnVmZmVyID0+IHtcbiAgLy8gdGhpcyBpcyB0aGUgaGFwcHkgcGF0aCBmb3IgbW9zdCBxdWVyaWVzXG4gIGlmICghY29uZmlnIHx8ICghY29uZmlnLnBvcnRhbCAmJiAhY29uZmlnLnJvd3MpKSB7XG4gICAgcmV0dXJuIGVtcHR5RXhlY3V0ZVxuICB9XG5cbiAgY29uc3QgcG9ydGFsID0gY29uZmlnLnBvcnRhbCB8fCAnJ1xuICBjb25zdCByb3dzID0gY29uZmlnLnJvd3MgfHwgMFxuXG4gIGNvbnN0IHBvcnRhbExlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHBvcnRhbClcbiAgY29uc3QgbGVuID0gNCArIHBvcnRhbExlbmd0aCArIDEgKyA0XG4gIC8vIG9uZSBleHRyYSBiaXQgZm9yIGNvZGVcbiAgY29uc3QgYnVmZiA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSgxICsgbGVuKVxuICBidWZmWzBdID0gY29kZS5leGVjdXRlXG4gIGJ1ZmYud3JpdGVJbnQzMkJFKGxlbiwgMSlcbiAgYnVmZi53cml0ZShwb3J0YWwsIDUsICd1dGYtOCcpXG4gIGJ1ZmZbcG9ydGFsTGVuZ3RoICsgNV0gPSAwIC8vIG51bGwgdGVybWluYXRlIHBvcnRhbCBjU3RyaW5nXG4gIGJ1ZmYud3JpdGVVSW50MzJCRShyb3dzLCBidWZmLmxlbmd0aCAtIDQpXG4gIHJldHVybiBidWZmXG59XG5cbmNvbnN0IGNhbmNlbCA9IChwcm9jZXNzSUQ6IG51bWJlciwgc2VjcmV0S2V5OiBudW1iZXIpOiBCdWZmZXIgPT4ge1xuICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUoMTYpXG4gIGJ1ZmZlci53cml0ZUludDMyQkUoMTYsIDApXG4gIGJ1ZmZlci53cml0ZUludDE2QkUoMTIzNCwgNClcbiAgYnVmZmVyLndyaXRlSW50MTZCRSg1Njc4LCA2KVxuICBidWZmZXIud3JpdGVJbnQzMkJFKHByb2Nlc3NJRCwgOClcbiAgYnVmZmVyLndyaXRlSW50MzJCRShzZWNyZXRLZXksIDEyKVxuICByZXR1cm4gYnVmZmVyXG59XG5cbnR5cGUgUG9ydGFsT3B0cyA9IHtcbiAgdHlwZTogJ1MnIHwgJ1AnXG4gIG5hbWU/OiBzdHJpbmdcbn1cblxuY29uc3QgY3N0cmluZ01lc3NhZ2UgPSAoY29kZTogY29kZSwgc3RyaW5nOiBzdHJpbmcpOiBCdWZmZXIgPT4ge1xuICBjb25zdCBzdHJpbmdMZW4gPSBCdWZmZXIuYnl0ZUxlbmd0aChzdHJpbmcpXG4gIGNvbnN0IGxlbiA9IDQgKyBzdHJpbmdMZW4gKyAxXG4gIC8vIG9uZSBleHRyYSBiaXQgZm9yIGNvZGVcbiAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKDEgKyBsZW4pXG4gIGJ1ZmZlclswXSA9IGNvZGVcbiAgYnVmZmVyLndyaXRlSW50MzJCRShsZW4sIDEpXG4gIGJ1ZmZlci53cml0ZShzdHJpbmcsIDUsICd1dGYtOCcpXG4gIGJ1ZmZlcltsZW5dID0gMCAvLyBudWxsIHRlcm1pbmF0ZSBjU3RyaW5nXG4gIHJldHVybiBidWZmZXJcbn1cblxuY29uc3QgZW1wdHlEZXNjcmliZVBvcnRhbCA9IHdyaXRlci5hZGRDU3RyaW5nKCdQJykuZmx1c2goY29kZS5kZXNjcmliZSlcbmNvbnN0IGVtcHR5RGVzY3JpYmVTdGF0ZW1lbnQgPSB3cml0ZXIuYWRkQ1N0cmluZygnUycpLmZsdXNoKGNvZGUuZGVzY3JpYmUpXG5cbmNvbnN0IGRlc2NyaWJlID0gKG1zZzogUG9ydGFsT3B0cyk6IEJ1ZmZlciA9PiB7XG4gIHJldHVybiBtc2cubmFtZVxuICAgID8gY3N0cmluZ01lc3NhZ2UoY29kZS5kZXNjcmliZSwgYCR7bXNnLnR5cGV9JHttc2cubmFtZSB8fCAnJ31gKVxuICAgIDogbXNnLnR5cGUgPT09ICdQJ1xuICAgID8gZW1wdHlEZXNjcmliZVBvcnRhbFxuICAgIDogZW1wdHlEZXNjcmliZVN0YXRlbWVudFxufVxuXG5jb25zdCBjbG9zZSA9IChtc2c6IFBvcnRhbE9wdHMpOiBCdWZmZXIgPT4ge1xuICBjb25zdCB0ZXh0ID0gYCR7bXNnLnR5cGV9JHttc2cubmFtZSB8fCAnJ31gXG4gIHJldHVybiBjc3RyaW5nTWVzc2FnZShjb2RlLmNsb3NlLCB0ZXh0KVxufVxuXG5jb25zdCBjb3B5RGF0YSA9IChjaHVuazogQnVmZmVyKTogQnVmZmVyID0+IHtcbiAgcmV0dXJuIHdyaXRlci5hZGQoY2h1bmspLmZsdXNoKGNvZGUuY29weUZyb21DaHVuaylcbn1cblxuY29uc3QgY29weUZhaWwgPSAobWVzc2FnZTogc3RyaW5nKTogQnVmZmVyID0+IHtcbiAgcmV0dXJuIGNzdHJpbmdNZXNzYWdlKGNvZGUuY29weUZhaWwsIG1lc3NhZ2UpXG59XG5cbmNvbnN0IGNvZGVPbmx5QnVmZmVyID0gKGNvZGU6IGNvZGUpOiBCdWZmZXIgPT4gQnVmZmVyLmZyb20oW2NvZGUsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDRdKVxuXG5jb25zdCBmbHVzaEJ1ZmZlciA9IGNvZGVPbmx5QnVmZmVyKGNvZGUuZmx1c2gpXG5jb25zdCBzeW5jQnVmZmVyID0gY29kZU9ubHlCdWZmZXIoY29kZS5zeW5jKVxuY29uc3QgZW5kQnVmZmVyID0gY29kZU9ubHlCdWZmZXIoY29kZS5lbmQpXG5jb25zdCBjb3B5RG9uZUJ1ZmZlciA9IGNvZGVPbmx5QnVmZmVyKGNvZGUuY29weURvbmUpXG5cbmNvbnN0IHNlcmlhbGl6ZSA9IHtcbiAgc3RhcnR1cCxcbiAgcGFzc3dvcmQsXG4gIHJlcXVlc3RTc2wsXG4gIHNlbmRTQVNMSW5pdGlhbFJlc3BvbnNlTWVzc2FnZSxcbiAgc2VuZFNDUkFNQ2xpZW50RmluYWxNZXNzYWdlLFxuICBxdWVyeSxcbiAgcGFyc2UsXG4gIGJpbmQsXG4gIGV4ZWN1dGUsXG4gIGRlc2NyaWJlLFxuICBjbG9zZSxcbiAgZmx1c2g6ICgpID0+IGZsdXNoQnVmZmVyLFxuICBzeW5jOiAoKSA9PiBzeW5jQnVmZmVyLFxuICBlbmQ6ICgpID0+IGVuZEJ1ZmZlcixcbiAgY29weURhdGEsXG4gIGNvcHlEb25lOiAoKSA9PiBjb3B5RG9uZUJ1ZmZlcixcbiAgY29weUZhaWwsXG4gIGNhbmNlbCxcbn1cblxuZXhwb3J0IHsgc2VyaWFsaXplIH1cbiIsICJleHBvcnQgY2xhc3MgQnVmZmVyUmVhZGVyIHtcbiAgcHJpdmF0ZSBidWZmZXI6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSgwKVxuXG4gIC8vIFRPRE8oYm1jKTogc3VwcG9ydCBub24tdXRmOCBlbmNvZGluZz9cbiAgcHJpdmF0ZSBlbmNvZGluZzogQnVmZmVyRW5jb2RpbmcgPSAndXRmLTgnXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBvZmZzZXQ6IG51bWJlciA9IDApIHt9XG5cbiAgcHVibGljIHNldEJ1ZmZlcihvZmZzZXQ6IG51bWJlciwgYnVmZmVyOiBCdWZmZXIpOiB2b2lkIHtcbiAgICB0aGlzLm9mZnNldCA9IG9mZnNldFxuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyXG4gIH1cblxuICBwdWJsaWMgaW50MTYoKTogbnVtYmVyIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkSW50MTZCRSh0aGlzLm9mZnNldClcbiAgICB0aGlzLm9mZnNldCArPSAyXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGJ5dGUoKTogbnVtYmVyIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmJ1ZmZlclt0aGlzLm9mZnNldF1cbiAgICB0aGlzLm9mZnNldCsrXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGludDMyKCk6IG51bWJlciB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5idWZmZXIucmVhZEludDMyQkUodGhpcy5vZmZzZXQpXG4gICAgdGhpcy5vZmZzZXQgKz0gNFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyB1aW50MzIoKTogbnVtYmVyIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDMyQkUodGhpcy5vZmZzZXQpXG4gICAgdGhpcy5vZmZzZXQgKz0gNFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBzdHJpbmcobGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuYnVmZmVyLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcsIHRoaXMub2Zmc2V0LCB0aGlzLm9mZnNldCArIGxlbmd0aClcbiAgICB0aGlzLm9mZnNldCArPSBsZW5ndGhcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgY3N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5vZmZzZXRcbiAgICBsZXQgZW5kID0gc3RhcnRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZW1wdHlcbiAgICB3aGlsZSAodGhpcy5idWZmZXJbZW5kKytdKSB7fVxuICAgIHRoaXMub2Zmc2V0ID0gZW5kXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcsIHN0YXJ0LCBlbmQgLSAxKVxuICB9XG5cbiAgcHVibGljIGJ5dGVzKGxlbmd0aDogbnVtYmVyKTogQnVmZmVyIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmJ1ZmZlci5zbGljZSh0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKyBsZW5ndGgpXG4gICAgdGhpcy5vZmZzZXQgKz0gbGVuZ3RoXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG59XG4iLCAiaW1wb3J0IHsgVHJhbnNmb3JtT3B0aW9ucyB9IGZyb20gJ3N0cmVhbSdcbmltcG9ydCB7XG4gIE1vZGUsXG4gIGJpbmRDb21wbGV0ZSxcbiAgcGFyc2VDb21wbGV0ZSxcbiAgY2xvc2VDb21wbGV0ZSxcbiAgbm9EYXRhLFxuICBwb3J0YWxTdXNwZW5kZWQsXG4gIGNvcHlEb25lLFxuICByZXBsaWNhdGlvblN0YXJ0LFxuICBlbXB0eVF1ZXJ5LFxuICBSZWFkeUZvclF1ZXJ5TWVzc2FnZSxcbiAgQ29tbWFuZENvbXBsZXRlTWVzc2FnZSxcbiAgQ29weURhdGFNZXNzYWdlLFxuICBDb3B5UmVzcG9uc2UsXG4gIE5vdGlmaWNhdGlvblJlc3BvbnNlTWVzc2FnZSxcbiAgUm93RGVzY3JpcHRpb25NZXNzYWdlLFxuICBQYXJhbWV0ZXJEZXNjcmlwdGlvbk1lc3NhZ2UsXG4gIEZpZWxkLFxuICBEYXRhUm93TWVzc2FnZSxcbiAgUGFyYW1ldGVyU3RhdHVzTWVzc2FnZSxcbiAgQmFja2VuZEtleURhdGFNZXNzYWdlLFxuICBEYXRhYmFzZUVycm9yLFxuICBCYWNrZW5kTWVzc2FnZSxcbiAgTWVzc2FnZU5hbWUsXG4gIEF1dGhlbnRpY2F0aW9uTUQ1UGFzc3dvcmQsXG4gIE5vdGljZU1lc3NhZ2UsXG59IGZyb20gJy4vbWVzc2FnZXMnXG5pbXBvcnQgeyBCdWZmZXJSZWFkZXIgfSBmcm9tICcuL2J1ZmZlci1yZWFkZXInXG5cbi8vIGV2ZXJ5IG1lc3NhZ2UgaXMgcHJlZml4ZWQgd2l0aCBhIHNpbmdsZSBieXRlXG5jb25zdCBDT0RFX0xFTkdUSCA9IDFcbi8vIGV2ZXJ5IG1lc3NhZ2UgaGFzIGFuIGludDMyIGxlbmd0aCB3aGljaCBpbmNsdWRlcyBpdHNlbGYgYnV0IGRvZXNcbi8vIE5PVCBpbmNsdWRlIHRoZSBjb2RlIGluIHRoZSBsZW5ndGhcbmNvbnN0IExFTl9MRU5HVEggPSA0XG5cbmNvbnN0IEhFQURFUl9MRU5HVEggPSBDT0RFX0xFTkdUSCArIExFTl9MRU5HVEhcblxuLy8gQSBwbGFjZWhvbGRlciBmb3IgYSBgQmFja2VuZE1lc3NhZ2VgXHUyMDE5cyBsZW5ndGggdmFsdWUgdGhhdCB3aWxsIGJlIHNldCBhZnRlciBjb25zdHJ1Y3Rpb24uXG5jb25zdCBMQVRFSU5JVF9MRU5HVEggPSAtMVxuXG5leHBvcnQgdHlwZSBQYWNrZXQgPSB7XG4gIGNvZGU6IG51bWJlclxuICBwYWNrZXQ6IEJ1ZmZlclxufVxuXG5jb25zdCBlbXB0eUJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSgwKVxuXG50eXBlIFN0cmVhbU9wdGlvbnMgPSBUcmFuc2Zvcm1PcHRpb25zICYge1xuICBtb2RlOiBNb2RlXG59XG5cbmNvbnN0IGVudW0gTWVzc2FnZUNvZGVzIHtcbiAgRGF0YVJvdyA9IDB4NDQsIC8vIERcbiAgUGFyc2VDb21wbGV0ZSA9IDB4MzEsIC8vIDFcbiAgQmluZENvbXBsZXRlID0gMHgzMiwgLy8gMlxuICBDbG9zZUNvbXBsZXRlID0gMHgzMywgLy8gM1xuICBDb21tYW5kQ29tcGxldGUgPSAweDQzLCAvLyBDXG4gIFJlYWR5Rm9yUXVlcnkgPSAweDVhLCAvLyBaXG4gIE5vRGF0YSA9IDB4NmUsIC8vIG5cbiAgTm90aWZpY2F0aW9uUmVzcG9uc2UgPSAweDQxLCAvLyBBXG4gIEF1dGhlbnRpY2F0aW9uUmVzcG9uc2UgPSAweDUyLCAvLyBSXG4gIFBhcmFtZXRlclN0YXR1cyA9IDB4NTMsIC8vIFNcbiAgQmFja2VuZEtleURhdGEgPSAweDRiLCAvLyBLXG4gIEVycm9yTWVzc2FnZSA9IDB4NDUsIC8vIEVcbiAgTm90aWNlTWVzc2FnZSA9IDB4NGUsIC8vIE5cbiAgUm93RGVzY3JpcHRpb25NZXNzYWdlID0gMHg1NCwgLy8gVFxuICBQYXJhbWV0ZXJEZXNjcmlwdGlvbk1lc3NhZ2UgPSAweDc0LCAvLyB0XG4gIFBvcnRhbFN1c3BlbmRlZCA9IDB4NzMsIC8vIHNcbiAgUmVwbGljYXRpb25TdGFydCA9IDB4NTcsIC8vIFdcbiAgRW1wdHlRdWVyeSA9IDB4NDksIC8vIElcbiAgQ29weUluID0gMHg0NywgLy8gR1xuICBDb3B5T3V0ID0gMHg0OCwgLy8gSFxuICBDb3B5RG9uZSA9IDB4NjMsIC8vIGNcbiAgQ29weURhdGEgPSAweDY0LCAvLyBkXG59XG5cbmV4cG9ydCB0eXBlIE1lc3NhZ2VDYWxsYmFjayA9IChtc2c6IEJhY2tlbmRNZXNzYWdlKSA9PiB2b2lkXG5cbmV4cG9ydCBjbGFzcyBQYXJzZXIge1xuICBwcml2YXRlIGJ1ZmZlcjogQnVmZmVyID0gZW1wdHlCdWZmZXJcbiAgcHJpdmF0ZSBidWZmZXJMZW5ndGg6IG51bWJlciA9IDBcbiAgcHJpdmF0ZSBidWZmZXJPZmZzZXQ6IG51bWJlciA9IDBcbiAgcHJpdmF0ZSByZWFkZXIgPSBuZXcgQnVmZmVyUmVhZGVyKClcbiAgcHJpdmF0ZSBtb2RlOiBNb2RlXG5cbiAgY29uc3RydWN0b3Iob3B0cz86IFN0cmVhbU9wdGlvbnMpIHtcbiAgICBpZiAob3B0cz8ubW9kZSA9PT0gJ2JpbmFyeScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQmluYXJ5IG1vZGUgbm90IHN1cHBvcnRlZCB5ZXQnKVxuICAgIH1cbiAgICB0aGlzLm1vZGUgPSBvcHRzPy5tb2RlIHx8ICd0ZXh0J1xuICB9XG5cbiAgcHVibGljIHBhcnNlKGJ1ZmZlcjogQnVmZmVyLCBjYWxsYmFjazogTWVzc2FnZUNhbGxiYWNrKSB7XG4gICAgdGhpcy5tZXJnZUJ1ZmZlcihidWZmZXIpXG4gICAgY29uc3QgYnVmZmVyRnVsbExlbmd0aCA9IHRoaXMuYnVmZmVyT2Zmc2V0ICsgdGhpcy5idWZmZXJMZW5ndGhcbiAgICBsZXQgb2Zmc2V0ID0gdGhpcy5idWZmZXJPZmZzZXRcbiAgICB3aGlsZSAob2Zmc2V0ICsgSEVBREVSX0xFTkdUSCA8PSBidWZmZXJGdWxsTGVuZ3RoKSB7XG4gICAgICAvLyBjb2RlIGlzIDEgYnl0ZSBsb25nIC0gaXQgaWRlbnRpZmllcyB0aGUgbWVzc2FnZSB0eXBlXG4gICAgICBjb25zdCBjb2RlID0gdGhpcy5idWZmZXJbb2Zmc2V0XVxuICAgICAgLy8gbGVuZ3RoIGlzIDEgVWludDMyQkUgLSBpdCBpcyB0aGUgbGVuZ3RoIG9mIHRoZSBtZXNzYWdlIEVYQ0xVRElORyB0aGUgY29kZVxuICAgICAgY29uc3QgbGVuZ3RoID0gdGhpcy5idWZmZXIucmVhZFVJbnQzMkJFKG9mZnNldCArIENPREVfTEVOR1RIKVxuICAgICAgY29uc3QgZnVsbE1lc3NhZ2VMZW5ndGggPSBDT0RFX0xFTkdUSCArIGxlbmd0aFxuICAgICAgaWYgKGZ1bGxNZXNzYWdlTGVuZ3RoICsgb2Zmc2V0IDw9IGJ1ZmZlckZ1bGxMZW5ndGgpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuaGFuZGxlUGFja2V0KG9mZnNldCArIEhFQURFUl9MRU5HVEgsIGNvZGUsIGxlbmd0aCwgdGhpcy5idWZmZXIpXG4gICAgICAgIGNhbGxiYWNrKG1lc3NhZ2UpXG4gICAgICAgIG9mZnNldCArPSBmdWxsTWVzc2FnZUxlbmd0aFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9mZnNldCA9PT0gYnVmZmVyRnVsbExlbmd0aCkge1xuICAgICAgLy8gTm8gbW9yZSB1c2UgZm9yIHRoZSBidWZmZXJcbiAgICAgIHRoaXMuYnVmZmVyID0gZW1wdHlCdWZmZXJcbiAgICAgIHRoaXMuYnVmZmVyTGVuZ3RoID0gMFxuICAgICAgdGhpcy5idWZmZXJPZmZzZXQgPSAwXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFkanVzdCB0aGUgY3Vyc29ycyBvZiByZW1haW5pbmdCdWZmZXJcbiAgICAgIHRoaXMuYnVmZmVyTGVuZ3RoID0gYnVmZmVyRnVsbExlbmd0aCAtIG9mZnNldFxuICAgICAgdGhpcy5idWZmZXJPZmZzZXQgPSBvZmZzZXRcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG1lcmdlQnVmZmVyKGJ1ZmZlcjogQnVmZmVyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYnVmZmVyTGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgbmV3TGVuZ3RoID0gdGhpcy5idWZmZXJMZW5ndGggKyBidWZmZXIuYnl0ZUxlbmd0aFxuICAgICAgY29uc3QgbmV3RnVsbExlbmd0aCA9IG5ld0xlbmd0aCArIHRoaXMuYnVmZmVyT2Zmc2V0XG4gICAgICBpZiAobmV3RnVsbExlbmd0aCA+IHRoaXMuYnVmZmVyLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgLy8gV2UgY2FuJ3QgY29uY2F0IHRoZSBuZXcgYnVmZmVyIHdpdGggdGhlIHJlbWFpbmluZyBvbmVcbiAgICAgICAgbGV0IG5ld0J1ZmZlcjogQnVmZmVyXG4gICAgICAgIGlmIChuZXdMZW5ndGggPD0gdGhpcy5idWZmZXIuYnl0ZUxlbmd0aCAmJiB0aGlzLmJ1ZmZlck9mZnNldCA+PSB0aGlzLmJ1ZmZlckxlbmd0aCkge1xuICAgICAgICAgIC8vIFdlIGNhbiBtb3ZlIHRoZSByZWxldmFudCBwYXJ0IHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGJ1ZmZlciBpbnN0ZWFkIG9mIGFsbG9jYXRpbmcgYSBuZXcgYnVmZmVyXG4gICAgICAgICAgbmV3QnVmZmVyID0gdGhpcy5idWZmZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBBbGxvY2F0ZSBhIG5ldyBsYXJnZXIgYnVmZmVyXG4gICAgICAgICAgbGV0IG5ld0J1ZmZlckxlbmd0aCA9IHRoaXMuYnVmZmVyLmJ5dGVMZW5ndGggKiAyXG4gICAgICAgICAgd2hpbGUgKG5ld0xlbmd0aCA+PSBuZXdCdWZmZXJMZW5ndGgpIHtcbiAgICAgICAgICAgIG5ld0J1ZmZlckxlbmd0aCAqPSAyXG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld0J1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShuZXdCdWZmZXJMZW5ndGgpXG4gICAgICAgIH1cbiAgICAgICAgLy8gTW92ZSB0aGUgcmVtYWluaW5nIGJ1ZmZlciB0byB0aGUgbmV3IG9uZVxuICAgICAgICB0aGlzLmJ1ZmZlci5jb3B5KG5ld0J1ZmZlciwgMCwgdGhpcy5idWZmZXJPZmZzZXQsIHRoaXMuYnVmZmVyT2Zmc2V0ICsgdGhpcy5idWZmZXJMZW5ndGgpXG4gICAgICAgIHRoaXMuYnVmZmVyID0gbmV3QnVmZmVyXG4gICAgICAgIHRoaXMuYnVmZmVyT2Zmc2V0ID0gMFxuICAgICAgfVxuICAgICAgLy8gQ29uY2F0IHRoZSBuZXcgYnVmZmVyIHdpdGggdGhlIHJlbWFpbmluZyBvbmVcbiAgICAgIGJ1ZmZlci5jb3B5KHRoaXMuYnVmZmVyLCB0aGlzLmJ1ZmZlck9mZnNldCArIHRoaXMuYnVmZmVyTGVuZ3RoKVxuICAgICAgdGhpcy5idWZmZXJMZW5ndGggPSBuZXdMZW5ndGhcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXJcbiAgICAgIHRoaXMuYnVmZmVyT2Zmc2V0ID0gMFxuICAgICAgdGhpcy5idWZmZXJMZW5ndGggPSBidWZmZXIuYnl0ZUxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlUGFja2V0KG9mZnNldDogbnVtYmVyLCBjb2RlOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyLCBieXRlczogQnVmZmVyKTogQmFja2VuZE1lc3NhZ2Uge1xuICAgIGNvbnN0IHsgcmVhZGVyIH0gPSB0aGlzXG5cbiAgICAvLyBOT1RFOiBUaGlzIHVuZGVzaXJhYmx5IHJldGFpbnMgdGhlIGJ1ZmZlciBpbiBgdGhpcy5yZWFkZXJgIGlmIHRoZSBgcGFyc2UqTWVzc2FnZWAgY2FsbHMgYmVsb3cgdGhyb3cuIEhvd2V2ZXIsIHRob3NlIHNob3VsZCBvbmx5IHRocm93IGluIHRoZSBjYXNlIG9mIGEgcHJvdG9jb2wgZXJyb3IsIHdoaWNoIG5vcm1hbGx5IHJlc3VsdHMgaW4gdGhlIHJlYWRlciBiZWluZyBkaXNjYXJkZWQuXG4gICAgcmVhZGVyLnNldEJ1ZmZlcihvZmZzZXQsIGJ5dGVzKVxuXG4gICAgbGV0IG1lc3NhZ2U6IEJhY2tlbmRNZXNzYWdlXG5cbiAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgIGNhc2UgTWVzc2FnZUNvZGVzLkJpbmRDb21wbGV0ZTpcbiAgICAgICAgbWVzc2FnZSA9IGJpbmRDb21wbGV0ZVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuUGFyc2VDb21wbGV0ZTpcbiAgICAgICAgbWVzc2FnZSA9IHBhcnNlQ29tcGxldGVcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTWVzc2FnZUNvZGVzLkNsb3NlQ29tcGxldGU6XG4gICAgICAgIG1lc3NhZ2UgPSBjbG9zZUNvbXBsZXRlXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1lc3NhZ2VDb2Rlcy5Ob0RhdGE6XG4gICAgICAgIG1lc3NhZ2UgPSBub0RhdGFcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTWVzc2FnZUNvZGVzLlBvcnRhbFN1c3BlbmRlZDpcbiAgICAgICAgbWVzc2FnZSA9IHBvcnRhbFN1c3BlbmRlZFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuQ29weURvbmU6XG4gICAgICAgIG1lc3NhZ2UgPSBjb3B5RG9uZVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuUmVwbGljYXRpb25TdGFydDpcbiAgICAgICAgbWVzc2FnZSA9IHJlcGxpY2F0aW9uU3RhcnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTWVzc2FnZUNvZGVzLkVtcHR5UXVlcnk6XG4gICAgICAgIG1lc3NhZ2UgPSBlbXB0eVF1ZXJ5XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1lc3NhZ2VDb2Rlcy5EYXRhUm93OlxuICAgICAgICBtZXNzYWdlID0gcGFyc2VEYXRhUm93TWVzc2FnZShyZWFkZXIpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1lc3NhZ2VDb2Rlcy5Db21tYW5kQ29tcGxldGU6XG4gICAgICAgIG1lc3NhZ2UgPSBwYXJzZUNvbW1hbmRDb21wbGV0ZU1lc3NhZ2UocmVhZGVyKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuUmVhZHlGb3JRdWVyeTpcbiAgICAgICAgbWVzc2FnZSA9IHBhcnNlUmVhZHlGb3JRdWVyeU1lc3NhZ2UocmVhZGVyKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuTm90aWZpY2F0aW9uUmVzcG9uc2U6XG4gICAgICAgIG1lc3NhZ2UgPSBwYXJzZU5vdGlmaWNhdGlvbk1lc3NhZ2UocmVhZGVyKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuQXV0aGVudGljYXRpb25SZXNwb25zZTpcbiAgICAgICAgbWVzc2FnZSA9IHBhcnNlQXV0aGVudGljYXRpb25SZXNwb25zZShyZWFkZXIsIGxlbmd0aClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTWVzc2FnZUNvZGVzLlBhcmFtZXRlclN0YXR1czpcbiAgICAgICAgbWVzc2FnZSA9IHBhcnNlUGFyYW1ldGVyU3RhdHVzTWVzc2FnZShyZWFkZXIpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1lc3NhZ2VDb2Rlcy5CYWNrZW5kS2V5RGF0YTpcbiAgICAgICAgbWVzc2FnZSA9IHBhcnNlQmFja2VuZEtleURhdGEocmVhZGVyKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuRXJyb3JNZXNzYWdlOlxuICAgICAgICBtZXNzYWdlID0gcGFyc2VFcnJvck1lc3NhZ2UocmVhZGVyLCAnZXJyb3InKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuTm90aWNlTWVzc2FnZTpcbiAgICAgICAgbWVzc2FnZSA9IHBhcnNlRXJyb3JNZXNzYWdlKHJlYWRlciwgJ25vdGljZScpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1lc3NhZ2VDb2Rlcy5Sb3dEZXNjcmlwdGlvbk1lc3NhZ2U6XG4gICAgICAgIG1lc3NhZ2UgPSBwYXJzZVJvd0Rlc2NyaXB0aW9uTWVzc2FnZShyZWFkZXIpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1lc3NhZ2VDb2Rlcy5QYXJhbWV0ZXJEZXNjcmlwdGlvbk1lc3NhZ2U6XG4gICAgICAgIG1lc3NhZ2UgPSBwYXJzZVBhcmFtZXRlckRlc2NyaXB0aW9uTWVzc2FnZShyZWFkZXIpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1lc3NhZ2VDb2Rlcy5Db3B5SW46XG4gICAgICAgIG1lc3NhZ2UgPSBwYXJzZUNvcHlJbk1lc3NhZ2UocmVhZGVyKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuQ29weU91dDpcbiAgICAgICAgbWVzc2FnZSA9IHBhcnNlQ29weU91dE1lc3NhZ2UocmVhZGVyKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNZXNzYWdlQ29kZXMuQ29weURhdGE6XG4gICAgICAgIG1lc3NhZ2UgPSBwYXJzZUNvcHlEYXRhKHJlYWRlciwgbGVuZ3RoKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRhYmFzZUVycm9yKCdyZWNlaXZlZCBpbnZhbGlkIHJlc3BvbnNlOiAnICsgY29kZS50b1N0cmluZygxNiksIGxlbmd0aCwgJ2Vycm9yJylcbiAgICB9XG5cbiAgICByZWFkZXIuc2V0QnVmZmVyKDAsIGVtcHR5QnVmZmVyKVxuXG4gICAgbWVzc2FnZS5sZW5ndGggPSBsZW5ndGhcbiAgICByZXR1cm4gbWVzc2FnZVxuICB9XG59XG5cbmNvbnN0IHBhcnNlUmVhZHlGb3JRdWVyeU1lc3NhZ2UgPSAocmVhZGVyOiBCdWZmZXJSZWFkZXIpID0+IHtcbiAgY29uc3Qgc3RhdHVzID0gcmVhZGVyLnN0cmluZygxKVxuICByZXR1cm4gbmV3IFJlYWR5Rm9yUXVlcnlNZXNzYWdlKExBVEVJTklUX0xFTkdUSCwgc3RhdHVzKVxufVxuXG5jb25zdCBwYXJzZUNvbW1hbmRDb21wbGV0ZU1lc3NhZ2UgPSAocmVhZGVyOiBCdWZmZXJSZWFkZXIpID0+IHtcbiAgY29uc3QgdGV4dCA9IHJlYWRlci5jc3RyaW5nKClcbiAgcmV0dXJuIG5ldyBDb21tYW5kQ29tcGxldGVNZXNzYWdlKExBVEVJTklUX0xFTkdUSCwgdGV4dClcbn1cblxuY29uc3QgcGFyc2VDb3B5RGF0YSA9IChyZWFkZXI6IEJ1ZmZlclJlYWRlciwgbGVuZ3RoOiBudW1iZXIpID0+IHtcbiAgY29uc3QgY2h1bmsgPSByZWFkZXIuYnl0ZXMobGVuZ3RoIC0gNClcbiAgcmV0dXJuIG5ldyBDb3B5RGF0YU1lc3NhZ2UoTEFURUlOSVRfTEVOR1RILCBjaHVuaylcbn1cblxuY29uc3QgcGFyc2VDb3B5SW5NZXNzYWdlID0gKHJlYWRlcjogQnVmZmVyUmVhZGVyKSA9PiBwYXJzZUNvcHlNZXNzYWdlKHJlYWRlciwgJ2NvcHlJblJlc3BvbnNlJylcblxuY29uc3QgcGFyc2VDb3B5T3V0TWVzc2FnZSA9IChyZWFkZXI6IEJ1ZmZlclJlYWRlcikgPT4gcGFyc2VDb3B5TWVzc2FnZShyZWFkZXIsICdjb3B5T3V0UmVzcG9uc2UnKVxuXG5jb25zdCBwYXJzZUNvcHlNZXNzYWdlID0gKHJlYWRlcjogQnVmZmVyUmVhZGVyLCBtZXNzYWdlTmFtZTogTWVzc2FnZU5hbWUpID0+IHtcbiAgY29uc3QgaXNCaW5hcnkgPSByZWFkZXIuYnl0ZSgpICE9PSAwXG4gIGNvbnN0IGNvbHVtbkNvdW50ID0gcmVhZGVyLmludDE2KClcbiAgY29uc3QgbWVzc2FnZSA9IG5ldyBDb3B5UmVzcG9uc2UoTEFURUlOSVRfTEVOR1RILCBtZXNzYWdlTmFtZSwgaXNCaW5hcnksIGNvbHVtbkNvdW50KVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbkNvdW50OyBpKyspIHtcbiAgICBtZXNzYWdlLmNvbHVtblR5cGVzW2ldID0gcmVhZGVyLmludDE2KClcbiAgfVxuICByZXR1cm4gbWVzc2FnZVxufVxuXG5jb25zdCBwYXJzZU5vdGlmaWNhdGlvbk1lc3NhZ2UgPSAocmVhZGVyOiBCdWZmZXJSZWFkZXIpID0+IHtcbiAgY29uc3QgcHJvY2Vzc0lkID0gcmVhZGVyLmludDMyKClcbiAgY29uc3QgY2hhbm5lbCA9IHJlYWRlci5jc3RyaW5nKClcbiAgY29uc3QgcGF5bG9hZCA9IHJlYWRlci5jc3RyaW5nKClcbiAgcmV0dXJuIG5ldyBOb3RpZmljYXRpb25SZXNwb25zZU1lc3NhZ2UoTEFURUlOSVRfTEVOR1RILCBwcm9jZXNzSWQsIGNoYW5uZWwsIHBheWxvYWQpXG59XG5cbmNvbnN0IHBhcnNlUm93RGVzY3JpcHRpb25NZXNzYWdlID0gKHJlYWRlcjogQnVmZmVyUmVhZGVyKSA9PiB7XG4gIGNvbnN0IGZpZWxkQ291bnQgPSByZWFkZXIuaW50MTYoKVxuICBjb25zdCBtZXNzYWdlID0gbmV3IFJvd0Rlc2NyaXB0aW9uTWVzc2FnZShMQVRFSU5JVF9MRU5HVEgsIGZpZWxkQ291bnQpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZmllbGRDb3VudDsgaSsrKSB7XG4gICAgbWVzc2FnZS5maWVsZHNbaV0gPSBwYXJzZUZpZWxkKHJlYWRlcilcbiAgfVxuICByZXR1cm4gbWVzc2FnZVxufVxuXG5jb25zdCBwYXJzZUZpZWxkID0gKHJlYWRlcjogQnVmZmVyUmVhZGVyKSA9PiB7XG4gIGNvbnN0IG5hbWUgPSByZWFkZXIuY3N0cmluZygpXG4gIGNvbnN0IHRhYmxlSUQgPSByZWFkZXIudWludDMyKClcbiAgY29uc3QgY29sdW1uSUQgPSByZWFkZXIuaW50MTYoKVxuICBjb25zdCBkYXRhVHlwZUlEID0gcmVhZGVyLnVpbnQzMigpXG4gIGNvbnN0IGRhdGFUeXBlU2l6ZSA9IHJlYWRlci5pbnQxNigpXG4gIGNvbnN0IGRhdGFUeXBlTW9kaWZpZXIgPSByZWFkZXIuaW50MzIoKVxuICBjb25zdCBtb2RlID0gcmVhZGVyLmludDE2KCkgPT09IDAgPyAndGV4dCcgOiAnYmluYXJ5J1xuICByZXR1cm4gbmV3IEZpZWxkKG5hbWUsIHRhYmxlSUQsIGNvbHVtbklELCBkYXRhVHlwZUlELCBkYXRhVHlwZVNpemUsIGRhdGFUeXBlTW9kaWZpZXIsIG1vZGUpXG59XG5cbmNvbnN0IHBhcnNlUGFyYW1ldGVyRGVzY3JpcHRpb25NZXNzYWdlID0gKHJlYWRlcjogQnVmZmVyUmVhZGVyKSA9PiB7XG4gIGNvbnN0IHBhcmFtZXRlckNvdW50ID0gcmVhZGVyLmludDE2KClcbiAgY29uc3QgbWVzc2FnZSA9IG5ldyBQYXJhbWV0ZXJEZXNjcmlwdGlvbk1lc3NhZ2UoTEFURUlOSVRfTEVOR1RILCBwYXJhbWV0ZXJDb3VudClcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJhbWV0ZXJDb3VudDsgaSsrKSB7XG4gICAgbWVzc2FnZS5kYXRhVHlwZUlEc1tpXSA9IHJlYWRlci5pbnQzMigpXG4gIH1cbiAgcmV0dXJuIG1lc3NhZ2Vcbn1cblxuY29uc3QgcGFyc2VEYXRhUm93TWVzc2FnZSA9IChyZWFkZXI6IEJ1ZmZlclJlYWRlcikgPT4ge1xuICBjb25zdCBmaWVsZENvdW50ID0gcmVhZGVyLmludDE2KClcbiAgY29uc3QgZmllbGRzOiBhbnlbXSA9IG5ldyBBcnJheShmaWVsZENvdW50KVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkQ291bnQ7IGkrKykge1xuICAgIGNvbnN0IGxlbiA9IHJlYWRlci5pbnQzMigpXG4gICAgLy8gYSAtMSBmb3IgbGVuZ3RoIG1lYW5zIHRoZSB2YWx1ZSBvZiB0aGUgZmllbGQgaXMgbnVsbFxuICAgIGZpZWxkc1tpXSA9IGxlbiA9PT0gLTEgPyBudWxsIDogcmVhZGVyLnN0cmluZyhsZW4pXG4gIH1cbiAgcmV0dXJuIG5ldyBEYXRhUm93TWVzc2FnZShMQVRFSU5JVF9MRU5HVEgsIGZpZWxkcylcbn1cblxuY29uc3QgcGFyc2VQYXJhbWV0ZXJTdGF0dXNNZXNzYWdlID0gKHJlYWRlcjogQnVmZmVyUmVhZGVyKSA9PiB7XG4gIGNvbnN0IG5hbWUgPSByZWFkZXIuY3N0cmluZygpXG4gIGNvbnN0IHZhbHVlID0gcmVhZGVyLmNzdHJpbmcoKVxuICByZXR1cm4gbmV3IFBhcmFtZXRlclN0YXR1c01lc3NhZ2UoTEFURUlOSVRfTEVOR1RILCBuYW1lLCB2YWx1ZSlcbn1cblxuY29uc3QgcGFyc2VCYWNrZW5kS2V5RGF0YSA9IChyZWFkZXI6IEJ1ZmZlclJlYWRlcikgPT4ge1xuICBjb25zdCBwcm9jZXNzSUQgPSByZWFkZXIuaW50MzIoKVxuICBjb25zdCBzZWNyZXRLZXkgPSByZWFkZXIuaW50MzIoKVxuICByZXR1cm4gbmV3IEJhY2tlbmRLZXlEYXRhTWVzc2FnZShMQVRFSU5JVF9MRU5HVEgsIHByb2Nlc3NJRCwgc2VjcmV0S2V5KVxufVxuXG5jb25zdCBwYXJzZUF1dGhlbnRpY2F0aW9uUmVzcG9uc2UgPSAocmVhZGVyOiBCdWZmZXJSZWFkZXIsIGxlbmd0aDogbnVtYmVyKSA9PiB7XG4gIGNvbnN0IGNvZGUgPSByZWFkZXIuaW50MzIoKVxuICAvLyBUT0RPKGJtYyk6IG1heWJlIGJldHRlciB0eXBlcyBoZXJlXG4gIGNvbnN0IG1lc3NhZ2U6IEJhY2tlbmRNZXNzYWdlICYgYW55ID0ge1xuICAgIG5hbWU6ICdhdXRoZW50aWNhdGlvbk9rJyxcbiAgICBsZW5ndGgsXG4gIH1cblxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlIDA6IC8vIEF1dGhlbnRpY2F0aW9uT2tcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAzOiAvLyBBdXRoZW50aWNhdGlvbkNsZWFydGV4dFBhc3N3b3JkXG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggPT09IDgpIHtcbiAgICAgICAgbWVzc2FnZS5uYW1lID0gJ2F1dGhlbnRpY2F0aW9uQ2xlYXJ0ZXh0UGFzc3dvcmQnXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgNTogLy8gQXV0aGVudGljYXRpb25NRDVQYXNzd29yZFxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoID09PSAxMikge1xuICAgICAgICBtZXNzYWdlLm5hbWUgPSAnYXV0aGVudGljYXRpb25NRDVQYXNzd29yZCdcbiAgICAgICAgY29uc3Qgc2FsdCA9IHJlYWRlci5ieXRlcyg0KVxuICAgICAgICByZXR1cm4gbmV3IEF1dGhlbnRpY2F0aW9uTUQ1UGFzc3dvcmQoTEFURUlOSVRfTEVOR1RILCBzYWx0KVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDEwOiAvLyBBdXRoZW50aWNhdGlvblNBU0xcbiAgICAgIHtcbiAgICAgICAgbWVzc2FnZS5uYW1lID0gJ2F1dGhlbnRpY2F0aW9uU0FTTCdcbiAgICAgICAgbWVzc2FnZS5tZWNoYW5pc21zID0gW11cbiAgICAgICAgbGV0IG1lY2hhbmlzbTogc3RyaW5nXG4gICAgICAgIGRvIHtcbiAgICAgICAgICBtZWNoYW5pc20gPSByZWFkZXIuY3N0cmluZygpXG4gICAgICAgICAgaWYgKG1lY2hhbmlzbSkge1xuICAgICAgICAgICAgbWVzc2FnZS5tZWNoYW5pc21zLnB1c2gobWVjaGFuaXNtKVxuICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAobWVjaGFuaXNtKVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDExOiAvLyBBdXRoZW50aWNhdGlvblNBU0xDb250aW51ZVxuICAgICAgbWVzc2FnZS5uYW1lID0gJ2F1dGhlbnRpY2F0aW9uU0FTTENvbnRpbnVlJ1xuICAgICAgbWVzc2FnZS5kYXRhID0gcmVhZGVyLnN0cmluZyhsZW5ndGggLSA4KVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDEyOiAvLyBBdXRoZW50aWNhdGlvblNBU0xGaW5hbFxuICAgICAgbWVzc2FnZS5uYW1lID0gJ2F1dGhlbnRpY2F0aW9uU0FTTEZpbmFsJ1xuICAgICAgbWVzc2FnZS5kYXRhID0gcmVhZGVyLnN0cmluZyhsZW5ndGggLSA4KVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGF1dGhlbnRpY2F0aW9uT2sgbWVzc2FnZSB0eXBlICcgKyBjb2RlKVxuICB9XG4gIHJldHVybiBtZXNzYWdlXG59XG5cbmNvbnN0IHBhcnNlRXJyb3JNZXNzYWdlID0gKHJlYWRlcjogQnVmZmVyUmVhZGVyLCBuYW1lOiBNZXNzYWdlTmFtZSkgPT4ge1xuICBjb25zdCBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxuICBsZXQgZmllbGRUeXBlID0gcmVhZGVyLnN0cmluZygxKVxuICB3aGlsZSAoZmllbGRUeXBlICE9PSAnXFwwJykge1xuICAgIGZpZWxkc1tmaWVsZFR5cGVdID0gcmVhZGVyLmNzdHJpbmcoKVxuICAgIGZpZWxkVHlwZSA9IHJlYWRlci5zdHJpbmcoMSlcbiAgfVxuXG4gIGNvbnN0IG1lc3NhZ2VWYWx1ZSA9IGZpZWxkcy5NXG5cbiAgY29uc3QgbWVzc2FnZSA9XG4gICAgbmFtZSA9PT0gJ25vdGljZSdcbiAgICAgID8gbmV3IE5vdGljZU1lc3NhZ2UoTEFURUlOSVRfTEVOR1RILCBtZXNzYWdlVmFsdWUpXG4gICAgICA6IG5ldyBEYXRhYmFzZUVycm9yKG1lc3NhZ2VWYWx1ZSwgTEFURUlOSVRfTEVOR1RILCBuYW1lKVxuXG4gIG1lc3NhZ2Uuc2V2ZXJpdHkgPSBmaWVsZHMuU1xuICBtZXNzYWdlLmNvZGUgPSBmaWVsZHMuQ1xuICBtZXNzYWdlLmRldGFpbCA9IGZpZWxkcy5EXG4gIG1lc3NhZ2UuaGludCA9IGZpZWxkcy5IXG4gIG1lc3NhZ2UucG9zaXRpb24gPSBmaWVsZHMuUFxuICBtZXNzYWdlLmludGVybmFsUG9zaXRpb24gPSBmaWVsZHMucFxuICBtZXNzYWdlLmludGVybmFsUXVlcnkgPSBmaWVsZHMucVxuICBtZXNzYWdlLndoZXJlID0gZmllbGRzLldcbiAgbWVzc2FnZS5zY2hlbWEgPSBmaWVsZHMuc1xuICBtZXNzYWdlLnRhYmxlID0gZmllbGRzLnRcbiAgbWVzc2FnZS5jb2x1bW4gPSBmaWVsZHMuY1xuICBtZXNzYWdlLmRhdGFUeXBlID0gZmllbGRzLmRcbiAgbWVzc2FnZS5jb25zdHJhaW50ID0gZmllbGRzLm5cbiAgbWVzc2FnZS5maWxlID0gZmllbGRzLkZcbiAgbWVzc2FnZS5saW5lID0gZmllbGRzLkxcbiAgbWVzc2FnZS5yb3V0aW5lID0gZmllbGRzLlJcbiAgcmV0dXJuIG1lc3NhZ2Vcbn1cbiIsICJpbXBvcnQgeyBEYXRhYmFzZUVycm9yIH0gZnJvbSAnLi9tZXNzYWdlcydcbmltcG9ydCB7IHNlcmlhbGl6ZSB9IGZyb20gJy4vc2VyaWFsaXplcidcbmltcG9ydCB7IFBhcnNlciwgTWVzc2FnZUNhbGxiYWNrIH0gZnJvbSAnLi9wYXJzZXInXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzdHJlYW06IE5vZGVKUy5SZWFkYWJsZVN0cmVhbSwgY2FsbGJhY2s6IE1lc3NhZ2VDYWxsYmFjayk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKClcbiAgc3RyZWFtLm9uKCdkYXRhJywgKGJ1ZmZlcjogQnVmZmVyKSA9PiBwYXJzZXIucGFyc2UoYnVmZmVyLCBjYWxsYmFjaykpXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc3RyZWFtLm9uKCdlbmQnLCAoKSA9PiByZXNvbHZlKCkpKVxufVxuXG5leHBvcnQgeyBzZXJpYWxpemUsIERhdGFiYXNlRXJyb3IgfVxuIiwgIi8vIFRoaXMgaXMgYW4gZW1wdHkgbW9kdWxlIHRoYXQgaXMgc2VydmVkIHVwIHdoZW4gb3V0c2lkZSBvZiBhIHdvcmtlcmQgZW52aXJvbm1lbnRcbi8vIFNlZSB0aGUgYGV4cG9ydHNgIGZpZWxkIGluIHBhY2thZ2UuanNvblxuZXhwb3J0IGRlZmF1bHQge31cbiIsICJjb25zdCB7IGdldFN0cmVhbSwgZ2V0U2VjdXJlU3RyZWFtIH0gPSBnZXRTdHJlYW1GdW5jcygpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAqIEdldCBhIHNvY2tldCBzdHJlYW0gY29tcGF0aWJsZSB3aXRoIHRoZSBjdXJyZW50IHJ1bnRpbWUgZW52aXJvbm1lbnQuXG4gICAqIEByZXR1cm5zIHtEdXBsZXh9XG4gICAqLyBnZXRTdHJlYW0sXG4gICAgLyoqXG4gICAqIEdldCBhIFRMUyBzZWN1cmVkIHNvY2tldCwgY29tcGF0aWJsZSB3aXRoIHRoZSBjdXJyZW50IGVudmlyb25tZW50LFxuICAgKiB1c2luZyB0aGUgc29ja2V0IGFuZCBvdGhlciBzZXR0aW5ncyBnaXZlbiBpbiBgb3B0aW9uc2AuXG4gICAqIEByZXR1cm5zIHtEdXBsZXh9XG4gICAqLyBnZXRTZWN1cmVTdHJlYW1cbn07XG4vKipcbiAqIFRoZSBzdHJlYW0gZnVuY3Rpb25zIHRoYXQgd29yayBpbiBOb2RlLmpzXG4gKi8gZnVuY3Rpb24gZ2V0Tm9kZWpzU3RyZWFtRnVuY3MoKSB7XG4gICAgZnVuY3Rpb24gZ2V0U3RyZWFtKHNzbCkge1xuICAgICAgICBjb25zdCBuZXQgPSByZXF1aXJlKCduZXQnKTtcbiAgICAgICAgcmV0dXJuIG5ldyBuZXQuU29ja2V0KCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldFNlY3VyZVN0cmVhbShvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHRscyA9IHJlcXVpcmUoJ3RscycpO1xuICAgICAgICByZXR1cm4gdGxzLmNvbm5lY3Qob3B0aW9ucyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0cmVhbSxcbiAgICAgICAgZ2V0U2VjdXJlU3RyZWFtXG4gICAgfTtcbn1cbi8qKlxuICogVGhlIHN0cmVhbSBmdW5jdGlvbnMgdGhhdCB3b3JrIGluIENsb3VkZmxhcmUgV29ya2Vyc1xuICovIGZ1bmN0aW9uIGdldENsb3VkZmxhcmVTdHJlYW1GdW5jcygpIHtcbiAgICBmdW5jdGlvbiBnZXRTdHJlYW0oc3NsKSB7XG4gICAgICAgIGNvbnN0IHsgQ2xvdWRmbGFyZVNvY2tldCB9ID0gcmVxdWlyZSgncGctY2xvdWRmbGFyZScpO1xuICAgICAgICByZXR1cm4gbmV3IENsb3VkZmxhcmVTb2NrZXQoc3NsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0U2VjdXJlU3RyZWFtKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucy5zb2NrZXQuc3RhcnRUbHMob3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBvcHRpb25zLnNvY2tldDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3RyZWFtLFxuICAgICAgICBnZXRTZWN1cmVTdHJlYW1cbiAgICB9O1xufVxuLyoqXG4gKiBBcmUgd2UgcnVubmluZyBpbiBhIENsb3VkZmxhcmUgV29ya2VyP1xuICpcbiAqIEByZXR1cm5zIHRydWUgaWYgdGhlIGNvZGUgaXMgY3VycmVudGx5IHJ1bm5pbmcgaW5zaWRlIGEgQ2xvdWRmbGFyZSBXb3JrZXIuXG4gKi8gZnVuY3Rpb24gaXNDbG91ZGZsYXJlUnVudGltZSgpIHtcbiAgICAvLyBTaW5jZSAyMDIyLTAzLTIxIHRoZSBgZ2xvYmFsX25hdmlnYXRvcmAgY29tcGF0aWJpbGl0eSBmbGFnIGlzIG9uIGZvciBDbG91ZGZsYXJlIFdvcmtlcnNcbiAgICAvLyB3aGljaCBtZWFucyB0aGF0IGBuYXZpZ2F0b3IudXNlckFnZW50YCB3aWxsIGJlIGRlZmluZWQuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICdvYmplY3QnICYmIG5hdmlnYXRvciAhPT0gbnVsbCAmJiB0eXBlb2YgbmF2aWdhdG9yLnVzZXJBZ2VudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50ID09PSAnQ2xvdWRmbGFyZS1Xb3JrZXJzJztcbiAgICB9XG4gICAgLy8gSW4gY2FzZSBgbmF2aWdhdG9yYCBvciBgbmF2aWdhdG9yLnVzZXJBZ2VudGAgaXMgbm90IGRlZmluZWQgdGhlbiB0cnkgYSBtb3JlIHNuZWFreSBhcHByb2FjaFxuICAgIGlmICh0eXBlb2YgUmVzcG9uc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc3QgcmVzcCA9IG5ldyBSZXNwb25zZShudWxsLCB7XG4gICAgICAgICAgICBjZjoge1xuICAgICAgICAgICAgICAgIHRoaW5nOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodHlwZW9mIHJlc3AuY2YgPT09ICdvYmplY3QnICYmIHJlc3AuY2YgIT09IG51bGwgJiYgcmVzcC5jZi50aGluZykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gZ2V0U3RyZWFtRnVuY3MoKSB7XG4gICAgaWYgKGlzQ2xvdWRmbGFyZVJ1bnRpbWUoKSkge1xuICAgICAgICByZXR1cm4gZ2V0Q2xvdWRmbGFyZVN0cmVhbUZ1bmNzKCk7XG4gICAgfVxuICAgIHJldHVybiBnZXROb2RlanNTdHJlYW1GdW5jcygpO1xufVxuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbmNvbnN0IHsgcGFyc2UsIHNlcmlhbGl6ZSB9ID0gcmVxdWlyZSgncGctcHJvdG9jb2wnKTtcbmNvbnN0IHN0cmVhbSA9IHJlcXVpcmUoJy4vc3RyZWFtJyk7XG5jb25zdCB7IGdldFN0cmVhbSB9ID0gc3RyZWFtO1xuY29uc3QgZmx1c2hCdWZmZXIgPSBzZXJpYWxpemUuZmx1c2goKTtcbmNvbnN0IHN5bmNCdWZmZXIgPSBzZXJpYWxpemUuc3luYygpO1xuY29uc3QgZW5kQnVmZmVyID0gc2VyaWFsaXplLmVuZCgpO1xuLy8gVE9ETyhibWMpIHN1cHBvcnQgYmluYXJ5IG1vZGUgYXQgc29tZSBwb2ludFxuY2xhc3MgQ29ubmVjdGlvbiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgICAgICB0aGlzLnN0cmVhbSA9IGNvbmZpZy5zdHJlYW0gfHwgZ2V0U3RyZWFtKGNvbmZpZy5zc2wpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuc3RyZWFtID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnN0cmVhbSA9IHRoaXMuc3RyZWFtKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fa2VlcEFsaXZlID0gY29uZmlnLmtlZXBBbGl2ZTtcbiAgICAgICAgdGhpcy5fa2VlcEFsaXZlSW5pdGlhbERlbGF5TWlsbGlzID0gY29uZmlnLmtlZXBBbGl2ZUluaXRpYWxEZWxheU1pbGxpcztcbiAgICAgICAgdGhpcy5wYXJzZWRTdGF0ZW1lbnRzID0ge307XG4gICAgICAgIHRoaXMuc3NsID0gY29uZmlnLnNzbCB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5zc2xOZWdvdGlhdGlvbiA9IGNvbmZpZy5zc2xOZWdvdGlhdGlvbiB8fCAncG9zdGdyZXMnO1xuICAgICAgICB0aGlzLl9lbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZW1pdE1lc3NhZ2UgPSBmYWxzZTtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMub24oJ25ld0xpc3RlbmVyJywgZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnROYW1lID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9lbWl0TWVzc2FnZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb25uZWN0KHBvcnQsIGhvc3QpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0cmVhbS5zZXROb0RlbGF5KHRydWUpO1xuICAgICAgICB0aGlzLnN0cmVhbS5jb25uZWN0KHBvcnQsIGhvc3QpO1xuICAgICAgICB0aGlzLnN0cmVhbS5vbmNlKCdjb25uZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5fa2VlcEFsaXZlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdHJlYW0uc2V0S2VlcEFsaXZlKHRydWUsIHNlbGYuX2tlZXBBbGl2ZUluaXRpYWxEZWxheU1pbGxpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlcG9ydFN0cmVhbUVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIGVycm9ycyBhYm91dCBkaXNjb25uZWN0aW9ucyBzaG91bGQgYmUgaWdub3JlZCBkdXJpbmcgZGlzY29ubmVjdFxuICAgICAgICAgICAgaWYgKHNlbGYuX2VuZGluZyAmJiAoZXJyb3IuY29kZSA9PT0gJ0VDT05OUkVTRVQnIHx8IGVycm9yLmNvZGUgPT09ICdFUElQRScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5lbWl0KCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zdHJlYW0ub24oJ2Vycm9yJywgcmVwb3J0U3RyZWFtRXJyb3IpO1xuICAgICAgICB0aGlzLnN0cmVhbS5vbignY2xvc2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXRoaXMuc3NsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2hMaXN0ZW5lcnModGhpcy5zdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdpdGggZGlyZWN0IFNTTCBuZWdvdGlhdGlvbiB0aGUgVExTIGhhbmRzaGFrZSBzdGFydHMgaW1tZWRpYXRlbHkgb24gdGhlXG4gICAgICAgIC8vIHJhdyBzb2NrZXQsIHNraXBwaW5nIHRoZSBTU0xSZXF1ZXN0IHBhY2tldCBhbmQgdGhlIHNlcnZlcidzICdTJy8nTicgcmVwbHkuXG4gICAgICAgIGlmICh0aGlzLnNzbE5lZ290aWF0aW9uID09PSAnZGlyZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RyZWFtLm9uY2UoJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVwZ3JhZGVUb1NTTChob3N0LCByZXBvcnRTdHJlYW1FcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0cmVhbS5vbmNlKCdkYXRhJywgZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZUNvZGUgPSBidWZmZXIudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgIHN3aXRjaChyZXNwb25zZUNvZGUpe1xuICAgICAgICAgICAgICAgIGNhc2UgJ1MnOlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdOJzpcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zdHJlYW0uZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdUaGUgc2VydmVyIGRvZXMgbm90IHN1cHBvcnQgU1NMIGNvbm5lY3Rpb25zJykpO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIEFueSBvdGhlciByZXNwb25zZSBieXRlLCBpbmNsdWRpbmcgJ0UnIChFcnJvclJlc3BvbnNlKSBpbmRpY2F0aW5nIGEgc2VydmVyIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc3RyZWFtLmVuZCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignVGhlcmUgd2FzIGFuIGVycm9yIGVzdGFibGlzaGluZyBhbiBTU0wgY29ubmVjdGlvbicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYudXBncmFkZVRvU1NMKGhvc3QsIHJlcG9ydFN0cmVhbUVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHVwZ3JhZGVUb1NTTChob3N0LCByZXBvcnRTdHJlYW1FcnJvcikge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHNvY2tldDogc2VsZi5zdHJlYW1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHNlbGYuc3NsICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKG9wdGlvbnMsIHNlbGYuc3NsKTtcbiAgICAgICAgICAgIGlmICgna2V5JyBpbiBzZWxmLnNzbCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMua2V5ID0gc2VsZi5zc2wua2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIERpcmVjdCBTU0wgbmVnb3RpYXRpb24gcmVxdWlyZXMgQUxQTiBzbyB0aGUgc2VydmVyIGNhbiBjb25maXJtIGl0IGlzXG4gICAgICAgIC8vIHNwZWFraW5nIHRoZSBQb3N0Z3JlU1FMIHByb3RvY29sIG92ZXIgdGhlIFRMUyBjb25uZWN0aW9uLlxuICAgICAgICBpZiAoc2VsZi5zc2xOZWdvdGlhdGlvbiA9PT0gJ2RpcmVjdCcpIHtcbiAgICAgICAgICAgIG9wdGlvbnMuQUxQTlByb3RvY29scyA9IFtcbiAgICAgICAgICAgICAgICAncG9zdGdyZXNxbCdcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV0ID0gcmVxdWlyZSgnbmV0Jyk7XG4gICAgICAgIGlmIChuZXQuaXNJUCAmJiBuZXQuaXNJUChob3N0KSA9PT0gMCkge1xuICAgICAgICAgICAgb3B0aW9ucy5zZXJ2ZXJuYW1lID0gaG9zdDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2VsZi5zdHJlYW0gPSBzdHJlYW0uZ2V0U2VjdXJlU3RyZWFtKG9wdGlvbnMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmF0dGFjaExpc3RlbmVycyhzZWxmLnN0cmVhbSk7XG4gICAgICAgIHNlbGYuc3RyZWFtLm9uKCdlcnJvcicsIHJlcG9ydFN0cmVhbUVycm9yKTtcbiAgICAgICAgc2VsZi5lbWl0KCdzc2xjb25uZWN0Jyk7XG4gICAgfVxuICAgIGF0dGFjaExpc3RlbmVycyhzdHJlYW0pIHtcbiAgICAgICAgcGFyc2Uoc3RyZWFtLCAobXNnKT0+e1xuICAgICAgICAgICAgY29uc3QgZXZlbnROYW1lID0gbXNnLm5hbWUgPT09ICdlcnJvcicgPyAnZXJyb3JNZXNzYWdlJyA6IG1zZy5uYW1lO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2VtaXRNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgbXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZW1pdChldmVudE5hbWUsIG1zZyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXF1ZXN0U3NsKCkge1xuICAgICAgICB0aGlzLnN0cmVhbS53cml0ZShzZXJpYWxpemUucmVxdWVzdFNzbCgpKTtcbiAgICB9XG4gICAgc3RhcnR1cChjb25maWcpIHtcbiAgICAgICAgdGhpcy5zdHJlYW0ud3JpdGUoc2VyaWFsaXplLnN0YXJ0dXAoY29uZmlnKSk7XG4gICAgfVxuICAgIGNhbmNlbChwcm9jZXNzSUQsIHNlY3JldEtleSkge1xuICAgICAgICB0aGlzLl9zZW5kKHNlcmlhbGl6ZS5jYW5jZWwocHJvY2Vzc0lELCBzZWNyZXRLZXkpKTtcbiAgICB9XG4gICAgcGFzc3dvcmQocGFzc3dvcmQpIHtcbiAgICAgICAgdGhpcy5fc2VuZChzZXJpYWxpemUucGFzc3dvcmQocGFzc3dvcmQpKTtcbiAgICB9XG4gICAgc2VuZFNBU0xJbml0aWFsUmVzcG9uc2VNZXNzYWdlKG1lY2hhbmlzbSwgaW5pdGlhbFJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMuX3NlbmQoc2VyaWFsaXplLnNlbmRTQVNMSW5pdGlhbFJlc3BvbnNlTWVzc2FnZShtZWNoYW5pc20sIGluaXRpYWxSZXNwb25zZSkpO1xuICAgIH1cbiAgICBzZW5kU0NSQU1DbGllbnRGaW5hbE1lc3NhZ2UoYWRkaXRpb25hbERhdGEpIHtcbiAgICAgICAgdGhpcy5fc2VuZChzZXJpYWxpemUuc2VuZFNDUkFNQ2xpZW50RmluYWxNZXNzYWdlKGFkZGl0aW9uYWxEYXRhKSk7XG4gICAgfVxuICAgIF9zZW5kKGJ1ZmZlcikge1xuICAgICAgICBpZiAoIXRoaXMuc3RyZWFtLndyaXRhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyZWFtLndyaXRlKGJ1ZmZlcik7XG4gICAgfVxuICAgIHF1ZXJ5KHRleHQpIHtcbiAgICAgICAgdGhpcy5fc2VuZChzZXJpYWxpemUucXVlcnkodGV4dCkpO1xuICAgIH1cbiAgICAvLyBzZW5kIHBhcnNlIG1lc3NhZ2VcbiAgICBwYXJzZShxdWVyeSkge1xuICAgICAgICB0aGlzLl9zZW5kKHNlcmlhbGl6ZS5wYXJzZShxdWVyeSkpO1xuICAgIH1cbiAgICAvLyBzZW5kIGJpbmQgbWVzc2FnZVxuICAgIGJpbmQoY29uZmlnKSB7XG4gICAgICAgIHRoaXMuX3NlbmQoc2VyaWFsaXplLmJpbmQoY29uZmlnKSk7XG4gICAgfVxuICAgIC8vIHNlbmQgZXhlY3V0ZSBtZXNzYWdlXG4gICAgZXhlY3V0ZShjb25maWcpIHtcbiAgICAgICAgdGhpcy5fc2VuZChzZXJpYWxpemUuZXhlY3V0ZShjb25maWcpKTtcbiAgICB9XG4gICAgZmx1c2goKSB7XG4gICAgICAgIGlmICh0aGlzLnN0cmVhbS53cml0YWJsZSkge1xuICAgICAgICAgICAgdGhpcy5zdHJlYW0ud3JpdGUoZmx1c2hCdWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN5bmMoKSB7XG4gICAgICAgIHRoaXMuX2VuZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX3NlbmQoc3luY0J1ZmZlcik7XG4gICAgfVxuICAgIHJlZigpIHtcbiAgICAgICAgdGhpcy5zdHJlYW0ucmVmKCk7XG4gICAgfVxuICAgIHVucmVmKCkge1xuICAgICAgICB0aGlzLnN0cmVhbS51bnJlZigpO1xuICAgIH1cbiAgICBlbmQoKSB7XG4gICAgICAgIC8vIDB4NTggPSAnWCdcbiAgICAgICAgdGhpcy5fZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgaWYgKCF0aGlzLl9jb25uZWN0aW5nIHx8ICF0aGlzLnN0cmVhbS53cml0YWJsZSkge1xuICAgICAgICAgICAgdGhpcy5zdHJlYW0uZW5kKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyZWFtLndyaXRlKGVuZEJ1ZmZlciwgKCk9PntcbiAgICAgICAgICAgIHRoaXMuc3RyZWFtLmVuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2xvc2UobXNnKSB7XG4gICAgICAgIHRoaXMuX3NlbmQoc2VyaWFsaXplLmNsb3NlKG1zZykpO1xuICAgIH1cbiAgICBkZXNjcmliZShtc2cpIHtcbiAgICAgICAgdGhpcy5fc2VuZChzZXJpYWxpemUuZGVzY3JpYmUobXNnKSk7XG4gICAgfVxuICAgIHNlbmRDb3B5RnJvbUNodW5rKGNodW5rKSB7XG4gICAgICAgIHRoaXMuX3NlbmQoc2VyaWFsaXplLmNvcHlEYXRhKGNodW5rKSk7XG4gICAgfVxuICAgIGVuZENvcHlGcm9tKCkge1xuICAgICAgICB0aGlzLl9zZW5kKHNlcmlhbGl6ZS5jb3B5RG9uZSgpKTtcbiAgICB9XG4gICAgc2VuZENvcHlGYWlsKG1zZykge1xuICAgICAgICB0aGlzLl9zZW5kKHNlcmlhbGl6ZS5jb3B5RmFpbChtc2cpKTtcbiAgICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3Rpb247XG4iLCAiLypcbkNvcHlyaWdodCAoYykgMjAxNC0yMDIxLCBNYXR0ZW8gQ29sbGluYSA8aGVsbG9AbWF0dGVvY29sbGluYS5jb20+XG5cblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLCBwcm92aWRlZCB0aGF0IHRoZSBhYm92ZVxuY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBhcHBlYXIgaW4gYWxsIGNvcGllcy5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVNcbldJVEggUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0Zcbk1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SXG5BTlkgU1BFQ0lBTCwgRElSRUNULCBJTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTXG5XSEFUU09FVkVSIFJFU1VMVElORyBGUk9NIExPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU5cbkFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUiBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SXG5JTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUiBQRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxuKi8gJ3VzZSBzdHJpY3QnO1xuY29uc3QgeyBUcmFuc2Zvcm0gfSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuY29uc3QgeyBTdHJpbmdEZWNvZGVyIH0gPSByZXF1aXJlKCdzdHJpbmdfZGVjb2RlcicpO1xuY29uc3Qga0xhc3QgPSBTeW1ib2woJ2xhc3QnKTtcbmNvbnN0IGtEZWNvZGVyID0gU3ltYm9sKCdkZWNvZGVyJyk7XG5mdW5jdGlvbiB0cmFuc2Zvcm0oY2h1bmssIGVuYywgY2IpIHtcbiAgICBsZXQgbGlzdDtcbiAgICBpZiAodGhpcy5vdmVyZmxvdykge1xuICAgICAgICBjb25zdCBidWYgPSB0aGlzW2tEZWNvZGVyXS53cml0ZShjaHVuayk7XG4gICAgICAgIGxpc3QgPSBidWYuc3BsaXQodGhpcy5tYXRjaGVyKTtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSByZXR1cm4gY2IoKSAvLyBMaW5lIGVuZGluZyBub3QgZm91bmQuIERpc2NhcmQgZW50aXJlIGNodW5rLlxuICAgICAgICA7XG4gICAgICAgIC8vIExpbmUgZW5kaW5nIGZvdW5kLiBEaXNjYXJkIHRyYWlsaW5nIGZyYWdtZW50IG9mIHByZXZpb3VzIGxpbmUgYW5kIHJlc2V0IG92ZXJmbG93IHN0YXRlLlxuICAgICAgICBsaXN0LnNoaWZ0KCk7XG4gICAgICAgIHRoaXMub3ZlcmZsb3cgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzW2tMYXN0XSArPSB0aGlzW2tEZWNvZGVyXS53cml0ZShjaHVuayk7XG4gICAgICAgIGxpc3QgPSB0aGlzW2tMYXN0XS5zcGxpdCh0aGlzLm1hdGNoZXIpO1xuICAgIH1cbiAgICB0aGlzW2tMYXN0XSA9IGxpc3QucG9wKCk7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHVzaCh0aGlzLCB0aGlzLm1hcHBlcihsaXN0W2ldKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gY2IoZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMub3ZlcmZsb3cgPSB0aGlzW2tMYXN0XS5sZW5ndGggPiB0aGlzLm1heExlbmd0aDtcbiAgICBpZiAodGhpcy5vdmVyZmxvdyAmJiAhdGhpcy5za2lwT3ZlcmZsb3cpIHtcbiAgICAgICAgY2IobmV3IEVycm9yKCdtYXhpbXVtIGJ1ZmZlciByZWFjaGVkJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNiKCk7XG59XG5mdW5jdGlvbiBmbHVzaChjYikge1xuICAgIC8vIGZvcndhcmQgYW55IGdpYmJlcmlzaCBsZWZ0IGluIHRoZXJlXG4gICAgdGhpc1trTGFzdF0gKz0gdGhpc1trRGVjb2Rlcl0uZW5kKCk7XG4gICAgaWYgKHRoaXNba0xhc3RdKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwdXNoKHRoaXMsIHRoaXMubWFwcGVyKHRoaXNba0xhc3RdKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gY2IoZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNiKCk7XG59XG5mdW5jdGlvbiBwdXNoKHNlbGYsIHZhbCkge1xuICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZWxmLnB1c2godmFsKTtcbiAgICB9XG59XG5mdW5jdGlvbiBub29wKGluY29taW5nKSB7XG4gICAgcmV0dXJuIGluY29taW5nO1xufVxuZnVuY3Rpb24gc3BsaXQobWF0Y2hlciwgbWFwcGVyLCBvcHRpb25zKSB7XG4gICAgLy8gU2V0IGRlZmF1bHRzIGZvciBhbnkgYXJndW1lbnRzIG5vdCBzdXBwbGllZC5cbiAgICBtYXRjaGVyID0gbWF0Y2hlciB8fCAvXFxyP1xcbi87XG4gICAgbWFwcGVyID0gbWFwcGVyIHx8IG5vb3A7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgLy8gVGVzdCBhcmd1bWVudHMgZXhwbGljaXRseS5cbiAgICBzd2l0Y2goYXJndW1lbnRzLmxlbmd0aCl7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIC8vIElmIG1hcHBlciBpcyBvbmx5IGFyZ3VtZW50LlxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXRjaGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgbWFwcGVyID0gbWF0Y2hlcjtcbiAgICAgICAgICAgICAgICBtYXRjaGVyID0gL1xccj9cXG4vO1xuICAgICAgICAgICAgLy8gSWYgb3B0aW9ucyBpcyBvbmx5IGFyZ3VtZW50LlxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWF0Y2hlciA9PT0gJ29iamVjdCcgJiYgIShtYXRjaGVyIGluc3RhbmNlb2YgUmVnRXhwKSAmJiAhbWF0Y2hlcltTeW1ib2wuc3BsaXRdKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IG1hdGNoZXI7XG4gICAgICAgICAgICAgICAgbWF0Y2hlciA9IC9cXHI/XFxuLztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAvLyBJZiBtYXBwZXIgYW5kIG9wdGlvbnMgYXJlIGFyZ3VtZW50cy5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWF0Y2hlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBtYXBwZXI7XG4gICAgICAgICAgICAgICAgbWFwcGVyID0gbWF0Y2hlcjtcbiAgICAgICAgICAgICAgICBtYXRjaGVyID0gL1xccj9cXG4vO1xuICAgICAgICAgICAgLy8gSWYgbWF0Y2hlciBhbmQgb3B0aW9ucyBhcmUgYXJndW1lbnRzLlxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWFwcGVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBtYXBwZXI7XG4gICAgICAgICAgICAgICAgbWFwcGVyID0gbm9vcDtcbiAgICAgICAgICAgIH1cbiAgICB9XG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMpO1xuICAgIG9wdGlvbnMuYXV0b0Rlc3Ryb3kgPSB0cnVlO1xuICAgIG9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIG9wdGlvbnMuZmx1c2ggPSBmbHVzaDtcbiAgICBvcHRpb25zLnJlYWRhYmxlT2JqZWN0TW9kZSA9IHRydWU7XG4gICAgY29uc3Qgc3RyZWFtID0gbmV3IFRyYW5zZm9ybShvcHRpb25zKTtcbiAgICBzdHJlYW1ba0xhc3RdID0gJyc7XG4gICAgc3RyZWFtW2tEZWNvZGVyXSA9IG5ldyBTdHJpbmdEZWNvZGVyKCd1dGY4Jyk7XG4gICAgc3RyZWFtLm1hdGNoZXIgPSBtYXRjaGVyO1xuICAgIHN0cmVhbS5tYXBwZXIgPSBtYXBwZXI7XG4gICAgc3RyZWFtLm1heExlbmd0aCA9IG9wdGlvbnMubWF4TGVuZ3RoO1xuICAgIHN0cmVhbS5za2lwT3ZlcmZsb3cgPSBvcHRpb25zLnNraXBPdmVyZmxvdyB8fCBmYWxzZTtcbiAgICBzdHJlYW0ub3ZlcmZsb3cgPSBmYWxzZTtcbiAgICBzdHJlYW0uX2Rlc3Ryb3kgPSBmdW5jdGlvbihlcnIsIGNiKSB7XG4gICAgICAgIC8vIFdlaXJkIE5vZGUgdjEyIGJ1ZyB0aGF0IHdlIG5lZWQgdG8gd29yayBhcm91bmRcbiAgICAgICAgdGhpcy5fd3JpdGFibGVTdGF0ZS5lcnJvckVtaXR0ZWQgPSBmYWxzZTtcbiAgICAgICAgY2IoZXJyKTtcbiAgICB9O1xuICAgIHJldHVybiBzdHJlYW07XG59XG5tb2R1bGUuZXhwb3J0cyA9IHNwbGl0O1xuIiwgIid1c2Ugc3RyaWN0JztcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpLCBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKS5TdHJlYW0sIHNwbGl0ID0gcmVxdWlyZSgnc3BsaXQyJyksIHV0aWwgPSByZXF1aXJlKCd1dGlsJyksIGRlZmF1bHRQb3J0ID0gNTQzMiwgaXNXaW4gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInLCB3YXJuU3RyZWFtID0gcHJvY2Vzcy5zdGRlcnI7XG52YXIgU19JUldYRyA9IDU2IC8vICAgIDAwMDcwKDgpXG4sIFNfSVJXWE8gPSA3IC8vICAgIDAwMDA3KDgpXG4sIFNfSUZNVCA9IDYxNDQwIC8vIDAwMTcwMDAwKDgpXG4sIFNfSUZSRUcgPSAzMjc2OCAvLyAgMDEwMDAwMCg4KVxuO1xuZnVuY3Rpb24gaXNSZWdGaWxlKG1vZGUpIHtcbiAgICByZXR1cm4gKG1vZGUgJiBTX0lGTVQpID09IFNfSUZSRUc7XG59XG52YXIgZmllbGROYW1lcyA9IFtcbiAgICAnaG9zdCcsXG4gICAgJ3BvcnQnLFxuICAgICdkYXRhYmFzZScsXG4gICAgJ3VzZXInLFxuICAgICdwYXNzd29yZCdcbl07XG52YXIgbnJPZkZpZWxkcyA9IGZpZWxkTmFtZXMubGVuZ3RoO1xudmFyIHBhc3NLZXkgPSBmaWVsZE5hbWVzW25yT2ZGaWVsZHMgLSAxXTtcbmZ1bmN0aW9uIHdhcm4oKSB7XG4gICAgdmFyIGlzV3JpdGFibGUgPSB3YXJuU3RyZWFtIGluc3RhbmNlb2YgU3RyZWFtICYmIHRydWUgPT09IHdhcm5TdHJlYW0ud3JpdGFibGU7XG4gICAgaWYgKGlzV3JpdGFibGUpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmNvbmNhdChcIlxcblwiKTtcbiAgICAgICAgd2FyblN0cmVhbS53cml0ZSh1dGlsLmZvcm1hdC5hcHBseSh1dGlsLCBhcmdzKSk7XG4gICAgfVxufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnaXNXaW4nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGlzV2luO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgaXNXaW4gPSB2YWw7XG4gICAgfVxufSk7XG5tb2R1bGUuZXhwb3J0cy53YXJuVG8gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICB2YXIgb2xkID0gd2FyblN0cmVhbTtcbiAgICB3YXJuU3RyZWFtID0gc3RyZWFtO1xuICAgIHJldHVybiBvbGQ7XG59O1xubW9kdWxlLmV4cG9ydHMuZ2V0RmlsZU5hbWUgPSBmdW5jdGlvbihyYXdFbnYpIHtcbiAgICB2YXIgZW52ID0gcmF3RW52IHx8IHByb2Nlc3MuZW52O1xuICAgIHZhciBmaWxlID0gZW52LlBHUEFTU0ZJTEUgfHwgKGlzV2luID8gcGF0aC5qb2luKGVudi5BUFBEQVRBIHx8ICcuLycsICdwb3N0Z3Jlc3FsJywgJ3BncGFzcy5jb25mJykgOiBwYXRoLmpvaW4oZW52LkhPTUUgfHwgJy4vJywgJy5wZ3Bhc3MnKSk7XG4gICAgcmV0dXJuIGZpbGU7XG59O1xubW9kdWxlLmV4cG9ydHMudXNlUGdQYXNzID0gZnVuY3Rpb24oc3RhdHMsIGZuYW1lKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwcm9jZXNzLmVudiwgJ1BHUEFTU1dPUkQnKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChpc1dpbikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZm5hbWUgPSBmbmFtZSB8fCAnPHVua24+JztcbiAgICBpZiAoIWlzUmVnRmlsZShzdGF0cy5tb2RlKSkge1xuICAgICAgICB3YXJuKCdXQVJOSU5HOiBwYXNzd29yZCBmaWxlIFwiJXNcIiBpcyBub3QgYSBwbGFpbiBmaWxlJywgZm5hbWUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChzdGF0cy5tb2RlICYgKFNfSVJXWEcgfCBTX0lSV1hPKSkge1xuICAgICAgICAvKiBJZiBwYXNzd29yZCBmaWxlIGlzIGluc2VjdXJlLCBhbGVydCB0aGUgdXNlciBhbmQgaWdub3JlIGl0LiAqLyB3YXJuKCdXQVJOSU5HOiBwYXNzd29yZCBmaWxlIFwiJXNcIiBoYXMgZ3JvdXAgb3Igd29ybGQgYWNjZXNzOyBwZXJtaXNzaW9ucyBzaG91bGQgYmUgdT1ydyAoMDYwMCkgb3IgbGVzcycsIGZuYW1lKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG52YXIgbWF0Y2hlciA9IG1vZHVsZS5leHBvcnRzLm1hdGNoID0gZnVuY3Rpb24oY29ubkluZm8sIGVudHJ5KSB7XG4gICAgcmV0dXJuIGZpZWxkTmFtZXMuc2xpY2UoMCwgLTEpLnJlZHVjZShmdW5jdGlvbihwcmV2LCBmaWVsZCwgaWR4KSB7XG4gICAgICAgIGlmIChpZHggPT0gMSkge1xuICAgICAgICAgICAgLy8gdGhlIHBvcnRcbiAgICAgICAgICAgIGlmIChOdW1iZXIoY29ubkluZm9bZmllbGRdIHx8IGRlZmF1bHRQb3J0KSA9PT0gTnVtYmVyKGVudHJ5W2ZpZWxkXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldiAmJiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcmV2ICYmIChlbnRyeVtmaWVsZF0gPT09ICcqJyB8fCBlbnRyeVtmaWVsZF0gPT09IGNvbm5JbmZvW2ZpZWxkXSk7XG4gICAgfSwgdHJ1ZSk7XG59O1xubW9kdWxlLmV4cG9ydHMuZ2V0UGFzc3dvcmQgPSBmdW5jdGlvbihjb25uSW5mbywgc3RyZWFtLCBjYikge1xuICAgIHZhciBwYXNzO1xuICAgIHZhciBsaW5lU3RyZWFtID0gc3RyZWFtLnBpcGUoc3BsaXQoKSk7XG4gICAgZnVuY3Rpb24gb25MaW5lKGxpbmUpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gcGFyc2VMaW5lKGxpbmUpO1xuICAgICAgICBpZiAoZW50cnkgJiYgaXNWYWxpZEVudHJ5KGVudHJ5KSAmJiBtYXRjaGVyKGNvbm5JbmZvLCBlbnRyeSkpIHtcbiAgICAgICAgICAgIHBhc3MgPSBlbnRyeVtwYXNzS2V5XTtcbiAgICAgICAgICAgIGxpbmVTdHJlYW0uZW5kKCk7IC8vIC0+IGNhbGxzIG9uRW5kKCksIGJ1dCBwYXNzIGlzIHNldCBub3dcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgb25FbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLmRlc3Ryb3koKTtcbiAgICAgICAgY2IocGFzcyk7XG4gICAgfTtcbiAgICB2YXIgb25FcnIgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgc3RyZWFtLmRlc3Ryb3koKTtcbiAgICAgICAgd2FybignV0FSTklORzogZXJyb3Igb24gcmVhZGluZyBmaWxlOiAlcycsIGVycik7XG4gICAgICAgIGNiKHVuZGVmaW5lZCk7XG4gICAgfTtcbiAgICBzdHJlYW0ub24oJ2Vycm9yJywgb25FcnIpO1xuICAgIGxpbmVTdHJlYW0ub24oJ2RhdGEnLCBvbkxpbmUpLm9uKCdlbmQnLCBvbkVuZCkub24oJ2Vycm9yJywgb25FcnIpO1xufTtcbnZhciBwYXJzZUxpbmUgPSBtb2R1bGUuZXhwb3J0cy5wYXJzZUxpbmUgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgaWYgKGxpbmUubGVuZ3RoIDwgMTEgfHwgbGluZS5tYXRjaCgvXlxccysjLykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciBjdXJDaGFyID0gJyc7XG4gICAgdmFyIHByZXZDaGFyID0gJyc7XG4gICAgdmFyIGZpZWxkSWR4ID0gMDtcbiAgICB2YXIgc3RhcnRJZHggPSAwO1xuICAgIHZhciBlbmRJZHggPSAwO1xuICAgIHZhciBvYmogPSB7fTtcbiAgICB2YXIgaXNMYXN0RmllbGQgPSBmYWxzZTtcbiAgICB2YXIgYWRkVG9PYmogPSBmdW5jdGlvbihpZHgsIGkwLCBpMSkge1xuICAgICAgICB2YXIgZmllbGQgPSBsaW5lLnN1YnN0cmluZyhpMCwgaTEpO1xuICAgICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb2Nlc3MuZW52LCAnUEdQQVNTX05PX0RFRVNDQVBFJykpIHtcbiAgICAgICAgICAgIGZpZWxkID0gZmllbGQucmVwbGFjZSgvXFxcXChbOlxcXFxdKS9nLCAnJDEnKTtcbiAgICAgICAgfVxuICAgICAgICBvYmpbZmllbGROYW1lc1tpZHhdXSA9IGZpZWxkO1xuICAgIH07XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGxpbmUubGVuZ3RoIC0gMTsgaSArPSAxKXtcbiAgICAgICAgY3VyQ2hhciA9IGxpbmUuY2hhckF0KGkgKyAxKTtcbiAgICAgICAgcHJldkNoYXIgPSBsaW5lLmNoYXJBdChpKTtcbiAgICAgICAgaXNMYXN0RmllbGQgPSBmaWVsZElkeCA9PSBuck9mRmllbGRzIC0gMTtcbiAgICAgICAgaWYgKGlzTGFzdEZpZWxkKSB7XG4gICAgICAgICAgICBhZGRUb09iaihmaWVsZElkeCwgc3RhcnRJZHgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPj0gMCAmJiBjdXJDaGFyID09ICc6JyAmJiBwcmV2Q2hhciAhPT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBhZGRUb09iaihmaWVsZElkeCwgc3RhcnRJZHgsIGkgKyAxKTtcbiAgICAgICAgICAgIHN0YXJ0SWR4ID0gaSArIDI7XG4gICAgICAgICAgICBmaWVsZElkeCArPSAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9iaiA9IE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSBuck9mRmllbGRzID8gb2JqIDogbnVsbDtcbiAgICByZXR1cm4gb2JqO1xufTtcbnZhciBpc1ZhbGlkRW50cnkgPSBtb2R1bGUuZXhwb3J0cy5pc1ZhbGlkRW50cnkgPSBmdW5jdGlvbihlbnRyeSkge1xuICAgIHZhciBydWxlcyA9IHtcbiAgICAgICAgLy8gaG9zdFxuICAgICAgICAwOiBmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICByZXR1cm4geC5sZW5ndGggPiAwO1xuICAgICAgICB9LFxuICAgICAgICAvLyBwb3J0XG4gICAgICAgIDE6IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICAgIGlmICh4ID09PSAnKicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHggPSBOdW1iZXIoeCk7XG4gICAgICAgICAgICByZXR1cm4gaXNGaW5pdGUoeCkgJiYgeCA+IDAgJiYgeCA8IDkwMDcxOTkyNTQ3NDA5OTIgJiYgTWF0aC5mbG9vcih4KSA9PT0geDtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gZGF0YWJhc2VcbiAgICAgICAgMjogZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIHgubGVuZ3RoID4gMDtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gdXNlcm5hbWVcbiAgICAgICAgMzogZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIHgubGVuZ3RoID4gMDtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gcGFzc3dvcmRcbiAgICAgICAgNDogZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIHgubGVuZ3RoID4gMDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZm9yKHZhciBpZHggPSAwOyBpZHggPCBmaWVsZE5hbWVzLmxlbmd0aDsgaWR4ICs9IDEpe1xuICAgICAgICB2YXIgcnVsZSA9IHJ1bGVzW2lkeF07XG4gICAgICAgIHZhciB2YWx1ZSA9IGVudHJ5W2ZpZWxkTmFtZXNbaWR4XV0gfHwgJyc7XG4gICAgICAgIHZhciByZXMgPSBydWxlKHZhbHVlKTtcbiAgICAgICAgaWYgKCFyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyksIGZzID0gcmVxdWlyZSgnZnMnKSwgaGVscGVyID0gcmVxdWlyZSgnLi9oZWxwZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29ubkluZm8sIGNiKSB7XG4gICAgdmFyIGZpbGUgPSBoZWxwZXIuZ2V0RmlsZU5hbWUoKTtcbiAgICBmcy5zdGF0KGZpbGUsIGZ1bmN0aW9uKGVyciwgc3RhdCkge1xuICAgICAgICBpZiAoZXJyIHx8ICFoZWxwZXIudXNlUGdQYXNzKHN0YXQsIGZpbGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gY2IodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3QgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUpO1xuICAgICAgICBoZWxwZXIuZ2V0UGFzc3dvcmQoY29ubkluZm8sIHN0LCBjYik7XG4gICAgfSk7XG59O1xubW9kdWxlLmV4cG9ydHMud2FyblRvID0gaGVscGVyLndhcm5UbztcbiIsICJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbmNvbnN0IG5vZGVVdGlscyA9IHJlcXVpcmUoJ3V0aWwnKTtcbmNvbnN0IHNhc2wgPSByZXF1aXJlKCcuL2NyeXB0by9zYXNsJyk7XG5jb25zdCBUeXBlT3ZlcnJpZGVzID0gcmVxdWlyZSgnLi90eXBlLW92ZXJyaWRlcycpO1xuY29uc3QgQ29ubmVjdGlvblBhcmFtZXRlcnMgPSByZXF1aXJlKCcuL2Nvbm5lY3Rpb24tcGFyYW1ldGVycycpO1xuY29uc3QgUXVlcnkgPSByZXF1aXJlKCcuL3F1ZXJ5Jyk7XG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcbmNvbnN0IENvbm5lY3Rpb24gPSByZXF1aXJlKCcuL2Nvbm5lY3Rpb24nKTtcbmNvbnN0IGNyeXB0byA9IHJlcXVpcmUoJy4vY3J5cHRvL3V0aWxzJyk7XG5jb25zdCBhY3RpdmVRdWVyeURlcHJlY2F0aW9uTm90aWNlID0gbm9kZVV0aWxzLmRlcHJlY2F0ZSgoKT0+e30sICdDbGllbnQuYWN0aXZlUXVlcnkgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHBnQDkuMCcpO1xuY29uc3QgcXVlcnlRdWV1ZURlcHJlY2F0aW9uTm90aWNlID0gbm9kZVV0aWxzLmRlcHJlY2F0ZSgoKT0+e30sICdDbGllbnQucXVlcnlRdWV1ZSBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gcGdAOS4wLicpO1xuY29uc3QgcGdQYXNzRGVwcmVjYXRpb25Ob3RpY2UgPSBub2RlVXRpbHMuZGVwcmVjYXRlKCgpPT57fSwgJ3BncGFzcyBzdXBwb3J0IGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBwZ0A5LjAuICcgKyAnWW91IGNhbiBwcm92aWRlIGFuIGFzeW5jIGZ1bmN0aW9uIGFzIHRoZSBwYXNzd29yZCBwcm9wZXJ0eSB0byB0aGUgQ2xpZW50L1Bvb2wgY29uc3RydWN0b3IgdGhhdCByZXR1cm5zIGEgcGFzc3dvcmQgaW5zdGVhZC4gV2l0aGluIHRoaXMgZnVuY3Rpb24geW91IGNhbiBjYWxsIHRoZSBwZ3Bhc3MgbW9kdWxlIGluIHlvdXIgb3duIGNvZGUuJyk7XG5jb25zdCBieW9Qcm9taXNlRGVwcmVjYXRpb25Ob3RpY2UgPSBub2RlVXRpbHMuZGVwcmVjYXRlKCgpPT57fSwgJ1Bhc3NpbmcgYSBjdXN0b20gUHJvbWlzZSBpbXBsZW1lbnRhdGlvbiB0byB0aGUgQ2xpZW50L1Bvb2wgY29uc3RydWN0b3IgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHBnQDkuMC4nKTtcbmNvbnN0IHF1ZXJ5UXVldWVMZW5ndGhEZXByZWNhdGlvbk5vdGljZSA9IG5vZGVVdGlscy5kZXByZWNhdGUoKCk9Pnt9LCAnQ2FsbGluZyBjbGllbnQucXVlcnkoKSB3aGVuIHRoZSBjbGllbnQgaXMgYWxyZWFkeSBleGVjdXRpbmcgYSBxdWVyeSBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gcGdAOS4wLiBVc2UgYXN5bmMvYXdhaXQgb3IgYW4gZXh0ZXJuYWwgYXN5bmMgZmxvdyBjb250cm9sIG1lY2hhbmlzbSBpbnN0ZWFkLicpO1xuZnVuY3Rpb24gY29lcmNlTnVtYmVyT3JEZWZhdWx0KHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkgIT09ICcnKSB7XG4gICAgICAgIGNvbnN0IG4gPSBOdW1iZXIodmFsdWUpO1xuICAgICAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKG4pID8gbiA6IGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbn1cbmNsYXNzIENsaWVudCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uUGFyYW1ldGVycyA9IG5ldyBDb25uZWN0aW9uUGFyYW1ldGVycyhjb25maWcpO1xuICAgICAgICB0aGlzLnVzZXIgPSB0aGlzLmNvbm5lY3Rpb25QYXJhbWV0ZXJzLnVzZXI7XG4gICAgICAgIHRoaXMuZGF0YWJhc2UgPSB0aGlzLmNvbm5lY3Rpb25QYXJhbWV0ZXJzLmRhdGFiYXNlO1xuICAgICAgICB0aGlzLnBvcnQgPSB0aGlzLmNvbm5lY3Rpb25QYXJhbWV0ZXJzLnBvcnQ7XG4gICAgICAgIHRoaXMuaG9zdCA9IHRoaXMuY29ubmVjdGlvblBhcmFtZXRlcnMuaG9zdDtcbiAgICAgICAgLy8gXCJoaWRpbmdcIiB0aGUgcGFzc3dvcmQgc28gaXQgZG9lc24ndCBzaG93IHVwIGluIHN0YWNrIHRyYWNlc1xuICAgICAgICAvLyBvciBpZiB0aGUgY2xpZW50IGlzIGNvbnNvbGUubG9nZ2VkXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncGFzc3dvcmQnLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHRoaXMuY29ubmVjdGlvblBhcmFtZXRlcnMucGFzc3dvcmRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVwbGljYXRpb24gPSB0aGlzLmNvbm5lY3Rpb25QYXJhbWV0ZXJzLnJlcGxpY2F0aW9uO1xuICAgICAgICBjb25zdCBjID0gY29uZmlnIHx8IHt9O1xuICAgICAgICBpZiAoYy5Qcm9taXNlKSB7XG4gICAgICAgICAgICBieW9Qcm9taXNlRGVwcmVjYXRpb25Ob3RpY2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9Qcm9taXNlID0gYy5Qcm9taXNlIHx8IGdsb2JhbC5Qcm9taXNlO1xuICAgICAgICB0aGlzLl90eXBlcyA9IG5ldyBUeXBlT3ZlcnJpZGVzKGMudHlwZXMpO1xuICAgICAgICB0aGlzLl9lbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZW5kZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbkVycm9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3F1ZXJ5YWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2FjdGl2ZVF1ZXJ5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdHhTdGF0dXMgPSBudWxsO1xuICAgICAgICB0aGlzLmVuYWJsZUNoYW5uZWxCaW5kaW5nID0gQm9vbGVhbihjLmVuYWJsZUNoYW5uZWxCaW5kaW5nKTsgLy8gc2V0IHRydWUgdG8gdXNlIFNDUkFNLVNIQS0yNTYtUExVUyB3aGVuIG9mZmVyZWRcbiAgICAgICAgdGhpcy5zY3JhbU1heEl0ZXJhdGlvbnMgPSBjb2VyY2VOdW1iZXJPckRlZmF1bHQoYy5zY3JhbU1heEl0ZXJhdGlvbnMsIHNhc2wuREVGQVVMVF9NQVhfU0NSQU1fSVRFUkFUSU9OUyk7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbiA9IGMuY29ubmVjdGlvbiB8fCBuZXcgQ29ubmVjdGlvbih7XG4gICAgICAgICAgICBzdHJlYW06IGMuc3RyZWFtLFxuICAgICAgICAgICAgc3NsOiB0aGlzLmNvbm5lY3Rpb25QYXJhbWV0ZXJzLnNzbCxcbiAgICAgICAgICAgIHNzbE5lZ290aWF0aW9uOiB0aGlzLmNvbm5lY3Rpb25QYXJhbWV0ZXJzLnNzbG5lZ290aWF0aW9uLFxuICAgICAgICAgICAga2VlcEFsaXZlOiBjLmtlZXBBbGl2ZSB8fCBmYWxzZSxcbiAgICAgICAgICAgIGtlZXBBbGl2ZUluaXRpYWxEZWxheU1pbGxpczogYy5rZWVwQWxpdmVJbml0aWFsRGVsYXlNaWxsaXMgfHwgMCxcbiAgICAgICAgICAgIGVuY29kaW5nOiB0aGlzLmNvbm5lY3Rpb25QYXJhbWV0ZXJzLmNsaWVudF9lbmNvZGluZyB8fCAndXRmOCdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3F1ZXJ5UXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5iaW5hcnkgPSBjLmJpbmFyeSB8fCBkZWZhdWx0cy5iaW5hcnk7XG4gICAgICAgIHRoaXMucHJvY2Vzc0lEID0gbnVsbDtcbiAgICAgICAgdGhpcy5zZWNyZXRLZXkgPSBudWxsO1xuICAgICAgICB0aGlzLnNzbCA9IHRoaXMuY29ubmVjdGlvblBhcmFtZXRlcnMuc3NsIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLnNzbE5lZ290aWF0aW9uID0gdGhpcy5jb25uZWN0aW9uUGFyYW1ldGVycy5zc2xuZWdvdGlhdGlvbiB8fCAncG9zdGdyZXMnO1xuICAgICAgICAvLyBBcyB3aXRoIFBhc3N3b3JkLCBtYWtlIFNTTC0+S2V5ICh0aGUgcHJpdmF0ZSBrZXkpIG5vbi1lbnVtZXJhYmxlLlxuICAgICAgICAvLyBJdCB3b24ndCBzaG93IHVwIGluIHN0YWNrIHRyYWNlc1xuICAgICAgICAvLyBvciBpZiB0aGUgY2xpZW50IGlzIGNvbnNvbGUubG9nZ2VkXG4gICAgICAgIGlmICh0aGlzLnNzbCAmJiB0aGlzLnNzbC5rZXkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLnNzbCwgJ2tleScsIHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29ubmVjdGlvblRpbWVvdXRNaWxsaXMgPSBjLmNvbm5lY3Rpb25UaW1lb3V0TWlsbGlzIHx8IDA7XG4gICAgfVxuICAgIGdldCBhY3RpdmVRdWVyeSgpIHtcbiAgICAgICAgYWN0aXZlUXVlcnlEZXByZWNhdGlvbk5vdGljZSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlUXVlcnk7XG4gICAgfVxuICAgIHNldCBhY3RpdmVRdWVyeSh2YWwpIHtcbiAgICAgICAgYWN0aXZlUXVlcnlEZXByZWNhdGlvbk5vdGljZSgpO1xuICAgICAgICB0aGlzLl9hY3RpdmVRdWVyeSA9IHZhbDtcbiAgICB9XG4gICAgX2dldEFjdGl2ZVF1ZXJ5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlUXVlcnk7XG4gICAgfVxuICAgIF9lcnJvckFsbFF1ZXJpZXMoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVucXVldWVFcnJvciA9IChxdWVyeSk9PntcbiAgICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soKCk9PntcbiAgICAgICAgICAgICAgICBxdWVyeS5oYW5kbGVFcnJvcihlcnIsIHRoaXMuY29ubmVjdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWN0aXZlUXVlcnkgPSB0aGlzLl9nZXRBY3RpdmVRdWVyeSgpO1xuICAgICAgICBpZiAoYWN0aXZlUXVlcnkpIHtcbiAgICAgICAgICAgIGVucXVldWVFcnJvcihhY3RpdmVRdWVyeSk7XG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVRdWVyeSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcXVlcnlRdWV1ZS5mb3JFYWNoKGVucXVldWVFcnJvcik7XG4gICAgICAgIHRoaXMuX3F1ZXJ5UXVldWUubGVuZ3RoID0gMDtcbiAgICB9XG4gICAgX2Nvbm5lY3QoY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGNvbiA9IHRoaXMuY29ubmVjdGlvbjtcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbkNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIGlmICh0aGlzLl9jb25uZWN0aW5nIHx8IHRoaXMuX2Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKCdDbGllbnQgaGFzIGFscmVhZHkgYmVlbiBjb25uZWN0ZWQuIFlvdSBjYW5ub3QgcmV1c2UgYSBjbGllbnQuJyk7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpPT57XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RpbmcgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5fY29ubmVjdGlvblRpbWVvdXRNaWxsaXMgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25UaW1lb3V0SGFuZGxlID0gc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAgICAgICAgIGNvbi5fZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb24uc3RyZWFtLmRlc3Ryb3kobmV3IEVycm9yKCd0aW1lb3V0IGV4cGlyZWQnKSk7XG4gICAgICAgICAgICB9LCB0aGlzLl9jb25uZWN0aW9uVGltZW91dE1pbGxpcyk7XG4gICAgICAgICAgICBpZiAodGhpcy5jb25uZWN0aW9uVGltZW91dEhhbmRsZS51bnJlZikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvblRpbWVvdXRIYW5kbGUudW5yZWYoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ob3N0ICYmIHRoaXMuaG9zdC5pbmRleE9mKCcvJykgPT09IDApIHtcbiAgICAgICAgICAgIGNvbi5jb25uZWN0KHRoaXMuaG9zdCArICcvLnMuUEdTUUwuJyArIHRoaXMucG9ydCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb24uY29ubmVjdCh0aGlzLnBvcnQsIHRoaXMuaG9zdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gb25jZSBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkIHNlbmQgc3RhcnR1cCBtZXNzYWdlXG4gICAgICAgIGNvbi5vbignY29ubmVjdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuc3NsKSB7XG4gICAgICAgICAgICAgICAgLy8gV2l0aCBkaXJlY3QgU1NMIG5lZ290aWF0aW9uIHRoZSBjb25uZWN0aW9uIHVwZ3JhZGVzIHRvIFRMUyB3aXRob3V0IGFuXG4gICAgICAgICAgICAgICAgLy8gU1NMUmVxdWVzdCBwYWNrZXQsIHNvIHRoZSBzdGFydHVwIG1lc3NhZ2UgaXMgc2VudCBhZnRlciAnc3NsY29ubmVjdCcuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuc3NsTmVnb3RpYXRpb24gIT09ICdkaXJlY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbi5yZXF1ZXN0U3NsKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb24uc3RhcnR1cChzZWxmLmdldFN0YXJ0dXBDb25mKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uLm9uKCdzc2xjb25uZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb24uc3RhcnR1cChzZWxmLmdldFN0YXJ0dXBDb25mKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fYXR0YWNoTGlzdGVuZXJzKGNvbik7XG4gICAgICAgIGNvbi5vbmNlKCdlbmQnLCAoKT0+e1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSB0aGlzLl9lbmRpbmcgPyBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gdGVybWluYXRlZCcpIDogbmV3IEVycm9yKCdDb25uZWN0aW9uIHRlcm1pbmF0ZWQgdW5leHBlY3RlZGx5Jyk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5jb25uZWN0aW9uVGltZW91dEhhbmRsZSk7XG4gICAgICAgICAgICB0aGlzLl9lcnJvckFsbFF1ZXJpZXMoZXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5fZW5kZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9lbmRpbmcpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgY29ubmVjdGlvbiBpcyBlbmRlZCB3aXRob3V0IHVzIGNhbGxpbmcgLmVuZCgpXG4gICAgICAgICAgICAgICAgLy8gb24gdGhpcyBjbGllbnQgdGhlbiB3ZSBoYXZlIGFuIHVuZXhwZWN0ZWQgZGlzY29ubmVjdGlvblxuICAgICAgICAgICAgICAgIC8vIHRyZWF0IHRoaXMgYXMgYW4gZXJyb3IgdW5sZXNzIHdlJ3ZlIGFscmVhZHkgZW1pdHRlZCBhbiBlcnJvclxuICAgICAgICAgICAgICAgIC8vIGR1cmluZyBjb25uZWN0aW9uLlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jb25uZWN0aW5nICYmICF0aGlzLl9jb25uZWN0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25DYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbkNhbGxiYWNrKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUVycm9yRXZlbnQoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5fY29ubmVjdGlvbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUVycm9yRXZlbnQoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soKCk9PntcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2VuZCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb25uZWN0KGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgdGhpcy5fY29ubmVjdChjYWxsYmFjayk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLl9Qcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0KChlcnJvcik9PntcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2F0dGFjaExpc3RlbmVycyhjb24pIHtcbiAgICAgICAgLy8gcGFzc3dvcmQgcmVxdWVzdCBoYW5kbGluZ1xuICAgICAgICBjb24ub24oJ2F1dGhlbnRpY2F0aW9uQ2xlYXJ0ZXh0UGFzc3dvcmQnLCB0aGlzLl9oYW5kbGVBdXRoQ2xlYXJ0ZXh0UGFzc3dvcmQuYmluZCh0aGlzKSk7XG4gICAgICAgIC8vIHBhc3N3b3JkIHJlcXVlc3QgaGFuZGxpbmdcbiAgICAgICAgY29uLm9uKCdhdXRoZW50aWNhdGlvbk1ENVBhc3N3b3JkJywgdGhpcy5faGFuZGxlQXV0aE1ENVBhc3N3b3JkLmJpbmQodGhpcykpO1xuICAgICAgICAvLyBwYXNzd29yZCByZXF1ZXN0IGhhbmRsaW5nIChTQVNMKVxuICAgICAgICBjb24ub24oJ2F1dGhlbnRpY2F0aW9uU0FTTCcsIHRoaXMuX2hhbmRsZUF1dGhTQVNMLmJpbmQodGhpcykpO1xuICAgICAgICBjb24ub24oJ2F1dGhlbnRpY2F0aW9uU0FTTENvbnRpbnVlJywgdGhpcy5faGFuZGxlQXV0aFNBU0xDb250aW51ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgY29uLm9uKCdhdXRoZW50aWNhdGlvblNBU0xGaW5hbCcsIHRoaXMuX2hhbmRsZUF1dGhTQVNMRmluYWwuYmluZCh0aGlzKSk7XG4gICAgICAgIGNvbi5vbignYmFja2VuZEtleURhdGEnLCB0aGlzLl9oYW5kbGVCYWNrZW5kS2V5RGF0YS5iaW5kKHRoaXMpKTtcbiAgICAgICAgY29uLm9uKCdlcnJvcicsIHRoaXMuX2hhbmRsZUVycm9yRXZlbnQuYmluZCh0aGlzKSk7XG4gICAgICAgIGNvbi5vbignZXJyb3JNZXNzYWdlJywgdGhpcy5faGFuZGxlRXJyb3JNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgICBjb24ub24oJ3JlYWR5Rm9yUXVlcnknLCB0aGlzLl9oYW5kbGVSZWFkeUZvclF1ZXJ5LmJpbmQodGhpcykpO1xuICAgICAgICBjb24ub24oJ25vdGljZScsIHRoaXMuX2hhbmRsZU5vdGljZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgY29uLm9uKCdyb3dEZXNjcmlwdGlvbicsIHRoaXMuX2hhbmRsZVJvd0Rlc2NyaXB0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICBjb24ub24oJ2RhdGFSb3cnLCB0aGlzLl9oYW5kbGVEYXRhUm93LmJpbmQodGhpcykpO1xuICAgICAgICBjb24ub24oJ3BvcnRhbFN1c3BlbmRlZCcsIHRoaXMuX2hhbmRsZVBvcnRhbFN1c3BlbmRlZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgY29uLm9uKCdlbXB0eVF1ZXJ5JywgdGhpcy5faGFuZGxlRW1wdHlRdWVyeS5iaW5kKHRoaXMpKTtcbiAgICAgICAgY29uLm9uKCdjb21tYW5kQ29tcGxldGUnLCB0aGlzLl9oYW5kbGVDb21tYW5kQ29tcGxldGUuYmluZCh0aGlzKSk7XG4gICAgICAgIGNvbi5vbigncGFyc2VDb21wbGV0ZScsIHRoaXMuX2hhbmRsZVBhcnNlQ29tcGxldGUuYmluZCh0aGlzKSk7XG4gICAgICAgIGNvbi5vbignY29weUluUmVzcG9uc2UnLCB0aGlzLl9oYW5kbGVDb3B5SW5SZXNwb25zZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgY29uLm9uKCdjb3B5RGF0YScsIHRoaXMuX2hhbmRsZUNvcHlEYXRhLmJpbmQodGhpcykpO1xuICAgICAgICBjb24ub24oJ25vdGlmaWNhdGlvbicsIHRoaXMuX2hhbmRsZU5vdGlmaWNhdGlvbi5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgX2dldFBhc3N3b3JkKGNiKSB7XG4gICAgICAgIGNvbnN0IGNvbiA9IHRoaXMuY29ubmVjdGlvbjtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhc3N3b3JkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLl9Qcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT50aGlzLnBhc3N3b3JkKHRoaXMuY29ubmVjdGlvblBhcmFtZXRlcnMpKS50aGVuKChwYXNzKT0+e1xuICAgICAgICAgICAgICAgIGlmIChwYXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXNzICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uLmVtaXQoJ2Vycm9yJywgbmV3IFR5cGVFcnJvcignUGFzc3dvcmQgbXVzdCBiZSBhIHN0cmluZycpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25QYXJhbWV0ZXJzLnBhc3N3b3JkID0gdGhpcy5wYXNzd29yZCA9IHBhc3M7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uUGFyYW1ldGVycy5wYXNzd29yZCA9IHRoaXMucGFzc3dvcmQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycik9PntcbiAgICAgICAgICAgICAgICBjb24uZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wYXNzd29yZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGdQYXNzID0gcmVxdWlyZSgncGdwYXNzJyk7XG4gICAgICAgICAgICAgICAgcGdQYXNzKHRoaXMuY29ubmVjdGlvblBhcmFtZXRlcnMsIChwYXNzKT0+e1xuICAgICAgICAgICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBwYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZ1Bhc3NEZXByZWNhdGlvbk5vdGljZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uUGFyYW1ldGVycy5wYXNzd29yZCA9IHRoaXMucGFzc3dvcmQgPSBwYXNzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9oYW5kbGVBdXRoQ2xlYXJ0ZXh0UGFzc3dvcmQobXNnKSB7XG4gICAgICAgIHRoaXMuX2dldFBhc3N3b3JkKCgpPT57XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24ucGFzc3dvcmQodGhpcy5wYXNzd29yZCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfaGFuZGxlQXV0aE1ENVBhc3N3b3JkKG1zZykge1xuICAgICAgICB0aGlzLl9nZXRQYXNzd29yZChhc3luYyAoKT0+e1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGNyeXB0by5wb3N0Z3Jlc01kNVBhc3N3b3JkSGFzaCh0aGlzLnVzZXIsIHRoaXMucGFzc3dvcmQsIG1zZy5zYWx0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24ucGFzc3dvcmQoaGFzaGVkUGFzc3dvcmQpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9oYW5kbGVBdXRoU0FTTChtc2cpIHtcbiAgICAgICAgdGhpcy5fZ2V0UGFzc3dvcmQoKCk9PntcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zYXNsU2Vzc2lvbiA9IHNhc2wuc3RhcnRTZXNzaW9uKG1zZy5tZWNoYW5pc21zLCB0aGlzLmVuYWJsZUNoYW5uZWxCaW5kaW5nICYmIHRoaXMuY29ubmVjdGlvbi5zdHJlYW0sIHRoaXMuc2NyYW1NYXhJdGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24uc2VuZFNBU0xJbml0aWFsUmVzcG9uc2VNZXNzYWdlKHRoaXMuc2FzbFNlc3Npb24ubWVjaGFuaXNtLCB0aGlzLnNhc2xTZXNzaW9uLnJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbi5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYyBfaGFuZGxlQXV0aFNBU0xDb250aW51ZShtc2cpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNhc2wuY29udGludWVTZXNzaW9uKHRoaXMuc2FzbFNlc3Npb24sIHRoaXMucGFzc3dvcmQsIG1zZy5kYXRhLCB0aGlzLmVuYWJsZUNoYW5uZWxCaW5kaW5nICYmIHRoaXMuY29ubmVjdGlvbi5zdHJlYW0pO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uLnNlbmRTQ1JBTUNsaWVudEZpbmFsTWVzc2FnZSh0aGlzLnNhc2xTZXNzaW9uLnJlc3BvbnNlKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24uZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9oYW5kbGVBdXRoU0FTTEZpbmFsKG1zZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2FzbC5maW5hbGl6ZVNlc3Npb24odGhpcy5zYXNsU2Vzc2lvbiwgbXNnLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5zYXNsU2Vzc2lvbiA9IG51bGw7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfaGFuZGxlQmFja2VuZEtleURhdGEobXNnKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0lEID0gbXNnLnByb2Nlc3NJRDtcbiAgICAgICAgdGhpcy5zZWNyZXRLZXkgPSBtc2cuc2VjcmV0S2V5O1xuICAgIH1cbiAgICBfaGFuZGxlUmVhZHlGb3JRdWVyeShtc2cpIHtcbiAgICAgICAgaWYgKHRoaXMuX2Nvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5jb25uZWN0aW9uVGltZW91dEhhbmRsZSk7XG4gICAgICAgICAgICAvLyBwcm9jZXNzIHBvc3NpYmxlIGNhbGxiYWNrIGFyZ3VtZW50IHRvIENsaWVudCNjb25uZWN0XG4gICAgICAgICAgICBpZiAodGhpcy5fY29ubmVjdGlvbkNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbkNhbGxiYWNrKG51bGwsIHRoaXMpO1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBjYWxsYmFjayBmb3IgcHJvcGVyIGVycm9yIGhhbmRsaW5nXG4gICAgICAgICAgICAgICAgLy8gYWZ0ZXIgdGhlIGNvbm5lY3QgZXZlbnRcbiAgICAgICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uQ2FsbGJhY2sgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWN0aXZlUXVlcnkgPSB0aGlzLl9nZXRBY3RpdmVRdWVyeSgpO1xuICAgICAgICB0aGlzLl9hY3RpdmVRdWVyeSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3R4U3RhdHVzID0gbXNnPy5zdGF0dXMgPz8gbnVsbDtcbiAgICAgICAgdGhpcy5yZWFkeUZvclF1ZXJ5ID0gdHJ1ZTtcbiAgICAgICAgaWYgKGFjdGl2ZVF1ZXJ5KSB7XG4gICAgICAgICAgICBhY3RpdmVRdWVyeS5oYW5kbGVSZWFkeUZvclF1ZXJ5KHRoaXMuY29ubmVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcHVsc2VRdWVyeVF1ZXVlKCk7XG4gICAgfVxuICAgIC8vIGlmIHdlIHJlY2VpdmUgYW4gZXJyb3IgZXZlbnQgb3IgZXJyb3IgbWVzc2FnZVxuICAgIC8vIGR1cmluZyB0aGUgY29ubmVjdGlvbiBwcm9jZXNzIHdlIGhhbmRsZSBpdCBoZXJlXG4gICAgX2hhbmRsZUVycm9yV2hpbGVDb25uZWN0aW5nKGVycikge1xuICAgICAgICBpZiAodGhpcy5fY29ubmVjdGlvbkVycm9yKSB7XG4gICAgICAgICAgICAvLyBUT0RPKGJtYyk6IHRoaXMgaXMgc3dhbGxvd2luZyBlcnJvcnMgLSB3ZSBzaG91bGRuJ3QgZG8gdGhpc1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25FcnJvciA9IHRydWU7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmNvbm5lY3Rpb25UaW1lb3V0SGFuZGxlKTtcbiAgICAgICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25DYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb25DYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgIH1cbiAgICAvLyBpZiB3ZSdyZSBjb25uZWN0ZWQgYW5kIHdlIHJlY2VpdmUgYW4gZXJyb3IgZXZlbnQgZnJvbSB0aGUgY29ubmVjdGlvblxuICAgIC8vIHRoaXMgbWVhbnMgdGhlIHNvY2tldCBpcyBkZWFkIC0gZG8gYSBoYXJkIGFib3J0IG9mIGFsbCBxdWVyaWVzIGFuZCBlbWl0XG4gICAgLy8gdGhlIHNvY2tldCBlcnJvciBvbiB0aGUgY2xpZW50IGFzIHdlbGxcbiAgICBfaGFuZGxlRXJyb3JFdmVudChlcnIpIHtcbiAgICAgICAgaWYgKHRoaXMuX2Nvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVFcnJvcldoaWxlQ29ubmVjdGluZyhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3F1ZXJ5YWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9lcnJvckFsbFF1ZXJpZXMoZXJyKTtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgfVxuICAgIC8vIGhhbmRsZSBlcnJvciBtZXNzYWdlcyBmcm9tIHRoZSBwb3N0Z3JlcyBiYWNrZW5kXG4gICAgX2hhbmRsZUVycm9yTWVzc2FnZShtc2cpIHtcbiAgICAgICAgaWYgKHRoaXMuX2Nvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVFcnJvcldoaWxlQ29ubmVjdGluZyhtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFjdGl2ZVF1ZXJ5ID0gdGhpcy5fZ2V0QWN0aXZlUXVlcnkoKTtcbiAgICAgICAgaWYgKCFhY3RpdmVRdWVyeSkge1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlRXJyb3JFdmVudChtc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FjdGl2ZVF1ZXJ5ID0gbnVsbDtcbiAgICAgICAgYWN0aXZlUXVlcnkuaGFuZGxlRXJyb3IobXNnLCB0aGlzLmNvbm5lY3Rpb24pO1xuICAgIH1cbiAgICBfaGFuZGxlUm93RGVzY3JpcHRpb24obXNnKSB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZVF1ZXJ5ID0gdGhpcy5fZ2V0QWN0aXZlUXVlcnkoKTtcbiAgICAgICAgaWYgKGFjdGl2ZVF1ZXJ5ID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdSZWNlaXZlZCB1bmV4cGVjdGVkIHJvd0Rlc2NyaXB0aW9uIG1lc3NhZ2UgZnJvbSBiYWNrZW5kLicpO1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlRXJyb3JFdmVudChlcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGVsZWdhdGUgcm93RGVzY3JpcHRpb24gdG8gYWN0aXZlIHF1ZXJ5XG4gICAgICAgIGFjdGl2ZVF1ZXJ5LmhhbmRsZVJvd0Rlc2NyaXB0aW9uKG1zZyk7XG4gICAgfVxuICAgIF9oYW5kbGVEYXRhUm93KG1zZykge1xuICAgICAgICBjb25zdCBhY3RpdmVRdWVyeSA9IHRoaXMuX2dldEFjdGl2ZVF1ZXJ5KCk7XG4gICAgICAgIGlmIChhY3RpdmVRdWVyeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignUmVjZWl2ZWQgdW5leHBlY3RlZCBkYXRhUm93IG1lc3NhZ2UgZnJvbSBiYWNrZW5kLicpO1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlRXJyb3JFdmVudChlcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGVsZWdhdGUgZGF0YVJvdyB0byBhY3RpdmUgcXVlcnlcbiAgICAgICAgYWN0aXZlUXVlcnkuaGFuZGxlRGF0YVJvdyhtc2cpO1xuICAgIH1cbiAgICBfaGFuZGxlUG9ydGFsU3VzcGVuZGVkKG1zZykge1xuICAgICAgICBjb25zdCBhY3RpdmVRdWVyeSA9IHRoaXMuX2dldEFjdGl2ZVF1ZXJ5KCk7XG4gICAgICAgIGlmIChhY3RpdmVRdWVyeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignUmVjZWl2ZWQgdW5leHBlY3RlZCBwb3J0YWxTdXNwZW5kZWQgbWVzc2FnZSBmcm9tIGJhY2tlbmQuJyk7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVFcnJvckV2ZW50KGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBkZWxlZ2F0ZSBwb3J0YWxTdXNwZW5kZWQgdG8gYWN0aXZlIHF1ZXJ5XG4gICAgICAgIGFjdGl2ZVF1ZXJ5LmhhbmRsZVBvcnRhbFN1c3BlbmRlZCh0aGlzLmNvbm5lY3Rpb24pO1xuICAgIH1cbiAgICBfaGFuZGxlRW1wdHlRdWVyeShtc2cpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlUXVlcnkgPSB0aGlzLl9nZXRBY3RpdmVRdWVyeSgpO1xuICAgICAgICBpZiAoYWN0aXZlUXVlcnkgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ1JlY2VpdmVkIHVuZXhwZWN0ZWQgZW1wdHlRdWVyeSBtZXNzYWdlIGZyb20gYmFja2VuZC4nKTtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUVycm9yRXZlbnQoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRlbGVnYXRlIGVtcHR5UXVlcnkgdG8gYWN0aXZlIHF1ZXJ5XG4gICAgICAgIGFjdGl2ZVF1ZXJ5LmhhbmRsZUVtcHR5UXVlcnkodGhpcy5jb25uZWN0aW9uKTtcbiAgICB9XG4gICAgX2hhbmRsZUNvbW1hbmRDb21wbGV0ZShtc2cpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlUXVlcnkgPSB0aGlzLl9nZXRBY3RpdmVRdWVyeSgpO1xuICAgICAgICBpZiAoYWN0aXZlUXVlcnkgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ1JlY2VpdmVkIHVuZXhwZWN0ZWQgY29tbWFuZENvbXBsZXRlIG1lc3NhZ2UgZnJvbSBiYWNrZW5kLicpO1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlRXJyb3JFdmVudChlcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGVsZWdhdGUgY29tbWFuZENvbXBsZXRlIHRvIGFjdGl2ZSBxdWVyeVxuICAgICAgICBhY3RpdmVRdWVyeS5oYW5kbGVDb21tYW5kQ29tcGxldGUobXNnLCB0aGlzLmNvbm5lY3Rpb24pO1xuICAgIH1cbiAgICBfaGFuZGxlUGFyc2VDb21wbGV0ZSgpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlUXVlcnkgPSB0aGlzLl9nZXRBY3RpdmVRdWVyeSgpO1xuICAgICAgICBpZiAoYWN0aXZlUXVlcnkgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ1JlY2VpdmVkIHVuZXhwZWN0ZWQgcGFyc2VDb21wbGV0ZSBtZXNzYWdlIGZyb20gYmFja2VuZC4nKTtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUVycm9yRXZlbnQoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIGEgcHJlcGFyZWQgc3RhdGVtZW50IGhhcyBhIG5hbWUgYW5kIHByb3Blcmx5IHBhcnNlc1xuICAgICAgICAvLyB3ZSB0cmFjayB0aGF0IGl0cyBhbHJlYWR5IGJlZW4gZXhlY3V0ZWQgc28gd2UgZG9uJ3QgcGFyc2VcbiAgICAgICAgLy8gaXQgYWdhaW4gb24gdGhlIHNhbWUgY2xpZW50XG4gICAgICAgIGlmIChhY3RpdmVRdWVyeS5uYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24ucGFyc2VkU3RhdGVtZW50c1thY3RpdmVRdWVyeS5uYW1lXSA9IGFjdGl2ZVF1ZXJ5LnRleHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2hhbmRsZUNvcHlJblJlc3BvbnNlKG1zZykge1xuICAgICAgICBjb25zdCBhY3RpdmVRdWVyeSA9IHRoaXMuX2dldEFjdGl2ZVF1ZXJ5KCk7XG4gICAgICAgIGlmIChhY3RpdmVRdWVyeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignUmVjZWl2ZWQgdW5leHBlY3RlZCBjb3B5SW5SZXNwb25zZSBtZXNzYWdlIGZyb20gYmFja2VuZC4nKTtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUVycm9yRXZlbnQoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFjdGl2ZVF1ZXJ5LmhhbmRsZUNvcHlJblJlc3BvbnNlKHRoaXMuY29ubmVjdGlvbik7XG4gICAgfVxuICAgIF9oYW5kbGVDb3B5RGF0YShtc2cpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlUXVlcnkgPSB0aGlzLl9nZXRBY3RpdmVRdWVyeSgpO1xuICAgICAgICBpZiAoYWN0aXZlUXVlcnkgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ1JlY2VpdmVkIHVuZXhwZWN0ZWQgY29weURhdGEgbWVzc2FnZSBmcm9tIGJhY2tlbmQuJyk7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVFcnJvckV2ZW50KGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhY3RpdmVRdWVyeS5oYW5kbGVDb3B5RGF0YShtc2csIHRoaXMuY29ubmVjdGlvbik7XG4gICAgfVxuICAgIF9oYW5kbGVOb3RpZmljYXRpb24obXNnKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnbm90aWZpY2F0aW9uJywgbXNnKTtcbiAgICB9XG4gICAgX2hhbmRsZU5vdGljZShtc2cpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdub3RpY2UnLCBtc2cpO1xuICAgIH1cbiAgICBnZXRTdGFydHVwQ29uZigpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy5jb25uZWN0aW9uUGFyYW1ldGVycztcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgIHVzZXI6IHBhcmFtcy51c2VyLFxuICAgICAgICAgICAgZGF0YWJhc2U6IHBhcmFtcy5kYXRhYmFzZVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhcHBOYW1lID0gcGFyYW1zLmFwcGxpY2F0aW9uX25hbWUgfHwgcGFyYW1zLmZhbGxiYWNrX2FwcGxpY2F0aW9uX25hbWU7XG4gICAgICAgIGlmIChhcHBOYW1lKSB7XG4gICAgICAgICAgICBkYXRhLmFwcGxpY2F0aW9uX25hbWUgPSBhcHBOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbXMucmVwbGljYXRpb24pIHtcbiAgICAgICAgICAgIGRhdGEucmVwbGljYXRpb24gPSAnJyArIHBhcmFtcy5yZXBsaWNhdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zLnN0YXRlbWVudF90aW1lb3V0KSB7XG4gICAgICAgICAgICBkYXRhLnN0YXRlbWVudF90aW1lb3V0ID0gU3RyaW5nKHBhcnNlSW50KHBhcmFtcy5zdGF0ZW1lbnRfdGltZW91dCwgMTApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zLmxvY2tfdGltZW91dCkge1xuICAgICAgICAgICAgZGF0YS5sb2NrX3RpbWVvdXQgPSBTdHJpbmcocGFyc2VJbnQocGFyYW1zLmxvY2tfdGltZW91dCwgMTApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zLmlkbGVfaW5fdHJhbnNhY3Rpb25fc2Vzc2lvbl90aW1lb3V0KSB7XG4gICAgICAgICAgICBkYXRhLmlkbGVfaW5fdHJhbnNhY3Rpb25fc2Vzc2lvbl90aW1lb3V0ID0gU3RyaW5nKHBhcnNlSW50KHBhcmFtcy5pZGxlX2luX3RyYW5zYWN0aW9uX3Nlc3Npb25fdGltZW91dCwgMTApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zLm9wdGlvbnMpIHtcbiAgICAgICAgICAgIGRhdGEub3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBjYW5jZWwoY2xpZW50LCBxdWVyeSkge1xuICAgICAgICBpZiAoY2xpZW50LmFjdGl2ZVF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgICAgICAgY29uc3QgY29uID0gdGhpcy5jb25uZWN0aW9uO1xuICAgICAgICAgICAgaWYgKHRoaXMuaG9zdCAmJiB0aGlzLmhvc3QuaW5kZXhPZignLycpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uLmNvbm5lY3QodGhpcy5ob3N0ICsgJy8ucy5QR1NRTC4nICsgdGhpcy5wb3J0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uLmNvbm5lY3QodGhpcy5wb3J0LCB0aGlzLmhvc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gb25jZSBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkIHNlbmQgY2FuY2VsIG1lc3NhZ2VcbiAgICAgICAgICAgIGNvbi5vbignY29ubmVjdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbi5jYW5jZWwoY2xpZW50LnByb2Nlc3NJRCwgY2xpZW50LnNlY3JldEtleSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjbGllbnQuX3F1ZXJ5UXVldWUuaW5kZXhPZihxdWVyeSkgIT09IC0xKSB7XG4gICAgICAgICAgICBjbGllbnQuX3F1ZXJ5UXVldWUuc3BsaWNlKGNsaWVudC5fcXVlcnlRdWV1ZS5pbmRleE9mKHF1ZXJ5KSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0VHlwZVBhcnNlcihvaWQsIGZvcm1hdCwgcGFyc2VGbikge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHlwZXMuc2V0VHlwZVBhcnNlcihvaWQsIGZvcm1hdCwgcGFyc2VGbik7XG4gICAgfVxuICAgIGdldFR5cGVQYXJzZXIob2lkLCBmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R5cGVzLmdldFR5cGVQYXJzZXIob2lkLCBmb3JtYXQpO1xuICAgIH1cbiAgICAvLyBlc2NhcGVJZGVudGlmaWVyIGFuZCBlc2NhcGVMaXRlcmFsIG1vdmVkIHRvIHV0aWxpdHkgZnVuY3Rpb25zICYgZXhwb3J0ZWRcbiAgICAvLyBvbiBQR1xuICAgIC8vIHJlLWV4cG9ydGVkIGhlcmUgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAgZXNjYXBlSWRlbnRpZmllcihzdHIpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmVzY2FwZUlkZW50aWZpZXIoc3RyKTtcbiAgICB9XG4gICAgZXNjYXBlTGl0ZXJhbChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmVzY2FwZUxpdGVyYWwoc3RyKTtcbiAgICB9XG4gICAgX3B1bHNlUXVlcnlRdWV1ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlGb3JRdWVyeSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5fYWN0aXZlUXVlcnkgPSB0aGlzLl9xdWVyeVF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVRdWVyeSA9IHRoaXMuX2dldEFjdGl2ZVF1ZXJ5KCk7XG4gICAgICAgICAgICBpZiAoYWN0aXZlUXVlcnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5Rm9yUXVlcnkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhc0V4ZWN1dGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeUVycm9yID0gYWN0aXZlUXVlcnkuc3VibWl0KHRoaXMuY29ubmVjdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljaygoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlUXVlcnkuaGFuZGxlRXJyb3IocXVlcnlFcnJvciwgdGhpcy5jb25uZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlGb3JRdWVyeSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wdWxzZVF1ZXJ5UXVldWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0V4ZWN1dGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZlUXVlcnkgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnZHJhaW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWVyeShjb25maWcsIHZhbHVlcywgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gY2FuIHRha2UgaW4gc3RyaW5ncywgY29uZmlnIG9iamVjdCBvciBxdWVyeSBvYmplY3RcbiAgICAgICAgbGV0IHF1ZXJ5O1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICBpZiAoY29uZmlnID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NsaWVudCB3YXMgcGFzc2VkIGEgbnVsbCBvciB1bmRlZmluZWQgcXVlcnknKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZy5zdWJtaXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHF1ZXJ5ID0gY29uZmlnO1xuICAgICAgICAgICAgaWYgKCFxdWVyeS5jYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmNhbGxiYWNrID0gdmFsdWVzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnkuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWVyeSA9IG5ldyBRdWVyeShjb25maWcsIHZhbHVlcywgY2FsbGJhY2spO1xuICAgICAgICAgICAgaWYgKCFxdWVyeS5jYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyB0aGlzLl9Qcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmNhbGxiYWNrID0gKGVyciwgcmVzKT0+ZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycik9PntcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgc3RhY2sgdHJhY2UgdGhhdCBsZWFkcyB0byBgVENQLm9uU3RyZWFtUmVhZGAgd2l0aCBvbmUgdGhhdCBsZWFkcyBiYWNrIHRvIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBhcHBsaWNhdGlvbiB0aGF0IGNyZWF0ZWQgdGhlIHF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGVycik7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHF1ZXJ5LmNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FsbGJhY2sgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZWFkVGltZW91dCA9IGNvbmZpZy5xdWVyeV90aW1lb3V0IHx8IHRoaXMuY29ubmVjdGlvblBhcmFtZXRlcnMucXVlcnlfdGltZW91dDtcbiAgICAgICAgaWYgKHJlYWRUaW1lb3V0KSB7XG4gICAgICAgICAgICBjb25zdCBxdWVyeUNhbGxiYWNrID0gcXVlcnkuY2FsbGJhY2sgfHwgKCgpPT57fSk7XG4gICAgICAgICAgICBjb25zdCByZWFkVGltZW91dFRpbWVyID0gc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdRdWVyeSByZWFkIHRpbWVvdXQnKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpPT57XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmhhbmRsZUVycm9yKGVycm9yLCB0aGlzLmNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHF1ZXJ5Q2FsbGJhY2soZXJyb3IpO1xuICAgICAgICAgICAgICAgIC8vIHdlIGFscmVhZHkgcmV0dXJuZWQgYW4gZXJyb3IsXG4gICAgICAgICAgICAgICAgLy8ganVzdCBkbyBub3RoaW5nIGlmIHF1ZXJ5IGNvbXBsZXRlc1xuICAgICAgICAgICAgICAgIHF1ZXJ5LmNhbGxiYWNrID0gKCk9Pnt9O1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBmcm9tIHF1ZXVlXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9xdWVyeVF1ZXVlLmluZGV4T2YocXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3F1ZXJ5UXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fcHVsc2VRdWVyeVF1ZXVlKCk7XG4gICAgICAgICAgICB9LCByZWFkVGltZW91dCk7XG4gICAgICAgICAgICBxdWVyeS5jYWxsYmFjayA9IChlcnIsIHJlcyk9PntcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQocmVhZFRpbWVvdXRUaW1lcik7XG4gICAgICAgICAgICAgICAgcXVlcnlDYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmJpbmFyeSAmJiAhcXVlcnkuYmluYXJ5KSB7XG4gICAgICAgICAgICBxdWVyeS5iaW5hcnkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChxdWVyeS5fcmVzdWx0ICYmICFxdWVyeS5fcmVzdWx0Ll90eXBlcykge1xuICAgICAgICAgICAgcXVlcnkuX3Jlc3VsdC5fdHlwZXMgPSB0aGlzLl90eXBlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3F1ZXJ5YWJsZSkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljaygoKT0+e1xuICAgICAgICAgICAgICAgIHF1ZXJ5LmhhbmRsZUVycm9yKG5ldyBFcnJvcignQ2xpZW50IGhhcyBlbmNvdW50ZXJlZCBhIGNvbm5lY3Rpb24gZXJyb3IgYW5kIGlzIG5vdCBxdWVyeWFibGUnKSwgdGhpcy5jb25uZWN0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fZW5kaW5nKSB7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpPT57XG4gICAgICAgICAgICAgICAgcXVlcnkuaGFuZGxlRXJyb3IobmV3IEVycm9yKCdDbGllbnQgd2FzIGNsb3NlZCBhbmQgaXMgbm90IHF1ZXJ5YWJsZScpLCB0aGlzLmNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9xdWVyeVF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHF1ZXJ5UXVldWVMZW5ndGhEZXByZWNhdGlvbk5vdGljZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3F1ZXJ5UXVldWUucHVzaChxdWVyeSk7XG4gICAgICAgIHRoaXMuX3B1bHNlUXVlcnlRdWV1ZSgpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZWYoKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbi5yZWYoKTtcbiAgICB9XG4gICAgdW5yZWYoKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbi51bnJlZigpO1xuICAgIH1cbiAgICBnZXRUcmFuc2FjdGlvblN0YXR1cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R4U3RhdHVzO1xuICAgIH1cbiAgICBlbmQoY2IpIHtcbiAgICAgICAgdGhpcy5fZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBuZXZlciBjb25uZWN0ZWQsIHRoZW4gZW5kIGlzIGEgbm9vcCwgY2FsbGJhY2sgaW1tZWRpYXRlbHlcbiAgICAgICAgaWYgKCF0aGlzLmNvbm5lY3Rpb24uX2Nvbm5lY3RpbmcgfHwgdGhpcy5fZW5kZWQpIHtcbiAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2dldEFjdGl2ZVF1ZXJ5KCkgfHwgIXRoaXMuX3F1ZXJ5YWJsZSkge1xuICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSBhbiBhY3RpdmUgcXVlcnkgd2UgbmVlZCB0byBmb3JjZSBhIGRpc2Nvbm5lY3RcbiAgICAgICAgICAgIC8vIG9uIHRoZSBzb2NrZXQgLSBvdGhlcndpc2UgYSBodW5nIHF1ZXJ5IGNvdWxkIGJsb2NrIGVuZCBmb3JldmVyXG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24uc3RyZWFtLmRlc3Ryb3koKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbi5lbmQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbi5vbmNlKCdlbmQnLCBjYik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMuX1Byb21pc2UoKHJlc29sdmUpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uLm9uY2UoJ2VuZCcsIHJlc29sdmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IHF1ZXJ5UXVldWUoKSB7XG4gICAgICAgIHF1ZXJ5UXVldWVEZXByZWNhdGlvbk5vdGljZSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5fcXVlcnlRdWV1ZTtcbiAgICB9XG59XG4vLyBleHBvc2UgYSBRdWVyeSBjb25zdHJ1Y3RvclxuQ2xpZW50LlF1ZXJ5ID0gUXVlcnk7XG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDtcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG5jb25zdCBOT09QID0gZnVuY3Rpb24oKSB7fTtcbmNvbnN0IHJlbW92ZVdoZXJlID0gKGxpc3QsIHByZWRpY2F0ZSk9PntcbiAgICBjb25zdCBpID0gbGlzdC5maW5kSW5kZXgocHJlZGljYXRlKTtcbiAgICByZXR1cm4gaSA9PT0gLTEgPyB1bmRlZmluZWQgOiBsaXN0LnNwbGljZShpLCAxKVswXTtcbn07XG5jbGFzcyBJZGxlSXRlbSB7XG4gICAgY29uc3RydWN0b3IoY2xpZW50LCBpZGxlTGlzdGVuZXIsIHRpbWVvdXRJZCl7XG4gICAgICAgIHRoaXMuY2xpZW50ID0gY2xpZW50O1xuICAgICAgICB0aGlzLmlkbGVMaXN0ZW5lciA9IGlkbGVMaXN0ZW5lcjtcbiAgICAgICAgdGhpcy50aW1lb3V0SWQgPSB0aW1lb3V0SWQ7XG4gICAgfVxufVxuY2xhc3MgUGVuZGluZ0l0ZW0ge1xuICAgIGNvbnN0cnVjdG9yKGNhbGxiYWNrKXtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHRocm93T25Eb3VibGVSZWxlYXNlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignUmVsZWFzZSBjYWxsZWQgb24gY2xpZW50IHdoaWNoIGhhcyBhbHJlYWR5IGJlZW4gcmVsZWFzZWQgdG8gdGhlIHBvb2wuJyk7XG59XG5mdW5jdGlvbiBwcm9taXNpZnkoUHJvbWlzZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgICAgICAgIHJlc3VsdDogdW5kZWZpbmVkXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxldCByZWo7XG4gICAgbGV0IHJlcztcbiAgICBjb25zdCBjYiA9IGZ1bmN0aW9uKGVyciwgY2xpZW50KSB7XG4gICAgICAgIGVyciA/IHJlaihlcnIpIDogcmVzKGNsaWVudCk7XG4gICAgfTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVzID0gcmVzb2x2ZTtcbiAgICAgICAgcmVqID0gcmVqZWN0O1xuICAgIH0pLmNhdGNoKChlcnIpPT57XG4gICAgICAgIC8vIHJlcGxhY2UgdGhlIHN0YWNrIHRyYWNlIHRoYXQgbGVhZHMgdG8gYFRDUC5vblN0cmVhbVJlYWRgIHdpdGggb25lIHRoYXQgbGVhZHMgYmFjayB0byB0aGVcbiAgICAgICAgLy8gYXBwbGljYXRpb24gdGhhdCBjcmVhdGVkIHRoZSBxdWVyeVxuICAgICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlcnIpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2FsbGJhY2s6IGNiLFxuICAgICAgICByZXN1bHQ6IHJlc3VsdFxuICAgIH07XG59XG5mdW5jdGlvbiBtYWtlSWRsZUxpc3RlbmVyKHBvb2wsIGNsaWVudCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBpZGxlTGlzdGVuZXIoZXJyKSB7XG4gICAgICAgIGVyci5jbGllbnQgPSBjbGllbnQ7XG4gICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBpZGxlTGlzdGVuZXIpO1xuICAgICAgICBjbGllbnQub24oJ2Vycm9yJywgKCk9PntcbiAgICAgICAgICAgIHBvb2wubG9nKCdhZGRpdGlvbmFsIGNsaWVudCBlcnJvciBhZnRlciBkaXNjb25uZWN0aW9uIGR1ZSB0byBlcnJvcicsIGVycik7XG4gICAgICAgIH0pO1xuICAgICAgICBwb29sLl9yZW1vdmUoY2xpZW50KTtcbiAgICAgICAgLy8gVE9ETyAtIGRvY3VtZW50IHRoYXQgb25jZSB0aGUgcG9vbCBlbWl0cyBhbiBlcnJvclxuICAgICAgICAvLyB0aGUgY2xpZW50IGhhcyBhbHJlYWR5IGJlZW4gY2xvc2VkICYgcHVyZ2VkIGFuZCBpcyB1bnVzYWJsZVxuICAgICAgICBwb29sLmVtaXQoJ2Vycm9yJywgZXJyLCBjbGllbnQpO1xuICAgIH07XG59XG5jbGFzcyBQb29sIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zLCBDbGllbnQpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTtcbiAgICAgICAgaWYgKG9wdGlvbnMgIT0gbnVsbCAmJiAncGFzc3dvcmQnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIFwiaGlkaW5nXCIgdGhlIHBhc3N3b3JkIHNvIGl0IGRvZXNuJ3Qgc2hvdyB1cCBpbiBzdGFjayB0cmFjZXNcbiAgICAgICAgICAgIC8vIG9yIGlmIHRoZSBjbGllbnQgaXMgY29uc29sZS5sb2dnZWRcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLm9wdGlvbnMsICdwYXNzd29yZCcsIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMucGFzc3dvcmRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zICE9IG51bGwgJiYgb3B0aW9ucy5zc2wgJiYgb3B0aW9ucy5zc2wua2V5KSB7XG4gICAgICAgICAgICAvLyBcImhpZGluZ1wiIHRoZSBzc2wtPmtleSBzbyBpdCBkb2Vzbid0IHNob3cgdXAgaW4gc3RhY2sgdHJhY2VzXG4gICAgICAgICAgICAvLyBvciBpZiB0aGUgY2xpZW50IGlzIGNvbnNvbGUubG9nZ2VkXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcy5vcHRpb25zLnNzbCwgJ2tleScsIHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcHRpb25zLm1heCA9IHRoaXMub3B0aW9ucy5tYXggfHwgdGhpcy5vcHRpb25zLnBvb2xTaXplIHx8IDEwO1xuICAgICAgICB0aGlzLm9wdGlvbnMubWluID0gdGhpcy5vcHRpb25zLm1pbiB8fCAwO1xuICAgICAgICB0aGlzLm9wdGlvbnMubWF4VXNlcyA9IHRoaXMub3B0aW9ucy5tYXhVc2VzIHx8IEluZmluaXR5O1xuICAgICAgICB0aGlzLm9wdGlvbnMuYWxsb3dFeGl0T25JZGxlID0gdGhpcy5vcHRpb25zLmFsbG93RXhpdE9uSWRsZSB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5vcHRpb25zLm1heExpZmV0aW1lU2Vjb25kcyA9IHRoaXMub3B0aW9ucy5tYXhMaWZldGltZVNlY29uZHMgfHwgMDtcbiAgICAgICAgdGhpcy5sb2cgPSB0aGlzLm9wdGlvbnMubG9nIHx8IGZ1bmN0aW9uKCkge307XG4gICAgICAgIHRoaXMuQ2xpZW50ID0gdGhpcy5vcHRpb25zLkNsaWVudCB8fCBDbGllbnQgfHwgcmVxdWlyZSgncGcnKS5DbGllbnQ7XG4gICAgICAgIHRoaXMuUHJvbWlzZSA9IHRoaXMub3B0aW9ucy5Qcm9taXNlIHx8IGdsb2JhbC5Qcm9taXNlO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5pZGxlVGltZW91dE1pbGxpcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pZGxlVGltZW91dE1pbGxpcyA9IDEwMDAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NsaWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5faWRsZSA9IFtdO1xuICAgICAgICB0aGlzLl9leHBpcmVkID0gbmV3IFdlYWtTZXQoKTtcbiAgICAgICAgdGhpcy5fcGVuZGluZ1F1ZXVlID0gW107XG4gICAgICAgIHRoaXMuX2VuZENhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmVuZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVuZGVkID0gZmFsc2U7XG4gICAgfVxuICAgIF9wcm9taXNlVHJ5KGYpIHtcbiAgICAgICAgY29uc3QgUHJvbWlzZSA9IHRoaXMuUHJvbWlzZTtcbiAgICAgICAgaWYgKHR5cGVvZiBQcm9taXNlLnRyeSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UudHJ5KGYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSk9PnJlc29sdmUoZigpKSk7XG4gICAgfVxuICAgIF9pc0Z1bGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jbGllbnRzLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMubWF4O1xuICAgIH1cbiAgICBfaXNBYm92ZU1pbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsaWVudHMubGVuZ3RoID4gdGhpcy5vcHRpb25zLm1pbjtcbiAgICB9XG4gICAgX3B1bHNlUXVldWUoKSB7XG4gICAgICAgIHRoaXMubG9nKCdwdWxzZSBxdWV1ZScpO1xuICAgICAgICBpZiAodGhpcy5lbmRlZCkge1xuICAgICAgICAgICAgdGhpcy5sb2coJ3B1bHNlIHF1ZXVlIGVuZGVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZW5kaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmxvZygncHVsc2UgcXVldWUgb24gZW5kaW5nJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5faWRsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pZGxlLnNsaWNlKCkubWFwKChpdGVtKT0+e1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmUoaXRlbS5jbGllbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLl9jbGllbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2VuZENhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgd2UgZG9uJ3QgaGF2ZSBhbnkgd2FpdGluZywgZG8gbm90aGluZ1xuICAgICAgICBpZiAoIXRoaXMuX3BlbmRpbmdRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMubG9nKCdubyBxdWV1ZWQgcmVxdWVzdHMnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiB3ZSBkb24ndCBoYXZlIGFueSBpZGxlIGNsaWVudHMgYW5kIHdlIGhhdmUgbm8gbW9yZSByb29tIGRvIG5vdGhpbmdcbiAgICAgICAgaWYgKCF0aGlzLl9pZGxlLmxlbmd0aCAmJiB0aGlzLl9pc0Z1bGwoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBlbmRpbmdJdGVtID0gdGhpcy5fcGVuZGluZ1F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIGlmICh0aGlzLl9pZGxlLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgaWRsZUl0ZW0gPSB0aGlzLl9pZGxlLnBvcCgpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkbGVJdGVtLnRpbWVvdXRJZCk7XG4gICAgICAgICAgICBjb25zdCBjbGllbnQgPSBpZGxlSXRlbS5jbGllbnQ7XG4gICAgICAgICAgICBjbGllbnQucmVmICYmIGNsaWVudC5yZWYoKTtcbiAgICAgICAgICAgIGNvbnN0IGlkbGVMaXN0ZW5lciA9IGlkbGVJdGVtLmlkbGVMaXN0ZW5lcjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY3F1aXJlQ2xpZW50KGNsaWVudCwgcGVuZGluZ0l0ZW0sIGlkbGVMaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faXNGdWxsKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5ld0NsaWVudChwZW5kaW5nSXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIGNvbmRpdGlvbicpO1xuICAgIH1cbiAgICBfcmVtb3ZlKGNsaWVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgcmVtb3ZlZCA9IHJlbW92ZVdoZXJlKHRoaXMuX2lkbGUsIChpdGVtKT0+aXRlbS5jbGllbnQgPT09IGNsaWVudCk7XG4gICAgICAgIGlmIChyZW1vdmVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChyZW1vdmVkLnRpbWVvdXRJZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2xpZW50cyA9IHRoaXMuX2NsaWVudHMuZmlsdGVyKChjKT0+YyAhPT0gY2xpZW50KTtcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICAgIGNsaWVudC5lbmQoKCk9PntcbiAgICAgICAgICAgIGNvbnRleHQuZW1pdCgncmVtb3ZlJywgY2xpZW50KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY29ubmVjdChjYikge1xuICAgICAgICBpZiAodGhpcy5lbmRpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcignQ2Fubm90IHVzZSBhIHBvb2wgYWZ0ZXIgY2FsbGluZyBlbmQgb24gdGhlIHBvb2wnKTtcbiAgICAgICAgICAgIHJldHVybiBjYiA/IGNiKGVycikgOiB0aGlzLlByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBwcm9taXNpZnkodGhpcy5Qcm9taXNlLCBjYik7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3BvbnNlLnJlc3VsdDtcbiAgICAgICAgLy8gaWYgd2UgZG9uJ3QgaGF2ZSB0byBjb25uZWN0IGEgbmV3IGNsaWVudCwgZG9uJ3QgZG8gc29cbiAgICAgICAgaWYgKHRoaXMuX2lzRnVsbCgpIHx8IHRoaXMuX2lkbGUubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBoYXZlIGlkbGUgY2xpZW50cyBzY2hlZHVsZSBhIHB1bHNlIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICBpZiAodGhpcy5faWRsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpPT50aGlzLl9wdWxzZVF1ZXVlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuY29ubmVjdGlvblRpbWVvdXRNaWxsaXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nUXVldWUucHVzaChuZXcgUGVuZGluZ0l0ZW0ocmVzcG9uc2UuY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcXVldWVDYWxsYmFjayA9IChlcnIsIHJlcywgZG9uZSk9PntcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGlkKTtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5jYWxsYmFjayhlcnIsIHJlcywgZG9uZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgcGVuZGluZ0l0ZW0gPSBuZXcgUGVuZGluZ0l0ZW0ocXVldWVDYWxsYmFjayk7XG4gICAgICAgICAgICAvLyBzZXQgY29ubmVjdGlvbiB0aW1lb3V0IG9uIGNoZWNraW5nIG91dCBhbiBleGlzdGluZyBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IHRpZCA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIGNhbGxiYWNrIGZyb20gcGVuZGluZyB3YWl0ZXJzIGJlY2F1c2VcbiAgICAgICAgICAgICAgICAvLyB3ZSdyZSBnb2luZyB0byBjYWxsIGl0IHdpdGggYSB0aW1lb3V0IGVycm9yXG4gICAgICAgICAgICAgICAgcmVtb3ZlV2hlcmUodGhpcy5fcGVuZGluZ1F1ZXVlLCAoaSk9PmkuY2FsbGJhY2sgPT09IHF1ZXVlQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHBlbmRpbmdJdGVtLnRpbWVkT3V0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5jYWxsYmFjayhuZXcgRXJyb3IoJ3RpbWVvdXQgZXhjZWVkZWQgd2hlbiB0cnlpbmcgdG8gY29ubmVjdCcpKTtcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucy5jb25uZWN0aW9uVGltZW91dE1pbGxpcyk7XG4gICAgICAgICAgICBpZiAodGlkLnVucmVmKSB7XG4gICAgICAgICAgICAgICAgdGlkLnVucmVmKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wZW5kaW5nUXVldWUucHVzaChwZW5kaW5nSXRlbSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubmV3Q2xpZW50KG5ldyBQZW5kaW5nSXRlbShyZXNwb25zZS5jYWxsYmFjaykpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBuZXdDbGllbnQocGVuZGluZ0l0ZW0pIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gbmV3IHRoaXMuQ2xpZW50KHRoaXMub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2NsaWVudHMucHVzaChjbGllbnQpO1xuICAgICAgICBjb25zdCBpZGxlTGlzdGVuZXIgPSBtYWtlSWRsZUxpc3RlbmVyKHRoaXMsIGNsaWVudCk7XG4gICAgICAgIHRoaXMubG9nKCdjaGVja2luZyBjbGllbnQgdGltZW91dCcpO1xuICAgICAgICAvLyBjb25uZWN0aW9uIHRpbWVvdXQgbG9naWNcbiAgICAgICAgbGV0IHRpZDtcbiAgICAgICAgbGV0IHRpbWVvdXRIaXQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb25uZWN0aW9uVGltZW91dE1pbGxpcykge1xuICAgICAgICAgICAgdGlkID0gc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAgICAgICAgIGlmIChjbGllbnQuY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZygnZW5kaW5nIGNsaWVudCBkdWUgdG8gdGltZW91dCcpO1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0SGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50LmNvbm5lY3Rpb24uc3RyZWFtLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFjbGllbnQuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZygnZW5kaW5nIGNsaWVudCBkdWUgdG8gdGltZW91dCcpO1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0SGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yY2Uga2lsbCB0aGUgbm9kZSBkcml2ZXIsIGFuZCBsZXQgbGlicHEgZG8gaXRzIHRlYXJkb3duXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudC5lbmQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLm9wdGlvbnMuY29ubmVjdGlvblRpbWVvdXRNaWxsaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9nKCdjb25uZWN0aW5nIG5ldyBjbGllbnQnKTtcbiAgICAgICAgY2xpZW50LmNvbm5lY3QoKGVycik9PntcbiAgICAgICAgICAgIGlmICh0aWQpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsaWVudC5vbignZXJyb3InLCBpZGxlTGlzdGVuZXIpO1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKCdjbGllbnQgZmFpbGVkIHRvIGNvbm5lY3QnLCBlcnIpO1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgZGVhZCBjbGllbnQgZnJvbSBvdXIgbGlzdCBvZiBjbGllbnRzXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpZW50cyA9IHRoaXMuX2NsaWVudHMuZmlsdGVyKChjKT0+YyAhPT0gY2xpZW50KTtcbiAgICAgICAgICAgICAgICBpZiAodGltZW91dEhpdCkge1xuICAgICAgICAgICAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gdGVybWluYXRlZCBkdWUgdG8gY29ubmVjdGlvbiB0aW1lb3V0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F1c2U6IGVyclxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBjbGllbnQgd29uXHUyMDE5dCBiZSByZWxlYXNlZCwgc28gbW92ZSBvbiBpbW1lZGlhdGVseVxuICAgICAgICAgICAgICAgIHRoaXMuX3B1bHNlUXVldWUoKTtcbiAgICAgICAgICAgICAgICBpZiAoIXBlbmRpbmdJdGVtLnRpbWVkT3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdJdGVtLmNhbGxiYWNrKGVyciwgdW5kZWZpbmVkLCBOT09QKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKCduZXcgY2xpZW50IGNvbm5lY3RlZCcpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMub25Db25uZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Byb21pc2VUcnkoKCk9PnRoaXMub3B0aW9ucy5vbkNvbm5lY3QoY2xpZW50KSkudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWZ0ZXJDb25uZWN0KGNsaWVudCwgcGVuZGluZ0l0ZW0sIGlkbGVMaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIH0sIChob29rRXJyKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2xpZW50cyA9IHRoaXMuX2NsaWVudHMuZmlsdGVyKChjKT0+YyAhPT0gY2xpZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudC5lbmQoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wdWxzZVF1ZXVlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwZW5kaW5nSXRlbS50aW1lZE91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nSXRlbS5jYWxsYmFjayhob29rRXJyLCB1bmRlZmluZWQsIE5PT1ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYWZ0ZXJDb25uZWN0KGNsaWVudCwgcGVuZGluZ0l0ZW0sIGlkbGVMaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWZ0ZXJDb25uZWN0KGNsaWVudCwgcGVuZGluZ0l0ZW0sIGlkbGVMaXN0ZW5lcikge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1heExpZmV0aW1lU2Vjb25kcyAhPT0gMCkge1xuICAgICAgICAgICAgY29uc3QgbWF4TGlmZXRpbWVUaW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKCdlbmRpbmcgY2xpZW50IGR1ZSB0byBleHBpcmVkIGxpZmV0aW1lJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXhwaXJlZC5hZGQoY2xpZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZGxlSW5kZXggPSB0aGlzLl9pZGxlLmZpbmRJbmRleCgoaWRsZUl0ZW0pPT5pZGxlSXRlbS5jbGllbnQgPT09IGNsaWVudCk7XG4gICAgICAgICAgICAgICAgaWYgKGlkbGVJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWNxdWlyZUNsaWVudChjbGllbnQsIG5ldyBQZW5kaW5nSXRlbSgoZXJyLCBjbGllbnQsIGNsaWVudFJlbGVhc2UpPT5jbGllbnRSZWxlYXNlKCkpLCBpZGxlTGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLm9wdGlvbnMubWF4TGlmZXRpbWVTZWNvbmRzICogMTAwMCk7XG4gICAgICAgICAgICBtYXhMaWZldGltZVRpbWVvdXQudW5yZWYoKTtcbiAgICAgICAgICAgIGNsaWVudC5vbmNlKCdlbmQnLCAoKT0+Y2xlYXJUaW1lb3V0KG1heExpZmV0aW1lVGltZW91dCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3F1aXJlQ2xpZW50KGNsaWVudCwgcGVuZGluZ0l0ZW0sIGlkbGVMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfVxuICAgIC8vIGFjcXVpcmUgYSBjbGllbnQgZm9yIGEgcGVuZGluZyB3b3JrIGl0ZW1cbiAgICBfYWNxdWlyZUNsaWVudChjbGllbnQsIHBlbmRpbmdJdGVtLCBpZGxlTGlzdGVuZXIsIGlzTmV3KSB7XG4gICAgICAgIGlmIChpc05ldykge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdjb25uZWN0JywgY2xpZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXQoJ2FjcXVpcmUnLCBjbGllbnQpO1xuICAgICAgICBjbGllbnQucmVsZWFzZSA9IHRoaXMuX3JlbGVhc2VPbmNlKGNsaWVudCwgaWRsZUxpc3RlbmVyKTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGlkbGVMaXN0ZW5lcik7XG4gICAgICAgIGlmICghcGVuZGluZ0l0ZW0udGltZWRPdXQpIHtcbiAgICAgICAgICAgIGlmIChpc05ldyAmJiB0aGlzLm9wdGlvbnMudmVyaWZ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnZlcmlmeShjbGllbnQsIChlcnIpPT57XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudC5yZWxlYXNlKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGVuZGluZ0l0ZW0uY2FsbGJhY2soZXJyLCB1bmRlZmluZWQsIE5PT1ApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdJdGVtLmNhbGxiYWNrKHVuZGVmaW5lZCwgY2xpZW50LCBjbGllbnQucmVsZWFzZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBlbmRpbmdJdGVtLmNhbGxiYWNrKHVuZGVmaW5lZCwgY2xpZW50LCBjbGllbnQucmVsZWFzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaXNOZXcgJiYgdGhpcy5vcHRpb25zLnZlcmlmeSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy52ZXJpZnkoY2xpZW50LCBjbGllbnQucmVsZWFzZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsaWVudC5yZWxlYXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gcmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd3JhcHMgX3JlbGVhc2UgYW5kIHRocm93cyBpZiBjYWxsZWQgbW9yZSB0aGFuIG9uY2VcbiAgICBfcmVsZWFzZU9uY2UoY2xpZW50LCBpZGxlTGlzdGVuZXIpIHtcbiAgICAgICAgbGV0IHJlbGVhc2VkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiAoZXJyKT0+e1xuICAgICAgICAgICAgaWYgKHJlbGVhc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dPbkRvdWJsZVJlbGVhc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlbGVhc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3JlbGVhc2UoY2xpZW50LCBpZGxlTGlzdGVuZXIsIGVycik7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIHJlbGVhc2UgYSBjbGllbnQgYmFjayB0byB0aGUgcG9sbCwgaW5jbHVkZSBhbiBlcnJvclxuICAgIC8vIHRvIHJlbW92ZSBpdCBmcm9tIHRoZSBwb29sXG4gICAgX3JlbGVhc2UoY2xpZW50LCBpZGxlTGlzdGVuZXIsIGVycikge1xuICAgICAgICBjbGllbnQub24oJ2Vycm9yJywgaWRsZUxpc3RlbmVyKTtcbiAgICAgICAgY2xpZW50Ll9wb29sVXNlQ291bnQgPSAoY2xpZW50Ll9wb29sVXNlQ291bnQgfHwgMCkgKyAxO1xuICAgICAgICB0aGlzLmVtaXQoJ3JlbGVhc2UnLCBlcnIsIGNsaWVudCk7XG4gICAgICAgIC8vIFRPRE8oYm1jKTogZXhwb3NlIGEgcHJvcGVyLCBwdWJsaWMgaW50ZXJmYWNlIF9xdWVyeWFibGUgYW5kIF9lbmRpbmdcbiAgICAgICAgaWYgKGVyciB8fCB0aGlzLmVuZGluZyB8fCAhY2xpZW50Ll9xdWVyeWFibGUgfHwgY2xpZW50Ll9lbmRpbmcgfHwgY2xpZW50Ll9wb29sVXNlQ291bnQgPj0gdGhpcy5vcHRpb25zLm1heFVzZXMpIHtcbiAgICAgICAgICAgIGlmIChjbGllbnQuX3Bvb2xVc2VDb3VudCA+PSB0aGlzLm9wdGlvbnMubWF4VXNlcykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKCdyZW1vdmUgZXhwZW5kZWQgY2xpZW50Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVtb3ZlKGNsaWVudCwgdGhpcy5fcHVsc2VRdWV1ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc0V4cGlyZWQgPSB0aGlzLl9leHBpcmVkLmhhcyhjbGllbnQpO1xuICAgICAgICBpZiAoaXNFeHBpcmVkKSB7XG4gICAgICAgICAgICB0aGlzLmxvZygncmVtb3ZlIGV4cGlyZWQgY2xpZW50Jyk7XG4gICAgICAgICAgICB0aGlzLl9leHBpcmVkLmRlbGV0ZShjbGllbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlbW92ZShjbGllbnQsIHRoaXMuX3B1bHNlUXVldWUuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWRsZSB0aW1lb3V0XG4gICAgICAgIGxldCB0aWQ7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaWRsZVRpbWVvdXRNaWxsaXMgJiYgdGhpcy5faXNBYm92ZU1pbigpKSB7XG4gICAgICAgICAgICB0aWQgPSBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzQWJvdmVNaW4oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZygncmVtb3ZlIGlkbGUgY2xpZW50Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZShjbGllbnQsIHRoaXMuX3B1bHNlUXVldWUuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy5vcHRpb25zLmlkbGVUaW1lb3V0TWlsbGlzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxsb3dFeGl0T25JZGxlKSB7XG4gICAgICAgICAgICAgICAgLy8gYWxsb3cgTm9kZSB0byBleGl0IGlmIHRoaXMgaXMgYWxsIHRoYXQncyBsZWZ0XG4gICAgICAgICAgICAgICAgdGlkLnVucmVmKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGxvd0V4aXRPbklkbGUpIHtcbiAgICAgICAgICAgIGNsaWVudC51bnJlZigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lkbGUucHVzaChuZXcgSWRsZUl0ZW0oY2xpZW50LCBpZGxlTGlzdGVuZXIsIHRpZCkpO1xuICAgICAgICB0aGlzLl9wdWxzZVF1ZXVlKCk7XG4gICAgfVxuICAgIHF1ZXJ5KHRleHQsIHZhbHVlcywgY2IpIHtcbiAgICAgICAgLy8gZ3VhcmQgY2xhdXNlIGFnYWluc3QgcGFzc2luZyBhIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAgICAgICAgaWYgKHR5cGVvZiB0ZXh0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHByb21pc2lmeSh0aGlzLlByb21pc2UsIHRleHQpO1xuICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5jYWxsYmFjayhuZXcgRXJyb3IoJ1Bhc3NpbmcgYSBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyIHRvIHBvb2wucXVlcnkgaXMgbm90IHN1cHBvcnRlZCcpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICAvLyBhbGxvdyBwbGFpbiB0ZXh0IHF1ZXJ5IHdpdGhvdXQgdmFsdWVzLCBidXQgY2FsbGJhY2tcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNiID0gdmFsdWVzO1xuICAgICAgICAgICAgdmFsdWVzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gcHJvbWlzaWZ5KHRoaXMuUHJvbWlzZSwgY2IpO1xuICAgICAgICBjYiA9IHJlc3BvbnNlLmNhbGxiYWNrO1xuICAgICAgICB0aGlzLmNvbm5lY3QoKGVyciwgY2xpZW50KT0+e1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGNsaWVudFJlbGVhc2VkID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBvbkVycm9yID0gKGVycik9PntcbiAgICAgICAgICAgICAgICBpZiAoY2xpZW50UmVsZWFzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjbGllbnRSZWxlYXNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY2xpZW50LnJlbGVhc2UoZXJyKTtcbiAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNsaWVudC5vbmNlKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5sb2coJ2Rpc3BhdGNoaW5nIHF1ZXJ5Jyk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNsaWVudC5xdWVyeSh0ZXh0LCB2YWx1ZXMsIChlcnIsIHJlcyk9PntcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2coJ3F1ZXJ5IGRpc3BhdGNoZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2xpZW50UmVsZWFzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjbGllbnRSZWxlYXNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudC5yZWxlYXNlKGVycik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYih1bmRlZmluZWQsIHJlcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjbGllbnQucmVsZWFzZShlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlc3VsdDtcbiAgICB9XG4gICAgZW5kKGNiKSB7XG4gICAgICAgIHRoaXMubG9nKCdlbmRpbmcnKTtcbiAgICAgICAgaWYgKHRoaXMuZW5kaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoJ0NhbGxlZCBlbmQgb24gcG9vbCBtb3JlIHRoYW4gb25jZScpO1xuICAgICAgICAgICAgcmV0dXJuIGNiID8gY2IoZXJyKSA6IHRoaXMuUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVuZGluZyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHByb21pc2VkID0gcHJvbWlzaWZ5KHRoaXMuUHJvbWlzZSwgY2IpO1xuICAgICAgICB0aGlzLl9lbmRDYWxsYmFjayA9IHByb21pc2VkLmNhbGxiYWNrO1xuICAgICAgICB0aGlzLl9wdWxzZVF1ZXVlKCk7XG4gICAgICAgIHJldHVybiBwcm9taXNlZC5yZXN1bHQ7XG4gICAgfVxuICAgIGdldCB3YWl0aW5nQ291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wZW5kaW5nUXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBnZXQgaWRsZUNvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faWRsZS5sZW5ndGg7XG4gICAgfVxuICAgIGdldCBleHBpcmVkQ291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jbGllbnRzLnJlZHVjZSgoYWNjLCBjbGllbnQpPT5hY2MgKyAodGhpcy5fZXhwaXJlZC5oYXMoY2xpZW50KSA/IDEgOiAwKSwgMCk7XG4gICAgfVxuICAgIGdldCB0b3RhbENvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2xpZW50cy5sZW5ndGg7XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBQb29sO1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5jb25zdCBOYXRpdmVRdWVyeSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29uZmlnLCB2YWx1ZXMsIGNhbGxiYWNrKSB7XG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG4gICAgY29uZmlnID0gdXRpbHMubm9ybWFsaXplUXVlcnlDb25maWcoY29uZmlnLCB2YWx1ZXMsIGNhbGxiYWNrKTtcbiAgICB0aGlzLnRleHQgPSBjb25maWcudGV4dDtcbiAgICB0aGlzLnZhbHVlcyA9IGNvbmZpZy52YWx1ZXM7XG4gICAgdGhpcy5uYW1lID0gY29uZmlnLm5hbWU7XG4gICAgdGhpcy5xdWVyeU1vZGUgPSBjb25maWcucXVlcnlNb2RlO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjb25maWcuY2FsbGJhY2s7XG4gICAgdGhpcy5zdGF0ZSA9ICduZXcnO1xuICAgIHRoaXMuX2FycmF5TW9kZSA9IGNvbmZpZy5yb3dNb2RlID09PSAnYXJyYXknO1xuICAgIC8vIGlmIHRoZSAncm93JyBldmVudCBpcyBsaXN0ZW5lZCBmb3JcbiAgICAvLyB0aGVuIGVtaXQgdGhlbSBhcyB0aGV5IGNvbWUgaW5cbiAgICAvLyB3aXRob3V0IHNldHRpbmcgc2luZ2xlUm93TW9kZSB0byB0cnVlXG4gICAgLy8gdGhpcyBoYXMgYWxtb3N0IG5vIG1lYW5pbmcgYmVjYXVzZSBsaWJwcVxuICAgIC8vIHJlYWRzIGFsbCByb3dzIGludG8gbWVtb3J5IGJlZm9yZSByZXR1cm5pbmcgYW55XG4gICAgdGhpcy5fZW1pdFJvd0V2ZW50cyA9IGZhbHNlO1xuICAgIHRoaXMub24oJ25ld0xpc3RlbmVyJywgKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudCA9PT0gJ3JvdycpIHRoaXMuX2VtaXRSb3dFdmVudHMgPSB0cnVlO1xuICAgIH0pLmJpbmQodGhpcykpO1xufTtcbnV0aWwuaW5oZXJpdHMoTmF0aXZlUXVlcnksIEV2ZW50RW1pdHRlcik7XG5jb25zdCBlcnJvckZpZWxkTWFwID0ge1xuICAgIHNxbFN0YXRlOiAnY29kZScsXG4gICAgc3RhdGVtZW50UG9zaXRpb246ICdwb3NpdGlvbicsXG4gICAgbWVzc2FnZVByaW1hcnk6ICdtZXNzYWdlJyxcbiAgICBjb250ZXh0OiAnd2hlcmUnLFxuICAgIHNjaGVtYU5hbWU6ICdzY2hlbWEnLFxuICAgIHRhYmxlTmFtZTogJ3RhYmxlJyxcbiAgICBjb2x1bW5OYW1lOiAnY29sdW1uJyxcbiAgICBkYXRhVHlwZU5hbWU6ICdkYXRhVHlwZScsXG4gICAgY29uc3RyYWludE5hbWU6ICdjb25zdHJhaW50JyxcbiAgICBzb3VyY2VGaWxlOiAnZmlsZScsXG4gICAgc291cmNlTGluZTogJ2xpbmUnLFxuICAgIHNvdXJjZUZ1bmN0aW9uOiAncm91dGluZSdcbn07XG5OYXRpdmVRdWVyeS5wcm90b3R5cGUuaGFuZGxlRXJyb3IgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAvLyBjb3B5IHBxIGVycm9yIGZpZWxkcyBpbnRvIHRoZSBlcnJvciBvYmplY3RcbiAgICBjb25zdCBmaWVsZHMgPSB0aGlzLm5hdGl2ZS5wcS5yZXN1bHRFcnJvckZpZWxkcygpO1xuICAgIGlmIChmaWVsZHMpIHtcbiAgICAgICAgZm9yKGNvbnN0IGtleSBpbiBmaWVsZHMpe1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZEZpZWxkTmFtZSA9IGVycm9yRmllbGRNYXBba2V5XSB8fCBrZXk7XG4gICAgICAgICAgICBlcnJbbm9ybWFsaXplZEZpZWxkTmFtZV0gPSBmaWVsZHNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5jYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNhbGxiYWNrKGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgfVxuICAgIHRoaXMuc3RhdGUgPSAnZXJyb3InO1xufTtcbk5hdGl2ZVF1ZXJ5LnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24ob25TdWNjZXNzLCBvbkZhaWx1cmUpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0UHJvbWlzZSgpLnRoZW4ob25TdWNjZXNzLCBvbkZhaWx1cmUpO1xufTtcbk5hdGl2ZVF1ZXJ5LnByb3RvdHlwZS5jYXRjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFByb21pc2UoKS5jYXRjaChjYWxsYmFjayk7XG59O1xuTmF0aXZlUXVlcnkucHJvdG90eXBlLl9nZXRQcm9taXNlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3Byb21pc2UpIHJldHVybiB0aGlzLl9wcm9taXNlO1xuICAgIHRoaXMuX3Byb21pc2UgPSBuZXcgUHJvbWlzZSgoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHRoaXMuX29uY2UoJ2VuZCcsIHJlc29sdmUpO1xuICAgICAgICB0aGlzLl9vbmNlKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSkuYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG59O1xuTmF0aXZlUXVlcnkucHJvdG90eXBlLnN1Ym1pdCA9IGZ1bmN0aW9uKGNsaWVudCkge1xuICAgIHRoaXMuc3RhdGUgPSAncnVubmluZyc7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5uYXRpdmUgPSBjbGllbnQubmF0aXZlO1xuICAgIGNsaWVudC5uYXRpdmUuYXJyYXlNb2RlID0gdGhpcy5fYXJyYXlNb2RlO1xuICAgIGxldCBhZnRlciA9IGZ1bmN0aW9uKGVyciwgcm93cywgcmVzdWx0cykge1xuICAgICAgICBjbGllbnQubmF0aXZlLmFycmF5TW9kZSA9IGZhbHNlO1xuICAgICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmVtaXQoJ19kb25lJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBoYW5kbGUgcG9zc2libGUgcXVlcnkgZXJyb3JcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaGFuZGxlRXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBlbWl0IHJvdyBldmVudHMgZm9yIGVhY2ggcm93IGluIHRoZSByZXN1bHRcbiAgICAgICAgaWYgKHNlbGYuX2VtaXRSb3dFdmVudHMpIHtcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICByb3dzLmZvckVhY2goKHJvd09mUm93cywgaSk9PntcbiAgICAgICAgICAgICAgICAgICAgcm93T2ZSb3dzLmZvckVhY2goKHJvdyk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdCgncm93Jywgcm93LCByZXN1bHRzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KCdyb3cnLCByb3csIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGhhbmRsZSBzdWNjZXNzZnVsIHJlc3VsdFxuICAgICAgICBzZWxmLnN0YXRlID0gJ2VuZCc7XG4gICAgICAgIHNlbGYuZW1pdCgnZW5kJywgcmVzdWx0cyk7XG4gICAgICAgIGlmIChzZWxmLmNhbGxiYWNrKSB7XG4gICAgICAgICAgICBzZWxmLmNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBpZiAocHJvY2Vzcy5kb21haW4pIHtcbiAgICAgICAgYWZ0ZXIgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKGFmdGVyKTtcbiAgICB9XG4gICAgLy8gbmFtZWQgcXVlcnlcbiAgICBpZiAodGhpcy5uYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLm5hbWUubGVuZ3RoID4gNjMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1dhcm5pbmchIFBvc3RncmVzIG9ubHkgc3VwcG9ydHMgNjMgY2hhcmFjdGVycyBmb3IgcXVlcnkgbmFtZXMuJyk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdZb3Ugc3VwcGxpZWQgJXMgKCVzKScsIHRoaXMubmFtZSwgdGhpcy5uYW1lLmxlbmd0aCk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUaGlzIGNhbiBjYXVzZSBjb25mbGljdHMgYW5kIHNpbGVudCBlcnJvcnMgZXhlY3V0aW5nIHF1ZXJpZXMnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZXMgPSAodGhpcy52YWx1ZXMgfHwgW10pLm1hcCh1dGlscy5wcmVwYXJlVmFsdWUpO1xuICAgICAgICAvLyBjaGVjayBpZiB0aGUgY2xpZW50IGhhcyBhbHJlYWR5IGV4ZWN1dGVkIHRoaXMgbmFtZWQgcXVlcnlcbiAgICAgICAgLy8gaWYgc28uLi5qdXN0IGV4ZWN1dGUgaXQgYWdhaW4gLSBza2lwIHRoZSBwbGFubmluZyBwaGFzZVxuICAgICAgICBpZiAoY2xpZW50Lm5hbWVkUXVlcmllc1t0aGlzLm5hbWVdKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXh0ICYmIGNsaWVudC5uYW1lZFF1ZXJpZXNbdGhpcy5uYW1lXSAhPT0gdGhpcy50ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKGBQcmVwYXJlZCBzdGF0ZW1lbnRzIG11c3QgYmUgdW5pcXVlIC0gJyR7dGhpcy5uYW1lfScgd2FzIHVzZWQgZm9yIGEgZGlmZmVyZW50IHN0YXRlbWVudGApO1xuICAgICAgICAgICAgICAgIHJldHVybiBhZnRlcihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5uYXRpdmUuZXhlY3V0ZSh0aGlzLm5hbWUsIHZhbHVlcywgYWZ0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHBsYW4gdGhlIG5hbWVkIHF1ZXJ5IHRoZSBmaXJzdCB0aW1lLCB0aGVuIGV4ZWN1dGUgaXRcbiAgICAgICAgcmV0dXJuIGNsaWVudC5uYXRpdmUucHJlcGFyZSh0aGlzLm5hbWUsIHRoaXMudGV4dCwgdmFsdWVzLmxlbmd0aCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gYWZ0ZXIoZXJyKTtcbiAgICAgICAgICAgIGNsaWVudC5uYW1lZFF1ZXJpZXNbc2VsZi5uYW1lXSA9IHNlbGYudGV4dDtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLm5hdGl2ZS5leGVjdXRlKHNlbGYubmFtZSwgdmFsdWVzLCBhZnRlcik7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy52YWx1ZXMpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMudmFsdWVzKSkge1xuICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKCdRdWVyeSB2YWx1ZXMgbXVzdCBiZSBhbiBhcnJheScpO1xuICAgICAgICAgICAgcmV0dXJuIGFmdGVyKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFscyA9IHRoaXMudmFsdWVzLm1hcCh1dGlscy5wcmVwYXJlVmFsdWUpO1xuICAgICAgICBjbGllbnQubmF0aXZlLnF1ZXJ5KHRoaXMudGV4dCwgdmFscywgYWZ0ZXIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5xdWVyeU1vZGUgPT09ICdleHRlbmRlZCcpIHtcbiAgICAgICAgY2xpZW50Lm5hdGl2ZS5xdWVyeSh0aGlzLnRleHQsIFtdLCBhZnRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY2xpZW50Lm5hdGl2ZS5xdWVyeSh0aGlzLnRleHQsIGFmdGVyKTtcbiAgICB9XG59O1xuIiwgImNvbnN0IG5vZGVVdGlscyA9IHJlcXVpcmUoJ3V0aWwnKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxudmFyIE5hdGl2ZTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWNhdGNoXG50cnkge1xuICAgIC8vIFdyYXAgdGhpcyBgcmVxdWlyZSgpYCBpbiBhIHRyeS1jYXRjaCB0byBhdm9pZCB1cHN0cmVhbSBidW5kbGVycyBmcm9tIGNvbXBsYWluaW5nIHRoYXQgdGhpcyBtaWdodCBub3QgYmUgYXZhaWxhYmxlIHNpbmNlIGl0IGlzIGFuIG9wdGlvbmFsIGltcG9ydFxuICAgIE5hdGl2ZSA9IHJlcXVpcmUoJ3BnLW5hdGl2ZScpO1xufSBjYXRjaCAoZSkge1xuICAgIHRocm93IGU7XG59XG5jb25zdCBUeXBlT3ZlcnJpZGVzID0gcmVxdWlyZSgnLi4vdHlwZS1vdmVycmlkZXMnKTtcbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5jb25zdCBDb25uZWN0aW9uUGFyYW1ldGVycyA9IHJlcXVpcmUoJy4uL2Nvbm5lY3Rpb24tcGFyYW1ldGVycycpO1xuY29uc3QgTmF0aXZlUXVlcnkgPSByZXF1aXJlKCcuL3F1ZXJ5Jyk7XG5jb25zdCBxdWVyeVF1ZXVlTGVuZ3RoRGVwcmVjYXRpb25Ob3RpY2UgPSBub2RlVXRpbHMuZGVwcmVjYXRlKCgpPT57fSwgJ0NhbGxpbmcgY2xpZW50LnF1ZXJ5KCkgd2hlbiB0aGUgY2xpZW50IGlzIGFscmVhZHkgZXhlY3V0aW5nIGEgcXVlcnkgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHBnQDkuMC4gVXNlIGFzeW5jL2F3YWl0IG9yIGFuIGV4dGVybmFsIGFzeW5jIGZsb3cgY29udHJvbCBtZWNoYW5pc20gaW5zdGVhZC4nKTtcbmNvbnN0IENsaWVudCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIHRoaXMuX1Byb21pc2UgPSBjb25maWcuUHJvbWlzZSB8fCBnbG9iYWwuUHJvbWlzZTtcbiAgICB0aGlzLl90eXBlcyA9IG5ldyBUeXBlT3ZlcnJpZGVzKGNvbmZpZy50eXBlcyk7XG4gICAgdGhpcy5uYXRpdmUgPSBuZXcgTmF0aXZlKHtcbiAgICAgICAgdHlwZXM6IHRoaXMuX3R5cGVzXG4gICAgfSk7XG4gICAgdGhpcy5fcXVlcnlRdWV1ZSA9IFtdO1xuICAgIHRoaXMuX2VuZGluZyA9IGZhbHNlO1xuICAgIHRoaXMuX2Nvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9xdWVyeWFibGUgPSB0cnVlO1xuICAgIC8vIGtlZXAgdGhlc2Ugb24gdGhlIG9iamVjdCBmb3IgbGVnYWN5IHJlYXNvbnNcbiAgICAvLyBmb3IgdGhlIHRpbWUgYmVpbmcuIFRPRE86IGRlcHJlY2F0ZSBhbGwgdGhpcyBqYXp6XG4gICAgY29uc3QgY3AgPSB0aGlzLmNvbm5lY3Rpb25QYXJhbWV0ZXJzID0gbmV3IENvbm5lY3Rpb25QYXJhbWV0ZXJzKGNvbmZpZyk7XG4gICAgaWYgKGNvbmZpZy5uYXRpdmVDb25uZWN0aW9uU3RyaW5nKSBjcC5uYXRpdmVDb25uZWN0aW9uU3RyaW5nID0gY29uZmlnLm5hdGl2ZUNvbm5lY3Rpb25TdHJpbmc7XG4gICAgdGhpcy51c2VyID0gY3AudXNlcjtcbiAgICAvLyBcImhpZGluZ1wiIHRoZSBwYXNzd29yZCBzbyBpdCBkb2Vzbid0IHNob3cgdXAgaW4gc3RhY2sgdHJhY2VzXG4gICAgLy8gb3IgaWYgdGhlIGNsaWVudCBpcyBjb25zb2xlLmxvZ2dlZFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncGFzc3dvcmQnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogY3AucGFzc3dvcmRcbiAgICB9KTtcbiAgICB0aGlzLmRhdGFiYXNlID0gY3AuZGF0YWJhc2U7XG4gICAgdGhpcy5ob3N0ID0gY3AuaG9zdDtcbiAgICB0aGlzLnBvcnQgPSBjcC5wb3J0O1xuICAgIC8vIGEgaGFzaCB0byBob2xkIG5hbWVkIHF1ZXJpZXNcbiAgICB0aGlzLm5hbWVkUXVlcmllcyA9IHt9O1xufTtcbkNsaWVudC5RdWVyeSA9IE5hdGl2ZVF1ZXJ5O1xudXRpbC5pbmhlcml0cyhDbGllbnQsIEV2ZW50RW1pdHRlcik7XG5DbGllbnQucHJvdG90eXBlLl9lcnJvckFsbFF1ZXJpZXMgPSBmdW5jdGlvbihlcnIpIHtcbiAgICBjb25zdCBlbnF1ZXVlRXJyb3IgPSAocXVlcnkpPT57XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soKCk9PntcbiAgICAgICAgICAgIHF1ZXJ5Lm5hdGl2ZSA9IHRoaXMubmF0aXZlO1xuICAgICAgICAgICAgcXVlcnkuaGFuZGxlRXJyb3IoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBpZiAodGhpcy5faGFzQWN0aXZlUXVlcnkoKSkge1xuICAgICAgICBlbnF1ZXVlRXJyb3IodGhpcy5fYWN0aXZlUXVlcnkpO1xuICAgICAgICB0aGlzLl9hY3RpdmVRdWVyeSA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3F1ZXJ5UXVldWUuZm9yRWFjaChlbnF1ZXVlRXJyb3IpO1xuICAgIHRoaXMuX3F1ZXJ5UXVldWUubGVuZ3RoID0gMDtcbn07XG4vLyBjb25uZWN0IHRvIHRoZSBiYWNrZW5kXG4vLyBwYXNzIGFuIG9wdGlvbmFsIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBvbmNlIGNvbm5lY3RlZFxuLy8gb3Igd2l0aCBhbiBlcnJvciBpZiB0aGVyZSB3YXMgYSBjb25uZWN0aW9uIGVycm9yXG5DbGllbnQucHJvdG90eXBlLl9jb25uZWN0ID0gZnVuY3Rpb24oY2IpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBpZiAodGhpcy5fY29ubmVjdGluZykge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpPT5jYihuZXcgRXJyb3IoJ0NsaWVudCBoYXMgYWxyZWFkeSBiZWVuIGNvbm5lY3RlZC4gWW91IGNhbm5vdCByZXVzZSBhIGNsaWVudC4nKSkpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2Nvbm5lY3RpbmcgPSB0cnVlO1xuICAgIHRoaXMuY29ubmVjdGlvblBhcmFtZXRlcnMuZ2V0TGlicHFDb25uZWN0aW9uU3RyaW5nKGZ1bmN0aW9uKGVyciwgY29uU3RyaW5nKSB7XG4gICAgICAgIGlmIChzZWxmLmNvbm5lY3Rpb25QYXJhbWV0ZXJzLm5hdGl2ZUNvbm5lY3Rpb25TdHJpbmcpIGNvblN0cmluZyA9IHNlbGYuY29ubmVjdGlvblBhcmFtZXRlcnMubmF0aXZlQ29ubmVjdGlvblN0cmluZztcbiAgICAgICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG4gICAgICAgIHNlbGYubmF0aXZlLmNvbm5lY3QoY29uU3RyaW5nLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm5hdGl2ZS5lbmQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHNldCBpbnRlcm5hbCBzdGF0ZXMgdG8gY29ubmVjdGVkXG4gICAgICAgICAgICBzZWxmLl9jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gaGFuZGxlIGNvbm5lY3Rpb24gZXJyb3JzIGZyb20gdGhlIG5hdGl2ZSBsYXllclxuICAgICAgICAgICAgc2VsZi5uYXRpdmUub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fcXVlcnlhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXJyb3JBbGxRdWVyaWVzKGVycik7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNlbGYubmF0aXZlLm9uKCdub3RpZmljYXRpb24nLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXQoJ25vdGlmaWNhdGlvbicsIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbDogbXNnLnJlbG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IG1zZy5leHRyYVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBzaWduYWwgd2UgYXJlIGNvbm5lY3RlZCBub3dcbiAgICAgICAgICAgIHNlbGYuZW1pdCgnY29ubmVjdCcpO1xuICAgICAgICAgICAgc2VsZi5fcHVsc2VRdWVyeVF1ZXVlKHRydWUpO1xuICAgICAgICAgICAgY2IobnVsbCwgdGhpcyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcbkNsaWVudC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3QoY2FsbGJhY2spO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBuZXcgdGhpcy5fUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICB0aGlzLl9jb25uZWN0KChlcnJvcik9PntcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcbi8vIHNlbmQgYSBxdWVyeSB0byB0aGUgc2VydmVyXG4vLyB0aGlzIG1ldGhvZCBpcyBoaWdobHkgb3ZlcmxvYWRlZCB0byB0YWtlXG4vLyAxKSBzdHJpbmcgcXVlcnksIG9wdGlvbmFsIGFycmF5IG9mIHBhcmFtZXRlcnMsIG9wdGlvbmFsIGZ1bmN0aW9uIGNhbGxiYWNrXG4vLyAyKSBvYmplY3QgcXVlcnkgd2l0aCB7XG4vLyAgICBzdHJpbmcgcXVlcnlcbi8vICAgIG9wdGlvbmFsIGFycmF5IHZhbHVlcyxcbi8vICAgIG9wdGlvbmFsIGZ1bmN0aW9uIGNhbGxiYWNrIGluc3RlYWQgb2YgYXMgYSBzZXBhcmF0ZSBwYXJhbWV0ZXJcbi8vICAgIG9wdGlvbmFsIHN0cmluZyBuYW1lIHRvIG5hbWUgJiBjYWNoZSB0aGUgcXVlcnkgcGxhblxuLy8gICAgb3B0aW9uYWwgc3RyaW5nIHJvd01vZGUgPSAnYXJyYXknIGZvciBhbiBhcnJheSBvZiByZXN1bHRzXG4vLyAgfVxuQ2xpZW50LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKGNvbmZpZywgdmFsdWVzLCBjYWxsYmFjaykge1xuICAgIGxldCBxdWVyeTtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGxldCByZWFkVGltZW91dDtcbiAgICBsZXQgcmVhZFRpbWVvdXRUaW1lcjtcbiAgICBsZXQgcXVlcnlDYWxsYmFjaztcbiAgICBpZiAoY29uZmlnID09PSBudWxsIHx8IGNvbmZpZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NsaWVudCB3YXMgcGFzc2VkIGEgbnVsbCBvciB1bmRlZmluZWQgcXVlcnknKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb25maWcuc3VibWl0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlYWRUaW1lb3V0ID0gY29uZmlnLnF1ZXJ5X3RpbWVvdXQgfHwgdGhpcy5jb25uZWN0aW9uUGFyYW1ldGVycy5xdWVyeV90aW1lb3V0O1xuICAgICAgICByZXN1bHQgPSBxdWVyeSA9IGNvbmZpZztcbiAgICAgICAgLy8gYWNjZXB0IHF1ZXJ5KG5ldyBRdWVyeSguLi4pLCAoZXJyLCByZXMpID0+IHsgfSkgc3R5bGVcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jYWxsYmFjayA9IHZhbHVlcztcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlYWRUaW1lb3V0ID0gY29uZmlnLnF1ZXJ5X3RpbWVvdXQgfHwgdGhpcy5jb25uZWN0aW9uUGFyYW1ldGVycy5xdWVyeV90aW1lb3V0O1xuICAgICAgICBxdWVyeSA9IG5ldyBOYXRpdmVRdWVyeShjb25maWcsIHZhbHVlcywgY2FsbGJhY2spO1xuICAgICAgICBpZiAoIXF1ZXJ5LmNhbGxiYWNrKSB7XG4gICAgICAgICAgICBsZXQgcmVzb2x2ZU91dCwgcmVqZWN0T3V0O1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IHRoaXMuX1Byb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgICAgICAgICByZXNvbHZlT3V0ID0gcmVzb2x2ZTtcbiAgICAgICAgICAgICAgICByZWplY3RPdXQgPSByZWplY3Q7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyKT0+e1xuICAgICAgICAgICAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGVycik7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBxdWVyeS5jYWxsYmFjayA9IChlcnIsIHJlcyk9PmVyciA/IHJlamVjdE91dChlcnIpIDogcmVzb2x2ZU91dChyZXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChyZWFkVGltZW91dCkge1xuICAgICAgICBxdWVyeUNhbGxiYWNrID0gcXVlcnkuY2FsbGJhY2sgfHwgKCgpPT57fSk7XG4gICAgICAgIHJlYWRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignUXVlcnkgcmVhZCB0aW1lb3V0Jyk7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpPT57XG4gICAgICAgICAgICAgICAgcXVlcnkuaGFuZGxlRXJyb3IoZXJyb3IsIHRoaXMuY29ubmVjdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHF1ZXJ5Q2FsbGJhY2soZXJyb3IpO1xuICAgICAgICAgICAgLy8gd2UgYWxyZWFkeSByZXR1cm5lZCBhbiBlcnJvcixcbiAgICAgICAgICAgIC8vIGp1c3QgZG8gbm90aGluZyBpZiBxdWVyeSBjb21wbGV0ZXNcbiAgICAgICAgICAgIHF1ZXJ5LmNhbGxiYWNrID0gKCk9Pnt9O1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGZyb20gcXVldWVcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fcXVlcnlRdWV1ZS5pbmRleE9mKHF1ZXJ5KTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcXVlcnlRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fcHVsc2VRdWVyeVF1ZXVlKCk7XG4gICAgICAgIH0sIHJlYWRUaW1lb3V0KTtcbiAgICAgICAgcXVlcnkuY2FsbGJhY2sgPSAoZXJyLCByZXMpPT57XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQocmVhZFRpbWVvdXRUaW1lcik7XG4gICAgICAgICAgICBxdWVyeUNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9xdWVyeWFibGUpIHtcbiAgICAgICAgcXVlcnkubmF0aXZlID0gdGhpcy5uYXRpdmU7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soKCk9PntcbiAgICAgICAgICAgIHF1ZXJ5LmhhbmRsZUVycm9yKG5ldyBFcnJvcignQ2xpZW50IGhhcyBlbmNvdW50ZXJlZCBhIGNvbm5lY3Rpb24gZXJyb3IgYW5kIGlzIG5vdCBxdWVyeWFibGUnKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAodGhpcy5fZW5kaW5nKSB7XG4gICAgICAgIHF1ZXJ5Lm5hdGl2ZSA9IHRoaXMubmF0aXZlO1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpPT57XG4gICAgICAgICAgICBxdWVyeS5oYW5kbGVFcnJvcihuZXcgRXJyb3IoJ0NsaWVudCB3YXMgY2xvc2VkIGFuZCBpcyBub3QgcXVlcnlhYmxlJykpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3F1ZXJ5UXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBxdWVyeVF1ZXVlTGVuZ3RoRGVwcmVjYXRpb25Ob3RpY2UoKTtcbiAgICB9XG4gICAgdGhpcy5fcXVlcnlRdWV1ZS5wdXNoKHF1ZXJ5KTtcbiAgICB0aGlzLl9wdWxzZVF1ZXJ5UXVldWUoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbi8vIGRpc2Nvbm5lY3QgZnJvbSB0aGUgYmFja2VuZCBzZXJ2ZXJcbkNsaWVudC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oY2IpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9lbmRpbmcgPSB0cnVlO1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW5nICYmICF0aGlzLl9jb25uZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5vbmNlKCdjb25uZWN0JywgKCk9PntcbiAgICAgICAgICAgIHRoaXMuZW5kKCgpPT57fSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0O1xuICAgIGlmICghY2IpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IHRoaXMuX1Byb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBjYiA9IChlcnIpPT5lcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMubmF0aXZlLmVuZChmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5fY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIHNlbGYuX2Vycm9yQWxsUXVlcmllcyhuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gdGVybWluYXRlZCcpKTtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljaygoKT0+e1xuICAgICAgICAgICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgICAgICAgICAgIGlmIChjYikgY2IoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5DbGllbnQucHJvdG90eXBlLl9oYXNBY3RpdmVRdWVyeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVRdWVyeSAmJiB0aGlzLl9hY3RpdmVRdWVyeS5zdGF0ZSAhPT0gJ2Vycm9yJyAmJiB0aGlzLl9hY3RpdmVRdWVyeS5zdGF0ZSAhPT0gJ2VuZCc7XG59O1xuQ2xpZW50LnByb3RvdHlwZS5fcHVsc2VRdWVyeVF1ZXVlID0gZnVuY3Rpb24oaW5pdGlhbENvbm5lY3Rpb24pIHtcbiAgICBpZiAoIXRoaXMuX2Nvbm5lY3RlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9oYXNBY3RpdmVRdWVyeSgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcXVlcnkgPSB0aGlzLl9xdWVyeVF1ZXVlLnNoaWZ0KCk7XG4gICAgaWYgKCFxdWVyeSkge1xuICAgICAgICBpZiAoIWluaXRpYWxDb25uZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2RyYWluJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVRdWVyeSA9IHF1ZXJ5O1xuICAgIHF1ZXJ5LnN1Ym1pdCh0aGlzKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBxdWVyeS5vbmNlKCdfZG9uZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLl9wdWxzZVF1ZXJ5UXVldWUoKTtcbiAgICB9KTtcbn07XG4vLyBhdHRlbXB0IHRvIGNhbmNlbCBhbiBpbi1wcm9ncmVzcyBxdWVyeVxuQ2xpZW50LnByb3RvdHlwZS5jYW5jZWwgPSBmdW5jdGlvbihxdWVyeSkge1xuICAgIGlmICh0aGlzLl9hY3RpdmVRdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgICAgdGhpcy5uYXRpdmUuY2FuY2VsKGZ1bmN0aW9uKCkge30pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fcXVlcnlRdWV1ZS5pbmRleE9mKHF1ZXJ5KSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5fcXVlcnlRdWV1ZS5zcGxpY2UodGhpcy5fcXVlcnlRdWV1ZS5pbmRleE9mKHF1ZXJ5KSwgMSk7XG4gICAgfVxufTtcbkNsaWVudC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcbkNsaWVudC5wcm90b3R5cGUudW5yZWYgPSBmdW5jdGlvbigpIHt9O1xuQ2xpZW50LnByb3RvdHlwZS5zZXRUeXBlUGFyc2VyID0gZnVuY3Rpb24ob2lkLCBmb3JtYXQsIHBhcnNlRm4pIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZXMuc2V0VHlwZVBhcnNlcihvaWQsIGZvcm1hdCwgcGFyc2VGbik7XG59O1xuQ2xpZW50LnByb3RvdHlwZS5nZXRUeXBlUGFyc2VyID0gZnVuY3Rpb24ob2lkLCBmb3JtYXQpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZXMuZ2V0VHlwZVBhcnNlcihvaWQsIGZvcm1hdCk7XG59O1xuQ2xpZW50LnByb3RvdHlwZS5pc0Nvbm5lY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0ZWQ7XG59O1xuQ2xpZW50LnByb3RvdHlwZS5nZXRUcmFuc2FjdGlvblN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm5hdGl2ZS5nZXRUcmFuc2FjdGlvblN0YXR1cygpO1xufTtcbiIsICIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2xpZW50Jyk7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuY29uc3QgQ2xpZW50ID0gcmVxdWlyZSgnLi9jbGllbnQnKTtcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuY29uc3QgQ29ubmVjdGlvbiA9IHJlcXVpcmUoJy4vY29ubmVjdGlvbicpO1xuY29uc3QgUmVzdWx0ID0gcmVxdWlyZSgnLi9yZXN1bHQnKTtcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuY29uc3QgUG9vbCA9IHJlcXVpcmUoJ3BnLXBvb2wnKTtcbmNvbnN0IFR5cGVPdmVycmlkZXMgPSByZXF1aXJlKCcuL3R5cGUtb3ZlcnJpZGVzJyk7XG5jb25zdCB7IERhdGFiYXNlRXJyb3IgfSA9IHJlcXVpcmUoJ3BnLXByb3RvY29sJyk7XG5jb25zdCB7IGVzY2FwZUlkZW50aWZpZXIsIGVzY2FwZUxpdGVyYWwgfSA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbmNvbnN0IHBvb2xGYWN0b3J5ID0gKENsaWVudCk9PntcbiAgICByZXR1cm4gY2xhc3MgQm91bmRQb29sIGV4dGVuZHMgUG9vbCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpe1xuICAgICAgICAgICAgc3VwZXIob3B0aW9ucywgQ2xpZW50KTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuY29uc3QgUEcgPSBmdW5jdGlvbihjbGllbnRDb25zdHJ1Y3Rvcikge1xuICAgIHRoaXMuZGVmYXVsdHMgPSBkZWZhdWx0cztcbiAgICB0aGlzLkNsaWVudCA9IGNsaWVudENvbnN0cnVjdG9yO1xuICAgIHRoaXMuUXVlcnkgPSB0aGlzLkNsaWVudC5RdWVyeTtcbiAgICB0aGlzLlBvb2wgPSBwb29sRmFjdG9yeSh0aGlzLkNsaWVudCk7XG4gICAgdGhpcy5fcG9vbHMgPSBbXTtcbiAgICB0aGlzLkNvbm5lY3Rpb24gPSBDb25uZWN0aW9uO1xuICAgIHRoaXMudHlwZXMgPSByZXF1aXJlKCdwZy10eXBlcycpO1xuICAgIHRoaXMuRGF0YWJhc2VFcnJvciA9IERhdGFiYXNlRXJyb3I7XG4gICAgdGhpcy5UeXBlT3ZlcnJpZGVzID0gVHlwZU92ZXJyaWRlcztcbiAgICB0aGlzLmVzY2FwZUlkZW50aWZpZXIgPSBlc2NhcGVJZGVudGlmaWVyO1xuICAgIHRoaXMuZXNjYXBlTGl0ZXJhbCA9IGVzY2FwZUxpdGVyYWw7XG4gICAgdGhpcy5SZXN1bHQgPSBSZXN1bHQ7XG4gICAgdGhpcy51dGlscyA9IHV0aWxzO1xufTtcbmxldCBjbGllbnRDb25zdHJ1Y3RvciA9IENsaWVudDtcbmxldCBmb3JjZU5hdGl2ZSA9IGZhbHNlO1xudHJ5IHtcbiAgICBmb3JjZU5hdGl2ZSA9ICEhcHJvY2Vzcy5lbnYuTk9ERV9QR19GT1JDRV9OQVRJVkU7XG59IGNhdGNoICB7XG4vLyBpZ25vcmUsIGUuZy4sIERlbm8gd2l0aG91dCAtLWFsbG93LWVudlxufVxuaWYgKGZvcmNlTmF0aXZlKSB7XG4gICAgY2xpZW50Q29uc3RydWN0b3IgPSByZXF1aXJlKCcuL25hdGl2ZScpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBuZXcgUEcoY2xpZW50Q29uc3RydWN0b3IpO1xuLy8gbGF6eSByZXF1aXJlIG5hdGl2ZSBtb2R1bGUuLi50aGUgbmF0aXZlIG1vZHVsZSBtYXkgbm90IGhhdmUgaW5zdGFsbGVkXG5PYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICduYXRpdmUnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGdldCAoKSB7XG4gICAgICAgIGxldCBuYXRpdmUgPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmF0aXZlID0gbmV3IFBHKHJlcXVpcmUoJy4vbmF0aXZlJykpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSAhPT0gJ01PRFVMRV9OT1RfRk9VTkQnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIG92ZXJ3cml0ZSBtb2R1bGUuZXhwb3J0cy5uYXRpdmUgc28gdGhhdCBnZXR0ZXIgaXMgbmV2ZXIgY2FsbGVkIGFnYWluXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ25hdGl2ZScsIHtcbiAgICAgICAgICAgIHZhbHVlOiBuYXRpdmVcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuYXRpdmU7XG4gICAgfVxufSk7XG4iLCAiLy8gRVNNIHdyYXBwZXIgZm9yIHBnXG5pbXBvcnQgcGcgZnJvbSAnLi4vbGliL2luZGV4LmpzJztcbi8vIFJlLWV4cG9ydCBhbGwgdGhlIHByb3BlcnRpZXNcbmV4cG9ydCBjb25zdCBDbGllbnQgPSBwZy5DbGllbnQ7XG5leHBvcnQgY29uc3QgUG9vbCA9IHBnLlBvb2w7XG5leHBvcnQgY29uc3QgQ29ubmVjdGlvbiA9IHBnLkNvbm5lY3Rpb247XG5leHBvcnQgY29uc3QgdHlwZXMgPSBwZy50eXBlcztcbmV4cG9ydCBjb25zdCBRdWVyeSA9IHBnLlF1ZXJ5O1xuZXhwb3J0IGNvbnN0IERhdGFiYXNlRXJyb3IgPSBwZy5EYXRhYmFzZUVycm9yO1xuZXhwb3J0IGNvbnN0IGVzY2FwZUlkZW50aWZpZXIgPSBwZy5lc2NhcGVJZGVudGlmaWVyO1xuZXhwb3J0IGNvbnN0IGVzY2FwZUxpdGVyYWwgPSBwZy5lc2NhcGVMaXRlcmFsO1xuZXhwb3J0IGNvbnN0IFJlc3VsdCA9IHBnLlJlc3VsdDtcbmV4cG9ydCBjb25zdCBUeXBlT3ZlcnJpZGVzID0gcGcuVHlwZU92ZXJyaWRlcztcbi8vIEFsc28gZXhwb3J0IHRoZSBkZWZhdWx0c1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRzID0gcGcuZGVmYXVsdHM7XG4vLyBSZS1leHBvcnQgdGhlIGRlZmF1bHRcbmV4cG9ydCBkZWZhdWx0IHBnO1xuIiwgImltcG9ydCB7IFBvb2wgfSBmcm9tICdwZyc7XG5sZXQgcG9vbCA9IG51bGw7XG4vKipcbiAqIEdldCBvciBjcmVhdGUgZGF0YWJhc2UgY29ubmVjdGlvbiBwb29sXG4gKi8gZnVuY3Rpb24gZ2V0UG9vbCgpIHtcbiAgICBpZiAoIXBvb2wpIHtcbiAgICAgICAgY29uc3QgY29ubmVjdGlvblN0cmluZyA9IHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTDtcbiAgICAgICAgaWYgKCFjb25uZWN0aW9uU3RyaW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RBVEFCQVNFX1VSTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcG9vbCA9IG5ldyBQb29sKHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb25TdHJpbmcsXG4gICAgICAgICAgICBtYXg6IDEwLFxuICAgICAgICAgICAgaWRsZVRpbWVvdXRNaWxsaXM6IDMwMDAwLFxuICAgICAgICAgICAgY29ubmVjdGlvblRpbWVvdXRNaWxsaXM6IDIwMDBcbiAgICAgICAgfSk7XG4gICAgICAgIHBvb2wub24oJ2Vycm9yJywgKGVycik9PntcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t2MF0gVW5leHBlY3RlZCBlcnJvciBvbiBpZGxlIGNsaWVudCcsIGVycik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcG9vbDtcbn1cbi8qKlxuICogRXhlY3V0ZSBhIHF1ZXJ5IG9uIHRoZSBkYXRhYmFzZVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBxdWVyeSh0ZXh0LCBwYXJhbXMpIHtcbiAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRQb29sKCkuY29ubmVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjbGllbnQucXVlcnkodGV4dCwgcGFyYW1zKTtcbiAgICB9IGZpbmFsbHl7XG4gICAgICAgIGNsaWVudC5yZWxlYXNlKCk7XG4gICAgfVxufVxuLyoqXG4gKiBDbG9zZSB0aGUgZGF0YWJhc2UgY29ubmVjdGlvbiBwb29sXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlUG9vbCgpIHtcbiAgICBpZiAocG9vbCkge1xuICAgICAgICBhd2FpdCBwb29sLmVuZCgpO1xuICAgICAgICBwb29sID0gbnVsbDtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgcXVlcnkgfSBmcm9tICcuL2RiJztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IFNFTyBibG9nIHJ1blxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVSdW4oaW5wdXQpIHtcbiAgICBjb25zdCBpbml0aWFsUmVzZWFyY2hKc29uID0ge1xuICAgICAgICBleHRlcm5hbF9yZXNlYXJjaDogaW5wdXQuZXh0ZXJuYWxfcmVzZWFyY2ggPz8gbnVsbCxcbiAgICAgICAgcmVzZWFyY2hfc291cmNlOiBpbnB1dC5leHRlcm5hbF9yZXNlYXJjaCA/ICduOG5fZmlyZWNyYXdsJyA6ICdzZW9fYmxvZ19lbmdpbmUnLFxuICAgICAgICBzbWNfY29udGVudF9iYXRjaF9pZDogaW5wdXQuc21jX2NvbnRlbnRfYmF0Y2hfaWQgPz8gbnVsbFxuICAgIH07XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcXVlcnkoYElOU0VSVCBJTlRPIHNlb19ibG9nX3J1bnMgKFxuICAgICAgaW5wdXRfanNvbixcbiAgICAgIGNhbGxiYWNrX3VybCxcbiAgICAgIHN0YXR1cyxcbiAgICAgIHNtY19jb250ZW50X2JhdGNoX2lkLFxuICAgICAgcmVzZWFyY2hfanNvblxuICAgICkgVkFMVUVTICgkMSwgJDIsICdxdWV1ZWQnLCAkMywgJDQpXG4gICAgUkVUVVJOSU5HICpgLCBbXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KGlucHV0KSxcbiAgICAgICAgaW5wdXQuY2FsbGJhY2tfdXJsIHx8IG51bGwsXG4gICAgICAgIGlucHV0LnNtY19jb250ZW50X2JhdGNoX2lkIHx8IG51bGwsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KGluaXRpYWxSZXNlYXJjaEpzb24pXG4gICAgXSk7XG4gICAgcmV0dXJuIHBhcnNlUnVuUm93KHJlc3VsdC5yb3dzWzBdKTtcbn1cbi8qKlxuICogR2V0IGEgcnVuIGJ5IElEXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFJ1bihydW5JZCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIHNlb19ibG9nX3J1bnMgV0hFUkUgaWQgPSAkMScsIFtcbiAgICAgICAgcnVuSWRcbiAgICBdKTtcbiAgICBpZiAocmVzdWx0LnJvd3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VSdW5Sb3cocmVzdWx0LnJvd3NbMF0pO1xufVxuLyoqXG4gKiBVcGRhdGUgcnVuIHN0YXR1cyBhbmQgc3RhZ2Ugb3V0cHV0XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgc3RhdHVzLCBzdGFnZU91dHB1dCkge1xuICAgIGNvbnN0IHN0YWdlRmllbGQgPSBnZXRTdGFnZUZpZWxkKHN0YXR1cyk7XG4gICAgY29uc3QgdXBkYXRlUGFydHMgPSBbXG4gICAgICAgICdzdGF0dXMgPSAkMicsXG4gICAgICAgICd1cGRhdGVkX2F0ID0gTk9XKCknXG4gICAgXTtcbiAgICBjb25zdCBwYXJhbXMgPSBbXG4gICAgICAgIHJ1bklkLFxuICAgICAgICBzdGF0dXNcbiAgICBdO1xuICAgIGlmIChzdGFnZU91dHB1dCAmJiBzdGFnZUZpZWxkKSB7XG4gICAgICAgIGlmIChzdGFnZUZpZWxkID09PSAncmVzZWFyY2hfanNvbicpIHtcbiAgICAgICAgICAgIHVwZGF0ZVBhcnRzLnB1c2goYCR7c3RhZ2VGaWVsZH0gPSBDT0FMRVNDRSgke3N0YWdlRmllbGR9LCAne30nOjpqc29uYikgfHwgJCR7cGFyYW1zLmxlbmd0aCArIDF9Ojpqc29uYmApO1xuICAgICAgICAgICAgcGFyYW1zLnB1c2goSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHJlc2VhcmNoX2FnZW50X291dHB1dDogc3RhZ2VPdXRwdXQsXG4gICAgICAgICAgICAgICAgcmVzZWFyY2hfYWdlbnRfdXBkYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cGRhdGVQYXJ0cy5wdXNoKGAke3N0YWdlRmllbGR9ID0gJCR7cGFyYW1zLmxlbmd0aCArIDF9YCk7XG4gICAgICAgICAgICBwYXJhbXMucHVzaChKU09OLnN0cmluZ2lmeShzdGFnZU91dHB1dCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHF1ZXJ5X3RleHQgPSBgVVBEQVRFIHNlb19ibG9nX3J1bnMgXG4gICAgU0VUICR7dXBkYXRlUGFydHMuam9pbignLCAnKX1cbiAgICBXSEVSRSBpZCA9ICQxXG4gICAgUkVUVVJOSU5HICpgO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHF1ZXJ5KHF1ZXJ5X3RleHQsIHBhcmFtcyk7XG4gICAgcmV0dXJuIHBhcnNlUnVuUm93KHJlc3VsdC5yb3dzWzBdKTtcbn1cbi8qKlxuICogVXBkYXRlIHJ1biB3aXRoIGRyYWZ0IG1hcmtkb3duXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVJ1bkRyYWZ0KHJ1bklkLCBkcmFmdE1hcmtkb3duKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcXVlcnkoYFVQREFURSBzZW9fYmxvZ19ydW5zIFxuICAgIFNFVCBkcmFmdF9tYXJrZG93biA9ICQyLCB1cGRhdGVkX2F0ID0gTk9XKClcbiAgICBXSEVSRSBpZCA9ICQxXG4gICAgUkVUVVJOSU5HICpgLCBbXG4gICAgICAgIHJ1bklkLFxuICAgICAgICBkcmFmdE1hcmtkb3duXG4gICAgXSk7XG4gICAgcmV0dXJuIHBhcnNlUnVuUm93KHJlc3VsdC5yb3dzWzBdKTtcbn1cbi8qKlxuICogVXBkYXRlIHJ1biB3aXRoIGVycm9yXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVJ1bkVycm9yKHJ1bklkLCBlcnJvck1lc3NhZ2UpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBxdWVyeShgVVBEQVRFIHNlb19ibG9nX3J1bnMgXG4gICAgU0VUIHN0YXR1cyA9ICdmYWlsZWQnLCBlcnJvcl9tZXNzYWdlID0gJDIsIHVwZGF0ZWRfYXQgPSBOT1coKVxuICAgIFdIRVJFIGlkID0gJDFcbiAgICBSRVRVUk5JTkcgKmAsIFtcbiAgICAgICAgcnVuSWQsXG4gICAgICAgIGVycm9yTWVzc2FnZVxuICAgIF0pO1xuICAgIHJldHVybiBwYXJzZVJ1blJvdyhyZXN1bHQucm93c1swXSk7XG59XG4vKipcbiAqIENvbXBsZXRlIHJ1biB3aXRoIGZpbmFsIG91dHB1dFxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wbGV0ZVJ1bihydW5JZCwgZmluYWxPdXRwdXQpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBxdWVyeShgVVBEQVRFIHNlb19ibG9nX3J1bnMgXG4gICAgU0VUIHN0YXR1cyA9ICdjb21wbGV0ZWQnLCBmaW5hbF9vdXRwdXRfanNvbiA9ICQyLCBcbiAgICAgICAgY29tcGxldGVkX2F0ID0gTk9XKCksIHVwZGF0ZWRfYXQgPSBOT1coKVxuICAgIFdIRVJFIGlkID0gJDFcbiAgICBSRVRVUk5JTkcgKmAsIFtcbiAgICAgICAgcnVuSWQsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KGZpbmFsT3V0cHV0KVxuICAgIF0pO1xuICAgIHJldHVybiBwYXJzZVJ1blJvdyhyZXN1bHQucm93c1swXSk7XG59XG4vKipcbiAqIE1hcCBzdGF0dXMgdG8gZGF0YWJhc2UgZmllbGQgbmFtZVxuICovIGZ1bmN0aW9uIGdldFN0YWdlRmllbGQoc3RhdHVzKSB7XG4gICAgY29uc3QgZmllbGRNYXAgPSB7XG4gICAgICAgIHF1ZXVlZDogJ3Jlc2VhcmNoX2pzb24nLFxuICAgICAgICByZXNlYXJjaGluZzogJ3Jlc2VhcmNoX2pzb24nLFxuICAgICAgICBvdXRsaW5pbmc6ICdvdXRsaW5lX2pzb24nLFxuICAgICAgICB3cml0aW5nOiAnZHJhZnRfbWFya2Rvd24nLFxuICAgICAgICBzZW9fcWE6ICdvcHRpbWl6ZWRfanNvbicsXG4gICAgICAgIGJyYW5kX3FhOiAnb3B0aW1pemVkX2pzb24nLFxuICAgICAgICBlZGl0aW5nOiAnZHJhZnRfbWFya2Rvd24nLFxuICAgICAgICByZXZpc2luZzogJ2RyYWZ0X21hcmtkb3duJyxcbiAgICAgICAgY29tcGxldGVkOiAnZmluYWxfb3V0cHV0X2pzb24nLFxuICAgICAgICBmYWlsZWQ6IG51bGxcbiAgICB9O1xuICAgIHJldHVybiBmaWVsZE1hcFtzdGF0dXNdO1xufVxuLyoqXG4gKiBSZWNvcmQgY2FsbGJhY2sgYXR0ZW1wdCBpbiBkYXRhYmFzZVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWNvcmRDYWxsYmFja0F0dGVtcHQocnVuSWQsIHN0YXR1cywgcmVzcG9uc2VTdGF0dXMsIGVycm9yTWVzc2FnZSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHF1ZXJ5KGBVUERBVEUgc2VvX2Jsb2dfcnVucyBcbiAgICBTRVQgY2FsbGJhY2tfYXR0ZW1wdGVkX2F0ID0gTk9XKCksIFxuICAgICAgICBjYWxsYmFja19zdGF0dXMgPSAkMixcbiAgICAgICAgY2FsbGJhY2tfcmVzcG9uc2Vfc3RhdHVzID0gJDMsXG4gICAgICAgIGNhbGxiYWNrX2Vycm9yID0gJDQsXG4gICAgICAgIHVwZGF0ZWRfYXQgPSBOT1coKVxuICAgIFdIRVJFIGlkID0gJDFcbiAgICBSRVRVUk5JTkcgKmAsIFtcbiAgICAgICAgcnVuSWQsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgcmVzcG9uc2VTdGF0dXMgfHwgbnVsbCxcbiAgICAgICAgZXJyb3JNZXNzYWdlIHx8IG51bGxcbiAgICBdKTtcbiAgICByZXR1cm4gcGFyc2VSdW5Sb3cocmVzdWx0LnJvd3NbMF0pO1xufVxuLyoqXG4gKiBVcGRhdGUgcmV2aXNpb24gYW5kIGRyYWZ0IGZvciBhIGNvbXBsZXRlZCBydW5cbiAqIEF0b21pY2FsbHkgdXBkYXRlcyBib3RoIHJldmlzZWRfbWFya2Rvd24gYW5kIGZpbmFsX291dHB1dF9qc29uLmVkaXRlZF9kcmFmdF9tYXJrZG93blxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVSZXZpc2lvbkFuZERyYWZ0KHJ1bklkLCByZXZpc2VkTWFya2Rvd24sIGludGVybmFsUmV2aWV3TWV0YWRhdGEpIHtcbiAgICAvLyBGZXRjaCBleGlzdGluZyBydW5cbiAgICBjb25zdCBydW4gPSBhd2FpdCBnZXRSdW4ocnVuSWQpO1xuICAgIGlmICghcnVuKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUnVuIG5vdCBmb3VuZDogJHtydW5JZH1gKTtcbiAgICB9XG4gICAgaWYgKCFydW4uZmluYWxfb3V0cHV0X2pzb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSdW4gaGFzIG5vIGZpbmFsX291dHB1dF9qc29uLiBDYW5ub3QgdXBkYXRlIHJldmlzaW9uLiBSdW4gSUQ6ICR7cnVuSWR9YCk7XG4gICAgfVxuICAgIC8vIFByZXBhcmUgdXBkYXRlZCBmaW5hbF9vdXRwdXRfanNvbiB3aXRoIG1lcmdlZCBpbnRlcm5hbF9yZXZpZXdcbiAgICBjb25zdCB1cGRhdGVkRmluYWxPdXRwdXQgPSB7XG4gICAgICAgIC4uLnJ1bi5maW5hbF9vdXRwdXRfanNvbixcbiAgICAgICAgZWRpdGVkX2RyYWZ0X21hcmtkb3duOiByZXZpc2VkTWFya2Rvd24sXG4gICAgICAgIGludGVybmFsX3Jldmlldzoge1xuICAgICAgICAgICAgLi4ucnVuLmZpbmFsX291dHB1dF9qc29uLmludGVybmFsX3JldmlldyB8fCB7fSxcbiAgICAgICAgICAgIC4uLmludGVybmFsUmV2aWV3TWV0YWRhdGFcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gQXRvbWljYWxseSB1cGRhdGUgYm90aCBjb2x1bW5zXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcXVlcnkoYFVQREFURSBzZW9fYmxvZ19ydW5zIFxuICAgIFNFVCBmaW5hbF9vdXRwdXRfanNvbiA9ICQyLCByZXZpc2VkX21hcmtkb3duID0gJDMsIHVwZGF0ZWRfYXQgPSBOT1coKVxuICAgIFdIRVJFIGlkID0gJDFcbiAgICBSRVRVUk5JTkcgKmAsIFtcbiAgICAgICAgcnVuSWQsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHVwZGF0ZWRGaW5hbE91dHB1dCksXG4gICAgICAgIHJldmlzZWRNYXJrZG93blxuICAgIF0pO1xuICAgIGlmIChyZXN1bHQucm93cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gdXBkYXRlIHJ1bjogJHtydW5JZH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlUnVuUm93KHJlc3VsdC5yb3dzWzBdKTtcbn1cbi8qKlxuICogUGFyc2UgZGF0YWJhc2Ugcm93IHRvIFNlb0Jsb2dSdW4gdHlwZVxuICovIGV4cG9ydCBmdW5jdGlvbiBwYXJzZVJ1blJvdyhyb3cpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogcm93LmlkLFxuICAgICAgICBzdGF0dXM6IHJvdy5zdGF0dXMsXG4gICAgICAgIGlucHV0X2pzb246IHJvdy5pbnB1dF9qc29uLFxuICAgICAgICByZXNlYXJjaF9qc29uOiByb3cucmVzZWFyY2hfanNvbixcbiAgICAgICAgb3V0bGluZV9qc29uOiByb3cub3V0bGluZV9qc29uLFxuICAgICAgICBkcmFmdF9tYXJrZG93bjogcm93LmRyYWZ0X21hcmtkb3duLFxuICAgICAgICBvcHRpbWl6ZWRfanNvbjogcm93Lm9wdGltaXplZF9qc29uLFxuICAgICAgICBmaW5hbF9vdXRwdXRfanNvbjogcm93LmZpbmFsX291dHB1dF9qc29uLFxuICAgICAgICByZXZpc2VkX21hcmtkb3duOiByb3cucmV2aXNlZF9tYXJrZG93biA/PyBudWxsLFxuICAgICAgICBzbWNfY29udGVudF9iYXRjaF9pZDogcm93LnNtY19jb250ZW50X2JhdGNoX2lkLFxuICAgICAgICBlcnJvcl9tZXNzYWdlOiByb3cuZXJyb3JfbWVzc2FnZSxcbiAgICAgICAgY2FsbGJhY2tfdXJsOiByb3cuY2FsbGJhY2tfdXJsLFxuICAgICAgICBjYWxsYmFja19hdHRlbXB0ZWRfYXQ6IHJvdy5jYWxsYmFja19hdHRlbXB0ZWRfYXQgPyBuZXcgRGF0ZShyb3cuY2FsbGJhY2tfYXR0ZW1wdGVkX2F0KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgY2FsbGJhY2tfc3RhdHVzOiByb3cuY2FsbGJhY2tfc3RhdHVzLFxuICAgICAgICBjYWxsYmFja19yZXNwb25zZV9zdGF0dXM6IHJvdy5jYWxsYmFja19yZXNwb25zZV9zdGF0dXMsXG4gICAgICAgIGNhbGxiYWNrX2Vycm9yOiByb3cuY2FsbGJhY2tfZXJyb3IsXG4gICAgICAgIGNyZWF0ZWRfYXQ6IG5ldyBEYXRlKHJvdy5jcmVhdGVkX2F0KSxcbiAgICAgICAgdXBkYXRlZF9hdDogbmV3IERhdGUocm93LnVwZGF0ZWRfYXQpLFxuICAgICAgICBjb21wbGV0ZWRfYXQ6IHJvdy5jb21wbGV0ZWRfYXQgPyBuZXcgRGF0ZShyb3cuY29tcGxldGVkX2F0KSA6IHVuZGVmaW5lZFxuICAgIH07XG59XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50c1wiOntcInNlbmRDYWxsYmFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLy9zZW5kQ2FsbGJhY2tTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBTZW5kIGNhbGxiYWNrIG5vdGlmaWNhdGlvbiB0byB3ZWJob29rIFVSTFxuICogUnVucyBhcyBhIGR1cmFibGUgc3RlcCB0byBlbnN1cmUgY2FsbGJhY2sgZGVsaXZlcnkgaXMgdHJhY2tlZFxuICogRmFpbHVyZXMgZG8gbm90IGJyZWFrIHRoZSBtYWluIHdvcmtmbG93XG4gKlxuICogQHBhcmFtIHJ1bklkIC0gVGhlIHJ1biBJRCB0byBzZW5kIGNhbGxiYWNrIGZvclxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25hbCBjYWxsYmFjayBvcHRpb25zXG4gKiAgIC0gZHJhZnRFdmVudDogRXZlbnQgaWRlbnRpZmllciAoZS5nLiwgXCJyZXZpc2VkX2RyYWZ0X3JlYWR5XCIpXG4gKiAgIC0gY29tcGFjdFBheWxvYWQ6IElmIHRydWUsIG9taXQgZnVsbCBmaW5hbF9vdXRwdXRfanNvbiB0byByZWR1Y2UgcGF5bG9hZCBzaXplXG4gKi8gZXhwb3J0IHZhciBzZW5kQ2FsbGJhY2tTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAvL3NlbmRDYWxsYmFja1N0ZXBcIik7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24tc3RlcC50c1wiOntcInJ1blJldmlzaW9uU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLXN0ZXAvL3J1blJldmlzaW9uU3RlcFwifX19fSovO1xuJ3VzZSBzdGVwJztcbi8qKlxuICogUmV2aXNpb24gQWdlbnQgU3RlcFxuICogUmV2aXNlcyBhbiBleGlzdGluZyBkcmFmdCBiYXNlZCBvbiByZXZpZXdlciBmZWVkYmFjay5cbiAqIERvZXMgTk9UIHVwZGF0ZSB0aGUgZGF0YWJhc2Ugb3IgY2FsbCBjYWxsYmFja3MuXG4gKiBSZXR1cm5zIHJldmlzZWQgTWFya2Rvd24gb25seSwgZm9yIHVzZSBieSByZXZpc2lvbi13b3JrZmxvdy50cy5cbiAqLyBleHBvcnQgdmFyIHJ1blJldmlzaW9uU3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1zdGVwLy9ydW5SZXZpc2lvblN0ZXBcIik7XG4iLCAiaW1wb3J0IHsgZ2V0UnVuLCB1cGRhdGVSZXZpc2lvbkFuZERyYWZ0IH0gZnJvbSAnLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IHNlbmRDYWxsYmFja1N0ZXAgfSBmcm9tICcuL3N0ZXBzL2NhbGxiYWNrLXN0ZXAnO1xuaW1wb3J0IHsgcnVuUmV2aXNpb25TdGVwIH0gZnJvbSAnLi9zdGVwcy9yZXZpc2lvbi1zdGVwJztcbmltcG9ydCB7IHF1ZXJ5IH0gZnJvbSAnLi4vc3RvcmFnZS9kYic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcIndvcmtmbG93c1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvcmV2aXNpb24td29ya2Zsb3cudHNcIjp7XCJyZXZpc2lvbldvcmtmbG93XCI6e1wid29ya2Zsb3dJZFwiOlwid29ya2Zsb3cvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9yZXZpc2lvbi13b3JrZmxvdy8vcmV2aXNpb25Xb3JrZmxvd1wifX19fSovO1xuLyoqXG4gKiBTRU8gQmxvZyBSZXZpc2lvbiBXb3JrZmxvd1xuICogSGFuZGxlcyByZXZpc2lvbnMgdG8gY29tcGxldGVkIGJsb2cgcnVucyBhZnRlciBodW1hbiByZXZpZXcuXG4gKiBEb2VzIE5PVCBjaGFuZ2Ugc2VvX2Jsb2dfcnVucy5zdGF0dXMgKHN0YXlzIFwiY29tcGxldGVkXCIpLlxuICogS2VlcHMgcmV2aXNpb24gc3RhdGUgaW4gZmluYWxfb3V0cHV0X2pzb24uaW50ZXJuYWxfcmV2aWV3IGFuZCByZXZpc2VkX21hcmtkb3duIGNvbHVtbi5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmV2aXNpb25Xb3JrZmxvdyhyZXF1ZXN0KSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gUmV2aXNpb24gV29ya2Zsb3cgc3RhcnRlZCBmb3IgcnVuICR7cmVxdWVzdC5ydW5faWR9LCBtb2RlOiAke3JlcXVlc3QucmV2aXNpb25fbW9kZX1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBWYWxpZGF0ZSByZXF1ZXN0XG4gICAgICAgIGlmICghcmVxdWVzdC5ydW5faWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncnVuX2lkIGlzIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFyZXF1ZXN0LnJldmlzaW9uX21vZGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncmV2aXNpb25fbW9kZSBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcmVxdWVzdC5yZXZpZXdlcl9lbWFpbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZXZpZXdlcl9lbWFpbCBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcmVxdWVzdC5yZXZpZXdlcl9mZWVkYmFjaykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZXZpZXdlcl9mZWVkYmFjayBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZldGNoIHRoZSBleGlzdGluZyBydW5cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmV2aXNpb24gV29ya2Zsb3c6IEZldGNoaW5nIHJ1biAke3JlcXVlc3QucnVuX2lkfWApO1xuICAgICAgICBjb25zdCBydW4gPSBhd2FpdCBnZXRSdW4ocmVxdWVzdC5ydW5faWQpO1xuICAgICAgICBpZiAoIXJ1bikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSdW4gbm90IGZvdW5kOiAke3JlcXVlc3QucnVuX2lkfWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFZhbGlkYXRlIHJ1biBpcyBjb21wbGV0ZWRcbiAgICAgICAgaWYgKHJ1bi5zdGF0dXMgIT09ICdjb21wbGV0ZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJ1biBzdGF0dXMgaXMgXCIke3J1bi5zdGF0dXN9XCIsIG5vdCBcImNvbXBsZXRlZFwiLiBDYW5ub3QgcmV2aXNlIGluY29tcGxldGUgcnVucy5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJ1bi5maW5hbF9vdXRwdXRfanNvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSdW4gaGFzIG5vIGZpbmFsX291dHB1dF9qc29uLiBSdW4gc3RhdHVzOiAke3J1bi5zdGF0dXN9YCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gR2V0IHRoZSBsYXRlc3QgZHJhZnQgbWFya2Rvd24gd2l0aCBwcmlvcml0eTpcbiAgICAgICAgLy8gMS4gcmVxdWVzdC5jdXJyZW50X2RyYWZ0X21hcmtkb3duIChpZiBwcm92aWRlZClcbiAgICAgICAgLy8gMi4gcnVuLmZpbmFsX291dHB1dF9qc29uLmVkaXRlZF9kcmFmdF9tYXJrZG93blxuICAgICAgICAvLyAzLiBydW4uZmluYWxfb3V0cHV0X2pzb24uZHJhZnRfbWFya2Rvd25cbiAgICAgICAgLy8gNC4gcnVuLmRyYWZ0X21hcmtkb3duXG4gICAgICAgIGNvbnN0IGZpbmFsT3V0cHV0ID0gcnVuLmZpbmFsX291dHB1dF9qc29uO1xuICAgICAgICBsZXQgY3VycmVudERyYWZ0ID0gcmVxdWVzdC5jdXJyZW50X2RyYWZ0X21hcmtkb3duIHx8IGZpbmFsT3V0cHV0LmVkaXRlZF9kcmFmdF9tYXJrZG93biB8fCBmaW5hbE91dHB1dC5kcmFmdF9tYXJrZG93biB8fCBydW4uZHJhZnRfbWFya2Rvd247XG4gICAgICAgIGlmICghY3VycmVudERyYWZ0IHx8IHR5cGVvZiBjdXJyZW50RHJhZnQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGRyYWZ0IG1hcmtkb3duIGZvdW5kIGluIHJ1biBvciByZXF1ZXN0LiBDYW5ub3QgcHJvY2VlZCB3aXRoIHJldmlzaW9uLicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyaW0gYW5kIHZhbGlkYXRlIGRyYWZ0XG4gICAgICAgIGN1cnJlbnREcmFmdCA9IGN1cnJlbnREcmFmdC50cmltKCk7XG4gICAgICAgIGlmICghY3VycmVudERyYWZ0IHx8IGN1cnJlbnREcmFmdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRHJhZnQgbWFya2Rvd24gaXMgZW1wdHkgYWZ0ZXIgdHJpbW1pbmcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmV2aXNpb24gV29ya2Zsb3c6IEN1cnJlbnQgZHJhZnQgbGVuZ3RoOiAke2N1cnJlbnREcmFmdC5sZW5ndGh9IGNoYXJzYCk7XG4gICAgICAgIC8vIEJ1aWxkIHJldmlld2VyIGZlZWRiYWNrIHN0cmluZyBmcm9tIGZsZXhpYmxlIGZlZWRiYWNrIG9iamVjdFxuICAgICAgICAvLyBEZWZpbmUga25vd24gZmllbGRzIGluIHByaW9yaXR5IG9yZGVyIHdpdGggaHVtYW4tcmVhZGFibGUgbGFiZWxzXG4gICAgICAgIGNvbnN0IGtub3duRmllbGRzT3JkZXIgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiAncmVxdWVzdGVkX2NoYW5nZXMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnUmVxdWVzdGVkIENoYW5nZXMnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogJ3RvcF9wcmlvcml0eV9maXgnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnVG9wIFByaW9yaXR5IEZpeCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2Vjb25kX3ByaW9yaXR5X2ZpeCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdTZWNvbmQgUHJpb3JpdHkgRml4J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdwcmVzZXJ2ZV9ub3RlcycsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdQcmVzZXJ2ZSBOb3RlcydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiAncmlza19ub3RlcycsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdSaXNrIE5vdGVzJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdyZXdyaXRlX3JlYXNvbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdSZXdyaXRlIFJlYXNvbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiAnbmV3X2RpcmVjdGlvbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdOZXcgRGlyZWN0aW9uJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdtdXN0X2tlZXAnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTXVzdCBLZWVwJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdtdXN0X3JlbW92ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdNdXN0IFJlbW92ZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiAndG9uZV9ub3RlcycsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdUb25lIE5vdGVzJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgICAgICBjb25zdCBmZWVkYmFja1BhcnRzID0gW107XG4gICAgICAgIGNvbnN0IHByb2Nlc3NlZEtleXMgPSBuZXcgU2V0KCk7XG4gICAgICAgIC8vIFByb2Nlc3Mga25vd24gZmllbGRzIGluIG9yZGVyXG4gICAgICAgIGZvciAoY29uc3QgeyBrZXksIGxhYmVsIH0gb2Yga25vd25GaWVsZHNPcmRlcil7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlcXVlc3QucmV2aWV3ZXJfZmVlZGJhY2tba2V5XTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJpbW1lZFZhbHVlID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgICAgIGlmICh0cmltbWVkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tQYXJ0cy5wdXNoKGAke2xhYmVsfTpcXG4ke3RyaW1tZWRWYWx1ZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkS2V5cy5hZGQoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gUHJvY2VzcyBleHRyYSBmaWVsZHMgbm90IGluIGtub3duIGxpc3RcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocmVxdWVzdC5yZXZpZXdlcl9mZWVkYmFjaykpe1xuICAgICAgICAgICAgaWYgKCFwcm9jZXNzZWRLZXlzLmhhcyhrZXkpICYmIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmltbWVkVmFsdWUgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRyaW1tZWRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHNuYWtlX2Nhc2Uga2V5IHRvIFRpdGxlIENhc2UgbGFiZWxcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBrZXkuc3BsaXQoJ18nKS5tYXAoKHdvcmQpPT53b3JkLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgd29yZC5zbGljZSgxKSkuam9pbignICcpO1xuICAgICAgICAgICAgICAgICAgICBmZWVkYmFja1BhcnRzLnB1c2goYCR7bGFiZWx9OlxcbiR7dHJpbW1lZFZhbHVlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgcmV2aWV3ZXJGZWVkYmFjayA9IGZlZWRiYWNrUGFydHMuam9pbignXFxuXFxuJykudHJpbSgpO1xuICAgICAgICBpZiAoIXJldmlld2VyRmVlZGJhY2sgfHwgcmV2aWV3ZXJGZWVkYmFjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmV2aWV3ZXIgZmVlZGJhY2sgaXMgZW1wdHkgYWZ0ZXIgdHJpbW1pbmcuIEF0IGxlYXN0IG9uZSBmZWVkYmFjayBmaWVsZCBpcyByZXF1aXJlZC4nKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXZpc2lvbiBXb3JrZmxvdzogUmV2aWV3ZXIgZmVlZGJhY2sgbGVuZ3RoOiAke3Jldmlld2VyRmVlZGJhY2subGVuZ3RofSBjaGFyc2ApO1xuICAgICAgICAvLyBFeHRyYWN0IGNvbnRleHQgZm9yIHJldmlzaW9uIHN0ZXBcbiAgICAgICAgY29uc3QgaW5wdXQgPSBydW4uaW5wdXRfanNvbiAmJiB0eXBlb2YgcnVuLmlucHV0X2pzb24gPT09ICdvYmplY3QnID8gcnVuLmlucHV0X2pzb24gOiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHJlc2VhcmNoID0gZmluYWxPdXRwdXQucmVzZWFyY2hfanNvbiB8fCB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBmaW5hbE91dHB1dC5vdXRsaW5lX2pzb24gfHwgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzZW9RYSA9IGZpbmFsT3V0cHV0LnNlb19xYV9qc29uIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgbWV0YSA9IGZpbmFsT3V0cHV0Lm1ldGFfanNvbiB8fCB1bmRlZmluZWQ7XG4gICAgICAgIC8vIENhbGwgcmV2aXNpb24gc3RlcCAocnVucyBMTE0sIHJldHVybnMgcmV2aXNlZCBtYXJrZG93bilcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmV2aXNpb24gV29ya2Zsb3c6IENhbGxpbmcgcmV2aXNpb24gc3RlcGApO1xuICAgICAgICBjb25zdCByZXZpc2lvbk91dHB1dCA9IGF3YWl0IHJ1blJldmlzaW9uU3RlcChjdXJyZW50RHJhZnQsIHJldmlld2VyRmVlZGJhY2ssIHJlcXVlc3QucmV2aXNpb25fbW9kZSwgaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSwgbWV0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBSZXZpc2lvbiBjb21wbGV0ZS4gUmV2aXNlZCBtYXJrZG93biBsZW5ndGg6ICR7cmV2aXNpb25PdXRwdXQucmV2aXNlZF9tYXJrZG93bi5sZW5ndGh9IGNoYXJzYCk7XG4gICAgICAgIC8vIFByZXBhcmUgaW50ZXJuYWwgcmV2aWV3IG1ldGFkYXRhXG4gICAgICAgIC8vIFJldmlldyByb3VuZCBwcmlvcml0eTogZmluYWxPdXRwdXQuaW50ZXJuYWxfcmV2aWV3Py5yZXZpZXdfcm91bmQsIHRoZW4gcmVxdWVzdC5yZXZpZXdfcm91bmQsIHRoZW4gMVxuICAgICAgICBjb25zdCBwcmV2aW91c1Jldmlld1JvdW5kID0gZmluYWxPdXRwdXQuaW50ZXJuYWxfcmV2aWV3Py5yZXZpZXdfcm91bmQgfHwgcmVxdWVzdC5yZXZpZXdfcm91bmQgfHwgMTtcbiAgICAgICAgY29uc3QgbmV3UmV2aWV3Um91bmQgPSBwcmV2aW91c1Jldmlld1JvdW5kICsgMTtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxSZXZpZXdNZXRhZGF0YSA9IHtcbiAgICAgICAgICAgIHJldmlld19zdGF0dXM6ICdyZXZpc2VkX3Jldmlld19wZW5kaW5nJyxcbiAgICAgICAgICAgIHJldmlld19yb3VuZDogbmV3UmV2aWV3Um91bmQsXG4gICAgICAgICAgICBwcmV2aW91c19yZXZpZXdfcm91bmQ6IHByZXZpb3VzUmV2aWV3Um91bmQsXG4gICAgICAgICAgICByZXZpc2lvbl9tb2RlOiByZXF1ZXN0LnJldmlzaW9uX21vZGUsXG4gICAgICAgICAgICByZXZpZXdlcl9lbWFpbDogcmVxdWVzdC5yZXZpZXdlcl9lbWFpbCxcbiAgICAgICAgICAgIHVwZGF0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXZpc2lvbiBXb3JrZmxvdzogU2F2aW5nIHJldmlzaW9uIHRvIGRhdGFiYXNlLiBSZXZpZXcgcm91bmQ6ICR7bmV3UmV2aWV3Um91bmR9YCk7XG4gICAgICAgIC8vIFNhdmUgcmV2aXNpb24gdG8gZGF0YWJhc2UgKHVwZGF0ZXMgYm90aCByZXZpc2VkX21hcmtkb3duIGFuZCBmaW5hbF9vdXRwdXRfanNvbi5lZGl0ZWRfZHJhZnRfbWFya2Rvd24pXG4gICAgICAgIGF3YWl0IHVwZGF0ZVJldmlzaW9uQW5kRHJhZnQocmVxdWVzdC5ydW5faWQsIHJldmlzaW9uT3V0cHV0LnJldmlzZWRfbWFya2Rvd24sIGludGVybmFsUmV2aWV3TWV0YWRhdGEpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXZpc2lvbiBXb3JrZmxvdzogUmV2aXNpb24gc2F2ZWQuIFN0YXR1cyByZW1haW5zIFwiY29tcGxldGVkXCJgKTtcbiAgICAgICAgLy8gVXBkYXRlIHNtY19jb250ZW50X2JhdGNoZXMgc3RhdHVzIGlmIGJhdGNoX2lkIGV4aXN0c1xuICAgICAgICBjb25zdCBiYXRjaElkID0gcnVuLnNtY19jb250ZW50X2JhdGNoX2lkIHx8IHJlcXVlc3Quc21jX2NvbnRlbnRfYmF0Y2hfaWQ7XG4gICAgICAgIGlmIChiYXRjaElkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBVcGRhdGluZyBzbWNfY29udGVudF9iYXRjaGVzIHN0YXR1cyBmb3IgYmF0Y2ggJHtiYXRjaElkfWApO1xuICAgICAgICAgICAgICAgIGF3YWl0IHF1ZXJ5KGBVUERBVEUgc21jX2NvbnRlbnRfYmF0Y2hlcyBTRVQgc3RhdHVzID0gJDEsIHVwZGF0ZWRfYXQgPSBOT1coKSBXSEVSRSBpZCA9ICQyYCwgW1xuICAgICAgICAgICAgICAgICAgICAnYmxvZ19yZXZpc2VkX3Jldmlld19wZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgYmF0Y2hJZFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBzbWNfY29udGVudF9iYXRjaGVzIHN0YXR1cyB1cGRhdGVkYCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBGYWlsZWQgdG8gdXBkYXRlIHNtY19jb250ZW50X2JhdGNoZXM6ICR7ZXJyb3JNZXNzYWdlfS4gUmV2aXNpb24gaXMgcHJlc2VydmVkIC0gcHJvY2VlZGluZyB3aXRoIGNhbGxiYWNrLmApO1xuICAgICAgICAgICAgLy8gRG8gTk9UIHJldGhyb3cgLSByZXZpc2lvbiBpcyBhbHJlYWR5IHNhdmVkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VuZCBjYWxsYmFjayBub3RpZmljYXRpb24gdG8gbjhuIHdpdGggZHJhZnRfZXZlbnQgc2lnbmFsXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBTZW5kaW5nIGNhbGxiYWNrIHdpdGggZHJhZnRfZXZlbnRgKTtcbiAgICAgICAgYXdhaXQgc2VuZENhbGxiYWNrU3RlcChyZXF1ZXN0LnJ1bl9pZCwge1xuICAgICAgICAgICAgZHJhZnRFdmVudDogJ3JldmlzZWRfZHJhZnRfcmVhZHknLFxuICAgICAgICAgICAgY29tcGFjdFBheWxvYWQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBDb21wbGV0ZSBmb3IgcnVuICR7cmVxdWVzdC5ydW5faWR9YCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93IGVycm9yOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxucmV2aXNpb25Xb3JrZmxvdy53b3JrZmxvd0lkID0gXCJ3b3JrZmxvdy8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3JldmlzaW9uLXdvcmtmbG93Ly9yZXZpc2lvbldvcmtmbG93XCI7XG5nbG9iYWxUaGlzLl9fcHJpdmF0ZV93b3JrZmxvd3Muc2V0KFwid29ya2Zsb3cvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9yZXZpc2lvbi13b3JrZmxvdy8vcmV2aXNpb25Xb3JrZmxvd1wiLCByZXZpc2lvbldvcmtmbG93KTtcbiIsICIvKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLnRzXCI6e1wicnVuUmVzZWFyY2hTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC8vcnVuUmVzZWFyY2hTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBSZXNlYXJjaCBTdGVwIC0gUGhhc2UgMkMtQVxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIHJlc2VhcmNoIEpTT05cbiAqIE5vIGZpbGVzeXN0ZW0gaW1wb3J0cyAtIHNhZmUgZm9yIHdvcmtmbG93IGNvbnRleHRcbiAqLyBleHBvcnQgdmFyIHJ1blJlc2VhcmNoU3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLy9ydW5SZXNlYXJjaFN0ZXBcIik7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLnRzXCI6e1wicnVuT3V0bGluZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBPdXRsaW5lIFN0ZXAgLSBQaGFzZSAyQy1CXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogQ2FsbHMgQUkgbW9kZWwgdG8gZ2VuZXJhdGUgY29udGVudCBvdXRsaW5lIHdpdGggc3RydWN0dXJlXG4gKiBVc2VzIHJlc2VhcmNoIGRhdGEgaWYgYXZhaWxhYmxlIHRvIGluZm9ybSBvdXRsaW5lXG4gKi8gZXhwb3J0IHZhciBydW5PdXRsaW5lU3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCIpO1xuIiwgIi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzXCI6e1wicnVuV3JpdGVyU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLy9ydW5Xcml0ZXJTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBXcml0ZXIgU3RlcCAtIFBoYXNlIDJDLUNcbiAqIFJ1bnMgaW5zaWRlIGEgZHVyYWJsZSBzdGVwIGZ1bmN0aW9uIChoYXMgTm9kZS5qcyBhY2Nlc3MpXG4gKiBDYWxscyBBSSBtb2RlbCB0byBnZW5lcmF0ZSBmaXJzdCBmdWxsIGJsb2cgZHJhZnQgaW4gTWFya2Rvd25cbiAqIFVzZXMgcmVzZWFyY2ggZGF0YSBhbmQgb3V0bGluZSB0byBzdHJ1Y3R1cmUgdGhlIGNvbnRlbnRcbiAqLyBleHBvcnQgdmFyIHJ1bldyaXRlclN0ZXAgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAvL3J1bldyaXRlclN0ZXBcIik7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAudHNcIjp7XCJydW5TZW9RYVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC8vcnVuU2VvUWFTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBTRU8gUUEgU3RlcCAtIFBoYXNlIDJDLURcbiAqIFJldmlld3MgZHJhZnQgbWFya2Rvd24gYWdhaW5zdCBTRU8gYW5kIGNsaWVudC1nb2FsIGNyaXRlcmlhLlxuICogUmV0dXJucyBzdHJ1Y3R1cmVkIGF1ZGl0IEpTT04uIERvZXMgbm90IHJld3JpdGUgdGhlIGRyYWZ0LlxuICovIGV4cG9ydCB2YXIgcnVuU2VvUWFTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLy9ydW5TZW9RYVN0ZXBcIik7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAudHNcIjp7XCJydW5FZGl0b3JTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAvL3J1bkVkaXRvclN0ZXBcIn19fX0qLztcbid1c2Ugc3RlcCc7XG4vKipcbiAqIEVkaXRvciBBZ2VudCBTdGVwXG4gKiBJbXByb3ZlcyB0aGUgZHJhZnQgYmFzZWQgb24gU0VPIFFBIHJlY29tbWVuZGF0aW9ucyBhbmQgYnJhbmQgZ3VpZGVsaW5lcy5cbiAqIERCIHByb21wdCBjb250cmFjdDogbW9kZWwgcmV0dXJucyBNYXJrZG93biBvbmx5LlxuICogRG9lcyBOT1Qgb3ZlcndyaXRlIG9yaWdpbmFsIGRyYWZ0X21hcmtkb3duOyBlZGl0ZWQgb3V0cHV0IGdvZXMgdG8gZmluYWxfb3V0cHV0X2pzb24uXG4gKi8gZXhwb3J0IHZhciBydW5FZGl0b3JTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLy9ydW5FZGl0b3JTdGVwXCIpO1xuIiwgIi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50c1wiOntcInJ1bk1ldGFTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLy9ydW5NZXRhU3RlcFwifX19fSovO1xuJ3VzZSBzdGVwJztcbi8qKlxuICogTWV0YSBBZ2VudCBTdGVwIC0gUGhhc2UgMkMtRlxuICogR2VuZXJhdGVzIFNFTyBtZXRhZGF0YSBmb3IgaHVtYW4gcmV2aWV3XG4gKiBEb2VzIE5PVCBwdWJsaXNoLCBjYWxsIGV4dGVybmFsIHNlcnZpY2VzLCBvciBvdmVyd3JpdGUgZHJhZnRzXG4gKiBPdXRwdXQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvbiBhcyBtZXRhX2pzb25cbiAqLyBleHBvcnQgdmFyIHJ1bk1ldGFTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC8vcnVuTWV0YVN0ZXBcIik7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50c1wiOntcImNvbXBsZXRlUnVuU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL2NvbXBsZXRlUnVuU3RlcFwifSxcIm1hcmtSdW5GYWlsZWRTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1bkZhaWxlZFN0ZXBcIn0sXCJtYXJrUnVuUnVubmluZ1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuUnVubmluZ1N0ZXBcIn19fX0qLztcbid1c2Ugc3RlcCc7XG4vKipcbiAqIE1hcmsgYSBydW4gYXMgcnVubmluZyAodHJhbnNpdGlvbiBmcm9tIHF1ZXVlZCB0byBydW5uaW5nKVxuICovIGV4cG9ydCB2YXIgbWFya1J1blJ1bm5pbmdTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwiKTtcbi8qKlxuICogTWFyayBhIHJ1biBhcyBmYWlsZWQgd2l0aCBlcnJvciBtZXNzYWdlXG4gKiBDYWxsYmFjayBpcyBzZW50IGJ5IHdvcmtmbG93IG9yY2hlc3RyYXRvciwgbm90IGhlcmVcbiAqLyBleHBvcnQgdmFyIG1hcmtSdW5GYWlsZWRTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5GYWlsZWRTdGVwXCIpO1xuLyoqXG4gKiBDb21wbGV0ZSBhIHJ1biB3aXRoIGZpbmFsIG91dHB1dFxuICogQ2FsbGJhY2sgaXMgc2VudCBieSB3b3JrZmxvdyBvcmNoZXN0cmF0b3IsIG5vdCBoZXJlXG4gKi8gZXhwb3J0IHZhciBjb21wbGV0ZVJ1blN0ZXAgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCIpO1xuIiwgIi8qKlxuICogU0VPIEJsb2cgR2VuZXJhdGlvbiBXb3JrZmxvdyAtIFBoYXNlIDJDLUEvQlxuICogT3JjaGVzdHJhdGVzIG11bHRpLWFnZW50IGNvbnRlbnQgZ2VuZXJhdGlvbiBwaXBlbGluZVxuICogU3RlcCBmdW5jdGlvbnMgYXJlIGludm9rZWQgZGlyZWN0bHkgLSB0aGV5IGhhdmUgJ3VzZSBzdGVwJyBkaXJlY3RpdmVcbiAqIFxuICogRXJyb3IgaGFuZGxpbmcgZW5zdXJlcyBydW4gc3RhdGUgaXMgYWx3YXlzIHBlcnNpc3RlZDpcbiAqIC0gcXVldWVkIFx1MjE5MiBydW5uaW5nIFx1MjE5MiBjb21wbGV0ZWR8ZmFpbGVkXG4gKiAtIE5vIHJ1bnMgc3R1Y2sgaW4gcXVldWVkIHN0YXRlXG4gKi8gLy8gSW1wb3J0IHN0ZXAgZnVuY3Rpb25zICh0aGV5IGhhdmUgJ3VzZSBzdGVwJyBkaXJlY3RpdmUpXG5pbXBvcnQgeyBydW5SZXNlYXJjaFN0ZXAgfSBmcm9tICcuL3N0ZXBzL3Jlc2VhcmNoLXN0ZXAnO1xuaW1wb3J0IHsgcnVuT3V0bGluZVN0ZXAgfSBmcm9tICcuL3N0ZXBzL291dGxpbmUtc3RlcCc7XG5pbXBvcnQgeyBydW5Xcml0ZXJTdGVwIH0gZnJvbSAnLi9zdGVwcy93cml0ZXItc3RlcCc7XG5pbXBvcnQgeyBydW5TZW9RYVN0ZXAgfSBmcm9tICcuL3N0ZXBzL3Nlby1xYS1zdGVwJztcbmltcG9ydCB7IHJ1bkVkaXRvclN0ZXAgfSBmcm9tICcuL3N0ZXBzL2VkaXRvci1zdGVwJztcbmltcG9ydCB7IHJ1bk1ldGFTdGVwIH0gZnJvbSAnLi9zdGVwcy9tZXRhLXN0ZXAnO1xuaW1wb3J0IHsgbWFya1J1blJ1bm5pbmdTdGVwLCBtYXJrUnVuRmFpbGVkU3RlcCwgY29tcGxldGVSdW5TdGVwIH0gZnJvbSAnLi9zdGVwcy9oZWxwZXJzJztcbmltcG9ydCB7IHNlbmRDYWxsYmFja1N0ZXAgfSBmcm9tICcuL3N0ZXBzL2NhbGxiYWNrLXN0ZXAnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJ3b3JrZmxvd3NcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3Nlby1ibG9nLXdvcmtmbG93LnRzXCI6e1wic2VvQmxvZ1dvcmtmbG93XCI6e1wid29ya2Zsb3dJZFwiOlwid29ya2Zsb3cvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zZW8tYmxvZy13b3JrZmxvdy8vc2VvQmxvZ1dvcmtmbG93XCJ9fX19Ki87XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VvQmxvZ1dvcmtmbG93KHJ1bklkLCBpbnB1dCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIFdvcmtmbG93IHN0YXJ0ZWQgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIE1hcmsgcnVuIGFzIHJ1bm5pbmcgKHRyYW5zaXRpb24gZnJvbSBxdWV1ZWQpXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdvcmtmbG93OiBNYXJraW5nIHJ1biBhcyBydW5uaW5nYCk7XG4gICAgICAgIGF3YWl0IG1hcmtSdW5SdW5uaW5nU3RlcChydW5JZCk7XG4gICAgICAgIC8vIFN0YWdlIDE6IFJlc2VhcmNoIC0gcnVucyBhcyBkdXJhYmxlIHN0ZXBcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU3RhZ2UgMTogUnVubmluZyByZXNlYXJjaCBzdGVwYCk7XG4gICAgICAgIGNvbnN0IHJlc2VhcmNoT3V0cHV0ID0gYXdhaXQgcnVuUmVzZWFyY2hTdGVwKHJ1bklkLCBpbnB1dCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFN0YWdlIDE6IFJlc2VhcmNoIGNvbXBsZXRlZCBhbmQgcGVyc2lzdGVkYCk7XG4gICAgICAgIC8vIFN0YWdlIDI6IE91dGxpbmUgLSBydW5zIGFzIGR1cmFibGUgc3RlcFxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSAyOiBSdW5uaW5nIG91dGxpbmUgc3RlcGApO1xuICAgICAgICBjb25zdCBvdXRsaW5lT3V0cHV0ID0gYXdhaXQgcnVuT3V0bGluZVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaE91dHB1dCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFN0YWdlIDI6IE91dGxpbmUgY29tcGxldGVkIGFuZCBwZXJzaXN0ZWRgKTtcbiAgICAgICAgLy8gU3RhZ2UgMzogV3JpdGVyIC0gcnVucyBhcyBkdXJhYmxlIHN0ZXBcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU3RhZ2UgMzogUnVubmluZyB3cml0ZXIgc3RlcGApO1xuICAgICAgICBjb25zdCB3cml0ZXJPdXRwdXQgPSBhd2FpdCBydW5Xcml0ZXJTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hPdXRwdXQsIG91dGxpbmVPdXRwdXQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSAzOiBXcml0ZXIgY29tcGxldGVkIGFuZCBwZXJzaXN0ZWRgKTtcbiAgICAgICAgLy8gU3RhZ2UgNDogU0VPIFFBIC0gcnVucyBhcyBkdXJhYmxlIHN0ZXBcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU3RhZ2UgNDogUnVubmluZyBTRU8gUUEgc3RlcGApO1xuICAgICAgICBjb25zdCBzZW9RYU91dHB1dCA9IGF3YWl0IHJ1blNlb1FhU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoT3V0cHV0LCBvdXRsaW5lT3V0cHV0LCB3cml0ZXJPdXRwdXQuZHJhZnRfbWFya2Rvd24pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSA0OiBTRU8gUUEgY29tcGxldGVkIGFuZCBwZXJzaXN0ZWRgKTtcbiAgICAgICAgLy8gU3RhZ2UgNTogRWRpdG9yIC0gcnVucyBhcyBkdXJhYmxlIHN0ZXBcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU3RhZ2UgNTogUnVubmluZyBlZGl0b3Igc3RlcGApO1xuICAgICAgICBjb25zdCBlZGl0b3JPdXRwdXQgPSBhd2FpdCBydW5FZGl0b3JTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hPdXRwdXQsIG91dGxpbmVPdXRwdXQsIHdyaXRlck91dHB1dC5kcmFmdF9tYXJrZG93biwgc2VvUWFPdXRwdXQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSA1OiBFZGl0b3IgY29tcGxldGVkYCk7XG4gICAgICAgIC8vIFN0YWdlIDY6IE1ldGEgLSBydW5zIGFzIGR1cmFibGUgc3RlcFxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSA2OiBSdW5uaW5nIG1ldGEgc3RlcGApO1xuICAgICAgICBjb25zdCBtZXRhT3V0cHV0ID0gYXdhaXQgcnVuTWV0YVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaE91dHB1dCwgb3V0bGluZU91dHB1dCwgd3JpdGVyT3V0cHV0LmRyYWZ0X21hcmtkb3duLCBzZW9RYU91dHB1dCwgZWRpdG9yT3V0cHV0LmVkaXRlZF9kcmFmdF9tYXJrZG93bik7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFN0YWdlIDY6IE1ldGEgY29tcGxldGVkYCk7XG4gICAgICAgIC8vIENvbXBsZXRlOiBNYXJrIHdvcmtmbG93IGFzIGRvbmUgd2l0aCBodW1hbiByZXZpZXcgcmVxdWlyZWQgKGFmdGVyIGFsbCBzdGFnZXMpXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdvcmtmbG93OiBDb21wbGV0aW5nIHJ1bmApO1xuICAgICAgICBjb25zdCBmaW5hbE91dHB1dCA9IHtcbiAgICAgICAgICAgIHJlc2VhcmNoX2pzb246IHJlc2VhcmNoT3V0cHV0LFxuICAgICAgICAgICAgb3V0bGluZV9qc29uOiBvdXRsaW5lT3V0cHV0LFxuICAgICAgICAgICAgZHJhZnRfbWFya2Rvd246IHdyaXRlck91dHB1dC5kcmFmdF9tYXJrZG93bixcbiAgICAgICAgICAgIHNlb19xYV9qc29uOiBzZW9RYU91dHB1dCxcbiAgICAgICAgICAgIGVkaXRlZF9kcmFmdF9tYXJrZG93bjogZWRpdG9yT3V0cHV0LmVkaXRlZF9kcmFmdF9tYXJrZG93bixcbiAgICAgICAgICAgIGVkaXRvcl9ub3RlczogZWRpdG9yT3V0cHV0LmVkaXRvcl9ub3RlcyxcbiAgICAgICAgICAgIGNoYW5nZXNfbWFkZTogZWRpdG9yT3V0cHV0LmNoYW5nZXNfbWFkZSxcbiAgICAgICAgICAgIG1ldGFfanNvbjogbWV0YU91dHB1dCxcbiAgICAgICAgICAgIGh1bWFuX3Jldmlld19yZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgIHdvcmtmbG93X3N0YXR1czogJ21ldGFfY29tcGxldGVfYXdhaXRpbmdfcmV2aWV3JyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIGF3YWl0IGNvbXBsZXRlUnVuU3RlcChydW5JZCwgZmluYWxPdXRwdXQpO1xuICAgICAgICAvLyBTZW5kIGNvbXBsZXRpb24gY2FsbGJhY2sgKG9yY2hlc3RyYXRvciBsZXZlbCwgbm90IGZyb20gaGVscGVyIHN0ZXApXG4gICAgICAgIC8vIENhbGxiYWNrIGRlbGl2ZXJ5IGZhaWx1cmVzIGRvIG5vdCBmYWlsIHRoZSBjb21wbGV0ZWQgcnVuXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdvcmtmbG93OiBTZW5kaW5nIGNvbXBsZXRpb24gY2FsbGJhY2tgKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNlbmRDYWxsYmFja1N0ZXAocnVuSWQpO1xuICAgICAgICB9IGNhdGNoIChjYWxsYmFja0Vycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBXb3JrZmxvdzogQ2FsbGJhY2sgZGVsaXZlcnkgZmFpbGVkOmAsIGNhbGxiYWNrRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBjYWxsYmFja0Vyci5tZXNzYWdlIDogU3RyaW5nKGNhbGxiYWNrRXJyKSk7XG4gICAgICAgIC8vIENhbGxiYWNrIGZhaWx1cmUgZG9lcyBub3QgZmFpbCB0aGUgd29ya2Zsb3dcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBXb3JrZmxvdyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gV29ya2Zsb3cgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBtYXJrUnVuRmFpbGVkU3RlcChydW5JZCwgZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfSBjYXRjaCAoZmFpbHVyZUVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBGYWlsZWQgdG8gbWFyayBydW4gYXMgZmFpbGVkOmAsIGZhaWx1cmVFcnIgaW5zdGFuY2VvZiBFcnJvciA/IGZhaWx1cmVFcnIubWVzc2FnZSA6IFN0cmluZyhmYWlsdXJlRXJyKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VuZCBmYWlsdXJlIGNhbGxiYWNrIChvcmNoZXN0cmF0b3IgbGV2ZWwsIG5vdCBmcm9tIGhlbHBlciBzdGVwKVxuICAgICAgICAvLyBDYWxsYmFjayBkZWxpdmVyeSBmYWlsdXJlcyBkbyBub3QgY2hhbmdlIHRoZSBmYWlsZWQgc3RhdHVzXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdvcmtmbG93OiBTZW5kaW5nIGZhaWx1cmUgY2FsbGJhY2tgKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNlbmRDYWxsYmFja1N0ZXAocnVuSWQpO1xuICAgICAgICB9IGNhdGNoIChjYWxsYmFja0Vycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBXb3JrZmxvdzogQ2FsbGJhY2sgZGVsaXZlcnkgZmFpbGVkOmAsIGNhbGxiYWNrRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBjYWxsYmFja0Vyci5tZXNzYWdlIDogU3RyaW5nKGNhbGxiYWNrRXJyKSk7XG4gICAgICAgIC8vIENhbGxiYWNrIGZhaWx1cmUgZG9lcyBub3QgY2hhbmdlIHRoZSBmYWlsZWQgc3RhdHVzXG4gICAgICAgIH1cbiAgICAgICAgLy8gUmUtdGhyb3cgdG8gZW5zdXJlIHdvcmtmbG93IGZhaWx1cmUgaXMgcmVjb3JkZWRcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuc2VvQmxvZ1dvcmtmbG93LndvcmtmbG93SWQgPSBcIndvcmtmbG93Ly8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc2VvLWJsb2ctd29ya2Zsb3cvL3Nlb0Jsb2dXb3JrZmxvd1wiO1xuZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzLnNldChcIndvcmtmbG93Ly8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc2VvLWJsb2ctd29ya2Zsb3cvL3Nlb0Jsb2dXb3JrZmxvd1wiLCBzZW9CbG9nV29ya2Zsb3cpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUNBLFlBQVEsUUFBUSxTQUFTLFFBQVEsV0FBVztBQUN4QyxhQUFPLElBQUksWUFBWSxRQUFRLFNBQVMsRUFBRSxNQUFNO0FBQUEsSUFDcEQ7QUFDQSxRQUFNLGNBQU4sTUFBTSxhQUFZO0FBQUEsTUFKbEIsT0FJa0I7QUFBQTtBQUFBO0FBQUEsTUFDZCxZQUFZLFFBQVEsV0FBVTtBQUMxQixhQUFLLFNBQVM7QUFDZCxhQUFLLFlBQVksYUFBYTtBQUM5QixhQUFLLFdBQVc7QUFDaEIsYUFBSyxVQUFVLENBQUM7QUFDaEIsYUFBSyxXQUFXLENBQUM7QUFDakIsYUFBSyxZQUFZO0FBQUEsTUFDckI7QUFBQSxNQUNBLFFBQVE7QUFDSixlQUFPLEtBQUssWUFBWSxLQUFLLE9BQU87QUFBQSxNQUN4QztBQUFBLE1BQ0EsZ0JBQWdCO0FBQ1osWUFBSSxZQUFZLEtBQUssT0FBTyxLQUFLLFVBQVU7QUFDM0MsWUFBSSxjQUFjLE1BQU07QUFDcEIsaUJBQU87QUFBQSxZQUNILE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVTtBQUFBLFlBQ2xDLFNBQVM7QUFBQSxVQUNiO0FBQUEsUUFDSjtBQUNBLGVBQU87QUFBQSxVQUNILE9BQU87QUFBQSxVQUNQLFNBQVM7QUFBQSxRQUNiO0FBQUEsTUFDSjtBQUFBLE1BQ0EsT0FBTyxXQUFXO0FBQ2QsYUFBSyxTQUFTLEtBQUssU0FBUztBQUFBLE1BQ2hDO0FBQUEsTUFDQSxTQUFTLGNBQWM7QUFDbkIsWUFBSTtBQUNKLFlBQUksS0FBSyxTQUFTLFNBQVMsS0FBSyxjQUFjO0FBQzFDLGtCQUFRLEtBQUssU0FBUyxLQUFLLEVBQUU7QUFDN0IsY0FBSSxVQUFVLFVBQVUsQ0FBQyxjQUFjO0FBQ25DLG9CQUFRO0FBQUEsVUFDWjtBQUNBLGNBQUksVUFBVSxLQUFNLFNBQVEsS0FBSyxVQUFVLEtBQUs7QUFDaEQsZUFBSyxRQUFRLEtBQUssS0FBSztBQUN2QixlQUFLLFdBQVcsQ0FBQztBQUFBLFFBQ3JCO0FBQUEsTUFDSjtBQUFBLE1BQ0Esb0JBQW9CO0FBQ2hCLFlBQUksS0FBSyxPQUFPLENBQUMsTUFBTSxLQUFLO0FBQ3hCLGlCQUFNLENBQUMsS0FBSyxNQUFNLEdBQUU7QUFDaEIsZ0JBQUksT0FBTyxLQUFLLGNBQWM7QUFDOUIsZ0JBQUksS0FBSyxVQUFVLElBQUs7QUFBQSxVQUM1QjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsTUFDQSxNQUFNLFFBQVE7QUFDVixZQUFJLFdBQVcsUUFBUTtBQUN2QixhQUFLLGtCQUFrQjtBQUN2QixlQUFNLENBQUMsS0FBSyxNQUFNLEdBQUU7QUFDaEIsc0JBQVksS0FBSyxjQUFjO0FBQy9CLGNBQUksVUFBVSxVQUFVLE9BQU8sQ0FBQyxPQUFPO0FBQ25DLGlCQUFLO0FBQ0wsZ0JBQUksS0FBSyxZQUFZLEdBQUc7QUFDcEIsdUJBQVMsSUFBSSxhQUFZLEtBQUssT0FBTyxPQUFPLEtBQUssV0FBVyxDQUFDLEdBQUcsS0FBSyxTQUFTO0FBQzlFLG1CQUFLLFFBQVEsS0FBSyxPQUFPLE1BQU0sSUFBSSxDQUFDO0FBQ3BDLG1CQUFLLFlBQVksT0FBTyxXQUFXO0FBQUEsWUFDdkM7QUFBQSxVQUNKLFdBQVcsVUFBVSxVQUFVLE9BQU8sQ0FBQyxPQUFPO0FBQzFDLGlCQUFLO0FBQ0wsZ0JBQUksQ0FBQyxLQUFLLFdBQVc7QUFDakIsbUJBQUssU0FBUztBQUNkLGtCQUFJLE9BQVEsUUFBTyxLQUFLO0FBQUEsWUFDNUI7QUFBQSxVQUNKLFdBQVcsVUFBVSxVQUFVLE9BQU8sQ0FBQyxVQUFVLFNBQVM7QUFDdEQsZ0JBQUksTUFBTyxNQUFLLFNBQVMsSUFBSTtBQUM3QixvQkFBUSxDQUFDO0FBQUEsVUFDYixXQUFXLFVBQVUsVUFBVSxPQUFPLENBQUMsT0FBTztBQUMxQyxpQkFBSyxTQUFTO0FBQUEsVUFDbEIsT0FBTztBQUNILGlCQUFLLE9BQU8sVUFBVSxLQUFLO0FBQUEsVUFDL0I7QUFBQSxRQUNKO0FBQ0EsWUFBSSxLQUFLLGNBQWMsR0FBRztBQUN0QixnQkFBTSxJQUFJLE1BQU0sOEJBQThCO0FBQUEsUUFDbEQ7QUFDQSxlQUFPLEtBQUs7QUFBQSxNQUNoQjtBQUFBLElBQ0o7QUFDQSxhQUFTLFNBQVMsT0FBTztBQUNyQixhQUFPO0FBQUEsSUFDWDtBQUZTO0FBQUE7QUFBQTs7O0FDckZUO0FBQUEsd0ZBQUFBLFNBQUE7QUFBQTtBQUFBLFFBQUksUUFBUTtBQUNaLElBQUFBLFFBQU8sVUFBVTtBQUFBLE1BQ2IsUUFBUSxnQ0FBUyxRQUFRLFdBQVc7QUFDaEMsZUFBTztBQUFBLFVBQ0gsT0FBTyxrQ0FBVztBQUNkLG1CQUFPLE1BQU0sTUFBTSxRQUFRLFNBQVM7QUFBQSxVQUN4QyxHQUZPO0FBQUEsUUFHWDtBQUFBLE1BQ0osR0FOUTtBQUFBLElBT1o7QUFBQTtBQUFBOzs7QUNUQTtBQUFBLHdGQUFBQyxTQUFBO0FBQUE7QUFDQSxRQUFJLFlBQVk7QUFDaEIsUUFBSSxPQUFPO0FBQ1gsUUFBSSxZQUFZO0FBQ2hCLFFBQUksV0FBVztBQUNmLElBQUFBLFFBQU8sVUFBVSxnQ0FBUyxVQUFVLFNBQVM7QUFDekMsVUFBSSxTQUFTLEtBQUssT0FBTyxHQUFHO0FBRXhCLGVBQU8sT0FBTyxRQUFRLFFBQVEsS0FBSyxHQUFHLENBQUM7QUFBQSxNQUMzQztBQUNBLFVBQUksVUFBVSxVQUFVLEtBQUssT0FBTztBQUNwQyxVQUFJLENBQUMsU0FBUztBQUVWLGVBQU8sUUFBUSxPQUFPLEtBQUs7QUFBQSxNQUMvQjtBQUNBLFVBQUksT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ3RCLFVBQUksT0FBTyxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7QUFDbEMsVUFBSSxNQUFNO0FBQ04sZUFBTyxxQkFBcUIsSUFBSTtBQUFBLE1BQ3BDO0FBQ0EsVUFBSSxRQUFRLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJO0FBQ3ZDLFVBQUksTUFBTSxRQUFRLENBQUM7QUFDbkIsVUFBSSxPQUFPLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRTtBQUNsQyxVQUFJLFNBQVMsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQ3BDLFVBQUksU0FBUyxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7QUFDcEMsVUFBSSxLQUFLLFFBQVEsQ0FBQztBQUNsQixXQUFLLEtBQUssTUFBTyxXQUFXLEVBQUUsSUFBSTtBQUNsQyxVQUFJO0FBQ0osVUFBSSxTQUFTLGVBQWUsT0FBTztBQUNuQyxVQUFJLFVBQVUsTUFBTTtBQUNoQixlQUFPLElBQUksS0FBSyxLQUFLLElBQUksTUFBTSxPQUFPLEtBQUssTUFBTSxRQUFRLFFBQVEsRUFBRSxDQUFDO0FBR3BFLFlBQUksUUFBUSxJQUFJLEdBQUc7QUFDZixlQUFLLGVBQWUsSUFBSTtBQUFBLFFBQzVCO0FBQ0EsWUFBSSxXQUFXLEdBQUc7QUFDZCxlQUFLLFFBQVEsS0FBSyxRQUFRLElBQUksTUFBTTtBQUFBLFFBQ3hDO0FBQUEsTUFDSixPQUFPO0FBQ0gsZUFBTyxJQUFJLEtBQUssTUFBTSxPQUFPLEtBQUssTUFBTSxRQUFRLFFBQVEsRUFBRTtBQUMxRCxZQUFJLFFBQVEsSUFBSSxHQUFHO0FBQ2YsZUFBSyxZQUFZLElBQUk7QUFBQSxRQUN6QjtBQUFBLE1BQ0o7QUFDQSxhQUFPO0FBQUEsSUFDWCxHQXpDaUI7QUEwQ2pCLGFBQVMsUUFBUSxTQUFTO0FBQ3RCLFVBQUksVUFBVSxLQUFLLEtBQUssT0FBTztBQUMvQixVQUFJLENBQUMsU0FBUztBQUNWO0FBQUEsTUFDSjtBQUNBLFVBQUksT0FBTyxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7QUFDbEMsVUFBSSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDdEIsVUFBSSxNQUFNO0FBQ04sZUFBTyxxQkFBcUIsSUFBSTtBQUFBLE1BQ3BDO0FBQ0EsVUFBSSxRQUFRLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJO0FBQ3ZDLFVBQUksTUFBTSxRQUFRLENBQUM7QUFFbkIsVUFBSSxPQUFPLElBQUksS0FBSyxNQUFNLE9BQU8sR0FBRztBQUNwQyxVQUFJLFFBQVEsSUFBSSxHQUFHO0FBQ2YsYUFBSyxZQUFZLElBQUk7QUFBQSxNQUN6QjtBQUNBLGFBQU87QUFBQSxJQUNYO0FBbEJTO0FBdUJULGFBQVMsZUFBZSxTQUFTO0FBQzdCLFVBQUksUUFBUSxTQUFTLEtBQUssR0FBRztBQUN6QixlQUFPO0FBQUEsTUFDWDtBQUNBLFVBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDL0MsVUFBSSxDQUFDLEtBQU07QUFDWCxVQUFJLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLFVBQUksU0FBUyxLQUFLO0FBQ2QsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLE9BQU8sU0FBUyxNQUFNLEtBQUs7QUFDL0IsVUFBSSxTQUFTLFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLE9BQU8sU0FBUyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLFNBQVMsS0FBSyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ3ZHLGFBQU8sU0FBUyxPQUFPO0FBQUEsSUFDM0I7QUFiUztBQWNULGFBQVMscUJBQXFCLE1BQU07QUFHaEMsYUFBTyxFQUFFLE9BQU87QUFBQSxJQUNwQjtBQUpTO0FBS1QsYUFBUyxRQUFRLEtBQUs7QUFDbEIsYUFBTyxPQUFPLEtBQUssTUFBTTtBQUFBLElBQzdCO0FBRlM7QUFBQTtBQUFBOzs7QUN6RlQ7QUFBQSwwRUFBQUMsU0FBQTtBQUFBO0FBQUEsSUFBQUEsUUFBTyxVQUFVO0FBQ2pCLFFBQUksaUJBQWlCLE9BQU8sVUFBVTtBQUN0QyxhQUFTLE9BQU8sUUFBUTtBQUNwQixlQUFRLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxLQUFJO0FBQ3JDLFlBQUksU0FBUyxVQUFVLENBQUM7QUFDeEIsaUJBQVEsT0FBTyxRQUFPO0FBQ2xCLGNBQUksZUFBZSxLQUFLLFFBQVEsR0FBRyxHQUFHO0FBQ2xDLG1CQUFPLEdBQUcsSUFBSSxPQUFPLEdBQUc7QUFBQSxVQUM1QjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFWUztBQUFBO0FBQUE7OztBQ0ZUO0FBQUEsZ0dBQUFDLFNBQUE7QUFBQTtBQUNBLFFBQUksU0FBUztBQUNiLElBQUFBLFFBQU8sVUFBVTtBQUNqQixhQUFTLGlCQUFpQixLQUFLO0FBQzNCLFVBQUksRUFBRSxnQkFBZ0IsbUJBQW1CO0FBQ3JDLGVBQU8sSUFBSSxpQkFBaUIsR0FBRztBQUFBLE1BQ25DO0FBQ0EsYUFBTyxNQUFNLE1BQU0sR0FBRyxDQUFDO0FBQUEsSUFDM0I7QUFMUztBQU1ULFFBQUksYUFBYTtBQUFBLE1BQ2I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFDQSxxQkFBaUIsVUFBVSxhQUFhLFdBQVc7QUFDL0MsVUFBSSxXQUFXLFdBQVcsT0FBTyxLQUFLLGdCQUFnQixJQUFJO0FBRTFELFVBQUksS0FBSyxnQkFBZ0IsU0FBUyxRQUFRLFNBQVMsSUFBSSxHQUFHO0FBQ3RELGlCQUFTLEtBQUssU0FBUztBQUFBLE1BQzNCO0FBQ0EsVUFBSSxTQUFTLFdBQVcsRUFBRyxRQUFPO0FBQ2xDLGFBQU8sU0FBUyxJQUFJLFNBQVMsVUFBVTtBQUNuQyxZQUFJLFFBQVEsS0FBSyxRQUFRLEtBQUs7QUFHOUIsWUFBSSxhQUFhLGFBQWEsS0FBSyxjQUFjO0FBQzdDLG1CQUFTLFFBQVEsS0FBSyxlQUFlLEtBQU0sUUFBUSxDQUFDLEVBQUUsUUFBUSxVQUFVLEVBQUU7QUFBQSxRQUM5RTtBQUNBLGVBQU8sUUFBUSxNQUFNO0FBQUEsTUFDekIsR0FBRyxJQUFJLEVBQUUsS0FBSyxHQUFHO0FBQUEsSUFDckI7QUFDQSxRQUFJLDBCQUEwQjtBQUFBLE1BQzFCLE9BQU87QUFBQSxNQUNQLFFBQVE7QUFBQSxNQUNSLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxJQUNiO0FBQ0EsUUFBSSxpQkFBaUI7QUFBQSxNQUNqQjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUNBLFFBQUksaUJBQWlCO0FBQUEsTUFDakI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFFQSxxQkFBaUIsVUFBVSxjQUFjLGlCQUFpQixVQUFVLFFBQVEsV0FBVztBQUNuRixVQUFJLFdBQVcsZUFBZSxJQUFJLGVBQWUsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUM5RCxVQUFJLFdBQVcsZUFBZSxJQUFJLGVBQWUsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUM5RCxhQUFPLE1BQU0sV0FBVyxNQUFNO0FBQzlCLGVBQVMsY0FBYyxVQUFVO0FBQzdCLFlBQUksUUFBUSxLQUFLLFFBQVEsS0FBSztBQUc5QixZQUFJLGFBQWEsYUFBYSxLQUFLLGNBQWM7QUFDN0MsbUJBQVMsUUFBUSxLQUFLLGVBQWUsS0FBTSxRQUFRLENBQUMsRUFBRSxRQUFRLE9BQU8sRUFBRTtBQUFBLFFBQzNFO0FBQ0EsZUFBTyxRQUFRLHdCQUF3QixRQUFRO0FBQUEsTUFDbkQ7QUFSUztBQUFBLElBU2I7QUFDQSxRQUFJLFNBQVM7QUFDYixRQUFJLE9BQU8sU0FBUztBQUNwQixRQUFJLFFBQVEsU0FBUztBQUNyQixRQUFJLE1BQU0sU0FBUztBQUNuQixRQUFJLE9BQU87QUFDWCxRQUFJLFdBQVcsSUFBSSxPQUFPO0FBQUEsTUFDdEI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKLEVBQUUsSUFBSSxTQUFTLGFBQWE7QUFDeEIsYUFBTyxNQUFNLGNBQWM7QUFBQSxJQUMvQixDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUM7QUFFZixRQUFJLFlBQVk7QUFBQSxNQUNaLE9BQU87QUFBQSxNQUNQLFFBQVE7QUFBQSxNQUNSLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxNQUNULGNBQWM7QUFBQSxJQUNsQjtBQUVBLFFBQUksWUFBWTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQ0EsYUFBUyxrQkFBa0IsVUFBVTtBQUVqQyxVQUFJLGVBQWUsV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNO0FBQzVELGFBQU8sU0FBUyxjQUFjLEVBQUUsSUFBSTtBQUFBLElBQ3hDO0FBSlM7QUFLVCxhQUFTLE1BQU0sVUFBVTtBQUNyQixVQUFJLENBQUMsU0FBVSxRQUFPLENBQUM7QUFDdkIsVUFBSSxVQUFVLFNBQVMsS0FBSyxRQUFRO0FBQ3BDLFVBQUksYUFBYSxRQUFRLENBQUMsTUFBTTtBQUNoQyxhQUFPLE9BQU8sS0FBSyxTQUFTLEVBQUUsT0FBTyxTQUFTLFFBQVEsVUFBVTtBQUM1RCxZQUFJLFdBQVcsVUFBVSxRQUFRO0FBQ2pDLFlBQUksUUFBUSxRQUFRLFFBQVE7QUFFNUIsWUFBSSxDQUFDLE1BQU8sUUFBTztBQUduQixnQkFBUSxhQUFhLGlCQUFpQixrQkFBa0IsS0FBSyxJQUFJLFNBQVMsT0FBTyxFQUFFO0FBRW5GLFlBQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIsWUFBSSxjQUFjLENBQUMsVUFBVSxRQUFRLFFBQVEsR0FBRztBQUM1QyxtQkFBUztBQUFBLFFBQ2I7QUFDQSxlQUFPLFFBQVEsSUFBSTtBQUNuQixlQUFPO0FBQUEsTUFDWCxHQUFHLENBQUMsQ0FBQztBQUFBLElBQ1Q7QUFwQlM7QUFBQTtBQUFBOzs7QUN0R1Q7QUFBQSwwRkFBQUMsU0FBQTtBQUFBO0FBQ0EsUUFBSSxhQUFhLE9BQU8sUUFBUTtBQUNoQyxJQUFBQSxRQUFPLFVBQVUsZ0NBQVMsV0FBVyxPQUFPO0FBQ3hDLFVBQUksT0FBTyxLQUFLLEtBQUssR0FBRztBQUVwQixlQUFPLFdBQVcsTUFBTSxPQUFPLENBQUMsR0FBRyxLQUFLO0FBQUEsTUFDNUM7QUFDQSxVQUFJLFNBQVM7QUFDYixVQUFJLElBQUk7QUFDUixhQUFNLElBQUksTUFBTSxRQUFPO0FBQ25CLFlBQUksTUFBTSxDQUFDLE1BQU0sTUFBTTtBQUNuQixvQkFBVSxNQUFNLENBQUM7QUFDakIsWUFBRTtBQUFBLFFBQ04sT0FBTztBQUNILGNBQUksV0FBVyxLQUFLLE1BQU0sT0FBTyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUc7QUFDekMsc0JBQVUsT0FBTyxhQUFhLFNBQVMsTUFBTSxPQUFPLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pFLGlCQUFLO0FBQUEsVUFDVCxPQUFPO0FBQ0gsZ0JBQUksY0FBYztBQUNsQixtQkFBTSxJQUFJLGNBQWMsTUFBTSxVQUFVLE1BQU0sSUFBSSxXQUFXLE1BQU0sTUFBSztBQUNwRTtBQUFBLFlBQ0o7QUFDQSxxQkFBUSxJQUFJLEdBQUcsSUFBSSxLQUFLLE1BQU0sY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFFO0FBQ2hELHdCQUFVO0FBQUEsWUFDZDtBQUNBLGlCQUFLLEtBQUssTUFBTSxjQUFjLENBQUMsSUFBSTtBQUFBLFVBQ3ZDO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFDQSxhQUFPLFdBQVcsUUFBUSxRQUFRO0FBQUEsSUFDdEMsR0E1QmlCO0FBQUE7QUFBQTs7O0FDRmpCO0FBQUEsd0ZBQUFDLFNBQUE7QUFBQTtBQUFBLFFBQUksUUFBUTtBQUNaLFFBQUksY0FBYztBQUNsQixRQUFJLFlBQVk7QUFDaEIsUUFBSSxnQkFBZ0I7QUFDcEIsUUFBSSxhQUFhO0FBQ2pCLGFBQVMsVUFBVSxJQUFJO0FBQ25CLGFBQU8sZ0NBQVMsWUFBWSxPQUFPO0FBQy9CLFlBQUksVUFBVSxLQUFNLFFBQU87QUFDM0IsZUFBTyxHQUFHLEtBQUs7QUFBQSxNQUNuQixHQUhPO0FBQUEsSUFJWDtBQUxTO0FBTVQsYUFBUyxVQUFVLE9BQU87QUFDdEIsVUFBSSxVQUFVLEtBQU0sUUFBTztBQUMzQixhQUFPLFVBQVUsVUFBVSxVQUFVLE9BQU8sVUFBVSxVQUFVLFVBQVUsT0FBTyxVQUFVLFNBQVMsVUFBVSxRQUFRLFVBQVU7QUFBQSxJQUNwSTtBQUhTO0FBSVQsYUFBUyxlQUFlLE9BQU87QUFDM0IsVUFBSSxDQUFDLE1BQU8sUUFBTztBQUNuQixhQUFPLE1BQU0sTUFBTSxPQUFPLFNBQVM7QUFBQSxJQUN2QztBQUhTO0FBSVQsYUFBUyxnQkFBZ0IsUUFBUTtBQUM3QixhQUFPLFNBQVMsUUFBUSxFQUFFO0FBQUEsSUFDOUI7QUFGUztBQUdULGFBQVMsa0JBQWtCLE9BQU87QUFDOUIsVUFBSSxDQUFDLE1BQU8sUUFBTztBQUNuQixhQUFPLE1BQU0sTUFBTSxPQUFPLFVBQVUsZUFBZSxDQUFDO0FBQUEsSUFDeEQ7QUFIUztBQUlULGFBQVMscUJBQXFCLE9BQU87QUFDakMsVUFBSSxDQUFDLE1BQU8sUUFBTztBQUNuQixhQUFPLE1BQU0sTUFBTSxPQUFPLFVBQVUsU0FBUyxPQUFPO0FBQ2hELGVBQU8sZ0JBQWdCLEtBQUssRUFBRSxLQUFLO0FBQUEsTUFDdkMsQ0FBQyxDQUFDO0FBQUEsSUFDTjtBQUxTO0FBTVQsUUFBSSxrQkFBa0IsZ0NBQVMsT0FBTztBQUNsQyxVQUFJLENBQUMsT0FBTztBQUNSLGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxJQUFJLFlBQVksT0FBTyxPQUFPLFNBQVMsT0FBTztBQUM5QyxZQUFJLFVBQVUsTUFBTTtBQUNoQixrQkFBUSxXQUFXLEtBQUs7QUFBQSxRQUM1QjtBQUNBLGVBQU87QUFBQSxNQUNYLENBQUM7QUFDRCxhQUFPLEVBQUUsTUFBTTtBQUFBLElBQ25CLEdBWHNCO0FBWXRCLFFBQUksa0JBQWtCLGdDQUFTLE9BQU87QUFDbEMsVUFBSSxDQUFDLE9BQU87QUFDUixlQUFPO0FBQUEsTUFDWDtBQUNBLFVBQUksSUFBSSxZQUFZLE9BQU8sT0FBTyxTQUFTLE9BQU87QUFDOUMsWUFBSSxVQUFVLE1BQU07QUFDaEIsa0JBQVEsV0FBVyxLQUFLO0FBQUEsUUFDNUI7QUFDQSxlQUFPO0FBQUEsTUFDWCxDQUFDO0FBQ0QsYUFBTyxFQUFFLE1BQU07QUFBQSxJQUNuQixHQVhzQjtBQVl0QixRQUFJLG1CQUFtQixnQ0FBUyxPQUFPO0FBQ25DLFVBQUksQ0FBQyxPQUFPO0FBQ1IsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLElBQUksWUFBWSxPQUFPLEtBQUs7QUFDaEMsYUFBTyxFQUFFLE1BQU07QUFBQSxJQUNuQixHQU51QjtBQU92QixRQUFJLGlCQUFpQixnQ0FBUyxPQUFPO0FBQ2pDLFVBQUksQ0FBQyxPQUFPO0FBQ1IsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLElBQUksWUFBWSxPQUFPLE9BQU8sU0FBUyxPQUFPO0FBQzlDLFlBQUksVUFBVSxNQUFNO0FBQ2hCLGtCQUFRLFVBQVUsS0FBSztBQUFBLFFBQzNCO0FBQ0EsZUFBTztBQUFBLE1BQ1gsQ0FBQztBQUNELGFBQU8sRUFBRSxNQUFNO0FBQUEsSUFDbkIsR0FYcUI7QUFZckIsUUFBSSxxQkFBcUIsZ0NBQVMsT0FBTztBQUNyQyxVQUFJLENBQUMsT0FBTztBQUNSLGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxJQUFJLFlBQVksT0FBTyxPQUFPLFNBQVMsT0FBTztBQUM5QyxZQUFJLFVBQVUsTUFBTTtBQUNoQixrQkFBUSxjQUFjLEtBQUs7QUFBQSxRQUMvQjtBQUNBLGVBQU87QUFBQSxNQUNYLENBQUM7QUFDRCxhQUFPLEVBQUUsTUFBTTtBQUFBLElBQ25CLEdBWHlCO0FBWXpCLFFBQUksa0JBQWtCLGdDQUFTLE9BQU87QUFDbEMsVUFBSSxDQUFDLE9BQU87QUFDUixlQUFPO0FBQUEsTUFDWDtBQUNBLGFBQU8sTUFBTSxNQUFNLE9BQU8sVUFBVSxVQUFVLENBQUM7QUFBQSxJQUNuRCxHQUxzQjtBQU10QixRQUFJLGVBQWUsZ0NBQVMsT0FBTztBQUMvQixhQUFPLFNBQVMsT0FBTyxFQUFFO0FBQUEsSUFDN0IsR0FGbUI7QUFHbkIsUUFBSSxrQkFBa0IsZ0NBQVMsT0FBTztBQUNsQyxVQUFJLFNBQVMsT0FBTyxLQUFLO0FBQ3pCLFVBQUksUUFBUSxLQUFLLE1BQU0sR0FBRztBQUN0QixlQUFPO0FBQUEsTUFDWDtBQUNBLGFBQU87QUFBQSxJQUNYLEdBTnNCO0FBT3RCLFFBQUksaUJBQWlCLGdDQUFTLE9BQU87QUFDakMsVUFBSSxDQUFDLE9BQU87QUFDUixlQUFPO0FBQUEsTUFDWDtBQUNBLGFBQU8sTUFBTSxNQUFNLE9BQU8sVUFBVSxLQUFLLEtBQUssQ0FBQztBQUFBLElBQ25ELEdBTHFCO0FBTXJCLFFBQUksYUFBYSxnQ0FBUyxPQUFPO0FBQzdCLFVBQUksTUFBTSxDQUFDLE1BQU0sS0FBSztBQUNsQixlQUFPO0FBQUEsTUFDWDtBQUNBLGNBQVEsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsRUFBRSxNQUFNLEdBQUc7QUFDdEQsYUFBTztBQUFBLFFBQ0gsR0FBRyxXQUFXLE1BQU0sQ0FBQyxDQUFDO0FBQUEsUUFDdEIsR0FBRyxXQUFXLE1BQU0sQ0FBQyxDQUFDO0FBQUEsTUFDMUI7QUFBQSxJQUNKLEdBVGlCO0FBVWpCLFFBQUksY0FBYyxnQ0FBUyxPQUFPO0FBQzlCLFVBQUksTUFBTSxDQUFDLE1BQU0sT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLO0FBQ3RDLGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxRQUFRO0FBQ1osVUFBSSxTQUFTO0FBQ2IsVUFBSSxjQUFjO0FBQ2xCLGVBQVEsSUFBSSxHQUFHLElBQUksTUFBTSxTQUFTLEdBQUcsS0FBSTtBQUNyQyxZQUFJLENBQUMsYUFBYTtBQUNkLG1CQUFTLE1BQU0sQ0FBQztBQUFBLFFBQ3BCO0FBQ0EsWUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLO0FBQ2xCLHdCQUFjO0FBQ2Q7QUFBQSxRQUNKLFdBQVcsQ0FBQyxhQUFhO0FBQ3JCO0FBQUEsUUFDSjtBQUNBLFlBQUksTUFBTSxDQUFDLE1BQU0sS0FBSztBQUNsQjtBQUFBLFFBQ0o7QUFDQSxrQkFBVSxNQUFNLENBQUM7QUFBQSxNQUNyQjtBQUNBLFVBQUksU0FBUyxXQUFXLEtBQUs7QUFDN0IsYUFBTyxTQUFTLFdBQVcsTUFBTTtBQUNqQyxhQUFPO0FBQUEsSUFDWCxHQXpCa0I7QUEwQmxCLFFBQUksT0FBTyxnQ0FBUyxVQUFVO0FBQzFCLGVBQVMsSUFBSSxlQUFlO0FBQzVCLGVBQVMsSUFBSSxZQUFZO0FBQ3pCLGVBQVMsSUFBSSxZQUFZO0FBQ3pCLGVBQVMsSUFBSSxZQUFZO0FBQ3pCLGVBQVMsS0FBSyxVQUFVO0FBQ3hCLGVBQVMsS0FBSyxVQUFVO0FBQ3hCLGVBQVMsSUFBSSxTQUFTO0FBQ3RCLGVBQVMsTUFBTSxTQUFTO0FBQ3hCLGVBQVMsTUFBTSxTQUFTO0FBQ3hCLGVBQVMsTUFBTSxTQUFTO0FBQ3hCLGVBQVMsS0FBSyxVQUFVO0FBQ3hCLGVBQVMsS0FBSyxnQkFBZ0I7QUFDOUIsZUFBUyxLQUFLLFdBQVc7QUFDekIsZUFBUyxLQUFNLGNBQWM7QUFDN0IsZUFBUyxNQUFNLGVBQWU7QUFDOUIsZUFBUyxNQUFNLGlCQUFpQjtBQUNoQyxlQUFTLE1BQU0saUJBQWlCO0FBQ2hDLGVBQVMsTUFBTSxpQkFBaUI7QUFDaEMsZUFBUyxNQUFNLG9CQUFvQjtBQUNuQyxlQUFTLE1BQU0sZUFBZTtBQUM5QixlQUFTLE1BQU0sZUFBZTtBQUM5QixlQUFTLE1BQU0sZUFBZTtBQUM5QixlQUFTLE1BQU0sZUFBZTtBQUM5QixlQUFTLE1BQU0sZ0JBQWdCO0FBQy9CLGVBQVMsTUFBTSxnQkFBZ0I7QUFDL0IsZUFBUyxNQUFNLGdCQUFnQjtBQUMvQixlQUFTLE1BQU0sZ0JBQWdCO0FBQy9CLGVBQVMsTUFBTSxnQkFBZ0I7QUFDL0IsZUFBUyxNQUFNLGdCQUFnQjtBQUMvQixlQUFTLE1BQU0sY0FBYztBQUM3QixlQUFTLE1BQU0sY0FBYztBQUM3QixlQUFTLE1BQU0sY0FBYztBQUM3QixlQUFTLE1BQU0sYUFBYTtBQUM1QixlQUFTLE1BQU0sa0JBQWtCO0FBQ2pDLGVBQVMsSUFBSSxVQUFVO0FBQ3ZCLGVBQVMsS0FBSyxLQUFLLE1BQU0sS0FBSyxJQUFJLENBQUM7QUFDbkMsZUFBUyxNQUFNLEtBQUssTUFBTSxLQUFLLElBQUksQ0FBQztBQUNwQyxlQUFTLEtBQUssY0FBYztBQUM1QixlQUFTLE1BQU0sY0FBYztBQUM3QixlQUFTLE1BQU0sZ0JBQWdCO0FBQy9CLGVBQVMsTUFBTSxnQkFBZ0I7QUFDL0IsZUFBUyxLQUFLLGdCQUFnQjtBQUM5QixlQUFTLE1BQU0sZ0JBQWdCO0FBQy9CLGVBQVMsTUFBTSxnQkFBZ0I7QUFBQSxJQUNuQyxHQTdDVztBQThDWCxJQUFBQSxRQUFPLFVBQVU7QUFBQSxNQUNiO0FBQUEsSUFDSjtBQUFBO0FBQUE7OztBQ2pNQTtBQUFBLDRFQUFBQyxTQUFBO0FBQUE7QUFFQSxRQUFJLE9BQU87QUFDWCxhQUFTLFNBQVMsUUFBUTtBQUN0QixVQUFJLE9BQU8sT0FBTyxZQUFZLENBQUM7QUFDL0IsVUFBSSxNQUFNLE9BQU8sYUFBYSxDQUFDO0FBQy9CLFVBQUksT0FBTztBQUNYLFVBQUksT0FBTyxHQUFHO0FBQ1YsZUFBTyxDQUFDLFFBQVEsUUFBUTtBQUN4QixjQUFNLENBQUMsTUFBTSxNQUFNO0FBQ25CLGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxTQUFTO0FBQ2IsVUFBSTtBQUNKLFVBQUk7QUFDSixVQUFJO0FBQ0osVUFBSTtBQUNKLFVBQUk7QUFDSixVQUFJO0FBQ0o7QUFDSSxnQkFBUSxPQUFPO0FBQ2YsZUFBTyxPQUFPLFNBQVM7QUFDdkIsWUFBSSxhQUFjLFFBQVE7QUFDMUIsY0FBTSxJQUFJLFNBQVM7QUFDbkIsaUJBQVMsTUFBTSxJQUFJLE9BQU87QUFDMUIsWUFBSSxRQUFRLEtBQUssU0FBUyxHQUFHO0FBQ3pCLGlCQUFPLE9BQU8sU0FBUztBQUFBLFFBQzNCO0FBQ0EsY0FBTTtBQUNOLFlBQUksSUFBSSxPQUFPO0FBQ2YsYUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLEtBQUk7QUFDbEIsaUJBQU87QUFBQSxRQUNYO0FBQ0EsaUJBQVMsTUFBTSxTQUFTO0FBQUEsTUFDNUI7QUFDQTtBQUNJLGdCQUFRLE9BQU87QUFDZixlQUFPLE9BQU8sU0FBUztBQUN2QixZQUFJLGFBQWMsUUFBUTtBQUMxQixjQUFNLElBQUksU0FBUztBQUNuQixpQkFBUyxNQUFNLElBQUksT0FBTztBQUMxQixZQUFJLFFBQVEsS0FBSyxTQUFTLEdBQUc7QUFDekIsaUJBQU8sT0FBTyxTQUFTO0FBQUEsUUFDM0I7QUFDQSxjQUFNO0FBQ04sWUFBSSxJQUFJLE9BQU87QUFDZixhQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSTtBQUNsQixpQkFBTztBQUFBLFFBQ1g7QUFDQSxpQkFBUyxNQUFNLFNBQVM7QUFBQSxNQUM1QjtBQUNBO0FBQ0ksZ0JBQVEsT0FBTztBQUNmLGVBQU8sT0FBTyxTQUFTO0FBQ3ZCLFlBQUksYUFBYyxRQUFRO0FBQzFCLGNBQU0sSUFBSSxTQUFTO0FBQ25CLGlCQUFTLE1BQU0sSUFBSSxPQUFPO0FBQzFCLFlBQUksUUFBUSxLQUFLLFNBQVMsR0FBRztBQUN6QixpQkFBTyxPQUFPLFNBQVM7QUFBQSxRQUMzQjtBQUNBLGNBQU07QUFDTixZQUFJLElBQUksT0FBTztBQUNmLGFBQUksSUFBSSxHQUFHLElBQUksR0FBRyxLQUFJO0FBQ2xCLGlCQUFPO0FBQUEsUUFDWDtBQUNBLGlCQUFTLE1BQU0sU0FBUztBQUFBLE1BQzVCO0FBQ0E7QUFDSSxnQkFBUSxPQUFPO0FBQ2YsWUFBSSxhQUFjLFFBQVE7QUFDMUIsaUJBQVMsS0FBSyxJQUFJO0FBQ2xCLGVBQU8sT0FBTyxTQUFTO0FBQUEsTUFDM0I7QUFBQSxJQUNKO0FBdEVTO0FBdUVULElBQUFBLFFBQU8sVUFBVTtBQUFBO0FBQUE7OztBQzFFakI7QUFBQSwwRkFBQUMsU0FBQTtBQUFBO0FBQUEsUUFBSSxhQUFhO0FBQ2pCLFFBQUksWUFBWSxnQ0FBUyxNQUFNLE1BQU0sUUFBUSxRQUFRLFVBQVU7QUFDM0QsZUFBUyxVQUFVO0FBQ25CLGVBQVMsVUFBVTtBQUNuQixpQkFBVyxZQUFZLFNBQVMsV0FBVyxVQUFVQyxPQUFNO0FBQ3ZELGVBQU8sWUFBWSxLQUFLLElBQUksR0FBR0EsS0FBSSxJQUFJO0FBQUEsTUFDM0M7QUFDQSxVQUFJLGNBQWMsVUFBVTtBQUM1QixVQUFJLE1BQU0sZ0NBQVMsT0FBTztBQUN0QixZQUFJLFFBQVE7QUFDUixpQkFBTyxDQUFDLFFBQVE7QUFBQSxRQUNwQjtBQUNBLGVBQU87QUFBQSxNQUNYLEdBTFU7QUFPVixVQUFJLE9BQU87QUFDWCxVQUFJLFlBQVksSUFBSSxTQUFTO0FBQzdCLFVBQUksT0FBTyxXQUFXO0FBQ2xCLGVBQU8sT0FBUSxJQUFJLE9BQU87QUFDMUIsb0JBQVk7QUFBQSxNQUNoQjtBQUNBLFVBQUksUUFBUTtBQUNSLGVBQU8sUUFBUSxTQUFTO0FBQUEsTUFDNUI7QUFDQSxVQUFJLFNBQVM7QUFDYixVQUFJLFNBQVMsSUFBSSxRQUFRLEdBQUc7QUFDeEIsaUJBQVMsU0FBUyxHQUFHLElBQUksS0FBSyxXQUFXLENBQUMsSUFBSSxNQUFNLFNBQVM7QUFBQSxNQUNqRTtBQUVBLFVBQUksUUFBUSxPQUFPLFVBQVU7QUFDN0IsZUFBUSxJQUFJLGNBQWMsR0FBRyxJQUFJLE9BQU8sS0FBSTtBQUN4QyxpQkFBUyxTQUFTLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFBQSxNQUM3QztBQUVBLFVBQUksWUFBWSxPQUFPLFVBQVU7QUFDakMsVUFBSSxXQUFXLEdBQUc7QUFDZCxpQkFBUyxTQUFTLFFBQVEsSUFBSSxLQUFLLEtBQUssQ0FBQyxLQUFLLElBQUksVUFBVSxRQUFRO0FBQUEsTUFDeEU7QUFDQSxhQUFPO0FBQUEsSUFDWCxHQXRDZ0I7QUF1Q2hCLFFBQUkscUJBQXFCLGdDQUFTLE1BQU0sZUFBZSxjQUFjO0FBQ2pFLFVBQUksT0FBTyxLQUFLLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSTtBQUMzQyxVQUFJLE9BQU8sVUFBVSxNQUFNLENBQUM7QUFDNUIsVUFBSSxXQUFXLFVBQVUsTUFBTSxjQUFjLENBQUM7QUFDOUMsVUFBSSxhQUFhLEdBQUc7QUFDaEIsZUFBTztBQUFBLE1BQ1g7QUFFQSxVQUFJLHVCQUF1QjtBQUMzQixVQUFJLHFCQUFxQixnQ0FBUyxXQUFXLFVBQVUsTUFBTTtBQUN6RCxZQUFJLGNBQWMsR0FBRztBQUNqQixzQkFBWTtBQUFBLFFBQ2hCO0FBQ0EsaUJBQVEsSUFBSSxHQUFHLEtBQUssTUFBTSxLQUFJO0FBQzFCLGtDQUF3QjtBQUN4QixlQUFLLFdBQVcsS0FBTyxPQUFPLEtBQUssR0FBRztBQUNsQyx5QkFBYTtBQUFBLFVBQ2pCO0FBQUEsUUFDSjtBQUNBLGVBQU87QUFBQSxNQUNYLEdBWHlCO0FBWXpCLFVBQUksV0FBVyxVQUFVLE1BQU0sZUFBZSxlQUFlLEdBQUcsT0FBTyxrQkFBa0I7QUFFekYsVUFBSSxZQUFZLEtBQUssSUFBSSxHQUFHLGVBQWUsQ0FBQyxJQUFJLEdBQUc7QUFDL0MsWUFBSSxhQUFhLEdBQUc7QUFDaEIsaUJBQU8sU0FBUyxJQUFJLFdBQVc7QUFBQSxRQUNuQztBQUNBLGVBQU87QUFBQSxNQUNYO0FBRUEsY0FBUSxTQUFTLElBQUksSUFBSSxNQUFNLEtBQUssSUFBSSxHQUFHLFdBQVcsSUFBSSxJQUFJO0FBQUEsSUFDbEUsR0EvQnlCO0FBZ0N6QixRQUFJLGFBQWEsZ0NBQVMsT0FBTztBQUM3QixVQUFJLFVBQVUsT0FBTyxDQUFDLEtBQUssR0FBRztBQUMxQixlQUFPLE1BQU0sVUFBVSxPQUFPLElBQUksR0FBRyxJQUFJLElBQUk7QUFBQSxNQUNqRDtBQUNBLGFBQU8sVUFBVSxPQUFPLElBQUksQ0FBQztBQUFBLElBQ2pDLEdBTGlCO0FBTWpCLFFBQUksYUFBYSxnQ0FBUyxPQUFPO0FBQzdCLFVBQUksVUFBVSxPQUFPLENBQUMsS0FBSyxHQUFHO0FBQzFCLGVBQU8sTUFBTSxVQUFVLE9BQU8sSUFBSSxHQUFHLElBQUksSUFBSTtBQUFBLE1BQ2pEO0FBQ0EsYUFBTyxVQUFVLE9BQU8sSUFBSSxDQUFDO0FBQUEsSUFDakMsR0FMaUI7QUFNakIsUUFBSSxlQUFlLGdDQUFTLE9BQU87QUFDL0IsYUFBTyxtQkFBbUIsT0FBTyxJQUFJLENBQUM7QUFBQSxJQUMxQyxHQUZtQjtBQUduQixRQUFJLGVBQWUsZ0NBQVMsT0FBTztBQUMvQixhQUFPLG1CQUFtQixPQUFPLElBQUksRUFBRTtBQUFBLElBQzNDLEdBRm1CO0FBR25CLFFBQUksZUFBZSxnQ0FBUyxPQUFPO0FBQy9CLFVBQUksT0FBTyxVQUFVLE9BQU8sSUFBSSxFQUFFO0FBQ2xDLFVBQUksUUFBUSxPQUFRO0FBQ2hCLGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxTQUFTLEtBQUssSUFBSSxLQUFPLFVBQVUsT0FBTyxJQUFJLEVBQUUsQ0FBQztBQUNyRCxVQUFJLFNBQVM7QUFDYixVQUFJLFNBQVMsQ0FBQztBQUNkLFVBQUksVUFBVSxVQUFVLE9BQU8sRUFBRTtBQUNqQyxlQUFRLElBQUksR0FBRyxJQUFJLFNBQVMsS0FBSTtBQUM1QixrQkFBVSxVQUFVLE9BQU8sSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJO0FBQzlDLGtCQUFVO0FBQUEsTUFDZDtBQUNBLFVBQUksUUFBUSxLQUFLLElBQUksSUFBSSxVQUFVLE9BQU8sSUFBSSxFQUFFLENBQUM7QUFDakQsY0FBUSxTQUFTLElBQUksSUFBSSxNQUFNLEtBQUssTUFBTSxTQUFTLEtBQUssSUFBSTtBQUFBLElBQ2hFLEdBZm1CO0FBZ0JuQixRQUFJLFlBQVksZ0NBQVMsT0FBTyxPQUFPO0FBQ25DLFVBQUksT0FBTyxVQUFVLE9BQU8sQ0FBQztBQUM3QixVQUFJLFdBQVcsVUFBVSxPQUFPLElBQUksQ0FBQztBQUVyQyxVQUFJLFNBQVMsSUFBSSxNQUFNLFNBQVMsSUFBSSxJQUFJLE1BQU0sV0FBVyxNQUFPLFNBQVk7QUFDNUUsVUFBSSxDQUFDLE9BQU87QUFDUixlQUFPLFFBQVEsT0FBTyxRQUFRLElBQUksT0FBTyxrQkFBa0IsSUFBSSxHQUFLO0FBQUEsTUFDeEU7QUFFQSxhQUFPLE9BQU8sV0FBVztBQUN6QixhQUFPLGtCQUFrQixXQUFXO0FBQ2hDLGVBQU8sS0FBSztBQUFBLE1BQ2hCO0FBQ0EsYUFBTyxrQkFBa0IsU0FBU0MsUUFBTztBQUNyQyxhQUFLLE9BQU9BO0FBQUEsTUFDaEI7QUFDQSxhQUFPLHFCQUFxQixXQUFXO0FBQ25DLGVBQU8sS0FBSztBQUFBLE1BQ2hCO0FBQ0EsYUFBTztBQUFBLElBQ1gsR0FwQmdCO0FBcUJoQixRQUFJLGFBQWEsZ0NBQVMsT0FBTztBQUM3QixVQUFJLE1BQU0sVUFBVSxPQUFPLEVBQUU7QUFDN0IsVUFBSSxRQUFRLFVBQVUsT0FBTyxJQUFJLEVBQUU7QUFDbkMsVUFBSSxjQUFjLFVBQVUsT0FBTyxJQUFJLEVBQUU7QUFDekMsVUFBSSxTQUFTO0FBQ2IsVUFBSSxPQUFPLENBQUM7QUFDWixlQUFRLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSTtBQUV4QixhQUFLLENBQUMsSUFBSSxVQUFVLE9BQU8sSUFBSSxNQUFNO0FBQ3JDLGtCQUFVO0FBRVYsa0JBQVU7QUFBQSxNQUNkO0FBQ0EsVUFBSSxlQUFlLGdDQUFTQyxjQUFhO0FBRXJDLFlBQUksU0FBUyxVQUFVLE9BQU8sSUFBSSxNQUFNO0FBQ3hDLGtCQUFVO0FBRVYsWUFBSSxVQUFVLFlBQVk7QUFDdEIsaUJBQU87QUFBQSxRQUNYO0FBQ0EsWUFBSTtBQUNKLFlBQUlBLGdCQUFlLE1BQVFBLGdCQUFlLElBQU07QUFFNUMsbUJBQVMsVUFBVSxPQUFPLFNBQVMsR0FBRyxNQUFNO0FBQzVDLG9CQUFVLFNBQVM7QUFDbkIsaUJBQU87QUFBQSxRQUNYLFdBQVdBLGdCQUFlLElBQU07QUFFNUIsbUJBQVMsTUFBTSxTQUFTLEtBQUssVUFBVSxVQUFVLElBQUksVUFBVSxVQUFVLE1BQU0sQ0FBQztBQUNoRixpQkFBTztBQUFBLFFBQ1gsT0FBTztBQUNILGtCQUFRLElBQUkseUNBQXlDQSxZQUFXO0FBQUEsUUFDcEU7QUFBQSxNQUNKLEdBckJtQjtBQXNCbkIsVUFBSSxRQUFRLGdDQUFTLFdBQVdBLGNBQWE7QUFDekMsWUFBSSxRQUFRLENBQUM7QUFDYixZQUFJQztBQUNKLFlBQUksVUFBVSxTQUFTLEdBQUc7QUFDdEIsY0FBSSxRQUFRLFVBQVUsTUFBTTtBQUM1QixlQUFJQSxLQUFJLEdBQUdBLEtBQUksT0FBT0EsTUFBSTtBQUN0QixrQkFBTUEsRUFBQyxJQUFJLE1BQU0sV0FBV0QsWUFBVztBQUFBLFVBQzNDO0FBQ0Esb0JBQVUsUUFBUSxLQUFLO0FBQUEsUUFDM0IsT0FBTztBQUNILGVBQUlDLEtBQUksR0FBR0EsS0FBSSxVQUFVLENBQUMsR0FBR0EsTUFBSTtBQUM3QixrQkFBTUEsRUFBQyxJQUFJLGFBQWFELFlBQVc7QUFBQSxVQUN2QztBQUFBLFFBQ0o7QUFDQSxlQUFPO0FBQUEsTUFDWCxHQWZZO0FBZ0JaLGFBQU8sTUFBTSxNQUFNLFdBQVc7QUFBQSxJQUNsQyxHQXBEaUI7QUFxRGpCLFFBQUksWUFBWSxnQ0FBUyxPQUFPO0FBQzVCLGFBQU8sTUFBTSxTQUFTLE1BQU07QUFBQSxJQUNoQyxHQUZnQjtBQUdoQixRQUFJLFlBQVksZ0NBQVMsT0FBTztBQUM1QixVQUFJLFVBQVUsS0FBTSxRQUFPO0FBQzNCLGFBQU8sVUFBVSxPQUFPLENBQUMsSUFBSTtBQUFBLElBQ2pDLEdBSGdCO0FBSWhCLFFBQUksT0FBTyxnQ0FBUyxVQUFVO0FBQzFCLGVBQVMsSUFBSSxVQUFVO0FBQ3ZCLGVBQVMsSUFBSSxVQUFVO0FBQ3ZCLGVBQVMsSUFBSSxVQUFVO0FBQ3ZCLGVBQVMsSUFBSSxVQUFVO0FBQ3ZCLGVBQVMsTUFBTSxZQUFZO0FBQzNCLGVBQVMsS0FBSyxZQUFZO0FBQzFCLGVBQVMsS0FBSyxZQUFZO0FBQzFCLGVBQVMsSUFBSSxTQUFTO0FBQ3RCLGVBQVMsTUFBTSxVQUFVLEtBQUssTUFBTSxLQUFLLENBQUM7QUFDMUMsZUFBUyxNQUFNLFVBQVUsS0FBSyxNQUFNLElBQUksQ0FBQztBQUN6QyxlQUFTLEtBQU0sVUFBVTtBQUN6QixlQUFTLE1BQU0sVUFBVTtBQUN6QixlQUFTLE1BQU0sVUFBVTtBQUN6QixlQUFTLE1BQU0sVUFBVTtBQUN6QixlQUFTLE1BQU0sVUFBVTtBQUN6QixlQUFTLElBQUksU0FBUztBQUFBLElBQzFCLEdBakJXO0FBa0JYLElBQUFILFFBQU8sVUFBVTtBQUFBLE1BQ2I7QUFBQSxJQUNKO0FBQUE7QUFBQTs7O0FDL01BO0FBQUEscUZBQUFLLFNBQUE7QUFBQTtBQVNJLElBQUFBLFFBQU8sVUFBVTtBQUFBLE1BQ2pCLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxNQUNMLGNBQWM7QUFBQSxNQUNkLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxNQUNULFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxNQUNULE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLGFBQWE7QUFBQSxNQUNiLFVBQVU7QUFBQSxNQUNWLFFBQVE7QUFBQSxNQUNSLEtBQUs7QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULFdBQVc7QUFBQSxNQUNYLGNBQWM7QUFBQSxNQUNkLFNBQVM7QUFBQSxNQUNULGFBQWE7QUFBQSxNQUNiLFVBQVU7QUFBQSxNQUNWLFNBQVM7QUFBQSxNQUNULE1BQU07QUFBQSxNQUNOLGVBQWU7QUFBQSxNQUNmLFFBQVE7QUFBQSxNQUNSLGNBQWM7QUFBQSxNQUNkLGlCQUFpQjtBQUFBLE1BQ2pCLFVBQVU7QUFBQSxNQUNWLFNBQVM7QUFBQSxNQUNULFdBQVc7QUFBQSxNQUNYLFdBQVc7QUFBQSxNQUNYLGVBQWU7QUFBQSxNQUNmLE9BQU87QUFBQSxNQUNQLGNBQWM7QUFBQSxNQUNkLFNBQVM7QUFBQSxJQUNiO0FBQUE7QUFBQTs7O0FDdEVBO0FBQUE7QUFBQTtBQUFBLFFBQUksY0FBYztBQUNsQixRQUFJLGdCQUFnQjtBQUNwQixRQUFJLGNBQWM7QUFDbEIsUUFBSSxlQUFlO0FBQ25CLFlBQVEsZ0JBQWdCO0FBQ3hCLFlBQVEsZ0JBQWdCO0FBQ3hCLFlBQVEsY0FBYztBQUN0QixZQUFRLFdBQVc7QUFDbkIsUUFBSSxjQUFjO0FBQUEsTUFDZCxNQUFNLENBQUM7QUFBQSxNQUNQLFFBQVEsQ0FBQztBQUFBLElBQ2I7QUFFQSxhQUFTLFFBQVEsS0FBSztBQUNsQixhQUFPLE9BQU8sR0FBRztBQUFBLElBQ3JCO0FBRlM7QUFPVCxhQUFTLGNBQWMsS0FBSyxRQUFRO0FBQ2hDLGVBQVMsVUFBVTtBQUNuQixVQUFJLENBQUMsWUFBWSxNQUFNLEdBQUc7QUFDdEIsZUFBTztBQUFBLE1BQ1g7QUFDQSxhQUFPLFlBQVksTUFBTSxFQUFFLEdBQUcsS0FBSztBQUFBLElBQ3ZDO0FBTlM7QUFPVCxhQUFTLGNBQWMsS0FBSyxRQUFRLFNBQVM7QUFDekMsVUFBSSxPQUFPLFVBQVUsWUFBWTtBQUM3QixrQkFBVTtBQUNWLGlCQUFTO0FBQUEsTUFDYjtBQUNBLGtCQUFZLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxJQUMvQjtBQU5TO0FBT1QsZ0JBQVksS0FBSyxTQUFTLEtBQUssV0FBVztBQUN0QyxrQkFBWSxLQUFLLEdBQUcsSUFBSTtBQUFBLElBQzVCLENBQUM7QUFDRCxrQkFBYyxLQUFLLFNBQVMsS0FBSyxXQUFXO0FBQ3hDLGtCQUFZLE9BQU8sR0FBRyxJQUFJO0FBQUEsSUFDOUIsQ0FBQztBQUFBO0FBQUE7OztBQ3ZDRDtBQUFBLDBFQUFBQyxTQUFBO0FBQUE7QUFDQSxRQUFJO0FBQ0osUUFBSTtBQUNBLGFBQU8sUUFBUSxhQUFhLFVBQVUsUUFBUSxJQUFJLFdBQVcsUUFBUSxJQUFJO0FBQUEsSUFDN0UsUUFBUztBQUFBLElBRVQ7QUFDQSxJQUFBQSxRQUFPLFVBQVU7QUFBQTtBQUFBLE1BRWIsTUFBTTtBQUFBO0FBQUEsTUFFTjtBQUFBO0FBQUEsTUFFQSxVQUFVO0FBQUE7QUFBQSxNQUVWLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlWLGtCQUFrQjtBQUFBO0FBQUEsTUFFbEIsTUFBTTtBQUFBO0FBQUE7QUFBQSxNQUdOLE1BQU07QUFBQTtBQUFBLE1BRU4sUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSVIsS0FBSztBQUFBO0FBQUE7QUFBQSxNQUdMLG1CQUFtQjtBQUFBLE1BQ25CLGlCQUFpQjtBQUFBLE1BQ2pCLEtBQUs7QUFBQTtBQUFBLE1BRUwsZ0JBQWdCO0FBQUEsTUFDaEIsa0JBQWtCO0FBQUEsTUFDbEIsMkJBQTJCO0FBQUEsTUFDM0IsU0FBUztBQUFBLE1BQ1Qsc0JBQXNCO0FBQUE7QUFBQTtBQUFBLE1BR3RCLG1CQUFtQjtBQUFBO0FBQUE7QUFBQSxNQUduQixjQUFjO0FBQUE7QUFBQTtBQUFBLE1BR2QscUNBQXFDO0FBQUE7QUFBQSxNQUVyQyxlQUFlO0FBQUEsTUFDZixpQkFBaUI7QUFBQSxNQUNqQixZQUFZO0FBQUEsTUFDWixpQkFBaUI7QUFBQSxJQUNyQjtBQUNBLFFBQU0sVUFBVTtBQUVoQixRQUFNLGtCQUFrQixRQUFRLGNBQWMsSUFBSSxNQUFNO0FBQ3hELFFBQU0sdUJBQXVCLFFBQVEsY0FBYyxNQUFNLE1BQU07QUFFL0QsSUFBQUEsUUFBTyxRQUFRLGlCQUFpQixhQUFhLFNBQVMsS0FBSztBQUN2RCxjQUFRLGNBQWMsSUFBSSxRQUFRLE1BQU0sUUFBUSxjQUFjLElBQUksTUFBTSxJQUFJLGVBQWU7QUFDM0YsY0FBUSxjQUFjLE1BQU0sUUFBUSxNQUFNLFFBQVEsY0FBYyxNQUFNLE1BQU0sSUFBSSxvQkFBb0I7QUFBQSxJQUN4RyxDQUFDO0FBQUE7QUFBQTs7O0FDakVEO0FBQUEsdUVBQUFDLFNBQUE7QUFBQTtBQUNBLFFBQU1DLFlBQVc7QUFDakIsUUFBTSxFQUFFLE9BQU8sSUFBSSxRQUFRLFlBQVk7QUFDdkMsYUFBUyxjQUFjLHVCQUF1QjtBQUMxQyxZQUFNLFVBQVUsc0JBQXNCLFFBQVEsT0FBTyxNQUFNLEVBQUUsUUFBUSxNQUFNLEtBQUs7QUFDaEYsYUFBTyxNQUFNLFVBQVU7QUFBQSxJQUMzQjtBQUhTO0FBT1QsYUFBUyxZQUFZLEtBQUs7QUFDdEIsVUFBSSxTQUFTO0FBQ2IsZUFBUSxJQUFJLEdBQUcsSUFBSSxJQUFJLFFBQVEsS0FBSTtBQUMvQixZQUFJLElBQUksR0FBRztBQUNQLG9CQUFVO0FBQUEsUUFDZDtBQUNBLFlBQUksT0FBTyxJQUFJLENBQUM7QUFDaEIsWUFBSSxRQUFRLE1BQU07QUFDZCxvQkFBVTtBQUFBLFFBQ2QsV0FBVyxNQUFNLFFBQVEsSUFBSSxHQUFHO0FBQzVCLG9CQUFVLFlBQVksSUFBSTtBQUFBLFFBQzlCLFdBQVcsWUFBWSxPQUFPLElBQUksR0FBRztBQUNqQyxjQUFJLEVBQUUsZ0JBQWdCLFNBQVM7QUFDM0IsbUJBQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxLQUFLLFlBQVksS0FBSyxVQUFVO0FBQUEsVUFDcEU7QUFDQSxvQkFBVSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsUUFDM0MsT0FBTztBQUNILG9CQUFVLGNBQWMsYUFBYSxJQUFJLENBQUM7QUFBQSxRQUM5QztBQUFBLE1BQ0o7QUFDQSxnQkFBVTtBQUNWLGFBQU87QUFBQSxJQUNYO0FBdEJTO0FBMkJULFFBQU0sZUFBZSxnQ0FBUyxLQUFLLE1BQU07QUFFckMsVUFBSSxPQUFPLE1BQU07QUFDYixlQUFPO0FBQUEsTUFDWDtBQUNBLFVBQUksT0FBTyxRQUFRLFVBQVU7QUFDekIsWUFBSSxlQUFlLFFBQVE7QUFDdkIsaUJBQU87QUFBQSxRQUNYO0FBQ0EsWUFBSSxZQUFZLE9BQU8sR0FBRyxHQUFHO0FBQ3pCLGlCQUFPLE9BQU8sS0FBSyxJQUFJLFFBQVEsSUFBSSxZQUFZLElBQUksVUFBVTtBQUFBLFFBQ2pFO0FBQ0EsWUFBSSxPQUFPLEdBQUcsR0FBRztBQUNiLGNBQUlBLFVBQVMsc0JBQXNCO0FBQy9CLG1CQUFPLGdCQUFnQixHQUFHO0FBQUEsVUFDOUIsT0FBTztBQUNILG1CQUFPLGFBQWEsR0FBRztBQUFBLFVBQzNCO0FBQUEsUUFDSjtBQUNBLFlBQUksTUFBTSxRQUFRLEdBQUcsR0FBRztBQUNwQixpQkFBTyxZQUFZLEdBQUc7QUFBQSxRQUMxQjtBQUNBLGVBQU8sY0FBYyxLQUFLLElBQUk7QUFBQSxNQUNsQztBQUNBLGFBQU8sSUFBSSxTQUFTO0FBQUEsSUFDeEIsR0F6QnFCO0FBMEJyQixhQUFTLGNBQWMsS0FBSyxNQUFNO0FBQzlCLFVBQUksT0FBTyxPQUFPLElBQUksZUFBZSxZQUFZO0FBQzdDLGVBQU8sUUFBUSxDQUFDO0FBQ2hCLFlBQUksS0FBSyxRQUFRLEdBQUcsTUFBTSxJQUFJO0FBQzFCLGdCQUFNLElBQUksTUFBTSxrREFBa0QsTUFBTSxhQUFhO0FBQUEsUUFDekY7QUFDQSxhQUFLLEtBQUssR0FBRztBQUNiLGVBQU8sYUFBYSxJQUFJLFdBQVcsWUFBWSxHQUFHLElBQUk7QUFBQSxNQUMxRDtBQUNBLGFBQU8sS0FBSyxVQUFVLEdBQUc7QUFBQSxJQUM3QjtBQVZTO0FBV1QsYUFBUyxhQUFhLE1BQU07QUFDeEIsVUFBSSxTQUFTLENBQUMsS0FBSyxrQkFBa0I7QUFDckMsVUFBSSxPQUFPLEtBQUssWUFBWTtBQUM1QixZQUFNLFdBQVcsT0FBTztBQUN4QixVQUFJLFNBQVUsUUFBTyxLQUFLLElBQUksSUFBSSxJQUFJO0FBQ3RDLFVBQUksTUFBTSxPQUFPLElBQUksRUFBRSxTQUFTLEdBQUcsR0FBRyxJQUFJLE1BQU0sT0FBTyxLQUFLLFNBQVMsSUFBSSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxNQUFNLE9BQU8sS0FBSyxRQUFRLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRyxJQUFJLE1BQU0sT0FBTyxLQUFLLFNBQVMsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHLElBQUksTUFBTSxPQUFPLEtBQUssV0FBVyxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxNQUFNLE9BQU8sS0FBSyxXQUFXLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRyxJQUFJLE1BQU0sT0FBTyxLQUFLLGdCQUFnQixDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDMVYsVUFBSSxTQUFTLEdBQUc7QUFDWixlQUFPO0FBQ1Asa0JBQVU7QUFBQSxNQUNkLE9BQU87QUFDSCxlQUFPO0FBQUEsTUFDWDtBQUNBLGFBQU8sT0FBTyxLQUFLLE1BQU0sU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRyxJQUFJLE1BQU0sT0FBTyxTQUFTLEVBQUUsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNuRyxVQUFJLFNBQVUsUUFBTztBQUNyQixhQUFPO0FBQUEsSUFDWDtBQWZTO0FBZ0JULGFBQVMsZ0JBQWdCLE1BQU07QUFDM0IsVUFBSSxPQUFPLEtBQUssZUFBZTtBQUMvQixZQUFNLFdBQVcsT0FBTztBQUN4QixVQUFJLFNBQVUsUUFBTyxLQUFLLElBQUksSUFBSSxJQUFJO0FBQ3RDLFVBQUksTUFBTSxPQUFPLElBQUksRUFBRSxTQUFTLEdBQUcsR0FBRyxJQUFJLE1BQU0sT0FBTyxLQUFLLFlBQVksSUFBSSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxNQUFNLE9BQU8sS0FBSyxXQUFXLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRyxJQUFJLE1BQU0sT0FBTyxLQUFLLFlBQVksQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHLElBQUksTUFBTSxPQUFPLEtBQUssY0FBYyxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxNQUFNLE9BQU8sS0FBSyxjQUFjLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRyxJQUFJLE1BQU0sT0FBTyxLQUFLLG1CQUFtQixDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDNVcsYUFBTztBQUNQLFVBQUksU0FBVSxRQUFPO0FBQ3JCLGFBQU87QUFBQSxJQUNYO0FBUlM7QUFTVCxhQUFTLHFCQUFxQixRQUFRLFFBQVEsVUFBVTtBQUVwRCxlQUFTLE9BQU8sV0FBVyxXQUFXO0FBQUEsUUFDbEMsTUFBTTtBQUFBLE1BQ1YsSUFBSTtBQUNKLFVBQUksUUFBUTtBQUNSLFlBQUksT0FBTyxXQUFXLFlBQVk7QUFDOUIsaUJBQU8sV0FBVztBQUFBLFFBQ3RCLE9BQU87QUFDSCxpQkFBTyxTQUFTO0FBQUEsUUFDcEI7QUFBQSxNQUNKO0FBQ0EsVUFBSSxVQUFVO0FBQ1YsZUFBTyxXQUFXO0FBQUEsTUFDdEI7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQWhCUztBQWtCVCxRQUFNQyxvQkFBbUIsZ0NBQVMsS0FBSztBQUNuQyxhQUFPLE1BQU0sSUFBSSxRQUFRLE1BQU0sSUFBSSxJQUFJO0FBQUEsSUFDM0MsR0FGeUI7QUFHekIsUUFBTUMsaUJBQWdCLGdDQUFTLEtBQUs7QUFDaEMsVUFBSSxlQUFlO0FBQ25CLFVBQUksVUFBVTtBQUNkLFVBQUksT0FBTyxNQUFNO0FBQ2IsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLE9BQU8sUUFBUSxVQUFVO0FBQ3pCLGVBQU87QUFBQSxNQUNYO0FBQ0EsZUFBUSxJQUFJLEdBQUcsSUFBSSxJQUFJLFFBQVEsS0FBSTtBQUMvQixjQUFNLElBQUksSUFBSSxDQUFDO0FBQ2YsWUFBSSxNQUFNLEtBQUs7QUFDWCxxQkFBVyxJQUFJO0FBQUEsUUFDbkIsV0FBVyxNQUFNLE1BQU07QUFDbkIscUJBQVcsSUFBSTtBQUNmLHlCQUFlO0FBQUEsUUFDbkIsT0FBTztBQUNILHFCQUFXO0FBQUEsUUFDZjtBQUFBLE1BQ0o7QUFDQSxpQkFBVztBQUNYLFVBQUksaUJBQWlCLE1BQU07QUFDdkIsa0JBQVUsT0FBTztBQUFBLE1BQ3JCO0FBQ0EsYUFBTztBQUFBLElBQ1gsR0F6QnNCO0FBMEJ0QixJQUFBSCxRQUFPLFVBQVU7QUFBQSxNQUNiLGNBQWMsZ0NBQVMsb0JBQW9CLE9BQU87QUFHOUMsZUFBTyxhQUFhLEtBQUs7QUFBQSxNQUM3QixHQUpjO0FBQUEsTUFLZDtBQUFBLE1BQ0Esa0JBQUFFO0FBQUEsTUFDQSxlQUFBQztBQUFBLElBQ0o7QUFBQTtBQUFBOzs7QUMzSkEsSUFBQUMsaUJBQUE7QUFBQSw4RUFBQUMsU0FBQTtBQUFBO0FBQUEsUUFBTSxhQUFhLFFBQVEsUUFBUTtBQUNuQyxJQUFBQSxRQUFPLFVBQVU7QUFBQSxNQUNiO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUtBLFFBQU0sWUFBWSxXQUFXLGFBQWEsV0FBVztBQUlqRCxRQUFNLGVBQWUsVUFBVTtBQUNuQyxRQUFNLGNBQWMsSUFBSSxZQUFZO0FBS2hDLGFBQVMsWUFBWSxRQUFRO0FBQzdCLGFBQU8sVUFBVSxnQkFBZ0IsT0FBTyxNQUFNLE1BQU0sQ0FBQztBQUFBLElBQ3pEO0FBRmE7QUFHYixtQkFBZSxJQUFJLFFBQVE7QUFDdkIsVUFBSTtBQUNBLGVBQU8sV0FBVyxXQUFXLEtBQUssRUFBRSxPQUFPLFFBQVEsT0FBTyxFQUFFLE9BQU8sS0FBSztBQUFBLE1BQzVFLFNBQVMsR0FBRztBQUlSLGNBQU0sT0FBTyxPQUFPLFdBQVcsV0FBVyxZQUFZLE9BQU8sTUFBTSxJQUFJO0FBQ3ZFLGNBQU0sT0FBTyxNQUFNLGFBQWEsT0FBTyxPQUFPLElBQUk7QUFDbEQsZUFBTyxNQUFNLEtBQUssSUFBSSxXQUFXLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUFBLE1BQzdGO0FBQUEsSUFDSjtBQVhlO0FBYWYsbUJBQWUsd0JBQXdCLE1BQU0sVUFBVSxNQUFNO0FBQ3pELFlBQU0sUUFBUSxNQUFNLElBQUksV0FBVyxJQUFJO0FBQ3ZDLFlBQU0sUUFBUSxNQUFNLElBQUksT0FBTyxPQUFPO0FBQUEsUUFDbEMsT0FBTyxLQUFLLEtBQUs7QUFBQSxRQUNqQjtBQUFBLE1BQ0osQ0FBQyxDQUFDO0FBQ0YsYUFBTyxRQUFRO0FBQUEsSUFDbkI7QUFQZTtBQVdYLG1CQUFlLE9BQU8sTUFBTTtBQUM1QixhQUFPLE1BQU0sYUFBYSxPQUFPLFdBQVcsSUFBSTtBQUFBLElBQ3BEO0FBRm1CO0FBR25CLG1CQUFlLFdBQVcsVUFBVSxNQUFNO0FBQ3RDLGFBQU8sTUFBTSxhQUFhLE9BQU8sVUFBVSxJQUFJO0FBQUEsSUFDbkQ7QUFGZTtBQU9YLG1CQUFlLFdBQVcsV0FBVyxLQUFLO0FBQzFDLFlBQU0sTUFBTSxNQUFNLGFBQWEsVUFBVSxPQUFPLFdBQVc7QUFBQSxRQUN2RCxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsTUFDVixHQUFHLE9BQU87QUFBQSxRQUNOO0FBQUEsTUFDSixDQUFDO0FBQ0QsYUFBTyxNQUFNLGFBQWEsS0FBSyxRQUFRLEtBQUssWUFBWSxPQUFPLEdBQUcsQ0FBQztBQUFBLElBQ3ZFO0FBUm1CO0FBY2YsbUJBQWUsVUFBVSxVQUFVLE1BQU0sWUFBWTtBQUNyRCxZQUFNLE1BQU0sTUFBTSxhQUFhLFVBQVUsT0FBTyxZQUFZLE9BQU8sUUFBUSxHQUFHLFVBQVUsT0FBTztBQUFBLFFBQzNGO0FBQUEsTUFDSixDQUFDO0FBQ0QsWUFBTSxTQUFTO0FBQUEsUUFDWCxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQ0EsYUFBTyxNQUFNLGFBQWEsV0FBVyxRQUFRLEtBQUssS0FBSyxHQUFHO0FBQUEsUUFDdEQ7QUFBQSxNQUNKLENBQUM7QUFBQSxJQUNMO0FBYm1CO0FBQUE7QUFBQTs7O0FDM0VuQjtBQUFBLHdGQUFBQyxTQUFBO0FBQUE7QUFBQSxhQUFTLFVBQVUsS0FBSyxNQUFNO0FBQzFCLGFBQU8sSUFBSSxNQUFNLDJCQUEyQixNQUFNLHNDQUFzQyxLQUFLLFNBQVMsUUFBUSxDQUFDO0FBQUEsSUFDbkg7QUFGUztBQUdULGFBQVMsZUFBZSxNQUFNLE9BQU87QUFDakMsVUFBSSxTQUFTLEtBQUssT0FBTztBQUN6QixVQUFJLFNBQVMsSUFBTSxRQUFPO0FBQUEsUUFDdEI7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUNBLFlBQU0sY0FBYyxTQUFTO0FBQzdCLFVBQUksY0FBYyxFQUFHLE9BQU0sVUFBVSxjQUFjLElBQUk7QUFDdkQsZUFBUztBQUNULGVBQVEsSUFBSSxHQUFHLElBQUksYUFBYSxLQUFJO0FBQ2hDLGlCQUFTLFVBQVUsSUFBSSxLQUFLLE9BQU87QUFBQSxNQUN2QztBQUNBLGFBQU87QUFBQSxRQUNIO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBaEJTO0FBaUJULGFBQVMsWUFBWSxNQUFNLE9BQU87QUFDOUIsVUFBSSxLQUFLLE9BQU8sTUFBTSxFQUFLLE9BQU0sVUFBVSxnQkFBZ0IsSUFBSTtBQUUvRCxZQUFNLEVBQUUsUUFBUSxXQUFXLE9BQU8sb0JBQW9CLElBQUksZUFBZSxNQUFNLEtBQUs7QUFDcEYsY0FBUTtBQUNSLFlBQU0sWUFBWSxRQUFRO0FBQzFCLFlBQU0sUUFBUSxLQUFLLE9BQU87QUFDMUIsVUFBSSxPQUFPLFFBQVEsTUFBTSxLQUFLLE1BQU0sUUFBUTtBQUM1QyxhQUFNLFFBQVEsV0FBVTtBQUVwQixZQUFJLFFBQVE7QUFDWixlQUFNLFFBQVEsV0FBVTtBQUVwQixnQkFBTSxXQUFXLEtBQUssT0FBTztBQUM3QixrQkFBUSxTQUFTLElBQUksV0FBVztBQUNoQyxjQUFJLFdBQVcsSUFBTTtBQUFBLFFBQ3pCO0FBQ0EsZUFBTyxNQUFNO0FBQUEsTUFDakI7QUFDQSxhQUFPO0FBQUEsUUFDSDtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQXZCUztBQXdCVCxhQUFTLGNBQWMsTUFBTSxPQUFPO0FBQ2hDLFVBQUksS0FBSyxPQUFPLE1BQU0sR0FBTSxPQUFNLFVBQVUscUJBQXFCLElBQUk7QUFFckUsYUFBTyxlQUFlLE1BQU0sS0FBSztBQUFBLElBQ3JDO0FBSlM7QUFLVCxhQUFTLHNDQUFzQyxNQUFNLE9BQU87QUFFeEQsVUFBSSxVQUFVLE9BQVcsU0FBUTtBQUNqQyxjQUFRLGNBQWMsTUFBTSxLQUFLLEVBQUU7QUFDbkMsWUFBTSxFQUFFLFFBQVEsZ0JBQWdCLE9BQU8seUJBQXlCLElBQUksY0FBYyxNQUFNLEtBQUs7QUFDN0YsY0FBUSwyQkFBMkI7QUFDbkMsY0FBUSxjQUFjLE1BQU0sS0FBSyxFQUFFO0FBQ25DLFlBQU0sRUFBRSxLQUFLLE9BQU8sY0FBYyxJQUFJLFlBQVksTUFBTSxLQUFLO0FBQzdELGNBQU8sS0FBSTtBQUFBO0FBQUEsUUFFUCxLQUFLO0FBQ0QsaUJBQU87QUFBQSxRQUNYLEtBQUs7QUFDRCxpQkFBTztBQUFBLFFBQ1gsS0FBSztBQUNELGlCQUFPO0FBQUEsUUFDWCxLQUFLO0FBQ0QsaUJBQU87QUFBQSxRQUNYLEtBQUs7QUFDRCxpQkFBTztBQUFBLFFBQ1gsS0FBSztBQUNELGlCQUFPO0FBQUEsUUFDWCxLQUFLO0FBQ0QsaUJBQU87QUFBQSxRQUNYLEtBQUs7QUFDRCxpQkFBTztBQUFBO0FBQUEsUUFFWCxLQUFLO0FBQ0QsaUJBQU87QUFBQSxRQUNYLEtBQUs7QUFDRCxpQkFBTztBQUFBLFFBQ1gsS0FBSztBQUNELGlCQUFPO0FBQUEsUUFDWCxLQUFLO0FBQ0QsaUJBQU87QUFBQSxRQUNYLEtBQUs7QUFDRCxpQkFBTztBQUFBO0FBQUEsUUFFWCxLQUFLLHlCQUNEO0FBQ0ksa0JBQVE7QUFDUixrQkFBUSxjQUFjLE1BQU0sS0FBSyxFQUFFO0FBQ25DLGNBQUksS0FBSyxPQUFPLE1BQU0sSUFBTSxPQUFNLFVBQVUsZ0JBQWdCLElBQUk7QUFFaEUsa0JBQVEsZUFBZSxNQUFNLEtBQUssRUFBRTtBQUNwQyxrQkFBUSxjQUFjLE1BQU0sS0FBSyxFQUFFO0FBQ25DLGdCQUFNLEVBQUUsS0FBSyxRQUFRLElBQUksWUFBWSxNQUFNLEtBQUs7QUFDaEQsa0JBQU8sU0FBUTtBQUFBO0FBQUEsWUFFWCxLQUFLO0FBQ0QscUJBQU87QUFBQSxZQUNYLEtBQUs7QUFDRCxxQkFBTztBQUFBLFlBQ1gsS0FBSztBQUNELHFCQUFPO0FBQUEsWUFDWCxLQUFLO0FBQ0QscUJBQU87QUFBQSxZQUNYLEtBQUs7QUFDRCxxQkFBTztBQUFBLFVBQ2Y7QUFDQSxnQkFBTSxVQUFVLHNCQUFzQixTQUFTLElBQUk7QUFBQSxRQUN2RDtBQUFBO0FBQUEsUUFFSixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU87QUFBQTtBQUFBLFFBRVgsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGdCQUFNLFVBQVUsMEVBQTBFO0FBQUEsTUFDbEc7QUFDQSxZQUFNLFVBQVUsaUJBQWlCLEtBQUssSUFBSTtBQUFBLElBQzlDO0FBeEVTO0FBeUVULElBQUFBLFFBQU8sVUFBVTtBQUFBLE1BQ2I7QUFBQSxJQUNKO0FBQUE7QUFBQTs7O0FDNUhBO0FBQUEsNkVBQUFDLFNBQUE7QUFBQTtBQUNBLFFBQU0sU0FBUztBQUNmLFFBQU0sRUFBRSxzQ0FBc0MsSUFBSTtBQWlCbEQsYUFBUyxTQUFTLFVBQVU7QUFFeEIsWUFBTSxnQkFBZ0I7QUFNdEIsWUFBTSxrQkFBa0I7QUFDeEIsYUFBTyxTQUFTLFFBQVEsZUFBZSxHQUFHLEVBQUUsUUFBUSxpQkFBaUIsRUFBRSxFQUFFLFVBQVUsTUFBTTtBQUFBLElBQzdGO0FBVlM7QUFXVCxRQUFNLCtCQUErQjtBQUNyQyxhQUFTLGFBQWEsWUFBWSxRQUFRLHFCQUFxQiw4QkFBOEI7QUFDekYsWUFBTSxhQUFhO0FBQUEsUUFDZjtBQUFBLE1BQ0o7QUFDQSxVQUFJLE9BQVEsWUFBVyxRQUFRLG9CQUFvQjtBQUNuRCxZQUFNLFlBQVksV0FBVyxLQUFLLENBQUMsY0FBWSxXQUFXLFNBQVMsU0FBUyxDQUFDO0FBQzdFLFVBQUksQ0FBQyxXQUFXO0FBQ1osY0FBTSxJQUFJLE1BQU0sNkJBQTZCLFdBQVcsS0FBSyxPQUFPLElBQUksZ0JBQWdCO0FBQUEsTUFDNUY7QUFDQSxVQUFJLGNBQWMsd0JBQXdCLE9BQU8sT0FBTyx1QkFBdUIsWUFBWTtBQUV2RixjQUFNLElBQUksTUFBTSwyREFBMkQ7QUFBQSxNQUMvRTtBQUNBLFlBQU0sY0FBYyxPQUFPLFlBQVksRUFBRSxFQUFFLFNBQVMsUUFBUTtBQUM1RCxZQUFNLFlBQVksY0FBYyx1QkFBdUIsMkJBQTJCLFNBQVMsTUFBTTtBQUNqRyxhQUFPO0FBQUEsUUFDSDtBQUFBLFFBQ0E7QUFBQSxRQUNBLFVBQVUsWUFBWSxhQUFhO0FBQUEsUUFDbkMsU0FBUztBQUFBLFFBQ1Q7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQXRCUztBQXVCVCxtQkFBZSxnQkFBZ0IsU0FBUyxVQUFVLFlBQVksUUFBUTtBQUNsRSxVQUFJLFFBQVEsWUFBWSx1QkFBdUI7QUFDM0MsY0FBTSxJQUFJLE1BQU0sZ0RBQWdEO0FBQUEsTUFDcEU7QUFDQSxVQUFJLE9BQU8sYUFBYSxVQUFVO0FBQzlCLGNBQU0sSUFBSSxNQUFNLG9FQUFvRTtBQUFBLE1BQ3hGO0FBQ0EsVUFBSSxhQUFhLElBQUk7QUFDakIsY0FBTSxJQUFJLE1BQU0sOEVBQThFO0FBQUEsTUFDbEc7QUFDQSxVQUFJLE9BQU8sZUFBZSxVQUFVO0FBQ2hDLGNBQU0sSUFBSSxNQUFNLCtEQUErRDtBQUFBLE1BQ25GO0FBQ0EsWUFBTSxLQUFLLHdCQUF3QixVQUFVO0FBQzdDLFVBQUksQ0FBQyxHQUFHLE1BQU0sV0FBVyxRQUFRLFdBQVcsR0FBRztBQUMzQyxjQUFNLElBQUksTUFBTSxpRkFBaUY7QUFBQSxNQUNyRyxXQUFXLEdBQUcsTUFBTSxXQUFXLFFBQVEsWUFBWSxRQUFRO0FBQ3ZELGNBQU0sSUFBSSxNQUFNLDZEQUE2RDtBQUFBLE1BQ2pGO0FBQ0EsWUFBTSxxQkFBcUIsT0FBTyxRQUFRLHVCQUF1QixXQUFXLFFBQVEscUJBQXFCO0FBRXpHLFVBQUksdUJBQXVCLEtBQUssR0FBRyxZQUFZLG9CQUFvQjtBQUMvRCxjQUFNLElBQUksTUFBTSx1REFBdUQsR0FBRyxZQUFZLG9DQUFvQyxrQkFBa0I7QUFBQSxNQUNoSjtBQUNBLFlBQU0seUJBQXlCLFdBQVcsUUFBUTtBQUNsRCxZQUFNLHFCQUFxQixPQUFPLEdBQUcsUUFBUSxRQUFRLEdBQUcsT0FBTyxRQUFRLEdBQUc7QUFFMUUsVUFBSSxpQkFBaUIsU0FBUyxTQUFTO0FBR3ZDLFVBQUksUUFBUSxjQUFjLHNCQUFzQjtBQUM1QyxjQUFNLFdBQVcsT0FBTyxtQkFBbUIsRUFBRTtBQUM3QyxZQUFJLFdBQVcsc0NBQXNDLFFBQVE7QUFDN0QsWUFBSSxhQUFhLFNBQVMsYUFBYSxRQUFTLFlBQVc7QUFDM0QsY0FBTSxXQUFXLE1BQU0sT0FBTyxXQUFXLFVBQVUsUUFBUTtBQUMzRCxjQUFNLGNBQWMsT0FBTyxPQUFPO0FBQUEsVUFDOUIsT0FBTyxLQUFLLDBCQUEwQjtBQUFBLFVBQ3RDLE9BQU8sS0FBSyxRQUFRO0FBQUEsUUFDeEIsQ0FBQztBQUNELHlCQUFpQixZQUFZLFNBQVMsUUFBUTtBQUFBLE1BQ2xEO0FBQ0EsWUFBTSxpQ0FBaUMsT0FBTyxpQkFBaUIsUUFBUSxHQUFHO0FBQzFFLFlBQU0sY0FBYyx5QkFBeUIsTUFBTSxxQkFBcUIsTUFBTTtBQUM5RSxZQUFNLFlBQVksT0FBTyxLQUFLLEdBQUcsTUFBTSxRQUFRO0FBQy9DLFlBQU0saUJBQWlCLE1BQU0sT0FBTyxVQUFVLFNBQVMsUUFBUSxHQUFHLFdBQVcsR0FBRyxTQUFTO0FBQ3pGLFlBQU0sWUFBWSxNQUFNLE9BQU8sV0FBVyxnQkFBZ0IsWUFBWTtBQUN0RSxZQUFNLFlBQVksTUFBTSxPQUFPLE9BQU8sU0FBUztBQUMvQyxZQUFNLGtCQUFrQixNQUFNLE9BQU8sV0FBVyxXQUFXLFdBQVc7QUFDdEUsWUFBTSxjQUFjLFdBQVcsT0FBTyxLQUFLLFNBQVMsR0FBRyxPQUFPLEtBQUssZUFBZSxDQUFDLEVBQUUsU0FBUyxRQUFRO0FBQ3RHLFlBQU0sWUFBWSxNQUFNLE9BQU8sV0FBVyxnQkFBZ0IsWUFBWTtBQUN0RSxZQUFNLHVCQUF1QixNQUFNLE9BQU8sV0FBVyxXQUFXLFdBQVc7QUFDM0UsY0FBUSxVQUFVO0FBQ2xCLGNBQVEsa0JBQWtCLE9BQU8sS0FBSyxvQkFBb0IsRUFBRSxTQUFTLFFBQVE7QUFDN0UsY0FBUSxXQUFXLGlDQUFpQyxRQUFRO0FBQUEsSUFDaEU7QUF0RGU7QUF1RGYsYUFBUyxnQkFBZ0IsU0FBUyxZQUFZO0FBQzFDLFVBQUksUUFBUSxZQUFZLGdCQUFnQjtBQUNwQyxjQUFNLElBQUksTUFBTSx5Q0FBeUM7QUFBQSxNQUM3RDtBQUNBLFVBQUksT0FBTyxlQUFlLFVBQVU7QUFDaEMsY0FBTSxJQUFJLE1BQU0sK0RBQStEO0FBQUEsTUFDbkY7QUFDQSxZQUFNLEVBQUUsZ0JBQWdCLElBQUksd0JBQXdCLFVBQVU7QUFDOUQsVUFBSSxvQkFBb0IsUUFBUSxpQkFBaUI7QUFDN0MsY0FBTSxJQUFJLE1BQU0sbUVBQW1FO0FBQUEsTUFDdkY7QUFBQSxJQUNKO0FBWFM7QUFpQkwsYUFBUyxpQkFBaUIsTUFBTTtBQUNoQyxVQUFJLE9BQU8sU0FBUyxVQUFVO0FBQzFCLGNBQU0sSUFBSSxVQUFVLDZCQUE2QjtBQUFBLE1BQ3JEO0FBQ0EsYUFBTyxLQUFLLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLE1BQUksS0FBSyxXQUFXLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFJLEtBQUssTUFBUSxLQUFLLE1BQVEsS0FBSyxNQUFRLEtBQUssR0FBSTtBQUFBLElBQ3JIO0FBTGE7QUFnQlQsYUFBUyxTQUFTLE1BQU07QUFDeEIsYUFBTyxtRUFBbUUsS0FBSyxJQUFJO0FBQUEsSUFDdkY7QUFGYTtBQUdiLGFBQVMsb0JBQW9CLE1BQU07QUFDL0IsVUFBSSxPQUFPLFNBQVMsVUFBVTtBQUMxQixjQUFNLElBQUksVUFBVSw2Q0FBNkM7QUFBQSxNQUNyRTtBQUNBLGFBQU8sSUFBSSxJQUFJLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSSxDQUFDLGNBQVk7QUFDNUMsWUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEdBQUc7QUFDeEIsZ0JBQU0sSUFBSSxNQUFNLG9DQUFvQztBQUFBLFFBQ3hEO0FBQ0EsY0FBTSxPQUFPLFVBQVUsQ0FBQztBQUN4QixjQUFNLFFBQVEsVUFBVSxVQUFVLENBQUM7QUFDbkMsZUFBTztBQUFBLFVBQ0g7QUFBQSxVQUNBO0FBQUEsUUFDSjtBQUFBLE1BQ0osQ0FBQyxDQUFDO0FBQUEsSUFDTjtBQWZTO0FBZ0JULGFBQVMsd0JBQXdCLE1BQU07QUFDbkMsWUFBTSxZQUFZLG9CQUFvQixJQUFJO0FBQzFDLFlBQU0sUUFBUSxVQUFVLElBQUksR0FBRztBQUMvQixVQUFJLENBQUMsT0FBTztBQUNSLGNBQU0sSUFBSSxNQUFNLGlEQUFpRDtBQUFBLE1BQ3JFLFdBQVcsQ0FBQyxpQkFBaUIsS0FBSyxHQUFHO0FBQ2pDLGNBQU0sSUFBSSxNQUFNLGdGQUFnRjtBQUFBLE1BQ3BHO0FBQ0EsWUFBTSxPQUFPLFVBQVUsSUFBSSxHQUFHO0FBQzlCLFVBQUksQ0FBQyxNQUFNO0FBQ1AsY0FBTSxJQUFJLE1BQU0sZ0RBQWdEO0FBQUEsTUFDcEUsV0FBVyxDQUFDLFNBQVMsSUFBSSxHQUFHO0FBQ3hCLGNBQU0sSUFBSSxNQUFNLHVEQUF1RDtBQUFBLE1BQzNFO0FBQ0EsWUFBTSxnQkFBZ0IsVUFBVSxJQUFJLEdBQUc7QUFDdkMsVUFBSSxDQUFDLGVBQWU7QUFDaEIsY0FBTSxJQUFJLE1BQU0scURBQXFEO0FBQUEsTUFDekUsV0FBVyxDQUFDLGdCQUFnQixLQUFLLGFBQWEsR0FBRztBQUM3QyxjQUFNLElBQUksTUFBTSwyREFBMkQ7QUFBQSxNQUMvRTtBQUNBLFlBQU0sWUFBWSxTQUFTLGVBQWUsRUFBRTtBQUM1QyxhQUFPO0FBQUEsUUFDSDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUExQlM7QUEyQlQsYUFBUyx3QkFBd0IsWUFBWTtBQUN6QyxZQUFNLFlBQVksb0JBQW9CLFVBQVU7QUFDaEQsWUFBTSxRQUFRLFVBQVUsSUFBSSxHQUFHO0FBQy9CLFlBQU0sa0JBQWtCLFVBQVUsSUFBSSxHQUFHO0FBQ3pDLFVBQUksT0FBTztBQUNQLGNBQU0sSUFBSSxNQUFNLDZEQUE2RCxLQUFLLEdBQUc7QUFBQSxNQUN6RjtBQUNBLFVBQUksQ0FBQyxpQkFBaUI7QUFDbEIsY0FBTSxJQUFJLE1BQU0sK0RBQStEO0FBQUEsTUFDbkYsV0FBVyxDQUFDLFNBQVMsZUFBZSxHQUFHO0FBQ25DLGNBQU0sSUFBSSxNQUFNLG1FQUFtRTtBQUFBLE1BQ3ZGO0FBQ0EsYUFBTztBQUFBLFFBQ0g7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQWZTO0FBZ0JULGFBQVMsV0FBVyxHQUFHLEdBQUc7QUFDdEIsVUFBSSxDQUFDLE9BQU8sU0FBUyxDQUFDLEdBQUc7QUFDckIsY0FBTSxJQUFJLFVBQVUsaUNBQWlDO0FBQUEsTUFDekQ7QUFDQSxVQUFJLENBQUMsT0FBTyxTQUFTLENBQUMsR0FBRztBQUNyQixjQUFNLElBQUksVUFBVSxrQ0FBa0M7QUFBQSxNQUMxRDtBQUNBLFVBQUksRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN2QixjQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxNQUMvQztBQUNBLFVBQUksRUFBRSxXQUFXLEdBQUc7QUFDaEIsY0FBTSxJQUFJLE1BQU0seUJBQXlCO0FBQUEsTUFDN0M7QUFDQSxhQUFPLE9BQU8sS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLE1BQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUFBLElBQ2pEO0FBZFM7QUFlVCxJQUFBQSxRQUFPLFVBQVU7QUFBQSxNQUNiO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBO0FBQUE7OztBQ2hPQTtBQUFBLGdGQUFBQyxTQUFBO0FBQUE7QUFDQSxRQUFNQyxTQUFRO0FBQ2QsYUFBU0MsZUFBYyxXQUFXO0FBQzlCLFdBQUssU0FBUyxhQUFhRDtBQUMzQixXQUFLLE9BQU8sQ0FBQztBQUNiLFdBQUssU0FBUyxDQUFDO0FBQUEsSUFDbkI7QUFKUyxXQUFBQyxnQkFBQTtBQUtULElBQUFBLGVBQWMsVUFBVSxlQUFlLFNBQVMsUUFBUTtBQUNwRCxjQUFPLFFBQU87QUFBQSxRQUNWLEtBQUs7QUFDRCxpQkFBTyxLQUFLO0FBQUEsUUFDaEIsS0FBSztBQUNELGlCQUFPLEtBQUs7QUFBQSxRQUNoQjtBQUNJLGlCQUFPLENBQUM7QUFBQSxNQUNoQjtBQUFBLElBQ0o7QUFDQSxJQUFBQSxlQUFjLFVBQVUsZ0JBQWdCLFNBQVMsS0FBSyxRQUFRLFNBQVM7QUFDbkUsVUFBSSxPQUFPLFdBQVcsWUFBWTtBQUM5QixrQkFBVTtBQUNWLGlCQUFTO0FBQUEsTUFDYjtBQUNBLFdBQUssYUFBYSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDckM7QUFDQSxJQUFBQSxlQUFjLFVBQVUsZ0JBQWdCLFNBQVMsS0FBSyxRQUFRO0FBQzFELGVBQVMsVUFBVTtBQUNuQixhQUFPLEtBQUssYUFBYSxNQUFNLEVBQUUsR0FBRyxLQUFLLEtBQUssT0FBTyxjQUFjLEtBQUssTUFBTTtBQUFBLElBQ2xGO0FBQ0EsSUFBQUYsUUFBTyxVQUFVRTtBQUFBO0FBQUE7OztBQzVCakI7QUFBQSx1R0FBQUMsU0FBQTtBQUFBO0FBS0EsYUFBUyxNQUFNLEtBQUssVUFBVSxDQUFDLEdBQUc7QUFFOUIsVUFBSSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUs7QUFDdkIsY0FBTUMsVUFBUyxJQUFJLE1BQU0sR0FBRztBQUM1QixlQUFPO0FBQUEsVUFDSCxNQUFNQSxRQUFPLENBQUM7QUFBQSxVQUNkLFVBQVVBLFFBQU8sQ0FBQztBQUFBLFFBQ3RCO0FBQUEsTUFDSjtBQUVBLFlBQU0sU0FBUyx1QkFBTyxPQUFPLElBQUk7QUFDakMsVUFBSTtBQUNKLFVBQUksWUFBWTtBQUNoQixVQUFJLG1DQUFtQyxLQUFLLEdBQUcsR0FBRztBQUU5QyxjQUFNLFVBQVUsR0FBRyxFQUFFLFFBQVEsY0FBYyxLQUFLO0FBQUEsTUFDcEQ7QUFDQSxVQUFJO0FBQ0EsWUFBSTtBQUNBLG1CQUFTLElBQUksSUFBSSxLQUFLLGlCQUFpQjtBQUFBLFFBQzNDLFNBQVMsR0FBRztBQUVSLG1CQUFTLElBQUksSUFBSSxJQUFJLFFBQVEsTUFBTSxlQUFlLEdBQUcsaUJBQWlCO0FBQ3RFLHNCQUFZO0FBQUEsUUFDaEI7QUFBQSxNQUNKLFNBQVMsS0FBSztBQUVWLFlBQUksVUFBVSxJQUFJLFFBQVE7QUFDMUIsY0FBTTtBQUFBLE1BQ1Y7QUFFQSxpQkFBVyxTQUFTLE9BQU8sYUFBYSxRQUFRLEdBQUU7QUFDOUMsZUFBTyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztBQUFBLE1BQzlCO0FBQ0EsYUFBTyxPQUFPLE9BQU8sUUFBUSxtQkFBbUIsT0FBTyxRQUFRO0FBQy9ELGFBQU8sV0FBVyxPQUFPLFlBQVksbUJBQW1CLE9BQU8sUUFBUTtBQUN2RSxVQUFJLE9BQU8sWUFBWSxXQUFXO0FBQzlCLGVBQU8sT0FBTyxVQUFVLE9BQU8sUUFBUTtBQUN2QyxlQUFPLFdBQVcsT0FBTyxhQUFhLElBQUksSUFBSTtBQUM5QyxlQUFPLGtCQUFrQixPQUFPLGFBQWEsSUFBSSxVQUFVO0FBQzNELGVBQU87QUFBQSxNQUNYO0FBQ0EsWUFBTSxXQUFXLFlBQVksS0FBSyxPQUFPO0FBQ3pDLFVBQUksQ0FBQyxPQUFPLE1BQU07QUFFZCxlQUFPLE9BQU8sbUJBQW1CLFFBQVE7QUFBQSxNQUM3QyxXQUFXLFlBQVksUUFBUSxLQUFLLFFBQVEsR0FBRztBQUUzQyxlQUFPLFdBQVcsV0FBVyxPQUFPO0FBQUEsTUFDeEM7QUFDQSxVQUFJLENBQUMsT0FBTyxNQUFNO0FBRWQsZUFBTyxPQUFPLE9BQU87QUFBQSxNQUN6QjtBQUNBLFlBQU0sV0FBVyxPQUFPLFNBQVMsTUFBTSxDQUFDLEtBQUs7QUFDN0MsYUFBTyxXQUFXLFdBQVcsVUFBVSxRQUFRLElBQUk7QUFDbkQsVUFBSSxPQUFPLFFBQVEsVUFBVSxPQUFPLFFBQVEsS0FBSztBQUM3QyxlQUFPLE1BQU07QUFBQSxNQUNqQjtBQUNBLFVBQUksT0FBTyxRQUFRLEtBQUs7QUFDcEIsZUFBTyxNQUFNO0FBQUEsTUFDakI7QUFDQSxVQUFJLE9BQU8sV0FBVyxPQUFPLFVBQVUsT0FBTyxlQUFlLE9BQU8sU0FBUztBQUN6RSxlQUFPLE1BQU0sQ0FBQztBQUFBLE1BQ2xCO0FBR0EsVUFBSSxPQUFPLG1CQUFtQixZQUFZLE9BQU8sUUFBUSxRQUFXO0FBQ2hFLGVBQU8sTUFBTTtBQUFBLE1BQ2pCO0FBRUEsWUFBTSxLQUFLLE9BQU8sV0FBVyxPQUFPLFVBQVUsT0FBTyxjQUFjLFFBQVEsSUFBSSxJQUFJO0FBQ25GLFVBQUksT0FBTyxTQUFTO0FBQ2hCLGVBQU8sSUFBSSxPQUFPLEdBQUcsYUFBYSxPQUFPLE9BQU8sRUFBRSxTQUFTO0FBQUEsTUFDL0Q7QUFDQSxVQUFJLE9BQU8sUUFBUTtBQUNmLGVBQU8sSUFBSSxNQUFNLEdBQUcsYUFBYSxPQUFPLE1BQU0sRUFBRSxTQUFTO0FBQUEsTUFDN0Q7QUFDQSxVQUFJLE9BQU8sYUFBYTtBQUNwQixlQUFPLElBQUksS0FBSyxHQUFHLGFBQWEsT0FBTyxXQUFXLEVBQUUsU0FBUztBQUFBLE1BQ2pFO0FBQ0EsVUFBSSxRQUFRLGtCQUFrQixPQUFPLGdCQUFnQjtBQUNqRCxjQUFNLElBQUksTUFBTSw4RUFBOEU7QUFBQSxNQUNsRztBQUNBLFVBQUksT0FBTyxtQkFBbUIsVUFBVSxRQUFRLGdCQUFnQjtBQUM1RCxnQkFBTyxPQUFPLFNBQVE7QUFBQSxVQUNsQixLQUFLLFdBQ0Q7QUFDSSxtQkFBTyxNQUFNO0FBQ2I7QUFBQSxVQUNKO0FBQUEsVUFDSixLQUFLLFVBQ0Q7QUFDSSxtQkFBTyxJQUFJLHFCQUFxQjtBQUNoQztBQUFBLFVBQ0o7QUFBQSxVQUNKLEtBQUssV0FDRDtBQUNJLGdCQUFJLE9BQU8sYUFBYTtBQUVwQixxQkFBTyxJQUFJLHNCQUFzQixXQUFXO0FBQUEsY0FBQztBQUFBLFlBQ2pELE9BQU87QUFDSCxxQkFBTyxJQUFJLHFCQUFxQjtBQUFBLFlBQ3BDO0FBQ0E7QUFBQSxVQUNKO0FBQUEsVUFDSixLQUFLLGFBQ0Q7QUFDSSxnQkFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJO0FBQ2hCLG9CQUFNLElBQUksTUFBTSxpWEFBaVg7QUFBQSxZQUNyWTtBQUNBLG1CQUFPLElBQUksc0JBQXNCLFdBQVc7QUFBQSxZQUFDO0FBQzdDO0FBQUEsVUFDSjtBQUFBLFVBQ0osS0FBSyxlQUNEO0FBQ0k7QUFBQSxVQUNKO0FBQUEsUUFDUjtBQUFBLE1BQ0osT0FBTztBQUNILGdCQUFPLE9BQU8sU0FBUTtBQUFBLFVBQ2xCLEtBQUssV0FDRDtBQUNJLG1CQUFPLE1BQU07QUFDYjtBQUFBLFVBQ0o7QUFBQSxVQUNKLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUssZUFDRDtBQUNJLGdCQUFJLE9BQU8sWUFBWSxlQUFlO0FBQ2xDLHVDQUF5QixPQUFPLE9BQU87QUFBQSxZQUMzQztBQUNBO0FBQUEsVUFDSjtBQUFBLFVBQ0osS0FBSyxhQUNEO0FBQ0ksbUJBQU8sSUFBSSxxQkFBcUI7QUFDaEM7QUFBQSxVQUNKO0FBQUEsUUFDUjtBQUFBLE1BQ0o7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQWhKUztBQWtKVCxhQUFTLG9CQUFvQixXQUFXO0FBQ3BDLFlBQU0sb0JBQW9CLE9BQU8sUUFBUSxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssTUFBSTtBQUcxRSxZQUFJLFVBQVUsVUFBYSxVQUFVLE1BQU07QUFDdkMsWUFBRSxHQUFHLElBQUk7QUFBQSxRQUNiO0FBQ0EsZUFBTztBQUFBLE1BQ1gsR0FBRyx1QkFBTyxPQUFPLElBQUksQ0FBQztBQUN0QixhQUFPO0FBQUEsSUFDWDtBQVZTO0FBWVQsYUFBUyxlQUFlLFFBQVE7QUFDNUIsWUFBTSxhQUFhLE9BQU8sUUFBUSxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssTUFBSTtBQUNoRSxZQUFJLFFBQVEsT0FBTztBQUNmLGdCQUFNLFlBQVk7QUFDbEIsY0FBSSxPQUFPLGNBQWMsV0FBVztBQUNoQyxjQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ2I7QUFDQSxjQUFJLE9BQU8sY0FBYyxVQUFVO0FBQy9CLGNBQUUsR0FBRyxJQUFJLG9CQUFvQixTQUFTO0FBQUEsVUFDMUM7QUFBQSxRQUNKLFdBQVcsVUFBVSxVQUFhLFVBQVUsTUFBTTtBQUM5QyxjQUFJLFFBQVEsUUFBUTtBQUdoQixnQkFBSSxVQUFVLElBQUk7QUFDZCxvQkFBTSxJQUFJLFNBQVMsT0FBTyxFQUFFO0FBQzVCLGtCQUFJLE1BQU0sQ0FBQyxHQUFHO0FBQ1Ysc0JBQU0sSUFBSSxNQUFNLFdBQVcsR0FBRyxLQUFLLEtBQUssRUFBRTtBQUFBLGNBQzlDO0FBQ0EsZ0JBQUUsR0FBRyxJQUFJO0FBQUEsWUFDYjtBQUFBLFVBQ0osT0FBTztBQUNILGNBQUUsR0FBRyxJQUFJO0FBQUEsVUFDYjtBQUFBLFFBQ0o7QUFDQSxlQUFPO0FBQUEsTUFDWCxHQUFHLHVCQUFPLE9BQU8sSUFBSSxDQUFDO0FBQ3RCLGFBQU87QUFBQSxJQUNYO0FBNUJTO0FBOEJULGFBQVMsc0JBQXNCLEtBQUs7QUFDaEMsYUFBTyxlQUFlLE1BQU0sR0FBRyxDQUFDO0FBQUEsSUFDcEM7QUFGUztBQUdULGFBQVMseUJBQXlCLFNBQVM7QUFDdkMsVUFBSSxDQUFDLHlCQUF5QixVQUFVLE9BQU8sWUFBWSxlQUFlLFFBQVEsYUFBYTtBQUMzRixpQ0FBeUIsU0FBUztBQUNsQyxnQkFBUSxZQUFZO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwRUFLOEMsT0FBTztBQUFBO0FBQUEsMkZBRVU7QUFBQSxNQUN2RjtBQUFBLElBQ0o7QUFaUztBQWFULElBQUFELFFBQU8sVUFBVTtBQUNqQixVQUFNLFFBQVE7QUFDZCxVQUFNLGlCQUFpQjtBQUN2QixVQUFNLHdCQUF3QjtBQUFBO0FBQUE7OztBQ3BOOUI7QUFBQSx1RkFBQUUsU0FBQTtBQUFBO0FBQ0EsUUFBTSxNQUFNLFFBQVEsS0FBSztBQUN6QixRQUFNQyxZQUFXO0FBQ2pCLFFBQU0sUUFBUSwrQkFBZ0M7QUFFOUMsUUFBTSxNQUFNLGdDQUFTLEtBQUssUUFBUSxRQUFRO0FBQ3RDLFVBQUksT0FBTyxHQUFHLEdBQUc7QUFDYixlQUFPLE9BQU8sR0FBRztBQUFBLE1BQ3JCO0FBQ0EsVUFBSSxXQUFXLFFBQVc7QUFDdEIsaUJBQVMsUUFBUSxJQUFJLE9BQU8sSUFBSSxZQUFZLENBQUM7QUFBQSxNQUNqRCxXQUFXLFdBQVcsT0FBTztBQUFBLE1BRTdCLE9BQU87QUFDSCxpQkFBUyxRQUFRLElBQUksTUFBTTtBQUFBLE1BQy9CO0FBQ0EsYUFBTyxVQUFVQSxVQUFTLEdBQUc7QUFBQSxJQUNqQyxHQVpZO0FBYVosUUFBTSwrQkFBK0Isa0NBQVc7QUFDNUMsY0FBTyxRQUFRLElBQUksV0FBVTtBQUFBLFFBQ3pCLEtBQUs7QUFDRCxpQkFBTztBQUFBLFFBQ1gsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPO0FBQUEsUUFDWCxLQUFLO0FBQ0QsaUJBQU87QUFBQSxZQUNILG9CQUFvQjtBQUFBLFVBQ3hCO0FBQUEsTUFDUjtBQUNBLGFBQU9BLFVBQVM7QUFBQSxJQUNwQixHQWZxQztBQWlCckMsUUFBTSxrQkFBa0IsZ0NBQVMsT0FBTztBQUNwQyxhQUFPLE9BQU8sS0FBSyxPQUFPLFFBQVEsT0FBTyxNQUFNLEVBQUUsUUFBUSxNQUFNLEtBQUssSUFBSTtBQUFBLElBQzVFLEdBRndCO0FBR3hCLFFBQU0sTUFBTSxnQ0FBUyxRQUFRLFFBQVEsV0FBVztBQUM1QyxZQUFNLFFBQVEsT0FBTyxTQUFTO0FBQzlCLFVBQUksVUFBVSxVQUFhLFVBQVUsTUFBTTtBQUN2QyxlQUFPLEtBQUssWUFBWSxNQUFNLGdCQUFnQixLQUFLLENBQUM7QUFBQSxNQUN4RDtBQUFBLElBQ0osR0FMWTtBQU1aLFFBQU0sdUJBQU4sTUFBMkI7QUFBQSxNQTVDM0IsT0E0QzJCO0FBQUE7QUFBQTtBQUFBLE1BQ3ZCLFlBQVksUUFBTztBQUVmLGlCQUFTLE9BQU8sV0FBVyxXQUFXLE1BQU0sTUFBTSxJQUFJLFVBQVUsQ0FBQztBQUdqRSxZQUFJLE9BQU8sa0JBQWtCO0FBQ3pCLG1CQUFTLE9BQU8sT0FBTyxDQUFDLEdBQUcsUUFBUSxNQUFNLE9BQU8sZ0JBQWdCLENBQUM7QUFBQSxRQUNyRTtBQUNBLGFBQUssT0FBTyxJQUFJLFFBQVEsTUFBTTtBQUM5QixhQUFLLFdBQVcsSUFBSSxZQUFZLE1BQU07QUFDdEMsWUFBSSxLQUFLLGFBQWEsUUFBVztBQUM3QixlQUFLLFdBQVcsS0FBSztBQUFBLFFBQ3pCO0FBQ0EsYUFBSyxPQUFPLFNBQVMsSUFBSSxRQUFRLE1BQU0sR0FBRyxFQUFFO0FBQzVDLGFBQUssT0FBTyxJQUFJLFFBQVEsTUFBTTtBQUc5QixlQUFPLGVBQWUsTUFBTSxZQUFZO0FBQUEsVUFDcEMsY0FBYztBQUFBLFVBQ2QsWUFBWTtBQUFBLFVBQ1osVUFBVTtBQUFBLFVBQ1YsT0FBTyxJQUFJLFlBQVksTUFBTTtBQUFBLFFBQ2pDLENBQUM7QUFDRCxhQUFLLFNBQVMsSUFBSSxVQUFVLE1BQU07QUFDbEMsYUFBSyxVQUFVLElBQUksV0FBVyxNQUFNO0FBQ3BDLGFBQUssTUFBTSxPQUFPLE9BQU8sUUFBUSxjQUFjLDZCQUE2QixJQUFJLE9BQU87QUFDdkYsWUFBSSxPQUFPLEtBQUssUUFBUSxVQUFVO0FBQzlCLGNBQUksS0FBSyxRQUFRLFFBQVE7QUFDckIsaUJBQUssTUFBTTtBQUFBLFVBQ2Y7QUFBQSxRQUNKO0FBRUEsWUFBSSxLQUFLLFFBQVEsYUFBYTtBQUMxQixlQUFLLE1BQU07QUFBQSxZQUNQLG9CQUFvQjtBQUFBLFVBQ3hCO0FBQUEsUUFDSjtBQUNBLFlBQUksS0FBSyxPQUFPLEtBQUssSUFBSSxLQUFLO0FBQzFCLGlCQUFPLGVBQWUsS0FBSyxLQUFLLE9BQU87QUFBQSxZQUNuQyxZQUFZO0FBQUEsVUFDaEIsQ0FBQztBQUFBLFFBQ0w7QUFHQSxhQUFLLGlCQUFpQixJQUFJLGtCQUFrQixRQUFRLGtCQUFrQjtBQUN0RSxZQUFJLEtBQUssbUJBQW1CLFVBQWEsS0FBSyxtQkFBbUIsY0FBYyxLQUFLLG1CQUFtQixVQUFVO0FBQzdHLGdCQUFNLElBQUksTUFBTSxrQ0FBa0MsS0FBSyxjQUFjLDhDQUE4QztBQUFBLFFBQ3ZIO0FBQ0EsWUFBSSxLQUFLLG1CQUFtQixZQUFZLENBQUMsS0FBSyxLQUFLO0FBQy9DLGdCQUFNLElBQUksTUFBTSxrREFBa0Q7QUFBQSxRQUN0RTtBQUNBLGFBQUssa0JBQWtCLElBQUksbUJBQW1CLE1BQU07QUFDcEQsYUFBSyxjQUFjLElBQUksZUFBZSxNQUFNO0FBRTVDLGFBQUssaUJBQWlCLEVBQUUsS0FBSyxRQUFRLElBQUksUUFBUSxHQUFHO0FBQ3BELGFBQUssbUJBQW1CLElBQUksb0JBQW9CLFFBQVEsV0FBVztBQUNuRSxhQUFLLDRCQUE0QixJQUFJLDZCQUE2QixRQUFRLEtBQUs7QUFDL0UsYUFBSyxvQkFBb0IsSUFBSSxxQkFBcUIsUUFBUSxLQUFLO0FBQy9ELGFBQUssZUFBZSxJQUFJLGdCQUFnQixRQUFRLEtBQUs7QUFDckQsYUFBSyxzQ0FBc0MsSUFBSSx1Q0FBdUMsUUFBUSxLQUFLO0FBQ25HLGFBQUssZ0JBQWdCLElBQUksaUJBQWlCLFFBQVEsS0FBSztBQUN2RCxZQUFJLE9BQU8sNEJBQTRCLFFBQVc7QUFDOUMsZUFBSyxrQkFBa0IsUUFBUSxJQUFJLHFCQUFxQjtBQUFBLFFBQzVELE9BQU87QUFDSCxlQUFLLGtCQUFrQixLQUFLLE1BQU0sT0FBTywwQkFBMEIsR0FBSTtBQUFBLFFBQzNFO0FBQ0EsWUFBSSxPQUFPLGNBQWMsT0FBTztBQUM1QixlQUFLLGFBQWE7QUFBQSxRQUN0QixXQUFXLE9BQU8sY0FBYyxNQUFNO0FBQ2xDLGVBQUssYUFBYTtBQUFBLFFBQ3RCO0FBQ0EsWUFBSSxPQUFPLE9BQU8sZ0NBQWdDLFVBQVU7QUFDeEQsZUFBSyxrQkFBa0IsS0FBSyxNQUFNLE9BQU8sOEJBQThCLEdBQUk7QUFBQSxRQUMvRTtBQUFBLE1BQ0o7QUFBQSxNQUNBLHlCQUF5QixJQUFJO0FBQ3pCLGNBQU0sU0FBUyxDQUFDO0FBQ2hCLFlBQUksUUFBUSxNQUFNLE1BQU07QUFDeEIsWUFBSSxRQUFRLE1BQU0sVUFBVTtBQUM1QixZQUFJLFFBQVEsTUFBTSxNQUFNO0FBQ3hCLFlBQUksUUFBUSxNQUFNLGtCQUFrQjtBQUNwQyxZQUFJLFFBQVEsTUFBTSwyQkFBMkI7QUFDN0MsWUFBSSxRQUFRLE1BQU0saUJBQWlCO0FBQ25DLFlBQUksUUFBUSxNQUFNLFNBQVM7QUFDM0IsY0FBTSxNQUFNLE9BQU8sS0FBSyxRQUFRLFdBQVcsS0FBSyxNQUFNLEtBQUssTUFBTTtBQUFBLFVBQzdELFNBQVMsS0FBSztBQUFBLFFBQ2xCLElBQUksQ0FBQztBQUNMLFlBQUksUUFBUSxLQUFLLFNBQVM7QUFDMUIsWUFBSSxRQUFRLEtBQUssT0FBTztBQUN4QixZQUFJLFFBQVEsS0FBSyxRQUFRO0FBQ3pCLFlBQUksUUFBUSxLQUFLLFNBQVM7QUFDMUIsWUFBSSxRQUFRLEtBQUssYUFBYTtBQUM5QixZQUFJLFFBQVEsTUFBTSxnQkFBZ0I7QUFDbEMsWUFBSSxLQUFLLFVBQVU7QUFDZixpQkFBTyxLQUFLLFlBQVksZ0JBQWdCLEtBQUssUUFBUSxDQUFDO0FBQUEsUUFDMUQ7QUFDQSxZQUFJLEtBQUssYUFBYTtBQUNsQixpQkFBTyxLQUFLLGlCQUFpQixnQkFBZ0IsS0FBSyxXQUFXLENBQUM7QUFBQSxRQUNsRTtBQUNBLFlBQUksS0FBSyxNQUFNO0FBQ1gsaUJBQU8sS0FBSyxVQUFVLGdCQUFnQixLQUFLLElBQUksQ0FBQztBQUFBLFFBQ3BEO0FBQ0EsWUFBSSxLQUFLLGdCQUFnQjtBQUNyQixpQkFBTyxHQUFHLE1BQU0sT0FBTyxLQUFLLEdBQUcsQ0FBQztBQUFBLFFBQ3BDO0FBQ0EsWUFBSSxLQUFLLGlCQUFpQjtBQUN0QixpQkFBTyxLQUFLLHFCQUFxQixnQkFBZ0IsS0FBSyxlQUFlLENBQUM7QUFBQSxRQUMxRTtBQUNBLFlBQUksT0FBTyxLQUFLLE1BQU0sU0FBUyxLQUFLLFNBQVM7QUFDekMsY0FBSSxJQUFLLFFBQU8sR0FBRyxLQUFLLElBQUk7QUFDNUIsaUJBQU8sS0FBSyxjQUFjLGdCQUFnQixPQUFPLENBQUM7QUFDbEQsaUJBQU8sR0FBRyxNQUFNLE9BQU8sS0FBSyxHQUFHLENBQUM7QUFBQSxRQUNwQyxDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFDQSxJQUFBRCxRQUFPLFVBQVU7QUFBQTtBQUFBOzs7QUNoS2pCO0FBQUEsd0VBQUFFLFNBQUE7QUFBQTtBQUNBLFFBQU1DLFNBQVE7QUFDZCxRQUFNLGNBQWM7QUFJcEIsUUFBTUMsVUFBTixNQUFhO0FBQUEsTUFOYixPQU1hO0FBQUE7QUFBQTtBQUFBLE1BQ1QsWUFBWSxTQUFTRCxRQUFNO0FBQ3ZCLGFBQUssVUFBVTtBQUNmLGFBQUssV0FBVztBQUNoQixhQUFLLE1BQU07QUFDWCxhQUFLLE9BQU8sQ0FBQztBQUNiLGFBQUssU0FBUyxDQUFDO0FBQ2YsYUFBSyxXQUFXO0FBQ2hCLGFBQUssU0FBU0E7QUFDZCxhQUFLLFVBQVU7QUFDZixhQUFLLGFBQWEsWUFBWTtBQUM5QixZQUFJLEtBQUssWUFBWTtBQUNqQixlQUFLLFdBQVcsS0FBSztBQUFBLFFBQ3pCO0FBQ0EsYUFBSyw2QkFBNkI7QUFBQSxNQUN0QztBQUFBO0FBQUEsTUFFQSxtQkFBbUIsS0FBSztBQUNwQixZQUFJO0FBQ0osWUFBSSxJQUFJLE1BQU07QUFFVixrQkFBUSxZQUFZLEtBQUssSUFBSSxJQUFJO0FBQUEsUUFDckMsT0FBTztBQUVILGtCQUFRLFlBQVksS0FBSyxJQUFJLE9BQU87QUFBQSxRQUN4QztBQUNBLFlBQUksT0FBTztBQUNQLGVBQUssVUFBVSxNQUFNLENBQUM7QUFDdEIsY0FBSSxNQUFNLENBQUMsR0FBRztBQUVWLGlCQUFLLE1BQU0sU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQ2hDLGlCQUFLLFdBQVcsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQUEsVUFDekMsV0FBVyxNQUFNLENBQUMsR0FBRztBQUVqQixpQkFBSyxXQUFXLFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRTtBQUFBLFVBQ3pDO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxNQUNBLGlCQUFpQixTQUFTO0FBQ3RCLGNBQU0sTUFBTSxJQUFJLE1BQU0sUUFBUSxNQUFNO0FBQ3BDLGlCQUFRLElBQUksR0FBRyxNQUFNLFFBQVEsUUFBUSxJQUFJLEtBQUssS0FBSTtBQUM5QyxnQkFBTSxXQUFXLFFBQVEsQ0FBQztBQUMxQixjQUFJLGFBQWEsTUFBTTtBQUNuQixnQkFBSSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsRUFBRSxRQUFRO0FBQUEsVUFDdEMsT0FBTztBQUNILGdCQUFJLENBQUMsSUFBSTtBQUFBLFVBQ2I7QUFBQSxRQUNKO0FBQ0EsZUFBTztBQUFBLE1BQ1g7QUFBQSxNQUNBLFNBQVMsU0FBUztBQUNkLGNBQU0sTUFBTTtBQUFBLFVBQ1IsR0FBRyxLQUFLO0FBQUEsUUFDWjtBQUNBLGlCQUFRLElBQUksR0FBRyxNQUFNLFFBQVEsUUFBUSxJQUFJLEtBQUssS0FBSTtBQUM5QyxnQkFBTSxXQUFXLFFBQVEsQ0FBQztBQUMxQixnQkFBTSxRQUFRLEtBQUssT0FBTyxDQUFDLEVBQUU7QUFDN0IsY0FBSSxhQUFhLE1BQU07QUFDbkIsa0JBQU0sSUFBSSxLQUFLLE9BQU8sQ0FBQyxFQUFFLFdBQVcsV0FBVyxPQUFPLEtBQUssUUFBUSxJQUFJO0FBQ3ZFLGdCQUFJLEtBQUssSUFBSSxLQUFLLFNBQVMsQ0FBQyxFQUFFLENBQUM7QUFBQSxVQUNuQyxPQUFPO0FBQ0gsZ0JBQUksS0FBSyxJQUFJO0FBQUEsVUFDakI7QUFBQSxRQUNKO0FBQ0EsZUFBTztBQUFBLE1BQ1g7QUFBQSxNQUNBLE9BQU8sS0FBSztBQUNSLGFBQUssS0FBSyxLQUFLLEdBQUc7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsVUFBVSxtQkFBbUI7QUFLekIsYUFBSyxTQUFTO0FBQ2QsWUFBSSxLQUFLLE9BQU8sUUFBUTtBQUNwQixlQUFLLFdBQVcsSUFBSSxNQUFNLGtCQUFrQixNQUFNO0FBQUEsUUFDdEQ7QUFDQSxjQUFNLE1BQU0sdUJBQU8sT0FBTyxJQUFJO0FBQzlCLGlCQUFRLElBQUksR0FBRyxJQUFJLGtCQUFrQixRQUFRLEtBQUk7QUFDN0MsZ0JBQU0sT0FBTyxrQkFBa0IsQ0FBQztBQUNoQyxjQUFJLEtBQUssSUFBSSxJQUFJO0FBQ2pCLGNBQUksS0FBSyxRQUFRO0FBQ2IsaUJBQUssU0FBUyxDQUFDLElBQUksS0FBSyxPQUFPLGNBQWMsS0FBSyxZQUFZLEtBQUssVUFBVSxNQUFNO0FBQUEsVUFDdkYsT0FBTztBQUNILGlCQUFLLFNBQVMsQ0FBQyxJQUFJQSxPQUFNLGNBQWMsS0FBSyxZQUFZLEtBQUssVUFBVSxNQUFNO0FBQUEsVUFDakY7QUFBQSxRQUNKO0FBQ0EsYUFBSyw2QkFBNkI7QUFBQSxVQUM5QixHQUFHO0FBQUEsUUFDUDtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQ0EsSUFBQUQsUUFBTyxVQUFVRTtBQUFBO0FBQUE7OztBQ25HakI7QUFBQSx1RUFBQUMsU0FBQTtBQUFBO0FBQ0EsUUFBTSxFQUFFLGFBQWEsSUFBSSxRQUFRLFFBQVE7QUFDekMsUUFBTUMsVUFBUztBQUNmLFFBQU0sUUFBUTtBQUNkLFFBQU1DLFNBQU4sY0FBb0IsYUFBYTtBQUFBLE1BSmpDLE9BSWlDO0FBQUE7QUFBQTtBQUFBLE1BQzdCLFlBQVksUUFBUSxRQUFRLFVBQVM7QUFDakMsY0FBTTtBQUNOLGlCQUFTLE1BQU0scUJBQXFCLFFBQVEsUUFBUSxRQUFRO0FBQzVELGFBQUssT0FBTyxPQUFPO0FBQ25CLGFBQUssU0FBUyxPQUFPO0FBQ3JCLGFBQUssT0FBTyxPQUFPO0FBQ25CLGFBQUssUUFBUSxPQUFPO0FBQ3BCLGFBQUssT0FBTyxPQUFPO0FBQ25CLGFBQUssWUFBWSxPQUFPO0FBQ3hCLGFBQUssU0FBUyxPQUFPO0FBRXJCLGFBQUssU0FBUyxPQUFPLFVBQVU7QUFDL0IsYUFBSyxXQUFXLE9BQU87QUFDdkIsYUFBSyxXQUFXLE9BQU87QUFDdkIsWUFBSSxRQUFRLFVBQVUsT0FBTyxVQUFVO0FBQ25DLGVBQUssV0FBVyxRQUFRLE9BQU8sS0FBSyxPQUFPLFFBQVE7QUFBQSxRQUN2RDtBQUNBLGFBQUssVUFBVSxJQUFJRCxRQUFPLEtBQUssVUFBVSxLQUFLLEtBQUs7QUFFbkQsYUFBSyxXQUFXLEtBQUs7QUFDckIsYUFBSyxzQkFBc0I7QUFBQSxNQUMvQjtBQUFBLE1BQ0Esc0JBQXNCO0FBQ2xCLFlBQUksS0FBSyxjQUFjLFlBQVk7QUFDL0IsaUJBQU87QUFBQSxRQUNYO0FBRUEsWUFBSSxLQUFLLE1BQU07QUFDWCxpQkFBTztBQUFBLFFBQ1g7QUFHQSxZQUFJLEtBQUssTUFBTTtBQUNYLGlCQUFPO0FBQUEsUUFDWDtBQUVBLFlBQUksQ0FBQyxLQUFLLE1BQU07QUFDWixpQkFBTztBQUFBLFFBQ1g7QUFFQSxZQUFJLENBQUMsS0FBSyxRQUFRO0FBQ2QsaUJBQU87QUFBQSxRQUNYO0FBQ0EsZUFBTyxLQUFLLE9BQU8sU0FBUztBQUFBLE1BQ2hDO0FBQUEsTUFDQSxvQkFBb0I7QUFJaEIsWUFBSSxLQUFLLFFBQVEsU0FBUztBQUN0QixjQUFJLENBQUMsTUFBTSxRQUFRLEtBQUssUUFBUSxHQUFHO0FBQy9CLGlCQUFLLFdBQVc7QUFBQSxjQUNaLEtBQUs7QUFBQSxZQUNUO0FBQUEsVUFDSjtBQUNBLGVBQUssVUFBVSxJQUFJQSxRQUFPLEtBQUssVUFBVSxLQUFLLFFBQVEsTUFBTTtBQUM1RCxlQUFLLFNBQVMsS0FBSyxLQUFLLE9BQU87QUFBQSxRQUNuQztBQUFBLE1BQ0o7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlBLHFCQUFxQixLQUFLO0FBQ3RCLGFBQUssa0JBQWtCO0FBQ3ZCLGFBQUssUUFBUSxVQUFVLElBQUksTUFBTTtBQUNqQyxhQUFLLGtCQUFrQixLQUFLLFlBQVksQ0FBQyxLQUFLLFVBQVUsS0FBSyxFQUFFO0FBQUEsTUFDbkU7QUFBQSxNQUNBLGNBQWMsS0FBSztBQUNmLFlBQUk7QUFDSixZQUFJLEtBQUsscUJBQXFCO0FBQzFCO0FBQUEsUUFDSjtBQUNBLFlBQUk7QUFDQSxnQkFBTSxLQUFLLFFBQVEsU0FBUyxJQUFJLE1BQU07QUFBQSxRQUMxQyxTQUFTLEtBQUs7QUFDVixlQUFLLHNCQUFzQjtBQUMzQjtBQUFBLFFBQ0o7QUFDQSxhQUFLLEtBQUssT0FBTyxLQUFLLEtBQUssT0FBTztBQUNsQyxZQUFJLEtBQUssaUJBQWlCO0FBQ3RCLGVBQUssUUFBUSxPQUFPLEdBQUc7QUFBQSxRQUMzQjtBQUFBLE1BQ0o7QUFBQSxNQUNBLHNCQUFzQixLQUFLLFlBQVk7QUFDbkMsYUFBSyxrQkFBa0I7QUFDdkIsYUFBSyxRQUFRLG1CQUFtQixHQUFHO0FBR25DLFlBQUksS0FBSyxNQUFNO0FBQ1gscUJBQVcsS0FBSztBQUFBLFFBQ3BCO0FBQUEsTUFDSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxpQkFBaUIsWUFBWTtBQUN6QixZQUFJLEtBQUssTUFBTTtBQUNYLHFCQUFXLEtBQUs7QUFBQSxRQUNwQjtBQUFBLE1BQ0o7QUFBQSxNQUNBLFlBQVksS0FBSyxZQUFZO0FBRXpCLFlBQUksS0FBSyxxQkFBcUI7QUFDMUIsZ0JBQU0sS0FBSztBQUNYLGVBQUssc0JBQXNCO0FBQUEsUUFDL0I7QUFHQSxZQUFJLEtBQUssVUFBVTtBQUNmLGlCQUFPLEtBQUssU0FBUyxHQUFHO0FBQUEsUUFDNUI7QUFDQSxhQUFLLEtBQUssU0FBUyxHQUFHO0FBQUEsTUFDMUI7QUFBQSxNQUNBLG9CQUFvQixLQUFLO0FBQ3JCLFlBQUksS0FBSyxxQkFBcUI7QUFDMUIsaUJBQU8sS0FBSyxZQUFZLEtBQUsscUJBQXFCLEdBQUc7QUFBQSxRQUN6RDtBQUNBLFlBQUksS0FBSyxVQUFVO0FBQ2YsY0FBSTtBQUNBLGlCQUFLLFNBQVMsTUFBTSxLQUFLLFFBQVE7QUFBQSxVQUNyQyxTQUFTLEtBQUs7QUFDVixvQkFBUSxTQUFTLE1BQUk7QUFDakIsb0JBQU07QUFBQSxZQUNWLENBQUM7QUFBQSxVQUNMO0FBQUEsUUFDSjtBQUNBLGFBQUssS0FBSyxPQUFPLEtBQUssUUFBUTtBQUFBLE1BQ2xDO0FBQUEsTUFDQSxPQUFPLFlBQVk7QUFDZixZQUFJLE9BQU8sS0FBSyxTQUFTLFlBQVksT0FBTyxLQUFLLFNBQVMsVUFBVTtBQUNoRSxpQkFBTyxJQUFJLE1BQU0sNEVBQTRFO0FBQUEsUUFDakc7QUFDQSxjQUFNLFdBQVcsV0FBVyxpQkFBaUIsS0FBSyxJQUFJO0FBQ3RELFlBQUksS0FBSyxRQUFRLFlBQVksS0FBSyxTQUFTLFVBQVU7QUFDakQsaUJBQU8sSUFBSSxNQUFNLHlDQUF5QyxLQUFLLElBQUksc0NBQXNDO0FBQUEsUUFDN0c7QUFDQSxZQUFJLEtBQUssVUFBVSxDQUFDLE1BQU0sUUFBUSxLQUFLLE1BQU0sR0FBRztBQUM1QyxpQkFBTyxJQUFJLE1BQU0sK0JBQStCO0FBQUEsUUFDcEQ7QUFDQSxZQUFJLEtBQUssb0JBQW9CLEdBQUc7QUFRNUIscUJBQVcsT0FBTyxRQUFRLFdBQVcsT0FBTyxLQUFLO0FBQ2pELGNBQUk7QUFDQSxpQkFBSyxRQUFRLFVBQVU7QUFBQSxVQUMzQixVQUFFO0FBR0UsdUJBQVcsT0FBTyxVQUFVLFdBQVcsT0FBTyxPQUFPO0FBQUEsVUFDekQ7QUFBQSxRQUNKLE9BQU87QUFDSCxxQkFBVyxNQUFNLEtBQUssSUFBSTtBQUFBLFFBQzlCO0FBQ0EsZUFBTztBQUFBLE1BQ1g7QUFBQSxNQUNBLGNBQWMsWUFBWTtBQUN0QixlQUFPLEtBQUssUUFBUSxXQUFXLGlCQUFpQixLQUFLLElBQUk7QUFBQSxNQUM3RDtBQUFBLE1BQ0Esc0JBQXNCLFlBQVk7QUFDOUIsYUFBSyxTQUFTLFlBQVksS0FBSyxJQUFJO0FBQUEsTUFDdkM7QUFBQSxNQUNBLFNBQVMsWUFBWSxNQUFNO0FBQ3ZCLG1CQUFXLFFBQVE7QUFBQSxVQUNmLFFBQVEsS0FBSztBQUFBLFVBQ2I7QUFBQSxRQUNKLENBQUM7QUFHRCxZQUFJLENBQUMsTUFBTTtBQUNQLHFCQUFXLEtBQUs7QUFBQSxRQUNwQixPQUFPO0FBRUgscUJBQVcsTUFBTTtBQUFBLFFBQ3JCO0FBQUEsTUFDSjtBQUFBO0FBQUEsTUFFQSxRQUFRLFlBQVk7QUFFaEIsWUFBSSxDQUFDLEtBQUssY0FBYyxVQUFVLEdBQUc7QUFDakMscUJBQVcsTUFBTTtBQUFBLFlBQ2IsTUFBTSxLQUFLO0FBQUEsWUFDWCxNQUFNLEtBQUs7QUFBQSxZQUNYLE9BQU8sS0FBSztBQUFBLFVBQ2hCLENBQUM7QUFBQSxRQUNMO0FBSUEsWUFBSTtBQUNBLHFCQUFXLEtBQUs7QUFBQSxZQUNaLFFBQVEsS0FBSztBQUFBLFlBQ2IsV0FBVyxLQUFLO0FBQUEsWUFDaEIsUUFBUSxLQUFLO0FBQUEsWUFDYixRQUFRLEtBQUs7QUFBQSxZQUNiLGFBQWEsTUFBTTtBQUFBLFVBQ3ZCLENBQUM7QUFBQSxRQUNMLFNBQVMsS0FBSztBQUVWLHFCQUFXLE1BQU07QUFBQSxZQUNiLE1BQU07QUFBQSxZQUNOLE1BQU0sS0FBSztBQUFBLFVBQ2YsQ0FBQztBQUNELHFCQUFXLEtBQUs7QUFDaEIsZUFBSyxZQUFZLEtBQUssVUFBVTtBQUNoQztBQUFBLFFBQ0o7QUFDQSxtQkFBVyxTQUFTO0FBQUEsVUFDaEIsTUFBTTtBQUFBLFVBQ04sTUFBTSxLQUFLLFVBQVU7QUFBQSxRQUN6QixDQUFDO0FBQ0QsYUFBSyxTQUFTLFlBQVksS0FBSyxJQUFJO0FBQUEsTUFDdkM7QUFBQSxNQUNBLHFCQUFxQixZQUFZO0FBQzdCLG1CQUFXLGFBQWEsMEJBQTBCO0FBQUEsTUFDdEQ7QUFBQSxNQUNBLGVBQWUsS0FBSyxZQUFZO0FBQUEsTUFFaEM7QUFBQSxJQUNKO0FBQ0EsSUFBQUQsUUFBTyxVQUFVRTtBQUFBO0FBQUE7Ozs7Ozs7O0lDbE1KLENBQUE7WUFDUCxnQkFBRSxRQUFlLGlCQUFBLFFBQUEseUJBQUEsUUFBQSx1QkFBQSxRQUFBLDhCQUFBLFFBQUEsd0JBQUEsUUFBQSw0QkFBQSxRQUFBLHlCQUFBLFFBQUEsOEJBQUEsUUFBQSx3QkFBQSxRQUFBLFFBQUEsUUFBQSxlQUFBLFFBQUEsa0JBQUEsUUFBQSxnQkFBQSxRQUFBLFdBQUEsUUFBQSxhQUFBLFFBQUEsbUJBQUEsUUFBQSxrQkFBQSxRQUFBLFNBQUEsUUFBQSxnQkFBQSxRQUFBLGVBQUEsUUFBQSxnQkFBQTtZQUNyQixnQkFBUztNQUNWLE1BQUE7TUFFWSxRQUFBOztZQUVYLGVBQVM7TUFDVixNQUFBO01BRVksUUFBQTs7WUFFWCxnQkFBUztNQUNWLE1BQUE7TUFFWSxRQUFBOztZQUVYLFNBQVM7TUFDVixNQUFBO01BRVksUUFBQTs7WUFFWCxrQkFBUztNQUNWLE1BQUE7TUFFWSxRQUFBOztZQUVYLG1CQUFTO01BQ1YsTUFBQTtNQUVZLFFBQUE7O1lBRVgsYUFBUztNQUNWLE1BQUE7TUFFWSxRQUFBOztZQUVYLFdBQVM7TUFDVixNQUFBO01Bc0JELFFBQWE7O3VDQXNCSyxNQUFBO2FBQUE7OztrQkFIRSxTQUFBLFFBQWMsTUFBQTtBQUNkLGNBQUEsT0FBQTtBQUdqQixhQUFBLFNBQUE7QUFDRixhQUFBLE9BQUE7TUF4QkQ7SUEwQkE7WUFFRSxnQkFFa0JDO2dDQURBO2FBQUE7OztrQkFDQSxRQUFBLE9BQWE7QUFIZixhQUFBLFNBQU87QUFJbkIsYUFBQSxRQUFBO0FBQ0wsYUFBQSxPQUFBO01BTkQ7SUFRQTtZQUVFLGtCQUVrQjs2QkFETTthQUFBOzs7a0JBQ04sUUFBSSxNQUFhLFFBQUEsYUFBQTtBQUNqQixhQUFBLFNBQUE7QUFHaEIsYUFBSyxPQUFBO0FBQ04sYUFBQSxTQUFBO0FBQ0YsYUFBQSxjQUFBLElBQUEsTUFBQSxXQUFBO01BVkQ7SUFZQTtZQUNFLGVBRWtCO3NCQURBO2FBQUE7OztrQkFDQSxNQUFPLFNBQVEsVUFBQSxZQUFBLGNBQUEsa0JBQUEsUUFBQTtBQUNmLGFBQUEsT0FBQTtBQUNBLGFBQUEsVUFBVTtBQUNWLGFBQUEsV0FBQTtBQUNBLGFBQUEsYUFBQTtBQUNBLGFBQUEsZUFBTTtBQUNwQixhQUFBLG1CQUFBO0FBQ0wsYUFBQSxTQUFBO01BVkQ7SUFZQTtZQUdFLFFBQ2tCO3NDQUFNO2FBQUE7OztrQkFDTixRQUFVLFlBQVY7QUFKRixhQUFBLFNBQW9CO0FBTWxDLGFBQUssYUFBYTtBQUNuQixhQUFBLE9BQUE7QUFDRixhQUFBLFNBQUEsSUFBQSxNQUFBLEtBQUEsVUFBQTtNQVREO0lBV0E7WUFHRSx3QkFFa0I7NENBRGM7YUFBQTs7O2tCQUNkLFFBQUEsZ0JBQUE7QUFKRixhQUFBLFNBQW9CO0FBTWxDLGFBQUssaUJBQWM7QUFDcEIsYUFBQSxPQUFBO0FBQ0YsYUFBQSxjQUFBLElBQUEsTUFBQSxLQUFBLGNBQUE7TUFURDtJQVdBO1lBRUUsOEJBRXVDO3VDQURQO2FBQUE7OztrQkFDZCxRQUFBLGVBQUEsZ0JBQXFCO0FBQ3JCLGFBQUEsU0FBQTtBQUpGLGFBQUEsZ0JBQW9CO0FBS2hDLGFBQUEsaUJBQUE7QUFDTCxhQUFBLE9BQUE7TUFQRDtJQVNBO1lBRUUseUJBRThCOzBDQURFO2FBQUE7OztrQkFDZCxRQUFJLE1BQVE7QUFIZCxhQUFBLFNBQW9CO0FBSWhDLGFBQUEsT0FBQTtBQUNMLGFBQUEsT0FBQTtNQU5EO0lBUUE7WUFFRSw0QkFHa0I7c0NBRk07YUFBQTs7O2tCQUNOLFFBQVMsV0FBUSxXQUFBO0FBQ2pCLGFBQUEsU0FBUztBQUpYLGFBQUEsWUFBb0I7QUFLaEMsYUFBQSxZQUFBO0FBQ0wsYUFBQSxPQUFBO01BUEQ7SUFTQTtZQUVFLHdCQUVrQjs0Q0FEYzthQUFBOzs7a0JBQ2QsUUFBUyxXQUFRLFNBQUEsU0FBQTtBQUNqQixhQUFBLFNBQU87QUFDUCxhQUFBLFlBQUE7QUFMRixhQUFBLFVBQW9CO0FBTWhDLGFBQUEsVUFBQTtBQUNMLGFBQUEsT0FBQTtNQVJEO0lBVUE7WUFFRSw4QkFFZ0M7cUNBRGQ7YUFBQTs7O2tCQUNBLFFBQUEsUUFBYztBQUhoQixhQUFBLFNBQW9CO0FBSWhDLGFBQUEsU0FBQTtBQUNMLGFBQUEsT0FBQTtNQU5EO0lBUUE7WUFFRSx1QkFFOEI7dUNBREU7YUFBQTs7O2tCQUNkLFFBQUksTUFBUTtBQUhkLGFBQUEsU0FBb0I7QUFJaEMsYUFBQSxPQUFBO0FBQ0wsYUFBQSxPQUFBO01BTkQ7SUFRQTtZQUdFLHlCQUVzQjsrQkFEUDthQUFBOzs7a0JBQ04sUUFBQSxRQUFhO0FBSE4sYUFBQSxTQUFvQjtBQUtsQyxhQUFLLFNBQUE7QUFDTixhQUFBLE9BQUE7QUFDRixhQUFBLGFBQUEsT0FBQTtNQVREO0lBV0E7WUFDRSxpQkFFa0I7OEJBRE07YUFBQTs7O2tCQUNOLFFBQUEsU0FBMkI7QUFFN0IsYUFBQSxTQUFPO0FBRG5CLGFBQUEsVUFBQTtBQWtCTCxhQUFBLE9BQUE7TUF0QkQ7Ozs7Ozs7Ozs7OztJQzdPQSxDQUFBO1lBSUUsU0FBb0I7dUJBQUE7YUFBQTs7O2tCQUZaLE9BQWtCLEtBQUE7QUFDbEIsYUFBQSxPQUFBO0FBRU4sYUFBSyxTQUFTO0FBQ2YsYUFBQSxpQkFBQTtBQUVPLGFBQU8sU0FBWSxPQUFBLFlBQUEsSUFBQTs7YUFFekIsTUFBSTtjQUNGLFlBQU0sS0FBWSxPQUFLLFNBQU0sS0FBQTtZQUM3QixZQUFBLE1BQUE7QUFDQSxnQkFBQSxZQUFBLEtBQUE7QUFHQSxnQkFBQSxVQUFlLFVBQVcsVUFBQyxVQUFBLFVBQUEsS0FBQTtBQUM1QixlQUFBLFNBQUEsT0FBQSxZQUFBLE9BQUE7QUFDRixvQkFBQSxLQUFBLEtBQUEsTUFBQTtRQUVNOztlQUVBLEtBQUE7QUFDTCxhQUFLLE9BQU8sQ0FBQTtBQUNaLGFBQUssT0FBTyxLQUFLLFFBQVEsSUFBSSxRQUFJLEtBQU87QUFDeEMsYUFBSyxPQUFPLEtBQUssUUFBUSxJQUFJLFFBQUksS0FBTztBQUN4QyxhQUFBLE9BQVcsS0FBQSxRQUFBLElBQUEsUUFBQSxJQUFBO0FBQ1osYUFBQSxPQUFBLEtBQUEsUUFBQSxJQUFBLFFBQUEsSUFBQTtBQUVNLGVBQVM7O2VBRVQsS0FBQTtBQUNMLGFBQUssT0FBTyxDQUFBO0FBQ1osYUFBQSxPQUFXLEtBQUEsUUFBQSxJQUFBLFFBQUEsSUFBQTtBQUNaLGFBQUEsT0FBQSxLQUFBLFFBQUEsSUFBQSxRQUFBLElBQUE7QUFFTSxlQUFXOztpQkFFZCxRQUFXO0FBQ2IsWUFBQyxDQUFBLFFBQUE7ZUFBTyxPQUFBLENBQUE7ZUFDTjtBQUNBLGdCQUFLLE1BQU8sT0FBTyxXQUFFLE1BQUE7QUFDckIsZUFBSyxPQUFPLE1BQU0sQ0FBQTtBQUNsQixlQUFLLE9BQU0sTUFBTyxRQUFBLEtBQUEsUUFBQSxPQUFBO0FBQ25CLGVBQUEsVUFBQTtRQUVEO0FBQ0EsYUFBQSxPQUFXLEtBQUEsUUFBQSxJQUFBO0FBQ1osZUFBQTtNQUVNO2dCQUNDLFNBQU0sSUFBTztBQUNuQixjQUFLLE1BQU8sT0FBSSxXQUFBLE1BQUE7QUFDaEIsYUFBSyxPQUFPLEdBQUE7QUFDWixhQUFLLE9BQU0sTUFBTyxRQUFBLEtBQUEsTUFBQTtBQUNsQixhQUFBLFVBQVc7QUFDWixlQUFBO01BRUQ7Ozs7Ozs7NkJBT3FCLFFBQUE7QUFDbkIsY0FBSyxNQUFPLE9BQU8sV0FBQyxNQUFBO0FBQ3BCLGFBQUEsT0FBWSxJQUFHLEdBQUk7QUFDbkIsY0FBSSxTQUFTLEtBQUs7QUFDbEIsWUFBQSxTQUFhLEtBQUc7QUFDaEIsZUFBTyxRQUFRLElBQUksUUFBSSxLQUFRO0FBQy9CLGVBQU8sUUFBUSxJQUFJLFFBQUksS0FBTztBQUM5QixlQUFPLFFBQVEsSUFBSSxRQUFJLElBQU87QUFDOUIsZUFBTyxRQUFNLElBQU0sUUFBUSxJQUFFO0FBQzdCLGVBQUssTUFBTSxRQUFTLFFBQU0sT0FBQTtBQUMxQixhQUFBLFNBQVcsU0FBQTtBQUNaLGVBQUE7TUFFTTtVQUNMLGFBQVk7QUFDWixhQUFBLE9BQVksWUFBVSxNQUFRO0FBQzlCLG9CQUFXLEtBQUksS0FBQSxRQUFZLEtBQU0sTUFBQTtBQUNqQyxhQUFBLFVBQVcsWUFBQTtBQUNaLGVBQUE7TUFFTztXQUNOLE1BQUk7WUFDRixNQUFLO0FBQ0wsZUFBQSxPQUFBLEtBQUEsY0FBQSxJQUFBO0FBRUEsZ0JBQUssU0FBTyxLQUFBLFVBQWEsS0FBUSxpQkFBbUI7QUFDckQsZUFBQSxPQUFBLGFBQUEsUUFBQSxLQUFBLGlCQUFBLENBQUE7UUFDRDtBQUNELGVBQUEsS0FBQSxPQUFBLE1BQUEsT0FBQSxJQUFBLEdBQUEsS0FBQSxNQUFBO01BRU07WUFDTCxNQUFNO0FBQ04sY0FBSyxTQUFVLEtBQUEsS0FBQSxJQUFBO0FBQ2YsYUFBSyxTQUFBO0FBQ0wsYUFBSyxpQkFBZ0I7QUFDckIsYUFBQSxTQUFhLE9BQUEsWUFBQSxLQUFBLElBQUE7QUFDZCxlQUFBO01BRU07Y0FDRDtBQUNKLGFBQUssU0FBQTtBQUNOLGFBQUEsaUJBQUE7TUFDRjtJQTNHRDs7Ozs7Ozs7Ozs7SUNGQSxDQUFBO0FBa0JBLFlBQU0sWUFBYTtBQUVuQixRQUFNLGtCQUFpRDtRQUNyRCxTQUFBLElBQUEsZ0JBQW1CLE9BQUE7UUFDbkIsVUFBTyx3QkFBQSxTQUFZO2FBRWpCLFNBQU8sQ0FBQSxFQUFBLFNBQWdCLENBQUE7QUFDekIsaUJBQUMsT0FBQSxPQUFBLEtBQUEsSUFBQSxHQUFBO0FBRUQsZUFBTyxXQUFXLEdBQUEsRUFBQSxXQUFtQixLQUFBLEdBQUEsQ0FBVTtNQUUvQztBQUNBLGFBQUEsV0FBQSxpQkFBQSxFQUFBLFdBQXNDLE1BQUE7QUFFdEMsWUFBTSxhQUFTLE9BQVcsV0FBVSxFQUFBLEVBQUEsTUFBQTtBQUdyQyxZQUFBLFNBQUEsV0FBQSxTQUFBO0FBRUQsYUFBTSxJQUFBLGdCQUEwQixPQUFBLEVBQUEsU0FBQSxNQUFBLEVBQUEsSUFBQSxVQUFBLEVBQUEsTUFBQTtPQWZ2QjtRQWlCUCxhQUFTLDZCQUFBO0FBQ1QsWUFBQSxXQUFTLE9BQWEsWUFBWSxDQUFBO0FBQ2xDLGVBQU8sYUFBUSxHQUFBLENBQUE7QUFDaEIsZUFBQSxhQUFBLFVBQUEsQ0FBQTtBQUVELGFBQU07T0FMSztBQU9YLFFBQUMsV0FBQSx3QkFBQUMsY0FBQTtBQUVELGFBQU0sT0FBQSxXQUFBQSxTQUE4QixFQUFHO1FBQUE7O01BQTZCO09BRm5FO1FBSUMsaUNBQTZCLGdDQUFBLFdBQXVCLGlCQUFnQjtBQUdyRSxhQUFBLFdBQUEsU0FBQSxFQUFBLHVCQUFBLGVBQUE7QUFFRCxhQUFNLE9BQUE7UUFBQTs7TUFBd0M7T0FMZjtBQU8vQixRQUFDLDhCQUFBLGdDQUFBLGdCQUFBO0FBRUQsYUFBVyxPQUFJLFVBQXdCLGNBQUEsRUFBQTtRQUFBOztNQUFBO09BRnRDO0FBSUQsUUFBQ0MsU0FBQSx3QkFBQSxTQUFBO0FBUUQsYUFBTSxPQUFVLFdBQVksSUFBQSxFQUFBO1FBQUE7O01BQUE7SUFFNUIsR0FWQztRQVdDLGFBQUEsQ0FBQTtRQUNBLFFBQUEsd0JBQUFBLFdBQUE7WUFPRSxPQUFRQSxPQUFNLFFBQUE7VUFDZCxLQUFBLFNBQWMsSUFBQTtBQUNkLGdCQUFRLE1BQU0sZ0VBQStEO0FBQzlFLGdCQUFBLE1BQUEsd0JBQUEsTUFBQSxLQUFBLE1BQUE7QUFFRCxnQkFBVyxNQUFHLDhEQUF5QjtNQUV2QztBQUVBLFlBQU1DLFNBQU1ELE9BQUcsU0FBTTtZQUNsQixNQUFBQyxPQUFXO1lBQ1gsU0FBVSxPQUFPLFdBQU0sSUFBQSxhQUN2QkQsT0FBYSxJQUFBLEVBRWhCLFNBQVUsR0FBRztlQUNYLElBQU8sR0FBQSxJQUFRLEtBQUMsS0FBUTtBQUN6QixlQUFBLFNBQUFDLE9BQUEsQ0FBQSxDQUFBO01BRUQ7QUFDRCxhQUFBLE9BQUE7UUFBQTs7TUFBQTtJQWFELEdBdkNFO0FBK0NGLFFBQU0sY0FBYyxJQUFBLGdCQUF5QixPQUFBO1FBQzNDLGNBQWdCLGdDQUFJLFFBQWEsYUFBUTtlQUN2QyxJQUFNLEdBQUEsSUFBUyxPQUFHLFFBQVksS0FBRTtBQUNoQyxjQUFJLFlBQWEsY0FBTyxZQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxPQUFBLENBQUE7WUFDdEIsYUFBQSxNQUFBO0FBRUEsaUJBQUE7WUFBQTs7VUFBQTtBQUVELHNCQUFBLFNBQUEsRUFBQTttQkFBVSxxQkFBcUIsUUFBUztBQUV2QyxpQkFBTztZQUFROztVQUFrQjtBQUVqQyxzQkFBWSxTQUFTLFVBQVUsTUFBTTtBQUNyQyxzQkFBWSxJQUFJLFNBQVM7UUFDM0IsT0FBQztBQUNDLGlCQUFBO1lBQUE7O1VBQUE7QUFFQSxzQkFBQSx1QkFBQSxTQUFBOzs7T0FoQlk7QUFvQmxCLFFBQUMsT0FBQSx3QkFBQSxTQUFBLENBQUEsTUFBQTtBQUdDLFlBQUEsU0FBQSxPQUFtQixVQUFBO0FBQ25CLFlBQU0sWUFBUyxPQUFPLGFBQVk7QUFDbEMsWUFBTSxTQUFTLE9BQUcsVUFBTztBQUN6QixZQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLFlBQU0sTUFBTSxPQUFHO0FBQ2YsYUFBTSxXQUFZLE1BQUMsRUFBTSxXQUFBLFNBQUE7QUFFekIsYUFBTyxTQUFBLEdBQVc7QUFDbEIsVUFBQTtBQUVJLG9CQUFDLFFBQUEsT0FBQSxXQUFBO2VBQ0gsS0FBQTtBQUNELGVBQUEsTUFBQTtBQUFDLG9CQUFhLE1BQUE7QUFDYixjQUFNOzthQUVOLFNBQVMsR0FBQTtBQUNYLGFBQUMsSUFBQSxZQUFBLE1BQUEsQ0FBQTtBQUdELGFBQU8sU0FBSSxDQUFBO0FBR1gsYUFBTztRQUFTLFNBQUUsSUFBQTs7TUFBQTtBQUNsQixhQUFBLE9BQWM7UUFBQTs7TUFBQTtPQTFCZjtRQTRCQyxlQUFjLE9BQUssS0FBQTtNQUNwQjtNQU9EO01BRUE7TUFDRTtNQUNBOztNQUVBO01BRUE7TUFDQTtNQUVBOztRQUVBLFVBQUEsd0JBQUEsV0FBQTtBQUVBLFVBQUksQ0FBQyxVQUFFLENBQUEsT0FBQSxVQUFlLENBQUEsT0FBQSxNQUFBO0FBQ2xCLGVBQUM7TUFDTDtBQUNBLFlBQUssU0FBQSxPQUFpQixVQUFLO0FBQzNCLFlBQUssT0FBQSxPQUFjLFFBQU07QUFDekIsWUFBQSxlQUFXLE9BQUEsV0FBQSxNQUFBO0FBQ1osWUFBQSxNQUFBLElBQUEsZUFBQSxJQUFBO0FBR0MsWUFBTSxPQUFNLE9BQUcsWUFBTyxJQUFjLEdBQUM7QUFDckMsV0FBQSxDQUFNLElBQUM7QUFDUCxXQUFBLGFBQU8sS0FBYSxDQUFJO0FBQ3hCLFdBQUEsTUFBTyxRQUFZLEdBQUMsT0FBUTtBQUM1QixXQUFBLGVBQW9CLENBQUEsSUFBQTtBQUNwQixXQUFBLGNBQW1CLE1BQUMsS0FBUyxTQUFLLENBQUE7QUFDbEMsYUFBTztJQUNULEdBbEJFO0FBeUJGLFFBQU0sU0FBQSx3QkFBQSxXQUFrQixjQUFvQztBQUMxRCxZQUFNLFNBQVMsT0FBRyxZQUFPLEVBQVc7QUFDcEMsYUFBTSxhQUFVLElBQUEsQ0FBUztBQUN6QixhQUFBLGFBQUEsTUFBeUIsQ0FBQTtBQUN6QixhQUFNLGFBQVMsTUFBTyxDQUFBO0FBQ3RCLGFBQU8sYUFBUyxXQUFBLENBQUE7QUFDaEIsYUFBTyxhQUFhLFdBQU8sRUFBQTtBQUMzQixhQUFPO09BUEg7UUFTSixpQkFBYSx3QkFBQSxNQUFBLFdBQUE7QUFDZCxZQUFBLFlBQUEsT0FBQSxXQUFBLE1BQUE7QUFFRCxZQUFNLE1BQUEsSUFBQSxZQUFzQjtBQUc1QixZQUFNLFNBQVksT0FBMkIsWUFBQSxJQUFBLEdBQUE7QUFDM0MsYUFBTyxDQUFBLElBQUk7YUFDUCxhQUFjLEtBQUEsQ0FBQTthQUNkLE1BQUksUUFBUyxHQUFHLE9BQUE7Z0JBQ2hCLElBQUE7O0lBRU4sR0FaZTtBQWNmLFFBQU0sc0JBQW9DLE9BQUEsV0FBQSxHQUFBLEVBQUE7TUFBQTs7SUFBQTtRQUN4Qyx5QkFBMkIsT0FBSSxXQUFZLEdBQUEsRUFBQTtNQUFBOztJQUFBO1FBQzNDLFdBQU8sd0JBQUEsUUFBQTtBQUNSLGFBQUEsSUFBQSxPQUFBLGVBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsUUFBQSxFQUFBLEVBQUEsSUFBQSxJQUFBLFNBQUEsTUFBQSxzQkFBQTtJQUVELEdBSFM7UUFJUCxRQUFPLHdCQUFBLFFBQVU7QUFDbEIsWUFBQSxPQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUE7QUFFRCxhQUFNLGVBQTJCLElBQVksSUFBQTtPQUhwQztBQUtULFFBQUMsV0FBQSx3QkFBQSxVQUFBO0FBRUQsYUFBTSxPQUFBLElBQWMsS0FBSSxFQUFVO1FBQWE7O01BQStCO0lBRTlFLEdBSkM7QUFLRCxRQUFNLFdBQVUsd0JBQUEsWUFBRztBQUNuQixhQUFNLGVBQVksS0FBd0IsT0FBQTtJQUMxQyxHQUZnQjtBQUloQixRQUFNLGlCQUFZLHdCQUFBLFNBQUEsT0FBQSxLQUFBO01BQ2hCO01BQ0E7TUFDQTtNQUNBO01BQ0E7SUFDQSxDQUFBLEdBTmdCO1FBT2hCLGNBQUs7TUFBQTs7SUFBQTtRQUNMLGFBQUk7TUFBQTs7SUFBQTtRQUNKLFlBQU87TUFBQTs7SUFBQTtRQUNQLGlCQUFRO01BQUE7O0lBQUE7UUFDUixZQUFLO01BQ0w7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBLE9BQUFEO01BQ0E7TUFDRDtNQUVROzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUN2UlQsQ0FBQTtZQU1FLGVBQW9COzZCQUFNO2FBQUE7OztrQkFMbEIsU0FBaUIsR0FBQTtBQUV6QixhQUFBLFNBQUE7QUFDUSxhQUFBLFNBQVEsT0FBbUIsWUFBTyxDQUFBO0FBSW5DLGFBQVMsV0FBaUI7O2dCQUUxQixRQUFTLFFBQU07QUFDckIsYUFBQSxTQUFBO0FBRU0sYUFBSyxTQUFBOztjQUVOO0FBQ0osY0FBQSxTQUFhLEtBQUEsT0FBQSxZQUFBLEtBQUEsTUFBQTtBQUNkLGFBQUEsVUFBQTtBQUVVLGVBQUE7O2FBRVQ7QUFDQSxjQUFBLFNBQWEsS0FBQSxPQUFBLEtBQUEsTUFBQTtBQUNkLGFBQUE7QUFFTSxlQUFLOztjQUVOO0FBQ0osY0FBQSxTQUFhLEtBQUEsT0FBQSxZQUFBLEtBQUEsTUFBQTtBQUNkLGFBQUEsVUFBQTtBQUVNLGVBQU07O2VBRU47QUFDTCxjQUFBLFNBQWEsS0FBQSxPQUFBLGFBQUEsS0FBQSxNQUFBO0FBQ2QsYUFBQSxVQUFBO0FBRU0sZUFBTzs7YUFFWixRQUFXO0FBQ1gsY0FBQSxTQUFhLEtBQUEsT0FBQSxTQUFBLEtBQUEsVUFBQSxLQUFBLFFBQUEsS0FBQSxTQUFBLE1BQUE7QUFDZCxhQUFBLFVBQUE7QUFFTSxlQUFPOztnQkFFUjtBQUNKLGNBQUEsUUFBQSxLQUFBO0FBQ0EsWUFBQSxNQUFPO0FBRVAsZUFBQSxLQUFXLE9BQU8sS0FBQyxHQUFBO1FBQUE7QUFDcEIsYUFBQSxTQUFBO0FBRU0sZUFBTSxLQUFjLE9BQUEsU0FBQSxLQUFBLFVBQUEsT0FBQSxNQUFBLENBQUE7O1lBRXpCLFFBQUs7QUFDTCxjQUFBLFNBQWEsS0FBQSxPQUFBLE1BQUEsS0FBQSxRQUFBLEtBQUEsU0FBQSxNQUFBO0FBQ2QsYUFBQSxVQUFBO0FBQ0YsZUFBQTtNQXpERDs7Ozs7Ozs7Ozs7O0lDQ0EsQ0FBQTtBQTJCQSxZQUFBLFNBQUE7QUFFQSxRQUFBLGFBQUE7QUFDQSxRQUFNLGtCQUFlO0FBRXJCLFFBQUEsY0FBQTtBQUtBLFFBQUEsYUFBQTtBQUNBLFFBQU0sZ0JBQWUsY0FBSztBQXdDMUIsUUFBYSxrQkFBTTtRQU9qQixjQUFnQyxPQUFBLFlBQUEsQ0FBQTt1QkFOeEI7YUFBQTs7O2tCQUNBLE1BQUE7QUFDQSxhQUFBLFNBQUE7QUFDQSxhQUFBLGVBQWE7QUFJbkIsYUFBSSxlQUFJO2FBQ04sU0FBVSxJQUFBLGdCQUFNLGFBQUE7QUFDbEIsYUFBQyxTQUFBLFFBQUEsU0FBQSxTQUFBLFNBQUEsS0FBQSxVQUFBLFVBQUE7QUFDRyxnQkFBSyxJQUFHLE1BQUksK0JBQUE7UUFDakI7QUFFTSxhQUFNLFFBQWdCLFNBQXlCLFFBQUEsU0FBQSxTQUFBLFNBQUEsS0FBQSxTQUFBOztZQUVwRCxRQUFNLFVBQUE7QUFDTixhQUFJLFlBQWEsTUFBQztBQUNsQixjQUFBLG1CQUFnQixLQUFhLGVBQUksS0FBZ0I7WUFDL0MsU0FBQSxLQUFBO2VBQ0EsU0FBVSxpQkFBZSxrQkFBTztBQUVoQyxnQkFBTSxPQUFNLEtBQUcsT0FBSyxNQUFPO0FBRTNCLGdCQUFJLFNBQUEsS0FBQSxPQUFvQixhQUFVLFNBQUEsV0FBbUI7Z0JBQ25ELG9CQUFxQixjQUFhO2NBQ2xDLG9CQUFpQixVQUFBLGtCQUFBO0FBQ2pCLGtCQUFNLFVBQUksS0FBQSxhQUFpQixTQUFBLGVBQUEsTUFBQSxRQUFBLEtBQUEsTUFBQTtBQUM1QixxQkFBQSxPQUFBO3NCQUFPO2lCQUNOO0FBQ0Q7VUFDRjtRQUNEO1lBQ0UsV0FBQSxrQkFBNkI7QUFFN0IsZUFBSyxTQUFBO0FBQ0wsZUFBSyxlQUFlO0FBQ3JCLGVBQUEsZUFBQTtlQUFPO0FBRU4sZUFBSyxlQUFlLG1CQUFtQjtBQUN2QyxlQUFLLGVBQWU7UUFDdEI7TUFDRjtNQUVRLFlBQVksUUFBYztBQUNoQyxZQUFJLEtBQUssZUFBZSxHQUFHO0FBQ3pCLGdCQUFNLFlBQVksS0FBSyxlQUFlLE9BQU87QUFDN0MsZ0JBQU0sZ0JBQWdCLFlBQVksS0FBSztBQUN2QyxjQUFJLGdCQUFnQixLQUFLLE9BQU8sWUFBWTtBQUUxQyxnQkFBSTtBQUNKLGdCQUFJLGFBQWEsS0FBSyxPQUFPLGNBQWMsS0FBSyxnQkFBZ0IsS0FBSyxjQUFjO0FBRWpGLDBCQUFZLEtBQUs7WUFDbkIsT0FBQztBQUNDLGtCQUFBLGtCQUFBLEtBQUEsT0FBK0IsYUFBQTtBQUMvQixxQkFBSSxhQUFlLGlCQUFlO0FBQ2xDLG1DQUFvQjs7QUFFcEIsMEJBQUMsT0FBQSxZQUFBLGVBQUE7O0FBR0gsaUJBQUEsT0FBQSxLQUFBLFdBQUEsR0FBQSxLQUFBLGNBQTJDLEtBQUEsZUFBQSxLQUFBLFlBQUE7QUFDM0MsaUJBQUssU0FBTztBQUNaLGlCQUFLLGVBQVM7O0FBR2hCLGlCQUFBLEtBQUEsS0FBQSxRQUFBLEtBQUEsZUFBQSxLQUErQyxZQUFBO0FBQy9DLGVBQUEsZUFBaUI7ZUFDakI7QUFDRCxlQUFBLFNBQUE7ZUFBTyxlQUFBO0FBQ04sZUFBSyxlQUFlLE9BQUE7OzttQkFHckIsUUFBQSxNQUFBLFFBQUEsT0FBQTtBQUNGLGNBQUEsRUFBQSxPQUFBLElBQUE7QUFHQyxlQUFNLFVBQVUsUUFBTyxLQUFBO0FBRXZCLFlBQUE7QUFDQSxnQkFBTyxNQUFBO1VBRUgsS0FBQTtBQUVJLHNCQUFPLFdBQUE7QUFDYjtlQUNFO0FBQ0Esc0JBQUssV0FBQTtBQUNQO2VBQ0U7QUFDQSxzQkFBSyxXQUFBO0FBQ1A7ZUFDRTtBQUNBLHNCQUFLLFdBQUE7QUFDUDtlQUNFO0FBQ0Esc0JBQUssV0FBQTtBQUNQO2VBQ0U7QUFDQSxzQkFBSyxXQUFBO0FBQ1A7ZUFDRTtBQUNBLHNCQUFLLFdBQUE7QUFDUDtlQUNFO0FBQ0Esc0JBQUssV0FBQTtBQUNQO2VBQ0U7QUFDQSxzQkFBSyxvQkFBQSxNQUFBO0FBQ1A7ZUFDRTtBQUNBLHNCQUFLLDRCQUFBLE1BQUE7QUFDUDtlQUNFO0FBQ0Esc0JBQUssMEJBQUEsTUFBQTtBQUNQO2VBQ0U7QUFDQSxzQkFBSyx5QkFBQSxNQUFBO0FBQ1A7ZUFDRTtBQUNBLHNCQUFLLDRCQUFBLFFBQUEsTUFBQTtBQUNQO2VBQ0U7QUFDQSxzQkFBSyw0QkFBQSxNQUFBO0FBQ1A7ZUFDRTtBQUNBLHNCQUFLLG9CQUFBLE1BQUE7QUFDUDtlQUNFO0FBQ0Esc0JBQUssa0JBQUEsUUFBQSxPQUFBO0FBQ1A7ZUFDRTtBQUNBLHNCQUFLLGtCQUFBLFFBQUEsUUFBQTtBQUNQO2VBQ0U7QUFDQSxzQkFBSywyQkFBQSxNQUFBO0FBQ1A7ZUFDRTtBQUNBLHNCQUFLLGlDQUFBLE1BQUE7QUFDUDtlQUNFO0FBQ0Esc0JBQUssbUJBQUEsTUFBQTtBQUNQO2VBQ0U7QUFDQSxzQkFBSyxvQkFBQSxNQUFBO0FBQ1A7ZUFDRTtBQUNBLHNCQUFLLGNBQUEsUUFBQSxNQUFBO0FBQ1A7O0FBRUUsbUJBQUssSUFBQSxXQUFBLGNBQUEsZ0NBQUEsS0FBQSxTQUFBLEVBQUEsR0FBQSxRQUFBLE9BQUE7O3lCQUVFLEdBQUksV0FBQTtBQUNmLGdCQUFDLFNBQUE7QUFFRCxlQUFPOzs7WUFJUixTQUFBO1FBQ0YsNEJBQUEsd0JBQUEsV0FBQTtBQWpLRCxZQUFBLFNBQUEsT0FpS0MsT0FBQSxDQUFBO0FBRUQsYUFBTSxJQUFBLFdBQUEscUJBQXFELGlCQUFBLE1BQUE7T0FGMUQ7UUFJQyw4QkFBVyx3QkFBQSxXQUFvQjtBQUNoQyxZQUFBLE9BQUEsT0FBQSxRQUFBO0FBRUQsYUFBTSxJQUFBLFdBQUEsdUJBQXVELGlCQUFBLElBQUE7T0FIaEQ7UUFLWCxnQkFBVyx3QkFBQSxRQUFBLFdBQUE7QUFDWixZQUFBLFFBQUEsT0FBQSxNQUFBLFNBQUEsQ0FBQTtBQUVELGFBQU0sSUFBQSxXQUFpQixnQkFBd0MsaUJBQUEsS0FBQTtPQUhsRDtRQUtYLHFCQUFXLHdCQUFBLFdBQUEsaUJBQWdCLFFBQWlCLGdCQUFNLEdBQXZDO0FBQ2IsUUFBQyxzQkFBQSx3QkFBQSxXQUFBLGlCQUFBLFFBQUEsaUJBQUEsR0FBQTtBQUVELFFBQU0sbUJBQWtCLHdCQUFBLFFBQXdCLGdCQUFLO0FBRXJELFlBQU0sV0FBQSxPQUFzQixLQUFDLE1BQXdCO0FBRXJELFlBQU0sY0FBZ0IsT0FBSSxNQUFzQjtBQUM5QyxZQUFNLFVBQVEsSUFBRyxXQUFhLGFBQU0saUJBQUEsYUFBQSxVQUFBLFdBQUE7QUFDcEMsZUFBTSxJQUFBLEdBQUEsSUFBVyxhQUFlLEtBQUU7QUFDbEMsZ0JBQU0sWUFBYyxDQUFBLElBQUEsT0FBQSxNQUFBO01BQ3BCO2FBQ0U7T0FUb0I7UUFXdEIsMkJBQWMsd0JBQUEsV0FBQTtBQUNmLFlBQUEsWUFBQSxPQUFBLE1BQUE7QUFFRCxZQUFNLFVBQUEsT0FBQSxRQUE0QjtBQUNoQyxZQUFNLFVBQVMsT0FBRyxRQUFZO0FBQzlCLGFBQU0sSUFBQSxXQUFnQiw0QkFBVSxpQkFBQSxXQUFBLFNBQUEsT0FBQTtPQUxsQjtRQU9kLDZCQUFXLHdCQUFBLFdBQUE7QUFDWixZQUFBLGFBQUEsT0FBQSxNQUFBO0FBRUQsWUFBTSxVQUFBLElBQUEsV0FBNkIsc0JBQXlCLGlCQUFBLFVBQUE7QUFDMUQsZUFBTSxJQUFBLEdBQUEsSUFBYSxZQUFZLEtBQUU7QUFDakMsZ0JBQU0sT0FBVSxDQUFJLElBQUEsV0FBQSxNQUFBO01BQ3BCO2FBQ0U7T0FQUztRQVNYLGFBQWMsd0JBQUEsV0FBQTtBQUNmLFlBQUEsT0FBQSxPQUFBLFFBQUE7QUFFRCxZQUFNLFVBQWMsT0FBb0IsT0FBSTtBQUMxQyxZQUFNLFdBQU8sT0FBTyxNQUFTO0FBQzdCLFlBQU0sYUFBVSxPQUFPLE9BQVE7QUFDL0IsWUFBTSxlQUFXLE9BQU8sTUFBTztBQUMvQixZQUFNLG1CQUFtQixPQUFPLE1BQUU7QUFDbEMsWUFBTSxPQUFBLE9BQVksTUFBRyxNQUFPLElBQU8sU0FBQTtBQUNuQyxhQUFNLElBQUEsV0FBZ0IsTUFBRyxNQUFPLFNBQU8sVUFBQSxZQUFBLGNBQUEsa0JBQUEsSUFBQTtPQVR6QjtRQVdkLG1DQUF1Qix3QkFBQSxXQUFTO0FBQ2pDLFlBQUEsaUJBQUEsT0FBQSxNQUFBO0FBRUQsWUFBTSxVQUFBLElBQUEsV0FBQSw0QkFBNEQsaUJBQUEsY0FBQTtBQUNoRSxlQUFNLElBQUEsR0FBQSxJQUFBLGdCQUE2QixLQUFFO0FBQ3JDLGdCQUFNLFlBQWMsQ0FBQSxJQUFBLE9BQUEsTUFBQTtNQUNwQjthQUNFO09BUHFCO1FBU3ZCLHNCQUFjLHdCQUFBLFdBQUE7QUFDZixZQUFBLGFBQUEsT0FBQSxNQUFBO0FBRUQsWUFBTSxTQUFBLElBQUEsTUFBdUIsVUFBd0I7QUFDbkQsZUFBTSxJQUFBLEdBQUEsSUFBYSxZQUFZLEtBQUU7QUFDakMsY0FBTSxNQUFnQixPQUFJLE1BQU07QUFFOUIsZUFBTSxDQUFBLElBQU0sUUFBTyxLQUFLLE9BQUUsT0FBQSxPQUFBLEdBQUE7O2FBRTFCLElBQU8sV0FBUSxlQUFpQixpQkFBa0IsTUFBQTtPQVR0QztRQVdkLDhCQUFXLHdCQUFBLFdBQWU7QUFDM0IsWUFBQSxPQUFBLE9BQUEsUUFBQTtBQUVELFlBQU0sUUFBQSxPQUFBLFFBQTJCO0FBQy9CLGFBQU0sSUFBSSxXQUFVLHVCQUFTLGlCQUFBLE1BQUEsS0FBQTtPQUpsQjtRQU1YLHNCQUFXLHdCQUFBLFdBQUE7QUFDWixZQUFBLFlBQUEsT0FBQSxNQUFBO0FBRUQsWUFBTSxZQUFBLE9BQXVCLE1BQW9CO0FBQy9DLGFBQU0sSUFBQSxXQUFZLHNCQUFjLGlCQUFBLFdBQUEsU0FBQTtPQUpyQjtRQU1YLDhCQUFXLHdCQUFBLFFBQUEsV0FBc0I7QUFDbEMsWUFBQSxPQUFBLE9BQUEsTUFBQTtBQUdDLFlBQU0sVUFBTztRQUNiLE1BQUE7UUFDQTs7Y0FFRSxNQUFNO1FBQ1AsS0FBQTtBQUVPO1FBQ04sS0FBSztBQUNILGNBQUEsUUFBSyxXQUFBLEdBQUE7QUFDQyxvQkFBQSxPQUFBO1VBQ047O2FBRUM7QUFDRCxjQUFBLFFBQUssV0FBQSxJQUFBO0FBQ0Msb0JBQUEsT0FBQTtBQUNGLGtCQUFBLE9BQVEsT0FBVyxNQUFLLENBQUE7QUFDMUIsbUJBQU8sSUFBQyxXQUFPLDBCQUEyQixpQkFBQSxJQUFBOzs7YUFHM0M7QUFDRDtBQUNLLG9CQUFFLE9BQUE7QUFDTixvQkFBQSxhQUFBLENBQUE7QUFDQyxnQkFBQTtBQUNBLGVBQUE7QUFDSSwwQkFBaUIsT0FBQSxRQUFBO0FBQ2pCLGtCQUFBLFdBQUE7QUFDRix3QkFBWSxXQUFPLEtBQVMsU0FBQTtjQUM1QjtxQkFDRTs7O2FBR0w7QUFDRCxrQkFBSyxPQUFBO0FBQ1Asa0JBQVMsT0FBQSxPQUFBLE9BQUEsU0FBNkIsQ0FBQTtBQUNwQzthQUNBO0FBQ0Esa0JBQUssT0FBQTtBQUNQLGtCQUFTLE9BQUEsT0FBQSxPQUFBLFNBQTBCLENBQUE7QUFDakM7O0FBRUEsZ0JBQUssSUFBQSxNQUFBLDJDQUFBLElBQUE7OztPQTlDRTtRQWtEWCxvQkFBYyx3QkFBQSxRQUFBLFNBQUE7QUFDZixZQUFBLFNBQUEsQ0FBQTtBQUVELFVBQU0sWUFBQSxPQUFxQixPQUFvQixDQUFFO0FBQy9DLGFBQU0sY0FBbUMsTUFBQTtBQUNyQyxlQUFBLFNBQVksSUFBTyxPQUFRLFFBQUM7QUFDaEMsb0JBQWdCLE9BQUssT0FBTyxDQUFBOztZQUUxQixlQUFZLE9BQU87QUFDckIsWUFBQyxVQUFBLFNBQUEsV0FBQSxJQUFBLFdBQUEsY0FBQSxpQkFBQSxZQUFBLElBQUEsSUFBQSxXQUFBLGNBQUEsY0FBQSxpQkFBQSxJQUFBO0FBRUQsY0FBTSxXQUFZLE9BQUc7QUFFckIsY0FBTSxPQUFPLE9BQ1A7Y0FDQSxTQUFJLE9BQUE7Y0FDSixPQUFJLE9BQUE7QUFFVixjQUFRLFdBQVcsT0FBTztBQUMxQixjQUFRLG1CQUFlLE9BQUE7QUFDdkIsY0FBUSxnQkFBZ0IsT0FBQztBQUN6QixjQUFRLFFBQU8sT0FBUTtBQUN2QixjQUFRLFNBQVEsT0FBRztBQUNuQixjQUFRLFFBQUEsT0FBQTtBQUNSLGNBQVEsU0FBQSxPQUFnQjtBQUN4QixjQUFRLFdBQVEsT0FBUTtBQUN4QixjQUFRLGFBQVMsT0FBUTtBQUN6QixjQUFRLE9BQUssT0FBUztBQUN0QixjQUFRLE9BQU0sT0FBRztBQUNqQixjQUFRLFVBQVEsT0FBUztBQUN6QixhQUFPO09BOUJPOzs7Ozs7Ozs7O0lDclhoQixDQUFBO0FBSkEsWUFBQSxnQkFBQSxRQUFBLFlBQTBDO0FBVXRCLFlBQUEsUUFBQTtBQVRwQixRQUFBLGFBQUE7QUFTUyxXQUFBLGVBQUEsU0FBQSxpQkFBQTtNQVJULFlBQUE7TUFFQSxLQUFnQixrQ0FBTTtBQUNwQixlQUFNLFdBQWE7TUFDbkIsR0FGYzs7QUFJaEIsUUFBQyxlQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01DUkQsT0FBQTtJQUNBLENBQUE7Ozs7OztBQ0RBO0FBQUEsd0VBQUFFLFNBQUE7QUFBQTtBQUFBLFFBQU0sRUFBRSxXQUFXLGdCQUFnQixJQUFJLGVBQWU7QUFDdEQsSUFBQUEsUUFBTyxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlYO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0E7QUFBQSxJQUNOO0FBR0ksYUFBUyx1QkFBdUI7QUFDaEMsZUFBU0MsV0FBVSxLQUFLO0FBQ3BCLGNBQU0sTUFBTSxRQUFRLEtBQUs7QUFDekIsZUFBTyxJQUFJLElBQUksT0FBTztBQUFBLE1BQzFCO0FBSFMsYUFBQUEsWUFBQTtBQUlULGVBQVNDLGlCQUFnQixTQUFTO0FBQzlCLGNBQU0sTUFBTSxRQUFRLEtBQUs7QUFDekIsZUFBTyxJQUFJLFFBQVEsT0FBTztBQUFBLE1BQzlCO0FBSFMsYUFBQUEsa0JBQUE7QUFJVCxhQUFPO0FBQUEsUUFDSCxXQUFBRDtBQUFBLFFBQ0EsaUJBQUFDO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFiYTtBQWdCVCxhQUFTLDJCQUEyQjtBQUNwQyxlQUFTRCxXQUFVLEtBQUs7QUFDcEIsY0FBTSxFQUFFLGlCQUFpQixJQUFJO0FBQzdCLGVBQU8sSUFBSSxpQkFBaUIsR0FBRztBQUFBLE1BQ25DO0FBSFMsYUFBQUEsWUFBQTtBQUlULGVBQVNDLGlCQUFnQixTQUFTO0FBQzlCLGdCQUFRLE9BQU8sU0FBUyxPQUFPO0FBQy9CLGVBQU8sUUFBUTtBQUFBLE1BQ25CO0FBSFMsYUFBQUEsa0JBQUE7QUFJVCxhQUFPO0FBQUEsUUFDSCxXQUFBRDtBQUFBLFFBQ0EsaUJBQUFDO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFiYTtBQWtCVCxhQUFTLHNCQUFzQjtBQUkvQixVQUFJLE9BQU8sY0FBYyxZQUFZLGNBQWMsUUFBUSxPQUFPLFVBQVUsY0FBYyxVQUFVO0FBRWhHLGVBQU8sVUFBVSxjQUFjO0FBQUEsTUFDbkM7QUFFQSxVQUFJLE9BQU8sYUFBYSxZQUFZO0FBQ2hDLGNBQU0sT0FBTyxJQUFJLFNBQVMsTUFBTTtBQUFBLFVBQzVCLElBQUk7QUFBQSxZQUNBLE9BQU87QUFBQSxVQUNYO0FBQUEsUUFDSixDQUFDO0FBQ0QsWUFBSSxPQUFPLEtBQUssT0FBTyxZQUFZLEtBQUssT0FBTyxRQUFRLEtBQUssR0FBRyxPQUFPO0FBQ2xFLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0o7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQXBCYTtBQXFCYixhQUFTLGlCQUFpQjtBQUN0QixVQUFJLG9CQUFvQixHQUFHO0FBQ3ZCLGVBQU8seUJBQXlCO0FBQUEsTUFDcEM7QUFDQSxhQUFPLHFCQUFxQjtBQUFBLElBQ2hDO0FBTFM7QUFBQTtBQUFBOzs7QUNyRVQ7QUFBQSw0RUFBQUMsU0FBQTtBQUFBO0FBQ0EsUUFBTSxlQUFlLFFBQVEsUUFBUSxFQUFFO0FBQ3ZDLFFBQU0sRUFBRSxPQUFPLFVBQVUsSUFBSTtBQUM3QixRQUFNLFNBQVM7QUFDZixRQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLFFBQU0sY0FBYyxVQUFVLE1BQU07QUFDcEMsUUFBTSxhQUFhLFVBQVUsS0FBSztBQUNsQyxRQUFNLFlBQVksVUFBVSxJQUFJO0FBRWhDLFFBQU1DLGNBQU4sY0FBeUIsYUFBYTtBQUFBLE1BVHRDLE9BU3NDO0FBQUE7QUFBQTtBQUFBLE1BQ2xDLFlBQVksUUFBTztBQUNmLGNBQU07QUFDTixpQkFBUyxVQUFVLENBQUM7QUFDcEIsYUFBSyxTQUFTLE9BQU8sVUFBVSxVQUFVLE9BQU8sR0FBRztBQUNuRCxZQUFJLE9BQU8sS0FBSyxXQUFXLFlBQVk7QUFDbkMsZUFBSyxTQUFTLEtBQUssT0FBTyxNQUFNO0FBQUEsUUFDcEM7QUFDQSxhQUFLLGFBQWEsT0FBTztBQUN6QixhQUFLLCtCQUErQixPQUFPO0FBQzNDLGFBQUssbUJBQW1CLENBQUM7QUFDekIsYUFBSyxNQUFNLE9BQU8sT0FBTztBQUN6QixhQUFLLGlCQUFpQixPQUFPLGtCQUFrQjtBQUMvQyxhQUFLLFVBQVU7QUFDZixhQUFLLGVBQWU7QUFDcEIsY0FBTSxPQUFPO0FBQ2IsYUFBSyxHQUFHLGVBQWUsU0FBUyxXQUFXO0FBQ3ZDLGNBQUksY0FBYyxXQUFXO0FBQ3pCLGlCQUFLLGVBQWU7QUFBQSxVQUN4QjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0w7QUFBQSxNQUNBLFFBQVEsTUFBTSxNQUFNO0FBQ2hCLGNBQU0sT0FBTztBQUNiLGFBQUssY0FBYztBQUNuQixhQUFLLE9BQU8sV0FBVyxJQUFJO0FBQzNCLGFBQUssT0FBTyxRQUFRLE1BQU0sSUFBSTtBQUM5QixhQUFLLE9BQU8sS0FBSyxXQUFXLFdBQVc7QUFDbkMsY0FBSSxLQUFLLFlBQVk7QUFDakIsaUJBQUssT0FBTyxhQUFhLE1BQU0sS0FBSyw0QkFBNEI7QUFBQSxVQUNwRTtBQUNBLGVBQUssS0FBSyxTQUFTO0FBQUEsUUFDdkIsQ0FBQztBQUNELGNBQU0sb0JBQW9CLGdDQUFTLE9BQU87QUFFdEMsY0FBSSxLQUFLLFlBQVksTUFBTSxTQUFTLGdCQUFnQixNQUFNLFNBQVMsVUFBVTtBQUN6RTtBQUFBLFVBQ0o7QUFDQSxlQUFLLEtBQUssU0FBUyxLQUFLO0FBQUEsUUFDNUIsR0FOMEI7QUFPMUIsYUFBSyxPQUFPLEdBQUcsU0FBUyxpQkFBaUI7QUFDekMsYUFBSyxPQUFPLEdBQUcsU0FBUyxXQUFXO0FBQy9CLGVBQUssS0FBSyxLQUFLO0FBQUEsUUFDbkIsQ0FBQztBQUNELFlBQUksQ0FBQyxLQUFLLEtBQUs7QUFDWCxpQkFBTyxLQUFLLGdCQUFnQixLQUFLLE1BQU07QUFBQSxRQUMzQztBQUdBLFlBQUksS0FBSyxtQkFBbUIsVUFBVTtBQUNsQyxpQkFBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLFdBQVc7QUFDMUMsaUJBQUssYUFBYSxNQUFNLGlCQUFpQjtBQUFBLFVBQzdDLENBQUM7QUFBQSxRQUNMO0FBQ0EsYUFBSyxPQUFPLEtBQUssUUFBUSxTQUFTLFFBQVE7QUFDdEMsZ0JBQU0sZUFBZSxPQUFPLFNBQVMsTUFBTTtBQUMzQyxrQkFBTyxjQUFhO0FBQUEsWUFDaEIsS0FBSztBQUNEO0FBQUEsWUFDSixLQUFLO0FBQ0QsbUJBQUssT0FBTyxJQUFJO0FBQ2hCLHFCQUFPLEtBQUssS0FBSyxTQUFTLElBQUksTUFBTSw2Q0FBNkMsQ0FBQztBQUFBLFlBQ3RGO0FBRUksbUJBQUssT0FBTyxJQUFJO0FBQ2hCLHFCQUFPLEtBQUssS0FBSyxTQUFTLElBQUksTUFBTSxtREFBbUQsQ0FBQztBQUFBLFVBQ2hHO0FBQ0EsZUFBSyxhQUFhLE1BQU0saUJBQWlCO0FBQUEsUUFDN0MsQ0FBQztBQUFBLE1BQ0w7QUFBQSxNQUNBLGFBQWEsTUFBTSxtQkFBbUI7QUFDbEMsY0FBTSxPQUFPO0FBQ2IsY0FBTSxVQUFVO0FBQUEsVUFDWixRQUFRLEtBQUs7QUFBQSxRQUNqQjtBQUNBLFlBQUksS0FBSyxRQUFRLE1BQU07QUFDbkIsaUJBQU8sT0FBTyxTQUFTLEtBQUssR0FBRztBQUMvQixjQUFJLFNBQVMsS0FBSyxLQUFLO0FBQ25CLG9CQUFRLE1BQU0sS0FBSyxJQUFJO0FBQUEsVUFDM0I7QUFBQSxRQUNKO0FBR0EsWUFBSSxLQUFLLG1CQUFtQixVQUFVO0FBQ2xDLGtCQUFRLGdCQUFnQjtBQUFBLFlBQ3BCO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFDQSxjQUFNLE1BQU0sUUFBUSxLQUFLO0FBQ3pCLFlBQUksSUFBSSxRQUFRLElBQUksS0FBSyxJQUFJLE1BQU0sR0FBRztBQUNsQyxrQkFBUSxhQUFhO0FBQUEsUUFDekI7QUFDQSxZQUFJO0FBQ0EsZUFBSyxTQUFTLE9BQU8sZ0JBQWdCLE9BQU87QUFBQSxRQUNoRCxTQUFTLEtBQUs7QUFDVixpQkFBTyxLQUFLLEtBQUssU0FBUyxHQUFHO0FBQUEsUUFDakM7QUFDQSxhQUFLLGdCQUFnQixLQUFLLE1BQU07QUFDaEMsYUFBSyxPQUFPLEdBQUcsU0FBUyxpQkFBaUI7QUFDekMsYUFBSyxLQUFLLFlBQVk7QUFBQSxNQUMxQjtBQUFBLE1BQ0EsZ0JBQWdCQyxTQUFRO0FBQ3BCLGNBQU1BLFNBQVEsQ0FBQyxRQUFNO0FBQ2pCLGdCQUFNLFlBQVksSUFBSSxTQUFTLFVBQVUsaUJBQWlCLElBQUk7QUFDOUQsY0FBSSxLQUFLLGNBQWM7QUFDbkIsaUJBQUssS0FBSyxXQUFXLEdBQUc7QUFBQSxVQUM1QjtBQUNBLGVBQUssS0FBSyxXQUFXLEdBQUc7QUFBQSxRQUM1QixDQUFDO0FBQUEsTUFDTDtBQUFBLE1BQ0EsYUFBYTtBQUNULGFBQUssT0FBTyxNQUFNLFVBQVUsV0FBVyxDQUFDO0FBQUEsTUFDNUM7QUFBQSxNQUNBLFFBQVEsUUFBUTtBQUNaLGFBQUssT0FBTyxNQUFNLFVBQVUsUUFBUSxNQUFNLENBQUM7QUFBQSxNQUMvQztBQUFBLE1BQ0EsT0FBTyxXQUFXLFdBQVc7QUFDekIsYUFBSyxNQUFNLFVBQVUsT0FBTyxXQUFXLFNBQVMsQ0FBQztBQUFBLE1BQ3JEO0FBQUEsTUFDQSxTQUFTLFVBQVU7QUFDZixhQUFLLE1BQU0sVUFBVSxTQUFTLFFBQVEsQ0FBQztBQUFBLE1BQzNDO0FBQUEsTUFDQSwrQkFBK0IsV0FBVyxpQkFBaUI7QUFDdkQsYUFBSyxNQUFNLFVBQVUsK0JBQStCLFdBQVcsZUFBZSxDQUFDO0FBQUEsTUFDbkY7QUFBQSxNQUNBLDRCQUE0QixnQkFBZ0I7QUFDeEMsYUFBSyxNQUFNLFVBQVUsNEJBQTRCLGNBQWMsQ0FBQztBQUFBLE1BQ3BFO0FBQUEsTUFDQSxNQUFNLFFBQVE7QUFDVixZQUFJLENBQUMsS0FBSyxPQUFPLFVBQVU7QUFDdkIsaUJBQU87QUFBQSxRQUNYO0FBQ0EsZUFBTyxLQUFLLE9BQU8sTUFBTSxNQUFNO0FBQUEsTUFDbkM7QUFBQSxNQUNBLE1BQU0sTUFBTTtBQUNSLGFBQUssTUFBTSxVQUFVLE1BQU0sSUFBSSxDQUFDO0FBQUEsTUFDcEM7QUFBQTtBQUFBLE1BRUEsTUFBTUMsUUFBTztBQUNULGFBQUssTUFBTSxVQUFVLE1BQU1BLE1BQUssQ0FBQztBQUFBLE1BQ3JDO0FBQUE7QUFBQSxNQUVBLEtBQUssUUFBUTtBQUNULGFBQUssTUFBTSxVQUFVLEtBQUssTUFBTSxDQUFDO0FBQUEsTUFDckM7QUFBQTtBQUFBLE1BRUEsUUFBUSxRQUFRO0FBQ1osYUFBSyxNQUFNLFVBQVUsUUFBUSxNQUFNLENBQUM7QUFBQSxNQUN4QztBQUFBLE1BQ0EsUUFBUTtBQUNKLFlBQUksS0FBSyxPQUFPLFVBQVU7QUFDdEIsZUFBSyxPQUFPLE1BQU0sV0FBVztBQUFBLFFBQ2pDO0FBQUEsTUFDSjtBQUFBLE1BQ0EsT0FBTztBQUNILGFBQUssVUFBVTtBQUNmLGFBQUssTUFBTSxVQUFVO0FBQUEsTUFDekI7QUFBQSxNQUNBLE1BQU07QUFDRixhQUFLLE9BQU8sSUFBSTtBQUFBLE1BQ3BCO0FBQUEsTUFDQSxRQUFRO0FBQ0osYUFBSyxPQUFPLE1BQU07QUFBQSxNQUN0QjtBQUFBLE1BQ0EsTUFBTTtBQUVGLGFBQUssVUFBVTtBQUNmLFlBQUksQ0FBQyxLQUFLLGVBQWUsQ0FBQyxLQUFLLE9BQU8sVUFBVTtBQUM1QyxlQUFLLE9BQU8sSUFBSTtBQUNoQjtBQUFBLFFBQ0o7QUFDQSxlQUFPLEtBQUssT0FBTyxNQUFNLFdBQVcsTUFBSTtBQUNwQyxlQUFLLE9BQU8sSUFBSTtBQUFBLFFBQ3BCLENBQUM7QUFBQSxNQUNMO0FBQUEsTUFDQSxNQUFNLEtBQUs7QUFDUCxhQUFLLE1BQU0sVUFBVSxNQUFNLEdBQUcsQ0FBQztBQUFBLE1BQ25DO0FBQUEsTUFDQSxTQUFTLEtBQUs7QUFDVixhQUFLLE1BQU0sVUFBVSxTQUFTLEdBQUcsQ0FBQztBQUFBLE1BQ3RDO0FBQUEsTUFDQSxrQkFBa0IsT0FBTztBQUNyQixhQUFLLE1BQU0sVUFBVSxTQUFTLEtBQUssQ0FBQztBQUFBLE1BQ3hDO0FBQUEsTUFDQSxjQUFjO0FBQ1YsYUFBSyxNQUFNLFVBQVUsU0FBUyxDQUFDO0FBQUEsTUFDbkM7QUFBQSxNQUNBLGFBQWEsS0FBSztBQUNkLGFBQUssTUFBTSxVQUFVLFNBQVMsR0FBRyxDQUFDO0FBQUEsTUFDdEM7QUFBQSxJQUNKO0FBQ0EsSUFBQUgsUUFBTyxVQUFVQztBQUFBO0FBQUE7OztBQ3hNakI7QUFBQSwwRUFBQUcsU0FBQTtBQUFBO0FBZUEsUUFBTSxFQUFFLFVBQVUsSUFBSSxRQUFRLFFBQVE7QUFDdEMsUUFBTSxFQUFFLGNBQWMsSUFBSSxRQUFRLGdCQUFnQjtBQUNsRCxRQUFNLFFBQVEsdUJBQU8sTUFBTTtBQUMzQixRQUFNLFdBQVcsdUJBQU8sU0FBUztBQUNqQyxhQUFTLFVBQVUsT0FBTyxLQUFLLElBQUk7QUFDL0IsVUFBSTtBQUNKLFVBQUksS0FBSyxVQUFVO0FBQ2YsY0FBTSxNQUFNLEtBQUssUUFBUSxFQUFFLE1BQU0sS0FBSztBQUN0QyxlQUFPLElBQUksTUFBTSxLQUFLLE9BQU87QUFDN0IsWUFBSSxLQUFLLFdBQVcsRUFBRyxRQUFPLEdBQUc7QUFHakMsYUFBSyxNQUFNO0FBQ1gsYUFBSyxXQUFXO0FBQUEsTUFDcEIsT0FBTztBQUNILGFBQUssS0FBSyxLQUFLLEtBQUssUUFBUSxFQUFFLE1BQU0sS0FBSztBQUN6QyxlQUFPLEtBQUssS0FBSyxFQUFFLE1BQU0sS0FBSyxPQUFPO0FBQUEsTUFDekM7QUFDQSxXQUFLLEtBQUssSUFBSSxLQUFLLElBQUk7QUFDdkIsZUFBUSxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsS0FBSTtBQUNoQyxZQUFJO0FBQ0EsZUFBSyxNQUFNLEtBQUssT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQUEsUUFDbkMsU0FBUyxPQUFPO0FBQ1osaUJBQU8sR0FBRyxLQUFLO0FBQUEsUUFDbkI7QUFBQSxNQUNKO0FBQ0EsV0FBSyxXQUFXLEtBQUssS0FBSyxFQUFFLFNBQVMsS0FBSztBQUMxQyxVQUFJLEtBQUssWUFBWSxDQUFDLEtBQUssY0FBYztBQUNyQyxXQUFHLElBQUksTUFBTSx3QkFBd0IsQ0FBQztBQUN0QztBQUFBLE1BQ0o7QUFDQSxTQUFHO0FBQUEsSUFDUDtBQTVCUztBQTZCVCxhQUFTLE1BQU0sSUFBSTtBQUVmLFdBQUssS0FBSyxLQUFLLEtBQUssUUFBUSxFQUFFLElBQUk7QUFDbEMsVUFBSSxLQUFLLEtBQUssR0FBRztBQUNiLFlBQUk7QUFDQSxlQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUM7QUFBQSxRQUN2QyxTQUFTLE9BQU87QUFDWixpQkFBTyxHQUFHLEtBQUs7QUFBQSxRQUNuQjtBQUFBLE1BQ0o7QUFDQSxTQUFHO0FBQUEsSUFDUDtBQVhTO0FBWVQsYUFBUyxLQUFLLE1BQU0sS0FBSztBQUNyQixVQUFJLFFBQVEsUUFBVztBQUNuQixhQUFLLEtBQUssR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUpTO0FBS1QsYUFBUyxLQUFLLFVBQVU7QUFDcEIsYUFBTztBQUFBLElBQ1g7QUFGUztBQUdULGFBQVMsTUFBTSxTQUFTLFFBQVEsU0FBUztBQUVyQyxnQkFBVSxXQUFXO0FBQ3JCLGVBQVMsVUFBVTtBQUNuQixnQkFBVSxXQUFXLENBQUM7QUFFdEIsY0FBTyxVQUFVLFFBQU87QUFBQSxRQUNwQixLQUFLO0FBRUQsY0FBSSxPQUFPLFlBQVksWUFBWTtBQUMvQixxQkFBUztBQUNULHNCQUFVO0FBQUEsVUFFZCxXQUFXLE9BQU8sWUFBWSxZQUFZLEVBQUUsbUJBQW1CLFdBQVcsQ0FBQyxRQUFRLE9BQU8sS0FBSyxHQUFHO0FBQzlGLHNCQUFVO0FBQ1Ysc0JBQVU7QUFBQSxVQUNkO0FBQ0E7QUFBQSxRQUNKLEtBQUs7QUFFRCxjQUFJLE9BQU8sWUFBWSxZQUFZO0FBQy9CLHNCQUFVO0FBQ1YscUJBQVM7QUFDVCxzQkFBVTtBQUFBLFVBRWQsV0FBVyxPQUFPLFdBQVcsVUFBVTtBQUNuQyxzQkFBVTtBQUNWLHFCQUFTO0FBQUEsVUFDYjtBQUFBLE1BQ1I7QUFDQSxnQkFBVSxPQUFPLE9BQU8sQ0FBQyxHQUFHLE9BQU87QUFDbkMsY0FBUSxjQUFjO0FBQ3RCLGNBQVEsWUFBWTtBQUNwQixjQUFRLFFBQVE7QUFDaEIsY0FBUSxxQkFBcUI7QUFDN0IsWUFBTSxTQUFTLElBQUksVUFBVSxPQUFPO0FBQ3BDLGFBQU8sS0FBSyxJQUFJO0FBQ2hCLGFBQU8sUUFBUSxJQUFJLElBQUksY0FBYyxNQUFNO0FBQzNDLGFBQU8sVUFBVTtBQUNqQixhQUFPLFNBQVM7QUFDaEIsYUFBTyxZQUFZLFFBQVE7QUFDM0IsYUFBTyxlQUFlLFFBQVEsZ0JBQWdCO0FBQzlDLGFBQU8sV0FBVztBQUNsQixhQUFPLFdBQVcsU0FBUyxLQUFLLElBQUk7QUFFaEMsYUFBSyxlQUFlLGVBQWU7QUFDbkMsV0FBRyxHQUFHO0FBQUEsTUFDVjtBQUNBLGFBQU87QUFBQSxJQUNYO0FBakRTO0FBa0RULElBQUFBLFFBQU8sVUFBVTtBQUFBO0FBQUE7OztBQ3RIakI7QUFBQSwrRUFBQUMsU0FBQTtBQUFBO0FBQ0EsUUFBSSxPQUFPLFFBQVEsTUFBTTtBQUF6QixRQUE0QixTQUFTLFFBQVEsUUFBUSxFQUFFO0FBQXZELFFBQStELFFBQVE7QUFBdkUsUUFBMEYsT0FBTyxRQUFRLE1BQU07QUFBL0csUUFBa0gsY0FBYztBQUFoSSxRQUFzSSxRQUFRLFFBQVEsYUFBYTtBQUFuSyxRQUE0SyxhQUFhLFFBQVE7QUFDak0sUUFBSSxVQUFVO0FBQWQsUUFDRSxVQUFVO0FBRFosUUFFRSxTQUFTO0FBRlgsUUFHRSxVQUFVO0FBRVosYUFBUyxVQUFVLE1BQU07QUFDckIsY0FBUSxPQUFPLFdBQVc7QUFBQSxJQUM5QjtBQUZTO0FBR1QsUUFBSSxhQUFhO0FBQUEsTUFDYjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQ0EsUUFBSSxhQUFhLFdBQVc7QUFDNUIsUUFBSSxVQUFVLFdBQVcsYUFBYSxDQUFDO0FBQ3ZDLGFBQVMsT0FBTztBQUNaLFVBQUksYUFBYSxzQkFBc0IsVUFBVSxTQUFTLFdBQVc7QUFDckUsVUFBSSxZQUFZO0FBQ1osWUFBSSxPQUFPLE1BQU0sVUFBVSxNQUFNLEtBQUssU0FBUyxFQUFFLE9BQU8sSUFBSTtBQUM1RCxtQkFBVyxNQUFNLEtBQUssT0FBTyxNQUFNLE1BQU0sSUFBSSxDQUFDO0FBQUEsTUFDbEQ7QUFBQSxJQUNKO0FBTlM7QUFPVCxXQUFPLGVBQWVBLFFBQU8sU0FBUyxTQUFTO0FBQUEsTUFDM0MsS0FBSyxrQ0FBVztBQUNaLGVBQU87QUFBQSxNQUNYLEdBRks7QUFBQSxNQUdMLEtBQUssZ0NBQVMsS0FBSztBQUNmLGdCQUFRO0FBQUEsTUFDWixHQUZLO0FBQUEsSUFHVCxDQUFDO0FBQ0QsSUFBQUEsUUFBTyxRQUFRLFNBQVMsU0FBUyxRQUFRO0FBQ3JDLFVBQUksTUFBTTtBQUNWLG1CQUFhO0FBQ2IsYUFBTztBQUFBLElBQ1g7QUFDQSxJQUFBQSxRQUFPLFFBQVEsY0FBYyxTQUFTLFFBQVE7QUFDMUMsVUFBSSxNQUFNLFVBQVUsUUFBUTtBQUM1QixVQUFJLE9BQU8sSUFBSSxlQUFlLFFBQVEsS0FBSyxLQUFLLElBQUksV0FBVyxNQUFNLGNBQWMsYUFBYSxJQUFJLEtBQUssS0FBSyxJQUFJLFFBQVEsTUFBTSxTQUFTO0FBQ3pJLGFBQU87QUFBQSxJQUNYO0FBQ0EsSUFBQUEsUUFBTyxRQUFRLFlBQVksU0FBUyxPQUFPLE9BQU87QUFDOUMsVUFBSSxPQUFPLFVBQVUsZUFBZSxLQUFLLFFBQVEsS0FBSyxZQUFZLEdBQUc7QUFDakUsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLE9BQU87QUFDUCxlQUFPO0FBQUEsTUFDWDtBQUNBLGNBQVEsU0FBUztBQUNqQixVQUFJLENBQUMsVUFBVSxNQUFNLElBQUksR0FBRztBQUN4QixhQUFLLG1EQUFtRCxLQUFLO0FBQzdELGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxNQUFNLFFBQVEsVUFBVSxVQUFVO0FBQ2dDLGFBQUssb0dBQW9HLEtBQUs7QUFDaEwsZUFBTztBQUFBLE1BQ1g7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksVUFBVUEsUUFBTyxRQUFRLFFBQVEsU0FBUyxVQUFVLE9BQU87QUFDM0QsYUFBTyxXQUFXLE1BQU0sR0FBRyxFQUFFLEVBQUUsT0FBTyxTQUFTLE1BQU0sT0FBTyxLQUFLO0FBQzdELFlBQUksT0FBTyxHQUFHO0FBRVYsY0FBSSxPQUFPLFNBQVMsS0FBSyxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxDQUFDLEdBQUc7QUFDakUsbUJBQU8sUUFBUTtBQUFBLFVBQ25CO0FBQUEsUUFDSjtBQUNBLGVBQU8sU0FBUyxNQUFNLEtBQUssTUFBTSxPQUFPLE1BQU0sS0FBSyxNQUFNLFNBQVMsS0FBSztBQUFBLE1BQzNFLEdBQUcsSUFBSTtBQUFBLElBQ1g7QUFDQSxJQUFBQSxRQUFPLFFBQVEsY0FBYyxTQUFTLFVBQVUsUUFBUSxJQUFJO0FBQ3hELFVBQUk7QUFDSixVQUFJLGFBQWEsT0FBTyxLQUFLLE1BQU0sQ0FBQztBQUNwQyxlQUFTLE9BQU8sTUFBTTtBQUNsQixZQUFJLFFBQVEsVUFBVSxJQUFJO0FBQzFCLFlBQUksU0FBUyxhQUFhLEtBQUssS0FBSyxRQUFRLFVBQVUsS0FBSyxHQUFHO0FBQzFELGlCQUFPLE1BQU0sT0FBTztBQUNwQixxQkFBVyxJQUFJO0FBQUEsUUFDbkI7QUFBQSxNQUNKO0FBTlM7QUFPVCxVQUFJLFFBQVEsa0NBQVc7QUFDbkIsZUFBTyxRQUFRO0FBQ2YsV0FBRyxJQUFJO0FBQUEsTUFDWCxHQUhZO0FBSVosVUFBSSxRQUFRLGdDQUFTLEtBQUs7QUFDdEIsZUFBTyxRQUFRO0FBQ2YsYUFBSyxzQ0FBc0MsR0FBRztBQUM5QyxXQUFHLE1BQVM7QUFBQSxNQUNoQixHQUpZO0FBS1osYUFBTyxHQUFHLFNBQVMsS0FBSztBQUN4QixpQkFBVyxHQUFHLFFBQVEsTUFBTSxFQUFFLEdBQUcsT0FBTyxLQUFLLEVBQUUsR0FBRyxTQUFTLEtBQUs7QUFBQSxJQUNwRTtBQUNBLFFBQUksWUFBWUEsUUFBTyxRQUFRLFlBQVksU0FBUyxNQUFNO0FBQ3RELFVBQUksS0FBSyxTQUFTLE1BQU0sS0FBSyxNQUFNLE9BQU8sR0FBRztBQUN6QyxlQUFPO0FBQUEsTUFDWDtBQUNBLFVBQUksVUFBVTtBQUNkLFVBQUksV0FBVztBQUNmLFVBQUksV0FBVztBQUNmLFVBQUksV0FBVztBQUNmLFVBQUksU0FBUztBQUNiLFVBQUksTUFBTSxDQUFDO0FBQ1gsVUFBSSxjQUFjO0FBQ2xCLFVBQUksV0FBVyxnQ0FBUyxLQUFLLElBQUksSUFBSTtBQUNqQyxZQUFJLFFBQVEsS0FBSyxVQUFVLElBQUksRUFBRTtBQUNqQyxZQUFJLENBQUMsT0FBTyxlQUFlLEtBQUssUUFBUSxLQUFLLG9CQUFvQixHQUFHO0FBQ2hFLGtCQUFRLE1BQU0sUUFBUSxjQUFjLElBQUk7QUFBQSxRQUM1QztBQUNBLFlBQUksV0FBVyxHQUFHLENBQUMsSUFBSTtBQUFBLE1BQzNCLEdBTmU7QUFPZixlQUFRLElBQUksR0FBRyxJQUFJLEtBQUssU0FBUyxHQUFHLEtBQUssR0FBRTtBQUN2QyxrQkFBVSxLQUFLLE9BQU8sSUFBSSxDQUFDO0FBQzNCLG1CQUFXLEtBQUssT0FBTyxDQUFDO0FBQ3hCLHNCQUFjLFlBQVksYUFBYTtBQUN2QyxZQUFJLGFBQWE7QUFDYixtQkFBUyxVQUFVLFFBQVE7QUFDM0I7QUFBQSxRQUNKO0FBQ0EsWUFBSSxLQUFLLEtBQUssV0FBVyxPQUFPLGFBQWEsTUFBTTtBQUMvQyxtQkFBUyxVQUFVLFVBQVUsSUFBSSxDQUFDO0FBQ2xDLHFCQUFXLElBQUk7QUFDZixzQkFBWTtBQUFBLFFBQ2hCO0FBQUEsTUFDSjtBQUNBLFlBQU0sT0FBTyxLQUFLLEdBQUcsRUFBRSxXQUFXLGFBQWEsTUFBTTtBQUNyRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksZUFBZUEsUUFBTyxRQUFRLGVBQWUsU0FBUyxPQUFPO0FBQzdELFVBQUksUUFBUTtBQUFBO0FBQUEsUUFFUixHQUFHLFNBQVMsR0FBRztBQUNYLGlCQUFPLEVBQUUsU0FBUztBQUFBLFFBQ3RCO0FBQUE7QUFBQSxRQUVBLEdBQUcsU0FBUyxHQUFHO0FBQ1gsY0FBSSxNQUFNLEtBQUs7QUFDWCxtQkFBTztBQUFBLFVBQ1g7QUFDQSxjQUFJLE9BQU8sQ0FBQztBQUNaLGlCQUFPLFNBQVMsQ0FBQyxLQUFLLElBQUksS0FBSyxJQUFJLG9CQUFvQixLQUFLLE1BQU0sQ0FBQyxNQUFNO0FBQUEsUUFDN0U7QUFBQTtBQUFBLFFBRUEsR0FBRyxTQUFTLEdBQUc7QUFDWCxpQkFBTyxFQUFFLFNBQVM7QUFBQSxRQUN0QjtBQUFBO0FBQUEsUUFFQSxHQUFHLFNBQVMsR0FBRztBQUNYLGlCQUFPLEVBQUUsU0FBUztBQUFBLFFBQ3RCO0FBQUE7QUFBQSxRQUVBLEdBQUcsU0FBUyxHQUFHO0FBQ1gsaUJBQU8sRUFBRSxTQUFTO0FBQUEsUUFDdEI7QUFBQSxNQUNKO0FBQ0EsZUFBUSxNQUFNLEdBQUcsTUFBTSxXQUFXLFFBQVEsT0FBTyxHQUFFO0FBQy9DLFlBQUksT0FBTyxNQUFNLEdBQUc7QUFDcEIsWUFBSSxRQUFRLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBSztBQUN0QyxZQUFJLE1BQU0sS0FBSyxLQUFLO0FBQ3BCLFlBQUksQ0FBQyxLQUFLO0FBQ04saUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSjtBQUNBLGFBQU87QUFBQSxJQUNYO0FBQUE7QUFBQTs7O0FDdEtBO0FBQUEsOEVBQUFDLFNBQUE7QUFBQTtBQUNBLFFBQUksT0FBTyxRQUFRLE1BQU07QUFBekIsUUFBNEIsS0FBSyxRQUFRLElBQUk7QUFBN0MsUUFBZ0QsU0FBUztBQUN6RCxJQUFBQSxRQUFPLFVBQVUsU0FBUyxVQUFVLElBQUk7QUFDcEMsVUFBSSxPQUFPLE9BQU8sWUFBWTtBQUM5QixTQUFHLEtBQUssTUFBTSxTQUFTLEtBQUssTUFBTTtBQUM5QixZQUFJLE9BQU8sQ0FBQyxPQUFPLFVBQVUsTUFBTSxJQUFJLEdBQUc7QUFDdEMsaUJBQU8sR0FBRyxNQUFTO0FBQUEsUUFDdkI7QUFDQSxZQUFJLEtBQUssR0FBRyxpQkFBaUIsSUFBSTtBQUNqQyxlQUFPLFlBQVksVUFBVSxJQUFJLEVBQUU7QUFBQSxNQUN2QyxDQUFDO0FBQUEsSUFDTDtBQUNBLElBQUFBLFFBQU8sUUFBUSxTQUFTLE9BQU87QUFBQTtBQUFBOzs7QUNaL0I7QUFBQSx3RUFBQUMsU0FBQTtBQUFBO0FBQUEsUUFBTSxlQUFlLFFBQVEsUUFBUSxFQUFFO0FBQ3ZDLFFBQU0sUUFBUTtBQUNkLFFBQU0sWUFBWSxRQUFRLE1BQU07QUFDaEMsUUFBTSxPQUFPO0FBQ2IsUUFBTUMsaUJBQWdCO0FBQ3RCLFFBQU0sdUJBQXVCO0FBQzdCLFFBQU1DLFNBQVE7QUFDZCxRQUFNQyxZQUFXO0FBQ2pCLFFBQU1DLGNBQWE7QUFDbkIsUUFBTSxTQUFTO0FBQ2YsUUFBTSwrQkFBK0IsVUFBVSxVQUFVLE1BQUk7QUFBQSxJQUFDLEdBQUcsZ0VBQWdFO0FBQ2pJLFFBQU0sOEJBQThCLFVBQVUsVUFBVSxNQUFJO0FBQUEsSUFBQyxHQUFHLGdFQUFnRTtBQUNoSSxRQUFNLDBCQUEwQixVQUFVLFVBQVUsTUFBSTtBQUFBLElBQUMsR0FBRyw4UEFBbVE7QUFDL1QsUUFBTSw4QkFBOEIsVUFBVSxVQUFVLE1BQUk7QUFBQSxJQUFDLEdBQUcscUhBQXFIO0FBQ3JMLFFBQU0sb0NBQW9DLFVBQVUsVUFBVSxNQUFJO0FBQUEsSUFBQyxHQUFHLHVMQUF1TDtBQUM3UCxhQUFTLHNCQUFzQixPQUFPLGNBQWM7QUFDaEQsVUFBSSxPQUFPLFVBQVUsVUFBVTtBQUMzQixlQUFPLE9BQU8sU0FBUyxLQUFLLElBQUksUUFBUTtBQUFBLE1BQzVDO0FBQ0EsVUFBSSxPQUFPLFVBQVUsWUFBWSxNQUFNLEtBQUssTUFBTSxJQUFJO0FBQ2xELGNBQU0sSUFBSSxPQUFPLEtBQUs7QUFDdEIsZUFBTyxPQUFPLFNBQVMsQ0FBQyxJQUFJLElBQUk7QUFBQSxNQUNwQztBQUNBLGFBQU87QUFBQSxJQUNYO0FBVFM7QUFVVCxRQUFNQyxVQUFOLGNBQXFCLGFBQWE7QUFBQSxNQXpCbEMsT0F5QmtDO0FBQUE7QUFBQTtBQUFBLE1BQzlCLFlBQVksUUFBTztBQUNmLGNBQU07QUFDTixhQUFLLHVCQUF1QixJQUFJLHFCQUFxQixNQUFNO0FBQzNELGFBQUssT0FBTyxLQUFLLHFCQUFxQjtBQUN0QyxhQUFLLFdBQVcsS0FBSyxxQkFBcUI7QUFDMUMsYUFBSyxPQUFPLEtBQUsscUJBQXFCO0FBQ3RDLGFBQUssT0FBTyxLQUFLLHFCQUFxQjtBQUd0QyxlQUFPLGVBQWUsTUFBTSxZQUFZO0FBQUEsVUFDcEMsY0FBYztBQUFBLFVBQ2QsWUFBWTtBQUFBLFVBQ1osVUFBVTtBQUFBLFVBQ1YsT0FBTyxLQUFLLHFCQUFxQjtBQUFBLFFBQ3JDLENBQUM7QUFDRCxhQUFLLGNBQWMsS0FBSyxxQkFBcUI7QUFDN0MsY0FBTSxJQUFJLFVBQVUsQ0FBQztBQUNyQixZQUFJLEVBQUUsU0FBUztBQUNYLHNDQUE0QjtBQUFBLFFBQ2hDO0FBQ0EsYUFBSyxXQUFXLEVBQUUsV0FBVyxPQUFPO0FBQ3BDLGFBQUssU0FBUyxJQUFJSixlQUFjLEVBQUUsS0FBSztBQUN2QyxhQUFLLFVBQVU7QUFDZixhQUFLLFNBQVM7QUFDZCxhQUFLLGNBQWM7QUFDbkIsYUFBSyxhQUFhO0FBQ2xCLGFBQUssbUJBQW1CO0FBQ3hCLGFBQUssYUFBYTtBQUNsQixhQUFLLGVBQWU7QUFDcEIsYUFBSyxZQUFZO0FBQ2pCLGFBQUssdUJBQXVCLFFBQVEsRUFBRSxvQkFBb0I7QUFDMUQsYUFBSyxxQkFBcUIsc0JBQXNCLEVBQUUsb0JBQW9CLEtBQUssNEJBQTRCO0FBQ3ZHLGFBQUssYUFBYSxFQUFFLGNBQWMsSUFBSUcsWUFBVztBQUFBLFVBQzdDLFFBQVEsRUFBRTtBQUFBLFVBQ1YsS0FBSyxLQUFLLHFCQUFxQjtBQUFBLFVBQy9CLGdCQUFnQixLQUFLLHFCQUFxQjtBQUFBLFVBQzFDLFdBQVcsRUFBRSxhQUFhO0FBQUEsVUFDMUIsNkJBQTZCLEVBQUUsK0JBQStCO0FBQUEsVUFDOUQsVUFBVSxLQUFLLHFCQUFxQixtQkFBbUI7QUFBQSxRQUMzRCxDQUFDO0FBQ0QsYUFBSyxjQUFjLENBQUM7QUFDcEIsYUFBSyxTQUFTLEVBQUUsVUFBVUQsVUFBUztBQUNuQyxhQUFLLFlBQVk7QUFDakIsYUFBSyxZQUFZO0FBQ2pCLGFBQUssTUFBTSxLQUFLLHFCQUFxQixPQUFPO0FBQzVDLGFBQUssaUJBQWlCLEtBQUsscUJBQXFCLGtCQUFrQjtBQUlsRSxZQUFJLEtBQUssT0FBTyxLQUFLLElBQUksS0FBSztBQUMxQixpQkFBTyxlQUFlLEtBQUssS0FBSyxPQUFPO0FBQUEsWUFDbkMsWUFBWTtBQUFBLFVBQ2hCLENBQUM7QUFBQSxRQUNMO0FBQ0EsYUFBSywyQkFBMkIsRUFBRSwyQkFBMkI7QUFBQSxNQUNqRTtBQUFBLE1BQ0EsSUFBSSxjQUFjO0FBQ2QscUNBQTZCO0FBQzdCLGVBQU8sS0FBSztBQUFBLE1BQ2hCO0FBQUEsTUFDQSxJQUFJLFlBQVksS0FBSztBQUNqQixxQ0FBNkI7QUFDN0IsYUFBSyxlQUFlO0FBQUEsTUFDeEI7QUFBQSxNQUNBLGtCQUFrQjtBQUNkLGVBQU8sS0FBSztBQUFBLE1BQ2hCO0FBQUEsTUFDQSxpQkFBaUIsS0FBSztBQUNsQixjQUFNLGVBQWUsd0JBQUNHLFdBQVE7QUFDMUIsa0JBQVEsU0FBUyxNQUFJO0FBQ2pCLFlBQUFBLE9BQU0sWUFBWSxLQUFLLEtBQUssVUFBVTtBQUFBLFVBQzFDLENBQUM7QUFBQSxRQUNMLEdBSnFCO0FBS3JCLGNBQU0sY0FBYyxLQUFLLGdCQUFnQjtBQUN6QyxZQUFJLGFBQWE7QUFDYix1QkFBYSxXQUFXO0FBQ3hCLGVBQUssZUFBZTtBQUFBLFFBQ3hCO0FBQ0EsYUFBSyxZQUFZLFFBQVEsWUFBWTtBQUNyQyxhQUFLLFlBQVksU0FBUztBQUFBLE1BQzlCO0FBQUEsTUFDQSxTQUFTLFVBQVU7QUFDZixjQUFNLE9BQU87QUFDYixjQUFNLE1BQU0sS0FBSztBQUNqQixhQUFLLHNCQUFzQjtBQUMzQixZQUFJLEtBQUssZUFBZSxLQUFLLFlBQVk7QUFDckMsZ0JBQU0sTUFBTSxJQUFJLE1BQU0sK0RBQStEO0FBQ3JGLGtCQUFRLFNBQVMsTUFBSTtBQUNqQixxQkFBUyxHQUFHO0FBQUEsVUFDaEIsQ0FBQztBQUNEO0FBQUEsUUFDSjtBQUNBLGFBQUssY0FBYztBQUNuQixZQUFJLEtBQUssMkJBQTJCLEdBQUc7QUFDbkMsZUFBSywwQkFBMEIsV0FBVyxNQUFJO0FBQzFDLGdCQUFJLFVBQVU7QUFDZCxnQkFBSSxPQUFPLFFBQVEsSUFBSSxNQUFNLGlCQUFpQixDQUFDO0FBQUEsVUFDbkQsR0FBRyxLQUFLLHdCQUF3QjtBQUNoQyxjQUFJLEtBQUssd0JBQXdCLE9BQU87QUFDcEMsaUJBQUssd0JBQXdCLE1BQU07QUFBQSxVQUN2QztBQUFBLFFBQ0o7QUFDQSxZQUFJLEtBQUssUUFBUSxLQUFLLEtBQUssUUFBUSxHQUFHLE1BQU0sR0FBRztBQUMzQyxjQUFJLFFBQVEsS0FBSyxPQUFPLGVBQWUsS0FBSyxJQUFJO0FBQUEsUUFDcEQsT0FBTztBQUNILGNBQUksUUFBUSxLQUFLLE1BQU0sS0FBSyxJQUFJO0FBQUEsUUFDcEM7QUFFQSxZQUFJLEdBQUcsV0FBVyxXQUFXO0FBQ3pCLGNBQUksS0FBSyxLQUFLO0FBR1YsZ0JBQUksS0FBSyxtQkFBbUIsVUFBVTtBQUNsQyxrQkFBSSxXQUFXO0FBQUEsWUFDbkI7QUFBQSxVQUNKLE9BQU87QUFDSCxnQkFBSSxRQUFRLEtBQUssZUFBZSxDQUFDO0FBQUEsVUFDckM7QUFBQSxRQUNKLENBQUM7QUFDRCxZQUFJLEdBQUcsY0FBYyxXQUFXO0FBQzVCLGNBQUksUUFBUSxLQUFLLGVBQWUsQ0FBQztBQUFBLFFBQ3JDLENBQUM7QUFDRCxhQUFLLGlCQUFpQixHQUFHO0FBQ3pCLFlBQUksS0FBSyxPQUFPLE1BQUk7QUFDaEIsZ0JBQU0sUUFBUSxLQUFLLFVBQVUsSUFBSSxNQUFNLHVCQUF1QixJQUFJLElBQUksTUFBTSxvQ0FBb0M7QUFDaEgsdUJBQWEsS0FBSyx1QkFBdUI7QUFDekMsZUFBSyxpQkFBaUIsS0FBSztBQUMzQixlQUFLLFNBQVM7QUFDZCxjQUFJLENBQUMsS0FBSyxTQUFTO0FBS2YsZ0JBQUksS0FBSyxlQUFlLENBQUMsS0FBSyxrQkFBa0I7QUFDNUMsa0JBQUksS0FBSyxxQkFBcUI7QUFDMUIscUJBQUssb0JBQW9CLEtBQUs7QUFBQSxjQUNsQyxPQUFPO0FBQ0gscUJBQUssa0JBQWtCLEtBQUs7QUFBQSxjQUNoQztBQUFBLFlBQ0osV0FBVyxDQUFDLEtBQUssa0JBQWtCO0FBQy9CLG1CQUFLLGtCQUFrQixLQUFLO0FBQUEsWUFDaEM7QUFBQSxVQUNKO0FBQ0Esa0JBQVEsU0FBUyxNQUFJO0FBQ2pCLGlCQUFLLEtBQUssS0FBSztBQUFBLFVBQ25CLENBQUM7QUFBQSxRQUNMLENBQUM7QUFBQSxNQUNMO0FBQUEsTUFDQSxRQUFRLFVBQVU7QUFDZCxZQUFJLFVBQVU7QUFDVixlQUFLLFNBQVMsUUFBUTtBQUN0QjtBQUFBLFFBQ0o7QUFDQSxlQUFPLElBQUksS0FBSyxTQUFTLENBQUMsU0FBUyxXQUFTO0FBQ3hDLGVBQUssU0FBUyxDQUFDLFVBQVE7QUFDbkIsZ0JBQUksT0FBTztBQUNQLHFCQUFPLEtBQUs7QUFBQSxZQUNoQixPQUFPO0FBQ0gsc0JBQVEsSUFBSTtBQUFBLFlBQ2hCO0FBQUEsVUFDSixDQUFDO0FBQUEsUUFDTCxDQUFDO0FBQUEsTUFDTDtBQUFBLE1BQ0EsaUJBQWlCLEtBQUs7QUFFbEIsWUFBSSxHQUFHLG1DQUFtQyxLQUFLLDZCQUE2QixLQUFLLElBQUksQ0FBQztBQUV0RixZQUFJLEdBQUcsNkJBQTZCLEtBQUssdUJBQXVCLEtBQUssSUFBSSxDQUFDO0FBRTFFLFlBQUksR0FBRyxzQkFBc0IsS0FBSyxnQkFBZ0IsS0FBSyxJQUFJLENBQUM7QUFDNUQsWUFBSSxHQUFHLDhCQUE4QixLQUFLLHdCQUF3QixLQUFLLElBQUksQ0FBQztBQUM1RSxZQUFJLEdBQUcsMkJBQTJCLEtBQUsscUJBQXFCLEtBQUssSUFBSSxDQUFDO0FBQ3RFLFlBQUksR0FBRyxrQkFBa0IsS0FBSyxzQkFBc0IsS0FBSyxJQUFJLENBQUM7QUFDOUQsWUFBSSxHQUFHLFNBQVMsS0FBSyxrQkFBa0IsS0FBSyxJQUFJLENBQUM7QUFDakQsWUFBSSxHQUFHLGdCQUFnQixLQUFLLG9CQUFvQixLQUFLLElBQUksQ0FBQztBQUMxRCxZQUFJLEdBQUcsaUJBQWlCLEtBQUsscUJBQXFCLEtBQUssSUFBSSxDQUFDO0FBQzVELFlBQUksR0FBRyxVQUFVLEtBQUssY0FBYyxLQUFLLElBQUksQ0FBQztBQUM5QyxZQUFJLEdBQUcsa0JBQWtCLEtBQUssc0JBQXNCLEtBQUssSUFBSSxDQUFDO0FBQzlELFlBQUksR0FBRyxXQUFXLEtBQUssZUFBZSxLQUFLLElBQUksQ0FBQztBQUNoRCxZQUFJLEdBQUcsbUJBQW1CLEtBQUssdUJBQXVCLEtBQUssSUFBSSxDQUFDO0FBQ2hFLFlBQUksR0FBRyxjQUFjLEtBQUssa0JBQWtCLEtBQUssSUFBSSxDQUFDO0FBQ3RELFlBQUksR0FBRyxtQkFBbUIsS0FBSyx1QkFBdUIsS0FBSyxJQUFJLENBQUM7QUFDaEUsWUFBSSxHQUFHLGlCQUFpQixLQUFLLHFCQUFxQixLQUFLLElBQUksQ0FBQztBQUM1RCxZQUFJLEdBQUcsa0JBQWtCLEtBQUssc0JBQXNCLEtBQUssSUFBSSxDQUFDO0FBQzlELFlBQUksR0FBRyxZQUFZLEtBQUssZ0JBQWdCLEtBQUssSUFBSSxDQUFDO0FBQ2xELFlBQUksR0FBRyxnQkFBZ0IsS0FBSyxvQkFBb0IsS0FBSyxJQUFJLENBQUM7QUFBQSxNQUM5RDtBQUFBLE1BQ0EsYUFBYSxJQUFJO0FBQ2IsY0FBTSxNQUFNLEtBQUs7QUFDakIsWUFBSSxPQUFPLEtBQUssYUFBYSxZQUFZO0FBQ3JDLGVBQUssU0FBUyxRQUFRLEVBQUUsS0FBSyxNQUFJLEtBQUssU0FBUyxLQUFLLG9CQUFvQixDQUFDLEVBQUUsS0FBSyxDQUFDLFNBQU87QUFDcEYsZ0JBQUksU0FBUyxRQUFXO0FBQ3BCLGtCQUFJLE9BQU8sU0FBUyxVQUFVO0FBQzFCLG9CQUFJLEtBQUssU0FBUyxJQUFJLFVBQVUsMkJBQTJCLENBQUM7QUFDNUQ7QUFBQSxjQUNKO0FBQ0EsbUJBQUsscUJBQXFCLFdBQVcsS0FBSyxXQUFXO0FBQUEsWUFDekQsT0FBTztBQUNILG1CQUFLLHFCQUFxQixXQUFXLEtBQUssV0FBVztBQUFBLFlBQ3pEO0FBQ0EsZUFBRztBQUFBLFVBQ1AsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFNO0FBQ1osZ0JBQUksS0FBSyxTQUFTLEdBQUc7QUFBQSxVQUN6QixDQUFDO0FBQUEsUUFDTCxXQUFXLEtBQUssYUFBYSxNQUFNO0FBQy9CLGFBQUc7QUFBQSxRQUNQLE9BQU87QUFDSCxjQUFJO0FBQ0Esa0JBQU0sU0FBUztBQUNmLG1CQUFPLEtBQUssc0JBQXNCLENBQUMsU0FBTztBQUN0QyxrQkFBSSxXQUFjLE1BQU07QUFDcEIsd0NBQXdCO0FBQ3hCLHFCQUFLLHFCQUFxQixXQUFXLEtBQUssV0FBVztBQUFBLGNBQ3pEO0FBQ0EsaUJBQUc7QUFBQSxZQUNQLENBQUM7QUFBQSxVQUNMLFNBQVMsR0FBRztBQUNSLGlCQUFLLEtBQUssU0FBUyxDQUFDO0FBQUEsVUFDeEI7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLE1BQ0EsNkJBQTZCLEtBQUs7QUFDOUIsYUFBSyxhQUFhLE1BQUk7QUFDbEIsZUFBSyxXQUFXLFNBQVMsS0FBSyxRQUFRO0FBQUEsUUFDMUMsQ0FBQztBQUFBLE1BQ0w7QUFBQSxNQUNBLHVCQUF1QixLQUFLO0FBQ3hCLGFBQUssYUFBYSxZQUFVO0FBQ3hCLGNBQUk7QUFDQSxrQkFBTSxpQkFBaUIsTUFBTSxPQUFPLHdCQUF3QixLQUFLLE1BQU0sS0FBSyxVQUFVLElBQUksSUFBSTtBQUM5RixpQkFBSyxXQUFXLFNBQVMsY0FBYztBQUFBLFVBQzNDLFNBQVMsR0FBRztBQUNSLGlCQUFLLEtBQUssU0FBUyxDQUFDO0FBQUEsVUFDeEI7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQUEsTUFDQSxnQkFBZ0IsS0FBSztBQUNqQixhQUFLLGFBQWEsTUFBSTtBQUNsQixjQUFJO0FBQ0EsaUJBQUssY0FBYyxLQUFLLGFBQWEsSUFBSSxZQUFZLEtBQUssd0JBQXdCLEtBQUssV0FBVyxRQUFRLEtBQUssa0JBQWtCO0FBQ2pJLGlCQUFLLFdBQVcsK0JBQStCLEtBQUssWUFBWSxXQUFXLEtBQUssWUFBWSxRQUFRO0FBQUEsVUFDeEcsU0FBUyxLQUFLO0FBQ1YsaUJBQUssV0FBVyxLQUFLLFNBQVMsR0FBRztBQUFBLFVBQ3JDO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTDtBQUFBLE1BQ0EsTUFBTSx3QkFBd0IsS0FBSztBQUMvQixZQUFJO0FBQ0EsZ0JBQU0sS0FBSyxnQkFBZ0IsS0FBSyxhQUFhLEtBQUssVUFBVSxJQUFJLE1BQU0sS0FBSyx3QkFBd0IsS0FBSyxXQUFXLE1BQU07QUFDekgsZUFBSyxXQUFXLDRCQUE0QixLQUFLLFlBQVksUUFBUTtBQUFBLFFBQ3pFLFNBQVMsS0FBSztBQUNWLGVBQUssV0FBVyxLQUFLLFNBQVMsR0FBRztBQUFBLFFBQ3JDO0FBQUEsTUFDSjtBQUFBLE1BQ0EscUJBQXFCLEtBQUs7QUFDdEIsWUFBSTtBQUNBLGVBQUssZ0JBQWdCLEtBQUssYUFBYSxJQUFJLElBQUk7QUFDL0MsZUFBSyxjQUFjO0FBQUEsUUFDdkIsU0FBUyxLQUFLO0FBQ1YsZUFBSyxXQUFXLEtBQUssU0FBUyxHQUFHO0FBQUEsUUFDckM7QUFBQSxNQUNKO0FBQUEsTUFDQSxzQkFBc0IsS0FBSztBQUN2QixhQUFLLFlBQVksSUFBSTtBQUNyQixhQUFLLFlBQVksSUFBSTtBQUFBLE1BQ3pCO0FBQUEsTUFDQSxxQkFBcUIsS0FBSztBQUN0QixZQUFJLEtBQUssYUFBYTtBQUNsQixlQUFLLGNBQWM7QUFDbkIsZUFBSyxhQUFhO0FBQ2xCLHVCQUFhLEtBQUssdUJBQXVCO0FBRXpDLGNBQUksS0FBSyxxQkFBcUI7QUFDMUIsaUJBQUssb0JBQW9CLE1BQU0sSUFBSTtBQUduQyxpQkFBSyxzQkFBc0I7QUFBQSxVQUMvQjtBQUNBLGVBQUssS0FBSyxTQUFTO0FBQUEsUUFDdkI7QUFDQSxjQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsYUFBSyxlQUFlO0FBQ3BCLGFBQUssWUFBWSxLQUFLLFVBQVU7QUFDaEMsYUFBSyxnQkFBZ0I7QUFDckIsWUFBSSxhQUFhO0FBQ2Isc0JBQVksb0JBQW9CLEtBQUssVUFBVTtBQUFBLFFBQ25EO0FBQ0EsYUFBSyxpQkFBaUI7QUFBQSxNQUMxQjtBQUFBO0FBQUE7QUFBQSxNQUdBLDRCQUE0QixLQUFLO0FBQzdCLFlBQUksS0FBSyxrQkFBa0I7QUFFdkI7QUFBQSxRQUNKO0FBQ0EsYUFBSyxtQkFBbUI7QUFDeEIscUJBQWEsS0FBSyx1QkFBdUI7QUFDekMsWUFBSSxLQUFLLHFCQUFxQjtBQUMxQixpQkFBTyxLQUFLLG9CQUFvQixHQUFHO0FBQUEsUUFDdkM7QUFDQSxhQUFLLEtBQUssU0FBUyxHQUFHO0FBQUEsTUFDMUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlBLGtCQUFrQixLQUFLO0FBQ25CLFlBQUksS0FBSyxhQUFhO0FBQ2xCLGlCQUFPLEtBQUssNEJBQTRCLEdBQUc7QUFBQSxRQUMvQztBQUNBLGFBQUssYUFBYTtBQUNsQixhQUFLLGlCQUFpQixHQUFHO0FBQ3pCLGFBQUssS0FBSyxTQUFTLEdBQUc7QUFBQSxNQUMxQjtBQUFBO0FBQUEsTUFFQSxvQkFBb0IsS0FBSztBQUNyQixZQUFJLEtBQUssYUFBYTtBQUNsQixpQkFBTyxLQUFLLDRCQUE0QixHQUFHO0FBQUEsUUFDL0M7QUFDQSxjQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsWUFBSSxDQUFDLGFBQWE7QUFDZCxlQUFLLGtCQUFrQixHQUFHO0FBQzFCO0FBQUEsUUFDSjtBQUNBLGFBQUssZUFBZTtBQUNwQixvQkFBWSxZQUFZLEtBQUssS0FBSyxVQUFVO0FBQUEsTUFDaEQ7QUFBQSxNQUNBLHNCQUFzQixLQUFLO0FBQ3ZCLGNBQU0sY0FBYyxLQUFLLGdCQUFnQjtBQUN6QyxZQUFJLGVBQWUsTUFBTTtBQUNyQixnQkFBTSxRQUFRLElBQUksTUFBTSwwREFBMEQ7QUFDbEYsZUFBSyxrQkFBa0IsS0FBSztBQUM1QjtBQUFBLFFBQ0o7QUFFQSxvQkFBWSxxQkFBcUIsR0FBRztBQUFBLE1BQ3hDO0FBQUEsTUFDQSxlQUFlLEtBQUs7QUFDaEIsY0FBTSxjQUFjLEtBQUssZ0JBQWdCO0FBQ3pDLFlBQUksZUFBZSxNQUFNO0FBQ3JCLGdCQUFNLFFBQVEsSUFBSSxNQUFNLG1EQUFtRDtBQUMzRSxlQUFLLGtCQUFrQixLQUFLO0FBQzVCO0FBQUEsUUFDSjtBQUVBLG9CQUFZLGNBQWMsR0FBRztBQUFBLE1BQ2pDO0FBQUEsTUFDQSx1QkFBdUIsS0FBSztBQUN4QixjQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsWUFBSSxlQUFlLE1BQU07QUFDckIsZ0JBQU0sUUFBUSxJQUFJLE1BQU0sMkRBQTJEO0FBQ25GLGVBQUssa0JBQWtCLEtBQUs7QUFDNUI7QUFBQSxRQUNKO0FBRUEsb0JBQVksc0JBQXNCLEtBQUssVUFBVTtBQUFBLE1BQ3JEO0FBQUEsTUFDQSxrQkFBa0IsS0FBSztBQUNuQixjQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsWUFBSSxlQUFlLE1BQU07QUFDckIsZ0JBQU0sUUFBUSxJQUFJLE1BQU0sc0RBQXNEO0FBQzlFLGVBQUssa0JBQWtCLEtBQUs7QUFDNUI7QUFBQSxRQUNKO0FBRUEsb0JBQVksaUJBQWlCLEtBQUssVUFBVTtBQUFBLE1BQ2hEO0FBQUEsTUFDQSx1QkFBdUIsS0FBSztBQUN4QixjQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsWUFBSSxlQUFlLE1BQU07QUFDckIsZ0JBQU0sUUFBUSxJQUFJLE1BQU0sMkRBQTJEO0FBQ25GLGVBQUssa0JBQWtCLEtBQUs7QUFDNUI7QUFBQSxRQUNKO0FBRUEsb0JBQVksc0JBQXNCLEtBQUssS0FBSyxVQUFVO0FBQUEsTUFDMUQ7QUFBQSxNQUNBLHVCQUF1QjtBQUNuQixjQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsWUFBSSxlQUFlLE1BQU07QUFDckIsZ0JBQU0sUUFBUSxJQUFJLE1BQU0seURBQXlEO0FBQ2pGLGVBQUssa0JBQWtCLEtBQUs7QUFDNUI7QUFBQSxRQUNKO0FBSUEsWUFBSSxZQUFZLE1BQU07QUFDbEIsZUFBSyxXQUFXLGlCQUFpQixZQUFZLElBQUksSUFBSSxZQUFZO0FBQUEsUUFDckU7QUFBQSxNQUNKO0FBQUEsTUFDQSxzQkFBc0IsS0FBSztBQUN2QixjQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsWUFBSSxlQUFlLE1BQU07QUFDckIsZ0JBQU0sUUFBUSxJQUFJLE1BQU0sMERBQTBEO0FBQ2xGLGVBQUssa0JBQWtCLEtBQUs7QUFDNUI7QUFBQSxRQUNKO0FBQ0Esb0JBQVkscUJBQXFCLEtBQUssVUFBVTtBQUFBLE1BQ3BEO0FBQUEsTUFDQSxnQkFBZ0IsS0FBSztBQUNqQixjQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsWUFBSSxlQUFlLE1BQU07QUFDckIsZ0JBQU0sUUFBUSxJQUFJLE1BQU0sb0RBQW9EO0FBQzVFLGVBQUssa0JBQWtCLEtBQUs7QUFDNUI7QUFBQSxRQUNKO0FBQ0Esb0JBQVksZUFBZSxLQUFLLEtBQUssVUFBVTtBQUFBLE1BQ25EO0FBQUEsTUFDQSxvQkFBb0IsS0FBSztBQUNyQixhQUFLLEtBQUssZ0JBQWdCLEdBQUc7QUFBQSxNQUNqQztBQUFBLE1BQ0EsY0FBYyxLQUFLO0FBQ2YsYUFBSyxLQUFLLFVBQVUsR0FBRztBQUFBLE1BQzNCO0FBQUEsTUFDQSxpQkFBaUI7QUFDYixjQUFNLFNBQVMsS0FBSztBQUNwQixjQUFNLE9BQU87QUFBQSxVQUNULE1BQU0sT0FBTztBQUFBLFVBQ2IsVUFBVSxPQUFPO0FBQUEsUUFDckI7QUFDQSxjQUFNLFVBQVUsT0FBTyxvQkFBb0IsT0FBTztBQUNsRCxZQUFJLFNBQVM7QUFDVCxlQUFLLG1CQUFtQjtBQUFBLFFBQzVCO0FBQ0EsWUFBSSxPQUFPLGFBQWE7QUFDcEIsZUFBSyxjQUFjLEtBQUssT0FBTztBQUFBLFFBQ25DO0FBQ0EsWUFBSSxPQUFPLG1CQUFtQjtBQUMxQixlQUFLLG9CQUFvQixPQUFPLFNBQVMsT0FBTyxtQkFBbUIsRUFBRSxDQUFDO0FBQUEsUUFDMUU7QUFDQSxZQUFJLE9BQU8sY0FBYztBQUNyQixlQUFLLGVBQWUsT0FBTyxTQUFTLE9BQU8sY0FBYyxFQUFFLENBQUM7QUFBQSxRQUNoRTtBQUNBLFlBQUksT0FBTyxxQ0FBcUM7QUFDNUMsZUFBSyxzQ0FBc0MsT0FBTyxTQUFTLE9BQU8scUNBQXFDLEVBQUUsQ0FBQztBQUFBLFFBQzlHO0FBQ0EsWUFBSSxPQUFPLFNBQVM7QUFDaEIsZUFBSyxVQUFVLE9BQU87QUFBQSxRQUMxQjtBQUNBLGVBQU87QUFBQSxNQUNYO0FBQUEsTUFDQSxPQUFPLFFBQVFBLFFBQU87QUFDbEIsWUFBSSxPQUFPLGdCQUFnQkEsUUFBTztBQUM5QixnQkFBTSxNQUFNLEtBQUs7QUFDakIsY0FBSSxLQUFLLFFBQVEsS0FBSyxLQUFLLFFBQVEsR0FBRyxNQUFNLEdBQUc7QUFDM0MsZ0JBQUksUUFBUSxLQUFLLE9BQU8sZUFBZSxLQUFLLElBQUk7QUFBQSxVQUNwRCxPQUFPO0FBQ0gsZ0JBQUksUUFBUSxLQUFLLE1BQU0sS0FBSyxJQUFJO0FBQUEsVUFDcEM7QUFFQSxjQUFJLEdBQUcsV0FBVyxXQUFXO0FBQ3pCLGdCQUFJLE9BQU8sT0FBTyxXQUFXLE9BQU8sU0FBUztBQUFBLFVBQ2pELENBQUM7QUFBQSxRQUNMLFdBQVcsT0FBTyxZQUFZLFFBQVFBLE1BQUssTUFBTSxJQUFJO0FBQ2pELGlCQUFPLFlBQVksT0FBTyxPQUFPLFlBQVksUUFBUUEsTUFBSyxHQUFHLENBQUM7QUFBQSxRQUNsRTtBQUFBLE1BQ0o7QUFBQSxNQUNBLGNBQWMsS0FBSyxRQUFRLFNBQVM7QUFDaEMsZUFBTyxLQUFLLE9BQU8sY0FBYyxLQUFLLFFBQVEsT0FBTztBQUFBLE1BQ3pEO0FBQUEsTUFDQSxjQUFjLEtBQUssUUFBUTtBQUN2QixlQUFPLEtBQUssT0FBTyxjQUFjLEtBQUssTUFBTTtBQUFBLE1BQ2hEO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJQSxpQkFBaUIsS0FBSztBQUNsQixlQUFPLE1BQU0saUJBQWlCLEdBQUc7QUFBQSxNQUNyQztBQUFBLE1BQ0EsY0FBYyxLQUFLO0FBQ2YsZUFBTyxNQUFNLGNBQWMsR0FBRztBQUFBLE1BQ2xDO0FBQUEsTUFDQSxtQkFBbUI7QUFDZixZQUFJLEtBQUssa0JBQWtCLE1BQU07QUFDN0IsZUFBSyxlQUFlLEtBQUssWUFBWSxNQUFNO0FBQzNDLGdCQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsY0FBSSxhQUFhO0FBQ2IsaUJBQUssZ0JBQWdCO0FBQ3JCLGlCQUFLLGNBQWM7QUFDbkIsa0JBQU0sYUFBYSxZQUFZLE9BQU8sS0FBSyxVQUFVO0FBQ3JELGdCQUFJLFlBQVk7QUFDWixzQkFBUSxTQUFTLE1BQUk7QUFDakIsNEJBQVksWUFBWSxZQUFZLEtBQUssVUFBVTtBQUNuRCxxQkFBSyxnQkFBZ0I7QUFDckIscUJBQUssaUJBQWlCO0FBQUEsY0FDMUIsQ0FBQztBQUFBLFlBQ0w7QUFBQSxVQUNKLFdBQVcsS0FBSyxhQUFhO0FBQ3pCLGlCQUFLLGVBQWU7QUFDcEIsaUJBQUssS0FBSyxPQUFPO0FBQUEsVUFDckI7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLE1BQ0EsTUFBTSxRQUFRLFFBQVEsVUFBVTtBQUU1QixZQUFJQTtBQUNKLFlBQUk7QUFDSixZQUFJLFVBQVUsTUFBTTtBQUNoQixnQkFBTSxJQUFJLFVBQVUsNkNBQTZDO0FBQUEsUUFDckU7QUFDQSxZQUFJLE9BQU8sT0FBTyxXQUFXLFlBQVk7QUFDckMsbUJBQVNBLFNBQVE7QUFDakIsY0FBSSxDQUFDQSxPQUFNLFVBQVU7QUFDakIsZ0JBQUksT0FBTyxXQUFXLFlBQVk7QUFDOUIsY0FBQUEsT0FBTSxXQUFXO0FBQUEsWUFDckIsV0FBVyxVQUFVO0FBQ2pCLGNBQUFBLE9BQU0sV0FBVztBQUFBLFlBQ3JCO0FBQUEsVUFDSjtBQUFBLFFBQ0osT0FBTztBQUNILFVBQUFBLFNBQVEsSUFBSUosT0FBTSxRQUFRLFFBQVEsUUFBUTtBQUMxQyxjQUFJLENBQUNJLE9BQU0sVUFBVTtBQUNqQixxQkFBUyxJQUFJLEtBQUssU0FBUyxDQUFDLFNBQVMsV0FBUztBQUMxQyxjQUFBQSxPQUFNLFdBQVcsQ0FBQyxLQUFLLFFBQU0sTUFBTSxPQUFPLEdBQUcsSUFBSSxRQUFRLEdBQUc7QUFBQSxZQUNoRSxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQU07QUFHWixvQkFBTSxrQkFBa0IsR0FBRztBQUMzQixvQkFBTTtBQUFBLFlBQ1YsQ0FBQztBQUFBLFVBQ0wsV0FBVyxPQUFPQSxPQUFNLGFBQWEsWUFBWTtBQUM3QyxrQkFBTSxJQUFJLFVBQVUsNEJBQTRCO0FBQUEsVUFDcEQ7QUFBQSxRQUNKO0FBQ0EsY0FBTSxjQUFjLE9BQU8saUJBQWlCLEtBQUsscUJBQXFCO0FBQ3RFLFlBQUksYUFBYTtBQUNiLGdCQUFNLGdCQUFnQkEsT0FBTSxhQUFhLE1BQUk7QUFBQSxVQUFDO0FBQzlDLGdCQUFNLG1CQUFtQixXQUFXLE1BQUk7QUFDcEMsa0JBQU0sUUFBUSxJQUFJLE1BQU0sb0JBQW9CO0FBQzVDLG9CQUFRLFNBQVMsTUFBSTtBQUNqQixjQUFBQSxPQUFNLFlBQVksT0FBTyxLQUFLLFVBQVU7QUFBQSxZQUM1QyxDQUFDO0FBQ0QsMEJBQWMsS0FBSztBQUduQixZQUFBQSxPQUFNLFdBQVcsTUFBSTtBQUFBLFlBQUM7QUFFdEIsa0JBQU0sUUFBUSxLQUFLLFlBQVksUUFBUUEsTUFBSztBQUM1QyxnQkFBSSxRQUFRLElBQUk7QUFDWixtQkFBSyxZQUFZLE9BQU8sT0FBTyxDQUFDO0FBQUEsWUFDcEM7QUFDQSxpQkFBSyxpQkFBaUI7QUFBQSxVQUMxQixHQUFHLFdBQVc7QUFDZCxVQUFBQSxPQUFNLFdBQVcsQ0FBQyxLQUFLLFFBQU07QUFDekIseUJBQWEsZ0JBQWdCO0FBQzdCLDBCQUFjLEtBQUssR0FBRztBQUFBLFVBQzFCO0FBQUEsUUFDSjtBQUNBLFlBQUksS0FBSyxVQUFVLENBQUNBLE9BQU0sUUFBUTtBQUM5QixVQUFBQSxPQUFNLFNBQVM7QUFBQSxRQUNuQjtBQUNBLFlBQUlBLE9BQU0sV0FBVyxDQUFDQSxPQUFNLFFBQVEsUUFBUTtBQUN4QyxVQUFBQSxPQUFNLFFBQVEsU0FBUyxLQUFLO0FBQUEsUUFDaEM7QUFDQSxZQUFJLENBQUMsS0FBSyxZQUFZO0FBQ2xCLGtCQUFRLFNBQVMsTUFBSTtBQUNqQixZQUFBQSxPQUFNLFlBQVksSUFBSSxNQUFNLGdFQUFnRSxHQUFHLEtBQUssVUFBVTtBQUFBLFVBQ2xILENBQUM7QUFDRCxpQkFBTztBQUFBLFFBQ1g7QUFDQSxZQUFJLEtBQUssU0FBUztBQUNkLGtCQUFRLFNBQVMsTUFBSTtBQUNqQixZQUFBQSxPQUFNLFlBQVksSUFBSSxNQUFNLHdDQUF3QyxHQUFHLEtBQUssVUFBVTtBQUFBLFVBQzFGLENBQUM7QUFDRCxpQkFBTztBQUFBLFFBQ1g7QUFDQSxZQUFJLEtBQUssWUFBWSxTQUFTLEdBQUc7QUFDN0IsNENBQWtDO0FBQUEsUUFDdEM7QUFDQSxhQUFLLFlBQVksS0FBS0EsTUFBSztBQUMzQixhQUFLLGlCQUFpQjtBQUN0QixlQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0EsTUFBTTtBQUNGLGFBQUssV0FBVyxJQUFJO0FBQUEsTUFDeEI7QUFBQSxNQUNBLFFBQVE7QUFDSixhQUFLLFdBQVcsTUFBTTtBQUFBLE1BQzFCO0FBQUEsTUFDQSx1QkFBdUI7QUFDbkIsZUFBTyxLQUFLO0FBQUEsTUFDaEI7QUFBQSxNQUNBLElBQUksSUFBSTtBQUNKLGFBQUssVUFBVTtBQUVmLFlBQUksQ0FBQyxLQUFLLFdBQVcsZUFBZSxLQUFLLFFBQVE7QUFDN0MsY0FBSSxJQUFJO0FBQ0osZUFBRztBQUNIO0FBQUEsVUFDSixPQUFPO0FBQ0gsbUJBQU8sS0FBSyxTQUFTLFFBQVE7QUFBQSxVQUNqQztBQUFBLFFBQ0o7QUFDQSxZQUFJLEtBQUssZ0JBQWdCLEtBQUssQ0FBQyxLQUFLLFlBQVk7QUFHNUMsZUFBSyxXQUFXLE9BQU8sUUFBUTtBQUFBLFFBQ25DLE9BQU87QUFDSCxlQUFLLFdBQVcsSUFBSTtBQUFBLFFBQ3hCO0FBQ0EsWUFBSSxJQUFJO0FBQ0osZUFBSyxXQUFXLEtBQUssT0FBTyxFQUFFO0FBQUEsUUFDbEMsT0FBTztBQUNILGlCQUFPLElBQUksS0FBSyxTQUFTLENBQUMsWUFBVTtBQUNoQyxpQkFBSyxXQUFXLEtBQUssT0FBTyxPQUFPO0FBQUEsVUFDdkMsQ0FBQztBQUFBLFFBQ0w7QUFBQSxNQUNKO0FBQUEsTUFDQSxJQUFJLGFBQWE7QUFDYixvQ0FBNEI7QUFDNUIsZUFBTyxLQUFLO0FBQUEsTUFDaEI7QUFBQSxJQUNKO0FBRUEsSUFBQUQsUUFBTyxRQUFRSDtBQUNmLElBQUFGLFFBQU8sVUFBVUs7QUFBQTtBQUFBOzs7QUNsb0JqQjtBQUFBLHVGQUFBRSxTQUFBO0FBQUE7QUFDQSxRQUFNLGVBQWUsUUFBUSxRQUFRLEVBQUU7QUFDdkMsUUFBTSxPQUFPLGtDQUFXO0FBQUEsSUFBQyxHQUFaO0FBQ2IsUUFBTSxjQUFjLHdCQUFDLE1BQU0sY0FBWTtBQUNuQyxZQUFNLElBQUksS0FBSyxVQUFVLFNBQVM7QUFDbEMsYUFBTyxNQUFNLEtBQUssU0FBWSxLQUFLLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUFBLElBQ3JELEdBSG9CO0FBSXBCLFFBQU0sV0FBTixNQUFlO0FBQUEsTUFQZixPQU9lO0FBQUE7QUFBQTtBQUFBLE1BQ1gsWUFBWSxRQUFRLGNBQWMsV0FBVTtBQUN4QyxhQUFLLFNBQVM7QUFDZCxhQUFLLGVBQWU7QUFDcEIsYUFBSyxZQUFZO0FBQUEsTUFDckI7QUFBQSxJQUNKO0FBQ0EsUUFBTSxjQUFOLE1BQWtCO0FBQUEsTUFkbEIsT0Fja0I7QUFBQTtBQUFBO0FBQUEsTUFDZCxZQUFZLFVBQVM7QUFDakIsYUFBSyxXQUFXO0FBQUEsTUFDcEI7QUFBQSxJQUNKO0FBQ0EsYUFBUyx1QkFBdUI7QUFDNUIsWUFBTSxJQUFJLE1BQU0sdUVBQXVFO0FBQUEsSUFDM0Y7QUFGUztBQUdULGFBQVMsVUFBVUMsVUFBUyxVQUFVO0FBQ2xDLFVBQUksVUFBVTtBQUNWLGVBQU87QUFBQSxVQUNIO0FBQUEsVUFDQSxRQUFRO0FBQUEsUUFDWjtBQUFBLE1BQ0o7QUFDQSxVQUFJO0FBQ0osVUFBSTtBQUNKLFlBQU0sS0FBSyxnQ0FBUyxLQUFLLFFBQVE7QUFDN0IsY0FBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLE1BQU07QUFBQSxNQUMvQixHQUZXO0FBR1gsWUFBTSxTQUFTLElBQUlBLFNBQVEsU0FBUyxTQUFTLFFBQVE7QUFDakQsY0FBTTtBQUNOLGNBQU07QUFBQSxNQUNWLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBTTtBQUdaLGNBQU0sa0JBQWtCLEdBQUc7QUFDM0IsY0FBTTtBQUFBLE1BQ1YsQ0FBQztBQUNELGFBQU87QUFBQSxRQUNILFVBQVU7QUFBQSxRQUNWO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUF6QlM7QUEwQlQsYUFBUyxpQkFBaUJDLE9BQU0sUUFBUTtBQUNwQyxhQUFPLGdDQUFTLGFBQWEsS0FBSztBQUM5QixZQUFJLFNBQVM7QUFDYixlQUFPLGVBQWUsU0FBUyxZQUFZO0FBQzNDLGVBQU8sR0FBRyxTQUFTLE1BQUk7QUFDbkIsVUFBQUEsTUFBSyxJQUFJLDREQUE0RCxHQUFHO0FBQUEsUUFDNUUsQ0FBQztBQUNELFFBQUFBLE1BQUssUUFBUSxNQUFNO0FBR25CLFFBQUFBLE1BQUssS0FBSyxTQUFTLEtBQUssTUFBTTtBQUFBLE1BQ2xDLEdBVk87QUFBQSxJQVdYO0FBWlM7QUFhVCxRQUFNQyxRQUFOLGNBQW1CLGFBQWE7QUFBQSxNQTdEaEMsT0E2RGdDO0FBQUE7QUFBQTtBQUFBLE1BQzVCLFlBQVksU0FBU0MsU0FBTztBQUN4QixjQUFNO0FBQ04sYUFBSyxVQUFVLE9BQU8sT0FBTyxDQUFDLEdBQUcsT0FBTztBQUN4QyxZQUFJLFdBQVcsUUFBUSxjQUFjLFNBQVM7QUFHMUMsaUJBQU8sZUFBZSxLQUFLLFNBQVMsWUFBWTtBQUFBLFlBQzVDLGNBQWM7QUFBQSxZQUNkLFlBQVk7QUFBQSxZQUNaLFVBQVU7QUFBQSxZQUNWLE9BQU8sUUFBUTtBQUFBLFVBQ25CLENBQUM7QUFBQSxRQUNMO0FBQ0EsWUFBSSxXQUFXLFFBQVEsUUFBUSxPQUFPLFFBQVEsSUFBSSxLQUFLO0FBR25ELGlCQUFPLGVBQWUsS0FBSyxRQUFRLEtBQUssT0FBTztBQUFBLFlBQzNDLFlBQVk7QUFBQSxVQUNoQixDQUFDO0FBQUEsUUFDTDtBQUNBLGFBQUssUUFBUSxNQUFNLEtBQUssUUFBUSxPQUFPLEtBQUssUUFBUSxZQUFZO0FBQ2hFLGFBQUssUUFBUSxNQUFNLEtBQUssUUFBUSxPQUFPO0FBQ3ZDLGFBQUssUUFBUSxVQUFVLEtBQUssUUFBUSxXQUFXO0FBQy9DLGFBQUssUUFBUSxrQkFBa0IsS0FBSyxRQUFRLG1CQUFtQjtBQUMvRCxhQUFLLFFBQVEscUJBQXFCLEtBQUssUUFBUSxzQkFBc0I7QUFDckUsYUFBSyxNQUFNLEtBQUssUUFBUSxPQUFPLFdBQVc7QUFBQSxRQUFDO0FBQzNDLGFBQUssU0FBUyxLQUFLLFFBQVEsVUFBVUEsV0FBVSxlQUFjO0FBQzdELGFBQUssVUFBVSxLQUFLLFFBQVEsV0FBVyxPQUFPO0FBQzlDLFlBQUksT0FBTyxLQUFLLFFBQVEsc0JBQXNCLGFBQWE7QUFDdkQsZUFBSyxRQUFRLG9CQUFvQjtBQUFBLFFBQ3JDO0FBQ0EsYUFBSyxXQUFXLENBQUM7QUFDakIsYUFBSyxRQUFRLENBQUM7QUFDZCxhQUFLLFdBQVcsb0JBQUksUUFBUTtBQUM1QixhQUFLLGdCQUFnQixDQUFDO0FBQ3RCLGFBQUssZUFBZTtBQUNwQixhQUFLLFNBQVM7QUFDZCxhQUFLLFFBQVE7QUFBQSxNQUNqQjtBQUFBLE1BQ0EsWUFBWSxHQUFHO0FBQ1gsY0FBTUgsV0FBVSxLQUFLO0FBQ3JCLFlBQUksT0FBT0EsU0FBUSxRQUFRLFlBQVk7QUFDbkMsaUJBQU9BLFNBQVEsSUFBSSxDQUFDO0FBQUEsUUFDeEI7QUFDQSxlQUFPLElBQUlBLFNBQVEsQ0FBQyxZQUFVLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFBQSxNQUM5QztBQUFBLE1BQ0EsVUFBVTtBQUNOLGVBQU8sS0FBSyxTQUFTLFVBQVUsS0FBSyxRQUFRO0FBQUEsTUFDaEQ7QUFBQSxNQUNBLGNBQWM7QUFDVixlQUFPLEtBQUssU0FBUyxTQUFTLEtBQUssUUFBUTtBQUFBLE1BQy9DO0FBQUEsTUFDQSxjQUFjO0FBQ1YsYUFBSyxJQUFJLGFBQWE7QUFDdEIsWUFBSSxLQUFLLE9BQU87QUFDWixlQUFLLElBQUksbUJBQW1CO0FBQzVCO0FBQUEsUUFDSjtBQUNBLFlBQUksS0FBSyxRQUFRO0FBQ2IsZUFBSyxJQUFJLHVCQUF1QjtBQUNoQyxjQUFJLEtBQUssTUFBTSxRQUFRO0FBQ25CLGlCQUFLLE1BQU0sTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFPO0FBQzNCLG1CQUFLLFFBQVEsS0FBSyxNQUFNO0FBQUEsWUFDNUIsQ0FBQztBQUFBLFVBQ0w7QUFDQSxjQUFJLENBQUMsS0FBSyxTQUFTLFFBQVE7QUFDdkIsaUJBQUssUUFBUTtBQUNiLGlCQUFLLGFBQWE7QUFBQSxVQUN0QjtBQUNBO0FBQUEsUUFDSjtBQUVBLFlBQUksQ0FBQyxLQUFLLGNBQWMsUUFBUTtBQUM1QixlQUFLLElBQUksb0JBQW9CO0FBQzdCO0FBQUEsUUFDSjtBQUVBLFlBQUksQ0FBQyxLQUFLLE1BQU0sVUFBVSxLQUFLLFFBQVEsR0FBRztBQUN0QztBQUFBLFFBQ0o7QUFDQSxjQUFNLGNBQWMsS0FBSyxjQUFjLE1BQU07QUFDN0MsWUFBSSxLQUFLLE1BQU0sUUFBUTtBQUNuQixnQkFBTSxXQUFXLEtBQUssTUFBTSxJQUFJO0FBQ2hDLHVCQUFhLFNBQVMsU0FBUztBQUMvQixnQkFBTSxTQUFTLFNBQVM7QUFDeEIsaUJBQU8sT0FBTyxPQUFPLElBQUk7QUFDekIsZ0JBQU0sZUFBZSxTQUFTO0FBQzlCLGlCQUFPLEtBQUssZUFBZSxRQUFRLGFBQWEsY0FBYyxLQUFLO0FBQUEsUUFDdkU7QUFDQSxZQUFJLENBQUMsS0FBSyxRQUFRLEdBQUc7QUFDakIsaUJBQU8sS0FBSyxVQUFVLFdBQVc7QUFBQSxRQUNyQztBQUNBLGNBQU0sSUFBSSxNQUFNLHNCQUFzQjtBQUFBLE1BQzFDO0FBQUEsTUFDQSxRQUFRLFFBQVEsVUFBVTtBQUN0QixjQUFNLFVBQVUsWUFBWSxLQUFLLE9BQU8sQ0FBQyxTQUFPLEtBQUssV0FBVyxNQUFNO0FBQ3RFLFlBQUksWUFBWSxRQUFXO0FBQ3ZCLHVCQUFhLFFBQVEsU0FBUztBQUFBLFFBQ2xDO0FBQ0EsYUFBSyxXQUFXLEtBQUssU0FBUyxPQUFPLENBQUMsTUFBSSxNQUFNLE1BQU07QUFDdEQsY0FBTSxVQUFVO0FBQ2hCLGVBQU8sSUFBSSxNQUFJO0FBQ1gsa0JBQVEsS0FBSyxVQUFVLE1BQU07QUFDN0IsY0FBSSxPQUFPLGFBQWEsWUFBWTtBQUNoQyxxQkFBUztBQUFBLFVBQ2I7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQUEsTUFDQSxRQUFRLElBQUk7QUFDUixZQUFJLEtBQUssUUFBUTtBQUNiLGdCQUFNLE1BQU0sSUFBSSxNQUFNLGlEQUFpRDtBQUN2RSxpQkFBTyxLQUFLLEdBQUcsR0FBRyxJQUFJLEtBQUssUUFBUSxPQUFPLEdBQUc7QUFBQSxRQUNqRDtBQUNBLGNBQU0sV0FBVyxVQUFVLEtBQUssU0FBUyxFQUFFO0FBQzNDLGNBQU0sU0FBUyxTQUFTO0FBRXhCLFlBQUksS0FBSyxRQUFRLEtBQUssS0FBSyxNQUFNLFFBQVE7QUFFckMsY0FBSSxLQUFLLE1BQU0sUUFBUTtBQUNuQixvQkFBUSxTQUFTLE1BQUksS0FBSyxZQUFZLENBQUM7QUFBQSxVQUMzQztBQUNBLGNBQUksQ0FBQyxLQUFLLFFBQVEseUJBQXlCO0FBQ3ZDLGlCQUFLLGNBQWMsS0FBSyxJQUFJLFlBQVksU0FBUyxRQUFRLENBQUM7QUFDMUQsbUJBQU87QUFBQSxVQUNYO0FBQ0EsZ0JBQU0sZ0JBQWdCLHdCQUFDLEtBQUssS0FBSyxTQUFPO0FBQ3BDLHlCQUFhLEdBQUc7QUFDaEIscUJBQVMsU0FBUyxLQUFLLEtBQUssSUFBSTtBQUFBLFVBQ3BDLEdBSHNCO0FBSXRCLGdCQUFNLGNBQWMsSUFBSSxZQUFZLGFBQWE7QUFFakQsZ0JBQU0sTUFBTSxXQUFXLE1BQUk7QUFHdkIsd0JBQVksS0FBSyxlQUFlLENBQUMsTUFBSSxFQUFFLGFBQWEsYUFBYTtBQUNqRSx3QkFBWSxXQUFXO0FBQ3ZCLHFCQUFTLFNBQVMsSUFBSSxNQUFNLHlDQUF5QyxDQUFDO0FBQUEsVUFDMUUsR0FBRyxLQUFLLFFBQVEsdUJBQXVCO0FBQ3ZDLGNBQUksSUFBSSxPQUFPO0FBQ1gsZ0JBQUksTUFBTTtBQUFBLFVBQ2Q7QUFDQSxlQUFLLGNBQWMsS0FBSyxXQUFXO0FBQ25DLGlCQUFPO0FBQUEsUUFDWDtBQUNBLGFBQUssVUFBVSxJQUFJLFlBQVksU0FBUyxRQUFRLENBQUM7QUFDakQsZUFBTztBQUFBLE1BQ1g7QUFBQSxNQUNBLFVBQVUsYUFBYTtBQUNuQixjQUFNLFNBQVMsSUFBSSxLQUFLLE9BQU8sS0FBSyxPQUFPO0FBQzNDLGFBQUssU0FBUyxLQUFLLE1BQU07QUFDekIsY0FBTSxlQUFlLGlCQUFpQixNQUFNLE1BQU07QUFDbEQsYUFBSyxJQUFJLHlCQUF5QjtBQUVsQyxZQUFJO0FBQ0osWUFBSSxhQUFhO0FBQ2pCLFlBQUksS0FBSyxRQUFRLHlCQUF5QjtBQUN0QyxnQkFBTSxXQUFXLE1BQUk7QUFDakIsZ0JBQUksT0FBTyxZQUFZO0FBQ25CLG1CQUFLLElBQUksOEJBQThCO0FBQ3ZDLDJCQUFhO0FBQ2IscUJBQU8sV0FBVyxPQUFPLFFBQVE7QUFBQSxZQUNyQyxXQUFXLENBQUMsT0FBTyxZQUFZLEdBQUc7QUFDOUIsbUJBQUssSUFBSSw4QkFBOEI7QUFDdkMsMkJBQWE7QUFFYixxQkFBTyxJQUFJO0FBQUEsWUFDZjtBQUFBLFVBQ0osR0FBRyxLQUFLLFFBQVEsdUJBQXVCO0FBQUEsUUFDM0M7QUFDQSxhQUFLLElBQUksdUJBQXVCO0FBQ2hDLGVBQU8sUUFBUSxDQUFDLFFBQU07QUFDbEIsY0FBSSxLQUFLO0FBQ0wseUJBQWEsR0FBRztBQUFBLFVBQ3BCO0FBQ0EsaUJBQU8sR0FBRyxTQUFTLFlBQVk7QUFDL0IsY0FBSSxLQUFLO0FBQ0wsaUJBQUssSUFBSSw0QkFBNEIsR0FBRztBQUV4QyxpQkFBSyxXQUFXLEtBQUssU0FBUyxPQUFPLENBQUMsTUFBSSxNQUFNLE1BQU07QUFDdEQsZ0JBQUksWUFBWTtBQUNaLG9CQUFNLElBQUksTUFBTSxtREFBbUQ7QUFBQSxnQkFDL0QsT0FBTztBQUFBLGNBQ1gsQ0FBQztBQUFBLFlBQ0w7QUFFQSxpQkFBSyxZQUFZO0FBQ2pCLGdCQUFJLENBQUMsWUFBWSxVQUFVO0FBQ3ZCLDBCQUFZLFNBQVMsS0FBSyxRQUFXLElBQUk7QUFBQSxZQUM3QztBQUFBLFVBQ0osT0FBTztBQUNILGlCQUFLLElBQUksc0JBQXNCO0FBQy9CLGdCQUFJLEtBQUssUUFBUSxXQUFXO0FBQ3hCLG1CQUFLLFlBQVksTUFBSSxLQUFLLFFBQVEsVUFBVSxNQUFNLENBQUMsRUFBRSxLQUFLLE1BQUk7QUFDMUQscUJBQUssY0FBYyxRQUFRLGFBQWEsWUFBWTtBQUFBLGNBQ3hELEdBQUcsQ0FBQyxZQUFVO0FBQ1YscUJBQUssV0FBVyxLQUFLLFNBQVMsT0FBTyxDQUFDLE1BQUksTUFBTSxNQUFNO0FBQ3RELHVCQUFPLElBQUksTUFBSTtBQUNYLHVCQUFLLFlBQVk7QUFDakIsc0JBQUksQ0FBQyxZQUFZLFVBQVU7QUFDdkIsZ0NBQVksU0FBUyxTQUFTLFFBQVcsSUFBSTtBQUFBLGtCQUNqRDtBQUFBLGdCQUNKLENBQUM7QUFBQSxjQUNMLENBQUM7QUFDRDtBQUFBLFlBQ0o7QUFDQSxtQkFBTyxLQUFLLGNBQWMsUUFBUSxhQUFhLFlBQVk7QUFBQSxVQUMvRDtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0w7QUFBQSxNQUNBLGNBQWMsUUFBUSxhQUFhLGNBQWM7QUFDN0MsWUFBSSxLQUFLLFFBQVEsdUJBQXVCLEdBQUc7QUFDdkMsZ0JBQU0scUJBQXFCLFdBQVcsTUFBSTtBQUN0QyxpQkFBSyxJQUFJLHVDQUF1QztBQUNoRCxpQkFBSyxTQUFTLElBQUksTUFBTTtBQUN4QixrQkFBTSxZQUFZLEtBQUssTUFBTSxVQUFVLENBQUMsYUFBVyxTQUFTLFdBQVcsTUFBTTtBQUM3RSxnQkFBSSxjQUFjLElBQUk7QUFDbEIsbUJBQUssZUFBZSxRQUFRLElBQUksWUFBWSxDQUFDLEtBQUtJLFNBQVEsa0JBQWdCLGNBQWMsQ0FBQyxHQUFHLGNBQWMsS0FBSztBQUFBLFlBQ25IO0FBQUEsVUFDSixHQUFHLEtBQUssUUFBUSxxQkFBcUIsR0FBSTtBQUN6Qyw2QkFBbUIsTUFBTTtBQUN6QixpQkFBTyxLQUFLLE9BQU8sTUFBSSxhQUFhLGtCQUFrQixDQUFDO0FBQUEsUUFDM0Q7QUFDQSxlQUFPLEtBQUssZUFBZSxRQUFRLGFBQWEsY0FBYyxJQUFJO0FBQUEsTUFDdEU7QUFBQTtBQUFBLE1BRUEsZUFBZSxRQUFRLGFBQWEsY0FBYyxPQUFPO0FBQ3JELFlBQUksT0FBTztBQUNQLGVBQUssS0FBSyxXQUFXLE1BQU07QUFBQSxRQUMvQjtBQUNBLGFBQUssS0FBSyxXQUFXLE1BQU07QUFDM0IsZUFBTyxVQUFVLEtBQUssYUFBYSxRQUFRLFlBQVk7QUFDdkQsZUFBTyxlQUFlLFNBQVMsWUFBWTtBQUMzQyxZQUFJLENBQUMsWUFBWSxVQUFVO0FBQ3ZCLGNBQUksU0FBUyxLQUFLLFFBQVEsUUFBUTtBQUM5QixpQkFBSyxRQUFRLE9BQU8sUUFBUSxDQUFDLFFBQU07QUFDL0Isa0JBQUksS0FBSztBQUNMLHVCQUFPLFFBQVEsR0FBRztBQUNsQix1QkFBTyxZQUFZLFNBQVMsS0FBSyxRQUFXLElBQUk7QUFBQSxjQUNwRDtBQUNBLDBCQUFZLFNBQVMsUUFBVyxRQUFRLE9BQU8sT0FBTztBQUFBLFlBQzFELENBQUM7QUFBQSxVQUNMLE9BQU87QUFDSCx3QkFBWSxTQUFTLFFBQVcsUUFBUSxPQUFPLE9BQU87QUFBQSxVQUMxRDtBQUFBLFFBQ0osT0FBTztBQUNILGNBQUksU0FBUyxLQUFLLFFBQVEsUUFBUTtBQUM5QixpQkFBSyxRQUFRLE9BQU8sUUFBUSxPQUFPLE9BQU87QUFBQSxVQUM5QyxPQUFPO0FBQ0gsbUJBQU8sUUFBUTtBQUFBLFVBQ25CO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQTtBQUFBLE1BRUEsYUFBYSxRQUFRLGNBQWM7QUFDL0IsWUFBSSxXQUFXO0FBQ2YsZUFBTyxDQUFDLFFBQU07QUFDVixjQUFJLFVBQVU7QUFDVixpQ0FBcUI7QUFBQSxVQUN6QjtBQUNBLHFCQUFXO0FBQ1gsZUFBSyxTQUFTLFFBQVEsY0FBYyxHQUFHO0FBQUEsUUFDM0M7QUFBQSxNQUNKO0FBQUE7QUFBQTtBQUFBLE1BR0EsU0FBUyxRQUFRLGNBQWMsS0FBSztBQUNoQyxlQUFPLEdBQUcsU0FBUyxZQUFZO0FBQy9CLGVBQU8saUJBQWlCLE9BQU8saUJBQWlCLEtBQUs7QUFDckQsYUFBSyxLQUFLLFdBQVcsS0FBSyxNQUFNO0FBRWhDLFlBQUksT0FBTyxLQUFLLFVBQVUsQ0FBQyxPQUFPLGNBQWMsT0FBTyxXQUFXLE9BQU8saUJBQWlCLEtBQUssUUFBUSxTQUFTO0FBQzVHLGNBQUksT0FBTyxpQkFBaUIsS0FBSyxRQUFRLFNBQVM7QUFDOUMsaUJBQUssSUFBSSx3QkFBd0I7QUFBQSxVQUNyQztBQUNBLGlCQUFPLEtBQUssUUFBUSxRQUFRLEtBQUssWUFBWSxLQUFLLElBQUksQ0FBQztBQUFBLFFBQzNEO0FBQ0EsY0FBTSxZQUFZLEtBQUssU0FBUyxJQUFJLE1BQU07QUFDMUMsWUFBSSxXQUFXO0FBQ1gsZUFBSyxJQUFJLHVCQUF1QjtBQUNoQyxlQUFLLFNBQVMsT0FBTyxNQUFNO0FBQzNCLGlCQUFPLEtBQUssUUFBUSxRQUFRLEtBQUssWUFBWSxLQUFLLElBQUksQ0FBQztBQUFBLFFBQzNEO0FBRUEsWUFBSTtBQUNKLFlBQUksS0FBSyxRQUFRLHFCQUFxQixLQUFLLFlBQVksR0FBRztBQUN0RCxnQkFBTSxXQUFXLE1BQUk7QUFDakIsZ0JBQUksS0FBSyxZQUFZLEdBQUc7QUFDcEIsbUJBQUssSUFBSSxvQkFBb0I7QUFDN0IsbUJBQUssUUFBUSxRQUFRLEtBQUssWUFBWSxLQUFLLElBQUksQ0FBQztBQUFBLFlBQ3BEO0FBQUEsVUFDSixHQUFHLEtBQUssUUFBUSxpQkFBaUI7QUFDakMsY0FBSSxLQUFLLFFBQVEsaUJBQWlCO0FBRTlCLGdCQUFJLE1BQU07QUFBQSxVQUNkO0FBQUEsUUFDSjtBQUNBLFlBQUksS0FBSyxRQUFRLGlCQUFpQjtBQUM5QixpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFDQSxhQUFLLE1BQU0sS0FBSyxJQUFJLFNBQVMsUUFBUSxjQUFjLEdBQUcsQ0FBQztBQUN2RCxhQUFLLFlBQVk7QUFBQSxNQUNyQjtBQUFBLE1BQ0EsTUFBTSxNQUFNLFFBQVEsSUFBSTtBQUVwQixZQUFJLE9BQU8sU0FBUyxZQUFZO0FBQzVCLGdCQUFNQyxZQUFXLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFDN0MsdUJBQWEsV0FBVztBQUNwQixtQkFBT0EsVUFBUyxTQUFTLElBQUksTUFBTSwwRUFBMEUsQ0FBQztBQUFBLFVBQ2xILENBQUM7QUFDRCxpQkFBT0EsVUFBUztBQUFBLFFBQ3BCO0FBRUEsWUFBSSxPQUFPLFdBQVcsWUFBWTtBQUM5QixlQUFLO0FBQ0wsbUJBQVM7QUFBQSxRQUNiO0FBQ0EsY0FBTSxXQUFXLFVBQVUsS0FBSyxTQUFTLEVBQUU7QUFDM0MsYUFBSyxTQUFTO0FBQ2QsYUFBSyxRQUFRLENBQUMsS0FBSyxXQUFTO0FBQ3hCLGNBQUksS0FBSztBQUNMLG1CQUFPLEdBQUcsR0FBRztBQUFBLFVBQ2pCO0FBQ0EsY0FBSSxpQkFBaUI7QUFDckIsZ0JBQU0sVUFBVSx3QkFBQ0MsU0FBTTtBQUNuQixnQkFBSSxnQkFBZ0I7QUFDaEI7QUFBQSxZQUNKO0FBQ0EsNkJBQWlCO0FBQ2pCLG1CQUFPLFFBQVFBLElBQUc7QUFDbEIsZUFBR0EsSUFBRztBQUFBLFVBQ1YsR0FQZ0I7QUFRaEIsaUJBQU8sS0FBSyxTQUFTLE9BQU87QUFDNUIsZUFBSyxJQUFJLG1CQUFtQjtBQUM1QixjQUFJO0FBQ0EsbUJBQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQ0EsTUFBSyxRQUFNO0FBQ25DLG1CQUFLLElBQUksa0JBQWtCO0FBQzNCLHFCQUFPLGVBQWUsU0FBUyxPQUFPO0FBQ3RDLGtCQUFJLGdCQUFnQjtBQUNoQjtBQUFBLGNBQ0o7QUFDQSwrQkFBaUI7QUFDakIscUJBQU8sUUFBUUEsSUFBRztBQUNsQixrQkFBSUEsTUFBSztBQUNMLHVCQUFPLEdBQUdBLElBQUc7QUFBQSxjQUNqQjtBQUNBLHFCQUFPLEdBQUcsUUFBVyxHQUFHO0FBQUEsWUFDNUIsQ0FBQztBQUFBLFVBQ0wsU0FBU0EsTUFBSztBQUNWLG1CQUFPLFFBQVFBLElBQUc7QUFDbEIsbUJBQU8sR0FBR0EsSUFBRztBQUFBLFVBQ2pCO0FBQUEsUUFDSixDQUFDO0FBQ0QsZUFBTyxTQUFTO0FBQUEsTUFDcEI7QUFBQSxNQUNBLElBQUksSUFBSTtBQUNKLGFBQUssSUFBSSxRQUFRO0FBQ2pCLFlBQUksS0FBSyxRQUFRO0FBQ2IsZ0JBQU0sTUFBTSxJQUFJLE1BQU0sbUNBQW1DO0FBQ3pELGlCQUFPLEtBQUssR0FBRyxHQUFHLElBQUksS0FBSyxRQUFRLE9BQU8sR0FBRztBQUFBLFFBQ2pEO0FBQ0EsYUFBSyxTQUFTO0FBQ2QsY0FBTSxXQUFXLFVBQVUsS0FBSyxTQUFTLEVBQUU7QUFDM0MsYUFBSyxlQUFlLFNBQVM7QUFDN0IsYUFBSyxZQUFZO0FBQ2pCLGVBQU8sU0FBUztBQUFBLE1BQ3BCO0FBQUEsTUFDQSxJQUFJLGVBQWU7QUFDZixlQUFPLEtBQUssY0FBYztBQUFBLE1BQzlCO0FBQUEsTUFDQSxJQUFJLFlBQVk7QUFDWixlQUFPLEtBQUssTUFBTTtBQUFBLE1BQ3RCO0FBQUEsTUFDQSxJQUFJLGVBQWU7QUFDZixlQUFPLEtBQUssU0FBUyxPQUFPLENBQUMsS0FBSyxXQUFTLE9BQU8sS0FBSyxTQUFTLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDO0FBQUEsTUFDM0Y7QUFBQSxNQUNBLElBQUksYUFBYTtBQUNiLGVBQU8sS0FBSyxTQUFTO0FBQUEsTUFDekI7QUFBQSxJQUNKO0FBQ0EsSUFBQVAsUUFBTyxVQUFVRztBQUFBO0FBQUE7OztBQ3piakIsSUFBQUssaUJBQUE7QUFBQSw4RUFBQUMsU0FBQTtBQUFBO0FBQ0EsUUFBTSxlQUFlLFFBQVEsUUFBUSxFQUFFO0FBQ3ZDLFFBQU0sT0FBTyxRQUFRLE1BQU07QUFDM0IsUUFBTSxRQUFRO0FBQ2QsUUFBTSxjQUFjQSxRQUFPLFVBQVUsU0FBUyxRQUFRLFFBQVEsVUFBVTtBQUNwRSxtQkFBYSxLQUFLLElBQUk7QUFDdEIsZUFBUyxNQUFNLHFCQUFxQixRQUFRLFFBQVEsUUFBUTtBQUM1RCxXQUFLLE9BQU8sT0FBTztBQUNuQixXQUFLLFNBQVMsT0FBTztBQUNyQixXQUFLLE9BQU8sT0FBTztBQUNuQixXQUFLLFlBQVksT0FBTztBQUN4QixXQUFLLFdBQVcsT0FBTztBQUN2QixXQUFLLFFBQVE7QUFDYixXQUFLLGFBQWEsT0FBTyxZQUFZO0FBTXJDLFdBQUssaUJBQWlCO0FBQ3RCLFdBQUssR0FBRyxnQkFBZ0IsU0FBUyxPQUFPO0FBQ3BDLFlBQUksVUFBVSxNQUFPLE1BQUssaUJBQWlCO0FBQUEsTUFDL0MsR0FBRyxLQUFLLElBQUksQ0FBQztBQUFBLElBQ2pCO0FBQ0EsU0FBSyxTQUFTLGFBQWEsWUFBWTtBQUN2QyxRQUFNLGdCQUFnQjtBQUFBLE1BQ2xCLFVBQVU7QUFBQSxNQUNWLG1CQUFtQjtBQUFBLE1BQ25CLGdCQUFnQjtBQUFBLE1BQ2hCLFNBQVM7QUFBQSxNQUNULFlBQVk7QUFBQSxNQUNaLFdBQVc7QUFBQSxNQUNYLFlBQVk7QUFBQSxNQUNaLGNBQWM7QUFBQSxNQUNkLGdCQUFnQjtBQUFBLE1BQ2hCLFlBQVk7QUFBQSxNQUNaLFlBQVk7QUFBQSxNQUNaLGdCQUFnQjtBQUFBLElBQ3BCO0FBQ0EsZ0JBQVksVUFBVSxjQUFjLFNBQVMsS0FBSztBQUU5QyxZQUFNLFNBQVMsS0FBSyxPQUFPLEdBQUcsa0JBQWtCO0FBQ2hELFVBQUksUUFBUTtBQUNSLG1CQUFVLE9BQU8sUUFBTztBQUNwQixnQkFBTSxzQkFBc0IsY0FBYyxHQUFHLEtBQUs7QUFDbEQsY0FBSSxtQkFBbUIsSUFBSSxPQUFPLEdBQUc7QUFBQSxRQUN6QztBQUFBLE1BQ0o7QUFDQSxVQUFJLEtBQUssVUFBVTtBQUNmLGFBQUssU0FBUyxHQUFHO0FBQUEsTUFDckIsT0FBTztBQUNILGFBQUssS0FBSyxTQUFTLEdBQUc7QUFBQSxNQUMxQjtBQUNBLFdBQUssUUFBUTtBQUFBLElBQ2pCO0FBQ0EsZ0JBQVksVUFBVSxPQUFPLFNBQVMsV0FBVyxXQUFXO0FBQ3hELGFBQU8sS0FBSyxZQUFZLEVBQUUsS0FBSyxXQUFXLFNBQVM7QUFBQSxJQUN2RDtBQUNBLGdCQUFZLFVBQVUsUUFBUSxTQUFTLFVBQVU7QUFDN0MsYUFBTyxLQUFLLFlBQVksRUFBRSxNQUFNLFFBQVE7QUFBQSxJQUM1QztBQUNBLGdCQUFZLFVBQVUsY0FBYyxXQUFXO0FBQzNDLFVBQUksS0FBSyxTQUFVLFFBQU8sS0FBSztBQUMvQixXQUFLLFdBQVcsSUFBSSxTQUFTLFNBQVMsU0FBUyxRQUFRO0FBQ25ELGFBQUssTUFBTSxPQUFPLE9BQU87QUFDekIsYUFBSyxNQUFNLFNBQVMsTUFBTTtBQUFBLE1BQzlCLEdBQUcsS0FBSyxJQUFJLENBQUM7QUFDYixhQUFPLEtBQUs7QUFBQSxJQUNoQjtBQUNBLGdCQUFZLFVBQVUsU0FBUyxTQUFTLFFBQVE7QUFDNUMsV0FBSyxRQUFRO0FBQ2IsWUFBTSxPQUFPO0FBQ2IsV0FBSyxTQUFTLE9BQU87QUFDckIsYUFBTyxPQUFPLFlBQVksS0FBSztBQUMvQixVQUFJLFFBQVEsZ0NBQVMsS0FBSyxNQUFNLFNBQVM7QUFDckMsZUFBTyxPQUFPLFlBQVk7QUFDMUIscUJBQWEsV0FBVztBQUNwQixlQUFLLEtBQUssT0FBTztBQUFBLFFBQ3JCLENBQUM7QUFFRCxZQUFJLEtBQUs7QUFDTCxpQkFBTyxLQUFLLFlBQVksR0FBRztBQUFBLFFBQy9CO0FBRUEsWUFBSSxLQUFLLGdCQUFnQjtBQUNyQixjQUFJLFFBQVEsU0FBUyxHQUFHO0FBQ3BCLGlCQUFLLFFBQVEsQ0FBQyxXQUFXLE1BQUk7QUFDekIsd0JBQVUsUUFBUSxDQUFDLFFBQU07QUFDckIscUJBQUssS0FBSyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUM7QUFBQSxjQUNwQyxDQUFDO0FBQUEsWUFDTCxDQUFDO0FBQUEsVUFDTCxPQUFPO0FBQ0gsaUJBQUssUUFBUSxTQUFTLEtBQUs7QUFDdkIsbUJBQUssS0FBSyxPQUFPLEtBQUssT0FBTztBQUFBLFlBQ2pDLENBQUM7QUFBQSxVQUNMO0FBQUEsUUFDSjtBQUVBLGFBQUssUUFBUTtBQUNiLGFBQUssS0FBSyxPQUFPLE9BQU87QUFDeEIsWUFBSSxLQUFLLFVBQVU7QUFDZixlQUFLLFNBQVMsTUFBTSxPQUFPO0FBQUEsUUFDL0I7QUFBQSxNQUNKLEdBN0JZO0FBOEJaLFVBQUksUUFBUSxRQUFRO0FBQ2hCLGdCQUFRLFFBQVEsT0FBTyxLQUFLLEtBQUs7QUFBQSxNQUNyQztBQUVBLFVBQUksS0FBSyxNQUFNO0FBQ1gsWUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJO0FBQ3ZCLGtCQUFRLE1BQU0sZ0VBQWdFO0FBQzlFLGtCQUFRLE1BQU0sd0JBQXdCLEtBQUssTUFBTSxLQUFLLEtBQUssTUFBTTtBQUNqRSxrQkFBUSxNQUFNLDhEQUE4RDtBQUFBLFFBQ2hGO0FBQ0EsY0FBTSxVQUFVLEtBQUssVUFBVSxDQUFDLEdBQUcsSUFBSSxNQUFNLFlBQVk7QUFHekQsWUFBSSxPQUFPLGFBQWEsS0FBSyxJQUFJLEdBQUc7QUFDaEMsY0FBSSxLQUFLLFFBQVEsT0FBTyxhQUFhLEtBQUssSUFBSSxNQUFNLEtBQUssTUFBTTtBQUMzRCxrQkFBTSxNQUFNLElBQUksTUFBTSx5Q0FBeUMsS0FBSyxJQUFJLHNDQUFzQztBQUM5RyxtQkFBTyxNQUFNLEdBQUc7QUFBQSxVQUNwQjtBQUNBLGlCQUFPLE9BQU8sT0FBTyxRQUFRLEtBQUssTUFBTSxRQUFRLEtBQUs7QUFBQSxRQUN6RDtBQUVBLGVBQU8sT0FBTyxPQUFPLFFBQVEsS0FBSyxNQUFNLEtBQUssTUFBTSxPQUFPLFFBQVEsU0FBUyxLQUFLO0FBQzVFLGNBQUksSUFBSyxRQUFPLE1BQU0sR0FBRztBQUN6QixpQkFBTyxhQUFhLEtBQUssSUFBSSxJQUFJLEtBQUs7QUFDdEMsaUJBQU8sS0FBSyxPQUFPLFFBQVEsS0FBSyxNQUFNLFFBQVEsS0FBSztBQUFBLFFBQ3ZELENBQUM7QUFBQSxNQUNMLFdBQVcsS0FBSyxRQUFRO0FBQ3BCLFlBQUksQ0FBQyxNQUFNLFFBQVEsS0FBSyxNQUFNLEdBQUc7QUFDN0IsZ0JBQU0sTUFBTSxJQUFJLE1BQU0sK0JBQStCO0FBQ3JELGlCQUFPLE1BQU0sR0FBRztBQUFBLFFBQ3BCO0FBQ0EsY0FBTSxPQUFPLEtBQUssT0FBTyxJQUFJLE1BQU0sWUFBWTtBQUMvQyxlQUFPLE9BQU8sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLO0FBQUEsTUFDOUMsV0FBVyxLQUFLLGNBQWMsWUFBWTtBQUN0QyxlQUFPLE9BQU8sTUFBTSxLQUFLLE1BQU0sQ0FBQyxHQUFHLEtBQUs7QUFBQSxNQUM1QyxPQUFPO0FBQ0gsZUFBTyxPQUFPLE1BQU0sS0FBSyxNQUFNLEtBQUs7QUFBQSxNQUN4QztBQUFBLElBQ0o7QUFBQTtBQUFBOzs7QUM5SUEsSUFBQUMsa0JBQUE7QUFBQSwrRUFBQUMsU0FBQTtBQUFBO0FBQUEsUUFBTSxZQUFZLFFBQVEsTUFBTTtBQUVoQyxRQUFJO0FBRUosUUFBSTtBQUVBLGVBQVMsUUFBUSxXQUFXO0FBQUEsSUFDaEMsU0FBUyxHQUFHO0FBQ1IsWUFBTTtBQUFBLElBQ1Y7QUFDQSxRQUFNQyxpQkFBZ0I7QUFDdEIsUUFBTSxlQUFlLFFBQVEsUUFBUSxFQUFFO0FBQ3ZDLFFBQU0sT0FBTyxRQUFRLE1BQU07QUFDM0IsUUFBTSx1QkFBdUI7QUFDN0IsUUFBTSxjQUFjO0FBQ3BCLFFBQU0sb0NBQW9DLFVBQVUsVUFBVSxNQUFJO0FBQUEsSUFBQyxHQUFHLHVMQUF1TDtBQUM3UCxRQUFNQyxVQUFTRixRQUFPLFVBQVUsU0FBUyxRQUFRO0FBQzdDLG1CQUFhLEtBQUssSUFBSTtBQUN0QixlQUFTLFVBQVUsQ0FBQztBQUNwQixXQUFLLFdBQVcsT0FBTyxXQUFXLE9BQU87QUFDekMsV0FBSyxTQUFTLElBQUlDLGVBQWMsT0FBTyxLQUFLO0FBQzVDLFdBQUssU0FBUyxJQUFJLE9BQU87QUFBQSxRQUNyQixPQUFPLEtBQUs7QUFBQSxNQUNoQixDQUFDO0FBQ0QsV0FBSyxjQUFjLENBQUM7QUFDcEIsV0FBSyxVQUFVO0FBQ2YsV0FBSyxjQUFjO0FBQ25CLFdBQUssYUFBYTtBQUNsQixXQUFLLGFBQWE7QUFHbEIsWUFBTSxLQUFLLEtBQUssdUJBQXVCLElBQUkscUJBQXFCLE1BQU07QUFDdEUsVUFBSSxPQUFPLHVCQUF3QixJQUFHLHlCQUF5QixPQUFPO0FBQ3RFLFdBQUssT0FBTyxHQUFHO0FBR2YsYUFBTyxlQUFlLE1BQU0sWUFBWTtBQUFBLFFBQ3BDLGNBQWM7QUFBQSxRQUNkLFlBQVk7QUFBQSxRQUNaLFVBQVU7QUFBQSxRQUNWLE9BQU8sR0FBRztBQUFBLE1BQ2QsQ0FBQztBQUNELFdBQUssV0FBVyxHQUFHO0FBQ25CLFdBQUssT0FBTyxHQUFHO0FBQ2YsV0FBSyxPQUFPLEdBQUc7QUFFZixXQUFLLGVBQWUsQ0FBQztBQUFBLElBQ3pCO0FBQ0EsSUFBQUMsUUFBTyxRQUFRO0FBQ2YsU0FBSyxTQUFTQSxTQUFRLFlBQVk7QUFDbEMsSUFBQUEsUUFBTyxVQUFVLG1CQUFtQixTQUFTLEtBQUs7QUFDOUMsWUFBTSxlQUFlLHdCQUFDQyxXQUFRO0FBQzFCLGdCQUFRLFNBQVMsTUFBSTtBQUNqQixVQUFBQSxPQUFNLFNBQVMsS0FBSztBQUNwQixVQUFBQSxPQUFNLFlBQVksR0FBRztBQUFBLFFBQ3pCLENBQUM7QUFBQSxNQUNMLEdBTHFCO0FBTXJCLFVBQUksS0FBSyxnQkFBZ0IsR0FBRztBQUN4QixxQkFBYSxLQUFLLFlBQVk7QUFDOUIsYUFBSyxlQUFlO0FBQUEsTUFDeEI7QUFDQSxXQUFLLFlBQVksUUFBUSxZQUFZO0FBQ3JDLFdBQUssWUFBWSxTQUFTO0FBQUEsSUFDOUI7QUFJQSxJQUFBRCxRQUFPLFVBQVUsV0FBVyxTQUFTLElBQUk7QUFDckMsWUFBTSxPQUFPO0FBQ2IsVUFBSSxLQUFLLGFBQWE7QUFDbEIsZ0JBQVEsU0FBUyxNQUFJLEdBQUcsSUFBSSxNQUFNLCtEQUErRCxDQUFDLENBQUM7QUFDbkc7QUFBQSxNQUNKO0FBQ0EsV0FBSyxjQUFjO0FBQ25CLFdBQUsscUJBQXFCLHlCQUF5QixTQUFTLEtBQUssV0FBVztBQUN4RSxZQUFJLEtBQUsscUJBQXFCLHVCQUF3QixhQUFZLEtBQUsscUJBQXFCO0FBQzVGLFlBQUksSUFBSyxRQUFPLEdBQUcsR0FBRztBQUN0QixhQUFLLE9BQU8sUUFBUSxXQUFXLFNBQVNFLE1BQUs7QUFDekMsY0FBSUEsTUFBSztBQUNMLGlCQUFLLE9BQU8sSUFBSTtBQUNoQixtQkFBTyxHQUFHQSxJQUFHO0FBQUEsVUFDakI7QUFFQSxlQUFLLGFBQWE7QUFFbEIsZUFBSyxPQUFPLEdBQUcsU0FBUyxTQUFTQSxNQUFLO0FBQ2xDLGlCQUFLLGFBQWE7QUFDbEIsaUJBQUssaUJBQWlCQSxJQUFHO0FBQ3pCLGlCQUFLLEtBQUssU0FBU0EsSUFBRztBQUFBLFVBQzFCLENBQUM7QUFDRCxlQUFLLE9BQU8sR0FBRyxnQkFBZ0IsU0FBUyxLQUFLO0FBQ3pDLGlCQUFLLEtBQUssZ0JBQWdCO0FBQUEsY0FDdEIsU0FBUyxJQUFJO0FBQUEsY0FDYixTQUFTLElBQUk7QUFBQSxZQUNqQixDQUFDO0FBQUEsVUFDTCxDQUFDO0FBRUQsZUFBSyxLQUFLLFNBQVM7QUFDbkIsZUFBSyxpQkFBaUIsSUFBSTtBQUMxQixhQUFHLE1BQU0sSUFBSTtBQUFBLFFBQ2pCLENBQUM7QUFBQSxNQUNMLENBQUM7QUFBQSxJQUNMO0FBQ0EsSUFBQUYsUUFBTyxVQUFVLFVBQVUsU0FBUyxVQUFVO0FBQzFDLFVBQUksVUFBVTtBQUNWLGFBQUssU0FBUyxRQUFRO0FBQ3RCO0FBQUEsTUFDSjtBQUNBLGFBQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxTQUFTLFdBQVM7QUFDeEMsYUFBSyxTQUFTLENBQUMsVUFBUTtBQUNuQixjQUFJLE9BQU87QUFDUCxtQkFBTyxLQUFLO0FBQUEsVUFDaEIsT0FBTztBQUNILG9CQUFRLElBQUk7QUFBQSxVQUNoQjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFXQSxJQUFBQSxRQUFPLFVBQVUsUUFBUSxTQUFTLFFBQVEsUUFBUSxVQUFVO0FBQ3hELFVBQUlDO0FBQ0osVUFBSTtBQUNKLFVBQUk7QUFDSixVQUFJO0FBQ0osVUFBSTtBQUNKLFVBQUksV0FBVyxRQUFRLFdBQVcsUUFBVztBQUN6QyxjQUFNLElBQUksVUFBVSw2Q0FBNkM7QUFBQSxNQUNyRSxXQUFXLE9BQU8sT0FBTyxXQUFXLFlBQVk7QUFDNUMsc0JBQWMsT0FBTyxpQkFBaUIsS0FBSyxxQkFBcUI7QUFDaEUsaUJBQVNBLFNBQVE7QUFFakIsWUFBSSxPQUFPLFdBQVcsWUFBWTtBQUM5QixpQkFBTyxXQUFXO0FBQUEsUUFDdEI7QUFBQSxNQUNKLE9BQU87QUFDSCxzQkFBYyxPQUFPLGlCQUFpQixLQUFLLHFCQUFxQjtBQUNoRSxRQUFBQSxTQUFRLElBQUksWUFBWSxRQUFRLFFBQVEsUUFBUTtBQUNoRCxZQUFJLENBQUNBLE9BQU0sVUFBVTtBQUNqQixjQUFJLFlBQVk7QUFDaEIsbUJBQVMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxTQUFTLFdBQVM7QUFDMUMseUJBQWE7QUFDYix3QkFBWTtBQUFBLFVBQ2hCLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBTTtBQUNaLGtCQUFNLGtCQUFrQixHQUFHO0FBQzNCLGtCQUFNO0FBQUEsVUFDVixDQUFDO0FBQ0QsVUFBQUEsT0FBTSxXQUFXLENBQUMsS0FBSyxRQUFNLE1BQU0sVUFBVSxHQUFHLElBQUksV0FBVyxHQUFHO0FBQUEsUUFDdEU7QUFBQSxNQUNKO0FBQ0EsVUFBSSxhQUFhO0FBQ2Isd0JBQWdCQSxPQUFNLGFBQWEsTUFBSTtBQUFBLFFBQUM7QUFDeEMsMkJBQW1CLFdBQVcsTUFBSTtBQUM5QixnQkFBTSxRQUFRLElBQUksTUFBTSxvQkFBb0I7QUFDNUMsa0JBQVEsU0FBUyxNQUFJO0FBQ2pCLFlBQUFBLE9BQU0sWUFBWSxPQUFPLEtBQUssVUFBVTtBQUFBLFVBQzVDLENBQUM7QUFDRCx3QkFBYyxLQUFLO0FBR25CLFVBQUFBLE9BQU0sV0FBVyxNQUFJO0FBQUEsVUFBQztBQUV0QixnQkFBTSxRQUFRLEtBQUssWUFBWSxRQUFRQSxNQUFLO0FBQzVDLGNBQUksUUFBUSxJQUFJO0FBQ1osaUJBQUssWUFBWSxPQUFPLE9BQU8sQ0FBQztBQUFBLFVBQ3BDO0FBQ0EsZUFBSyxpQkFBaUI7QUFBQSxRQUMxQixHQUFHLFdBQVc7QUFDZCxRQUFBQSxPQUFNLFdBQVcsQ0FBQyxLQUFLLFFBQU07QUFDekIsdUJBQWEsZ0JBQWdCO0FBQzdCLHdCQUFjLEtBQUssR0FBRztBQUFBLFFBQzFCO0FBQUEsTUFDSjtBQUNBLFVBQUksQ0FBQyxLQUFLLFlBQVk7QUFDbEIsUUFBQUEsT0FBTSxTQUFTLEtBQUs7QUFDcEIsZ0JBQVEsU0FBUyxNQUFJO0FBQ2pCLFVBQUFBLE9BQU0sWUFBWSxJQUFJLE1BQU0sZ0VBQWdFLENBQUM7QUFBQSxRQUNqRyxDQUFDO0FBQ0QsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLEtBQUssU0FBUztBQUNkLFFBQUFBLE9BQU0sU0FBUyxLQUFLO0FBQ3BCLGdCQUFRLFNBQVMsTUFBSTtBQUNqQixVQUFBQSxPQUFNLFlBQVksSUFBSSxNQUFNLHdDQUF3QyxDQUFDO0FBQUEsUUFDekUsQ0FBQztBQUNELGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxLQUFLLFlBQVksU0FBUyxHQUFHO0FBQzdCLDBDQUFrQztBQUFBLE1BQ3RDO0FBQ0EsV0FBSyxZQUFZLEtBQUtBLE1BQUs7QUFDM0IsV0FBSyxpQkFBaUI7QUFDdEIsYUFBTztBQUFBLElBQ1g7QUFFQSxJQUFBRCxRQUFPLFVBQVUsTUFBTSxTQUFTLElBQUk7QUFDaEMsWUFBTSxPQUFPO0FBQ2IsV0FBSyxVQUFVO0FBQ2YsVUFBSSxLQUFLLGVBQWUsQ0FBQyxLQUFLLFlBQVk7QUFDdEMsYUFBSyxLQUFLLFdBQVcsTUFBSTtBQUNyQixlQUFLLElBQUksTUFBSTtBQUFBLFVBQUMsQ0FBQztBQUFBLFFBQ25CLENBQUM7QUFBQSxNQUNMO0FBQ0EsVUFBSTtBQUNKLFVBQUksQ0FBQyxJQUFJO0FBQ0wsaUJBQVMsSUFBSSxLQUFLLFNBQVMsU0FBUyxTQUFTLFFBQVE7QUFDakQsZUFBSyx3QkFBQyxRQUFNLE1BQU0sT0FBTyxHQUFHLElBQUksUUFBUSxHQUFuQztBQUFBLFFBQ1QsQ0FBQztBQUFBLE1BQ0w7QUFDQSxXQUFLLE9BQU8sSUFBSSxXQUFXO0FBQ3ZCLGFBQUssYUFBYTtBQUNsQixhQUFLLGlCQUFpQixJQUFJLE1BQU0sdUJBQXVCLENBQUM7QUFDeEQsZ0JBQVEsU0FBUyxNQUFJO0FBQ2pCLGVBQUssS0FBSyxLQUFLO0FBQ2YsY0FBSSxHQUFJLElBQUc7QUFBQSxRQUNmLENBQUM7QUFBQSxNQUNMLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLElBQUFBLFFBQU8sVUFBVSxrQkFBa0IsV0FBVztBQUMxQyxhQUFPLEtBQUssZ0JBQWdCLEtBQUssYUFBYSxVQUFVLFdBQVcsS0FBSyxhQUFhLFVBQVU7QUFBQSxJQUNuRztBQUNBLElBQUFBLFFBQU8sVUFBVSxtQkFBbUIsU0FBUyxtQkFBbUI7QUFDNUQsVUFBSSxDQUFDLEtBQUssWUFBWTtBQUNsQjtBQUFBLE1BQ0o7QUFDQSxVQUFJLEtBQUssZ0JBQWdCLEdBQUc7QUFDeEI7QUFBQSxNQUNKO0FBQ0EsWUFBTUMsU0FBUSxLQUFLLFlBQVksTUFBTTtBQUNyQyxVQUFJLENBQUNBLFFBQU87QUFDUixZQUFJLENBQUMsbUJBQW1CO0FBQ3BCLGVBQUssS0FBSyxPQUFPO0FBQUEsUUFDckI7QUFDQTtBQUFBLE1BQ0o7QUFDQSxXQUFLLGVBQWVBO0FBQ3BCLE1BQUFBLE9BQU0sT0FBTyxJQUFJO0FBQ2pCLFlBQU0sT0FBTztBQUNiLE1BQUFBLE9BQU0sS0FBSyxTQUFTLFdBQVc7QUFDM0IsYUFBSyxpQkFBaUI7QUFBQSxNQUMxQixDQUFDO0FBQUEsSUFDTDtBQUVBLElBQUFELFFBQU8sVUFBVSxTQUFTLFNBQVNDLFFBQU87QUFDdEMsVUFBSSxLQUFLLGlCQUFpQkEsUUFBTztBQUM3QixhQUFLLE9BQU8sT0FBTyxXQUFXO0FBQUEsUUFBQyxDQUFDO0FBQUEsTUFDcEMsV0FBVyxLQUFLLFlBQVksUUFBUUEsTUFBSyxNQUFNLElBQUk7QUFDL0MsYUFBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLFFBQVFBLE1BQUssR0FBRyxDQUFDO0FBQUEsTUFDOUQ7QUFBQSxJQUNKO0FBQ0EsSUFBQUQsUUFBTyxVQUFVLE1BQU0sV0FBVztBQUFBLElBQUM7QUFDbkMsSUFBQUEsUUFBTyxVQUFVLFFBQVEsV0FBVztBQUFBLElBQUM7QUFDckMsSUFBQUEsUUFBTyxVQUFVLGdCQUFnQixTQUFTLEtBQUssUUFBUSxTQUFTO0FBQzVELGFBQU8sS0FBSyxPQUFPLGNBQWMsS0FBSyxRQUFRLE9BQU87QUFBQSxJQUN6RDtBQUNBLElBQUFBLFFBQU8sVUFBVSxnQkFBZ0IsU0FBUyxLQUFLLFFBQVE7QUFDbkQsYUFBTyxLQUFLLE9BQU8sY0FBYyxLQUFLLE1BQU07QUFBQSxJQUNoRDtBQUNBLElBQUFBLFFBQU8sVUFBVSxjQUFjLFdBQVc7QUFDdEMsYUFBTyxLQUFLO0FBQUEsSUFDaEI7QUFDQSxJQUFBQSxRQUFPLFVBQVUsdUJBQXVCLFdBQVc7QUFDL0MsYUFBTyxLQUFLLE9BQU8scUJBQXFCO0FBQUEsSUFDNUM7QUFBQTtBQUFBOzs7QUNoUkE7QUFBQSw4RUFBQUcsU0FBQTtBQUFBO0FBQ0EsSUFBQUEsUUFBTyxVQUFVO0FBQUE7QUFBQTs7O0FDRGpCLElBQUFDLGVBQUE7QUFBQSx1RUFBQUMsU0FBQTtBQUFBO0FBQ0EsUUFBTUMsVUFBUztBQUNmLFFBQU1DLFlBQVc7QUFDakIsUUFBTUMsY0FBYTtBQUNuQixRQUFNQyxVQUFTO0FBQ2YsUUFBTSxRQUFRO0FBQ2QsUUFBTUMsUUFBTztBQUNiLFFBQU1DLGlCQUFnQjtBQUN0QixRQUFNLEVBQUUsZUFBQUMsZUFBYyxJQUFJO0FBQzFCLFFBQU0sRUFBRSxrQkFBQUMsbUJBQWtCLGVBQUFDLGVBQWMsSUFBSTtBQUM1QyxRQUFNLGNBQWMsd0JBQUNSLFlBQVM7QUFDMUIsYUFBTyxNQUFNLGtCQUFrQkksTUFBSztBQUFBLFFBWHhDLE9BV3dDO0FBQUE7QUFBQTtBQUFBLFFBQ2hDLFlBQVksU0FBUTtBQUNoQixnQkFBTSxTQUFTSixPQUFNO0FBQUEsUUFDekI7QUFBQSxNQUNKO0FBQUEsSUFDSixHQU5vQjtBQU9wQixRQUFNLEtBQUssZ0NBQVNTLG9CQUFtQjtBQUNuQyxXQUFLLFdBQVdSO0FBQ2hCLFdBQUssU0FBU1E7QUFDZCxXQUFLLFFBQVEsS0FBSyxPQUFPO0FBQ3pCLFdBQUssT0FBTyxZQUFZLEtBQUssTUFBTTtBQUNuQyxXQUFLLFNBQVMsQ0FBQztBQUNmLFdBQUssYUFBYVA7QUFDbEIsV0FBSyxRQUFRO0FBQ2IsV0FBSyxnQkFBZ0JJO0FBQ3JCLFdBQUssZ0JBQWdCRDtBQUNyQixXQUFLLG1CQUFtQkU7QUFDeEIsV0FBSyxnQkFBZ0JDO0FBQ3JCLFdBQUssU0FBU0w7QUFDZCxXQUFLLFFBQVE7QUFBQSxJQUNqQixHQWRXO0FBZVgsUUFBSSxvQkFBb0JIO0FBQ3hCLFFBQUksY0FBYztBQUNsQixRQUFJO0FBQ0Esb0JBQWMsQ0FBQyxDQUFDLFFBQVEsSUFBSTtBQUFBLElBQ2hDLFFBQVM7QUFBQSxJQUVUO0FBQ0EsUUFBSSxhQUFhO0FBQ2IsMEJBQW9CO0FBQUEsSUFDeEI7QUFDQSxJQUFBRCxRQUFPLFVBQVUsSUFBSSxHQUFHLGlCQUFpQjtBQUV6QyxXQUFPLGVBQWVBLFFBQU8sU0FBUyxVQUFVO0FBQUEsTUFDNUMsY0FBYztBQUFBLE1BQ2QsWUFBWTtBQUFBLE1BQ1osTUFBTztBQUNILFlBQUksU0FBUztBQUNiLFlBQUk7QUFDQSxtQkFBUyxJQUFJLEdBQUcsZ0JBQW1CO0FBQUEsUUFDdkMsU0FBUyxLQUFLO0FBQ1YsY0FBSSxJQUFJLFNBQVMsb0JBQW9CO0FBQ2pDLGtCQUFNO0FBQUEsVUFDVjtBQUFBLFFBQ0o7QUFFQSxlQUFPLGVBQWVBLFFBQU8sU0FBUyxVQUFVO0FBQUEsVUFDNUMsT0FBTztBQUFBLFFBQ1gsQ0FBQztBQUNELGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQTs7O0FDN0RELGlCQUFlO0FBRVIsSUFBTSxTQUFTLFdBQUFXLFFBQUc7QUFDbEIsSUFBTSxPQUFPLFdBQUFBLFFBQUc7QUFDaEIsSUFBTSxhQUFhLFdBQUFBLFFBQUc7QUFDdEIsSUFBTSxRQUFRLFdBQUFBLFFBQUc7QUFDakIsSUFBTSxRQUFRLFdBQUFBLFFBQUc7QUFDakIsSUFBTSxnQkFBZ0IsV0FBQUEsUUFBRztBQUN6QixJQUFNLG1CQUFtQixXQUFBQSxRQUFHO0FBQzVCLElBQU0sZ0JBQWdCLFdBQUFBLFFBQUc7QUFDekIsSUFBTSxTQUFTLFdBQUFBLFFBQUc7QUFDbEIsSUFBTSxnQkFBZ0IsV0FBQUEsUUFBRztBQUV6QixJQUFNLFdBQVcsV0FBQUEsUUFBRzs7O0FDYjNCLElBQUksT0FBTztBQUdQLFNBQVMsVUFBVTtBQUNuQixNQUFJLENBQUMsTUFBTTtBQUNQLFVBQU0sbUJBQW1CLFFBQVEsSUFBSTtBQUNyQyxRQUFJLENBQUMsa0JBQWtCO0FBQ25CLFlBQU0sSUFBSSxNQUFNLDhDQUE4QztBQUFBLElBQ2xFO0FBQ0EsV0FBTyxJQUFJLEtBQUs7QUFBQSxNQUNaO0FBQUEsTUFDQSxLQUFLO0FBQUEsTUFDTCxtQkFBbUI7QUFBQSxNQUNuQix5QkFBeUI7QUFBQSxJQUM3QixDQUFDO0FBQ0QsU0FBSyxHQUFHLFNBQVMsQ0FBQyxRQUFNO0FBQ3BCLGNBQVEsTUFBTSx3Q0FBd0MsR0FBRztBQUFBLElBQzdELENBQUM7QUFBQSxFQUNMO0FBQ0EsU0FBTztBQUNYO0FBakJhO0FBb0JULGVBQXNCLE1BQU0sTUFBTSxRQUFRO0FBQzFDLFFBQU0sU0FBUyxNQUFNLFFBQVEsRUFBRSxRQUFRO0FBQ3ZDLE1BQUk7QUFDQSxXQUFPLE1BQU0sT0FBTyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzFDLFVBQUU7QUFDRSxXQUFPLFFBQVE7QUFBQSxFQUNuQjtBQUNKO0FBUDBCOzs7QUNFdEIsZUFBc0IsT0FBTyxPQUFPO0FBQ3BDLFFBQU0sU0FBUyxNQUFNLE1BQU0sNkNBQTZDO0FBQUEsSUFDcEU7QUFBQSxFQUNKLENBQUM7QUFDRCxNQUFJLE9BQU8sS0FBSyxXQUFXLEdBQUc7QUFDMUIsV0FBTztBQUFBLEVBQ1g7QUFDQSxTQUFPLFlBQVksT0FBTyxLQUFLLENBQUMsQ0FBQztBQUNyQztBQVIwQjtBQW1IdEIsZUFBc0IsdUJBQXVCLE9BQU8saUJBQWlCLHdCQUF3QjtBQUU3RixRQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUs7QUFDOUIsTUFBSSxDQUFDLEtBQUs7QUFDTixVQUFNLElBQUksTUFBTSxrQkFBa0IsS0FBSyxFQUFFO0FBQUEsRUFDN0M7QUFDQSxNQUFJLENBQUMsSUFBSSxtQkFBbUI7QUFDeEIsVUFBTSxJQUFJLE1BQU0saUVBQWlFLEtBQUssRUFBRTtBQUFBLEVBQzVGO0FBRUEsUUFBTSxxQkFBcUI7QUFBQSxJQUN2QixHQUFHLElBQUk7QUFBQSxJQUNQLHVCQUF1QjtBQUFBLElBQ3ZCLGlCQUFpQjtBQUFBLE1BQ2IsR0FBRyxJQUFJLGtCQUFrQixtQkFBbUIsQ0FBQztBQUFBLE1BQzdDLEdBQUc7QUFBQSxJQUNQO0FBQUEsRUFDSjtBQUVBLFFBQU0sU0FBUyxNQUFNLE1BQU07QUFBQTtBQUFBO0FBQUEsa0JBR2I7QUFBQSxJQUNWO0FBQUEsSUFDQSxLQUFLLFVBQVUsa0JBQWtCO0FBQUEsSUFDakM7QUFBQSxFQUNKLENBQUM7QUFDRCxNQUFJLE9BQU8sS0FBSyxXQUFXLEdBQUc7QUFDMUIsVUFBTSxJQUFJLE1BQU0seUJBQXlCLEtBQUssRUFBRTtBQUFBLEVBQ3BEO0FBQ0EsU0FBTyxZQUFZLE9BQU8sS0FBSyxDQUFDLENBQUM7QUFDckM7QUEvQjBCO0FBa0NmLFNBQVMsWUFBWSxLQUFLO0FBQ2pDLFNBQU87QUFBQSxJQUNILElBQUksSUFBSTtBQUFBLElBQ1IsUUFBUSxJQUFJO0FBQUEsSUFDWixZQUFZLElBQUk7QUFBQSxJQUNoQixlQUFlLElBQUk7QUFBQSxJQUNuQixjQUFjLElBQUk7QUFBQSxJQUNsQixnQkFBZ0IsSUFBSTtBQUFBLElBQ3BCLGdCQUFnQixJQUFJO0FBQUEsSUFDcEIsbUJBQW1CLElBQUk7QUFBQSxJQUN2QixrQkFBa0IsSUFBSSxvQkFBb0I7QUFBQSxJQUMxQyxzQkFBc0IsSUFBSTtBQUFBLElBQzFCLGVBQWUsSUFBSTtBQUFBLElBQ25CLGNBQWMsSUFBSTtBQUFBLElBQ2xCLHVCQUF1QixJQUFJLHdCQUF3QixJQUFJLEtBQUssSUFBSSxxQkFBcUIsSUFBSTtBQUFBLElBQ3pGLGlCQUFpQixJQUFJO0FBQUEsSUFDckIsMEJBQTBCLElBQUk7QUFBQSxJQUM5QixnQkFBZ0IsSUFBSTtBQUFBLElBQ3BCLFlBQVksSUFBSSxLQUFLLElBQUksVUFBVTtBQUFBLElBQ25DLFlBQVksSUFBSSxLQUFLLElBQUksVUFBVTtBQUFBLElBQ25DLGNBQWMsSUFBSSxlQUFlLElBQUksS0FBSyxJQUFJLFlBQVksSUFBSTtBQUFBLEVBQ2xFO0FBQ0o7QUF0Qm9COzs7QUNwS1QsSUFBSSxtQkFBbUIsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsNEVBQTRFOzs7QUNKL0ksSUFBSSxrQkFBa0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsMkVBQTJFOzs7QUNHcEosZUFBc0IsaUJBQWlCLFNBQVM7QUFDaEQsVUFBUSxJQUFJLDBDQUEwQyxRQUFRLE1BQU0sV0FBVyxRQUFRLGFBQWEsRUFBRTtBQUN0RyxNQUFJO0FBRUEsUUFBSSxDQUFDLFFBQVEsUUFBUTtBQUNqQixZQUFNLElBQUksTUFBTSxvQkFBb0I7QUFBQSxJQUN4QztBQUNBLFFBQUksQ0FBQyxRQUFRLGVBQWU7QUFDeEIsWUFBTSxJQUFJLE1BQU0sMkJBQTJCO0FBQUEsSUFDL0M7QUFDQSxRQUFJLENBQUMsUUFBUSxnQkFBZ0I7QUFDekIsWUFBTSxJQUFJLE1BQU0sNEJBQTRCO0FBQUEsSUFDaEQ7QUFDQSxRQUFJLENBQUMsUUFBUSxtQkFBbUI7QUFDNUIsWUFBTSxJQUFJLE1BQU0sK0JBQStCO0FBQUEsSUFDbkQ7QUFFQSxZQUFRLElBQUksd0NBQXdDLFFBQVEsTUFBTSxFQUFFO0FBQ3BFLFVBQU0sTUFBTSxNQUFNLE9BQU8sUUFBUSxNQUFNO0FBQ3ZDLFFBQUksQ0FBQyxLQUFLO0FBQ04sWUFBTSxJQUFJLE1BQU0sa0JBQWtCLFFBQVEsTUFBTSxFQUFFO0FBQUEsSUFDdEQ7QUFFQSxRQUFJLElBQUksV0FBVyxhQUFhO0FBQzVCLFlBQU0sSUFBSSxNQUFNLGtCQUFrQixJQUFJLE1BQU0sb0RBQW9EO0FBQUEsSUFDcEc7QUFDQSxRQUFJLENBQUMsSUFBSSxtQkFBbUI7QUFDeEIsWUFBTSxJQUFJLE1BQU0sNkNBQTZDLElBQUksTUFBTSxFQUFFO0FBQUEsSUFDN0U7QUFNQSxVQUFNLGNBQWMsSUFBSTtBQUN4QixRQUFJLGVBQWUsUUFBUSwwQkFBMEIsWUFBWSx5QkFBeUIsWUFBWSxrQkFBa0IsSUFBSTtBQUM1SCxRQUFJLENBQUMsZ0JBQWdCLE9BQU8saUJBQWlCLFVBQVU7QUFDbkQsWUFBTSxJQUFJLE1BQU0sMEVBQTBFO0FBQUEsSUFDOUY7QUFFQSxtQkFBZSxhQUFhLEtBQUs7QUFDakMsUUFBSSxDQUFDLGdCQUFnQixhQUFhLFdBQVcsR0FBRztBQUM1QyxZQUFNLElBQUksTUFBTSx5Q0FBeUM7QUFBQSxJQUM3RDtBQUNBLFlBQVEsSUFBSSxpREFBaUQsYUFBYSxNQUFNLFFBQVE7QUFHeEYsVUFBTSxtQkFBbUI7QUFBQSxNQUNyQjtBQUFBLFFBQ0ksS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDSSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNJLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0ksS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDSSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNJLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0ksS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDSSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNJLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0ksS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBQ0EsVUFBTSxnQkFBZ0IsQ0FBQztBQUN2QixVQUFNLGdCQUFnQixvQkFBSSxJQUFJO0FBRTlCLGVBQVcsRUFBRSxLQUFLLE1BQU0sS0FBSyxrQkFBaUI7QUFDMUMsWUFBTSxRQUFRLFFBQVEsa0JBQWtCLEdBQUc7QUFDM0MsVUFBSSxTQUFTLE9BQU8sVUFBVSxVQUFVO0FBQ3BDLGNBQU0sZUFBZSxNQUFNLEtBQUs7QUFDaEMsWUFBSSxjQUFjO0FBQ2Qsd0JBQWMsS0FBSyxHQUFHLEtBQUs7QUFBQSxFQUFNLFlBQVksRUFBRTtBQUMvQyx3QkFBYyxJQUFJLEdBQUc7QUFBQSxRQUN6QjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBRUEsZUFBVyxDQUFDLEtBQUssS0FBSyxLQUFLLE9BQU8sUUFBUSxRQUFRLGlCQUFpQixHQUFFO0FBQ2pFLFVBQUksQ0FBQyxjQUFjLElBQUksR0FBRyxLQUFLLFNBQVMsT0FBTyxVQUFVLFVBQVU7QUFDL0QsY0FBTSxlQUFlLE1BQU0sS0FBSztBQUNoQyxZQUFJLGNBQWM7QUFFZCxnQkFBTSxRQUFRLElBQUksTUFBTSxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQU8sS0FBSyxPQUFPLENBQUMsRUFBRSxZQUFZLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRztBQUMvRix3QkFBYyxLQUFLLEdBQUcsS0FBSztBQUFBLEVBQU0sWUFBWSxFQUFFO0FBQUEsUUFDbkQ7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUNBLFFBQUksbUJBQW1CLGNBQWMsS0FBSyxNQUFNLEVBQUUsS0FBSztBQUN2RCxRQUFJLENBQUMsb0JBQW9CLGlCQUFpQixXQUFXLEdBQUc7QUFDcEQsWUFBTSxJQUFJLE1BQU0scUZBQXFGO0FBQUEsSUFDekc7QUFDQSxZQUFRLElBQUkscURBQXFELGlCQUFpQixNQUFNLFFBQVE7QUFFaEcsVUFBTSxRQUFRLElBQUksY0FBYyxPQUFPLElBQUksZUFBZSxXQUFXLElBQUksYUFBYTtBQUN0RixVQUFNLFdBQVcsWUFBWSxpQkFBaUI7QUFDOUMsVUFBTSxVQUFVLFlBQVksZ0JBQWdCO0FBQzVDLFVBQU0sUUFBUSxZQUFZLGVBQWU7QUFDekMsVUFBTSxPQUFPLFlBQVksYUFBYTtBQUV0QyxZQUFRLElBQUksK0NBQStDO0FBQzNELFVBQU0saUJBQWlCLE1BQU0sZ0JBQWdCLGNBQWMsa0JBQWtCLFFBQVEsZUFBZSxPQUFPLFVBQVUsU0FBUyxPQUFPLElBQUk7QUFDekksWUFBUSxJQUFJLHVFQUF1RSxlQUFlLGlCQUFpQixNQUFNLFFBQVE7QUFHakksVUFBTSxzQkFBc0IsWUFBWSxpQkFBaUIsZ0JBQWdCLFFBQVEsZ0JBQWdCO0FBQ2pHLFVBQU0saUJBQWlCLHNCQUFzQjtBQUM3QyxVQUFNLHlCQUF5QjtBQUFBLE1BQzNCLGVBQWU7QUFBQSxNQUNmLGNBQWM7QUFBQSxNQUNkLHVCQUF1QjtBQUFBLE1BQ3ZCLGVBQWUsUUFBUTtBQUFBLE1BQ3ZCLGdCQUFnQixRQUFRO0FBQUEsTUFDeEIsYUFBWSxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUFBLElBQ3ZDO0FBQ0EsWUFBUSxJQUFJLHNFQUFzRSxjQUFjLEVBQUU7QUFFbEcsVUFBTSx1QkFBdUIsUUFBUSxRQUFRLGVBQWUsa0JBQWtCLHNCQUFzQjtBQUNwRyxZQUFRLElBQUksb0VBQW9FO0FBRWhGLFVBQU0sVUFBVSxJQUFJLHdCQUF3QixRQUFRO0FBQ3BELFFBQUksU0FBUztBQUNULFVBQUk7QUFDQSxnQkFBUSxJQUFJLHlFQUF5RSxPQUFPLEVBQUU7QUFDOUYsY0FBTSxNQUFNLGdGQUFnRjtBQUFBLFVBQ3hGO0FBQUEsVUFDQTtBQUFBLFFBQ0osQ0FBQztBQUNELGdCQUFRLElBQUksNERBQTREO0FBQUEsTUFDNUUsU0FBUyxPQUFPO0FBQ1osY0FBTSxlQUFlLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFDMUUsZ0JBQVEsTUFBTSxpRUFBaUUsWUFBWSxxREFBcUQ7QUFBQSxNQUVwSjtBQUFBLElBQ0o7QUFFQSxZQUFRLElBQUksMkRBQTJEO0FBQ3ZFLFVBQU0saUJBQWlCLFFBQVEsUUFBUTtBQUFBLE1BQ25DLFlBQVk7QUFBQSxNQUNaLGdCQUFnQjtBQUFBLElBQ3BCLENBQUM7QUFDRCxZQUFRLElBQUksNENBQTRDLFFBQVEsTUFBTSxFQUFFO0FBQUEsRUFDNUUsU0FBUyxPQUFPO0FBQ1osVUFBTSxlQUFlLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFDMUUsWUFBUSxNQUFNLGlDQUFpQyxZQUFZLEVBQUU7QUFDN0QsVUFBTTtBQUFBLEVBQ1Y7QUFDSjtBQTVLMEI7QUE2SzFCLGlCQUFpQixhQUFhO0FBQzlCLFdBQVcsb0JBQW9CLElBQUksZ0ZBQWdGLGdCQUFnQjs7O0FDakx4SCxJQUFJLGtCQUFrQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSwyRUFBMkU7OztBQ0E3SSxJQUFJLGlCQUFpQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSx5RUFBeUU7OztBQ0ExSSxJQUFJLGdCQUFnQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSx1RUFBdUU7OztBQ0R2SSxJQUFJLGVBQWUsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsc0VBQXNFOzs7QUNDckksSUFBSSxnQkFBZ0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsdUVBQXVFOzs7QUNBdkksSUFBSSxjQUFjLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLG1FQUFtRTs7O0FDSGpJLElBQUkscUJBQXFCLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLHdFQUF3RTtBQUk3SSxJQUFJLG9CQUFvQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSx1RUFBdUU7QUFJM0ksSUFBSSxrQkFBa0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUscUVBQXFFOzs7QUNNbEosZUFBc0IsZ0JBQWdCLE9BQU8sT0FBTztBQUNoRCxVQUFRLElBQUksMENBQTBDLEtBQUssRUFBRTtBQUM3RCxNQUFJO0FBRUEsWUFBUSxJQUFJLHVDQUF1QztBQUNuRCxVQUFNLG1CQUFtQixLQUFLO0FBRTlCLFlBQVEsSUFBSSxxQ0FBcUM7QUFDakQsVUFBTSxpQkFBaUIsTUFBTSxnQkFBZ0IsT0FBTyxLQUFLO0FBQ3pELFlBQVEsSUFBSSxnREFBZ0Q7QUFFNUQsWUFBUSxJQUFJLG9DQUFvQztBQUNoRCxVQUFNLGdCQUFnQixNQUFNLGVBQWUsT0FBTyxPQUFPLGNBQWM7QUFDdkUsWUFBUSxJQUFJLCtDQUErQztBQUUzRCxZQUFRLElBQUksbUNBQW1DO0FBQy9DLFVBQU0sZUFBZSxNQUFNLGNBQWMsT0FBTyxPQUFPLGdCQUFnQixhQUFhO0FBQ3BGLFlBQVEsSUFBSSw4Q0FBOEM7QUFFMUQsWUFBUSxJQUFJLG1DQUFtQztBQUMvQyxVQUFNLGNBQWMsTUFBTSxhQUFhLE9BQU8sT0FBTyxnQkFBZ0IsZUFBZSxhQUFhLGNBQWM7QUFDL0csWUFBUSxJQUFJLDhDQUE4QztBQUUxRCxZQUFRLElBQUksbUNBQW1DO0FBQy9DLFVBQU0sZUFBZSxNQUFNLGNBQWMsT0FBTyxPQUFPLGdCQUFnQixlQUFlLGFBQWEsZ0JBQWdCLFdBQVc7QUFDOUgsWUFBUSxJQUFJLGdDQUFnQztBQUU1QyxZQUFRLElBQUksaUNBQWlDO0FBQzdDLFVBQU0sYUFBYSxNQUFNLFlBQVksT0FBTyxPQUFPLGdCQUFnQixlQUFlLGFBQWEsZ0JBQWdCLGFBQWEsYUFBYSxxQkFBcUI7QUFDOUosWUFBUSxJQUFJLDhCQUE4QjtBQUUxQyxZQUFRLElBQUksK0JBQStCO0FBQzNDLFVBQU0sY0FBYztBQUFBLE1BQ2hCLGVBQWU7QUFBQSxNQUNmLGNBQWM7QUFBQSxNQUNkLGdCQUFnQixhQUFhO0FBQUEsTUFDN0IsYUFBYTtBQUFBLE1BQ2IsdUJBQXVCLGFBQWE7QUFBQSxNQUNwQyxjQUFjLGFBQWE7QUFBQSxNQUMzQixjQUFjLGFBQWE7QUFBQSxNQUMzQixXQUFXO0FBQUEsTUFDWCx1QkFBdUI7QUFBQSxNQUN2QixpQkFBaUI7QUFBQSxNQUNqQixZQUFXLG9CQUFJLEtBQUssR0FBRSxZQUFZO0FBQUEsSUFDdEM7QUFDQSxVQUFNLGdCQUFnQixPQUFPLFdBQVc7QUFHeEMsWUFBUSxJQUFJLDRDQUE0QztBQUN4RCxRQUFJO0FBQ0EsWUFBTSxpQkFBaUIsS0FBSztBQUFBLElBQ2hDLFNBQVMsYUFBYTtBQUNsQixjQUFRLE1BQU0sNENBQTRDLHVCQUF1QixRQUFRLFlBQVksVUFBVSxPQUFPLFdBQVcsQ0FBQztBQUFBLElBRXRJO0FBQ0EsWUFBUSxJQUFJLHlEQUF5RCxLQUFLLEVBQUU7QUFBQSxFQUNoRixTQUFTLE9BQU87QUFDWixVQUFNLGVBQWUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUMxRSxZQUFRLE1BQU0sK0JBQStCLEtBQUssS0FBSyxZQUFZLEVBQUU7QUFDckUsUUFBSTtBQUNBLFlBQU0sa0JBQWtCLE9BQU8sWUFBWTtBQUFBLElBQy9DLFNBQVMsWUFBWTtBQUNqQixjQUFRLE1BQU0sc0NBQXNDLHNCQUFzQixRQUFRLFdBQVcsVUFBVSxPQUFPLFVBQVUsQ0FBQztBQUFBLElBQzdIO0FBR0EsWUFBUSxJQUFJLHlDQUF5QztBQUNyRCxRQUFJO0FBQ0EsWUFBTSxpQkFBaUIsS0FBSztBQUFBLElBQ2hDLFNBQVMsYUFBYTtBQUNsQixjQUFRLE1BQU0sNENBQTRDLHVCQUF1QixRQUFRLFlBQVksVUFBVSxPQUFPLFdBQVcsQ0FBQztBQUFBLElBRXRJO0FBRUEsVUFBTTtBQUFBLEVBQ1Y7QUFDSjtBQTVFc0I7QUE2RXRCLGdCQUFnQixhQUFhO0FBQzdCLFdBQVcsb0JBQW9CLElBQUksK0VBQStFLGVBQWU7IiwKICAibmFtZXMiOiBbIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAiYml0cyIsICJ2YWx1ZSIsICJlbGVtZW50VHlwZSIsICJpIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgImRlZmF1bHRzIiwgImVzY2FwZUlkZW50aWZpZXIiLCAiZXNjYXBlTGl0ZXJhbCIsICJyZXF1aXJlX3V0aWxzIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJ0eXBlcyIsICJUeXBlT3ZlcnJpZGVzIiwgIm1vZHVsZSIsICJjb25maWciLCAibW9kdWxlIiwgImRlZmF1bHRzIiwgIm1vZHVsZSIsICJ0eXBlcyIsICJSZXN1bHQiLCAibW9kdWxlIiwgIlJlc3VsdCIsICJRdWVyeSIsICJEYXRhYmFzZUVycm9yIiwgInBhc3N3b3JkIiwgInF1ZXJ5IiwgInR5cGVzIiwgIm1vZHVsZSIsICJnZXRTdHJlYW0iLCAiZ2V0U2VjdXJlU3RyZWFtIiwgIm1vZHVsZSIsICJDb25uZWN0aW9uIiwgInN0cmVhbSIsICJxdWVyeSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAiVHlwZU92ZXJyaWRlcyIsICJRdWVyeSIsICJkZWZhdWx0cyIsICJDb25uZWN0aW9uIiwgIkNsaWVudCIsICJxdWVyeSIsICJtb2R1bGUiLCAiUHJvbWlzZSIsICJwb29sIiwgIlBvb2wiLCAiQ2xpZW50IiwgImNsaWVudCIsICJyZXNwb25zZSIsICJlcnIiLCAicmVxdWlyZV9xdWVyeSIsICJtb2R1bGUiLCAicmVxdWlyZV9jbGllbnQiLCAibW9kdWxlIiwgIlR5cGVPdmVycmlkZXMiLCAiQ2xpZW50IiwgInF1ZXJ5IiwgImVyciIsICJtb2R1bGUiLCAicmVxdWlyZV9saWIiLCAibW9kdWxlIiwgIkNsaWVudCIsICJkZWZhdWx0cyIsICJDb25uZWN0aW9uIiwgIlJlc3VsdCIsICJQb29sIiwgIlR5cGVPdmVycmlkZXMiLCAiRGF0YWJhc2VFcnJvciIsICJlc2NhcGVJZGVudGlmaWVyIiwgImVzY2FwZUxpdGVyYWwiLCAiY2xpZW50Q29uc3RydWN0b3IiLCAicGciXQp9Cg==
`;

const handler = workflowEntrypoint(workflowCode);

export const HEAD = handler;
export const POST = handler;