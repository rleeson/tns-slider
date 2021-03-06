<?php
/**
 * Class to register Sliders
*
* @since 1.0.0
* @version 1.0.0
* @package TNS Slider
* @author Ryan Leeson
* @license GPL v2
*/

class TNS_Slider {
	public function __construct( ) {
		add_action( 'wp_enqueue_scripts', array( $this, 'script_load' ) );
	}
	
	public function script_load() {
		wp_enqueue_style( 'tns-slider-main', TNS_SLIDER_DIR . '/css/main.css' );
		wp_enqueue_script( 'tns-slider-main-js', TNS_SLIDER_DIR . '/js/main.js', array( 'jquery', 'underscore' ), '1.0.0', true );
	}
}
