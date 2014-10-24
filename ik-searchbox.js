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
			hintMaxHeight : '150px'
		},

		_create : function(){
			//添加样式
			this.element.addClass('ik-searchbox');

			//计算width
			var width = this.element.width();
			var height = this.element.outerHeight(true);
			var offset = this.element.offset();


			//添加一个搜索结果提示DIV
			var resultDiv = $('<div />')
				.addClass('ik-searchbox-result')
				.css('width', width);
			//在搜索结果提示DIV中添加一个ul
			var ul = $('<ul/>')
				.addClass('ik-searchbox-ul');
			ul.appendTo(resultDiv);
			//resultDiv.appendTo(this.element);
			resultDiv.insertAfter(this.element);
			resultDiv.offset({top: offset.top+height, left:offset.left});

			this._resultUlObj = ul;

			var that = this;
			//给INPUT添加一个按键事件
			this.element.keyup(function(event){
				//回车
				if(event.which == 13){
					event.preventDefault();
					//清空列表
					that._closeResult();
				
					//获取INPUT的VAL
					var typed = that.element.val();

					if(typeof typed === 'undefined' || $.trim(typed) === ''){
						that._closeResult();
					}
					//调用search方法
					var result = that._search(typed);

				}
				//backspace
				if(event.which == 8){
					//获取INPUT的VAL
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
		//进行搜索
		_search : function(typed){
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