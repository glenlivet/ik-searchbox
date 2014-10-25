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
			/**
			 * Define the reaction of the input element on item clicked.
			 * `none` : do nothing.
			 * `label` : display the label of item.
			 * `reset` : clear the input value.
			 */
			reaction : 'label',
			url : null,
			method : 'get',
			params : {},
			realtime : false,
			hintMaxHeight : '150px'
		},
		/**
			 * source : define how searchbox fetch the candidates.
			 * the value can be :
			 * 'custom' : the candidates will be assigned and controlled directly.
			 * 'ajax' : the candidates will be fetched from remote with ajax call.
			 */
		_source : 'custom',

		_loaded : false,

		reset : function(){
			if(this._source === 'ajax'){
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
			var hintDiv = $('<div />')
				.addClass('ik-searchbox-hint')
				.css('width', width);
			
			var ul = $('<ul/>')
				.addClass('ik-searchbox-ul');
			ul.appendTo(hintDiv);

			//insert the hint box after the input element.
			hintDiv.insertAfter(this.element);
			hintDiv.offset({top: offset.top+height, left:offset.left});

			//relate the hint list with this widget
			this._hintUlObj = ul;

			var that = this;
			
			//bind keyup listener to the input element
			this.element.keyup(function(event){

				//when return key
				if(event.which == 13){
					event.preventDefault();

					//clear hint first
					that._closeHint();
				
					//get the value of the input element.
					var typed = that.element.val();

					if(typeof typed === 'undefined' || $.trim(typed) === ''){
						that._closeHint();
					}

					//invoke search method
					var hint = that._search(typed);

				}

				//backspace
				if(event.which == 8){
					
					var typed = that.element.val();

					if(typeof typed === 'undefined' || $.trim(typed) === ''){
						that._closeHint();
					}
				}

				//ESC
				if(event.which == 27){
					event.preventDefault();
					that.element.val('');
					that._closeHint();
				}
			});

			//
			this._update();
		},
		
		_search : function(typed){
			switch(this._source){
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

			var _type = '';
			switch(this.options.method.toUpperCase()){
				case 'GET' : 
					_type = 'GET';
					break;
				case 'POST' : 
					_type = 'POST';
					break;
				case 'PUT' : 
					_type = 'PUT';
					break;
				case 'DELETE' : 
					_type = 'DELETE';
					break;
				case 'HEAD' : 
					_type = 'HEAD';
					break;
				default : 
					_type = 'GET';
					break;
			}

			var settings = {
				type : _type,
				url : this.options.url,
				dataType : 'json'
			};
			if(this.options.params !== null){
				settings.data = this.options.params;
			}
			var that  = this;
			$.ajax(settings)
				.done(function(d){
					that.options.candidates = d;
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
			this._hintUlObj.append(li);
			//添加click事件
			var that = this;
			li.click(function(){
				that._closeHint();
				that._handleReaction(c);
				that.options.onItemClick(c);
			});
		},

		_handleReaction : function(c){
			switch(this.options.reaction){
				case 'reset':
					this.element.val('');
					break;
				case 'label':
					this.element.val(this.options.fetchLabel(c));
					break;
				case 'none':
					break;
				default:
					break;
			}
		},

		_closeHint : function(){
			this._hintUlObj.html('');
		},

		_update : function(){
			this.element.attr('placeholder', this.options.prompt);
			this._hintUlObj.parent().css('max-height', this.options.hintMaxHeight);
		}
	});

})(jQuery);