function GetSelectedText () {
	var selText = "";
	if (window.getSelection) {  // all browsers, except IE before version 9
		if (document.activeElement && 
				(document.activeElement.tagName.toLowerCase () == "textarea" || 
				 document.activeElement.tagName.toLowerCase () == "input")) 
		{
			var text = document.activeElement.value;
			selText = text.substring (document.activeElement.selectionStart, 
									  document.activeElement.selectionEnd);
		}
		else {
			var selRange = window.getSelection ();
			selText = selRange.toString ();
		}
	}
	else {
		if (document.selection.createRange) {       // Internet Explorer
			var range = document.selection.createRange ();
			selText = range.text;
		}
	}
	if (selText !== "") {
		return selText;
	}
}

function isEventSupported(eventName) {
	var el = document.createElement('div');
	eventName = 'on' + eventName;
	var isSupported = (eventName in el);
	if (!isSupported) {
		el.setAttribute(eventName, 'return;');
		isSupported = typeof el[eventName] == 'function';
	}
	el = null;
	return isSupported;
}
(function( $ ) {

	$.fn.scrollnumber = function( action, param ) {
		function _numberbeautify(val, options){
			var value = parseFloat(val).toFixed(options.decimals);
			if (options.minAlt !== '' && parseFloat(value) == parseFloat(options.min))
			{
				value = options.minAlt;
			}
			else if (options.maxAlt !== '' && parseFloat(value) == parseFloat(options.max))
			{
				value = options.maxAlt;
			}
			else
			{
				value = value.split('.')
				if(value[0].length>=4)
				{
					value[0] = value[0].replace(/(\d)(?=(\d{3})+$)/g, '$1' + options.tseparator);
				}
				value = (value[0].indexOf('-') !== -1 ? '-' : '') + options.prefix + value[0].replace('-', '')+(typeof value[1] !== 'undefined' ? options.dseparator+value[1] : '') + options.suffix;
				//console.log(value);
			}
			return value;
		}
		function _numbervalidate(val, options, increment){
			var value;
			var increment = typeof increment !== 'undefined' ? increment : 0;
			if(options.minAlt !== '' && val === options.minAlt)
			{
				value = parseFloat(options.min) + increment;
			}
			else if (options.maxAlt !== '' && val === options.maxAlt)
			{
				value = parseFloat(options.max) + increment;
			}
			else if(isNaN(parseFloat(val.replace(options.prefix, '').replace(options.suffix, '').replace(new RegExp("[" + options.tseparator + "]", 'g'), '').replace(options.dseparator, '.').replace(/[^\d.-]/g, ''))))
			{
				value = parseFloat(0);
			}
			else
			{
				value = parseFloat(val.replace(options.prefix, '').replace(options.suffix, '').replace(new RegExp("[" + options.tseparator + "]", 'g'), '').replace(options.dseparator, '.').replace(/[^\d.-]/g, '')) + increment;
			}
			if(value<options.min) { value = options.min }
			if(value>options.max) { value = options.max }
			//console.log(value);
			return value.toFixed(options.decimals);
		}
		function _construct(elements, options){			
			if(typeof options === 'undefined')
			{
				var options = $.extend(defaults, options);
			}
			if(options.step < 1/Math.pow(10, options.decimals))
			{
				options.step = 1/Math.pow(10, options.decimals)
			};
			$.each(elements, function(elIndex, element)
			{
				var $element = $(element);

				if ($element.parent('.scrollnumbercontainer').length == 0 && $element.is('input[type="text"]'))
				{
					$element.data('scrollnumber', { instance: true, options: options });
					var $hiddenInput = $('<input class="number" type="hidden"'+
										(typeof $element.attr('name') !== 'undefined' ? ' name="'+$element.attr('name')+'"' : '')+
										(typeof $element.attr('value') !== 'undefined' ? ' value="'+$element.attr('value')+'"' : '')+
										'/>')
										.val(typeof $element.val() !== 'undefined' ? $element.val() : '');//da valutare se validare il val con una nuova funziona numbervalidate_raw, per pulire eventuali "aaax3x.poipoi1.2" che ci si aspetta siano in formato float senza formattazioni e non lo sono
					$element.data('scrollnumber').saved = $hiddenInput.val();
					$element.val(_numberbeautify((isNaN($element.val()) ? 0 : $element.val()), options));
					$element.addClass('scrollnumber').wrap('<div class="scrollnumbercontainer"/>').parent('div').append('<span><span class="up"><i class="fa fa-caret-up"></i></span><span class="down"><i class="fa fa-caret-down"></i></span></span>').prepend($hiddenInput);
					$element.removeAttr('name value');

					var $elementContainer = $element.parent('.scrollnumbercontainer');
					var wheelEvent = isEventSupported('mousewheel') ? 'mousewheel' : 'wheel';
					var resetCoeff = null;
					$elementContainer.bind(wheelEvent,function(e){						
						var $element = $(e.currentTarget).children('.scrollnumber').eq(0);
						var $elementContainer = $(e.currentTarget);
						var $hiddenInput = $(e.currentTarget).children('input[type="hidden"]');
						if ($element.is(':focus') && $elementContainer.is(':hover'))
						{
							e.preventDefault();
							e.delta = null;
							var coeff = parseInt($element.data('speed')) || 1;
							if(typeof $element.data('speed') === 'undefined') { $element.data('speed', coeff) }; 
							if (e.originalEvent) {
								if (e.originalEvent.wheelDelta) e.delta = e.originalEvent.wheelDelta / -40;
								if (e.originalEvent.deltaY) e.delta = e.originalEvent.deltaY;
								if (e.originalEvent.detail) e.delta = e.originalEvent.detail;
							}
							if (e.delta > "0") {
								if(typeof $element.data('direction') !== 'undefined')
								{
									if( $element.data('direction') === 'up' )
									{
										$element.data('speed', 1);
										coeff = $element.data('speed');
										$element.removeData('direction');
									}

								}
								$element.data('direction', 'down');

								$hiddenInput.val(_numbervalidate($element.val(), options, -options.step*coeff));
								$element.val(_numberbeautify($hiddenInput.val(), options));

							}
							else if (e.delta < "0")
							{
								
								if(typeof $element.data('direction') !== 'undefined')
								{
									if( $element.data('direction') === 'down' )
									{
										$element.data('speed', 1);
										coeff = $element.data('speed');
										$element.removeData('direction');
									}

								}
								$element.data('direction', 'up');

								$hiddenInput.val(_numbervalidate($element.val(), options, +options.step*coeff));
								$element.val(_numberbeautify($hiddenInput.val(), options));

							}
							$element.data('speed', ($element.data('speed')*1.02 > 99999999999999999999 ? 99999999999999999999 : $element.data('speed')*1.02));
							clearTimeout(resetCoeff);
							resetCoeff = setTimeout(function(){
								$element.trigger("scrollnumber.change");
								$element.removeData('speed');
								$element.removeData('direction');
							},350);
						}
					});	
					var switchDown = false;
					var switchUp = false;
					$element.on('keydown', function(e){
						$element = $(e.currentTarget);
						var $hiddenInput = $(e.currentTarget).siblings('input[type="hidden"]').eq(0);
						var coeff = parseInt($element.data('speed')) || 1;
						if(typeof $element.data('speed') === 'undefined') { $element.data('speed', coeff) };
						if (e.keyCode === 38 || e.keyCode === 40)
						{
							if (e.keyCode === 40) // ARROW DOWN
							{							
								if(typeof $element.data('direction') !== 'undefined')
								{
									if( $element.data('direction') === 'up' )
									{
										$element.data('speed', 1);
										coeff = $element.data('speed');
										$element.removeData('direction');
									}
								}
								$element.data('direction', 'down');
	
								$hiddenInput.val(_numbervalidate($element.val(), options, -options.step*coeff));
								$element.val(_numberbeautify($hiddenInput.val(), options));								
								if(!switchDown)
								{
									switchDown=true;
									$element.on('keyup.down focusout.down', function(ev){
										if (ev.keyCode === 40 || ev.type === 'focusout')
										{
											$element.trigger("scrollnumber.change");
											$element.off('keyup.down focusout.down');
											switchDown=false;
										}
									})
								}
							}
							else if(e.keyCode === 38) // ARROW UP
							{
								if(typeof $element.data('direction') !== 'undefined')
								{
									if( $element.data('direction') === 'down' )
									{
										$element.data('speed', 1);
										coeff = $element.data('speed');
										$element.removeData('direction');
									}
	
								}
								$element.data('direction', 'up');
	
								$hiddenInput.val(_numbervalidate($element.val(), options, +options.step*coeff));
								$element.val(_numberbeautify($hiddenInput.val(), options));
								if(!switchUp)
								{
									switchUp=true;
									$element.on('keyup.up focusout.up', function(ev){
										if (ev.keyCode === 38 || ev.type === 'focusout')
										{
											$element.trigger("scrollnumber.change");
											$element.off('keyup.up focusout.up');
											switchUp=false;
										}
									})
								}
	
							}
							$element.data('speed', ($element.data('speed')*1.04 > 99999999999999999999 ? 99999999999999999999 : $element.data('speed')*1.04));
							clearTimeout(resetCoeff);
							resetCoeff = setTimeout(function(){
								$element.removeData('speed');
								$element.removeData('direction');
							},350);
						}
						else if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 116]) !== -1 ||
							// Allow: single .
							(e.keyCode == 190 && (!/\./.test($(e.currentTarget).val()) ||  (/\./.test($(e.currentTarget).val()) && /\./.test(GetSelectedText()) ))) ||
							// Allow: single -
							(e.key == '-' && (!/\-/.test($(e.currentTarget).val()) ||  (/\-/.test($(e.currentTarget).val()) && /\-/.test(GetSelectedText()) ))) ||
							// Allow: Ctrl/cmd+A
							(e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
							// Allow: Ctrl/cmd+C
							(e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
							// Allow: Ctrl/cmd+V
							(e.keyCode == 86 && (e.ctrlKey === true || e.metaKey === true)) ||
							// Allow: Ctrl/cmd+X
							(e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
							// Allow: home, end, left, right
							(e.keyCode >= 35 && e.keyCode <= 39)) {
								 // let it happen, don't do anything
								 if (e.keyCode == 13)
								 {
									 $(e.currentTarget).focusout().focus();
								 }
								 return;
						}
						// Ensure that it is a number and stop the keypress
						else if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
							e.preventDefault();
						}
					});
					$element.on('paste', function (e) {
						if(!/^\-?([0-9]+?(\.)?([0-9]+)?$)/.test(e.originalEvent.clipboardData.getData('text')) || (/\./.test(e.originalEvent.clipboardData.getData('text')) && /\./.test($(e.currentTarget).val()) && !/\./.test(GetSelectedText()))  || (/\-/.test(e.originalEvent.clipboardData.getData('text')) && /\-/.test($(e.currentTarget).val()) && !/\-/.test(GetSelectedText())) )
						{
							e.preventDefault();
						}
						$element.trigger("scrollnumber.change");
					});

					$element.on('focusout', function(e){
						var $hiddenInput = $(e.currentTarget).siblings('input[type="hidden"]');
						var preVal = parseFloat($hiddenInput.val());
						$hiddenInput.val(_numbervalidate($(e.currentTarget).val(), options));
						var postVal = parseFloat($hiddenInput.val());
						$(e.currentTarget).val(_numberbeautify($hiddenInput.val(), options));
						if (preVal !== postVal)
						{
							$(e.currentTarget).trigger("scrollnumber.change");
						}
					});
					
					$element.on('dblclick', function(e){
						$(e.currentTarget).select();
					});

					var upButton = $element.siblings('span').eq(0).find('span.up').eq(0);
					var downButton = $element.siblings('span').eq(0).find('span.down').eq(0);
					upButton.on('mousedown', function(e){
						var value;
						var coeff = 1;
						var $hiddenInput = $(e.currentTarget).closest('.scrollnumbercontainer').children('input[type="hidden"]').eq(0);
						var $element = $(e.currentTarget).closest('.scrollnumbercontainer').children('input.scrollnumber').eq(0);
						$hiddenInput.val(_numbervalidate($element.val(), options, +options.step*coeff));
						$element.val(_numberbeautify($hiddenInput.val(), options));
						
						var addTimer = null;
						var addTimeout = setTimeout(function(){
							addTimer = setInterval(function(){
								$hiddenInput.val(_numbervalidate($element.val(), options, +options.step*coeff));
								$element.val(_numberbeautify($hiddenInput.val(), options));

								coeff+=3;
							}, 40 );
						}, 400);
						$(e.currentTarget).on('mouseup mouseout', function(e){
							$element.trigger("scrollnumber.change");
							clearTimeout(addTimeout);
							clearInterval(addTimer);
							$(e.currentTarget).parent('span').siblings('.scrollnumber').focus();
							$(e.currentTarget).off('mouseup mouseout');
						})
					})
					downButton.on('mousedown', function(e){
						var value;
						var coeff = 1;
						var $hiddenInput = $(e.currentTarget).closest('.scrollnumbercontainer').children('input[type="hidden"]').eq(0);
						var $element = $(e.currentTarget).closest('.scrollnumbercontainer').children('input.scrollnumber').eq(0);
						$hiddenInput.val(_numbervalidate($element.val(), options, -options.step*coeff));
						$element.val(_numberbeautify($hiddenInput.val(), options));

						var minusTimer = null;
						var minusTimeout = setTimeout(function(){
							minusTimer = setInterval(function(){
								$hiddenInput.val(_numbervalidate($element.val(), options, -options.step*coeff));
								$element.val(_numberbeautify($hiddenInput.val(), options));

								coeff+=3;
							}, 40 );
						}, 400);
						$(e.currentTarget).on('mouseup mouseout', function(e){
							$element.trigger("scrollnumber.change");
							clearTimeout(minusTimeout);
							clearInterval(minusTimer);
							$(e.currentTarget).parent('span').siblings('.scrollnumber').focus();
							$(e.currentTarget).off('mouseup mouseout');
						})
					})
				}
				return $element;
			});

		}
		function _destroy(elements){
			var $return = $();
			$.each(elements, function(index, element){
				if ( typeof $(element).children('.scrollnumber').eq(0).data('scrollnumber') !== 'undefined' || typeof $(element).data('scrollnumber') !== 'undefined' )
				{
					var $element;
					var $elementContainer;
					if($(element).is('.scrollnumbercontainer'))
					{
						$element = $(element).children('.scrollnumber').eq(0);
						$elementContainer = $(element);
					}
					else if ($(element).is('.scrollnumber'))
					{
						$element = $(element);
						$elementContainer = $(element).parent('.scrollnumbercontainer');
					}
					var $hiddenInput = $element.siblings('input[type="hidden"]').eq(0);
					$element.val($hiddenInput.val()).attr('name', $hiddenInput.attr('name')).attr('value', $hiddenInput.val());
					$hiddenInput.remove();
					$element.siblings('span').remove();
					$element.removeClass('scrollnumber').unwrap();
					$element.removeData('scrollnumber')
					$return = $return.add($element);
					return $element.off('mousedown mouseup mouseout focusout paste keydown');
				}
				else
				{
					$return = $return.add($(element));
				}
			});
			return $return;
		}

		function _setValue(elements, param){
			var $return = $();
			$.each(elements, function(index, element){
				if ( typeof $(element).children('.scrollnumber').eq(0).data('scrollnumber') !== 'undefined' || typeof $(element).data('scrollnumber') !== 'undefined' )
				{
					var $element;
					var $elementContainer;
					if($(element).is('.scrollnumbercontainer'))
					{
						$element = $(element).children('.scrollnumber').eq(0);
						$elementContainer = $(element);
					}
					else if ($(element).is('.scrollnumber'))
					{
						$element = $(element);
						$elementContainer = $(element).parent('.scrollnumbercontainer');
					}
					var options = $element.data('scrollnumber').options;
					var $hiddenInput = $element.siblings('input[type="hidden"]').eq(0);
					if (typeof param !== 'undefined')
					{
						if(parseFloat($element.scrollnumber('value')) !== parseFloat(param))
						{
							$hiddenInput.val(parseFloat(param).toString());
							$element.val(_numberbeautify($hiddenInput.val(), options));
							$element.trigger("scrollnumber.change");
						}
					}
					else
					{
						$return = parseFloat($hiddenInput.val());
						return false;
					}
				}
				$return = $return.add($(element));
			});
			return $return;
		}
		function _getValueFormatted(elements){
			var $return;
			$.each(elements, function(index, element){
				if ( typeof $(element).children('.scrollnumber').eq(0).data('scrollnumber') !== 'undefined' || typeof $(element).data('scrollnumber') !== 'undefined' )
				{
					var $element;
					var $elementContainer;
					if($(element).is('.scrollnumbercontainer'))
					{
						$element = $(element).children('.scrollnumber').eq(0);
						$elementContainer = $(element);
					}
					else if ($(element).is('.scrollnumber'))
					{
						$element = $(element);
						$elementContainer = $(element).parent('.scrollnumbercontainer');
					}
					var options = $element.data('scrollnumber').options;
					var $hiddenInput = $element.siblings('input[type="hidden"]').eq(0);
					$return = _numberbeautify($hiddenInput.val(), options);
					return false;
				}
			});
			return $return;
		}
		function _save(elements){
			var $return = $();
			$.each(elements, function(index, element){
				if ( typeof $(element).children('.scrollnumber').eq(0).data('scrollnumber') !== 'undefined' || typeof $(element).data('scrollnumber') !== 'undefined' )
				{
					var $element;
					var $elementContainer;
					if($(element).is('.scrollnumbercontainer'))
					{
						$element = $(element).children('.scrollnumber').eq(0);
						$elementContainer = $(element);
					}
					else if ($(element).is('.scrollnumber'))
					{
						$element = $(element);
						$elementContainer = $(element).parent('.scrollnumbercontainer');
					}
					var $hiddenInput = $element.siblings('input[type="hidden"]').eq(0);
					$element.data('scrollnumber').saved = $hiddenInput.val();
				}
				$return = $return.add($(element));
			});
			return $return;
		}
		function _reset(elements){
			var $return = $();
			$.each(elements, function(index, element){
				if ( typeof $(element).children('.scrollnumber').eq(0).data('scrollnumber') !== 'undefined' || typeof $(element).data('scrollnumber') !== 'undefined' )
				{
					var $element;
					var $elementContainer;
					if($(element).is('.scrollnumbercontainer'))
					{
						$element = $(element).children('.scrollnumber').eq(0);
						$elementContainer = $(element);
					}
					else if ($(element).is('.scrollnumber'))
					{
						$element = $(element);
						$elementContainer = $(element).parent('.scrollnumbercontainer');
					}
					_setValue($element, $element.data('scrollnumber').saved)
				}
				$return = $return.add($(element));
			});
			return $return;
		}
		var defaults =
		{
			decimals: 0,
			step: 1,
			min: -9999999999999,
			max: 9999999999999,
			dseparator: '.',
			tseparator: '',
			prefix: '',
			suffix: '',
			minAlt: '',
			maxAlt: ''
		};

		if(typeof action === 'undefined') { action = 'construct' }
		if(typeof action === 'object') { var options = action; action = 'options' }
		if (action === 'value')
		{
			return _setValue(this, param)
		}
		if (action === 'valueformatted')
		{
			return _getValueFormatted(this)
		}
		if ( action === 'construct') {
			_construct(this);
		}
		if (action === 'save')
		{
			return _save(this)
		}
		if (action === 'reset')
		{
			return _reset(this)
		}
		if ( action === "destroy" ) {
			return _destroy(this)
		}
		if ( action === "options" ) {
			if (typeof $(this).data('scrollnumber') !== 'undefined' && typeof $(this).data('scrollnumber').options !== 'undefined')
			{
				options = $.extend($(this).data('scrollnumber').options, options);
			}
			if(!!options.step != !!options.decimals)
			{
				if(!options.step)
				{
					options.step = 1/Math.pow(10, options.decimals);
				}
				else
				{
					options.decimals = typeof (options.step.toString()).split('.')[1] !== 'undefined' ? (options.step.toString()).split('.')[1].length : 0;
				}
			}
			if (typeof options.dseparator !== 'undefined' && options.dseparator === options.tseparator)
			{
				options.tseparator = '';
			}
			if (options.dseparator == '')
			{
				options.dseparator = defaults.dseparator;
			}

			var options = $.extend(defaults, options);
			_destroy(this)
			_construct(this, options);
		}
	return this;
	};

}( jQuery ));
