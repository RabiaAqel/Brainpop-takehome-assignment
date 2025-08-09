<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InputSanitization
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Sanitize all input data
        $this->sanitizeInput($request);

        return $next($request);
    }

    /**
     * Sanitize input data to prevent XSS and other injection attacks.
     *
     * @param Request $request
     * @return void
     */
    private function sanitizeInput(Request $request): void
    {
        $input = $request->all();

        // Recursively sanitize all input values
        $sanitized = $this->recursiveSanitize($input);

        // Replace the request input with sanitized values
        $request->replace($sanitized);
    }

    /**
     * Recursively sanitize input values.
     *
     * @param mixed $data
     * @return mixed
     */
    private function recursiveSanitize($data)
    {
        if (is_array($data)) {
            return array_map([$this, 'recursiveSanitize'], $data);
        }

        if (is_string($data)) {
            return $this->sanitizeString($data);
        }

        return $data;
    }

    /**
     * Sanitize a single string value.
     *
     * @param string $value
     * @return string
     */
    private function sanitizeString(string $value): string
    {
        // Remove HTML tags
        $value = strip_tags($value);
        
        // Convert special characters to HTML entities
        $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        
        // Remove null bytes
        $value = str_replace(chr(0), '', $value);
        
        // Remove control characters
        $value = preg_replace('/[\x00-\x1F\x7F]/', '', $value);
        
        // Trim whitespace
        $value = trim($value);
        
        return $value;
    }
}
