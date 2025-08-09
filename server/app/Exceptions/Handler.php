<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Throwable;
use Illuminate\Http\JsonResponse;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Handle API exceptions
        $this->renderable(function (Throwable $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return $this->handleApiException($e, $request);
            }
        });
    }

    /**
     * Handle API exceptions and return consistent JSON responses.
     */
    private function handleApiException(Throwable $e, $request): JsonResponse
    {
        $statusCode = 500;
        $message = 'Internal Server Error';
        $errors = null;

        if ($e instanceof ValidationException) {
            $statusCode = 422;
            $message = 'Validation failed';
            $errors = $e->errors();
        } elseif ($e instanceof AuthenticationException) {
            $statusCode = 401;
            $message = 'Unauthenticated';
        } elseif ($e instanceof AuthorizationException) {
            $statusCode = 403;
            $message = 'Unauthorized';
        } elseif ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            $statusCode = 404;
            $message = 'Resource not found';
        } elseif ($e instanceof MethodNotAllowedHttpException) {
            $statusCode = 405;
            $message = 'Method not allowed';
        } elseif ($e instanceof \Exception && method_exists($e, 'getStatusCode')) {
            $statusCode = $e->getStatusCode();
            $message = $e->getMessage();
        }

        // Log the error for debugging (but don't expose sensitive info to client)
        if ($statusCode >= 500) {
            \Log::error('API Error: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request' => $request->url(),
                'method' => $request->method(),
            ]);
        }

        $response = [
            'message' => $message,
            'status_code' => $statusCode,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        // Only include debug info in development
        if (config('app.debug') && $statusCode >= 500) {
            $response['debug'] = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
        }

        return response()->json($response, $statusCode);
    }
}
