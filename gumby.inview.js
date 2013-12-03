/**
* Gumby InView
*/
!function($) {

	'use strict';

	if(Gumby.gumbyTouch) {
		return;
	}

	function InViewWatcher($el){
		
		Gumby.debug('Initializing InViewWatcher', $el);
		
		//Store each instance of the element inside its own instance of this closure 
		this.$el = $el;

		var scope = this;

		this.setup();

		// re-initialize module
		this.$el.on('gumby.initialize', function() {
			Gumby.debug('Re-initializing InViewWatcher', scope.$el);
			scope.setup();
		});

	}
	
	InViewWatcher.prototype.setup = function(){
		Gumby.debug('Setting up instance of InViewWatcher', this.$el);

		this.targets = this.parseTargets();

		var classname = Gumby.selectAttr.apply(this.$el, ['classname']) || [];

		if(classname.indexOf("|") > -1){
			classname = classname.split("|");
		}
		
		this.classname =  classname[0] || "active";
		this.classnameBottom = classname[1] || "";
		this.classnameTop = classname[2] || classname[1] || "";

		var offset = Gumby.selectAttr.apply(this.$el, ['offset']);
		if(offset != false){
			offset = offset.split("|");
		}else{
			offset = 0;
		}

		this.offset =  offset[0] || 0;
		this.offsetTop = offset[1] || offset[0];
		this.offsetBottom = this.offset;
	}

	// parse data-for attribute
	InViewWatcher.prototype.parseTargets = function() {
		var targetStr = Gumby.selectAttr.apply(this.$el, ['target']);

		// no targets so return false
		if(!targetStr) {
			return false;
		}

		//are there secondary targets?
		var secondaryTargets = targetStr.split('|');

		// no secondary targets specified so return single target
		if(secondaryTargets.length === 1) {
			return $(secondaryTargets[0]);
		}

		// return all targets
		return $(secondaryTargets.join(", "));
	};

	
	/*
		Utility Method for managing Scrolling
	*/
	var t, k, tmp, tar, ot, oh, offt, offb, wh = $(window).height(), watchers = [];
	//on scroll - loop through elements
	// if the element is on the screen, give it the class
	// if its off, take it's class away
	
	$(window).on('scroll', function(e){

		t = $(this).scrollTop();
		for(k = 0; k < watchers.length; k++){
			tmp = watchers[k];
			tar = tmp.targets || tmp.$el;

			//keep 'hidden' elements from breaking the plugin
			if(tmp.$el.css('display') == 'none'){
				break;
			}

			//element's offset top and height
			ot = tmp.$el.offset().top;
			oh = tmp.$el.height();

			//how much on the screen before we apply the class
			offt = tmp.offsetTop;
			offb = tmp.offsetBottom;

			//if above bottom and below top, you're on the screen

			var below = ot > (t - offb) + wh;

			var above = ot + oh - offt < t;

			
			if(!above && !below){
				if(tar.hasClass(tmp.classnameTop)){
					tar.removeClass(tmp.classnameTop);
				}
				if(tar.hasClass(tmp.classnameBottom)){
					tar.removeClass(tmp.classnameBottom);
				}
				if(!tar.hasClass(tmp.classname)){
					tar.addClass(tmp.classname);
					tar.trigger("gumby.inview");
				}
			}else if(above && !below){
				if(tar.hasClass(tmp.classname)){
					tar.removeClass(tmp.classname);
				}
				if(tar.hasClass(tmp.classnameBottom)){
					tar.removeClass(tmp.classnameBottom);
				}
				if(!tar.hasClass(tmp.classnameTop)){
					tar.addClass(tmp.classnameTop);
					tar.trigger("gumby.offtop");
				}
			}else if(below && !above){
				if(tar.hasClass(tmp.classname)){
					tar.removeClass(tmp.classname);
				}
				if(tar.hasClass(tmp.classnameTop)){
					tar.removeClass(tmp.classnameTop);
				}
				if(!tar.hasClass(tmp.classnameBottom)){
					tar.addClass(tmp.classnameBottom);
					tar.trigger("gumby.offbottom");
				}
			}
		}
	});

	//on resize - update window height reference
	//and trigger scroll
	$(window).on('resize', function(){
		wh = $(this).height();
		$(window).trigger('scroll');
	});


	// add toggle Initialization
	Gumby.addInitalisation('inview', function(all) {
		
		
		$('.inview').each(function() {
			var $this = $(this);

			// this element has already been initialized
			// and we're only initialization new modules
			if($this.data('isInView') && !all) {
				return true;

			// this element has already been initialized
			// and we need to reinitialize it
			} else if($this.data('isInView') && all) {
				$this.trigger('gumby.initialize');
			}

			// mark element as initialized
			$this.data('isInView', true);
			watchers.push(new InViewWatcher($this));
		});
	});


	// register UI module
	Gumby.UIModule({
		module: 'inview',
		events: ['initialize', 'trigger', 'onTrigger'],
		init: function() {
			// Run initialize methods
			Gumby.initialize('inview');
		}
	});
}(jQuery);