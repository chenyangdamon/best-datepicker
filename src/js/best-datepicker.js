/*!
 * JavaScript Components best-datepicker
 * @author : chenyangdamon
 * @email  : 645230634@qq.com
 * @github : https://github.com/chenyangdamon
 * @Date   : 2017-02-28 22:08:02
 */
;
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD模式
        define(["jquery"], factory);
    } else {
        // 全局模式
        factory.call(root, root.$);
    }
}(typeof window !== "undefined" ? window : this, function($) {
    /**
     * [VgDatepicker description]
     */
    var Datepicker = function() {
        /*
         * 默认配置项
         * */
        this.defaultOption = {
            /*
             * 绑定元素
             * */
            selector: ".best-datepicker-input",

            /*
             * 格式化 2020-10-21 13:30:12
             * */
            format: "yyyy-mm-dd hh:mm:ss",

            width: "240",
             /*
             * 是否支持jquery.validate校验
             * */
            bValid: false,

            /*
             * 底部bar
             * */
            showBar: true,

            /*
             * 区间范围选择
             * 默认false
             * */
            range: true

        };

        this.init.apply(this, arguments);
    };
    /**
     * [prototype description]
     * @type {Object}
     */
    Datepicker.prototype = {
        /**
         * [constructor description]
         * @type {String}
         */
        constructor: Datepicker,
        /**
         * 初始化
         * @param userOption
         */
        init: function(userOption) {

            var _this = this;

            _this.option = $.extend({}, _this.defaultOption, userOption);

            $(_this.option.selector).click(function(ev) {
                ev.stopPropagation();

                /*
                 * 如果已创建过日历，则全部销毁
                 * */
                if (_this.VgDatepicker) {
                    _this.VgDatepicker.remove();
                    delete _this.VgDatepicker;
                }
                if (_this.curActiveInput) {
                    delete _this.curActiveInput;
                }


                /*
                 * 存放当前input对象
                 * */
                _this.curActiveInput = $(this);
                /*
                 * 先判断是否有值，如果有则作为默认值显示，而不再是显示当前时间
                 * */
                var defaultVal = $.trim($(this).val());

                _this.defaultVal = defaultVal;

                _this.onLoad();
                //-----------------------------------------------------
                if (Object.prototype.toString.call(_this.option.range) === "[object Boolean]" && _this.option.range) {

                    _this.rangeType = $(this).data("range-type");

                    var parent = $(this).closest("[data-range-type='best-datepicker']");
                    var sibiling = null;
                    var sibilingVal = "";

                    /*
                     * 如果当前是开始时间
                     * */
                    if (_this.rangeType === "start") {
                        sibiling = parent.find("[data-range-type='end']");
                        sibilingVal = $.trim(sibiling.val());
                        /*
                         * 如果结束时间已经选择过值啦。则开始时间的最大值是结束时间的前一天
                         * */
                        if (sibilingVal !== "") {
                            _this.rangeVal = sibilingVal;
                            /*
                             * 如果有默认值
                             * */
                            if (_this.value) {
                                _this.curDate = new Date(_this.defaultVal);
                                _this.endDate = new Date(_this.curDate.getTime() + 1000 * 60 * 60 * 24);
                                _this.startDate = _this.curDate;
                            }

                            /*
                             * 没有默认值
                             * */
                            else {
                                _this.curDate = new Date((new Date(sibilingVal)).getTime() - 1000 * 60 * 60 * 24);
                                _this.endDate = new Date(sibilingVal);
                                _this.startDate = _this.curDate;
                            }

                        } else {
                            _this.startDate = _this.curDate;
                            _this.endDate = new Date(_this.curDate.getTime() + 1000 * 60 * 60 * 24);
                        }
                    }
                    /*
                     * 如果当前是结束时间
                     * */
                    else if (_this.rangeType === "end") {
                        sibiling = parent.find("[data-range-type='start']");
                        sibilingVal = $.trim(sibiling.val());

                        /*
                         * 如果开始时间已经选择过值啦。则结束时间的最小值是开始时间的后一天
                         * */

                        if (sibilingVal !== "") {
                            _this.rangeVal = sibilingVal;

                            /*
                             * 如果有默认值
                             * */
                            if (_this.value) {
                                _this.curDate = new Date(_this.defaultVal);
                            }
                            /*
                             * 没有默认值
                             * */
                            else {
                                _this.curDate = new Date((new Date(sibilingVal)).getTime() + 1000 * 60 * 60 * 24);
                                _this.endDate = _this.curDate;
                                _this.startDate = new Date(sibilingVal);
                            }
                        } else {
                            _this.startDate = new Date(_this.curDate.getTime() - 1000 * 60 * 60 * 24);
                            _this.endDate = _this.curDate;
                        }
                    }
                }
                //-----------------------------------------------------

                _this.renderHtml();
                _this.getVgDatepickerHtml();
                _this.bindEvent();

            });

        },

        /**
         * 预加载
         */
        onLoad: function() {

            var _this = this;

            var date = null;
            var defaultVal = $.trim(_this.defaultVal);

            if (defaultVal === "") {
                _this.curDate = new Date();
            } else if (Object.prototype.toString.call(defaultVal) === "[object String]") {
                _this.curDate = new Date(defaultVal);
            } else {
                _this.curDate = new Date();
            }


            /*
             * 年份列表开始
             * */
            _this.start = 0;

            /*
             * 年份列表结束
             * */
            _this.end = 0;

            _this.$selector = $(_this.option.selector);

            /*
             * 中心年份
             * */
            _this.centerYear = _this.curDate.getFullYear();
        },

        /**
         * 注册事件
         */
        bindEvent: function() {
            var _this = this;

            $(document).click(function() {
                if (_this.VgDatepicker) {
                    _this.VgDatepicker.remove();
                    delete _this.VgDatepicker;
                }
            });

            /*
             * 加载年份列表
             * */
            $(".best-datepicker .default-year").click(function(ev) {
                ev.stopPropagation();
                $(".best-datepicker-default").hide();
                $(".best-datepicker-panel").show();

                /*
                 * 加载年份数据
                 * */
                _this.showPanel("year", _this.centerYear);
            });

            /*
             * 加载月份列表
             * */
            $(".best-datepicker .default-month").click(function(ev) {
                ev.stopPropagation();
                $(".best-datepicker-default").hide();
                $(".best-datepicker-panel").show();

                /*
                 * 加载月份数据
                 * */
                _this.showPanel("month", _this.centerYear);

            });

            /*
             * 年份列表中选择一个年份
             * */
            $(".best-datepicker").on("click", ".year-list span", function(ev) {
                ev.stopPropagation();
                $(".best-datepicker-default").show();
                $(".best-datepicker-panel").hide();

                _this.curDate.setFullYear(parseInt($(this).data("val")));
                _this.centerYear = _this.curDate.getFullYear();

                /*
                 * 重新渲染日历
                 * */
                _this.getVgDatepickerHtml();


            });

            /*
             * 月份列表中选择一个月份
             * */
            $(".best-datepicker").on("click", ".month-list span", function(ev) {
                ev.stopPropagation();
                $(".best-datepicker-default").show();
                $(".best-datepicker-panel").hide();

                _this.curDate.setMonth(parseInt($(this).data("val")));
                /*
                 * 重新渲染日历
                 * */
                _this.getVgDatepickerHtml();
            });


            /*
             * 年份列表中上一组年份
             * */
            $(".best-datepicker").on("click", ".panel-year-left", function(ev) {
                ev.stopPropagation();
                _this.showPanel("year", _this.centerYear -= 15);

            });

            /*
             * 年份列表中下一组年份
             * */
            $(".best-datepicker").on("click", ".panel-year-right", function(ev) {
                ev.stopPropagation();

                _this.showPanel("year", _this.centerYear += 15);

            });

            /*
             * 月份列表中上一组月份
             * */
            $(".best-datepicker").on("click", ".panel-month-left", function(ev) {
                ev.stopPropagation();
                _this.showPanel("month", _this.curDate.getFullYear() - 1);

            });

            /*
             * 月份列表中下一组月份
             * */
            $(".best-datepicker").on("click", ".panel-month-right", function(ev) {
                ev.stopPropagation();
                _this.showPanel("month", _this.curDate.getFullYear() + 1);
            });

            /*
             * 默认日期中上一个年份
             * */
            $(".best-datepicker .arrow-left-year").click(function(ev) {
                ev.stopPropagation();
                _this.curDate.setFullYear(_this.curDate.getFullYear() - 1);
                _this.centerYear = _this.curDate.getFullYear();
                /*
                 * 重新渲染日历
                 * */
                _this.getVgDatepickerHtml();
            });

            /*
             * 默认日期中上一个月份
             * */
            $(".best-datepicker .arrow-left-month").click(function(ev) {
                ev.stopPropagation();

                _this.curDate.setMonth(_this.curDate.getMonth() - 1);

                if (_this.curDate.getMonth() < 0) {
                    _this.curDate.setMonth(11);
                    _this.curDate.setFullYear(_this.curDate.getFullYear() - 1);
                    _this.centerYear = _this.curDate.getFullYear();
                }
                /*
                 * 重新渲染日历
                 * */
                _this.getVgDatepickerHtml();
            });

            /*
             *  默认日期下一个年份
             * */
            $(".best-datepicker .arrow-right-year").click(function(ev) {
                ev.stopPropagation();
                _this.curDate.setFullYear(_this.curDate.getFullYear() + 1);
                _this.centerYear = _this.curDate.getFullYear();
                /*
                 * 重新渲染日历
                 * */
                _this.getVgDatepickerHtml();
            });

            /*
             *  默认日期下一个月份
             * */
            $(".best-datepicker .arrow-right-month").click(function(ev) {
                ev.stopPropagation();
                _this.curDate.setMonth(_this.curDate.getMonth() + 1);

                if (_this.curDate.getMonth() > 11) {
                    _this.curDate.setMonth(0);
                    _this.curDate.setFullYear(_this.curDate.getFullYear() + 1);
                    _this.centerYear = _this.curDate.getFullYear();
                }
                /*
                 * 重新渲染日历
                 * */
                _this.getVgDatepickerHtml();
            });


            /*
             * 选择一个日期
             * */
            $(".best-datepicker").on("click", "tbody td", function(ev) {
                ev.stopPropagation();
                /*
                 * 如果此项是禁用状态，则不可以点击选中
                 * */
                if ($(this).hasClass("disabled")) return;

                if (bValid) {
                    _this.curActiveInput.val($(this).data("val")).valid();
                } else {
                    _this.curActiveInput.val($(this).data("val"))
                }
                _this.VgDatepicker.remove();
                delete _this.VgDatepicker;
            });

            /*
             * 快速选择今天
             * */
            $(".best-datepicker").on("click", ".today", function(ev) {
                ev.stopPropagation();

                if (bValid) {
                    _this.curActiveInput.val(_this.format(new Date)).valid();
                } else {
                    _this.curActiveInput.val(_this.format(new Date));
                }
                _this.VgDatepicker.remove();
                delete _this.VgDatepicker;
            });

            /*
             * 清空
             * */
            $(".best-datepicker").on("click", ".clear", function(ev) {
                ev.stopPropagation();
                _this.rangeType = "";
                _this.rangeVal = "";
                _this.curActiveInput.val("");
                _this.VgDatepicker.remove();
                delete _this.VgDatepicker;
            });


        },


        /**
         * 渲染日历
         */
        renderHtml: function() {
            var _this = this;

            var did = +new Date();

            _this.getVgDatepickerDataList();

            /*
             * 获取input的left/top值
             * */
            var offset = _this.curActiveInput.offset();

            /*
             * 获取input的高度
             * */
            var inputHeight = _this.curActiveInput.outerHeight();

            var html = "<div class='best-datepicker best-datepicker-animate' data-did='" + did + "' style='width:" + _this.option.width + "px;left:" + offset.left + "px;top:" + (offset.top + inputHeight) + "px'>" +
                "              <!--头部-->" +
                "              <div class='best-datepicker-default'>" +
                "               <div class='best-datepicker-default-header'>" +
                "                   <div class='arrow-left-year'></div>" +
                "                   <div class='arrow-left-month'></div>" +
                "                   <div class='arrow-right-year'></div>" +
                "                   <div class='arrow-right-month'></div>" +
                "                   <div class='time-date'><span class='default-year'><em>" + _this.curDate.getFullYear() + "</em><i>年</i></span><span class='default-month'><em>" + _this.curDate.getMonth() + "</em><i>月</i></span></div>" +
                "               </div>" +
                "               <!--内容-->" +
                "               <div class='best-datepicker-default-body'>" +
                "                <table>" +
                "                  <thead>" +
                "                    <tr>" +
                "                      <td>日</td>" +
                "                      <td>一</td>" +
                "                      <td>二</td>" +
                "                      <td>三</td>" +
                "                      <td>四</td>" +
                "                      <td>五</td>" +
                "                      <td>六</td>" +
                "                    </tr>" +
                "                  </thead>" +
                "                  <tbody></tbody>" +
                "                </table>" +
                "                <!--底部-->" + _this.getBar() +
                "               </div>" +
                "               </div>" +
                "               <div class='best-datepicker-panel'></div>" +
                "            </div>";


            $("body").append(html);

            /*
             * 保存当前日历组件对象
             * */
            _this.VgDatepicker = $(".best-datepicker");

        },


        /**
         * 显示年份或月份列表
         * @param type
         * @param centerYear
         */
        showPanel: function(type, centerYear) {
            var _this = this;
            var listData = (type === "year" ? _this.loadYearList(centerYear) : _this.loadMonthList(centerYear));

            var yearHtml = "<div class='best-datepicker-panel-header'>" +
                "     <div class='arrow-left panel-year-left'></div>" +
                "     <div class='arrow-right panel-year-right'></div>" +
                "     <div class='time-date'><span class='panel-year-start'><em>" + _this.start + "</em><i>年</i></span>-<span class='panel-year-end'><em>" + _this.end + "</em><i>年</i></span></div>" +
                "</div>";

            var monthHtml = "<div class='best-datepicker-panel-header'>" +
                "     <div class='arrow-left panel-month-left'></div>" +
                "     <div class='arrow-right panel-month-right'></div>" +
                "     <div class='time-date'><span class='panel-year'><em>" + _this.curDate.getFullYear() + "</em><i>年</i></span></div>" +
                "</div>";
            var html = (type === "year" ? yearHtml : monthHtml) + "<div class='best-datepicker-panel-body'>" + listData + "</div>";

            $(".best-datepicker-panel").html(html);
        },


        /**
         * 加载年份列表数据
         * @param centerYear
         * @returns {string}
         */
        loadYearList: function(centerYear) {
            var _this = this;
            var array = [];
            _this.start = centerYear - 7;
            _this.end = centerYear + 7;


            array.push("<div class='year-list'>");
            for (var i = _this.start; i <= _this.end; i++) {
                if (i === centerYear) {
                    array.push("<span data-val='" + i + "' class='active'>" + i + "</span>");
                } else {
                    array.push("<span data-val='" + i + "'>" + i + "</span>");
                }
            }
            array.push("</div>");

            return array.join("");


        },


        /**
         * 加载月份列表数据
         * @returns {string}
         */
        loadMonthList: function(centerYear) {
            var _this = this;
            var array = ["一月份", "二月份", "三月份", "四月份", "五月份", "六月份", "七月份", "八月份", "九月份", "十月份", "十一月份", "十二月份"];
            var html = [];

            _this.curDate.setFullYear(centerYear);

            html.push("<div class='month-list'>");
            for (var i = 0; i < array.length; i++) {
                /*
                 * 判断当前月份
                 * */
                if (i === _this.curDate.getMonth()) {
                    html.push("<span class='active' data-val='" + i + "'>" + array[i] + "</span>");
                } else {
                    html.push("<span data-val='" + i + "'>" + array[i] + "</span>");
                }
            }
            html.push("</div>");
            return html.join("");
        },

        /**
         * 获取日期HTML结构
         */
        getVgDatepickerHtml: function() {

            var _this = this;

            var array = [];

            _this.getVgDatepickerDataList();

            for (var i = 0, len = _this.dateArray.length; i < len; i++) {
                var obj = _this.dateArray[i];

                if (i % 7 === 0) {
                    array.push("<tr>");
                }

                var clss = obj.type;
                var text = obj.date.getDate();
                var val = _this.format(obj.date);
                var timestamp = obj.date.getTime();

                array.push("<td class='best-datepicker-" + (text === _this.curDate.getDate() ? clss += " active" : clss) + "' data-timestamp='" + timestamp + "' data-val='" + val +
                    "'>" + text + "</td>"
                );
                if ((i + 1) % 7 === 0) {
                    array.push("</tr>");
                }
            }

            $(".best-datepicker .time-date em").eq(0).text(_this.curDate.getFullYear());
            $(".best-datepicker .time-date em").eq(1).text(_this.curDate.getMonth() + 1);

            $(".best-datepicker tbody").html(array.join(""));

        },

        /**
         * 获取某个月的的第一天,默认是当前月份的第一天
         * @returns {Date}
         */
        getFirstDateOfMonth: function(iDate) {

            var _this = this;
            var date = new Date();
            var iDate = iDate || date;

            date.setFullYear(iDate.getFullYear());
            date.setMonth(iDate.getMonth());
            date.setDate(1);

            return date;

        },

        /**
         * 获取某个月的的最后一天,默认是当前月份的最后一天
         * @returns {Date}
         */
        getLastDateOfMonth: function(iDate) {
            var _this = this;
            var date = new Date();
            var iDate = iDate || date;

            date.setFullYear(iDate.getFullYear());
            date.setMonth(iDate.getMonth() + 1);
            date.setDate(1);

            return new Date(date.getTime() - 1000 * 60 * 60 * 24);

        },


        /**
         * 获取某个月的日历数据
         */
        getVgDatepickerDataList: function() {

            var _this = this,
                prevType = "prev",
                curType = "cur",
                nextType = "next";
            if (_this.rangeVal) {
                var date = _this.rangeType === "start" ? _this.startDate.getDate() + 1 : _this.endDate.getDate() - 1;
            }


            _this.dateArray = [];
            /*
             * 第一天
             * */
            _this.firstDate = _this.getFirstDateOfMonth(_this.curDate);

            /*
             * 最后一天
             * */
            _this.lastDate = _this.getLastDateOfMonth(_this.curDate);

            /*
             * 第一天星期几
             * */
            _this.firstDay = _this.firstDate.getDay();

            /*
             * 最后一天星期几
             * */
            _this.lastDay = _this.lastDate.getDay();

            /*
             * 计算上个月补位数
             * */
            for (var i = _this.firstDay; i > 0; i--) {
                var _date = new Date(_this.firstDate.getTime() - 1000 * 60 * 60 * 24 * i);

                /*
                 * 判断是否选中有值，有值了才做范围限制
                 * */
                if (_this.rangeVal) {
                    /*
                     * 开始时间-上个月
                     * */
                    if (_this.rangeType === "start" && _date.getTime() > _this.startDate.getTime()) {
                        prevType = "prev disabled";
                    }
                    /*
                     * 结束时间-下个月
                     * */
                    else if (_this.rangeType === "end" && _date.getTime() < _this.startDate.getTime()) {
                        prevType = "prev disabled";
                    } else {
                        prevType = "prev";
                    }
                }

                _this.dateArray.push({
                    type: prevType,
                    date: _date
                });
            }

            /*
             * 当前月份总天数
             * */

            for (var j = 0; j < _this.lastDate.getDate() - _this.firstDate.getDate() + 1; j++) {
                var _date = new Date(_this.firstDate.getTime() + 1000 * 60 * 60 * 24 * j);

                /*
                 * 判断是否选中有值，有值了才做范围限制
                 * */
                if (_this.rangeVal) {
                    /*
                     * 开始时间
                     * */
                    if (_this.rangeType === "start") {
                        if (_date.getTime() > _this.endDate.getTime()) {
                            curType = "cur disabled";
                        } else {
                            curType = "cur";
                        }
                    }
                    /*
                     * 结束时间
                     * */
                    else if (_this.rangeType === "end") {
                        if (_date.getTime() < _this.startDate.getTime() + 1000 * 60 * 60 * 24) {
                            curType = "cur disabled";
                        } else {
                            curType = "cur";
                        }
                    }
                }
                _this.dateArray.push({
                    type: curType,
                    date: _date
                });
            }

            /*
             * 下一个月份的补位数
             * */
            for (var k = 1; k < 7 - _this.lastDay; k++) {
                var _date = new Date(_this.lastDate.getTime() + 1000 * 60 * 60 * 24 * k);
                /*
                 * 判断是否选中有值，有值了才做范围限制
                 * */
                if (_this.rangeVal) {
                    /*
                     * 开始时间-下个月
                     * */
                    if (_this.rangeType === "start" && _date.getTime() > _this.startDate.getTime()) {
                        nextType = "next disabled";
                    }
                    /*
                     * 结束时间-下个月
                     * */
                    else if (_this.rangeType === "end" && _date.getTime() < _this.startDate.getTime()) {
                        nextType = "next disabled";
                    } else {
                        nextType = "next";
                    }
                }

                _this.dateArray.push({
                    type: nextType,
                    date: _date
                });
            }

        },
        /**
         * [format description]
         * @param  {[type]} dataObject [description]
         * @return {[type]}            [description]
         */
        format: function(dataObject) {
            var _this = this;
            var year = dataObject.getFullYear();
            var month = dataObject.getMonth() + 1;
            var date = dataObject.getDate();
            var hours = dataObject.getHours();
            var minutes = dataObject.getMinutes();
            var seconds = dataObject.getSeconds();

            return _this.option.format.split(" ")[0]
                .replace("yyyy", year)
                .replace("mm", _this._pad(month, 2))
                .replace("dd", _this._pad(date, 2))
                .replace("hh", _this._pad(hours, 2))
                .replace("mm", _this._pad(minutes, 2))
                .replace("ss", _this._pad(seconds, 2));

        },
        /**
         * 获取底部bar
         * [getBar description]
         * @return {[type]} [description]
         */
        getBar: function() {
            var _this = this;
            return _this.option.showBar ? "<div class='bar'><span class='today'>今天</span><span class='clear'>清空</span></div>" : "";
        },
        /**
         * 补位
         * [_pad description]
         * @param  {[type]} str [description]
         * @param  {[type]} num [description]
         * @return {[type]}     [description]
         */
        _pad: function(str, num) {

            var len = str.toString().length;
            var cha = num - len;
            while (cha--) {
                str = "0" + str;
            }
            return str;
        }
    };

    /**
     * [Drag description]
     * @type {[type]}
     */
    if (typeof define === "function" && define.amd) {
        // AMD模式
        return Datepicker;
    } else {
        // 全局模式
        this.Datepicker = Datepicker;
    }

}));