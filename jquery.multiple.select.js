/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @version 1.1.0
 *
 * http://wenzhixin.net.cn/p/multiple-select/
 */

(function ($) {

	'use strict';

	function MultipleSelect($el, options) {
		var that = this,
			name = $el.attr('name') || options.name || ''

		$el.parent().hide();
		var elWidth = $el.css("width");
		$el.parent().show();
		if (elWidth == "0px") { elWidth = $el.outerWidth() + 20 }

		this.$el = $el.hide();
		this.options = options;
		this.$parent = $('<div' + $.map(['class', 'title'], function (att) {
			var attValue = that.$el.attr(att) || '';
			attValue = (att === 'class' ? ('ms-parent' + (attValue ? ' ' : '')) : '') + attValue;
			return attValue ? (' ' + att + '="' + attValue + '"') : '';
		}).join('') + ' />');
		this.$choice = $('<div role="button" class="ms-choice"><span class="placeholder' + (options.combo ? ' ms-combo" contenteditable="true">' : '">') +
			options.placeholder + '</span><div></div></div>');
		this.$combo = this.$choice.children('span[contenteditable]');
		this.$drop = $('<div class="ms-drop ' + options.position + '"></div>');
		this.$el.after(this.$parent);
		this.$parent.append(this.$choice);
		this.$parent.append(this.$drop);

		if (this.$el.prop('disabled')) {
			this.$choice.addClass('disabled');
		}
		this.$parent.css('width', options.width || elWidth);

		if (!this.options.keepOpen) {
			$('body').click(function (e) {
				if ($(e.target)[0] === that.$choice[0] ||
					$(e.target).parents('.ms-choice')[0] === that.$choice[0]) {
					return;
				}
				if (($(e.target)[0] === that.$drop[0] ||
					$(e.target).parents('.ms-drop')[0] !== that.$drop[0]) &&
					that.options.isOpen) {
					that.close();
				}
			});
		}

		this.selectAllName = 'name="selectAll' + name + '"';
		this.selectGroupName = 'name="selectGroup' + name + '"';
		this.selectItemName = 'name="selectItem' + name + '"';
	}

	MultipleSelect.prototype = {
		constructor: MultipleSelect,

		init: function () {
			var that = this,
				html = [],
				displayControlBox = this.options.modifiable || (this.options.selectAll && !this.options.single);
			if (this.options.filter) {
				html.push('<div class="ms-search">');
				if (this.options.multiline) {
					html.push('<textarea rows="1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" wrap="off"></textarea>');
				} else {
					html.push('<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">');
				}
				html.push('</div>');
			}
			html.push('<ul>');
			$.each(this.$el.children(), function (i, elm) {
				html.push(that.optionToHtml(i, elm));
			});
			html.push(
				'<li class="ms-no-results">' + this.options.noMatchesFound + '</li>',
				'</ul>'
			);
			if (displayControlBox) {
				html.push('<div class="ms-drop-controlbox">');
				if (this.options.selectAll && !this.options.single) {
					html.push(
						'<a class="ms-select-all">',
						this.options.selectAllText,
						'</a>'
					);
				}
				if (this.options.modifiable) {
					html.push(
						'<a class="ms-remove-selected">',
						this.options.removeSelectedText,
						'</a>'
					);
				}
				html.push('</div>');
			}
			this.$drop.html(html.join(''));

			this.$drop.find('ul').css('max-height', this.options.maxHeight + 'px');
			this.$drop.find('.multiple').css('width', this.options.multipleWidth + 'px');

			this.$searchInput = this.$drop.find('.ms-search ' + (this.options.multiline ? 'textarea' : 'input'));
			this.$selectAll = this.$drop.find('.ms-select-all');
			this.$removeSelected = this.$drop.find('.ms-remove-selected');
			this.$selectGroups = this.$drop.find('input[' + this.selectGroupName + ']');
			this.$selectItems = this.$drop.find('input[' + this.selectItemName + ']:enabled');
			this.$disableItems = this.$drop.find('input[' + this.selectItemName + ']:disabled');
			this.$noResults = this.$drop.find('.ms-no-results');
			this.$removeButtons = this.$drop.find('.ms-remove');
			this.events();
			this.updateSelectAll(true);
			this.update(true);

			if (this.options.isOpen) {
				this.open();
			}
			$(this.options.combo).hide();
		},

		optionToHtml: function (i, elm, group, groupDisabled) {
			var that = this,
				$elm = $(elm),
				html = [],
				multiple = this.options.multiple,
				optAttributesToCopy = ['class', 'title'],
				clss = $.map(optAttributesToCopy, function (att, i) {
					var isMultiple = att === 'class' && multiple;
					var attValue = $elm.attr(att) || '';
					return (isMultiple || attValue) ?
						(' ' + att + '="' + (isMultiple ? ('multiple' + (attValue ? ' ' : '')) : '') + attValue + '"') :
						'';
				}).join(''),
				disabled,
				type = this.options.single ? 'radio' : 'checkbox';

			if ($elm.is('option')) {
				var value = $elm.val(),
					text = that.options.textTemplate($elm),
					selected = (that.$el.attr('multiple') != undefined) ? $elm.prop('selected') : ($elm.attr('selected') == 'selected'),
					style = this.options.styler(value) ? ' style="' + this.options.styler(value) + '"' : '';

				disabled = groupDisabled || $elm.prop('disabled');
				if ((this.options.blockSeparator > "") && (this.options.blockSeparator == $elm.val())) {
					html.push(
						'<li' + clss + style + '>',
						'<label class="' + this.options.blockSeparator + (disabled ? 'disabled' : '') + '">',
						text,
						'</label>',
						'</li>'
					);
				} else {
					html.push(
						'<li' + clss + style + '>',
						'<label' + (disabled ? ' class="disabled"' : '') + '>'
					);
					if (!disabled && that.options.modifiable) {
						html.push('<a class="ms-remove" data-index="' + i + '"></a>');
					}
					html.push(
						'<input type="' + type + '" ' + this.selectItemName + ' value="' + value + '"' +
							(selected ? ' checked="checked"' : '') +
							(disabled ? ' disabled="disabled"' : '') +
							(group ? ' data-group="' + group + '"' : '') +
							'/> ',
						text
					);

					html.push(
						'</label>',
						'</li>'
					);
				}
			} else if (!group && $elm.is('optgroup')) {
				var _group = 'group_' + i,
					label = $elm.attr('label');

				disabled = $elm.prop('disabled');
				html.push(
					'<li class="group">',
					'<label class="optgroup' + (disabled ? ' disabled' : '') + '" data-group="' + _group + '">',
					(this.options.hideOptgroupCheckboxes ? '' : '<input type="checkbox" ' + this.selectGroupName +
						(disabled ? ' disabled="disabled"' : '') + ' /> '),
					label,
					'</label>',
					'</li>');
				$.each($elm.children(), function (i, elm) {
					html.push(that.optionToHtml(i, elm, _group, disabled));
				});
			}
			return html.join('');
		},

		events: function () {
			var that = this;

			function toggleOpen(e) {
				e.preventDefault();
				that[that.options.isOpen ? 'close' : 'open']();
			}

			var label = this.$el.parent().closest('label')[0] || $('label[for=' + this.$el.attr('id') + ']')[0];
			if (label) {
				$(label).off('click').on('click', function (e) {
					if (e.target.nodeName.toLowerCase() !== 'label' || e.target !== this) {
						return;
					}
					toggleOpen(e);
					if (!that.options.filter || !that.options.isOpen) {
						that.focus();
					}
					e.stopPropagation(); // Causes lost focus otherwise
				});
			}
			this.$choice.off('click').on('click', toggleOpen)
						.off('focus').on('focus', this.options.onFocus)
						.off('blur').on('blur', this.options.onBlur);
			this.$combo.off('click').on('click', function () {
				return false;
			}).off('keydown').on('keydown', function (e) {
				if (e.keyCode === 13) {
					that.close();
					that.focus();
					return false;
				} else if (!that.options.isOpen) {
					that.open();
				}
			}).off('keyup').on('keyup', function (e) {
				$(that.options.combo).val(that.$combo.text());
				that.filter();
			}).off('change').on('blur keyup paste', function () {
				$(that.options.combo).val(that.$combo.text());
			});
			this.$parent.off('keydown').on('keydown', function (e) {
				switch (e.which) {
					case 27: // esc key
						that.close();
						that.$choice.focus();
						break;
				}
			});
			this.$searchInput.off('keydown').on('keydown', function (e) {
				if (e.keyCode === 9 && e.shiftKey) { // Ensure shift-tab causes lost focus from filter as with clicking away
					that.close();
				} else if (e.keyCode === 13 && !e.shiftKey && that.options.modifiable) {
					var items = [];
					$(this.value.split('\n')).each(function (i, v) {
						v = $.trim(v);
						v = that.options.onAdd.call(that, that.$el, { text: v, value: v, selected: true });
						if (v && typeof v.value !== 'undefined' && typeof v.text !== 'undefined') {
							var opt = $('<option/>', v);
							that.$el.append(opt);
							items.push(opt.get(0));
						}
					});
					if (items.length > 0) {
						that.options.onAdded.call(that, items);
						that.refresh();
					}
					return false;
				}
			}).off('keyup').on('keyup', function (e) {
				if (that.options.filterAcceptOnEnter &&
					(e.which === 13 || e.which == 32) && // enter or space
					that.$searchInput.val() // Avoid selecting/deselecting if no choices made
				) {
					that.$selectAll.click();
					that.close();
					that.focus();
					return;
				}
				that.filter();
			});
			this.$selectAll.off('click').on('click', function () {
				var checked = $(this).toggleClass('ms-select-all-checked').is('.ms-select-all-checked'),
					$items = that.$selectItems.filter(':visible');
				if ($items.length === that.$selectItems.length) {
					that[checked ? 'checkAll' : 'uncheckAll']();
				} else { // when the filter option is true
					that.$selectGroups.prop('checked', checked);
					$items.prop('checked', checked);
					that.options[checked ? 'onCheckAll' : 'onUncheckAll']();
					that.update();
				}
			});
			this.$selectGroups.off('click').on('click', function () {
				var group = $(this).parent().attr('data-group'),
					$items = that.$selectItems.filter(':visible'),
					$children = $items.filter('[data-group="' + group + '"]'),
					checked = $children.length !== $children.filter(':checked').length;
				$children.prop('checked', checked);
				that.updateSelectAll();
				that.update();
				that.options.onOptgroupClick.call(that, {
					label: $(this).parent().text(),
					checked: checked,
					children: $children.get()
				});
			});
			this.$selectItems.off('click').on('click', function () {
				that.updateSelectAll();
				that.update();
				that.updateOptGroupSelect();
				that.options.onClick.call(that, {
					label: $(this).parent().text(),
					value: $(this).val(),
					checked: $(this).prop('checked')
				});

				if (that.options.single && that.options.isOpen && !that.options.keepOpen) {
					that.close();
				}
			});
			this.$removeButtons.off('click').on('click', function (e) {
				var index = ($(this).data('index') | 0);
				if (that.options.onRemove.call(that, index)) {
					that.options.onRemoved.call(that, [that.$el.children('option').eq(index).remove().get(0)]);
					that.refresh();
				}
				e.stopPropagation();
				return false;
			});
			this.$removeSelected.off('click').on('click', function () {
				var indexes = [];
				$('.ms-remove').each(function (i, item) {
					var $item = $(this);
					if ($item.closest('li').is('.selected')) {
						var index = ($item.data('index') | 0);
						if (that.options.onRemove.call(that, index)) {
							indexes.push(index);
						}
					}
				});
				var items = [];
				var $options = that.$el.children('option');
				for (var i = indexes.length - 1; i >= 0; i--) {
					items.push($options.eq(indexes[i]).remove().get(0));
				}
				if (items.length > 0) {
					that.options.onRemoved.call(that, items);
					that.refresh();
				}
			});
		},

		open: function () {
			if (this.$choice.hasClass('disabled')) {
				return;
			}
			this.options.isOpen = true;
			this.$choice.find('>div').addClass('open');
			this.$drop.show();

			// fix filter bug: no results show
			this.$selectAll.parent().show();
			this.$noResults.hide();

			// Fix #77: 'All selected' when no options
			if (this.$el.children().length === 0) {
				this.$selectAll.parent().hide();
				this.$noResults.show();
			}

			if (this.options.container) {
				var offset = this.$drop.offset();
				this.$drop.appendTo($(this.options.container));
				this.$drop.offset({ top: offset.top, left: offset.left });
			}
			if (this.options.filter) {
				this.$searchInput.val('');
				this.$searchInput.focus();
				this.filter();
			}
			this.options.onOpen();
		},

		close: function () {
			this.options.isOpen = false;
			this.$choice.find('>div').removeClass('open');
			this.$drop.hide();
			if (this.options.container) {
				this.$parent.append(this.$drop);
				this.$drop.css({
					'top': 'auto',
					'left': 'auto'
				});
			}
			this.options.onClose();
		},

		update: function (isInit) {
			var selects = this.getSelects(),
				selectsText = this.getSelects('text'),
				$span = this.$choice.find('>span');

			if (selects.length === 0) {
				$span.addClass('placeholder').html(this.options.placeholder);
			} else if (this.options.allSelected &&
				selects.length === this.$selectItems.length + this.$disableItems.length) {
				$span.removeClass('placeholder').html(this.options.selectedPrefix + this.options.allSelected);
			} else if (this.options.countSelected && selects.length < this.options.minumimCountSelected) {
				$span.removeClass('placeholder')
					.html(this.options.selectedPrefix + (this.options.displayValues ? selects : selectsText)
					.join(this.options.delimiter));
			} else if ((this.options.countSelected || this.options.etcaetera) && selects.length > this.options.minumimCountSelected) {
				if (this.options.etcaetera) {
					$span.removeClass('placeholder').html(this.options.selectedPrefix + (this.options.displayValues ? selects : selectsText.slice(0, this.options.minumimCountSelected)).join(this.options.delimiter) + '...');
				}
				else {
					$span.removeClass('placeholder')
						.html(this.options.selectedPrefix + (this.options.countSelected
							.replace('#', selects.length)
							.replace('%', this.$selectItems.length + this.$disableItems.length))
						);
				}
			} else {
				$span.removeClass('placeholder').html(
					this.options.selectedPrefix + (this.options.displayValues ? selects : selectsText)
						.join(this.options.delimiter));
			}
			// set selects to select
			this.$el.val(selects);
			if (this.options.combo) {
				$(this.options.combo).val(this.options.displayValues ? selects : selectsText);
			}

			// add selected class to selected li
			this.$drop.find('li').removeClass('selected');
			this.$drop.find('input[' + this.selectItemName + ']:checked').each(function () {
				$(this).parents('li').first().addClass('selected');
			});

			// trigger <select> change event
			if (!isInit) {
				this.$el.trigger('change');
			}
		},

		updateSelectAll: function (Init) {
			var $items = this.$selectItems;
			if (!Init) { $items = $items.filter(':visible'); }
			this.$selectAll.prop('checked', $items.length &&
			$items.length === $items.filter(':checked').length);
			if (this.$selectAll.prop('checked')) {
				this.options.onCheckAll();
			}
		},

		updateOptGroupSelect: function () {
			var $items = this.$selectItems.filter(':visible');
			$.each(this.$selectGroups, function (i, val) {
				var group = $(val).parent().attr('data-group'),
					$children = $items.filter('[data-group="' + group + '"]');
				$(val).prop('checked', $children.length &&
					$children.length === $children.filter(':checked').length);
			});
		},

		//value or text, default: 'value'
		getSelects: function (type) {
			var that = this,
				texts = [],
				values = [];
			this.$drop.find('input[' + this.selectItemName + ']:checked').each(function () {
				texts.push($(this).parents('li').first().text());
				values.push($(this).val());
			});

			if (type === 'text' && this.$selectGroups.length) {
				texts = [];
				this.$selectGroups.each(function () {
					var html = [],
						text = $.trim($(this).parent().text()),
						group = $(this).parent().data('group'),
						$children = that.$drop.find('[' + that.selectItemName + '][data-group="' + group + '"]'),
						$selected = $children.filter(':checked');

					if ($selected.length === 0) {
						return;
					}

					html.push('[');
					html.push(text);
					if ($children.length > $selected.length) {
						var list = [];
						$selected.each(function () {
							list.push($(this).parent().text());
						});
						html.push(': ' + list.join(', '));
					}
					html.push(']');
					texts.push(html.join(''));
				});
			}
			return type === 'text' ? texts : values;
		},

		setSelects: function (values) {
			var that = this;
			this.$selectItems.prop('checked', false);
			$.each(values, function (i, value) {
				that.$selectItems.filter('[value="' + value + '"]').prop('checked', true);
			});
			this.$selectAll.prop('checked', this.$selectItems.length ===
			this.$selectItems.filter(':checked').length);
			this.update();
		},

		enable: function () {
			this.$choice.removeClass('disabled');
		},

		disable: function () {
			this.$choice.addClass('disabled');
		},

		checkAll: function () {
			this.$selectItems.prop('checked', true);
			this.$selectGroups.prop('checked', true);
			this.$selectAll.prop('checked', true);
			this.update();
			this.options.onCheckAll();
		},

		uncheckAll: function () {
			this.$selectItems.prop('checked', false);
			this.$selectGroups.prop('checked', false);
			this.$selectAll.prop('checked', false);
			this.update();
			this.options.onUncheckAll();
		},

		focus: function () {
			this.$choice.focus();
			this.options.onFocus();
		},

		blur: function () {
			this.$choice.blur();
			this.options.onBlur();
		},

		refresh: function () {
			this.init();
		},

		filter: function () {
			var that = this,
				text = $.trim(this.options.combo ? this.$combo.text() : this.$searchInput.val()).toLowerCase();
			if (text.length === 0) {
				this.$selectItems.parent().show();
				this.$disableItems.parent().show();
				this.$selectGroups.parent().show();
				this.$noResults.hide();
				this.$selectAll.parent().show();
			} else {
				this.$selectItems.each(function () {
					var $parent = $(this).parent();
					$parent[$parent.text().toLowerCase().indexOf(text) < 0 ? 'hide' : 'show']();
				});
				this.$disableItems.parent().hide();
				this.$selectGroups.each(function () {
					var $parent = $(this).parent();
					var group = $parent.attr('data-group'),
					$items = that.$selectItems.filter(':visible');
					$parent[$items.filter('[data-group="' + group + '"]').length === 0 ? 'hide' : 'show']();
				});

				//Check if no matches found
				if (this.$selectItems.filter(':visible').length) {
					this.$selectAll.parent().show();
					this.$noResults.hide();
				} else {
					this.$selectAll.parent().hide();
					this.$noResults.show();
				}
			}
			this.updateOptGroupSelect();
			this.updateSelectAll();
		}
	};

	$.fn.multipleSelect = function () {
		var option = arguments[0],
			args = arguments,

			value,
			allowedMethods = [
				'getSelects', 'setSelects',
				'enable', 'disable',
				'checkAll', 'uncheckAll',
				'focus', 'blur',
				'refresh',
				'open', 'close',
			];

		this.each(function () {
			var $this = $(this),
				data = $this.data('multipleSelect'),
				options = $.extend({}, $.fn.multipleSelect.defaults,
					$this.data(), typeof option === 'object' && option);

			if (!data) {
				data = new MultipleSelect($this, options);
				$this.data('multipleSelect', data);
			}

			if (typeof option === 'string') {
				if ($.inArray(option, allowedMethods) < 0) {
					throw "Unknown method: " + option;
				}
				value = data[option](args[1]);
			} else {
				data.init();
				if (args[1]) {
					value = data[args[1]].apply(data, [].slice.call(args, 2));
				}
			}
		});

		return value ? value : this;
	};

	$.fn.multipleSelect.defaults = {
		name: '',
		isOpen: false,
		placeholder: '',
		selectAll: true,
		selectAllText: 'Select all',
		removeSelectedText: 'Remove selected',
		allSelected: 'All selected',
		selectedPrefix: '',
		minumimCountSelected: 3,
		countSelected: '# of % selected',
		noMatchesFound: 'No matches found',
		multiple: false,
		multipleWidth: 80,
		single: false,
		filter: false,
		width: undefined,
		maxHeight: 250,
		container: null,
		position: 'bottom',
		keepOpen: false,
		blockSeparator: '',
		displayValues: false,
		delimiter: ', ',
		modifiable: false,
		multiline: false,
		combo: '',

		styler: function () {
			return false;
		},
		textTemplate: function ($elm) {
			return $elm.text();
		},

		onOpen: function () {
			return false;
		},
		onClose: function () {
			return false;
		},
		onCheckAll: function () {
			return false;
		},
		onUncheckAll: function () {
			return false;
		},
		onFocus: function () {
			return false;
		},
		onBlur: function () {
			return false;
		},
		onOptgroupClick: function () {
			return false;
		},
		onClick: function () {
			return false;
		},
		onAdd: function ($elm, data) {
			var found = false;
			$elm.children('option').each(function (n, opt) {
				if (opt.value == data.value) {
					found = true;
					return false;
				}
			});
			if (found) {
				return false;
			}
			return data;
		},
		onAdded: function (elms) {

		},
		onRemove: function (index) {
			return true;
		},
		onRemoved: function (elms) {

		}
	};
})(jQuery);
