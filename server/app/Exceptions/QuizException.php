<?php

namespace App\Exceptions;

use Exception;

class QuizException extends Exception
{
    protected $statusCode;
    protected $errorCode;

    public function __construct(string $message = '', int $statusCode = 400, string $errorCode = 'QUIZ_ERROR')
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
        $this->errorCode = $errorCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function render($request)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => $this->getMessage(),
                'error_code' => $this->getErrorCode(),
                'status_code' => $this->getStatusCode(),
            ], $this->getStatusCode());
        }

        return parent::render($request);
    }
}
