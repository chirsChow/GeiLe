Number.prototype.to_Fixed = function(len) {
     var add = 0;
     var s, temp;
     var s1 = this + "";
     var start = s1.indexOf(".");
     if (s1.substr(start + len + 1, 1) >= 5) add = 1;
     var temp = Math.pow(10, len);
     s = Math.floor(this * temp) + add;
     return s / temp;
};
