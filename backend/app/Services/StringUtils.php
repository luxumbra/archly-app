<?php

namespace App\Services;

class StringUtils
{
    /**
     * Convert space-separated words to underscore-separated words.
     *
     * @param string $str
     * @return string
     */
    public static function convertToUnderscore($str)
    {
        return preg_replace('/\s+/', '_', trim($str));
    }
}
