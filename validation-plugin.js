/**
 * Created with IntelliJ IDEA.
 * User: a.zavodin
 * Date: 26.03.14
 * Time: 16:13
 * To change this template use File | Settings | File Templates.
 */

(function ($) {

    /**
     *  Хэш валидаторов
     */
    var validationRules = {
        isNotEmpty: function (val) {
            if (val.length == 0) {
                return false;
            }

            return true;
        },

        isNumeric: function(val){
            return $.isNumeric(val);
        },

        isInt: function (val) {

            if ($.isNumeric(val)) {
                var regExpr = new RegExp('^[1-9]{1}[0-9]*$');

                if (regExpr.test(val)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }

            return true;
        },

        /*
         Вернет 1 в случае если float.
         Вернет 0, если стоит запятая вместо точки.
         Вернет -1, если все плохо.
         */
        isFloat: function (val) {

            if ($.isNumeric(val)) {
                var regExpr1 = new RegExp('^[1-9]{1}[0-9]*.[0-9]+');
                var regExpr2 = new RegExp('^[1-9]{1}[0-9]*,[0-9]+');

                if (regExpr1.test(val)) {
                    return 1;
                }
                else {
                    if (regExpr2.test(val)) {
                        return 0;
                    }
                    else {
                        return -1;
                    }
                }
            }
            else {
                return -1;
            }

            return 1;
        },

        isEmail: function (email) {
            var regExpr = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regExpr.test(email);
            return true;
        },

        isUrl: function (url) {
            var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            var regExpr = new RegExp(expression);
            return regExpr.test(url);
        },

        minLength: function (val, min_val) {

            if (val.length >= min_val) {
                return true;
            }
            else {
                return false;
            }

            return true;
        },

        maxLength: function (val, max_val) {

            if (val.length <= max_val) {
                return true;
            }
            else {
                return false;
            }

            return true;
        }
    };

    validateForm = function (form, settings) {
        var result = true;
        form.find("input").each(function (i, el) {
            var $this = $(this);
            if ($this.hasClass('necessarily') && validateInput($this, settings) == false) {
                result = false;
            }
        });

        return result;
    }

    validateInput = function (input, settings) {
        var validations = this.getValidations(input);
        var result = true;

        if((validations['isFloat'] != 'undefined' || validations['isNumeric'] != 'undefined') && settings.commaToDot){
            input.val(input.val().replace(',', '.'));
        }

        if (validations['count'] > 0) {
            for (var i in validations) {
                if (typeof validationRules[i] != "undefined") {
                 if ((validationRules[i](input.val(), validations[i]) == false) || (validationRules[i](input.val(), validations[i])) == -1) {
                        result = false;
                    }
                }
            }
        } else {
            result = validationRules.isNotEmpty($(input).val());
        }

        if(!result){
            $(input).addClass("validation-error");
        }else{
            $(input).removeClass("validation-error");
        }

        return result;
    }

    /**
     * собираем валидаторы с интупа, пример data-validation="isNumeric;maxLength=20;"
     * @param jQuery(input)
     * @returns {{count: number}}
     */
    getValidations = function (input) {
        var result = {count:0};
        var validations = null;
        var validation_count = 0;

        if (typeof input.attr('data-validation') != 'undefined') {
            validations = input.attr('data-validation').split(';');
        } else {
            return result;
        }

        //validations[0]= isNumeric=true   validations[1]= maxLength=20
        for (var i in validations) {
            var attrAndVal = validations[i].split('=');

            if(attrAndVal[0] == ""){
                continue;
            }

            if(typeof attrAndVal[1] != 'undefined'){
                //в параметре типа валидации, только числа или boolean type
                if (validationRules.isInt(attrAndVal[1].trim()) || attrAndVal[1].trim().toLowerCase() == 'true' || attrAndVal[1].trim().toLowerCase() == 'false') {
                    validation_count++;
                    result[attrAndVal[0].trim()] = attrAndVal[1].trim();
                }
            }else{
                // Если указанная валидация имеет в списке указанных валидаций. isInt
                if(validationRules[attrAndVal[0].trim()] != 'undefined'){
                   validation_count++;
                   result[attrAndVal[0].trim()] = 'true';
                }
            }
        }

        result.count = validation_count;

        return result;
    }

    var methods = {
        init: function (options) {

            var noop = function () {};
            var settings = $.extend({
                commaToDot:false,
                noop: noop
            }, options);

            var result = true;

            // Если обьект - поле ввода
            if ($(this).is(":input")) {
                if ($(this).hasClass('necessarily')) {
                    result = validateInput($(this), settings);
                } else {
                    result = true;
                }
            } else {
                result = validateForm($(this), settings);
            }


            return result;
        }
    };

    $.fn.validationForm = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод ' + method + ' не существует');
        }
    };

})(jQuery);