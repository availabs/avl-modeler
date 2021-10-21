const { format } = require("d3-format");

export function fnum(x, withDollar=true, roundUnder10K=false) {
    if(isNaN(x)) return x;

    if(x < 9999 && !roundUnder10K) {
        const frmt = format(withDollar ? "$,.0f" : ",.0f")
        return frmt(x);
    }
    if (x > 999 && x < 9999 && roundUnder10K) {
        const frmt = format(withDollar ? "$,.0f" : ",.0f")
        return frmt(x/1000) + "K";
    }

    if(x < 1000000) {
        const frmt = format(withDollar ? "$,.0f" : ",.0f")
        return frmt(x/1000) + "K";
    }
    if( x < 10000000) {
        const frmt = format(withDollar ? "$,.2f" : ",.2f")
        return frmt(x/1000000) + "M";
    }

    if(x < 1000000000) {
        const frmt = format(withDollar ? "$,.1f" : ",.1f")
        return frmt(x/1000000) + "M";
    }

    if(x < 1000000000000) {
        const frmt = format(withDollar ? "$,.1f" : ",.1f")
        return frmt(x/1000000000) + "B";
    }

    return "$1T+";
}