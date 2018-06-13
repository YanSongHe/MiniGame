var DEFAULT_LANG = "chn";

var I18N = cc.Class
({
    setLang:function(lang)
    {
        var _lang = DEFAULT_LANG;
        if(lang != null)
        {
            lang = lang.toLowerCase();
            _lang = lang;
        }

        this.lang = require(_lang);
    },

    setLangExtend:function (langExtend)
    {
        this.lang.extend = require(langExtend);
    },

    getTxt:function (key)
    {
        if(this.lang.hasOwnProperty(key))
            return this.lang[key];

        if(this.lang.extend && this.lang.extend.hasOwnProperty(key))
            return this.lang.extend[key];

        return "";
    },

    getDefaultFont:function ()
    {
        if(this.lang.hasOwnProperty("defaultFont"))
            return this.lang["defaultFont"];

        return "Microsoft YaHei";
    }
});

var i18n = new I18N();
i18n.setLang();

module.exports = i18n;