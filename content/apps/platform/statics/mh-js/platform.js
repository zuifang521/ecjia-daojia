// JavaScript Document
;(function (app, $) {
    app.platform = {
        init: function () {
            ecjia.merchant.platform.search();
            ecjia.merchant.platform.edit();
            ecjia.merchant.platform.quick_search();
//			ecjia.merchant.platform.search_extend();
            ecjia.merchant.platform.submit_extend();
            ecjia.merchant.platform.command_edit();
            ecjia.merchant.platform.editForm();
            ecjia.merchant.platform.extend();
            ecjia.merchant.platform.token();
            ecjia.merchant.platform.copy();
        },

        //公众号列表 搜索/筛选
        search: function () {
            $('.screen-btn').on('click', function (e) {
                e.preventDefault();
                var url = $("form[name='searchForm']").attr('action')
                var platform = $("select[name='platform'] option:selected").val();
                if (platform != '') {
                    url += '&platform=' + platform;
                }
                ecjia.pjax(url);
            });

            $("form[name='searchForm']").on('submit', function (e) {
                e.preventDefault();
                var keywords = $("input[name='keywords']").val();
                var url = $(this).attr('action');
                if (keywords) {
                    url += '&keywords=' + keywords;
                }
                ecjia.pjax(url);
            });
        },

        //公众号 添加/编辑
        edit: function () {
            var $form = $('form[name="theForm"]');
            var option = {
                rules: {
                    platform: {required: true},
                    name: {required: true},
                    token: {required: true},
                    appid: {required: true},
                    appsecret: {required: true},
                },
                messages: {
                    platform: {required: js_lang.platform_required},
                    name: {required: js_lang.platform_name_required},
                    token: {required: js_lang.token_required},
                    appid: {required: js_lang.appid_required},
                    appsecret: {required: js_lang.appsecret_required},
                },
                submitHandler: function () {
                    $form.ajaxSubmit({
                        dataType: "json",
                        success: function (data) {
                            ecjia.merchant.showmessage(data);
                        }
                    });
                }
            }
            var options = $.extend(ecjia.merchant.defaultOptions.validate, option);
            $form.validate(options);
        },

        //命令速查
        quick_search: function () {
            $('.search_command').on('click', function (e) {
                e.preventDefault();
                var url = $("form[name='searchForm']").attr('action');

                if ($("input[name='keywords']").val() != '') {
                    url += '&keywords=' + $("input[name='keywords']").val();
                }
                ecjia.pjax(url);
            });

            $('.select-btn').on('click', function (e) {
                e.preventDefault();
                var url = $("form[name='searchForm']").attr('action')
                var keywords = $("input[name='keyword']").val();

                if ($("select[name='platform'] option:selected").val() != 0) {
                    url += '&keywords=' + keywords + '&platform=' + $("select[name='platform'] option:selected").val();
                } else {
                    url += '&keywords=' + keywords;
                }
                ecjia.pjax(url);
            });
        },

        //搜索公众号扩展
        search_extend: function () {
            $(".nav-list-ready ,.ms-selection .nav-list-content").disableSelection();
            $('.search_platform').on('click', function () {
                var $choose_list = $('.choose_list'),
                    searchURL = $choose_list.attr('data-url');
                var id = $choose_list.attr('data-id');
                var filters = {
                    'JSON': {
                        'keywords': $choose_list.find('[name="keywords"]').val(),
                        'id': id
                    }
                };
                $.get(searchURL, filters, function (data) {
                    ecjia.merchant.platform.load_extend_opt(data);
                }, "JSON");
            })
        },

        //载入扩展
        load_extend_opt: function (data) {
            $('.nav-list-ready').html('');
            if (data.content.length > 0) {
                for (var i = 0; i < data.content.length; i++) {
                    var disable = $('.nav-list-content .ms-elem-selection').find('input[value="' + data.content[i].value + '"]').length ? 'disabled' : '';
                    var opt = '<li class="ms-elem-selectable ' + disable + '" id="ext_id_' + data.content[i].ext_id + '" data-code="' + data.content[i].ext_code + '" data-config=' + data.content[i].ext_config + '><span>' + data.content[i].ext_name + '（' + data.content[i].ext_code + '）' + '</span></li>'
                    $('.nav-list-ready').append(opt);
                }
                ;
            } else {
                $('.nav-list-ready').html('<li class="ms-elem-selectable disabled no-records"><span>' + js_lang.search_no_plugin + '</span></li>');
            }
            ecjia.merchant.platform.search_extend_opt();
            ecjia.merchant.platform.add_extend();
        },

        //搜索扩展信息
        search_extend_opt: function () {
            //li搜索筛选功能
            $('#ms-search').quicksearch(
                $('.ms-elem-selectable', '#ms-custom-navigation'),
                {
                    onAfter: function () {
                        $('.ms-group').each(function (index) {
                            $(this).find('.isShow').length ? $(this).css('display', 'block') : $(this).css('display', 'none');
                        });
                        return;
                    },
                    show: function () {
                        this.style.display = "";
                        $(this).addClass('isShow');
                    },
                    hide: function () {
                        this.style.display = "none";
                        $(this).removeClass('isShow');
                    },
                }
            );
        },

        //添加扩展到列表
        add_extend: function () {
            $('.nav-list-ready li')
                .on('click', function () {
                    var $this = $(this),
                        tmpobj = $('<input type="hidden" name="ext_code[]" value="' + $this.attr('data-code') + '" /><input type="hidden" name="ext_config[]" value=' + $this.attr('data-config') + ' />')
                    if ($this.hasClass('no-records')) {
                        return false;
                    }
                    if (!$this.hasClass('disabled')) {
                        tmpobj.appendTo($this);
                        $this.addClass('disabled');
                    } else {
                        $this.find(':input').remove();
                        $this.removeClass('disabled');
                    }
                    //给新元素添加点击事件
                    tmpobj.on('dblclick', function () {
                        $this.removeClass('disabled');
                        tmpobj.remove();
                    })
                        .find('i.del').on('click', function () {
                        tmpobj.trigger('dblclick');
                    });
                });
        },

        //提交扩展
        submit_extend: function () {
            var $form = $("form[name='platform']");
            var option = {
                submitHandler: function () {
                    $form.ajaxSubmit({
                        dataType: "json",
                        success: function (data) {
                            ecjia.merchant.showmessage(data);
                        }
                    });
                }
            }
            var options = $.extend(ecjia.merchant.defaultOptions.validate, option);
            $form.validate(options);
        },

        //添加/编辑 扩展命令
        command_edit: function () {
            var ok = $('form[name="editForm"]').find('.fontello-icon-ok').length;
            if (ok != 0) {
                $('.addtr').hide();
                $('.btn-gebo').hide();
            } else {
                $('.addtr').show();
                $('.btn-gebo').show();
            }

            $('.command_icon.fontello-icon-edit').on('click', function (e) {
                var url = $(this).parent().attr('data-href');
                ecjia.pjax(url);
            });

            $('.command_icon.fontello-icon-ok').on('click', function (e) {
                var url = $(this).parent().attr('data-href');
                var cmd_word = $("input[name='cmd_word']").val();
                var sub_code = $("input[name='sub_code']").val();

                var list = {
                    cmd_word: cmd_word,
                    sub_code: sub_code,
                };

                $.post(url, list, function (data) {
                    ecjia.merchant.showmessage(data);
                }, "json");
            });
        },

        editForm: function () {
            var $form = $("form[name='editForm']");
            var option = {
                rules: {
                    ext_name: {required: true},
                    ext_desc: {required: true},
                },
                messages: {
                    ext_name: {
                        required: js_lang.fun_plug_name_required,
                    },
                    ext_desc: {
                        required: js_lang.fun_plug_info_required,
                    }
                },
                submitHandler: function () {
                    if ($form.children('button').css('display') == 'none') {
                        return false;
                    }
                    $form.ajaxSubmit({
                        dataType: "json",
                        success: function (data) {
                            ecjia.merchant.showmessage(data);
                        }
                    });
                }
            }
            var options = $.extend(ecjia.merchant.defaultOptions.validate, option);
            $form.validate(options);
        },

        extend: function () {
            $(".ajaxall").on('click', function (e) {
                e.preventDefault();
                var url = $(this).attr('href');
                $.get(url, function (data) {
                    ecjia.merchant.showmessage(data);
                }, 'json');
            });
        },

        //生成token
        token: function (option) {
            $('.toggle_view').on('click', function (e) {
                e.preventDefault();
                var $this = $(this);
                var url = $this.attr('href');
                var val = $this.attr('data-val') || 'allow';

                var data = {
                    check: val,
                }
                $.post(url, data, function (data) {
                    if (data.state == 'success') {
                        $('.generate_token').val(data.token);
                    }
                    ecjia.merchant.showmessage(data);
                }, 'json');
            });
        },

        copy: function () {
            $(".copy-url-btn").off('click').on('click', function (e) {
                var url_clipboard = new ClipboardJS('.copy-url-btn');
                url_clipboard.on('success', function (e) {
                    smoke.alert(js_lang.copy_success, {ok: js_lang.ok});
                    e.clearSelection();
                    url_clipboard.destroy();
                });
                url_clipboard.on('error', function (e) {
                    smoke.alert(js_lang.copy_failed, {ok: js_lang.ok});
                    e.clearSelection();
                    url_clipboard.destroy();
                });
            });

            $(".copy-token-btn").off('click').on('click', function (e) {
                var token_clipboard = new ClipboardJS('.copy-token-btn');
                token_clipboard.on('success', function (e) {
                    smoke.alert(js_lang.copy_success, {ok: js_lang.ok});
                    e.clearSelection();
                    token_clipboard.destroy();
                });
                token_clipboard.on('error', function (e) {
                    smoke.alert(js_lang.copy_failed, {ok: js_lang.ok});
                    e.clearSelection();
                    token_clipboard.destroy();
                });
            });
        }
    };

    app.staff_info = {
        init: function () {
            app.staff_info.theForm();
        },

        theForm: function () {
            var $form = $("form[name='theForm']");
            var option = {
                submitHandler: function () {
                    $form.ajaxSubmit({
                        dataType: "json",
                        success: function (data) {
                            ecjia.merchant.showmessage(data);
                        }
                    });
                }
            }
            var options = $.extend(ecjia.merchant.defaultOptions.validate, option);
            $form.validate(options);
        }
    }
})(ecjia.merchant, jQuery);

//end