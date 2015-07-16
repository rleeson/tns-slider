/**
 * Infinite Slider JS Prototype
 */

var console = console || { log: function( e ) { return; } };
var debug	= debug || { enabled: true, log: function( e ) { if ( this.enabled ) { console.log( e ) } } }; 

(function ( $ ) {
	$.fn.infiniteSlider = function( base ) {
		/**
		 * Find the IE version number
		 */
		function check_ie() {
		  var myNav = navigator.userAgent.toLowerCase();
		  return ( myNav.indexOf( 'msie' ) != -1 ) ? parseInt( myNav.split( 'msie' )[ 1 ] ) : false;
		}
		/**
		 * Initial base properties of the slider
		 */
		function base_properties( base, settings ) {
			// Check for existence of a base element
			if ( typeof base !== 'object' || base === null ) {
				return false;
			}
			
			settings.ie_version	= check_ie();
			if ( settings.ie_version && settings.ie_version < 9 ) {
				debug.log( 'Incompatible version of IE (less than 9), slider will not load' );
				return false;
			}
	
			settings.container			= $( base );
			settings.base_element		= settings.container.find( '.slide-mask' );
			settings.slider_body		= settings.base_element.find( '.slider-body' );
			settings.slider_elements	= settings.slider_body.children( '.slide' );
			settings.element_count		= settings.slider_elements.length;
			settings.scrolling			= false;
			
			// Verify there are slides
			if ( settings.element_count < 1 ) {
				debug.log( 'No slides found' );
				return false;
			}
	
			settings.element_first	= $( settings.slider_elements.get( 0 ) ).clone().addClass( 'slide-temp' );
			settings.element_last	= $( settings.slider_elements.get( settings.element_count - 1 ) ).clone().addClass( 'slide-temp' );
			debug.log( 'First: ' + settings.element_first );
			debug.log( 'Last: ' + settings.element_last );
			
			return slider_setup( settings );
		}
		/**
		 * Setup slider properties based on slider and individual slide widths
		 * Registers a resize event to handle viewport size changes
		 */
		function slider_setup( settings ) {
			// Setup slider element properties; uses the first slide to establish uniform slide width
			settings.index			= 0;
			settings.outer_width	= settings.slider_body.width();
			settings.slide_width	= $( settings.slider_elements.get( 0 ) ).width();
			
			// Divide the slider width is evenly divided into slides
			var slides_shown	= settings.outer_width / settings.slide_width
			settings.slides_visible	= Math.ceil( slides_shown );
			var width_variance	= settings.slides_visible - slides_shown
	
			// Ensure tolerance with one-hundreth of a slide
			debug.log( 'Slide width variance: ' + width_variance );
			if ( width_variance < 0.99 && width_variance > 0.01 ) {
				debug.log( 'Slide alignment is off, partial slide shown in slider.' );
				return false;
			}
			// In case the width was slightly more, the ceil() would add an extra slide
			else if ( width_variance < 1 && width_variance > 0.99 ) {
				settings.slides_visible--;
			}
			
			settings.max_index	= Math.ceil( settings.element_count / settings.slides_visible );
			update_index( settings );
			
			// Property debug detail
			debug.log( 'Slider width: '			+ settings.outer_width );
			debug.log( 'Number of Slides: '		+ settings.element_count );
			debug.log( 'Slide width: '			+ settings.slide_width );
			debug.log( 'Slides per window: '	+ settings.slides_visible );
			debug.log( 'Current slides: '		+ settings.index );
			debug.log( 'Max slides: '			+ settings.max_index );
			
			// Reset parameters on resizes (delay of 1000ms)
			$( window ).resize( _.debounce( function() {
				return slider_setup( settings );
			}, 1000 ) );
			
			return settings;
		}
		/**
		 * Update the slider position based on a supplied index
		 * 
		 * @param number index Number which is multiplied to a negative horizontal percentage position
		 */
		function update_index( settings ) {
			var slide_position = 0;
			
			// Calculate non-zero index
			if ( typeof settings.index === 'number' && settings.index > 0 ) {
				// Handle last visible pane display
				if ( settings.index == settings.max_index - 1 ) {
					// Adjust partial index based on uneven visible slides / total slides ratio
					var remainder = settings.element_count % settings.slides_visible;
					debug.log( remainder );
					if ( remainder > 0 ) {
						settings.index = settings.index - ( remainder / settings.slides_visible );
					}
				}
				if ( settings.element_last && ( settings.element_count > settings.slides_visible + 1 ) ) {
					settings.index = settings.index + ( 1 / settings.slides_visible );
				}
				slide_position = settings.index * -100 + '%';
			}
			// Prepend the last element before the slider, if scrolling and it's not a duplicate of an visible slide
			if ( settings.index === 0 && settings.container.hasClass( 'scrolling' ) ) {
				if ( settings.element_last && ( settings.element_count > settings.slides_visible + 1 ) ) {
					slide_position = ( 1 / settings.slides_visible ) * -100 + '%';
				}
			} 
			
			// Create 2D translation for IE9, 3D translation for all others
			var translation		= 'translate3d( ' + slide_position + ', 0, 0 )',
				ms_translation	= 'translate(' + slide_position + ', 0)';
			if ( settings.ie_version && settings.ie_version == 9 ) {
				debug.log( 'Microsoft: ' + ms_translation );
				settings.slider_body.css( 'transform', ms_translation );
			}
			else {
				debug.log( 'Standard: ' + translation );
				debug.log( settings );
				debug.log( settings.slider_body );
				settings.slider_body.css( 'transform', translation );
			}
		}
		/**
		 * Bind slider left and right controls
		 */
		function slider_controls( instance, settings ) {
			settings.base_element.children( '.slide-left' ).on( 'click',
				{ slider: settings },
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
						scroll_setup( slider );
					}
					update_index( slider );
				} 
			);
			settings.base_element.children( '.slide-right' ).on( 'click',
				{ slider: settings },
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
						scroll_setup( slider );
					}
					update_index( slider );
				} 
			);
		}
		function scroll_setup( settings ) {
			// Latch scrolling and setup scroll actions
			settings.scrolling = true;
			settings.container.addClass( 'scrolling' );
			
			// Add edge wrapping elements if there are enough slides
			if ( settings.element_count > settings.slides_visible + 1 ) {
				if ( settings.element_first ) {
					settings.slider_body.append( settings.element_first );
				}
				if ( settings.element_last ) {
					settings.slider_body.prepend( settings.element_last );
				}
			}
	
		}
		return this.each( function( options ) {
			var defaults = {
					base_element	: null,
					container		: null,
					element_count	: false,
					element_first	: null,
					element_last	: null,
					ie_version		: 0,
					index			: 0,
					max_index		: 0,
					outer_width		: 0,
					scrolling		: false,
					slide_percent	: 0,
					slide_width		: 0,
					slider_elements	: null,
					slider_body		: null,
					slides_visible	: 0
				},
				settings = $.extend( {}, defaults, options );
			
			// Verify slider setup before initializing controls
			settings = base_properties( this, settings );
			if ( settings === false ) {
				debug.log( 'Problem initializing slider: ' + this );
				return;
			}
			slider_controls( this, settings );
		} );
	};
})( jQuery );
