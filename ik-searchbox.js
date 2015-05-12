(function($){

	$.widget('ik.searchbox',{
		//
		options : {
			prompt : 'Please Input Value',
			/**
			 * value must be selected
			 */
			mustSelect : true,
			delay : 700,
			fetchLabel : function(c){
				return c;
			},
			fetchValue : function(c){
				return c;
			},
			onItemClick : function(v){
				//nothing
			},
			buildTds : function(c){
				var td = $('<td />').text(c);
				return [td];
			},
			/**
			 * Define the reaction of the input element on item clicked.
			 * `none` : do nothing.
			 * `label` : display the label of item.
			 * `reset` : clear the input value.
			 */
			reaction : 'label',
			params : {},
			hintMaxHeight : '180px',
			dropBtn : false,
			/**
			 * check whether this element is edited.
			 */
			_edited : false,
			/**
			 * customise search method.
			 */
			searchMethod : null,
			onNoSelectBlur : function(){
				//nothing
			}
		},
		_searchTimeout : null,
		//terminate search action
		_termSearch : function(){
			clearTimeout(this._searchTimeout);
		},

		_activeDropdown : function(){
			if(this.options.dropBtn){
				this._dropBtnObj.addClass('ik-opacity8');
				this._dropBtnObj.removeClass('ik-opacity3');
			}
		},

		_deactiveDropdown: function(){
			if(this.options.dropBtn){
				this._dropBtnObj.addClass('ik-opacity3');
				this._dropBtnObj.removeClass('ik-opacity8');
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
			this._activeDropdown();
		},

		_create : function(){
			//add the specific class to the input element.
			this.element.addClass('ik-searchbox');

			//enable drop button
			if(this.options.dropBtn){
				this._createDropButton();
			}
			//declare and construct the hint box.
			var hintDiv = $('<div />')
				.addClass('ik-searchbox-hint');

			var tbl = $('<table />')
				.addClass('ik-searchbox-table');
			if(this.options.hintWidth){
				tbl.css('width', this.options.hintWidth);
			}
			tbl.appendTo(hintDiv);

			//insert the hint box after the input element.
			hintDiv.insertAfter(this.element);

			this._hintTblObj = tbl;

			var that = this;
			
			//bind keyup listener to the input element
			this.element.keyup(function(event){
				//some keys do not handled
				switch(event.which){
					//caps lock shift ctrl alt
					case 20: case 16: case 17: case 18:
					case 113: case 114: case 115: case 116:
					case 117: case 118: case 119: case 120:
					case 121: case 122: case 123:
						return;
				}

				//terminate search action
				that._termSearch();
				//clear hint first
				that._closeHint();
				that._edited = true;
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
				if(that.options.mustSelect && that._edited){
					that.element.val('');
					that.options.onNoSelectBlur();
				}
				setTimeout(that._closeHint.bind(that), 250);
			});
			//
			this._update();
		},

		_createDropButton : function(){
			var dropDownTag = $('<span />').html('&#x25bc;')
							.addClass('ik-searchbox-db')
							.addClass('ik-searchbox-dropbutton')
							.addClass('ik-opacity3');
			dropDownTag.insertAfter(this.element);
			var fontsize = this.element.css('font-size');
			var _width = dropDownTag.outerWidth();
			var inputEle = this;
			dropDownTag.click(function(){

				if(!inputEle._hintTblObj.html().trim()){
					var typed = inputEle.element.val();
					inputEle._search(typed);
				}else {
					inputEle._closeHint();
				}
			});
			this._dropBtnObj = dropDownTag;
		},
		
		_search : function(typed){

			if(this.options.searchMethod){
				//has customized search method
				this.options.searchMethod.call(this, typed);
				return;
			}else {
				throw new Error('ik-searchbox: searchMethod is not defined in options!');
			}
			
		},

		_insertItem : function(c){
			
			var tds = this.options.buildTds(c);
			var tr = $('<tr />').addClass('ik-searchbox-tr');
			for(var i in tds){
				tr.append(tds[i]);
			}

			this._hintTblObj.append(tr);
			//添加click事件
			var that = this;
			tr.click(function(){
				that._closeHint();
				that._handleReaction(c);
				that._edited = false;
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
			this._hintTblObj.html('');
			this._deactiveDropdown();
		},

		_update : function(){
			this.element.attr('placeholder', this.options.prompt);
			this._hintTblObj.parent().css('max-height', this.options.hintMaxHeight);
		}
	});

})(jQuery);