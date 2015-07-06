<?php
/**
 * Plugin Name: TNS Slider
 * Plugin URI: https://github.com/rleeson/tns-slider.git
 * Description: WordPress plugin to provide a slider of elements provided by a custom post type
 * Version: 1.0.0
 * Author: Ryan Leeson
 * Author URI: http://ryanleeson.com
 * License: GPLv2
 */

define( 'TNS_SLIDER_DIR', plugin_dir_url( __FILE__ ) );

require_once( __DIR__ . '/classes/tns-slider-core.php' );

global $tns_slider;

$tns_slider = new TNS_Slider();