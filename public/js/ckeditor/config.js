/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    // config.skin = 'moono-dark';
    // config.autoParagraph = false;
    // config.fillEmptyBlocks = false;
    // config.enterMode = CKEDITOR.ENTER_BR;
    // config.forceEnterMode = true;

    config.filebrowserUploadUrl = '/uploader';
    config.extraPlugins = 'autogrow';
    config.toolbar_Basic =
        [
            ['Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink', '-'],
            {
                name: 'insert',
                items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe']
            },
        ];
};
