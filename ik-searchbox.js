(function($){

	$.widget('ik.searchbox',{
		//
		options : {
			prompt : 'Please Input Value',
			candidates : [],
			/**
			 * value must be selected
			 */
			mustSelect : true,
			delay : 200,
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
			hintMaxHeight : '180px',
			/**
			 * customise search method.
			 */
			searchMethod : null,
			onNoSelectBlur : function(){
				//nothing
			}
		},
		/**
			 * source : define how searchbox fetch the candidates.
			 * the value can be :
			 * 'custom' : the candidates will be assigned and controlled directly.
			 * 'ajax' : the candidates will be fetched from remote with ajax call.
			 */
		_source : 'custom',

		/**
		 * if _source == 'ajax', and realtime == false, 
		 * _loaded is indicating whether data is loaded from remote.
		 */
		_loaded : false,

		_searchTimeout : null,
		//terminate search action
		_termSearch : function(){
			clearTimeout(this._searchTimeout);
		},

		reset : function(){
			if(this._source === 'ajax'){
				this.options.candidates = [];
				this._loaded = false;
			}
		},

		/**
		 * used in combination with customized search method
		 * to display the hint data.
		 * @param d should be a list of data.
		 */
		displayHint : function(d){
			this._closeHint();
			for(var i in d){
				this._insertItem(d[i]);
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

				//terminate search action
				that._termSearch();
				//clear hint first
				that._closeHint();
				var typed = that.element.val();
				//do nothing if its none.
				if(typeof typed === 'undefined' || $.trim(typed) === ''){
					return;
				}
				switch(event.which){
					//ESC
					case 27:
						event.preventDefault();
						that.element.val('');
						break;
					//enter
					case 13:
						event.preventDefault();
					default:
						that._searchTimeout = setTimeout(that._search.bind(that, typed), that.options.delay);
						break;
				}

			});

			this.element.blur(function(){
				if(that.options.mustSelect){
					that.element.val('');
					that.options.onNoSelectBlur();
				}
				setTimeout(that._closeHint.bind(that), 250);
			});

			//set _source
			this._source = (this.options.url === null) ? 'custom' : 'ajax';
			//
			this._update();
		},
		
		_search : function(typed){

			if(this.options.searchMethod){
				//has customized search method
				this.options.searchMethod.call(this, typed);
				return;
			}

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
			this._closeHint();
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