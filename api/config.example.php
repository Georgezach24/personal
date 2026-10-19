<?php
/*
 * Contact form settings for PHP hosting.
 *
 * 1. Copy this file to api/config.php (that file is git-ignored, so it never reaches GitHub).
 * 2. Fill in your details.
 * 3. In assets/js/config.js set: contactEndpoint: 'api/contact.php'
 *
 * Note: GitHub Pages cannot run PHP. Use this only on a host with PHP and mail() support.
 */
return [
    // Where messages are delivered.
    'to_email'   => 'giorgoszaxos2003@gmail.com',

    // "From" address. Many hosts require this to be an address on your own domain.
    'from_email' => 'no-reply@example.com',

    // Prefix added to every subject line.
    'subject_prefix' => '[Website]',

    // Sites allowed to post to this script from another domain (CORS).
    // Leave empty if the form and this script are on the same domain.
    'allowed_origins' => [
        // 'https://georgezach24.github.io',
    ],

    // Minimum seconds between two messages from the same visitor.
    'rate_limit_seconds' => 30,
];
