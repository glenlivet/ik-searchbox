(function($){

	$.widget('ik.searchbox',{
		//
		options : {
			prompt : 'Please Input Value',
			candidates : [],
			match : function(c, typed){
				if(typeof c === 'string' && c.indexOf(typed)>-1){
					return true;
				}else {
					return false;
				}
			},
			fetchLabel : function(c){
				return c;
			},
			fetchValue : function(c){
				return c;
			},
			onItemClick : function(v){
				//nothing
			},
			url : null,
			method : 'get',
			params : {},
			realtime : false,
			/**
			 * source : define how searchbox fetch the candidates.
			 * the value can be :
			 * 'custom' : the candidates will be assigned and controlled directly.
			 * 'ajax' : the candidates will be fetched from remote with ajax call.
			 */
			source : 'custom', 
			hintMaxHeight : '150px'
		},

		_loaded : false,

		reset : function(){
			if(this.options.source === 'ajax'){
				this.options.candidates = [];
				this._loaded = false;
			}
		},

		_create : function(){
			//add the specific class to the input element.
			this.element.addClass('ik-searchbox');

			//caculate the width, height and offset of the input element.
			var width = this.element.width();
			var height = this.element.outerHeight(true);
			var offset = this.element.offset();


			//declare and construct the hint box.
			var resultDiv = $('<div />')
				.addClass('ik-searchbox-result')
				.css('width', width);
			
			var ul = $('<ul/>')
				.addClass('ik-searchbox-ul');
			ul.appendTo(resultDiv);

			//insert the hint box after the input element.
			resultDiv.insertAfter(this.element);
			resultDiv.offset({top: offset.top+height, left:offset.left});

			//relate the hint list with this widget
			this._resultUlObj = ul;

			var that = this;
			
			//bind keyup listener to the input element
			this.element.keyup(function(event){

				//when return key
				if(event.which == 13){
					event.preventDefault();

					//clear hint first
					that._closeResult();
				
					//get the value of the input element.
					var typed = that.element.val();

					if(typeof typed === 'undefined' || $.trim(typed) === ''){
						that._closeResult();
					}

					//invoke search method
					var result = that._search(typed);

				}

				//backspace
				if(event.which == 8){
					
					var typed = that.element.val();

					if(typeof typed === 'undefined' || $.trim(typed) === ''){
						that._closeResult();
					}
				}

				//ESC
				if(event.which == 27){
					event.preventDefault();
					that._closeResult();
				}
			});

			//
			this._update();
		},
		
		_search : function(typed){
			switch(this.options.source){
				case 'custom':
					this._match(typed);
					break;
				case 'ajax':
					//define ajax callback
					var cb = function(){
						this._match(typed);
					};
					if(this.options.realtime || !this._loaded){
						this._ajax(cb);
					} else {
						this._match(typed);
					}
					break;
				default:
					break;
			}
			
		},

		_ajax : function(cb){

			var _type = this.options.method.toUpperCase() === 'POST' ? 'POST' : 'GET';

			var settings = {
				type : _type,
				url : this.options.url,
				dataType : 'json'
			};
			if(this.options.params !== null){
				settings.data = params;
			}
			var that  = this;
			$.ajax(settings)
				.done(function(d){
					that.options.data = d;
					that._loaded = true;
					cb.call(that);
				});
		},

		_match : function(typed){
			for(var i in this.options.candidates){
				var c = this.options.candidates[i];
				if(this.options.match(c, typed)){
					this._insertItem(c);
				}
			}
		},

		_insertItem : function(c){
			var label = this.options.fetchLabel(c);
			var a = $('<a />').attr('href', '#').text(label).css('text-decoration', 'none');
			var li = $('<li />').addClass('ik-searchbox-li').append(a);
			this._resultUlObj.append(li);
			//添加click事件
			var that = this;
			li.click(function(){
				that.options.onItemClick(c);
			});
		},

		_closeResult : function(){
			this._resultUlObj.html('');
		},

		_update : function(){
			this.element.attr('placeholder', this.options.prompt);
			this._resultUlObj.parent().css('max-height', this.options.hintMaxHeight);
		}
	});


})(jQuery);