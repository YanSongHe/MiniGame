window.utils =
{
    exitGame:function(url)
    {
        if(cc.sys.isNative)
        {
            if(cc.sys.os == cc.sys.OS_IOS)
            {
                jsb.reflection.callStaticMethod("AppController", "exitGame");
            }
            else
            {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "exitGame", "()V");
            }
        }
        else
        {
            if(url != undefined && cc.js.isString(url))
                location.replace(url);
            else
                location.reload();
        }
    },

    formatD:function(count, num)
    {
        var str = num.toString();
        var strLen = str.length;
        while(count > strLen)
        {
            str = "0" + str;
            count--;
        }
        return str;
    },

    getUrlParams:function()
    {
        if(!cc.sys.isBrowser)
            return {};

        if(this.urlParams == null)
        {
            this.urlParams = {};
            var url = window.location.href;
            var tmp = url.split("?");
            if(tmp.length > 1)
            {
                tmp = tmp[1].split("&");
                for(var i = 0; i < tmp.length; ++i)
                {
                    var param = tmp[i].split("=");
                    this.urlParams [param[0]] = param[1];
                }
            }
        }

        return this.urlParams;
    },

    randomInt : function(min, max)
    {
        return Math.floor(min + Math.random() * (max - min + 1));
    },

    random : function(min, max)
    {
        return min + Math.random() * (max - min)
    },

    //二维数组转换为字符串
    getStringFromTDArray: function getStringFromTDArray(tdArray, char1, char2) {
        var string = "";

        cc.each(tdArray, function (list, num1) {
            cc.each(list, function (str, num2) {
                string += str == null ? "" : str.toString();

                if (num2 < list.length - 1) string += char1;
            }, this);

            if (num1 < tdArray.length - 1) string += char2;
        }, this);

        return string;
    },

    //字符串转换为二维数组(数组存的是数字和null)
    getTDArrayFromString: function getTDArrayFromString(string, char1, char2) {
        var tdArray = [];

        var strArray = string.split(char2);
        for (var i = 0; i < strArray.length; i++) {
            var pushArray = [];
            var array = strArray[i].split(char1);
            for (var j = 0; j < array.length; j++) {
                var str = array[j];
                pushArray.push(str == "" ? null : parseInt(str));
            }

            tdArray.push(pushArray);
        }

        return tdArray;
    },

    splitNumber : function(number)
    {
        var str = number.toString();
        var sign = str.charAt(0);
        if(sign == "-" || sign == "+")
        {
            str = str.substr(1);
        }
        else
        {
            sign = "";
        }

        var tmp = str.split(".");
        if(tmp.length > 1)
        {
            tmp[0] = utils.splitNumber(tmp[0]);
            return sign + tmp.join(".");
        }
        else
        {
            tmp = [];
            while(str.length > 3)
            {
                tmp.unshift(str.substr(str.length - 3));
                str = str.substr(0, str.length - 3);
            }
            tmp.unshift(str);

            str = tmp.join(",");
            str = sign + str;
            return str;
        }
    },

    stringRepeat : function(src, count)
    {
        var ret = src;
        while(count > 1)
        {
            --count;
            ret += src;
        }

        return ret;
    },

    getDataFromExtend : function(extend, name, char1, char2)
    {
        var reData = null;
        var dataList = extend.split(char1);
        cc.each(dataList, function(strData)
        {
            var data = strData.split(char2);
            if(data[0] == name)
                reData = data[1];
        }, this);

        return reData;
    },

    getQueryFromObj:function(data)
    {
        if(data == null)
            return null;

        var tmp = [];
        cc.each(data, function(v, k)
        {
            if(v != null)
                tmp.push("{0}={1}".format(k, v));
        });

        return tmp.join("&");
    }
};

/**
 * 替换所有匹配exp的字符串为指定字符串
 * @param exp 被替换部分的正则
 * @param newStr 替换成的字符串
 */
String.prototype.replaceAll = function (exp, newStr)
{
    return this.replace(new RegExp(exp, "gm"), newStr);
};

/**
 * 原型：字符串格式化
 * @param args 格式化参数值
 */
String.prototype.format = function(args)
{
    var result = this;
    if (arguments.length < 1) {
        return result;
    }

    var data = arguments;

    // 如果模板参数是数组
    // if (arguments.length == 1 && typeof (args) == "object") {
    //     // 如果模板参数是对象
    //     data = args;
    // }

    for(var key in data)
    {
        var value = data[key];
        if(value != null)
            result = result.replaceAll("\\{" + key + "\\}", value);
    }
    return result;
};

Array.prototype.removeElement = function(ele)
{
    var idx = this.indexOf(ele);
    if (idx == -1)
        return;

    return this.splice(idx, 1);
};

cc.each = function (obj, iterator, context)
{
    if (!obj)
        return;

    if (obj instanceof Array)
    {
        for (var i = 0, li = obj.length; i < li; i++)
        {
            if (iterator.call(context, obj[i], i) === false)
                return;
        }
    }
    else
    {
        for (var key in obj)
        {
            if (iterator.call(context, obj[key], key) === false)
                return;
        }
    }
};
