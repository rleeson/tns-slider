/**
 * Infinite Slider JS Prototype
 */

var console = console || { log: function( e ) { return; } };
var debug	= debug || { enabled: true, log: function( e ) { if ( this.enabled ) { console.log( e ) } } }; 
var tns 	= tns || {};

tns.slider_infinite = function( $, _ ) {
	var base_element	= null,
		base_selector	= '',
		container		= null,
		element_count	= false,
		element_first	= null,
		element_last	= null,
		ie_version		= 0,
		index			= 0,
		max_index		= 0,
		outer_width		= 0,
		scrolling		= false,
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
		this.container			= $( this.base_selector );
		this.base_element		= $( this.base_selector + ' .slide-mask' );
		this.slider_body		= this.base_element.find( '.slider-body' );
		this.slider_elements	= this.slider_body.children( '.slide' );
		this.element_count		= this.slider_elements.length;
		this.scrolling			= false;
		
		// Verify there are slides
		if ( this.element_count < 1 ) {
			debug.log( 'No slides found' );
			return false;
		}

		this.element_first	= $( this.slider_elements.get( 0 ) ).clone().addClass( 'slide-temp' );
		this.element_last	= $( this.slider_elements.get( this.element_count - 1 ) ).clone().addClass( 'slide-temp' );
		debug.log( 'First: ' + this.element_first );
		debug.log( 'Last: ' + this.element_last );
		
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
				
				// On first scroll event, setup scrolling
				if ( slider.scrolling === false ) {
					scroll_setup();
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

				// On first scroll event, setup scrolling
				if ( slider.scrolling === false ) {
					scroll_setup();
				}
				update_index( slider.index );
			} 
		);
	}
	function scroll_setup() {
		// Latch scrolling and setup scroll actions
		this.scrolling = true;
		this.container.addClass( 'scrolling' );
		
		// Add edge wrapping elements if there are enough slides
		if ( this.element_count > this.slides_visible + 1 ) {
			if ( this.element_first ) {
				this.slider_body.append( this.element_first );
			}
			if ( this.element_last ) {
				this.slider_body.prepend( this.element_last );
			}
		}

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

		// Ensure tolerance with one-hundreth of a slide
		debug.log( 'Slide width variance: ' + width_variance );
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
		
		// Reset parameters on resizes (delay of 1000ms)
		$( window ).resize( _.debounce( function() {
			slider_setup();
		}, 1000 ) );
		
		return true;
	}
	/**
	 * Update the slider position based on a supplied index
	 * 
	 * @param number index Number which is multiplied to a negative horizontal percentage position
	 */
	function update_index( index ) {
		var slide_position = 0;
		
		// Calculate non-zero index
		if ( typeof index === 'number' && index > 0 ) {
			// Handle last visible pane display
			if ( index == this.max_index - 1 ) {
				// Adjust partial index based on uneven visible slides / total slides ratio
				var remainder = this.element_count % this.slides_visible;
				debug.log( remainder );
				if ( remainder > 0 ) {
					index = index - ( remainder / this.slides_visible );
				}
			}
			if ( this.element_last && ( this.element_count > this.slides_visible + 1 ) ) {
				index = index + ( 1 / this.slides_visible );
			}
			slide_position = index * -100 + '%';
		}
		// Prepend the last element before the slider, if scrolling and it's not a duplicate of an visible slide
		if ( index === 0 && this.container.hasClass( 'scrolling' ) ) {
			if ( this.element_last && ( this.element_count > this.slides_visible + 1 ) ) {
				slide_position = ( 1 / this.slides_visible ) * -100 + '%';
			}
		} 
		
		// Create 2D translation for IE9, 3D translation for all others
		var translation		= 'translate3d( ' + slide_position + ', 0, 0 )',
			ms_translation	= 'translate(' + slide_position + ', 0)';
		if ( this.ie_version && this.ie_version == 9 ) {
			debug.log( 'Microsoft: ' + ms_translation );
			this.slider_body.css( 'transform', ms_translation );
		}
		else {
			debug.log( 'Standard: ' + translation );
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
