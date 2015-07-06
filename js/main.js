/**
 * Infinite Slider JS Prototype
 */

var console = console || { log: function( e ) { return; } };
var debug	= debug || { enabled: true, log: function( e ) { if ( this.enabled ) { console.log( e ) } } }; 
var tns 	= tns || {};

tns.slider_infinite = function( $, _ ) {
	var base_element	= null,
		base_selector	= '',
		element_count	= false,
		ie_version		= 0,
		index			= 0,
		max_index		= 0,
		outer_width		= 0,
		slide_percent	= 0,
		slide_width		= 0,
		slider_elements	= null,
		slider_body		= null,
		slides_visible	= 0;
	
	/**
	 * Initial base properties of the slider
	 */
	function base_properties( base ) {
		// Check for a valid base element
		if ( typeof base !== 'string' || base === '' ) {
			return false;
		}
		
		this.ie_version	= check_ie();
		if ( this.ie_version && this.ie_version < 9 ) {
			debug.log( 'Incompatible version of IE (less than 9), slider will not load' );
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

		return slider_setup();
	}
	// Check IE version number 
	function check_ie() {
		  var myNav = navigator.userAgent.toLowerCase();
		  return ( myNav.indexOf( 'msie' ) != -1 ) ? parseInt( myNav.split( 'msie' )[ 1 ] ) : false;
		}
	/**
	 * Bind slider left and right controls
	 */
	function slider_controls() {
		this.base_element.children( '.slide-left' ).on( 'click',
			{ slider: this },
			function ( e ) {
				var slider = e.data.slider;
				if ( slider.index > 0 ) {
					slider.index = slider.index - 1;
				}
				else if ( slider.index === 0 ) {
					slider.index = slider.max_index - 1;
				}
				update_index( slider.index );
			} 
		);
		this.base_element.children( '.slide-right' ).on( 'click',
			{ slider: this },
			function ( e ) {
				var slider = e.data.slider;
				if ( slider.index < slider.max_index - 1 ) {
					slider.index = slider.index + 1;
				}
				else if ( slider.index == slider.max_index - 1 ) {
					slider.index = 0;
				}
				update_index( slider.index );
			} 
		);
	}
	/**
	 * Setup slider properties based on slider and individual slide widths
	 * Registers a resize event to handle viewport size changes
	 */
	function slider_setup() {
		// Setup slider element properties; uses the first slide to establish uniform slide width
		this.index			= 0;
		this.outer_width	= this.slider_body.width();
		this.slide_width	= $( this.slider_elements.get( 0 ) ).width();
		
		// Divide the slider width is evenly divided into slides
		var slides_shown	= this.outer_width / this.slide_width
		this.slides_visible	= Math.ceil( slides_shown );
		var width_variance	= this.slides_visible - slides_shown
		debug.log( 'Slide width variance: ' + width_variance );

		// Ensure tolerance with one-hundreth of a slide
		if ( width_variance < 0.99 && width_variance > 0.01 ) {
			debug.log( 'Slide alignment is off, partial slide shown in slider.' );
			return false;
		}
		// In case the width was slightly more, the ceil() would add an extra slide
		else if ( width_variance < 1 && width_variance > 0.99 ) {
			this.slides_visible--;
		}
		
		this.max_index	= Math.ceil( this.element_count / this.slides_visible );
		update_index( 0 );
		
		// Property debug detail
		debug.log( 'Slider width: '			+ this.outer_width );
		debug.log( 'Number of Slides: '		+ this.element_count );
		debug.log( 'Slide width: '			+ this.slide_width );
		debug.log( 'Slides per window: '	+ this.slides_visible );
		debug.log( 'Current slides: '		+ this.index );
		debug.log( 'Max slides: '			+ this.max_index );
		
		// Reset parameters on resizes (delay of 500ms)
		$( window ).resize( _.debounce( function() {
			slider_setup();
		}, 500 ) );
		
		return true;
	}
	/**
	 * Update the slider position based on a supplied index
	 * 
	 * @param number index Number which is multiplied to a negative horizontal percentage position
	 */
	function update_index( index ) {
		var slide_position = 0;
		if ( typeof index === 'number' && index > 0 ) {
			if ( index == this.max_index - 1 ) {
				var remainder = this.element_count % this.slides_visible;
				debug.log( remainder );
				if ( remainder > 0 ) {
					index = index - ( remainder / this.slides_visible );
				}
			}
			slide_position = index * -100 + '%';
		}
		var translation		= 'translate3d( ' + slide_position + ', 0, 0 )',
			ms_translation	= 'translate(' + slide_position + ', 0)';
		debug.log( 'Standard: ' + translation );
		debug.log( 'Microsoft: ' + ms_translation );
		if ( this.ie_version && this.ie_version == 9 ) {
			this.slider_body.css( 'transform', ms_translation );
		}
		else {
			this.slider_body.css( 'transform', translation );
		}
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
}( jQuery, _ );
