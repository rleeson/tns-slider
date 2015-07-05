/**
 * Core JS File
 */

var console = console || { log: function( e ) { return; } };
var debug	= debug || { enabled: true, log: function( e ) { if ( this.enabled ) { console.log( e ) } } }; 
var tns 	= tns || {};

tns.slider_infinite = function( $ ) {
	var base_element	= null,
		base_selector	= '',
		element_count	= 0,
		index			= 0,
		max_index		= 0,
		outer_width		= 0,
		slide_percent	= 0,
		slide_width		= 0,
		slider_elements	= null,
		slider_body		= null,
		slides_visible	= 0;
	
	function base_properties( base ) {
		// Check for a valid base element
		if ( typeof base !== 'string' || base === '' ) {
			return false;
		}
		this.base_selector		= base;
		this.base_element		= $( this.base_selector + ' .slide-mask' );
		this.slider_body		= this.base_element.find( '.slider-body' );
		this.slider_elements	= this.slider_body.children( '.slide' ); 
		this.element_count		= this.slider_elements.length;
		
		// Verify there are slides
		if ( this.element_count < 1 ) {
			debug.log( 'No slides found' );
			return false;
		}

		// Setup slider element properties; uses the first slide to establish uniform slide width
		this.index			= 0;
		this.outer_width	= this.slider_body.width();
		this.slide_width	= $( this.slider_elements.get( 0 ) ).width();
		
		// Make sure the slider width is evenly divided into slides, tolerance of one-hundreth of a slide
		var slides_shown	= this.outer_width / this.slide_width
		this.slides_visible	= Math.ceil( slides_shown );
		var width_variance	= this.slides_visible - slides_shown
		debug.log( 'Slide width variance: ' + width_variance );

		if ( width_variance < 0.99 && width_variance > 0.01 ) {
			debug.log( 'Slide alignment is off, partial slide shown in slider.' );
			return false;
		}
		else if ( width_variance < 1 && width_variance > 0.99 ) {
			this.slides_visible--;
		}
		
		this.max_index	= Math.ceil( this.element_count / this.slides_visible );
		
		// Property debug detail
		debug.log( 'Slider width: '			+ this.outer_width );
		debug.log( 'Number of Slides: '		+ this.element_count );
		debug.log( 'Slide width: '			+ this.slide_width );
		debug.log( 'Slides per window: '	+ this.slides_visible );
		debug.log( 'Current slides: '		+ this.index );
		debug.log( 'Max slides: '			+ this.max_index );
		
		return true;
	}
	function slider_controls() {
		this.base_element.children( '.slide-left' ).on( 'click',
			{ slider: this },
			function ( e ) {
				var slider = e.data.slider;
				if ( slider.index > 0 ) {
					slider.index = slider.index - 1;

					var slide_position = slider.index * -100 + '%',
						next = 'translate3d(' + slide_position + ', 0, 0 )';
					slider.base_element.children( '.slider-body' ).css( 'transform', next );
				}
			} 
		);
		this.base_element.children( '.slide-right' ).on( 'click',
			{ slider: this },
			function ( e ) {
				var slider = e.data.slider;
				if ( slider.index < slider.max_index - 1 ) {
					slider.index = slider.index + 1;

					var slide_position = slider.index * -100 + '%',
						next = 'translate3d(' + slide_position + ', 0, 0 )';
					slider.base_element.children( '.slider-body' ).css( 'transform', next );
				}
			} 
		);
	}
	function update_index( index ) {
		var slide_position = this.index * -100 + '%',
			next = 'translate3d(' + slide_position + ', 0, 0 )';
		debug.log( next );
		this.base_element.css( 'transform', next );
	}
	return {
		init: function( base ) {
			var success = base_properties( base );
			
			// Verify slider setup before initializing controls
			if ( success == true ) {
				slider_controls();
			}
			else {
				debug.log( 'Problem initializing slider: ' + base );
			}
		}
	}
}( jQuery );
